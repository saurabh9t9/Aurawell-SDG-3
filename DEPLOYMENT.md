# Deployment

## Current runtime

AuraWell is a Node.js application: one Express server handles the API and serves the React single-page app. The `npm run build` command creates static frontend assets in `dist/`; the API is still provided by `server.ts`.

Use a Node.js host that can run a long-lived server process and configure environment variables:

1. Install dependencies with `npm install`.
2. Set `GEMINI_API_KEY` in the host's private environment-variable settings.
3. Optionally set `GEMINI_MODEL` and `PORT`.
4. Build the frontend using `npm run build`.
5. Start the server with `npm start`.
6. Check `GET /api/health` after deployment. Do not treat a configured-key indicator as proof that Gemini requests will succeed.

The server serves `dist/` when `NODE_ENV=production`. The deployment environment must preserve the server-side environment variables and provide a Node version compatible with the project dependencies (Node.js 22.12 or newer is recommended).

## Vercel

The root `vercel.json` builds the Vite frontend. The catch-all function in `api/` runs the Express API routes (`/api/health`, `/api/wellness-chat`, and `/api/symptom-triage`) as Vercel Functions. This app does not use pathname-based client routes, so no SPA rewrite is needed; leaving API paths untouched ensures they reach the function. Configure `GEMINI_API_KEY` and optionally `GEMINI_MODEL` as private project environment variables. Never add the Gemini key to a `VITE_*` variable or client bundle.

## Operational and safety checklist

- Keep `.env` out of version control; set secrets in the hosting provider instead.
- Configure rate limits and request-size limits appropriate for public access.
- Use HTTPS and review logging so user-submitted health context is not unnecessarily retained.
- Do not send real identifiable health data to this prototype.
- The in-memory health ledger resets when the app reloads and is not a persistent clinical record.
- Review [README.md](./README.md) and [DESIGN.md](./DESIGN.md) for setup and safety limitations.
