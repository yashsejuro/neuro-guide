# Neuro Guide

**A mental-wellness companion that tracks the boring things — mood, tasks, reminders — and helps you spot the patterns.**

Neuro Guide pairs a daily check-in loop with a supportive AI chat, so the data you log and the advice you get refer to the same day. Mood scores feed trend charts, completed tasks feed streaks and XP, and the chat companion can ground its suggestions in the technique library for the focus area you picked.

> Not a medical tool. Neuro Guide offers coping techniques and encouragement; it does not diagnose, and it points you towards professional help when a conversation calls for it.

## Features

- **Auth with protected routes** — Supabase email/password sign-in; the landing, login and signup pages are public, everything else redirects unless you have a session
- **Mood tracking** — log a 1–5 score, see it as a trend over time rather than a single number
- **Activities** — create daily tasks, tick them off, keep a routine
- **Reminders** — schedule meditation, exercise, hydration and break nudges that fire as browser notifications
- **Streaks, XP and badges** — 10 XP per completed task, 100 XP per level, and eight badges that unlock on first task, streaks and volume
- **Dashboard** — mood trend, task state, reminders and an overall wellness score in one view
- **"Neuro", the chat companion** — a floating chat that recommends specific techniques (breathing, grounding, mindfulness) with a short *why* and numbered steps, drawn from a structured recommendation library
- **Theme toggle and ambient music** — small comfort features that make it usable at 2am

## Stack

| Layer | Choice |
|---|---|
| UI | React 18, TypeScript, Vite 7, TanStack Router |
| Styling | Tailwind CSS, shadcn-style components, CSS custom properties per theme |
| Data | Supabase (Postgres, Auth, Row Level Security) |
| Charts | Recharts and Chart.js |
| Forms | react-hook-form + Zod |
| Motion | Framer Motion |
| AI | Groq chat completions, with a curated technique library in the system prompt |

## Data model

`schema.sql` is the whole backend — run it in the Supabase SQL editor. It creates four tables and enables RLS on each with per-user select/insert/update/delete policies, so a row is only ever visible to its owner:

- `profiles` — display name, focus area, XP
- `moods` — 1–5 score, timestamped
- `activities` — task title, completed flag
- `reminders` — reminder type and time

## Run it locally

```bash
npm install
```

Create `.env.local`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-key
```

Then, in your Supabase project, paste `schema.sql` into the SQL editor and run it. Finally:

```bash
npm run dev
```

Linting is wired up end to end:

```bash
npm run lint      # types + eslint + stylelint + custom CSS checks
npm run lint:types
npm run check:css-vars    # fails if tailwind.config.cjs references an undefined CSS variable
```

That CSS-variable check is a small script in `scripts/` — it exists because a missing `--sidebar-background` in `index.css` used to break the sidebar silently.

## Project layout

```
src/
  router.tsx              # TanStack Router routes + auth guard
  Shell.tsx               # app chrome: sidebar, theme toggle, floating chat
  pages/                  # Landing, Login, Signup, Dashboard, Mood, Activities, Reminders, Profile
  components/landing/     # Hero, Problem, Solution, Features, HowItWorks, CTA, Footer
  components/chat/        # FloatingChat
  lib/
    supabase.ts           # client + env validation
    chat-engine.ts        # system prompt, technique library, Groq call
    recommendations.ts    # structured technique catalogue
    gamification.ts       # XP, levels, badge definitions
  hooks/                  # useAuth, useTheme, useScrollReveal
```

## Status and known gaps

- No automated test suite for the React app yet — the auth guard and the XP/badge logic in `lib/gamification.ts` are the highest-value first targets
- The chat client calls Groq directly from the browser, so `VITE_GROQ_API_KEY` ships in the bundle. Fine for a demo, but move the call behind a serverless function before putting this in front of real users
- Next up: weekly mood digest, reminder scheduling that survives a closed tab, and export/delete-my-data
