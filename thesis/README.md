# Thesis Artefacts — MindLink

This folder contains the **code-aligned thesis revision** built directly from the repository as it exists on branch `arena/01a08b29-mindlink-thesis`.

## Files

| File | Purpose | Size |
|------|---------|------|
| `THESIS.md` | **Source-of-truth thesis** (markdown, 73 KB, ~10 chapters + appendices). Every claim maps to a cited file/route. Print via the HTML preview. | 73 KB |
| `preview.html` | Styled, printable HTML rendering of `THESIS.md` generated with `marked`. Open in browser → `Ctrl/Cmd+P` → Save as PDF. Header sticks, print stylesheet hides chrome. | 93 KB |
| `EXECUTIVE_SUMMARY.md` | 2-page viva handout: engine weights, game scoring, escalation pathway, stack, honest deltas vs. prior draft, 10-minute verification steps. | — |
| `ALIGNMENT_MATRIX.csv` | Requirement → file/route traceability matrix (16 FRs + 4 NFRs + 4 deferred items). Open in Excel/Sheets to filter by Status. | — |
| `README.md` | This index. | — |

## Quick start for examiners

1. **Read the handout** — `EXECUTIVE_SUMMARY.md` (5 min).
2. **Read or print the thesis** — open `preview.html` in Chrome/Edge/Firefox → Print → Save as PDF (or read `THESIS.md` in VS Code Markdown Preview).
3. **Verify against code** — pick any row in `ALIGNMENT_MATRIX.csv` and open the listed file:
   - Risk engine: `server/src/services/triageEngine.ts` (214 lines, pure functions)
   - API surface: `server/src/index.ts` + `server/prisma/schema.prisma`
   - Dashboard: `src/components/dashboard/Home.tsx` + `WellbeingStatus.tsx`
   - Games: `src/components/games/GuessWhatGame/*` and `StroopGame/*`
4. **Run the artefact** (10 min walkthrough, see THESIS Appendix F).

## What changed in this revision

Prior draft described an ML classifier, live Postgres, USSD gateway, and Calendar OAuth. This revision **corrects the record**:

- **Engine:** deterministic weighted + regression rules (auditable, confidence-gated), not a learned model.
- **DB:** SQLite prototype (same Prisma schema deploys to Postgres by changing `provider`).
- **Channels:** USSD is *model-ready* (`Checkin.source` + Settings scaffold), not telco-wired.
- **Scheduling:** locally-generated Meet link + `localStorage.sessions`, not Google API.
- **Community:** preview mock; **Streaks:** computed from history, not yet DB-persisted.

Each correction is called out in thesis Ch. 8 and in the executive summary deltas table.

## Rendering to PDF

**Option A — Browser (recommended):** `open thesis/preview.html` → `Print` → Destination *Save as PDF* → Margins *Minimum* → Background graphics *On*.

**Option B — VS Code:** Open `THESIS.md` → `View > Open Preview` → `...` → `Export to PDF` (requires Markdown PDF extension).

**Option C — Pandoc (if installed):**

```bash
pandoc thesis/THESIS.md -o thesis/THESIS.pdf --pdf-engine=wkhtmltopdf \
  --metadata title="MindLink Thesis" -V margin-top=18 -V margin-bottom=18
```

The department's Word/LaTeX overlay can be applied over `THESIS.md` without altering technical content.

## Contact

Repository: `Sarfo-Paul/MindLink-Thesis` — branch `arena/01a08b29-mindlink-thesis`  
Live API fallback referenced in `src/config/api.ts`: `https://mindlink-ti7t.onrender.com`

---

*Last rebuilt: 10 September 2026 — from a full `find . -type f` walk and targeted reads of every file cited.*
