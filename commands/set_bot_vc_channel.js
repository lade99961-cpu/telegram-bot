const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.loader');
const lang = require('../lang/lang.loader');
const botManager = require('../utils/botManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(lang.get('commands.set_bot_vc_channel.name'))
        .setDescription(lang.get('commands.set_bot_vc_channel.description'))
        .addStringOption(option =>
            option
                .setName('bot')
                .setDescription(lang.get('commands.set_bot_vc_channel.bot_description'))
                .setRequired(true)
                .addChoices(
                    ...config.getAllBots().map(bot => ({
                        name: bot.name,
                        value: bot.id
                    }))
                )
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription(lang.get('commands.set_bot_vc_channel.channel_description'))
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const botId = interaction.options.getString('bot');
            const channel = interaction.options.getChannel('channel');

            if (channel.type !== ChannelType.GuildVoice) {
                return await interaction.reply({
                    content: lang.get('commands.set_bot_vc_channel.invalid_channel'),
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            const result = await botManager.joinVoiceChannel(botId, channel.id);

            if (result.success) {
                const botConfig = config.getBot(botId);
                await interaction.editReply({
                    content: `${lang.get('commands.set_bot_vc_channel.success')}\n\n🤖 **${botConfig.name}**\n🔊 ${channel.name}`
                });
            } else {
                await interaction.editReply({
                    content: `${lang.get('commands.set_bot_vc_channel.error')}\n${result.message}`
                });
            }

        } catch (error) {
            console.error('Error in set_bot_vc_channel:', error);
            await interaction.reply({
                content: lang.get('commands.set_bot_vc_channel.error'),
                ephemeral: true
            });
        }
    }
};
