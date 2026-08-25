const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const lang = require('../lang/lang.loader');
const botManager = require('../utils/botManager');
const config = require('../config/config.loader');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(lang.get('commands.list.name'))
        .setDescription(lang.get('commands.list.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const botsStatus = botManager.getAllBotsStatus();

            if (botsStatus.length === 0) {
                return await interaction.reply({
                    content: lang.get('commands.list.no_bots'),
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#00aaff')
                .setTitle(lang.get('commands.list.title'))
                .setTimestamp();

            let description = '';
            botsStatus.forEach((bot, index) => {
                const statusIcon = bot.online 
                    ? lang.get('commands.list.status_online')
                    : lang.get('commands.list.status_offline');
                
                const botConfig = config.getBot(bot.id);
                const channelInfo = bot.inVoice && bot.channelId
                    ? `${lang.get('commands.list.in_channel')} <#${bot.channelId}>`
                    : lang.get('commands.list.not_in_channel');

                description += `\n**${index + 1}. ${bot.name}**\n`;
                description += `${statusIcon}\n`;
                description += `📍 ${channelInfo}\n`;
                description += `🎮 ${botConfig.activityType}: ${botConfig.activityText}\n`;
                description += `━━━━━━━━━━━━━━\n`;
            });

            embed.setDescription(description);

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in list command:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء عرض القائمة',
                ephemeral: true
            });
        }
    }
};
