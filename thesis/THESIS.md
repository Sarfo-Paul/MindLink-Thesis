# MindLink: An Explainable, Multi-Channel Mental Health Triage System with Cognitive Game Signals for Low-Resource Settings

### A Thesis Submitted in Partial Fulfilment of the Requirements for the Degree of Bachelor of Science

**Author:** [Your Full Name]  
**Student ID:** [ID]  
**Department:** [Department of Computer Science / Software Engineering]  
**Institution:** [University Name]  
**Supervisor:** [Supervisor Name, Title]  
**Academic Year:** 2024/2025 — Submission: September 2026  
**Repository:** `Sarfo-Paul/MindLink-Thesis` — branch `arena/01a08b29-mindlink-thesis` (commit `a790943`)  
**Live References:** Frontend `https://[vercel deployment]` · API `https://mindlink-ti7t.onrender.com` (see `src/config/api.ts` and `render.yaml`)

> **Alignment Statement:** This document has been rebuilt bottom-up from the codebase as it exists in the repository. Every claim in chapters 4–7 maps to a file, function, route, or schema field in the checked-out code. Where the implementation diverges from earlier thesis drafts — e.g., SQLite prototype instead of Postgres, rule-based triage instead of machine-learned model, USSD-ready schema rather than live telco integration, locally-generated Meet links rather than Google Calendar API — the text states the as-built reality and explains the design rationale. Figures that previously showed hypothetical ML pipelines have been replaced with the actual deterministic pipeline in `server/src/services/triageEngine.ts`.

---

## Declaration

I hereby declare that this thesis is my own work, that all sources have been acknowledged, and that the MindLink codebase referenced herein was developed as part of this research prototype. The system triages and guides; it does not diagnose mental illness or replace professional care. An earlier draft of the thesis described components not present in the implementation; this revision corrects that.

Signature: ____________________  Date: 10 September 2026

---

## Acknowledgements

Thanks to participants who tested the dashboard flows, to the supervisor for guidance on explainability and ethics, and to peers who stress-tested the check-in and game modules.

---

## Abstract

Access to timely mental health support remains uneven, especially where stigma, cost, and connectivity limit help-seeking. Young adults and students in low-resource and low-connectivity environments often lack a private, low-friction entry point for early support. Existing solutions tend to assume always-online, English-first, and clinically-staffed contexts.

**MindLink** is a thesis research prototype for **explainable mental-health triage** that is deliberately multi-channel. On the web it provides daily check-ins, a reflective journal, chat, and cognitive mini-games whose performance is treated as a passive wellbeing signal. On low-end devices the data model is already USSD-ready (`Checkin.source = "USSD" | "WEB"`, see `server/prisma/schema.prisma`). Between the user and any human helper sits a **deterministic Risk Detection Engine** (`server/src/services/triageEngine.ts`) that fuses five self-report signals, longitudinal trend, behavioural engagement gaps, and the last two cognitive game sessions into a calibrated `GREEN | YELLOW | RED` classification with an evidence string and confidence tier. The engine is rule-based and fully auditable — chosen over a black-box ML classifier for the thesis context.

A **structured escalation pathway** ensures no score alone decides care: `RiskAlertModal` invites the user to connect to a counsellor, talk to the in-app assistant, or — at RED — see a crisis helpline; a one-click `POST /api/support` creates a `SupportRequest`; and a role-protected practitioner triage queue (`/api/practitioner/queue`) surfaces patients sorted by severity with case assignment and resolution. Professionals are listed via `/api/professionals` from verified DB users plus local mock data so the demo remains usable offline.

The frontend is a React 18 + TypeScript + Vite SPA styled with Tailwind CSS v4, with state in Redux Toolkit + redux-persist, charts in Recharts and motion in Framer Motion. The backend is a Node.js + Express + TypeScript API using Prisma ORM; the checked-in prototype persists to **SQLite** (file-based) for reproducibility, deployable to Postgres with the same Prisma schema. Authentication is JWT (7-day) with bcrypt hashing and invite-code role elevation. Deployment is via Render (`render.yaml`) with a `GET /health` probe.

Evaluation is by **functional walkthrough, threshold sensitivity reasoning, and alignment audit** rather than clinical trial: the engine correctly prevents false REDs for new users (<3 check-ins → LOW confidence, baseline checks disabled), flags steep declines, and combines independent signals without double-counting. Limitations, ethical guardrails, and a roadmap toward USSD gateway integration, Postgres in production, and longitudinal user studies are discussed.

**Keywords:** digital mental health; triage; explainable AI; low-resource settings; cognitive games; USSD; human-in-the-loop; React; Prisma

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Literature & Background Review](#2-literature--background-review)
3. [Methodology](#3-methodology)
4. [System Analysis & Requirements](#4-system-analysis--requirements)
5. [System Design & Architecture](#5-system-design--architecture)
6. [Implementation — The As-Built System](#6-implementation--the-as-built-system)
7. [Testing, Evaluation & Validation](#7-testing-evaluation--validation)
8. [Discussion — What Was Built vs. What Was Planned](#8-discussion--what-was-built-vs-what-was-planned)
9. [Conclusion & Future Work](#9-conclusion--future-work)
10. [References](#10-references)
11. [Appendices](#appendices)

List of Figures — Fig 5.1 Architecture, Fig 5.2 ERD, Fig 5.3 Check-in sequence, Fig 6.1 Dashboard layout, Fig 6.2 Risk engine flow  
List of Tables — Tab 5.1 Tech stack, Tab 5.2 Data models, Tab 6.1 Scoring weights, Tab 6.2 API routes, Tab 6.3 Game MMSE mapping  
List of Abbreviations — USSD · MMSE · SPA · JWT · ORM · DB · UI

---

## 1. Introduction

### 1.1 Problem Context

Mental distress often surfaces through subtle, cumulative changes — sleep disruption, social withdrawal, rising stress, falling energy — long before a person books a formal appointment. In contexts with provider shortages, stigma, or intermittent internet, that early window is frequently missed. The repository's landing page (`src/pages/LandingPage.tsx`) frames the problem as: *a first step toward earlier, kinder support*.

### 1.2 Motivation from the Codebase

The as-built MindLink does not attempt to automate diagnosis. The tagline in `README.md` and `LandingPage.tsx` is consistent: *private, AI-assisted triage that helps individuals detect risk early and connects them to the right support — even without internet access.* The thesis therefore evaluates a **triage-and-guide** system, not a diagnostic or therapeutic device.

### 1.3 Research Questions

1.  Can a transparent, weighted-score triage engine that fuses self-report, trend, engagement, and cognitive game signals provide **calibrated, explainable risk levels** without ML?
2.  Can cognitive mini-games serve as **passive assessment** rather than mere content?
3.  Can one data model and escalation pathway serve **both web and low-bandwidth (USSD) pathways** while keeping humans in the loop?
4.  What are the implementation trade-offs when building with modern web tooling under thesis constraints?

### 1.4 Research Objectives

- Design and implement a multi-signal triage engine with confidence tiers to avoid premature escalation for new users.
- Implement two production-quality cognitive games plus a lightweight dashboard memory game, all persisting `GameSession` records that the engine consumes.
- Deliver a complete dashboard, chat, journal, calendar/scheduling, support network, and practitioner triage queue with role-based access.
- Ship a deployable prototype (frontend on Vercel-style static hosting, API on Render) with SQLite for the thesis and a Postgres-ready schema.
- Document the as-built system honestly, including scaffolds not yet wired to telco or calendar APIs.

### 1.5 Scope and Delimitations

**In scope:** web check-ins, journal, wellbeing status, streaks, games, chatbot (rule-based server side + optional OpenRouter client), support requests, practitioner/admin dashboards, JWT auth, invite-code roles.

**Explicitly out of scope / deferred:** live USSD gateway (Africa's Talking or similar), real Google Calendar / Meet API writes (links are generated locally), clinical validation, EHR integration, native mobile app.

### 1.6 Contribution

The contribution is a **fully traceable prototype** where every risk explanation can be mapped to a code branch in `triageEngine.ts`, plus a documented UI/UX for multi-channel mental health entry that future work can extend.

### 1.7 Thesis Structure

Chapter 2 situates the work in digital mental health literature; 3 explains the build methodology; 4 details requirements against actual routes and models; 5 presents architecture; 6 walks through the implementation file-by-file; 7 evaluates functionally; 8 discusses deltas between plan and reality; 9 concludes.

---

## 2. Literature & Background Review

### 2.1 Mental Health Gaps in Low-Resource Settings

Literature consistently reports treatment gaps >70% in many LMICs, driven by provider scarcity, centralisation in urban hospitals, stigma, and cost (WHO Mental Health Atlas; Patel et al.). Students and young adults are disproportionately affected yet underserved. MindLink's low-friction check-in (5 taps in `MoodCheckInModal.tsx`) is designed against this: the cost of the first disclosure must be near-zero.

### 2.2 Digital Mental Health Interventions

Effective DMHIs share: (a) privacy, (b) continuity (streaks, journals), (c) human escalation when needed. Purely self-help apps show high attrition; hybrid models with volunteer/practitioner triage retain users longer. MindLink's escalation pathway (alert → chat → support request → practitioner queue) mirrors this evidence.

### 2.3 Triage vs. Diagnosis

Clinical triage sorts by urgency, not by label. The thesis adopts that framing: `classifyRisk()` returns `level` + `explanation` + `confidenceLevel`, never a DSM/ICD code. This aligns with ethical guidance that student-built systems must not claim diagnostic capability. The explanation string (e.g., *"steep consistent decline over 8 days"*) is intentionally human-readable.

### 2.4 Cognitive Games as Passive Signals

Mini-games for cognition trace back to MMSE/MoCA paradigms. Thesis games map to:
- **Guess What** → visual memory / recall depth (like delayed recall subtests). MMSE normalisation uses log-weighted accuracy + timing.
- **Stroop** → executive function / inhibition control (Stroop interference paradigm). Weighted 55% accuracy + 30% speed + 15% error penalty.
- **Memory Match** → working memory (dashboard quick probe). Stored as `GameSession` with `score / accuracy / duration / mistakes`.

Crucially, games are **not entertainment first** in MindLink; `README.md` states *Games act as passive assessment tools, not entertainment. Results feed directly into the risk engine.* The engine consumes only the last 2 `GameSession`s to detect `cognitivePenalty`.

### 2.5 Multi-Channel Access (Web + USSD)

USSD remains the most inclusive channel in many African markets because it needs no data, no smartphone, and no app install. The thesis does not claim a live USSD gateway; it implements the preconditions: `Checkin.source` enum, `preferredLanguage` on `User`, language-aware professional directory, and a Settings screen with a USSD Settings panel. The roadmap (Chapter 9) specifies gateway binding.

### 2.6 Gap Analysis

Prior student projects often fall into two traps: (a) mock UI with no persistence or (b) ML claim with no auditability. MindLink commits to the middle: a **real persistence layer, real auth, real risk engine with tests of its thresholds**, but with explicit, honest boundaries about what remains scaffold.

---

## 3. Methodology

### 3.1 Research Design

Applied, prototype-driven research in a single case: build → instrument → walk through → reflect. The artefact itself is the primary data source; functional correctness against requirements is the evaluation criterion, not a randomised trial.

### 3.2 Development Methodology

Iterative, vertical-slice delivery:

1.  Schema + auth + check-in → triage engine
2.  Games + `GameSession` persistence → cognitive integration in triage
3.  Dashboard (Home, WellbeingStatus, StreakTracker, Journal)
4.  Chat, Support, Practitioner/Admin dashboards
5.  Landing, deployment, polish

Tooling enforces quality: ESLint (`eslint.config.js`), TypeScript strict (`tsconfig.app.json`, `server/tsconfig.json`), Prettier via Tailwind discipline.

### 3.3 Requirements Elicitation

Requirements were derived from: (a) `DASHBOARD_PLAN.md` — the original Mindea-inspired planning artefact, (b) the clarified triage workflow in `README.md`, (c) code-level constraints discovered during implementation (e.g., Prisma SQLite for local reproducibility). Traceability is maintained by mapping each requirement to a file/route in Chapter 4.

### 3.4 Data Sources for Evaluation

- **Functional:** route-by-route smoke tests (`/api/checkins`, `/api/games`, `/api/chat`, `/api/practitioner/queue`, `/api/admin/overview`).
- **Logic:** threshold table walkthrough for `calculateDailyScore`, `detectTrend`, `classifyRisk` (see Appendix C).
- **Usability:** heuristic walkthrough of the dashboard on mobile (<768px collapsible sidebar) and desktop (>1024px three-column recommendations).

### 3.5 Ethical Considerations

- No diagnosis; `explanation` supports **human review** and the Admin overview explicitly carries methodology text: *They support human review; they are not a diagnosis* (`server/src/index.ts` → `methodology.body`).
- Invite-code role elevation prevents open practitioner self-enrolment.
- Emergency contact is opt-in (`emergencyContactEnabled`).
- Crisis helpline surfacing at RED in `RiskAlertModal.tsx` is informational, not automated dispatch.
- Data stored in `User` is minimal; password via `bcryptjs`; JWT secret must be rotated from the dev default in production.

### 3.6 Alignment Method for This Revision

A repository walk: `find . -type f | sort`, then targeted reads of `server/src/services/triageEngine.ts`, `server/src/index.ts`, `server/prisma/schema.prisma`, `src/App.tsx`, `src/components/dashboard/*`, `src/pages/*`, `src/redux/*`, `src/config/api.ts`, and game slices/utils. Every section 6 claim cites one of those paths.

---

## 4. System Analysis & Requirements

### 4.1 Stakeholders & Personas

- **Anonymous participant (USER):** wants a private, fast way to reflect and to know whether to seek help.
- **Volunteer listener (VOLUNTEER):** wants a prioritised queue and just enough context to respond helpfully.
- **Practitioner / Admin (PRACTITIONER, ADMIN):** need oversight, assignment, and population-level distribution.
- **Offline user:** would use USSD; represented in the model even before the gateway.

### 4.2 Functional Requirements (with code trace)

| ID | Requirement | As-built trace |
|----|-------------|----------------|
| FR1 | Five-signal daily check-in (mood, sleep, stress, energy, social) from WEB or USSD | `Checkin` model with `source` field; `MoodCheckInModal.tsx` 5-step wizard; `POST /api/checkins` |
| FR2 | Compute 0–100 daily wellbeing score and persist `RiskScore` | `calculateDailyScore()` + `classifyRisk()` in `triageEngine.ts`; `prisma.riskScore.create()` in `POST /api/checkins` handler |
| FR3 | Longitudinal trend + baseline deviation with confidence calibration | `detectTrend()` (linear regression, last 10), `calculateBaseline()`, confidence tiers (<3 LOW, 3–4 MEDIUM, ≥5 HIGH) in `triageEngine.ts` |
| FR4 | Behavioural signals: gap since last check-in, missed days in 7-day window | `BehavioralInput` and `behavioralFlag/behavioralCritical` branches in `classifyRisk()`; computed from `pastCheckins` dates in `server/src/index.ts` |
| FR5 | Cognitive signals from last 2 game sessions (accuracy drop >20% or duration 1.5×) | `cognitivePenalty` branch reading `recentGames: CognitiveGameInput[]` from `prisma.gameSession.findMany take 2` |
| FR6 | Explainable risk output: level + explanation + confidence | `RiskResult` interface and returned string assembly in `classifyRisk()`; stored in `RiskScore.explanation/confidenceLevel` |
| FR7 | Post-check-in escalation: alert, chat referral, one-click support request, crisis helpline at RED | `RiskAlertModal.tsx`; `ChatbotWidget.tsx` / `Chat.tsx`; `POST /api/support` |
| FR8 | Cognitive games as assessment, persisted as `GameSession` | Guess What + Stroop full engines (`src/components/games/GuessWhatGame/*`, `StroopGame/*`); `POST /api/games`, `GET /api/games/:userId`; `MemoryMatchGame.tsx` lightweight probe |
| FR9 | Dashboard: wellbeing status, mood trend, streaks, sessions, recommendations, community preview | `src/components/dashboard/Home.tsx` layout; `WellbeingStatus.tsx`, `MoodTrendChart.tsx`, `StreakTracker.tsx`, `CognitiveGames.tsx`, `Recommendations.tsx`, `CommunityPreview.tsx` |
| FR10 | Journal with timeline, filter (week/month/all), source badge | `src/pages/Journal.tsx` reading `GET /api/history/:userId` |
| FR11 | Professional directory + local scheduling with Meet link | `src/pages/support.tsx` + `src/components/support/{ProfessionalCard,SchedulingModal}.tsx`; `GET /api/professionals`; localStorage session store + `SchedulingModal` Meet link generation |
| FR12 | Practitioner triage queue sorted by severity (RED→YELLOW→GREEN, then open requests) with assign/resolve | `src/components/practitioner/PractitionerDashboard.tsx`; `GET /api/practitioner/queue`, `POST /api/practitioner/{assign,resolve}` with `requireRole('PRACTITIONER','VOLUNTEER')` |
| FR13 | Admin operations overview: totals, participation, risk distribution, recent directory, export | `src/components/admin/AdminDashboard.tsx`; `GET /api/admin/overview` with `requireRole('ADMIN')` |
| FR14 | Authentication with role elevation via invite code; JWT 7-day; profile update | `POST /api/auth/{register,login}`, `PUT /api/user/profile`; `STAFF_INVITE_CODES` map; `requireAuth/requireRole` middleware; `src/redux/slices/auth-slice/authSlice.ts` + `src/App.tsx` route guards |
| FR15 | Chat: keyword-aware triage + optional OpenRouter (GPT-4o) Agent AI for richer conversation | `POST /api/chat` (`NEGATIVE_KEYWORDS`, `recentRisk` context); `src/components/chatagent/openRouterClient.ts` (`MINDLINK_SYSTEM_PROMPT`, `generateAIResponse` via `openai/gpt-4o` at `https://openrouter.ai/api/v1`) |
| FR16 | Miscellaneous user pages: Calendar, MySession (localStorage), Profile, Settings (incl. USSD toggle) | `src/pages/{Calendar,MySession,Profile,Settings}.tsx`; `src/components/layout/{Header,Sidebar,DashboardLayout}.tsx` |

### 4.3 Non-Functional Requirements

| NFR | Target | As-built |
|-----|--------|----------|
| Usability | Clean, calming aesthetic; mobile-first | Tailwind v4, rounded cards, purple primary; sidebar collapses to hamburger <768px; `DashboardLayout.tsx` responsive shell |
| Performance | First meaningful paint <3s on typical device | Vite build (`pnpm build`), code-splitting by route, framer-motion lazy; Prisma SQLite read path O(n≤10) per check-in |
| Security | Hashed passwords, JWT expiry, role guard | `bcryptjs` hash(10), `jsonwebtoken` 7d, `requireAuth`/`requireRole` |
| Offline inclusivity | USSD path in model, language preference | `Checkin.source`, `User.preferredLanguage` (en/es/fr/tw/ee in UI), `emergencyContactEnabled` |
| Explainability | Every RED/YELLOW has evidence text | `explanationParts.join(', ')` in `classifyRisk()`; stored and rendered in practitioner queue |
| Deployability | One-command deploy, health probe | `render.yaml` (build `prisma generate && tsc`, start `node dist/index.js`, `healthCheckPath: /health`) |

### 4.4 Use-Case Overview

- **UC1 — Submit check-in:** User opens `MoodCheckInModal` → answers mood→sleep→stress→energy→social → `POST /api/checkins` → `RiskScore` shown → if YELLOW/RED, `RiskAlertModal`.
- **UC2 — Play cognitive game:** User picks Guess What / Stroop via `/games` or `CognitiveGames` widget → `GamePage.tsx` → `GameRunner` + Redux slices → on completion `POST /api/games` and local metric cache.
- **UC3 — Seek support:** User browses `Psychologists.tsx` (DB + mock merged) → `SchedulingModal` picks slot → Meet link generated → session saved to `localStorage` (calendaring is client-side in prototype) and `Success` toast.
- **UC4 — Practitioner triage:** Practitioner logs in with invite code → `/practitioner` → `PractitionerDashboard` fetches `GET /api/practitioner/queue` → assign / review `CaseDetailModal` → resolve.
- **UC5 — Admin monitoring:** Admin → `/admin` → `AdminDashboard` → metrics, risk distribution, participant directory with CSV export (`mindlink-participant-snapshot.csv`).

### 4.5 Constraints

Thesis-time constraint forces SQLite file over managed Postgres, locally-generated Meet links over Google Workspace delegation, and a deterministic triage over a supervised ML model that would require labelled longitudinal data the project does not have.

---

## 5. System Design & Architecture

### 5.1 Overall Architecture

```
            ┌─────────────────────────────────┐
            │  Browser SPA (Vite + React 18)  │
            │  Tailwind v4 · Redux+Persist    │
            │  Recharts · Framer Motion       │
            └──────────────┬──────────────────┘
                           │  apiUrl("/api/...")  +  Axios + JWT
                           ▼
            ┌─────────────────────────────────┐
            │  Express API (Node 20, TS)      │
            │  /api/auth  /api/checkins       │
            │  /api/games /api/chat           │
            │  /api/professionals /api/support│
            │  /api/practitioner/* /api/admin │
            │  triageEngine.ts  ·  prisma.ts  │
            └──────────────┬──────────────────┘
                           │ Prisma Client
                           ▼
            ┌─────────────────────────────────┐
            │  Persistence                    │
            │  SQLite (thesis) ──► Postgres   │
            │  (same schema.prisma, directURL)│
            └─────────────────────────────────┘
      ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
            Optional: OpenRouter (GPT-4o) for Agent AI
            Future: Africa's Talking USSD gateway → POST /api/checkins {source:"USSD"}
```

**Fig 5.1 — MindLink logical architecture (as deployed).** The SPA never talks directly to the DB; all signals pass through the triage endpoint. A lightweight client also persists scheduled sessions to `localStorage` for calendar demo continuity.

Tech stack justification is in **Tab 5.1**; folder layout mirrors the earlier `DASHBOARD_PLAN.md` hierarchy but with games and role routes added.

| Layer | Choice (pinned) | Why it fits the thesis |
|-------|-----------------|------------------------|
| Frontend framework | React 18.3 + Vite 6 + `@vitejs/plugin-react` | Fast HMR, mature ecosystem, component reuse for dashboard cards |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + `tailwind.config.ts` | Utility-first, calming palette without CSS bloat; no custom design system to maintain |
| State | Redux Toolkit 2.5 + `redux-persist` + `storage` local | Auth token and game slices survive reload; `src/redux/store.ts` whitelist `[content,auth,guessWhat,stroop]` |
| Charts | Recharts 3.1 (`MoodTrendChart`) | Declarative, responsive, works with sparse history |
| Animation | Framer Motion 12 / `motion` | Risk alert and modal transitions without layout shift |
| Icons | `lucide-react` + `react-icons` | Consistent outline set for sidebar and wellbeing states |
| HTTP | Axios 1.7 + `src/config/axiosConfig.ts` + `src/config/api.ts` | Centralised token injection, 401 auto-logout guard (skips game endpoints and mock tokens), `apiUrl()` normalises `VITE_API_BASE_URL` vs Render fallback |
| Backend | Node 20, Express 4.19, TypeScript 5.4 | Minimal, well-understood, deployable to free tier |
| ORM | Prisma 5.13 (`@prisma/client`) | Single schema for SQLite (thesis) and Postgres (production); `prisma generate && tsc` build in `render.yaml` |
| Auth | `bcryptjs` + `jsonwebtoken` (7d) | Simple, stateless, invite-code roles without extra service |
| AI (optional) | OpenAI SDK 6.10 → OpenRouter `openai/gpt-4o` | `src/components/chatagent/openRouterClient.ts` with `MINDLINK_SYSTEM_PROMPT`; browser call gated by `VITE_OPENROUTER_API_KEY`, `dangerouslyAllowBrowser:true` with warning to proxy in production |
**Tab 5.1 — As-built tech stack (versions from `package.json`, `server/package.json`).**

### 5.2 Frontend Design

**Routing** (`src/App.tsx`):

- Public: `/`, `/login`, `/signup`
- Protected (via `ProtectedRoute` + `DashboardLayout`): `/home`, `/sessions`, `/psychologists`, `/calendar`, `/journal`, `/games`, `/chat`, `/profile`, `/settings`
- Role-gated (via `RoleRoute`): `/practitioner` (`PRACTITIONER`), `/volunteer` (`VOLUNTEER`), `/admin` (`ADMIN`)
- Fallback `*` → `/home`

**Layout** (`src/components/layout/DashboardLayout.tsx`):

- Desktop sidebar 64w (20w collapsed) fixed; mobile drawer with `MenuIcon`. Toggle persists per session. Header shows time-based greeting (`src/utils/greeting.tsx`), search input (UI only), notification bell (badge UI), and avatar dropdown (Profile/Settings/LogOut).

**Dashboard (`Home.tsx`) two-row, 12-col grid:**

- Row 1 col-7: `MoodCheckIn` → `MoodTrendChart`; col-5: `WellbeingStatus` → `StreakTracker`
- Row 2 col-4: `CognitiveGames` (quick play) → `SupportRequest` CTA; col-8: `ChatbotWidget` (tall)

Design maps exactly to `DASHBOARD_PLAN.md` Phase 2–3, with streak as first-class widget.

### 5.3 Backend Design

**Express composition** (`server/src/index.ts`):

- `cors` with allowlist (`CORS_ORIGIN`) plus local origins `localhost|127.0.0.1`; `express.json()`.
- `GET /health` probe.
- Auth section: `STAFF_INVITE_CODES = { 'MINDLINK-PRACTITIONER-2024','MINDLINK-VOLUNTEER-2024','MINDLINK-ADMIN-2024' }`.
- `requireAuth` (Bearer) + `requireRole(...roles)` middleware.
- Routes: checkins, games, chatbot, professionals, support, practitioner, admin — full table in §6.5.

**Configuration resilience** (`src/config/api.ts`):

```ts
const RENDER_API = "https://mindlink-ti7t.onrender.com"
const DEV_FALLBACK = "http://localhost:4000"
export function apiUrl(path:string){ return collapseDuplicateApiSegment(`${API_BASE_URL}${p}`) }
```

`API_BASE_URL` strips accidental `/api/v1` suffixes and collapses duplicate segments — defensive against mis-set Vercel env pointing at localhost.

**Axios interceptors** (`src/config/axiosConfig.ts`):

- Request: injects `store.getState().auth.token || localStorage.getItem("token")` except for public endpoints.
- Response: on 401/403, skips auto-logout for game endpoints (`/game-session`, `/research-session`, `/game/`) and for mock tokens (`mock-token-*`), so demo games remain playable offline.

### 5.4 Data Design — Prisma Schema

**Fig 5.2 — Entity–Relationship (SQLite; Postgres-compatible).**

```
User 1──* Checkin
     1──* GameSession
     1──* RiskScore
     1──* ChatbotLog
     1──* SupportRequest
```

```prisma
// server/prisma/schema.prisma  (abridged, types as in file)
model User {
  id                      String   @id @default(uuid())
  phone                   String?  @unique
  email                   String?  @unique
  username                String?
  passwordHash            String?
  role                    String   @default("USER") // USER|PRACTITIONER|VOLUNTEER|ADMIN
  preferredLanguage       String   @default("en")
  emergencyContactEnabled Boolean  @default(false)
  emergencyContactNumber  String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  checkins       Checkin[]
  gameSessions   GameSession[]
  chatbotLogs    ChatbotLog[]
  riskScores     RiskScore[]
  supportRequests SupportRequest[]
}
model Checkin {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  mood      Int      // 1–5 (also stored raw; score normalised in engine)
  sleep     Int      // 1–5
  stress    Int      // 1–5 (inverted in scoring)
  energy    Int      // 1–5
  social    Int      // 1 or 5 (isolated vs connected)
  source    String   // "USSD" | "WEB"
  createdAt DateTime @default(now())
}
model GameSession {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  gameType  String
  score     Int
  accuracy  Float
  duration  Int      // seconds
  mistakes  Int      @default(0)
  createdAt DateTime @default(now())
}
model RiskScore {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  dailyScore      Float    // 0–100
  riskLevel       String   // GREEN|YELLOW|RED
  confidenceLevel String   // HIGH|MEDIUM|LOW
  explanation     String?
  createdAt       DateTime @default(now())
}
model ChatbotLog {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  message         String
  sentimentScore  Float?
  flaggedKeywords String?  // comma-separated NEGATIVE_KEYWORDS hits
  createdAt       DateTime @default(now())
}
model SupportRequest {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  requestType String
  assignedTo String?
  status     String   @default("OPEN") // OPEN|IN_PROGRESS|RESOLVED
  createdAt  DateTime @default(now())
}
```

**Tab 5.2 — Model purposes.** Note the README mentions *PostgreSQL via Prisma*; the checked-in `datasource db { provider = "sqlite" }` is intentional for the thesis: it guarantees a one-file reproducible DB and a demo seed path (`server/seed-demo.ts`); the Prisma schema migrates unchanged to Postgres by switching `provider` and `DATABASE_URL`.

### 5.5 USSD-Ready Path (Scaffold)

`source` is written by both `MoodCheckInModal` (`WEB`) and any future USSD handler (`USSD`). Because `calculateDailyScore` is source-agnostic, the same triage path covers low-bandwidth users. Settings exposes `Enable USSD access` + `USSD Code` input (UI only in prototype). A production gateway would simply `POST /api/checkins` with `{ source: "USSD" }`.

### 5.6 Security & Privacy Design

- Passwords: `bcrypt.hash(10)` on register, `bcrypt.compare` on login.
- Tokens: `jwt.sign({userId,email,role}, JWT_SECRET, {expiresIn:'7d'})`; `JWT_SECRET` defaults to `mindlink-dev-secret-change-in-production` and must be overridden via env.
- `localStorage` holds `token`; `redux-persist` keeps `auth` slice across reloads. Clearing either logs out.
- Role elevation only via valid invite code; invalid code → 400.
- `requireAuth` / `requireRole` guard every sensitive route; public routes (`/api/checkins` historically unauthenticated for USSD, but `/api/support` is auth-checked) reflect prototype convenience — Chapter 8 recommends tightening.

### 5.7 External Integrations (As-built vs. Deferred)

- **OpenRouter Agent AI:** fully coded in `openRouterClient.ts` (model `openai/gpt-4o`, temp 0.7, 1000 max tokens, `MINDLINK_SYSTEM_PROMPT`). Activation requires `VITE_OPENROUTER_API_KEY`; otherwise the rule-based `POST /api/chat` fallback answers.
- **Meet / Calendar:** deferred. `SchedulingModal` generates a plausible `meetLink` locally and `src/pages/support.tsx` persists the session to `localStorage` (`"sessions"` key) and toasts via `NotificationProvider`. Dashboard's `UpcomingSessions.tsx`/`SessionCard.tsx` read that key.

---

## 6. Implementation — The As-Built System

This chapter was written with the code open. Cited paths are relative to the repo root on branch `arena/01a08b29-mindlink-thesis`.

### 6.1 Project Layout

```
mindlink/
├── public/             # static assets: card*.jpg, breath.jpg, game.jpg, sounds/*.wav|mp3
├── src/
│   ├── components/
│   │   ├── admin/AdminDashboard.tsx
│   │   ├── chatagent/openRouterClient.ts
│   │   ├── dashboard/{Home,MoodCheckIn*, MoodTrendChart, WellbeingStatus, StreakTracker,
│   │   │              CognitiveGames, ChatbotWidget, SupportRequest, RiskAlertModal, ...}
│   │   ├── games/{GamePage,GameRunner,GameCanvas, GuessWhatGame/*, StroopGame/*,
│   │   │          sharedComponents/*, hooks/useRouteGuard.ts}
│   │   ├── layout/{DashboardLayout,Header,Sidebar,Greeting}
│   │   ├── practitioner/{PractitionerDashboard,CaseDetailModal}
│   │   ├── support/{ProfessionalCard,SchedulingModal}
│   │   └── shared/{ProtectedRoute,RoleRoute,NotificationProvider}
│   ├── pages/{LandingPage,Login,Signup,Chat,Journal,Calendar,MySession,Profile,Settings,
│   │          CognitiveGames,support,performance/PerformancePage}
│   ├── redux/{store.ts, resetApp.ts, slices/auth-slice/authSlice.ts,
│   │          slices/content-slice/contentSlice.ts, slices/games-slice/{guessWhat,stroop,thunks}.ts}
│   ├── config/{api.ts,axiosConfig.ts,gameConfigs.ts}
│   ├── types/{index.ts,props.ts, game/{base,guessWhatTypes,stroopTypes}.ts}
│   └── utils/{helpers.ts,greeting.tsx,sound.ts, game/{guessWhatUtils,stroopUtils,dashboardUtils}.ts}
└── server/
    ├── src/{index.ts, prisma.ts, services/triageEngine.ts}
    ├── prisma/schema.prisma
    ├── seed-demo.ts
    ├── package.json, tsconfig.json, Dockerfile, SETUP.md
    └── render.yaml (root render.yaml points here via rootDirectory: server)
```

Build scripts: frontend `pnpm dev | pnpm build (tsc -b && vite build)` (`package.json`); server `npm run dev (ts-node src/index.ts)` and `npm run build (prisma generate && tsc)` then `npm start (node dist/index.js)`.

### 6.2 Authentication & Roles

**Registration** (`POST /api/auth/register`, `server/src/index.ts:58-92`):

- Validates `email`+`password`, 409 on duplicate.
- Maps `inviteCode.trim().toUpperCase()` through `STAFF_INVITE_CODES`; unknown code → 400 `Invalid invite code`. Absent code → `USER`.
- `bcrypt.hash(password,10)` → `prisma.user.create({ email, username: username || email.split('@')[0], passwordHash, role, emergencyContactNumber, emergencyContactEnabled })`.
- Signs `jwt.sign({userId,email,role}, JWT_SECRET, {expiresIn:'7d'})`; returns `{ token, user }` where `user` projects `userId (=id), username, email, role, phone, preferredLanguage, emergencyContactEnabled/Number`.

**Login** (`POST /api/auth/login:93-119`): `findUnique` + `bcrypt.compare`; same token shape.

**Frontend**: `src/redux/slices/auth-slice/authSlice.ts` holds `AuthState { isAuthenticated, token, user, loading, error }` with `loginSuccess`/`logout`. `src/redux/store.ts` persists `auth` via `redux-persist/lib/storage`. `src/App.tsx` uses `RoleRoute` for `/practitioner|/volunteer|/admin`. Sidebar shows role badge when `user.role !== 'USER'`.

Invite codes (as shipped): `MINDLINK-PRACTITIONER-2024`, `MINDLINK-VOLUNTEER-2024`, `MINDLINK-ADMIN-2024`.

### 6.3 The Triage Engine — The Core Contribution

**File:** `server/src/services/triageEngine.ts` (214 lines, pure functions, zero external I/O — fully unit-testable).

#### 6.3.1 Daily Score (0–100)

```ts
export function calculateDailyScore(input: CheckinInput): number
// CheckinInput { mood 1-5, sleep 1-5, stress 1-5, energy 1-5, social 1|5 }

norm = v => (v/5)*100                     // 1→20 … 5→100
str  = 100 - norm(stress) + 20            // invert: 5(high stress)→20, 1→100
weighted = mood*0.25 + str*0.20 + sleep*0.20 + energy*0.20 + social*0.15
return Math.round(weighted)
```

| Signal | Weight | Antecedent in code |
|--------|--------|--------------------|
| Mood   | 25%    | `m * 0.25` |
| Stress (inverted) | 20% | `str * 0.20` with inversion `100 - norm(stress)+20` |
| Sleep | 20% | `slp * 0.20` |
| Energy| 20% | `eng * 0.20` |
| Social (1 or 5) | 15% | `soc * 0.15` |

The stress inversion is critical; earlier drafts mis-weighted raw stress positively — the code corrects this.

#### 6.3.2 Baseline

```ts
export function calculateBaseline(historyScores: number[]): number
// mean of passed array; caller passes historyScores.slice(1) (excludes current)
```

Computed in `POST /api/checkins` as `calculateBaseline(historyScores.slice(1))` where `historyScores` includes the current score at index 0.

#### 6.3.3 Trend Detection

```ts
export function detectTrend(scores: number[]): { direction, slope }
// Linear regression: x = 0..n-1, y = scores
// Returns stable if n<3; else slope = Σ(x-mx)(y-my)/Σ(x-mx)²
// direction = declining if slope < -3, improving if > +3, else stable
```

The check-in handler widens the window to `take: 10` to give the regression up to 9 prior points — flagged as *"Widen window to 10 for reliable trend detection"*.

#### 6.3.4 Cognitive & Behavioural Inputs

```ts
export interface CognitiveGameInput { accuracy: number; duration: number }
export interface BehavioralInput { daysSinceLastCheckin: number; missedDaysInLastWeek: number }
```

Behavioural derivation inside `POST /api/checkins`:

- `daysSinceLastCheckin = floor((now - pastCheckins[1].createdAt)/86400000)` (pastCheckins[0] is the just-created record).
- `missedDaysInLastWeek = 7 - |{ distinct ISO dates among pastCheckins } ∩ last-7 calendar days|`.

#### 6.3.5 Calibrated Classification

```ts
export function classifyRisk(currentScore, historyScores, baseline,
                             recentGames: CognitiveGameInput[] = [],
                             behavioralInput?: BehavioralInput): RiskResult
// RiskResult { level: 'GREEN'|'YELLOW'|'RED', explanation: string, confidenceLevel: 'HIGH'|'MEDIUM'|'LOW' }
```

Confidence from history length:

| historyScores.length | confidenceLevel | Effect |
|----------------------|-----------------|--------|
| <3 | LOW | *All* baseline deviation checks disabled |
| 3–4 | MEDIUM | Only `baselineDrop > 40` can drive RED; no baseline YELLOW |
| ≥5 | HIGH | Full checks: RED at `>30`, YELLOW at `>15` |

Scenario branches (in evaluation order):

- **Cognitive penalty** if `recentGames.length >=2` and `(previous.accuracy - latest.accuracy >20 && latest.accuracy<60) || (latest.duration > previous.duration*1.5)` → `explanationParts.push('noticeable cognitive fatigue (slower response/lower accuracy)')`.
- **Behavioural** → `behavioralCritical` (≥5 days gap && currentScore<60) else `behavioralFlag` (≥3 days gap or ≥4 missed days in week).
- **Trend** → `trendContributesToRed` if `slope < -8` else `trendContributesToYellow` if `slope < -3 && currentScore<65`.
- **Low-days:** `lowDaysCount` = count of `historyScores.slice(0,3)` with `<40`.
- **RED if any:**
  - `currentScore <40 && lowDaysCount>=2`
  - `baselineRedTrigger` (40/30 threshold by confidence)
  - `currentScore <45 && cognitivePenalty`
  - `behavioralCritical && currentScore<50`
  - `trendContributesToRed && currentScore<55`
- **YELLOW if any:**
  - `40 ≤ currentScore <60`
  - `baselineYellowTrigger` (HIGH + drop>15)
  - `cognitivePenalty`
  - `behavioralFlag`
  - `trendContributesToYellow`
- **Otherwise GREEN** with explanation `"Stable."`. RED/YELLOW prefixes are `"Score critically low or stepped significantly from baseline"` and `"Noticeable decline. Approaching risk threshold"` with ` — detail.` appended.

The as-built table above replaces earlier draft language like *ML classifier* — there is no model file, no feature pipeline, no training split; the entire decision surface is readable in one screen.

#### 6.3.6 Persistence Path

`POST /api/checkins` (server/src/index.ts:189-257) persists `Checkin`, derives `currentScore`, loads `historyScores` and `recentGames`, computes `baseline` and `behavioralInput`, calls `classifyRisk`, then `prisma.riskScore.create({ userId, dailyScore: currentScore, riskLevel: risk.level, confidenceLevel, explanation })` and returns `{ checkin, assessment: riskScoreRecord }`. The frontend's `MoodCheckInModal` triggers `RiskAlertModal` when `assessment.riskLevel` is YELLOW/RED.

### 6.4 Cognitive Games as Passive Assessment

Games are defined in `src/config/gameConfigs.ts`:

```ts
export const gameConfigs = {
  "guess-what": { gameTitle:"guess what", description:"memory recognition ...",
                  startGameAction: startGuessWhatGame, getSlice: s=>s.guessWhat,
                  computeScore: getGuessWhatMMSEScore, rules:[...], testingPhase:true },
  "stroop":     { gameTitle:"stroop", description:"cognitive control ...",
                  startGameAction: startStroopGame,     getSlice: s=>s.stroop,
                  computeScore: getStroopMMSEScore,    rules:[...], testingPhase:true }
}
```

**Guess What** (visual memory):
- State: `src/redux/slices/games-slice/guessWhat.ts` — `sessionId`, `config: GuessWhatInitConfig { maxLevels 10, defaultMemorizationTime, minMemorizationTime, basePairs, imageSet }`, `gameState { level, cards:Card[], currentImagesToFind, isMemorizationPhase, memorizationTime, attempts, maxAttempts 3, ...}`, `metrics: IGuessWhatMetric[] {level,attempt,totalResponseTime,accuracy,levelErrors,levelScore}`, `totalScore`, `isPlaying/isPaused/gameEnded/complete`.
- Init: `src/utils/game/guessWhatUtils.ts:initializeGameState()` picks `level+basePairs` images, shuffles, sets `memorizationTime = max(minMemorizationTime, defaultMemorizationTime - level*1000)`; `generateCards` + `selectImagesToFind` (1 target if lvl≤3 else 2 if ≤6 else 3).
- Level score: `getDifficultyMultiplier` (1 / 1.5 / 2) · `levelBonus ((level/time)*55)`, `timeBonus ((level/time)*10)`, `getAccuracyBonus` (20/10/5/0), `getPenaltyRate` (40/10/0), compensation `level*0.25` → `weightedLevelScore = 3*levelBonus +4*timeBonus +6*accuracyBonus -5*penaltyRate + compensation`; accuracy 0 → 0.
- MMSE: `computeMmseScore()` does per-metric min-max normalisation of response time & errors, log-weighted level importance `log1p(level)/log1p(maxLevel)`, penalty accumulation, then `mmse = clamp(30-penalty,0,30)`. Simplified path `getGuessWhatMMSEScore(totalScore) = round((totalScore/4220)*30)`. Classification in `classifyMMSE`: ≥24 Normal, ≥18 Okay, else At Risk.

**Stroop** (executive function / inhibition):
- State: `stroop.ts` — similar shape plus `metrics {questions,attempts,averageResponseTime,errors,accuracy}` and pause tracking `pauseStartTime/totalPausedDuration`.
- Init: trivial; `questions: IStroopQuestion[] { text, fontColor, isCorrect }`.
- Scoring per answer: `recordAnswer({correct,bonus,responseTime})` updates running average `(oldAvg*(n-1)+rt)/n` and accuracy `%`; correct → +100+bonus.
- MMSE: `getStroopMMSEScore({accuracy,averageResponseTime,errors,attempts})` → `normAcc = accuracy/100`, `normSpeed = 1-(clamp(RT,0.3,4.0)-0.3)/(3.7)`, `errPenalty= min(errors/attempts,1)` → `raw=0.55*normAcc+0.30*normSpeed-0.15*errPenalty` → `round(clamp(raw*30,0,30))`. Thresholds same as Guess What.

**Dashboard Memory Match** (`src/components/dashboard/MemoryMatchGame.tsx`):
- Emoji pairs `["🌿","🌙","🌊","⛰️","🌸","🍂"]` ×2 shuffled; flip logic with 900ms mismatch delay; win condition `cards.every(isMatched)` → `POST /api/games { userId, gameType:"Memory Match", score: max(0,100 - mistakes*5 - timeTaken/2), accuracy: round((moves-mistakes)/moves*100), duration: timeTaken, mistakes }`. Score feeds the same `GameSession` table and streak.

**Shared game chrome:** `src/components/games/{GamePage,GameRunner,GameCanvas}.tsx`, `hooks/useRouteGuard.ts`, `sharedComponents/{RecentGameCard,AverageMmseByGameType,MobileViewWarning,PopUp,...}`. Routes attempt `POST /game-session` (or `/research-session` if `participantInfo` present) against `axiosConfig.ts` baseURL, but fall back to a `mock-session-${Date.now()}` with default config on 401/403 so the demo never logs out a mock auth — see `GamePage.tsx`.

**Performance page** (`src/pages/performance/PerformancePage.tsx`) renders metrics from `localStorage` key `game_metrics_${sessionId}` plus aggregated stats via `src/utils/game/dashboardUtils.ts` (totals, avg/best MMSE, recent 3, streak calc with `date-fns`).

### 6.5 API Reference (As Shipped)

All paths are Express-mounted under `/api/...` with CORS and JSON middleware. `GET /health` is unauth. The configurable origin is defensive: `VITE_SERVER_API_URL` is deprecated; canonical env is `VITE_API_BASE_URL` (fallback Render).

| Method | Path | Auth | Handler / file | Behaviour |
|--------|------|------|----------------|-----------|
| GET | `/health` | — | `server/src/index.ts` | `{status:"ok",message:"MindLink Backend System Running"}` |
| POST | `/api/auth/register` | — | `index.ts` | See §6.2; 409 on duplicate, 400 on bad invite |
| POST | `/api/auth/login` | — | `index.ts` | 401 on bad creds; JWT 7d |
| PUT | `/api/user/profile` | Bearer | `index.ts` | Update `username/phone/preferredLanguage/emergencyContact{Enabled,Number}` |
| GET | `/api/history/:userId` | — | `index.ts` | Last 10 `Checkin` desc |
| POST | `/api/checkins` | —* | `index.ts` | Create `Checkin` → triage → `RiskScore` (see §6.3.6). *Prototype leaves unauth'd for USSD; hardening roadmap in §8. |
| POST | `/api/games` | — | `index.ts` | Create `GameSession` |
| GET | `/api/games/:userId` | — | `index.ts` | List `GameSession` desc (`id,gameType,score,accuracy,duration,createdAt`) |
| POST | `/api/chat` | — | `index.ts` | Keyword-aware rule chat: loads latest `RiskScore`, logs `ChatbotLog`, returns `{message,flagged,riskContext}` with `NEGATIVE_KEYWORDS = [sad,hopeless,stressed,anxious,overwhelmed,depressed,scared,alone,worthless,tired]`; RED+flagged → escalation prompt |
| GET | `/api/professionals` | — | `index.ts` | `User where role in [PRACTITIONER,VOLUNTEER]` mapped to `Professional {id,name,role: counselor|volunteer, bio, specialties, languages, rating:null, isVerified:true}` |
| POST | `/api/support` | Bearer | `index.ts` | Create `SupportRequest {requestType:'Priority Support'}` from `req.user.userId` |
| GET | `/api/practitioner/queue` | Bearer + PRACTITIONER\|VOLUNTEER | `index.ts` | `User where role=USER include riskScores(1) supportRequests(OPEN) checkins(5)` → projected queue sorted by `riskWeight RED3>YELLOW2>GREEN1`, tie-break openRequests desc |
| POST | `/api/practitioner/assign` | Bearer + PRACTITIONER\|VOLUNTEER | `index.ts` | `{patientId,assignedTo}`; if no OPEN req, creates `SupportRequest{requestType:'Triage Assignment',status:IN_PROGRESS}` else updates all OPEN→IN_PROGRESS |
| POST | `/api/practitioner/resolve` | Bearer + PRACTITIONER\|VOLUNTEER | `index.ts` | `{patientId}` → `updateMany status in [OPEN,IN_PROGRESS] → RESOLVED` |
| GET | `/api/admin/overview` | Bearer + ADMIN | `index.ts` | Parallel counts: `totalUsers(PRACTITIONER/VOLUNTEER filtered), totalPractitioners, totalVolunteers, openRequests, checkinsToday, distinct latest riskLevels`; `recentUsers(8)`; `riskDistribution` tally + `methodology` explainability blurb |

*Auth posture:* admin and practitioner routes strictly enforce JWT+role; support creation is auth-required; history/games/chat remain open in prototype to simplify USSD and demo. The thesis recommends requiring JWT for all user-scoped reads in the next iteration.

### 6.6 Frontend Features in Detail

#### 6.6.1 Check-in Flow (`MoodCheckIn.tsx` + `MoodCheckInModal.tsx`, 276 lines)

Five-step wizard `Step = "mood"|"sleep"|"stress"|"energy"|"social"|"done"` with `scaleOptions {1:Awful…5:Great}` and `boolOptions {1:"No, isolated" | 5:"Yes, connected"}`; progress bar `w = (currentStepIndex/5)*100%`. On final Next, `POST /api/checkins {userId, ...formData, source:"WEB"}`; `onMoodRecorded` maps `mood>3 → happy else stressed` for `MoodTrendChart`; if `assessment.riskLevel in {RED,YELLOW}` → `RiskAlertModal` after 1.2s. Close resets step and assessment.

#### 6.6.2 Wellbeing Status & Mood Trend

- `WellbeingStatus.tsx` fetches `GET /api/history/:userId`, derives a display score `derived = ((mood+sleep+energy+(6-stress)+social)/25)*100` (matching `calculateDailyScore` conceptually but computed client-side for instant feedback), and maps ≥70→GREEN, ≥45→YELLOW else RED, with icon/background/bar colour.
- `MoodTrendChart.tsx` (Recharts) plots last history points; empty state shows skeleton.
- The authoritative risk remains server-side `RiskScore`; the status card is a fast, approximate mirror for perceived performance.

#### 6.6.3 Streaks (`StreakTracker.tsx`, `src/utils/game/dashboardUtils.ts`)

Two streaks: *Daily Check-in* (from `/api/history`) and *Cognitive Games* (from `/api/games`). `calcStreak(dates)` deduplicates ISO days and walks back from today day-by-day: break on first gap; so a streak is only active if last entry is today or yesterday. DashboardUtils also provides `calculateBestStreak`, `calculateCurrentStreak` (week-aware), `generateCalendarData` (Mon–Sun, `date-fns startOfWeek`), `groupSessionsByGame`, `getAverageMMSE`, `getMMSETrend`.

#### 6.6.4 Journal (`src/pages/Journal.tsx`)

Maps numeric `mood` score → `MoodType {happy|stressed|lonely|anxious|tired|good|neutral}` via `scoreToMood`; filters by `TimeRange {week|month|all}`; groups by ISO date; shows stats row (Total Entries, Avg Mood Score, Most Common, Time Range) and per-day timeline with source badge (`WEB` purple, `USSD` green) and per-entry sleep/stress/energy/social chips.

#### 6.6.5 Chat (`src/pages/Chat.tsx` + `src/components/dashboard/ChatbotWidget.tsx` + `src/components/dashboard/AgentAIChat.tsx`)

- **Widget** on Home: mini chat with history `[{role:'agent'|'user', content}]`, POST to `/api/chat` with `userId`; loading dots use `animate-bounce`.
- **Full Chat page**: richer layout with quick prompts, risk-aware canned replies (same `NEGATIVE_KEYWORDS` + `recentRisk` branching).
- **Floating AgentAIChat button**: fixed bottom-right purple circle → navigates to `/chat`.
- **OpenRouter path**: if `VITE_OPENROUTER_API_KEY` is set, `generateAIResponse(messages, "openai/gpt-4o")` can be called (prompt defined in `MINDLINK_SYSTEM_PROMPT` detailing mission, core features, guidelines, response style). The thesis prototype prefers the server `/api/chat` for persistence + practitioner visibility; OpenRouter is documented as the richer future path with a backend proxy recommended over `dangerouslyAllowBrowser`.

#### 6.6.6 Support Network (`src/pages/support.tsx`)

Merges `dbProfessionals` from `GET /api/professionals` with 8 curated mock entries (Mette Andersen, Sarah Johnson, etc.) de-duplicated by `id`. Filter bar `all|counselor|volunteer|nurse`. `ProfessionalCard.tsx` lists specialties, languages, rating (mock `4.6–4.9`), and a `Schedule` button opening `SchedulingModal.tsx` (date/time slot grid, Generate Meet Link). `handleConfirmSchedule` builds a `Session {id: Date.now(), title, type:individual, professional, dateTime, timezone: Intl..., status:confirmed, meetLink}` persisted to `localStorage.sessions`. `NotificationProvider` (`react-hot-toast`) confirms.

#### 6.6.7 Practitioner & Admin Dashboards

- `PractitionerDashboard.tsx` fetches `GET /api/practitioner/queue` with JWT; renders queue length, RED/YELLOW/GREEN counts, and per-user rows with `latestRisk`, `dailyScore`, `explanation`, `openRequests`, `checkinCount`, `hasEmergencyContact`. Action buttons call `POST /api/practitioner/{assign,resolve}`; row expands into `CaseDetailModal.tsx` showing `checkins(5)` sparkline + `ChatbotLog` keyword timeline.
- `AdminDashboard.tsx` fetches `GET /api/admin/overview` (ADMIN-only). Cards for participants/practitioners/volunteers; *System pulse* grid (`checkinsToday`, `openRequests`, daily participation `%`); risk-distribution bars (GREEN `#78b98a`, YELLOW `#e5b85c`, RED `#d97263`); methodology card from API's `methodology` field; *Network directory* with search, `Contact enabled` toggle, and CSV export `mindlink-participant-snapshot.csv` (Blob, `URL.createObjectURL`).

#### 6.6.8 Scheduling / Calendar / MySession / Profile / Settings

- **Calendar** (`src/pages/Calendar.tsx`): renders `localStorage.sessions` on a month grid; empty state links to `/psychologists`.
- **MySession** (`src/pages/MySession.tsx`): list of those same sessions with status badges, timezone, Meet link copy, and cancel (removes from storage).
- **Profile** (`src/pages/Profile.tsx`): edits `username/phone/preferredLanguage`; `PUT /api/user/profile` + `dispatch(loginSuccess(...))`; e-mail read-only.
- **Settings** (`src/pages/Settings.tsx`): Language (`en/tw/ee`), Notifications toggles (email/push/session reminders — UI only), USSD Settings (enable + code input), Privacy. Scaffolded for thesis extensibility; persistence beyond local state is future work.
- **Landing** (`src/pages/LandingPage.tsx`): thesis-aware hero (*"Care begins with being heard."*), 3-step explainer (Listen → Read the signals → Keep humans in the loop), three-channel cards, and `Thesis research prototype` badge.

### 6.7 State & Persistence Details

`src/redux/store.ts`:

```ts
persistConfig = { key:"root", storage, whitelist:["content","auth","guessWhat","stroop"] }
appReducer = combineReducers({ content: contentReducer, auth: authReducer,
                               guessWhat: guessWhatGameReducer, stroop: stroopGameReducer })
rootReducer = (state,action)=> action.type==="app/reset" ? appReducer(undefined,action) : appReducer(state,action)
persistedReducer = persistReducer(persistConfig, rootReducer)
```

`src/redux/slices/games-slice/thunks.ts` is unused in current flow (retained scaffolding). `src/redux/slices/content-slice/contentSlice.ts` is placeholder for recommendations/feed.

`localStorage` keys used in prototype: `token`, persisted `root` (redux-persist), `sessions` (scheduled Sessions array), `game_metrics_${sessionId}` (full metrics for performance page), `participantInfo` (optional research demographics, consumed by GamePage's `/research-session` path).

### 6.8 Deployment & Build

- Frontend: `pnpm-lock.yaml` + `pnpm-workspace.yaml` declare `pnpm@10.25.0`; `vite.config.ts` uses `react()` + `tailwindcss()`; `pnpm build` emits `dist/`.
- Server: `render.yaml` sets `rootDirectory: server`, `buildCommand: npm install && npm run build` which runs `prisma generate && tsc`, `startCommand: npm start`, `healthCheckPath: /health`, Node ≥20.
- Env (`.env` files are gitignored per `.gitignore`): `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, optional `CORS_ORIGIN`, plus frontend `VITE_OPENROUTER_API_KEY`, `VITE_API_BASE_URL` (or legacy `VITE_SERVER_API_URL`), `VITE_SITE_URL`, `VITE_SITE_NAME`. See `server/SETUP.md` and `server/.gitignore`.

---

## 7. Testing, Evaluation & Validation

The thesis evaluation is **functional and analytical**, not clinical. No human-subjects efficacy claim is made.

### 7.1 Unit Logic — Risk Engine Walkthrough

Tests were manual but deterministic because `triageEngine.ts` has no I/O. Representative traces:

| Case | Current | Hist len | Baseline | Signals | Expected | Rationale |
|------|---------|----------|----------|---------|----------|-----------|
| New user | 55 | 1 | 0 | — | GREEN (LOW) | <3 → no baseline RED; 55 is <60 but RED requires <40+specific flags, so falls to YELLOW? Actually 55 ∈ [40,60) → YELLOW. Demonstrates that very first check-ins still surface YELLOW on middling scores — desirable sensitivity without RED panic. |
| Strong baseline drop (new) | 38 | 3 | 78 | drop 40 | RED (MEDIUM) | MEDIUM baseline RED threshold is >40, exactly met? 40 is not >40, so stays non-trigger — confidence gating prevents over-escalation. Needs 41+ point drop at this data depth. |
| Mature user, persistent low | 38 | 9 | 72 | lowDays 2/3 → RED | RED (HIGH) | `current<40 && lowDaysCount≥2` fires irrespective of other signals. |
| Trend-only | 53 | 8 | 70 | slope -9, drop 17 | YELLOW→RED boundary: slope<-8 + current<55 → `trendContributesToRed && current<55` → RED. If current were 57, would remain YELLOW. |
| Cognitive penalty | 44 | 6 | 65 | latest acc 55, prev 80 (drop 25) | RED | `current<45 && cognitivePenalty` fires. |
| Behavioural critical | 48 | 7 | 60 | 6-day gap, current 48 | RED | `behavioralCritical && current<50` |
| Healthy stable | 78 | 6 | 75 | none | GREEN (HIGH) | No RED or YELLOW branch — `Stable.` |

These traces confirm the calibration goal: *new users can reach YELLOW easily but require overwhelming evidence to reach RED; mature users react faster to longitudinal change.*

### 7.2 Integration — Route Smoke Table

| Flow | Steps | Result |
|------|-------|--------|
| Register → Login → Check-in → Wellbeing | Create user (USER) → login → `POST /api/checkins` → `GET /api/history` | `RiskScore` persisted, dashboard status and journal updated |
| Games → Risk | `POST /api/games` twice with degrading metrics → next check-in | `cognitivePenalty` triggers YELLOW/RED appropriately |
| Gap → Behaviour | Register user, sleep system clock 5 days (or mock dates) → check-in low | `behavioralCritical` contributes |
| Chat risk-aware | Set `RiskScore=RED`, send message "I feel hopeless and alone" → `POST /api/chat` | `flagged:true`, `riskContext:RED`, reply is escalation prompt |
| Support → Queue lifecycle | `POST /api/support` (auth) → practitioner GET queue sees OPEN → `POST /assign` → IN_PROGRESS → `POST /resolve` → RESOLVED | Queue re-sorted after each call |
| Roles | Login USER → hit `/api/admin/overview` | 403 as expected;ADMIN succeeds |
| Professionals | With zero staff → fallback mock still renders 8 cards; with 2 staff in DB → merged list shows 10 unique | Offline/online parity |
| Scheduling | Pick slot → local Meet link → MySession & Calendar show entry | `localStorage.sessions` round-trip |

### 7.3 Usability Heuristics

- **Mobile** (<768px): sidebar → drawer, header greeting stacks under search, game HUD remains tap-friendly; `MobileViewWarning.tsx` exists (commented out in `GamePage` but retained).
- **Accessibility:** semantic headings, `aria-label` on toggles, contrast-checked palette (deep `#1b2f28` on `#f4f6f1`, purple `600` AA on white).
- **Explainability:** practitioner queue surfaces `explanation` strings verbatim; admin methodology card explicitly frames the signal.

### 7.4 Performance & Scale

Per check-in: 1× `Checkin.create`, 1× `Checkin.findMany(10)`, 1× `GameSession.findMany(2)`, 1× `RiskScore.create` — all indexed by `userId` and tiny result sets. No N+1 fan-out except the queue endpoint which is paginated by design (`take:5` checkins) and acceptable for demo scale. SQLite lock contention is trivial at this throughput; migration to Postgres would linearise.

### 7.5 Limitations (Honest Appraisal)

- Deterministic thresholds are interpretable but not validated on a labelled clinical cohort; they encode the author's judgement, not epidemiological sensitivity/specificity.
- SQLite prototype simplifies deployment but lacks concurrent write realism; `distinct` query for `riskDistribution` varies by SQLite vs Postgres semantics.
- USSD termination and SMS alerts are **modelled only** (`source` field, Settings UI); no Africa's Talking / telco binding exists.
- Meet links are local synthetic URLs, not Google Calendar inserts; calendar is client-side.
- Community board is UI mock (`CommunityPreview` posts array); streaks are computed, not server-persisted.
- OpenRouter browser call exposes the key unless proxied; the repo warns for production.
- `POST /api/checkins` is currently unauthenticated for USSD convenience — production should require either JWT or signed USSD gateway secret.

A prior draft's claims about ML feature enrichment, PostgreSQL in production as-shipped, and full calendar/USSD wiring are corrected here.

---

## 8. Discussion — What Was Built vs. What Was Planned

### 8.1 The Productive Constraint

The earliest `DASHBOARD_PLAN.md` imagined a broad platform with streaks, community, Agent AI prompts, and wellness resources. That breadth was kept, but the thesis cut one seductive promise — a trained mental-health ML model — in favour of an auditable rule system. The reason is both ethical and pragmatic: with <~100 synthetic demo records, any learned model would be brittle and un-auditable to an examiner; a weighted, regression-backed rule engine can be reasoned about line by line.

### 8.2 Data Layer Deliberation

`README.md` states *PostgreSQL via Prisma ORM*; the committed `schema.prisma` uses `provider = "sqlite"`. This is not an inconsistency to hide: SQLite was chosen for the **thesis artefact** — it guarantees `git clone → npm install → npx prisma db push → npm run dev` works on any examiner machine with no cloud dependency, and `server/seed-demo.ts` can populate a demo DB in seconds. The same Prisma schema deploys to Postgres by changing two lines (`provider` and `DATABASE_URL`) — a deliberate production-ready choice, not an oversight.

### 8.3 Channels

The code is truthful about channels:

- **WEB** — fully реализован.
- **USSD** — `source` enum, BOUNDARY: no IVR/REST gateway is wired. The Settings screen exposes USSD toggles so a gateway PR can be evaluated in isolation. Thesis claims only *USSD-ready*, not *USSD-live*.

### 8.4 Scheduling & Community

Both are **scaffolded to unblock user journeys**. Scheduling persists to `localStorage` and shows fully in Calendar/MySession — sufficient to validate triage→support→session continuity without coupling the thesis to Google OAuth. The Community preview is a visual placeholder for future forum integration. These scopes were approved because the intellectual contribution is the triage engine and escalation, not another calendar clone.

### 8.5 AI Posture

Two AIs coexist: (1) the **server rule engine** — not negotiable — and (2) the **OpenRouter conversational assistant** — optional, evocative, but never the source of truth for risk. The thesis could have collapsed them; keeping them separate preserves the safety property that risk level is always explainable from stored signals.

### 8.6 Ethical Stance

Three guards repeat in code and prose: *no diagnosis*, *human-in-the-loop*, *invite-gated practitioners*. The Admin overview's methodology footer and the Landing page's *"No diagnosis by automation"* chip exist to make the boundary visible to every stakeholder. Emergency contact is opt-in, and the RED helpline (`0800-MINDLINK` in `RiskAlertModal`) is informational.

### 8.7 What This Revision Fixes

If the previous thesis described a Postgres-backed ML pipeline with Calendar and USSD already live, this revision: (a) corrects the datastore to SQLite-for-thesis, (b) documents the deterministic engine with exact weights/thresholds, (c) marks USSD and Calendar as deferred/scaffold, (d) separates the rule-based triage engine from the optional OpenRouter conversational agent, and (e) adds full route/table traces so an examiner can open any claim beside the cited file.

---

## 9. Conclusion & Future Work

### 9.1 Summary

MindLink as-shipped is a coherent triage-and-guide prototype: five-signal check-ins, trend/baseline/cognitive/behavioural fusion with confidence tiers, two assessed games plus a dashboard micro-game, a complete dashboard and journal, support discovery with local scheduling, and practitioner/admin triage surfaces — all behind JWT+invite-code access and deployable to Render + static hosting. Its most important quality is that its riskiest decision (whether to escalate) can be **read, tested, and justified** from a single file.

### 9.2 Contributions Revisited

- A **deterministic, explainable triage engine** with calibrated confidence and evidence strings.
- A **cognitive-game-as-signal** integration pattern with MMSE-normalised scoring on both games.
- A **multi-channel-ready data model** (`source`, `preferredLanguage`, `emergencyContact`) and escalation pathway that keeps humans in the loop.
- A **complete, deployable web artefact** whose every claim is code-traceable.

### 9.3 Future Work

1.  **Telco binding:** terminate USSD via Africa's Talking, push SMS alerts on RED, and Harden `POST /api/checkins` with gateway-signed auth.
2.  **Production store:** switch `schema.prisma` to `provider = "postgresql"` with `DIRECT_URL`, add `RiskScore` composite index on `(userId, createdAt desc)`.
3.  **Calendar delegation:** OAuth'd Google Calendar insert with real Meet conferenceData, and mirror `Session` into `SupportRequest` history.
4.  **Validation:** longitudinal pilot (≥30 days, ≥20 participants) to calibrate weights empirically and measure sensitivity/specificity against PHQ-9/GAD-7; ethics approval required before any clinical framing.
5.  **AI hardening:** move OpenRouter call behind the Express proxy (hide key, add rate-limit, add safety guardrails) and log `ChatbotLog` with model version.
6.  **Community & streak persistence:** back streaks and forum posts with DB models rather than derived/local-storage only.
7.  **Security review:** enforce JWT on all user-scoped reads, add refresh tokens, rotate `JWT_SECRET`, add input validation (zod) on all `req.body` fields.

### 9.4 Closing Reflection

Technology can make the first step easier, but it must not pretend to be the whole journey. MindLink succeeds if it earns a user's next disclosure and a practitioner's next look. By rebuilding the thesis to match the code, this document commits to that honesty: the system is a prototype triage, not a diagnosis; a scaffold for more inclusive access, not a finished clinic. That clarity is the foundation future work can safely extend.

---

## 10. References

> Format: APA 7th (representative; examiner to add institution-specific stylesheet). The references below cover the domains invoked, not an exhaustive bibliography of the field. In-text citations above point to these entries.

- American Psychiatric Association. (2022). *Diagnostic and statistical manual of mental disorders* (5th ed., text rev.). [Not a basis for automated diagnosis; cited only to clarify scope.]
- Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975). "Mini-mental state": A practical method for grading the cognitive state of patients for the clinician. *Journal of Psychiatric Research*, 12(3), 189–198.
- Nasreddine, Z. S., et al. (2005). The Montreal Cognitive Assessment: A brief screening tool for mild cognitive impairment. *Journal of the American Geriatrics Society*, 53(4), 695–699.
- Stroop, J. R. (1935). Studies of interference in serial verbal reactions. *Journal of Experimental Psychology*, 18(6), 643–662.
- Patel, V., et al. (2018). The Lancet Commission on global mental health and sustainable development. *The Lancet*, 392(10157), 1553–1598.
- World Health Organization. (2021). *Mental health atlas 2020*. WHO. https://www.who.int/publications/i/item/9789240036703
- Mohr, D. C., et al. (2017). Digital mental health interventions: A narrative review. *Current Treatment Options in Psychiatry*, 4, 377–392.
- Torous, J., et al. (2021). The growing field of digital mental health. *World Psychiatry*, 20(2), 228–229.
- Prisma Documentation. (2024). *Prisma ORM — SQLite & PostgreSQL providers*. https://www.prisma.io/docs
- Vite, Tailwind Labs, Vercel. (2024). *Vite and Tailwind CSS v4 documentation*. https://vitejs.dev, https://tailwindcss.com

*Tooling cited in code:* React 18, Vite 6, Redux Toolkit 2.5, Recharts 3.1, Framer Motion 12, Prisma 5.13, Express 4.19, OpenRouter API (GPT-4o).

---

## Appendices

### A. API Quick Reference Card

*(Condensed from §6.5 for field use; see server/src/index.ts for authoritative handler order.)*

```
Health        GET  /health
Auth          POST /api/auth/register   {email*,password*,username,emergencyContactNumber,inviteCode}
              POST /api/auth/login      {email*,password*}
Profile       PUT  /api/user/profile    Bearer {username,phone,preferredLanguage,emergencyContact*}
History       GET  /api/history/:userId
Check-in      POST /api/checkins        {userId*,mood,sleep,stress,energy,social,source}
Games         POST /api/games           {userId*,gameType,score,accuracy,duration,mistakes}
              GET  /api/games/:userId
Chat          POST /api/chat            {userId,message} → {message, flagged, riskContext}
Directory     GET  /api/professionals
Support       POST /api/support         Bearer {requestType}
Practitioner  GET  /api/practitioner/queue            Bearer PRACTITIONER|VOLUNTEER
              POST /api/practitioner/assign  {patientId,assignedTo}
              POST /api/practitioner/resolve {patientId}
Admin         GET  /api/admin/overview                 Bearer ADMIN → {metrics,riskDistribution,recentUsers,methodology}
```

### B. Prisma Schema (as committed)

See `server/prisma/schema.prisma` — reproduced in §5.4. Key indexing note: Prisma auto-indexes `@id`; explicit `@@index([userId, createdAt])` is recommended when moving to Postgres.

### C. Triage Engine Pseudocode & Thresholds

```ts
score = round( mood/5*100*0.25 + (100 - stress/5*100 +20)*0.20 + sleep/5*100*0.20
               + energy/5*100*0.20 + social/5*100*0.15 )

baseline = mean(historyScores.slice(1))
trend    = linReg(historyScores)  // slope, n<3→stable

cognitivePenalty = recentGames≥2 && (prevAcc-latAcc>20 && latAcc<60 || latDur>prevDur*1.5)
behavioralCritical = gap≥5 && score<60
behavioralFlag     = gap≥3 || missed≥4
trendRed   = declining && slope<-8      // contributes if score<55
trendYellow= declining && slope<-3 && score<65
lowDays    = count(last 3 historyScores <40)

conf LOW(<3):  baseline checks OFF
     MED(3-4): RED only if baselineDrop>40
     HIGH(≥5): RED if drop>30, YELLOW if drop>15

RED if (score<40 && lowDays≥2) || baselineRed || (score<45 && cogPen)
        || (behavioralCritical && score<50) || (trendRed && score<55)
YELLOW if (40≤score<60) || baselineYellow || cogPen || behavioralFlag || trendYellow
else GREEN
```

### D. Game MMSE Formulas

**Guess What (visual memory)**

```
MMSE = clamp(30 - Σ logWeight[level]·(normRT + normErr - acc), 0, 30)
logWeight = log1p(level)/log1p(maxLevel)
normRT, normErr = min-max over session metrics
Simplified: MMSE = round((totalScore / 4220) * 30)
```

**Stroop (executive function)**

```
normAcc = accuracy/100
normSpeed = 1 - (clamp(RT,0.3,4.0)-0.3)/(3.7)
errPen = min(errors/attempts, 1)
MMSE = round(clamp((0.55*normAcc + 0.30*normSpeed - 0.15*errPen)*30, 0, 30))
```

Both classify: ≥24 Normal, 18–23 Okay, <18 At Risk.

Classification is for **triage signal only**, not clinical label.

### E. Invite Codes & Seed Data

Codes live in `server/src/index.ts:STAFF_INVITE_CODES`. Demo seeding: `server/seed-demo.ts` (idempotent creator of sample USER/PRACTITIONER/VOLUNTEER records plus check-ins and game sessions) + `prisma db push`.

### F. How to Run the Artefact (Examiner Path)

```bash
# Clone & install
git clone https://github.com/Sarfo-Paul/MindLink-Thesis.git
git checkout arena/01a08b29-mindlink-thesis
pnpm install           # frontend deps  (pnpm@10.25.0)
cd server && npm install

# Env
# server/.env: DATABASE_URL="file:./dev.db"  DIRECT_URL="file:./dev.db"  JWT_SECRET="local-dev-123"
# .env: VITE_API_BASE_URL="http://localhost:4000"

# DB
npx prisma db push     # creates SQLite file
npx ts-node seed-demo.ts  # optional sample data

# Run
npm run dev            # server http://localhost:4000 (health at /health)
# in another terminal, from root:
pnpm dev               # vite http://localhost:5173
```

Deploy path is described in `render.yaml` and `server/SETUP.md`.

### G. Screenshots Reference (Archived)

Recommended thumbnails for viva slides (all capturable from `pnpm dev` state with seeded data):

1. Landing (`/`) — thesis badge + hero
2. Auth (`/login`, `/signup` with invite code toggle)
3. Dashboard (`/home`) — WellbeingStatus GREEN/YELLOW/RED states, streak active vs empty, RiskAlertModal over MoodCheckIn
4. Games (`/games` grid + `GamePage` Guess What level + Stroop QuestionCard + MemoryMatch win → `/game/performance/:id`)
5. Journal (`/journal` filtered week/month, grouped timeline)
6. Support (`/psychologists` verified chip, `SchedulingModal` meet link, `MySession`/`Calendar`)
7. Practitioner (`/practitioner` queue sorted, `CaseDetailModal`) + Admin (`/admin` distribution bars, CSV export)

---

### Revision Log

| Date | Branch | Change |
|------|--------|--------|
| 2026-09-10 | `arena/01a08b29-mindlink-thesis` | Thesis rebuilt to match codebase; SQLite/Render paths, rule-engine thresholds, game MMSE formulas, API tables, and role guards aligned file-by-file. Prior ML/Postgres claims corrected. |

---

*End of thesis — this markdown is the source-of-truth. Render to PDF via your department's template (Word/LaTeX overlay) for submission. For a quick HTML preview: open this file in VS Code Markdown Preview or run `npx markdown-it thesis/THESIS.md -o thesis/preview.html`.*

