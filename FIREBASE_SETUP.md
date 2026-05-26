# 🔥 Firebase + GitHub Deployment Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" → name it `schooly-app` (or any name)
3. Enable **Firebase Hosting**

## Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

## Step 3: Initialize Firebase

```bash
cd /g/schooly1-main/schooly1-main
firebase init hosting
```

Select:
- ✅ Use existing project (`schooly-app`)
- ✅ Public directory: `dist`
- ✅ Single-page app: `Yes`
- ✅ GitHub auto-deploy: `Yes` (optional)

## Step 4: Manual Deploy (First Time)

```bash
npm run build
firebase deploy --only hosting
```

Your site will be at: `https://schooly-app.web.app`

## Step 5: GitHub Auto-Deploy (CI/CD)

### Option A: Firebase CLI Setup

```bash
firebase init hosting:github
```

Follow prompts:
- Select your GitHub repo
- Accept defaults

### Option B: Manual GitHub Secrets

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the JSON content
4. Go to your GitHub repo → Settings → Secrets → Actions
5. Add secret: `FIREBASE_SERVICE_ACCOUNT`
6. Paste the JSON content

The workflow file is already created at:
`.github/workflows/firebase-deploy.yml`

## Step 6: Push to GitHub

```bash
git init
git add .
git commit -m "School Smart Eye — Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/schooly-app.git
git push -u origin main
```

Every push to `main` will auto-deploy to Firebase! 🎉

---

## 🐳 API Server Deployment (Backend)

Firebase Hosting is **frontend only**. For the API server, use one of:

### Option 1: Firebase App Hosting (Full-stack)
```bash
firebase apphosting:backends:create --location us-central1
```

### Option 2: Render / Railway (Easiest)
1. Push code to GitHub
2. Connect Render/Railway to your repo
3. Set build command: `npm ci && npm run build && npm run build:server`
4. Set start command: `node dist-server/index.js`
5. Add env vars: `DATABASE_URL`, `GEMINI_API_KEY`, `BETTER_AUTH_SECRET`

### Option 3: Docker Compose (Self-hosted)
```bash
./scripts/deploy.sh local
```

---

## 🗝️ Required GitHub Secrets

| Secret | Where to get it |
|--------|-----------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project Settings → Service Accounts → Generate private key |
| `DATABASE_URL` | Your MySQL provider (PlanetScale, AWS RDS, etc.) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

---

## 🌍 Final Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Firebase       │     │  Render/Railway │
│  Hosting        │     │  (API Server)   │
│  (Frontend)     │────▶│  (Node.js)      │
│  schooly.web.app│     │  port 3000      │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  MySQL DB    │
                        └──────────────┘
```
