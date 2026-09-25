# Alpha Nexus — Full-stack website

## Run locally

1. Install Node.js 20+.
2. In this folder run:
   npm install
   npm start
3. Open:
   http://localhost:3000

The backend automatically creates `alpha_nexus.db` (SQLite).

## Social links

Set environment variables before starting:

WHATSAPP_URL="https://chat.whatsapp.com/GZ3XGKW1hylF1G5z3aXRU6"
DISCORD_URL="https://discord.gg/YOUR_INVITE"

Example:

WHATSAPP_URL="..." DISCORD_URL="..." npm start

## API

POST /api/register
GET /api/config
GET /api/health

Passwords are hashed with bcrypt before storage.
