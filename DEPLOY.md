# 🚀 Deploy School Smart Eye

## Quick Start (Docker — Recommended)

```bash
# Build & run everything
./scripts/deploy.sh local

# Or manually:
docker-compose up --build -d
```

Services:
- **Frontend (nginx)**: http://localhost
- **API (Node.js)**: http://localhost:3000/api/health
- **Backend (Python)**: http://localhost:8000/api/v1/health

---

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   nginx     │──────▶│  API Server │      │   Python    │
│  (port 80)  │      │  (port 3000)│      │  (port 8000)│
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       ▼                    ▼
  Static files         DB (MySQL)
  /api/* routes        /api/health
  SPA fallback         Students, Gamification
                       Auth, Reports, etc.
```

---

## Build Manually

### 1. Frontend Only

```bash
npm ci
npm run build
# Output: dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, Firebase Hosting, nginx).

### 2. API Server Only

```bash
npm ci
npm run build        # Build frontend (copied to dist/)
npm run build:server # Build API server (output: dist-server/)

# Run server
node dist-server/index.js
```

Environment variables:
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: 3000) |
| `DATABASE_URL` | Yes | MySQL connection string |
| `GEMINI_API_KEY` | No | For AI Lesson Planner |
| `BETTER_AUTH_SECRET` | No | For real auth |
| `NODE_ENV` | No | `production` or `development` |

### 3. Full Stack (Docker Compose)

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

---

## Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build
npm run build

# Deploy frontend only
firebase deploy --only hosting
```

> Note: API server must be deployed separately (Cloud Run, Render, Railway, etc.)

---

## Deploy API to Cloud Run (GCP)

```bash
# Build & push image
gcloud builds submit --tag gcr.io/PROJECT_ID/schooly-api

# Deploy
gcloud run deploy schooly-api \
  --image gcr.io/PROJECT_ID/schooly-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=mysql://...,GEMINI_API_KEY=...
```

---

## CI/CD (GitHub Actions)

Already configured in `.github/workflows/deploy.yml`:
- Runs on push to `main`
- Builds frontend + server
- Runs type-check and lint
- Builds Docker images
- Tests API health endpoint

---

## Database Migrations

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# Seed data
npm run db:seed
```

---

## Health Checks

| Service | Endpoint |
|---------|----------|
| API (Node) | `GET /api/health` |
| Backend (Python) | `GET /api/v1/health` |

---

## Troubleshooting

### "Cannot find module" errors
Run `npm run build:server` to compile TypeScript API routes to JavaScript.

### Database connection failed
Ensure `/local/config.json` exists with valid MySQL credentials, or set `DATABASE_URL` env var.

### CORS errors
The API server allows all origins by default. In production, update the CORS settings in `src/server/index.js`.

### Port already in use
Change the port in `docker-compose.yml` or set `PORT` env var.
