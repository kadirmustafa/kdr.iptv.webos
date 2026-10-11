# KDR IPTV - LG webOS Smart TV Player & Cloud Pairing Portal

Modern, high-performance Smart Stream IPTV Media Player tailored for LG webOS Smart TVs and companion web pairing portal.

---

## 📺 Project Structure

```text
kdr.iptv.webos/
├── src/                    # LG webOS TV App (React 19 + TypeScript + Vite + Tailwind)
├── public/                 # TV App Icons & appinfo.json (webOS 24/27 ACG compliant)
├── store-assets/           # LG Seller Lounge Assets (Icons, Splash, Screenshots, UX Scenario PDF)
├── web-portal/             # Mobile/PC Pairing Portal & WebSocket Server (Dockerized)
│   ├── index.html          # Pairing wizard with M3U/Xtream parser & GA4 tracking
│   ├── privacy.html        # Public Privacy Policy & User Guide
│   ├── server.js           # Lightweight Node.js Proxy & State Server
│   ├── Dockerfile          # Alpine-based container
│   └── docker-compose.yml  # Production deployment setup
├── scripts/                # Packaging, Release & Screenshot automation
└── .github/workflows/      # Automated CI/CD pipeline for web portal deployment
```

---

## 🚀 Quick Start (TV App)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build & Package for webOS TV (.ipk)
Automatically increments version, compiles the application, and produces an IPK package:
```bash
npm run package
```
*Output: `com.kdr.iptv_X.X.X_all.ipk`*

---

## 🌐 Web Pairing Portal (`pairiptv.ozturk.app`)

The companion portal allows users to link their playlists from a phone or computer using a 6-character code shown on the TV screen.

### Running with Docker Compose:
```bash
cd web-portal
docker compose up -d --build
```
*Port: `8088` (maps to internal port 3001)*

---

## 🛡️ License & Compliance
This software is an independent media player shell. It does not provide, host, or broadcast any content or channels.
Users must supply their own legitimate playlists.
