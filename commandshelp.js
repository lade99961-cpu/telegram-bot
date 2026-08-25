const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const lang = require('../lang/lang.loader');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(lang.get('commands.help.name'))
        .setDescription(lang.get('commands.help.description')),
    
    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(lang.get('commands.help.title'))
                .setDescription('━━━━━━━━━━━━━━━━━━━━━')
                .addFields(
                    {
                        name: '`/set_control_channel`',
                        value: lang.get('commands.set_control_channel.description'),
                        inline: false
                    },
                    {
                        name: '`/start_all_bots`',
                        value: lang.get('commands.start_all_bots.description'),
                        inline: false
                    },
                    {
                        name: '`/set_bot_vc_channel`',
                        value: lang.get('commands.set_bot_vc_channel.description'),
                        inline: false
                    },
                    {
                        name: '`/list`',
                        value: lang.get('commands.list.description'),
                        inline: false
                    },
                    {
                        name: '`/set_lang`',
                        value: lang.get('commands.set_lang.description'),
                        inline: false
                    },
                    {
                        name: '`/help`',
                        value: lang.get('commands.help.description'),
                        inline: false
                    }
                )
                .setFooter({ text: lang.get('commands.help.footer') })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in help command:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء عرض المساعدة',
                ephemeral: true
            });
        }
    }
};
