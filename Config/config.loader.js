const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, 'config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const data = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ خطأ في تحميل ملف config.json:', error.message);
            process.exit(1);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ ملف config.json:', error.message);
            return false;
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        return this.saveConfig();
    }

    updateBot(botId, updates) {
        const botIndex = this.config.bots.findIndex(b => b.id === botId);
        if (botIndex !== -1) {
            this.config.bots[botIndex] = { ...this.config.bots[botIndex], ...updates };
            return this.saveConfig();
        }
        return false;
    }

    getBot(botId) {
        return this.config.bots.find(b => b.id === botId);
    }

    getAllBots() {
        return this.config.bots;
    }
}

module.exports = new ConfigManager();