# Bantah Telegram Bot

Independent Telegram bot service for Bantah that communicates with the main API via HTTP calls.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Set your environment variables:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MAIN_API_URL=http://localhost:5000  # Your main server URL
```

### 3. Build
```bash
npm run build
```

### 4. Run

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run start
```

## How It Works

The bot runs independently in polling mode and:
1. Listens for Telegram commands (`/start`, `/balance`, `/mychallenges`, `/help`)
2. Calls your main API server to fetch user data
3. Sends formatted messages back to users
4. Links to the mini-app web interface

## Commands

- `/start` - Open the Bantah mini-app
- `/balance` - Check wallet balance
- `/mychallenges` - View active challenges  
- `/help` - Show help message

## Architecture

```
Telegram User
    ↓
Telegram Bot (polling)
    ↓
Main API Server (HTTP calls)
    ↓
Database
```

The bot has NO database access - it only calls the main API to get information.

## Deployment

You can run this on any Node.js server:

```bash
# On a separate server
git clone <repo>
cd telegram-bot
npm install
cp .env.example .env
# Edit .env with your tokens and main API URL
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ Yes | Your Telegram bot token from @BotFather |
| `MAIN_API_URL` | ✅ Yes | URL of your main API server |

## API Endpoints Called

The bot calls these endpoints on your main API:

- `GET /api/telegram/user/{telegramId}` - Get user wallet & challenge data

Make sure your main server has these endpoints!

## Troubleshooting

**Bot not responding?**
- Check `TELEGRAM_BOT_TOKEN` is correct
- Check `MAIN_API_URL` is reachable
- Check bot permissions with @BotFather

**Getting errors from API?**
- Verify main server is running
- Check network connectivity
- Check API endpoint exists

**Want to disable the bot?**
Just don't run this service - your main app will still work!
