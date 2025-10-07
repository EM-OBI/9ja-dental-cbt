App features

1. Authentication and user dashboard that will contain progress on each clinical subspeacialty
2. Demo mode for free users with access to 180 questions total i.e. 20/specialty
3. Sub-based mode (basic and premium) with access to full question bank and AI insights into questions failed or passed
   basic - full access QB and quiz mode
   premium - all basic features + AI insights + study mode
4. Point-based system where every question passed add to total number of tokens and questions failed lead to point deductions
5. Leaderboard will be linked to total points and across entire system
6. Two modes - quiz modes and study mode

Color Palette (light mode)
primary - #3ab286 (58,178,134) - logo hgihlights, nav bacr, CTA buttons
secondary - #3a66b2 (58,102,178) - headers, links, dashboard sidebar, alternative button style
accent - #3aa2b2 (58,162,178) - hover states, progress bars, charts, icons
background #ffffff (255,255,255)
neutral/support - #dde4e5 (221,228,229) - for cards, test containers, or dashboard panels

Color Palette (dark mode)
primary - #3ab286 (58,178,134) - logo hgihlights, nav bacr, CTA buttons
secondary - #3aa2b2 (58,162,178)
accent - #3a66b2 (58,102,178)
background - #1a1a1a
neutral/support - #2a2a2a for cards, #dde4e5 for muted text/icons
text - #ffffff for main text, #dde4e5 for secondary text.

Fonts
Headings - "Merriweather bold", serif;
Body - "Inter", sans-serif;
Accent - font-family: "Roboto Mono", monospace; - for timers, scores, percentages, etc

## AI Study Pipeline

- Cloudflare Workers AI (GPT-4o Mini + GPT-5 Codex) generates topic summaries, flashcards, and adaptive quizzes.
- Outputs are persisted to Cloudflare R2 (`STUDY_BUCKET`) while structured metadata lives in D1 tables (`summaries`, `flashcards`, `study_quizzes`, `study_progress`).
- New API surface:
  - `POST /api/study/generate` – run the AI generation workflow for a topic.
  - `GET /api/study/:topic` – fetch stored materials for the authenticated user.
  - `POST /api/progress/update` – update completion state or quiz score.
  - `GET /api/progress/:userId` – retrieve the user's study progress records.
- Dashboard `Study` page lets users launch the workflow, review assets, and sync completion states.

### Migrations & Deployment

Run the new D1 migration locally before deploying:

```bash
pnpm run db:migrate:local
```

For production/preview deployments use Wrangler (replace the deploy flag as needed):

```bash
pnpm run build:cf
wrangler deploy
```
