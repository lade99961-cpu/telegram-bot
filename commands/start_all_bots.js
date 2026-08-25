const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const lang = require('../lang/lang.loader');
const botManager = require('../utils/botManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(lang.get('commands.start_all_bots.name'))
        .setDescription(lang.get('commands.start_all_bots.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const results = await botManager.startAllBots();

            const successCount = results.filter(r => r.success).length;
            const totalCount = results.length;

            let message = '';
            if (successCount === totalCount) {
                message = lang.get('commands.start_all_bots.success');
            } else if (successCount > 0) {
                message = lang.get('commands.start_all_bots.partial');
            } else {
                message = lang.get('commands.start_all_bots.error');
            }

            message += '\n\n**النتائج:**\n';
            results.forEach(result => {
                const icon = result.success ? '✅' : '❌';
                message += `${icon} ${result.name}\n`;
            });

            await interaction.editReply({
                content: message
            });

        } catch (error) {
            console.error('Error in start_all_bots:', error);
            await interaction.editReply({
                content: lang.get('commands.start_all_bots.error')
            });
        }
    }
};
