const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const lang = require('../lang/lang.loader');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_lang')
        .setDescription('Change bot language / تغيير لغة البوت')
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('Select language / اختر اللغة')
                .setRequired(true)
                .addChoices(
                    { name: '🇸🇦 العربية', value: 'ar' },
                    { name: '🇺🇸 English', value: 'en-us' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            const language = interaction.options.getString('language');

            lang.setLanguage(language);

            const successMessage = language === 'ar' 
                ? '✅ تم تغيير اللغة إلى العربية بنجاح!\n⚠️ قد تحتاج لإعادة تشغيل البوت لتطبيق التغييرات على الأوامر'
                : '✅ Language changed to English successfully!\n⚠️ You may need to restart the bot to apply changes to commands';

            await interaction.reply({
                content: successMessage,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in set_lang:', error);
            await interaction.reply({
                content: '❌ Error changing language / خطأ في تغيير اللغة',
                ephemeral: true
            });
        }
    }
};