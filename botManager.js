const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const config = require('../config/config.loader');

class BotManager {
    constructor() {
        this.bots = new Map(); // تخزين الجلسات النشطة للبوتات الفرعية
    }

    // إرجاع قائمة البوتات المتاحة
    getBots() {
        return config.get('bots') || [];
    }

    // تشغيل جميع البوتات
    async startAllBots() {
        const bots = this.getBots();
        const results = [];
        for (const bot of bots) {
            // تنفيذ منطق تشغيل البوت هنا حسب بنيتك
            results.push({ name: bot.name || bot.id, success: true });
        }
        return results;
    }

    // إيقاف جميع البوتات
    async stopAllBots() {
        const bots = this.getBots();
        const results = [];
        for (const bot of bots) {
            results.push({ name: bot.name || bot.id, success: true });
        }
        return results;
    }

    // إيقاف بوت محدد
    async stopBot(botId) {
        try {
            if (this.bots.has(botId)) {
                const client = this.bots.get(botId);
                client.destroy();
                this.bots.delete(botId);
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // دخول قناة صوتية
    async joinVoiceChannel(botId, channelId) {
        try {
            // تطبيق ربط الـ Voice Connection هنا
            return { success: true };
        } catch (error) {
            return { success: false, message: 'تعذر الانضمام للقناة الصوتية' };
        }
    }

    // المغادرة من القناة الصوتية
    async leaveVoiceChannel(botId) {
        try {
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // تحديث حالة البوت ونشاطه (Status & Activity)
    updateBotPresence(botId, { status, activityType, activityText }) {
        try {
            const client = this.bots.get(botId);
            if (client && client.user) {
                client.user.setPresence({
                    status: status,
                    activities: [{ name: activityText, type: this.parseActivityType(activityType) }]
                });
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    parseActivityType(type) {
        const types = { playing: 0, streaming: 1, listening: 2, watching: 3, competing: 5 };
        return types[type.toLowerCase()] ?? 0;
    }
}

module.exports = new BotManager();
