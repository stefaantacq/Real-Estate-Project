# CompromisAI Real Estate Project

Dit is een monorepo voor de CompromisAI applicatie, bestaande uit een Node.js/Express backend en een React/Vite frontend.

## 📂 Project Structuur

- **`/server`**: De Node.js API backend.
- **`/compromisai`**: De React frontend.

## 🚀 Getting Started voor Developers

Volg deze stappen om het project lokaal draaiende te krijgen.

### 1. Vereisten

- **Node.js** (v18+ LTS):
  - **Windows (PowerShell):** `winget install OpenJS.NodeJS.LTS`
  - **Mac (Homebrew):** `brew install node`
  - Of download de installer via [nodejs.org](https://nodejs.org/).
  - *Check installatie:* `node -v`
- **SSH logingegevens**: Voor de tunnel naar de database. (Vraag aan Willem (user = mysqltunnel, passwd = 2562))

(ssh -L 3307:127.0.0.1:3306 -N mysqltunnel@mijnfotos.website)

### 2. Installatie

Clone de repository en installeer de dependencies voor beide projecten:

```bash
# Clone de repo
# Backend installatie
cd server
npm install
# Kopieer de .env template (vraag Willem om de wachtwoorden)
cp .env.example .env

# Frontend installatie
cd ../compromisai
npm install
```

### 3. Database Verbinding (Tunnel) 🔑

**LET OP:** De development database draait op een externe VPS (met Docker). Om hier lokaal mee te verbinden, heb je een **SSH Tunnel** nodig.

Zonder deze tunnel zal de backend niet kunnen starten (`ECONNREFUSED`).

**Open een terminal (cmd) en draai dit commando (laat deze open staan!):**

```powershell
# Vervang 'path/to/key' met je private key en 'user@ip' met de server details
ssh -L 3307:127.0.0.1:3306 -N -i "pad/naar/je/ssh/key" user@jouw-vps-ip
```

*Dit zorgt ervoor dat jouw lokale poort `3307` wordt doorgestuurd naar de database op de server.*

### 4. Applicatie Starten

Je hebt twee terminals nodig in antigravity of vscode:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server draait op http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd compromisai
npm run dev
# Frontend draait op http://localhost:5173
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, TypeScript
- **Backend:** Node.js, Express, MySQL (mysql2)
- **Deployment:** Dockge, Caddy (Reverse Proxy)

## 🐳 Alternatief: Volledig Lokaal (Docker)

Als je geen SSH toegang hebt of offline wilt werken, kun je een lokale database opspinnen via Docker (als je Docker Desktop hebt):

*(Moet nog ingericht worden - zie `docker-compose.dev.yml` in de toekomst)*
