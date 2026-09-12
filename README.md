# MindLink

> **A private, AI-assisted mental health triage system that helps individuals detect risk early and connects them to the right support — even without internet access.**

MindLink is a stigma-free mental health entry point built for a health hackathon. It uses AI-driven risk detection, cognitive mini-games, and a structured escalation pathway to identify early warning signs and guide users toward care — without diagnosing or replacing professionals.

---

## How It Works

```
User (USSD / Web)
        ↓
Daily Check-ins (mood, sleep, stress, energy, social)
+ Cognitive Game Signals (memory, attention, reaction time)
+ Behavioral Signals (missed check-ins, engagement gaps)
        ↓
AI Risk Detection Engine
        ↓
Risk Classification  🟢 Stable  🟡 At Risk  🔴 High Risk
        ↓
Guided Actions + Escalation to Support Network
```

---

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS v4      |
| State     | Redux Toolkit + redux-persist                    |
| Charts    | Recharts                                         |
| Animation | Framer Motion                                    |
| Backend   | Node.js, Express, TypeScript                     |
| Database  | PostgreSQL via Prisma ORM                        |
| AI Chat   | OpenAI SDK → OpenRouter (GPT-4o)                 |
| Auth      | JWT (7-day), bcrypt, invite-code role assignment |

---

## Project Structure

```
mindlink/
├── src/                        # React frontend
│   ├── components/
│   │   ├── chatagent/          # OpenRouter AI client + system prompt
│   │   ├── dashboard/          # Home, MoodCheckIn, WellbeingStatus, RiskAlertModal, etc.
│   │   ├── games/              # GuessWhat, Stroop, MemoryMatch game engines
│   │   ├── practitioner/       # Practitioner triage dashboard
│   │   └── support/            # Professional cards, scheduling modal
│   ├── pages/                  # Chat, Journal, Calendar, Support, Settings, etc.
│   ├── redux/                  # Store, auth/content/game slices
│   ├── types/                  # Shared TypeScript interfaces
│   └── utils/game/             # MMSE scoring, trend helpers, dashboard utils
│
└── server/                     # Express backend
    ├── src/
    │   ├── index.ts            # All API routes
    │   ├── prisma.ts           # Prisma client singleton
    │   └── services/
    │       └── triageEngine.ts # Risk scoring, trend detection, classification
    └── prisma/
        └── schema.prisma       # PostgreSQL schema
```

---

## AI Risk Detection Engine

The core of MindLink. Located in `server/src/services/triageEngine.ts`.

Every check-in triggers a multi-signal pipeline:

### 1. Daily Score (0–100)

Weighted combination of the five check-in inputs:

| Signal            | Weight | Notes                                 |
| ----------------- | ------ | ------------------------------------- |
| Mood              | 25%    | 1–5 scale                             |
| Stress            | 20%    | Inverted (high stress = lower score)  |
| Sleep             | 20%    | 1–5 scale                             |
| Energy            | 20%    | 1–5 scale                             |
| Social connection | 15%    | Binary: isolated (1) or connected (5) |

### 2. Trend Detection

Linear regression over the last 10 check-ins. A slope below −3 points/day is flagged as a declining trend.

### 3. Behavioral Signals

- **`daysSinceLastCheckin`** — gaps of 3+ days raise a flag; 5+ days with low score escalates to RED
- **`missedDaysInLastWeek`** — 4+ missed days in a 7-day window triggers a yellow flag

### 4. Cognitive Signals

Compared across the last 2 game sessions:

- Accuracy drop > 20% (and current accuracy < 60%) → cognitive penalty
- Duration increase > 1.5× previous → cognitive penalty

### 5. Calibration-Aware Confidence

| Check-ins | Confidence | Baseline checks               |
| --------- | ---------- | ----------------------------- |
| < 3       | LOW        | Disabled (not enough history) |
| 3–4       | MEDIUM     | Only extreme drops (>40 pts)  |
| ≥ 5       | HIGH       | Full checks                   |

This prevents false positives for new users.

### Risk Output

```typescript
{
  level: 'GREEN' | 'YELLOW' | 'RED',
  explanation: string,   // Human-readable, e.g. "consistent declining trend over 8 days"
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}
```

---

## Cognitive Games

Games act as **passive assessment tools**, not entertainment. Results feed directly into the risk engine.

| Game             | Measures                              | MMSE Formula                                                     |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------- |
| **Guess What**   | Visual memory, recall depth           | Log-weighted accuracy + response time, normalized to 0–30        |
| **Stroop**       | Executive function, cognitive control | 55% accuracy + 30% speed + 15% error penalty, normalized to 0–30 |
| **Memory Match** | Working memory (dashboard mini-game)  | Score + accuracy + mistakes stored to DB                         |

---

## Escalation Pathway

1. **In-app alert** — `RiskAlertModal` appears post-check-in for YELLOW/RED. Options: connect to counsellor, talk to AI, crisis helpline (RED only).
2. **AI Chatbot** — keyword-aware + risk-context responses. Escalates to human referral when RED + negative language detected.
3. **One-click support request** — creates an open `SupportRequest` record in the DB.
4. **Practitioner triage queue** — role-protected dashboard sorted by risk severity (RED → YELLOW → GREEN). Assign, review case history, resolve.
5. **Professional scheduling** — browse support network (real DB users + mock professionals), pick a time slot, generate a Meet link.

---

## Database Schema (key models)

| Model            | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `User`           | Auth, role (USER/PRACTITIONER/VOLUNTEER), emergency contact |
| `Checkin`        | 5-signal daily check-in, supports `source: "USSD" \| "WEB"` |
| `RiskScore`      | Engine output: level, score, explanation, confidence        |
| `GameSession`    | Game results: score, accuracy, duration, mistakes           |
| `ChatbotLog`     | Sentiment score, flagged keywords                           |
| `SupportRequest` | Status: OPEN → IN_PROGRESS → RESOLVED                       |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (frontend) / npm (server)

### 1. Frontend

```bash
# Install dependencies
pnpm install

# Set environment variable
echo "VITE_OPENROUTER_API_KEY=your_key_here" > .env

# Start dev server
pnpm dev
```

### 2. Backend

```bash
cd server

# Install dependencies
npm install

# Set environment variables
# Create server/.env with:
# DATABASE_URL=postgresql://...
# DIRECT_URL=postgresql://...
# JWT_SECRET=your_secret_here

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

The backend runs on **http://localhost:4000**.

### 4. Deploy to Render

The repository includes `render.yaml`, which provisions:

- `mindlink-api`: Express API
- `mindlink-web`: Vite static frontend with SPA routing
- `mindlink-db`: PostgreSQL database

To deploy:

1. Push the repository to GitHub or GitLab.
2. In Render, choose **New > Blueprint** and select the repository.
3. Apply the Blueprint. Render generates `JWT_SECRET` and connects both services to the managed database.
4. Open the `mindlink-web` URL after the deploy finishes.

The API URL used by the frontend is configured in `render.yaml` as `VITE_API_BASE_URL`. Update it if the API service name or URL is changed. Render databases start empty, so run the seed script separately only when demo data is needed.

### 5. Environment Variables

| Variable                  | Where           | Description                                             |
| ------------------------- | --------------- | ------------------------------------------------------- |
| `VITE_OPENROUTER_API_KEY` | Frontend `.env` | OpenRouter API key for AI chat                          |
| `VITE_SERVER_API_URL`     | Frontend `.env` | Triage server base URL (default: render.com deployment) |
| `DATABASE_URL`            | `server/.env`   | PostgreSQL connection string                            |
| `DIRECT_URL`              | `server/.env`   | Direct PostgreSQL URL (for Prisma migrations)           |
| `JWT_SECRET`              | `server/.env`   | JWT signing secret                                      |
| `PORT`                    | `server/.env`   | Server port (default: 4000)                             |

---

## User Roles

| Role           | Access                                     | How to set                                |
| -------------- | ------------------------------------------ | ----------------------------------------- |
| `USER`         | Dashboard, check-ins, games, chat, support | Default on registration                   |
| `PRACTITIONER` | + Triage queue, case assignment/resolution | Invite code: `MINDLINK-PRACTITIONER-2024` |
| `VOLUNTEER`    | + Triage queue (same as practitioner)      | Invite code: `MINDLINK-VOLUNTEER-2024`    |

---

## API Routes (Triage Server)

| Method | Path                        | Auth                         | Description                     |
| ------ | --------------------------- | ---------------------------- | ------------------------------- |
| GET    | `/health`                   | —                            | Health check                    |
| POST   | `/api/auth/register`        | —                            | Register user                   |
| POST   | `/api/auth/login`           | —                            | Login → JWT                     |
| PUT    | `/api/user/profile`         | JWT                          | Update profile                  |
| GET    | `/api/history/:userId`      | —                            | Last 10 check-ins               |
| POST   | `/api/checkins`             | —                            | Submit check-in → run triage    |
| POST   | `/api/games`                | —                            | Record game session             |
| GET    | `/api/games/:userId`        | —                            | Fetch game history              |
| GET    | `/api/professionals`        | —                            | List practitioners + volunteers |

# MindLink-Thesis
| POST   | `/api/chat`                 | —                            | Keyword-aware chatbot           |
| POST   | `/api/support`              | JWT                          | Submit support request          |
| GET    | `/api/practitioner/queue`   | JWT + PRACTITIONER/VOLUNTEER | Triage queue                    |
| POST   | `/api/practitioner/assign`  | JWT + PRACTITIONER/VOLUNTEER | Assign case                     |
| POST   | `/api/practitioner/resolve` | JWT + PRACTITIONER/VOLUNTEER | Resolve case                    |

---

## What MindLink Is Not

MindLink does **not** diagnose mental illness or replace therapists. It triages and guides — detecting early risk patterns and connecting users to appropriate human support.
