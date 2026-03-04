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
  - _Check installatie:_ `node -v`
  - **Docker Desktop**:
    - Download en installeer Docker Desktop via [docker.com](https://www.docker.com/).
    - _Check installatie:_ `docker --version`

### 2. Installatie

Clone de repository en installeer de dependencies voor beide projecten:

```bash
# Backend installatie
cd server
npm install

# Frontend installatie
cd ../compromais
npm install

# Database opstarten
cd ../docker
docker-compose up -d

# Automatische setup (Configuratie + Test accounts)
cd ../server
npm run setup
```

> [!TIP]
> **Krijg je een error bij de Dev Login?**
> Voer `npm run setup` uit in de `server` map. Dit herstelt je `.env` bestand en zorgt dat de test-accounts in de database staan. Vergeet daarna niet je `GEMINI_API_KEY` weer in te vullen in `.env`.

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
cd compromais
npm run dev
# Frontend draait op http://localhost:5173
```

**Terminal 3 (Docker):**

```bash
cd docker
docker-compose up -d
# MySQL draait op localhost:3307
# Collabora draait op localhost:9980
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, TypeScript
- **Backend:** Node.js, Express,Collabora, MySQL
