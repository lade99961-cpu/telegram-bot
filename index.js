const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.loader');
const botManager = require('./utils/botManager');
const dashboardManager = require('./utils/dashboardManager');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
    }
}

client.once('ready', async () => {
    console.log(`✅ البوت الرئيسي جاهز: ${client.user.tag}`);
    
    // تسجيل الأوامر
    try {
        const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());
        if (commands.length > 0) {
            const rest = new REST().setToken(config.get('mainToken'));
            await rest.put(Routes.applicationGuildCommands(client.user.id, config.get('guildId')), { body: commands });
        }
    } catch (err) { console.error('❌ خطأ في الأوامر:', err.message); }

    // استعادة لوحة التحكم
    const controlChannelId = config.get('controlChannelId');
    const dashboardMessageId = config.get('dashboardMessageId');
    if (controlChannelId && dashboardMessageId) {
        try {
            const channel = await client.channels.fetch(controlChannelId);
            const message = await channel.messages.fetch(dashboardMessageId);
            dashboardManager.dashboardMessage = message;
            dashboardManager.startAutoUpdate(channel);
        } catch (e) { console.log('⚠️ لم يتم استعادة اللوحة'); }
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        } else if (interaction.isButton()) {
            await handleButton(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await handleSelect(interaction);
        } else if (interaction.isModalSubmit()) {
            await handleModal(interaction);
        }
    } catch (err) {
        console.error('❌ خطأ تفاعل:', err);
        const errContent = { content: '❌ حدث خطأ غير متوقع!', ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.followUp(errContent).catch(() => {});
        else await interaction.reply(errContent).catch(() => {});
    }
});

async function handleButton(interaction) {
    const customId = interaction.customId;

    if (customId === 'refresh_dashboard') {
        await interaction.deferUpdate();
        await dashboardManager.updateDashboard(interaction.message);
        return;
    }
    if (customId === 'start_all_bots') {
        await interaction.deferReply({ ephemeral: true });
        const res = await botManager.startAllBots();
        await interaction.editReply({ content: '✅ تم تشغيل البوتات' });
        await dashboardManager.updateDashboard(interaction.message);
        return;
    }
    if (customId === 'stop_all_bots') {
        await interaction.deferReply({ ephemeral: true });
        await botManager.stopAllBots();
        await interaction.editReply({ content: '✅ تم إيقاف جميع البوتات' });
        await dashboardManager.updateDashboard(interaction.message);
        return;
    }

    const botId = customId.split('_').pop();
    if (customId.startsWith('change_channel_')) await interaction.showModal(dashboardManager.getChannelModal(botId));
    else if (customId.startsWith('change_status_')) await interaction.showModal(dashboardManager.getStatusModal(botId));
    else if (customId.startsWith('change_activity_')) await interaction.showModal(dashboardManager.getActivityModal(botId));
    else if (customId.startsWith('kick_bot_')) {
        await interaction.deferReply({ ephemeral: true });
        const res = await botManager.leaveVoiceChannel(botId);
        await interaction.editReply({ content: res.success ? '✅ تم الطرد من القناة' : '❌ فشل الإجراء' });
    } else if (customId.startsWith('stop_bot_')) {
        await interaction.deferReply({ ephemeral: true });
        const res = await botManager.stopBot(botId);
        await interaction.editReply({ content: res.success ? '✅ تم إيقاف البوت' : '❌ فشل الإيقاف' });
    }
}

async function handleSelect(interaction) {
    if (interaction.customId === 'select_bot') {
        const botId = interaction.values[0];
        await interaction.reply({
            embeds: [dashboardManager.createBotDetailsEmbed(botId)],
            components: dashboardManager.createBotControlButtons(botId),
            ephemeral: true
        });
    }
}

async function handleModal(interaction) {
    const customId = interaction.customId;
    const botId = customId.split('_').pop();
    await interaction.deferReply({ ephemeral: true });

    if (customId.startsWith('channel_modal_')) {
        const channelId = interaction.fields.getTextInputValue('channel_id');
        const res = await botManager.joinVoiceChannel(botId, channelId);
        await interaction.editReply({ content: res.success ? '✅ تم تغيير القناة الصوتية بنجاح' : `❌ ${res.message}` });
    } else if (customId.startsWith('status_modal_')) {
        const status = interaction.fields.getTextInputValue('status');
        const res = botManager.updateBotPresence(botId, { status: status.toLowerCase(), activityType: 'playing', activityText: '' });
        await interaction.editReply({ content: res.success ? '✅ تم تغيير الحالة' : '❌ فشل تغيير الحالة' });
    } else if (customId.startsWith('activity_modal_')) {
        const type = interaction.fields.getTextInputValue('activity_type');
        const text = interaction.fields.getTextInputValue('activity_text');
        const res = botManager.updateBotPresence(botId, { status: 'online', activityType: type.toLowerCase(), activityText: text });
        await interaction.editReply({ content: res.success ? '✅ تم تغيير النشاط' : '❌ فشل تغيير النشاط' });
    }

    if (dashboardManager.dashboardMessage) {
        await dashboardManager.updateDashboard(dashboardManager.dashboardMessage).catch(() => {});
    }
}

process.on('unhandledRejection', err => console.error('❌ Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('❌ Uncaught Exception:', err));

client.login(config.get('mainToken')).catch(err => console.error('❌ فشل الدخول:', err.message));
