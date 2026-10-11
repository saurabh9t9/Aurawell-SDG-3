# AuraWell SDG 3

AuraWell is a web-based wellness and early symptom-triage prototype aligned with UN Sustainable Development Goal 3: Good Health and Well-being. It combines a conversational wellness assistant, an AI-supported symptom assessment, and an in-memory health ledger.

> **Important:** AuraWell is a prototype and is not a medical device. Triage results and risk scores are informational screening aids, not diagnoses or a substitute for professional medical care. Seek emergency help for urgent symptoms.

## Features

- **AuraWell Assistant** — a general-purpose conversational assistant powered by the configured Gemini model.
- **Symptom Triage** — submit selected symptoms, age, temperature, resting heart rate, symptom duration, sleep, and optional notes for an AI-generated non-diagnostic assessment.
- **Input-based screening index** — a deterministic score calculated from the triage inputs, with its contributing factors shown in the result.
- **Health Ledger** — view and manage check-ins during the current browser session. The ledger starts empty and displays only records added during your session.

The app navigation contains these three views. Lean Canvas and Submission Kit are not part of the current UI. The Lean Canvas in [LEAN_CANVAS.md](./LEAN_CANVAS.md) is project documentation only.

## Requirements

- Node.js 22.12 or newer
- npm
- A Gemini API key to use AI chat and symptom triage

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   Add your Gemini API key to `.env`. Keep this file private; it is excluded from Git.

3. Start the app:

   ```sh
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | For AI features | Server-side Gemini API key. Never expose it in browser code or commit it. |
| `GEMINI_MODEL` | No | Gemini model ID. Defaults to `gemini-3.5-flash-lite` when unset. |
| `PORT` | No | HTTP port. Defaults to `3000`. |
| `NODE_ENV` | No | Set to `production` to serve the production build from `dist/`. |

See [.env.example](./.env.example) for a safe template.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Express server with Vite development middleware. |
| `npm run lint` | Run the TypeScript check (`tsc --noEmit`). |
| `npm run build` | Build the frontend into `dist/`. |
| `npm start` | Start the Node server. Build first when running in production. |

## API overview

- `GET /api/health` — reports server health and whether a Gemini key is configured.
- `POST /api/wellness-chat` — accepts a message and optional conversation history.
- `POST /api/symptom-triage` — accepts symptom and vital-sign inputs; returns the AI assessment, exact assessed inputs, and calculated screening score.

AI endpoints return an error when the AI service is not configured or cannot provide a valid response. Triage does not silently substitute a canned assessment.

## Documentation

- [Structure](./STRUCTURE.md) — source tree and responsibilities.
- [Design](./DESIGN.md) — UI principles, styling, and interaction patterns.
- [Lean Canvas](./LEAN_CANVAS.md) — working project hypothesis and assumptions.
- [Deployment](./DEPLOYMENT.md) — production build and hosting requirements.

## Privacy and safety notes

- Keep `.env` and all API credentials private.
- Do not submit real patient-identifying or otherwise sensitive health information to this prototype.
- The health ledger is held in client-side application state; it is not a persistent, access-controlled medical record system.
- The risk index is a heuristic implementation, not a clinically validated scoring instrument.
