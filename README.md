# Schooly

A school safety monitoring platform with a React/TypeScript frontend and a Python FastAPI backend.

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript 5** – UI layer
- **Vite** – dev server and build tool
- **Tailwind CSS** + **shadcn/ui** – styling and components
- **TanStack Query** – server state management
- **BetterAuth** – authentication (localStorage stub for local dev)

### Backend
- **Python FastAPI** – REST API (port 8000)
- **OpenCV / NumPy** – computer vision and analytics
- **Drizzle ORM** + **MySQL** – relational data (optional for local dev)

## 🚀 Running Locally

### Prerequisites
- Node.js 18 or higher and npm
- Python 3.11 or higher (pip is included with standard Python installations)

### 1. Frontend (React + Vite)

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev
```

> The frontend runs independently without any backend or database. Authentication uses a localStorage stub that accepts any credentials.

### 2. Backend (FastAPI) – optional

```bash
cd app

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies (requirements.txt is in the project root)
pip install -r ../requirements.txt

# Start the API server (http://localhost:8000)
uvicorn app.main:app --reload
```

### 3. Docker (frontend + backend together)

```bash
docker-compose up
# Frontend → http://localhost:80
# Backend  → http://localhost:8000
```

## 🌍 Environment Variables

Copy `env.example` to `.env` and adjust as needed:

```bash
cp env.example .env
```

No Firebase or external cloud credentials are required to run the app locally.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run test` | Run Vitest unit tests |
| `npm run lint` | ESLint code check |
| `npm run type-check` | TypeScript type check (no emit) |
| `npm run db:seed` | Seed academic demo data (requires MySQL – see [Authentication](#-authentication)) |

## 📁 Project Structure

```
schooly/
├── src/                    # React/TypeScript frontend
│   ├── components/         # UI components (shadcn/ui, monitoring, dashboard)
│   ├── pages/              # Page components (dashboard, auth, etc.)
│   ├── layouts/            # RootLayout, Dashboard, Website
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client, auth client
│   └── server/             # Express API handlers, Drizzle DB
├── app/                    # Python FastAPI backend
│   ├── api/v1/             # REST endpoints
│   ├── core/               # Config, runtime settings
│   ├── services/           # Business logic services
│   └── units/              # Modular intelligence units (unit_01–unit_15)
├── public/                 # Static assets
├── docker-compose.yml      # Docker setup (backend + frontend)
├── Dockerfile.frontend     # Nginx-based frontend image
└── env.example             # Example environment variables
```

## 🔒 Authentication

In local development the frontend uses a **localStorage-based auth stub** (`src/lib/auth/auth-client.tsx`) that accepts any email/password combination. No external service is needed.

For production the server-side uses **BetterAuth** with a MySQL/Drizzle adapter (`src/lib/auth/auth.ts`).

## 🧪 Testing

```bash
npm run test            # Run all unit tests
npm run test:coverage   # Generate coverage report
```

## 📦 Deployment

### Docker (recommended)

```bash
docker-compose up --build
```

### Manual

Build the frontend and serve it behind any static file server or reverse proxy pointing `/api` to the FastAPI backend on port 8000.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run lint` and `npm run test`
5. Submit a pull request

## 📄 License

MIT License
