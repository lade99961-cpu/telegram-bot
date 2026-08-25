const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const config = require('../config/config.loader');
const lang = require('../lang/lang.loader');

class BotManager {
    constructor() {
        this.bots = new Map();
        this.guildId = config.get('guildId');
    }

    async startBot(botConfig) {
        try {
            if (this.bots.has(botConfig.id)) {
                console.log(`⚠️ البوت ${botConfig.name} يعمل بالفعل`);
                return { success: true, message: 'Bot already running' };
            }

            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMessages
                ]
            });

            await client.login(botConfig.token);

            client.once('ready', async () => {
                console.log(`✅ ${botConfig.name} متصل: ${client.user.tag}`);

                this.updateBotPresence(botConfig.id, {
                    status: botConfig.status,
                    activityType: botConfig.activityType,
                    activityText: botConfig.activityText
                });

                if (botConfig.voiceChannelId) {
                    await this.joinVoiceChannel(botConfig.id, botConfig.voiceChannelId);
                }
            });

            this.bots.set(botConfig.id, {
                client,
                config: botConfig,
                connection: null
            });

            return { success: true, message: `Bot ${botConfig.name} started` };

        } catch (error) {
            console.error(`❌ خطأ في تشغيل ${botConfig.name}:`, error.message);
            return { success: false, message: error.message };
        }
    }

    async stopBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            return { success: false, message: 'Bot not found' };
        }

        try {
            if (bot.connection) {
                bot.connection.destroy();
            }

            await bot.client.destroy();
            this.bots.delete(botId);

            console.log(`⏹️ تم إيقاف البوت: ${bot.config.name}`);
            return { success: true, message: `Bot ${bot.config.name} stopped` };

        } catch (error) {
            console.error(`❌ خطأ في إيقاف البوت:`, error.message);
            return { success: false, message: error.message };
        }
    }

    async joinVoiceChannel(botId, channelId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            return { success: false, message: 'Bot not found' };
        }

        try {
            const guild = bot.client.guilds.cache.get(this.guildId);
            const channel = guild?.channels.cache.get(channelId);

            if (!channel || channel.type !== 2) { // 2 = GUILD_VOICE
                return { success: false, message: 'Invalid voice channel' };
            }

            const existingConnection = getVoiceConnection(this.guildId);
            if (existingConnection) {
                existingConnection.destroy();
            }

            const connection = joinVoiceChannel({
                channelId: channelId,
                guildId: this.guildId,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: true
            });

            bot.connection = connection;
            config.updateBot(botId, { voiceChannelId: channelId });

            console.log(`🔊 ${bot.config.name} انضم إلى القناة الصوتية`);
            return { success: true, message: 'Joined voice channel' };

        } catch (error) {
            console.error(`❌ خطأ في الانضمام للقناة:`, error.message);
            return { success: false, message: error.message };
        }
    }

    async leaveVoiceChannel(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            return { success: false, message: 'Bot not found' };
        }

        try {
            if (bot.connection) {
                bot.connection.destroy();
                bot.connection = null;
                config.updateBot(botId, { voiceChannelId: '' });
                console.log(`👋 ${bot.config.name} غادر القناة الصوتية`);
                return { success: true, message: 'Left voice channel' };
            }

            return { success: false, message: 'Not in voice channel' };

        } catch (error) {
            console.error(`❌ خطأ في مغادرة القناة:`, error.message);
            return { success: false, message: error.message };
        }
    }

    updateBotPresence(botId, { status, activityType, activityText }) {
        const bot = this.bots.get(botId);
        if (!bot) return { success: false, message: 'Bot not found' };

        try {
            const activityTypeMap = {
                'playing': ActivityType.Playing,
                'listening': ActivityType.Listening,
                'watching': ActivityType.Watching,
                'streaming': ActivityType.Streaming,
                'competing': ActivityType.Competing
            };

            bot.client.user.setPresence({
                status: status,
                activities: [{
                    name: activityText,
                    type: activityTypeMap[activityType] || ActivityType.Playing
                }]
            });

            config.updateBot(botId, { status, activityType, activityText });
            console.log(`✅ تم تحديث حالة ${bot.config.name}`);
            return { success: true, message: 'Presence updated' };

        } catch (error) {
            console.error(`❌ خطأ في تحديث الحالة:`, error.message);
            return { success: false, message: error.message };
        }
    }

    async startAllBots() {
        const results = [];
        const bots = config.getAllBots();

        for (const botConfig of bots) {
            if (botConfig.enabled) {
                const result = await this.startBot(botConfig);
                results.push({ name: botConfig.name, ...result });
                // انتظار قصير بين كل بوت لتجنب rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }

    async stopAllBots() {
        const results = [];
        
        for (const [botId, bot] of this.bots) {
            const result = await this.stopBot(botId);
            results.push({ name: bot.config.name, ...result });
        }

        return results;
    }

    getBotStatus(botId) {
        const bot = this.bots.get(botId);
        if (!bot) return { online: false };

        return {
            online: true,
            name: bot.config.name,
            status: bot.config.status,
            activity: `${bot.config.activityType}: ${bot.config.activityText}`,
            inVoice: bot.connection !== null,
            channelId: bot.config.voiceChannelId
        };
    }

    getAllBotsStatus() {
        const allBots = config.getAllBots();
        return allBots.map(botConfig => ({
            id: botConfig.id,
            name: botConfig.name,
            ...this.getBotStatus(botConfig.id)
        }));
    }

    isOnline(botId) {
        return this.bots.has(botId);
    }
}

module.exports = new BotManager();
