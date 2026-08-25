const { Client, GatewayIntentBits, Collection, REST, Routes, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.loader');
const lang = require('./lang/lang.loader');
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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ تم تحميل الأمر: ${command.data.name}`);
    }
}

async function registerCommands() {
    try {
        const commands = [];
        for (const command of client.commands.values()) {
            commands.push(command.data.toJSON());
        }

        const rest = new REST().setToken(config.get('mainToken'));
        
        console.log('🔄 جاري تسجيل الأوامر...');
        
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.get('guildId')),
            { body: commands }
        );

        console.log('✅ تم تسجيل جميع الأوامر بنجاح!');
    } catch (error) {
        console.error('❌ خطأ في تسجيل الأوامر:', error);
    }
}

client.once('ready', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ البوت الرئيسي جاهز: ${client.user.tag}`);
    console.log(`🌐 السيرفر: ${config.get('guildId')}`);
    console.log(`🗣️ اللغة: ${lang.getCurrentLanguage()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // تسجيل الأوامر
    await registerCommands();

    const controlChannelId = config.get('controlChannelId');
    const dashboardMessageId = config.get('dashboardMessageId');
    
    if (controlChannelId && dashboardMessageId) {
        try {
            const channel = await client.channels.fetch(controlChannelId);
            const message = await channel.messages.fetch(dashboardMessageId);
            dashboardManager.dashboardMessage = message;
            dashboardManager.startAutoUpdate(channel);
            console.log('✅ تم استعادة لوحة التحكم');
        } catch (error) {
            console.log('⚠️ لم يتم العثور على لوحة التحكم السابقة');
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('❌ خطأ في تنفيذ الأمر:', error);
            const errorMessage = lang.get('general.error');
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }

    if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    }

    if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
    }

    if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
    }
});

async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;

    try {
        if (customId === 'refresh_dashboard') {
            await interaction.deferUpdate();
            await dashboardManager.updateDashboard(interaction.message);
            return;
        }

        if (customId === 'start_all_bots') {
            await interaction.deferReply({ ephemeral: true });
            const results = await botManager.startAllBots();
            
            let message = '**نتائج التشغيل:**\n\n';
            results.forEach(r => {
                message += `${r.success ? '✅' : '❌'} ${r.name}\n`;
            });
            
            await interaction.editReply({ content: message });
            await dashboardManager.updateDashboard(interaction.message);
            return;
        }

        if (customId === 'stop_all_bots') {
            await interaction.deferReply({ ephemeral: true });
            const results = await botManager.stopAllBots();
            
            let message = '**نتائج الإيقاف:**\n\n';
            results.forEach(r => {
                message += `${r.success ? '✅' : '❌'} ${r.name}\n`;
            });
            
            await interaction.editReply({ content: message });
            await dashboardManager.updateDashboard(interaction.message);
            return;
        }

        const botId = customId.split('_').pop();

        if (customId.startsWith('change_channel_')) {
            await showChannelSelectionModal(interaction, botId);
        } else if (customId.startsWith('kick_bot_')) {
            await interaction.deferReply({ ephemeral: true });
            const result = await botManager.leaveVoiceChannel(botId);
            await interaction.editReply({
                content: result.success ? '✅ تم طرد البوت من القناة' : '❌ حدث خطأ'
            });
        } else if (customId.startsWith('stop_bot_')) {
            await interaction.deferReply({ ephemeral: true });
            const result = await botManager.stopBot(botId);
            await interaction.editReply({
                content: result.success ? '✅ تم إيقاف البوت' : '❌ حدث خطأ'
            });
            await dashboardManager.updateDashboard(interaction.message);
        } else if (customId.startsWith('change_status_')) {
            await showStatusModal(interaction, botId);
        } else if (customId.startsWith('change_activity_')) {
            await showActivityModal(interaction, botId);
        }

    } catch (error) {
        console.error('❌ خطأ في معالجة الزر:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ حدث خطأ', ephemeral: true });
        }
    }
}

async function handleSelectMenuInteraction(interaction) {
    if (interaction.customId === 'select_bot') {
        const botId = interaction.values[0];
        
        const embed = dashboardManager.createBotDetailsEmbed(botId);
        const buttons = dashboardManager.createBotControlButtons(botId);

        await interaction.reply({
            embeds: [embed],
            components: buttons,
            ephemeral: true
        });
    }
}

async function showChannelSelectionModal(interaction, botId) {
    const modal = new ModalBuilder()
        .setCustomId(`channel_modal_${botId}`)
        .setTitle('تغيير القناة الصوتية');

    const channelInput = new TextInputBuilder()
        .setCustomId('channel_id')
        .setLabel('معرف القناة الصوتية (Channel ID)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('مثال: 1234567890123456789')
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(channelInput));
    await interaction.showModal(modal);
}

async function showStatusModal(interaction, botId) {
    const modal = new ModalBuilder()
        .setCustomId(`status_modal_${botId}`)
        .setTitle('تغيير حالة البوت');

    const statusInput = new TextInputBuilder()
        .setCustomId('status')
        .setLabel('الحالة (online/idle/dnd/invisible)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('online')
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(statusInput));
    await interaction.showModal(modal);
}

async function showActivityModal(interaction, botId) {
    const modal = new ModalBuilder()
        .setCustomId(`activity_modal_${botId}`)
        .setTitle('تغيير نشاط البوت');

    const typeInput = new TextInputBuilder()
        .setCustomId('activity_type')
        .setLabel('نوع النشاط')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('playing/listening/watching/streaming/competing')
        .setRequired(true);

    const textInput = new TextInputBuilder()
        .setCustomId('activity_text')
        .setLabel('نص النشاط')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('مثال: Minecraft')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(typeInput),
        new ActionRowBuilder().addComponents(textInput)
    );
    
    await interaction.showModal(modal);
}


// This Part From AI !! 
// ----------------------------------------------------------------------------------------------------------

async function handleModalSubmit(interaction) {
    const customId = interaction.customId;
    const botId = customId.split('_').pop();

    try {
        if (customId.startsWith('channel_modal_')) {
            const channelId = interaction.fields.getTextInputValue('channel_id');
            await interaction.deferReply({ ephemeral: true });
            
            const result = await botManager.joinVoiceChannel(botId, channelId);
            await interaction.editReply({
                content: result.success ? '✅ تم تغيير القناة بنجاح' : `❌ ${result.message}`
            });
        } 
        else if (customId.startsWith('status_modal_')) {
            const status = interaction.fields.getTextInputValue('status');
            await interaction.deferReply({ ephemeral: true });
            
            const botConfig = config.getBot(botId);
            const result = botManager.updateBotPresence(botId, {
                status: status,
                activityType: botConfig.activityType,
                activityText: botConfig.activityText
            });
            
            await interaction.editReply({
                content: result.success ? '✅ تم تغيير الحالة بنجاح' : '❌ حدث خطأ'
            });
        }
        else if (customId.startsWith('activity_modal_')) {
            const activityType = interaction.fields.getTextInputValue('activity_type');
            const activityText = interaction.fields.getTextInputValue('activity_text');
            await interaction.deferReply({ ephemeral: true });
            
            const botConfig = config.getBot(botId);
            const result = botManager.updateBotPresence(botId, {
                status: botConfig.status,
                activityType: activityType,
                activityText: activityText
            });
            
            await interaction.editReply({
                content: result.success ? '✅ تم تغيير النشاط بنجاح' : '❌ حدث خطأ'
            });
        }
    } catch (error) {
        console.error('❌ خطأ في معالجة Modal:', error);
        await interaction.reply({ content: '❌ حدث خطأ', ephemeral: true });
    }                      
}

// End Of Part
// -------------------------------------------------------------------------------------------------------------------



process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
});

// تسجيل دخول البوت
client.login(config.get('mainToken'))
    .then(() => console.log('🔐 جاري تسجيل الدخول...'))
    .catch(error => {
        console.error('❌ فشل تسجيل الدخول:', error);
        process.exit(1);
    });
