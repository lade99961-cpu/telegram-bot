const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.loader');
const lang = require('../lang/lang.loader');
const dashboardManager = require('../utils/dashboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(lang.get('commands.set_control_channel.name'))
        .setDescription(lang.get('commands.set_control_channel.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const channel = interaction.channel;

            if (channel.type !== ChannelType.GuildText) {
                return await interaction.reply({
                    content: '❌ يجب تنفيذ الأمر في قناة نصية!',
                    ephemeral: true
                });
            }

            config.set('controlChannelId', channel.id);

            await dashboardManager.sendDashboard(channel);

            await interaction.reply({
                content: lang.get('commands.set_control_channel.success'),
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in set_control_channel:', error);
            await interaction.reply({
                content: lang.get('commands.set_control_channel.error'),
                ephemeral: true
            });
        }
    }
};