module.exports = {
    // أوامر
    commands: {
        set_control_channel: {
            name: 'set_control_channel',
            description: 'تعيين قناة لوحة التحكم',
            success: '✅ تم تعيين قناة لوحة التحكم بنجاح!',
            error: '❌ حدث خطأ أثناء تعيين القناة'
        },
        start_all_bots: {
            name: 'start_all_bots',
            description: 'تشغيل جميع البوتات',
            starting: '🔄 جاري تشغيل جميع البوتات...',
            success: '✅ تم تشغيل جميع البوتات بنجاح!',
            partial: '⚠️ تم تشغيل بعض البوتات. البعض فشل في الاتصال',
            error: '❌ حدث خطأ أثناء تشغيل البوتات'
        },
        set_bot_vc_channel: {
            name: 'set_bot_vc_channel',
            description: 'تعيين قناة صوتية للبوت',
            bot_option: 'البوت',
            bot_description: 'اختر البوت',
            channel_option: 'القناة',
            channel_description: 'القناة الصوتية',
            success: '✅ تم تعيين القناة الصوتية للبوت بنجاح!',
            error: '❌ حدث خطأ أثناء تعيين القناة',
            invalid_channel: '❌ يجب اختيار قناة صوتية!'
        },
        list: {
            name: 'list',
            description: 'عرض قائمة البوتات وحالتها',
            title: '📋 قائمة البوتات',
            no_bots: 'لا توجد بوتات مسجلة',
            status_online: '🟢 متصل',
            status_offline: '🔴 غير متصل',
            in_channel: 'في القناة:',
            not_in_channel: 'غير متصل بقناة صوتية'
        },
        set_lang: {
            name: 'set_lang',
            description: 'تغيير لغة البوت',
            language_option: 'اللغة',
            language_description: 'اختر اللغة',
            success: '✅ تم تغيير اللغة بنجاح!',
            error: '❌ حدث خطأ أثناء تغيير اللغة'
        },
        help: {
            name: 'help',
            description: 'عرض جميع الأوامر المتاحة',
            title: '📚 قائمة الأوامر',
            footer: 'استخدم الأوامر بحذر!'
        }
    },

    dashboard: {
        title: '🎛️ لوحة التحكم - إدارة البوتات',
        total_bots: 'عدد البوتات',
        active_bots: 'البوتات النشطة',
        inactive_bots: 'البوتات المتوقفة',
        last_update: 'آخر تحديث',
        button_bot_list: '📋 قائمة البوتات',
        button_refresh: '🔄 تحديث',
        button_start_all: '▶️ تشغيل الكل',
        button_stop_all: '⏹️ إيقاف الكل'
    },

    bot_menu: {
        placeholder: 'اختر بوت للتحكم به...',
        bot_details: '🤖 تفاصيل البوت',
        button_change_channel: '🔊 تغيير القناة',
        button_kick: '👢 طرد من القناة',
        button_stop: '⏹️ إيقاف البوت',
        button_change_status: '🟢 تغيير الحالة',
        button_change_activity: '🎮 تغيير النشاط',
        current_channel: 'القناة الحالية',
        current_status: 'الحالة',
        current_activity: 'النشاط',
        not_connected: 'غير متصل'
    },

    status: {
        online: '🟢 متصل',
        idle: '🟡 نائم',
        dnd: '🔴 عدم الإزعاج',
        invisible: '⚫ غير مرئي'
    },

    activity: {
        playing: '🎮 يلعب',
        listening: '🎵 يستمع إلى',
        watching: '👀 يشاهد',
        streaming: '📡 يبث',
        competing: '🏆 يتنافس في'
    },

    general: {
        success: '✅ تم بنجاح!',
        error: '❌ حدث خطأ!',
        loading: '⏳ جاري التحميل...',
        no_permission: '❌ ليس لديك صلاحية لاستخدام هذا الأمر!',
        bot_started: '✅ تم تشغيل البوت',
        bot_stopped: '⏹️ تم إيقاف البوت',
        joined_channel: '✅ انضم للقناة الصوتية',
        left_channel: '👋 غادر القناة الصوتية'
    }
};