# AGENTS.md — Schooly (School Smart Eye)

> Agent-focused guide for the Schooly academic platform. This doc supplements `README.md` with conventions, file patterns, and rules agents must follow when modifying code.

---

## Project Overview

Schooly is a full-stack school management platform ("School Smart Eye") with:
- **Public website** (home, about, contact, features, AI assistant)
- **Dashboard** with 11 genius features:
  1. 🏆 Gamified Student Compass (points, badges, leaderboards)
  2. 🚨 AI Early Warning Radar (risk scoring)
  3. 📲 Parent Pulse Portal (real-time notifications)
  4. 🤖 AI Lesson Architect (Gemini-powered lesson planner)
  5. ⏰ Smart Timetable AI (constraint solver)
  6. 🧘 Mood Compass (daily wellbeing tracker)
  7. 🎙️ Voice First Attendance (speech recognition)
  8. 👥 PeerReview Hub (collaborative homework)
  9. 📦 Smart Inventory (resource management)
  10. 🔐 Blockchain-Verified Certificates (SHA-256 + QR)
  11. 🗺️ Campus AR Navigator (interactive SVG map)
- **Academic data model** (schools, campuses, years, terms, grades, sections, subjects, staff, students, enrollments, assessments, timetable, attendance)
- **Face recognition** (face-api.js descriptors, attendance logs)
- **Real-time monitoring** (live camera grid, alerts, analytics)

Built on the **V8 App Template** (Vite + React + TypeScript).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Build Tool | Vite 6 |
| Framework | React 19, TypeScript 5.7 |
| Router | React Router DOM 7 |
| Styling | Tailwind CSS 3.4, shadcn/ui |
| Animation | `motion` (Framer Motion successor) |
| State | Zustand, TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React, Heroicons |
| ORM | Drizzle ORM (MySQL2) |
| Auth | BetterAuth (server) + localStorage demo client |
| API | Express via `vite-plugin-api-routes` |
| Testing | Vitest 3, React Testing Library, jsdom |
| Lint | ESLint 9 (flat config) |

---

## Project Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui base components (40+)
│   │   ├── glass-card.tsx      # Glassmorphism card (new)
│   │   ├── animated-counter.tsx # Animated number counter (new)
│   │   ├── confetti.tsx        # Canvas confetti burst (new)
│   │   ├── progress-ring.tsx   # SVG donut progress (new)
│   │   ├── streak-badge.tsx    # 🔥 streak display (new)
│   │   ├── toast-provider.tsx  # Sonner wrapper (new)
│   │   └── mood-selector.tsx   # Emoji mood picker (new)
│   ├── layout/
│   │   └── BentoGrid.tsx       # Bento grid system (new)
│   ├── gamification/     # Gamification components (new)
│   │   ├── Leaderboard.tsx
│   │   ├── BadgeDisplay.tsx
│   │   └── PointsNotification.tsx
│   ├── dashboard/        # Dashboard-specific components
│   ├── monitoring/       # Monitoring dashboard panels
│   └── *.tsx             # Shared components
├── layouts/
│   ├── RootLayout.tsx    # App-wide wrapper
│   ├── Website.tsx       # Structural container
│   ├── Dashboard.tsx     # Dashboard shell
│   └── parts/            # Header, Footer
├── pages/
│   ├── index.tsx         # Homepage
│   ├── about.tsx
│   ├── contact.tsx
│   ├── ai-assistant.tsx
│   ├── verify-certificate.tsx  # Public cert verification (new)
│   ├── campus-map.tsx          # Interactive campus map (new)
│   ├── parent/
│   │   └── index.tsx           # Parent portal (new)
│   ├── auth/             # Auth pages
│   └── dashboard/        # Dashboard pages
│       ├── index.tsx           # Overview (redesigned)
│       ├── lesson-planner.tsx  # AI Lesson Architect (new)
│       ├── timetable.tsx       # Smart Timetable (new)
│       ├── mood.tsx            # Mood Compass (new)
│       ├── peer-review.tsx     # PeerReview Hub (new)
│       ├── inventory.tsx       # Smart Inventory (new)
│       └── ... (existing)
├── lib/
│   ├── utils.ts          # `cn()` helper
│   ├── api-client.ts     # Frontend API client
│   └── auth/             # Auth server + client configs
├── hooks/                # Custom React hooks
├── server/
│   ├── api/              # File-based API routes
│   │   ├── health/GET.ts
│   │   ├── ai/
│   │   │   ├── chat/POST.ts
│   │   │   ├── lesson-plan/POST.ts       # AI Lesson (new)
│   │   │   └── risk-assessment/POST.ts   # Risk Radar (new)
│   │   ├── gamification/                 # (new)
│   │   │   ├── points/POST.ts
│   │   │   ├── leaderboard/GET.ts
│   │   │   └── badges/GET.ts
│   │   ├── mood/                         # (new)
│   │   │   ├── POST.ts
│   │   │   └── analytics/GET.ts
│   │   ├── timetable/generate/POST.ts    # (new)
│   │   ├── peer-review/POST.ts           # (new)
│   │   ├── inventory/                    # (new)
│   │   │   ├── GET.ts
│   │   │   └── alerts/GET.ts
│   │   ├── certificates/                 # (new)
│   │   │   ├── generate/POST.ts
│   │   │   └── verify/GET.ts
│   │   └── ...
│   ├── db/
│   │   ├── schema.ts     # Drizzle schema (expanded with 11 features)
│   │   ├── client.ts     # DB connection
│   │   ├── config.ts     # Credential loader
│   │   └── seed-academic.ts
│   ├── auth-middleware.ts
│   └── configure.js      # Express server hooks
├── styles/
│   └── globals.css       # Tailwind + CSS vars (light/dark adaptive)
├── test/
│   └── setup.ts          # Vitest setup
├── App.tsx               # Router setup
├── routes.tsx            # Route definitions + typed paths
├── router.ts             # Typed Link/Navigate exports
└── main.tsx              # React root + QueryClient + ThemeProvider
```

---

## Design System (New)

### Adaptive Theme (Light / Dark / Auto)

- **Provider**: `src/components/ThemeProvider.tsx` — React context + localStorage persistence
- **Toggle**: `src/components/ThemeToggle.tsx` — sun/moon animated switch + segmented variant
- **Default**: `system` (reads `prefers-color-scheme`)
- **CSS vars**: Defined in `src/styles/globals.css` with `:root` (light) and `.dark` selectors
- **Tailwind**: `darkMode: ['class']` enabled

### Glassmorphism

```tsx
// Use GlassCard for all cards
import { GlassCard } from '@/components/ui/glass-card';

<GlassCard variant="default" glow shimmer>
  Content here
</GlassCard>
```

Variants: `default` | `strong` | `solid` | `gradient`

### Bento Grid

```tsx
import { BentoGrid, BentoItem } from '@/components/layout/BentoGrid';

<BentoGrid cols={4} gap="md">
  <BentoItem colSpan={2} rowSpan={1}>
    Wide content
  </BentoItem>
  <BentoItem colSpan={1}>
    Narrow content
  </BentoItem>
</BentoGrid>
```

### Key Conventions

- Path aliases: `@/*` → `./src/*`, `@/api/*` → `./src/server/api/*`
- Components: PascalCase files, default exports for pages, named for utilities
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- shadcn/ui components use `class-variance-authority` (CVA)

---

## API Routes (File-Based)

Using `vite-plugin-api-routes`:

```
src/server/api/dashboard/students/GET.ts     → GET /api/dashboard/students
src/server/api/dashboard/students/POST.ts    → POST /api/dashboard/students
src/server/api/ai/lesson-plan/POST.ts        → POST /api/ai/lesson-plan
```

Each file **default-exports** an Express handler.

---

## Database

- **Schema**: `src/server/db/schema.ts` — all Drizzle ORM table definitions
- **New tables** (11 features): `badgeDefinitions`, `studentBadges`, `studentPoints`, `riskAlerts`, `parentNotifications`, `moodLogs`, `peerReviews`, `inventoryItems`, `inventoryTransactions`, `certificates`
- **Client**: `src/server/db/client.ts` — mysql2 pool wrapped with Drizzle
- **Config**: `src/server/db/config.ts` — reads `/local/config.json`
- **Migrations**: `drizzle.config.ts` — MySQL dialect

**Important**: Schema file has `TREAT AS IMMUTABLE` header. Add new tables at the **end** only.

---

## Authentication

Two auth systems coexist:

1. **BetterAuth (server)** — `src/lib/auth/auth.ts`. Lazy singleton (`getAuth()`). Handles `/api/auth/*`.
2. **localStorage demo client** — `src/lib/auth/auth-client.tsx`. Quick demo access. Accepts any email/password.

Dashboard pages use `ProtectedRoute` which checks localStorage session.

---

## Theme

- **Adaptive**: Light / Dark / Auto toggle
- CSS variables for all colors: `--background`, `--foreground`, `--primary`, etc.
- **Gamification colors**: `--gold`, `--silver`, `--bronze`
- **Status colors**: `--safe`, `--warning`, `--critical`
- Fonts: `Space Grotesk` (headings), `Inter` (body)
- Border radius: `--radius: 0.75rem`

---

## Code Style Rules

### TypeScript

- Strict mode enabled (`noUnusedLocals: true`)
- Unused parameters prefixed with `_`
- Prefer `const` / `let`; never `var`

### ESLint (Flat Config)

- Config: `eslint.config.js`
- Key rules: `@typescript-eslint/no-unused-vars`: error (allows `_`), `prefer-const`: error

---

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest |
| `npm run lint` | ESLint check |
| `npm run type-check` | `tsc --noEmit` |
| `npm run db:seed` | Run academic DB seeder |
| `npm run format` | Prettier format |

---

## Environment Variables

Copy `env.example` to `.env`. Key vars:

| Variable | Purpose |
|----------|---------|
| `VITE_APP_NAME` | App title |
| `VITE_PUBLIC_URL` | Public URL |
| `NODE_ENV` | `development` / `production` |
| `AIRO_PREVIEW` | Cross-site cookie attributes |

DB credentials loaded from `/local/config.json` at runtime.

---

## Adding New Features

### New shadcn/ui Component

```bash
npx shadcn-ui@latest add <component-name>
```

### New API Endpoint

1. Create folder under `src/server/api/`
2. Add `GET.ts`, `POST.ts`, etc.
3. Default-export Express handler
4. Import `db` from `@/server/db/client.js`

### New Page

1. Create component in `src/pages/` or `src/pages/dashboard/`
2. Add route to `src/routes.tsx`
3. Update `Path` type
4. Wrap dashboard pages with `<ProtectedRoute>`

### New DB Table

1. Add table definition to end of `src/server/db/schema.ts`
2. Run `npx drizzle-kit generate`
3. Run `npx drizzle-kit push`

---

## Testing

- **Framework**: Vitest 3 with jsdom
- **Setup**: `src/test/setup.ts`
- **Pool**: forks (isolated per file, max 4 forks)

---

## Deployment Notes

- **Frontend**: Docker via `Dockerfile.frontend`, nginx
- **Backend**: Docker via `Dockerfile.backend`
- **Firebase**: Configured for hosting

---

## Common Gotchas

1. **DB config requires `/local/config.json`** — app crashes without it if DB is accessed
2. **Auth has two layers** — Dashboard UI uses `authClient` (localStorage). Server uses BetterAuth.
3. **Vite proxy** — Dev server proxies `/api` to `http://127.0.0.1:8000`
4. **Node 22+ required**
5. **Arabic UI** — Parts use Arabic text. Keep RTL context in mind.
6. **Schema immutability** — Add tables at end of `schema.ts`. Don't modify existing tables.
