const config = require('../config/config.loader');

class LanguageManager {
    constructor() {
        this.currentLang = config.get('language') || 'ar';
        this.loadLanguage();
    }

    loadLanguage() {
        try {
            this.strings = require(`./${this.currentLang}.js`);
        } catch (error) {
            console.warn(`⚠️ Language file ${this.currentLang}.js not found, falling back to ar.js`);
            this.currentLang = 'ar';
            this.strings = require('./ar.js');
        }
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.loadLanguage();
        config.set('language', lang);
    }

    get(path) {
        const keys = path.split('.');
        let value = this.strings;
        
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) {
                console.warn(`⚠️ Translation key not found: ${path}`);
                return path;
            }
        }
        
        return value;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

module.exports = new LanguageManager();