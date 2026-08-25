module.exports = {
    // Commands
    commands: {
        set_control_channel: {
            name: 'set_control_channel',
            description: 'Set the control panel channel',
            success: '✅ Control channel set successfully!',
            error: '❌ Error setting the channel'
        },
        start_all_bots: {
            name: 'start_all_bots',
            description: 'Start all bots',
            starting: '🔄 Starting all bots...',
            success: '✅ All bots started successfully!',
            partial: '⚠️ Some bots started. Others failed to connect',
            error: '❌ Error starting bots'
        },
        set_bot_vc_channel: {
            name: 'set_bot_vc_channel',
            description: 'Set voice channel for bot',
            bot_option: 'Bot',
            bot_description: 'Select the bot',
            channel_option: 'Channel',
            channel_description: 'Voice channel',
            success: '✅ Voice channel set for bot successfully!',
            error: '❌ Error setting channel',
            invalid_channel: '❌ Must select a voice channel!'
        },
        list: {
            name: 'list',
            description: 'Show list of bots and their status',
            title: '📋 Bots List',
            no_bots: 'No registered bots',
            status_online: '🟢 Online',
            status_offline: '🔴 Offline',
            in_channel: 'In channel:',
            not_in_channel: 'Not in voice channel'
        },
        set_lang: {
            name: 'set_lang',
            description: 'Change bot language',
            language_option: 'Language',
            language_description: 'Select language',
            success: '✅ Language changed successfully!',
            error: '❌ Error changing language'
        },
        help: {
            name: 'help',
            description: 'Show all available commands',
            title: '📚 Commands List',
            footer: 'Use commands carefully!'
        }
    },

    // Dashboard
    dashboard: {
        title: '🎛️ Control Panel - Bot Manager',
        total_bots: 'Total Bots',
        active_bots: 'Active Bots',
        inactive_bots: 'Inactive Bots',
        last_update: 'Last Update',
        button_bot_list: '📋 Bot List',
        button_refresh: '🔄 Refresh',
        button_start_all: '▶️ Start All',
        button_stop_all: '⏹️ Stop All'
    },

    // Bot dropdown menu
    bot_menu: {
        placeholder: 'Select a bot to control...',
        bot_details: '🤖 Bot Details',
        button_change_channel: '🔊 Change Channel',
        button_kick: '👢 Kick from Channel',
        button_stop: '⏹️ Stop Bot',
        button_change_status: '🟢 Change Status',
        button_change_activity: '🎮 Change Activity',
        current_channel: 'Current Channel',
        current_status: 'Status',
        current_activity: 'Activity',
        not_connected: 'Not Connected'
    },

    // Bot statuses
    status: {
        online: '🟢 Online',
        idle: '🟡 Idle',
        dnd: '🔴 Do Not Disturb',
        invisible: '⚫ Invisible'
    },

    // Activity types
    activity: {
        playing: '🎮 Playing',
        listening: '🎵 Listening to',
        watching: '👀 Watching',
        streaming: '📡 Streaming',
        competing: '🏆 Competing in'
    },

    // General messages
    general: {
        success: '✅ Success!',
        error: '❌ Error occurred!',
        loading: '⏳ Loading...',
        no_permission: '❌ You don\'t have permission to use this command!',
        bot_started: '✅ Bot started',
        bot_stopped: '⏹️ Bot stopped',
        joined_channel: '✅ Joined voice channel',
        left_channel: '👋 Left voice channel'
    }
};