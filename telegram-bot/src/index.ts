import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

// Load .env file
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line: string) => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const MAIN_API_URL = (process.env.MAIN_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const MINI_APP_URL = (process.env.MINI_APP_URL || MAIN_API_URL).replace(/\/$/, '');

if (!TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🤖 Bantah Telegram Bot started (polling mode)');
console.log(`📡 Main API URL: ${MAIN_API_URL}`);
console.log(`🎯 Mini-app URL: ${MINI_APP_URL}/telegram-mini-app`);

// /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'User';
  const telegramId = msg.from?.id.toString();

  console.log(`📱 Received /start from Telegram user ${telegramId}`);

  try {
    const miniAppUrl = `${MINI_APP_URL}/telegram-mini-app`;

    const response = await bot.sendMessage(chatId, `👋 *Welcome to Bantah, ${firstName}!*

━━━━━━━━━━━━━━━━━━━━━

🚀 Open the app below to:
✅ Create & accept challenges
✅ Manage your wallet
✅ Track your stats
✅ Get instant updates`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎯 Open Bantah',
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      }
    });

    console.log(`✅ Sent /start message to ${chatId}`);
  } catch (error) {
    console.error('❌ Error sending start message:', error);
  }
});

// /balance command
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id.toString();

  console.log(`📊 Received /balance from Telegram user ${telegramId}`);

  try {
    // Call main API to get user balance
    const userRes = await axios.get(`${MAIN_API_URL}/api/telegram/user/${telegramId}`);
    
    if (userRes.data.user) {
      const balance = userRes.data.user.balance || '0';
      const coins = userRes.data.user.coins || 0;

      await bot.sendMessage(chatId, `💰 *Your Wallet*

Balance: ₦${parseInt(balance).toLocaleString()}
Coins: 🪙 ${coins}

[Open Wallet in App](${MINI_APP_URL}/telegram-mini-app?tab=wallet)`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '💼 View in Wallet',
                web_app: { url: `${MINI_APP_URL}/telegram-mini-app?tab=wallet` }
              }
            ]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, '💰 *Your Wallet*\n\nNo account linked yet. Open the mini-app to get started!', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open App',
                web_app: { url: `${MINI_APP_URL}/telegram-mini-app` }
              }
            ]
          ]
        }
      });
    }
  } catch (error) {
    console.error('❌ Error getting balance:', error);
    await bot.sendMessage(chatId, '⚠️ Unable to fetch wallet. Please try again.');
  }
});

// /mychallenges command
bot.onText(/\/mychallenges/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from?.id.toString();

  console.log(`⚔️ Received /mychallenges from Telegram user ${telegramId}`);

  try {
    // Call main API to get user challenges
    const userRes = await axios.get(`${MAIN_API_URL}/api/telegram/user/${telegramId}`);
    
    if (userRes.data.user) {
      const challengeCount = userRes.data.user.activeChallenges || 0;

      await bot.sendMessage(chatId, `⚔️ *Your Challenges*

Active Challenges: ${challengeCount}

View all your challenges in the app!`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '⚔️ View Challenges',
                web_app: { url: `${MINI_APP_URL}/telegram-mini-app?tab=challenges` }
              }
            ]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, '⚔️ *Your Challenges*\n\nNo account linked yet. Open the mini-app to get started!', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open App',
                web_app: { url: `${MINI_APP_URL}/telegram-mini-app` }
              }
            ]
          ]
        }
      });
    }
  } catch (error) {
    console.error('❌ Error getting challenges:', error);
    await bot.sendMessage(chatId, '⚠️ Unable to fetch challenges. Please try again.');
  }
});

// /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpText = `🆘 *Bantah Help*

Available commands:
/start - Open the Bantah mini-app
/balance - Check your wallet balance
/mychallenges - View your active challenges
/help - Show this help message

Need more help? Open the app and check Settings!`;

  await bot.sendMessage(chatId, helpText, {
    parse_mode: 'Markdown'
  });
});

// Handle any other message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  // Only respond if it's not a command
  if (!text.startsWith('/')) {
    bot.sendMessage(chatId, `👋 Hey there! Use /help to see available commands or /start to open the Bantah app!`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎯 Open Bantah',
              web_app: { url: 'https://betchat.replit.app/telegram-mini-app' }
            }
          ]
        ]
      }
    });
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

console.log('✅ Bot is ready! Listening for commands...');
