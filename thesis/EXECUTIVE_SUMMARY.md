# MindLink — Executive Summary (Viva Handout)
### Thesis Research Prototype · September 2026 · `arena/01a08b29-mindlink-thesis`

**One-sentence pitch:** MindLink is a private, explainable mental-health triage system that fuses five self-report signals, trend, behavioural gaps, and cognitive game performance into a calibrated `GREEN|YELLOW|RED` with evidence — and keeps humans in the loop.

---

## 1. What the artefact *is* (and is not)

**Is:** A React + Express + Prisma prototype with a deterministic risk engine, two assessed games plus a micro-game, dashboard/journal/chat/support/practitioner-admin flows, JWT role logic, and a Render-deployable API. **Is not:** a diagnosis device, a trained ML model, a live USSD telco integration, or a Google Calendar writer. The thesis states these boundaries explicitly and traces every claim to a file.

## 2. The engine that matters — `triageEngine.ts`

| Signal | How it is scored |
|--------|------------------|
| **Daily score 0–100** | `mood 25% + inv(stress) 20% + sleep 20% + energy 20% + social 15%` — inversion `100 - norm(stress)+20` |
| **Trend** | Linear regression over last 10 check-ins; `slope<-3` declining; `slope<-8` steep |
| **Behavioural** | `daysSinceLastCheckin` (≥3 flag, ≥5+score<60 critical) + `missedDaysInLastWeek` (≥4 flag) |
| **Cognitive** | Last 2 `GameSession`s: accuracy drop >20%+<60% or duration 1.5× → penalty |
| **Confidence** | <3 LOW (no baseline RED), 3–4 MEDIUM (RED only if drop>40), ≥5 HIGH (RED>30, YELLOW>15) |

RED if one of: `score<40+2 low days`, `baselineRed`, `score<45+cogPen`, `behavCritical+score<50`, `steepTrend+score<55`.  
YELLOW if: `40≤score<60`, `baselineYellow`, `cogPen`, `behavFlag`, `decliningTrend+score<65`. Otherwise GREEN.

Every branch appends a human sentence (`— extended period without check-in (6 days).`) — stored in `RiskScore.explanation`.

## 3. Games as signals, not content

- **Guess What** (visual memory): `GuessWhatInitConfig` max 10 levels, memorisation `max(minTime, default - level*1000)`, 1–3 targets by level; scoring uses difficulty/time/accuracy weights, MMSE via log-weighted `30 - penalty`.
- **Stroop** (executive function): timed colour-word interference; `recordAnswer` tracks running `avgResponseTime` and `accuracy`; MMSE `0.55*acc +0.30*speed -0.15*errPen` ×30.
- **Memory Match** (dashboard): emoji pairs, 900ms flip-back; `POST /api/games {score,accuracy,duration,mistakes}` — same table, same triage consumption.

Games post to `/api/games`; triage reads `take:2` before next classification.

## 4. Escalation is a pathway, not a score

Check-in → `RiskAlertModal` (YELLOW/RED: *Connect to counsellor / Talk to AI / Crisis helpline 0800-MINDLINK at RED*) → rule-chat `POST /api/chat` (`NEGATIVE_KEYWORDS` + `recentRisk`) → one-click `POST /api/support` → practitioner queue `GET /api/practitioner/queue` (RED→YELLOW→GREEN, openRequests tiebreak) → `POST /assign|/resolve`. Admin sees `GET /api/admin/overview` (counts, `riskDistribution`, recent directory, CSV export).

## 5. Stack that ships

**Frontend:** React 18.3 + Vite 6 + Tailwind v4 + Redux Toolkit 2.5 + persist + Recharts 3.1 + Framer Motion 12 + Axios + `apiUrl()` guard against `localhost` env mis-set.  
**Backend:** Node 20 + Express 4.19 + TypeScript 5.4 + Prisma 5.13 + `bcryptjs` + `jsonwebtoken` 7d + `cors`.  
**DB:** SQLite file in thesis (`file:./dev.db`) — same Prisma schema deploys to Postgres by switching `provider`.  
**Deploy:** `render.yaml` (`build: prisma generate && tsc`, `start: node dist/index.js`, `healthCheckPath: /health`) + static build `pnpm build`.  
**AI:** Server `/api/chat` is the source of truth; `src/components/chatagent/openRouterClient.ts` holds an optional `openai/gpt-4o` via OpenRouter with `MINDLINK_SYSTEM_PROMPT` (proxy recommended in production).

## 6. Honest deltas vs. prior draft

| Previously claimed | As-built reality |
|--------------------|------------------|
| ML classifier trained on labelled set | Deterministic weighted + regression rule engine (auditable) |
| PostgreSQL in production as-shipped | SQLite prototype (Postgres-ready schema, 2-line switch) |
| USSD gateway live, SMS alerts | `Checkin.source` + Settings UI scaffold; gateway is roadmap item |
| Google Calendar / Meet API write | Local `SchedulingModal` Meet link + `localStorage.sessions` persistence |
| Community board persisted | `CommunityPreview` is mock UI; model not yet in Prisma |

## 7. What an examiner can verify in 10 minutes

```bash
pnpm install && cd server && npm install
echo 'DATABASE_URL="file:./dev.db"' > server/.env
npx prisma db push && npx ts-node seed-demo.ts
npm run dev & pnpm dev
# Register as USER, then again with MINDLINK-PRACTITIONER-2024, MINDLINK-ADMIN-2024
# Walk Home → MoodCheckIn (watch WellbeingStatus + RiskAlertModal)
# Play /games → guess-what + stroop → check practitioner queue sorting
# Support → Schedule → MySession/Calendar persistence
# /api/chat with "I feel hopeless and alone" at RED → escalation prompt
```

## 8. Viva Q&A ready

- **Why not ML?** With <100 demo rows, a learned model would be brittle and unauditable; examiner can read the entire decision surface in one screen.
- **Why SQLite?** Reproducibility on any examiner laptop; zero cloud dependency for viva; migration is two lines.
- **Ethics?** No diagnosis; `explanation` supports human review; crisis info not automated dispatch; invite-gated roles; opt-in emergency contact.
- **Next step?** Africa's Talking USSD bind, Postgres, OAuth Calendar, 30-day pilot vs PHQ-9/GAD-7.

---

*Full thesis: `thesis/THESIS.md` (73k) and printable `thesis/preview.html` → Print to PDF.*
*Source transparency: `server/src/services/triageEngine.ts` (214 lines), `server/src/index.ts` (≈500 lines), `server/prisma/schema.prisma` (84 lines).*

