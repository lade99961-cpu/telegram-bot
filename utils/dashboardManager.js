const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config/config.loader');
const lang = require('../lang/lang.loader');
const botManager = require('./botManager');

class DashboardManager {
    constructor() {
        this.dashboardMessage = null;
        this.updateInterval = null;
    }

    createDashboardEmbed() {
        const botsStatus = botManager.getAllBotsStatus();
        const activeBots = botsStatus.filter(b => b.online).length;
        const totalBots = botsStatus.length;

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle(lang.get('dashboard.title'))
            .setDescription(`━━━━━━━━━━━━━━━━━━━━━`)
            .addFields(
                {
                    name: `📊 ${lang.get('dashboard.total_bots')}`,
                    value: `\`${totalBots}\``,
                    inline: true
                },
                {
                    name: `✅ ${lang.get('dashboard.active_bots')}`,
                    value: `\`${activeBots}\``,
                    inline: true
                },
                {
                    name: `❌ ${lang.get('dashboard.inactive_bots')}`,
                    value: `\`${totalBots - activeBots}\``,
                    inline: true
                }
            )
            .setFooter({ 
                text: `${lang.get('dashboard.last_update')}: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}`
            })
            .setTimestamp();

        let botsInfo = '';
        botsStatus.forEach(bot => {
            const statusIcon = bot.online ? '🟢' : '🔴';
            const voiceStatus = bot.inVoice ? `🔊 <#${bot.channelId}>` : '🔇';
            botsInfo += `${statusIcon} **${bot.name}** - ${voiceStatus}\n`;
        });

        if (botsInfo) {
            embed.addFields({
                name: '🤖 حالة البوتات',
                value: botsInfo || 'لا توجد بوتات',
                inline: false
            });
        }

        return embed;
    }

    createDashboardButtons() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_dashboard')
                    .setLabel(lang.get('dashboard.button_refresh'))
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('start_all_bots')
                    .setLabel(lang.get('dashboard.button_start_all'))
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('stop_all_bots')
                    .setLabel(lang.get('dashboard.button_stop_all'))
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );

        return [row1];
    }

    createBotSelectMenu() {
        const bots = config.getAllBots();
        
        const options = bots.map(bot => ({
            label: bot.name,
            value: bot.id,
            description: `${bot.activityType}: ${bot.activityText}`,
            emoji: botManager.isOnline(bot.id) ? '🟢' : '🔴'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_bot')
            .setPlaceholder(lang.get('bot_menu.placeholder'))
            .addOptions(options);

        return new ActionRowBuilder().addComponents(selectMenu);
    }

    createBotControlButtons(botId) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`change_channel_${botId}`)
                    .setLabel(lang.get('bot_menu.button_change_channel'))
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔊'),
                new ButtonBuilder()
                    .setCustomId(`kick_bot_${botId}`)
                    .setLabel(lang.get('bot_menu.button_kick'))
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👢'),
                new ButtonBuilder()
                    .setCustomId(`stop_bot_${botId}`)
                    .setLabel(lang.get('bot_menu.button_stop'))
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`change_status_${botId}`)
                    .setLabel(lang.get('bot_menu.button_change_status'))
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🟢'),
                new ButtonBuilder()
                    .setCustomId(`change_activity_${botId}`)
                    .setLabel(lang.get('bot_menu.button_change_activity'))
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎮')
            );

        return [row1, row2];
    }

    createBotDetailsEmbed(botId) {
        const botConfig = config.getBot(botId);
        const status = botManager.getBotStatus(botId);

        const statusText = lang.get(`status.${botConfig.status}`);
        const activityText = `${lang.get(`activity.${botConfig.activityType}`)} ${botConfig.activityText}`;
        const channelText = botConfig.voiceChannelId 
            ? `<#${botConfig.voiceChannelId}>` 
            : lang.get('bot_menu.not_connected');

        const embed = new EmbedBuilder()
            .setColor(status.online ? '#00ff00' : '#ff0000')
            .setTitle(`${lang.get('bot_menu.bot_details')} - ${botConfig.name}`)
            .addFields(
                {
                    name: lang.get('bot_menu.current_status'),
                    value: statusText,
                    inline: true
                },
                {
                    name: lang.get('bot_menu.current_activity'),
                    value: activityText,
                    inline: true
                },
                {
                    name: lang.get('bot_menu.current_channel'),
                    value: channelText,
                    inline: false
                }
            )
            .setFooter({ text: `Bot ID: ${botId}` })
            .setTimestamp();

        return embed;
    }

    async sendDashboard(channel) {
        try {
            const embed = this.createDashboardEmbed();
            const buttons = this.createDashboardButtons();
            const selectMenu = this.createBotSelectMenu();

            this.dashboardMessage = await channel.send({
                embeds: [embed],
                components: [...buttons, selectMenu]
            });

            config.set('dashboardMessageId', this.dashboardMessage.id);

            this.startAutoUpdate(channel);

            return true;
        } catch (error) {
            console.error('❌ خطأ في إرسال لوحة التحكم:', error);
            return false;
        }
    }

    async updateDashboard(message) {
        try {
            const embed = this.createDashboardEmbed();
            const buttons = this.createDashboardButtons();
            const selectMenu = this.createBotSelectMenu();

            await message.edit({
                embeds: [embed],
                components: [...buttons, selectMenu]
            });

            return true;
        } catch (error) {
            console.error('❌ خطأ في تحديث لوحة التحكم:', error);
            return false;
        }
    }

    startAutoUpdate(channel) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            if (this.dashboardMessage) {
                try {
                    await this.updateDashboard(this.dashboardMessage);
                } catch (error) {
                    console.error('❌ خطأ في التحديث التلقائي:', error);
                }
            }
        }, 60000); // 60 ثانية

        console.log('✅ تم بدء التحديث التلقائي للوحة التحكم (كل 60 ثانية)');
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ تم إيقاف التحديث التلقائي');
        }
    }
}

module.exports = new DashboardManager();
