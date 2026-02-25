# CompromisAI Real Estate Project

Dit is een monorepo voor de CompromisAI applicatie, bestaande uit een Node.js/Express backend en een React/Vite frontend.

## 📂 Project Structuur

- **`/server`**: De Node.js API backend.
- **`/compromisai`**: De React frontend.
- **`/MySQL+Collabora`**: De MySQL database en Collabora office suite.

## 🚀 Getting Started voor Developers

Volg deze stappen om het project lokaal draaiende te krijgen.

### 1. Vereisten

- **Node.js** (v18+ LTS):
  - **Windows (PowerShell):** `winget install OpenJS.NodeJS.LTS`
  - **Mac (Homebrew):** `brew install node`
  - Of download de installer via [nodejs.org](https://nodejs.org/).
  - *Check installatie:* `node -v`
  - **Docker Desktop**:
    - Download en installeer Docker Desktop via [docker.com](https://www.docker.com/).
    - *Check installatie:* `docker --version`

### 2. Installatie

Clone de repository en installeer de dependencies voor beide projecten:

```bash
# Clone de repo
# Backend installatie
cd server
npm install
npm run dev
# Kopieer de .env template (vraag Willem om de wachtwoorden)

# Frontend installatie
cd ../compromisai
npm install
npm run dev


cd ../docker
docker-compose up -d

# Initialiseer de databank met test-accounts
cd ../server
node scripts/seedAuth.js
```

### 3. Applicatie Starten

Je hebt drie terminals nodig in antigravity of vscode:

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

**Terminal 3 (MySQL+Collabora):**
```bash
cd MySQL+Collabora
docker-compose up -d
# MySQL draait op http://localhost:3307
# Collabora draait op http://localhost:9980
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, TypeScript
- **Backend:** Node.js, Express,Collabora, MySQL
