# Project Structure

## Top level

```text
.
├── .env.example         # Safe environment-variable template
├── index.html           # Vite HTML entry point and page metadata
├── package.json         # Scripts and application dependencies
├── server.ts            # Express API and Vite/production static hosting
├── vite.config.ts       # React, Tailwind, and Vite configuration
├── README.md            # Setup and project overview
├── DESIGN.md            # Interface and interaction design notes
├── STRUCTURE.md         # This file
├── LEAN_CANVAS.md       # Project strategy hypothesis
├── DEPLOYMENT.md        # Build and hosting notes
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── WellnessAgentView.tsx
    │   ├── SymptomTriageView.tsx
    │   ├── HealthLedgerView.tsx
    │   ├── LeanCanvasView.tsx       # Legacy component; not mounted in App
    │   └── SubmissionKitView.tsx    # Legacy component; not mounted in App
    └── data/
        └── sdg3Data.ts
```

## Application layers

### Browser application

- `src/main.tsx` mounts the React application and imports global styles.
- `src/App.tsx` owns the selected view, health-ledger state, and navigation between the three active views.
- `src/components/WellnessAgentView.tsx` implements the general AuraWell Assistant interface, check-in controls, and breathing exercise.
- `src/components/SymptomTriageView.tsx` gathers current symptoms and biometrics, requests an assessment, displays the exact assessed inputs and score factors, and allows the result to be added to the ledger.
- `src/components/HealthLedgerView.tsx` displays, filters, adds, deletes, and exports ledger records.
- `src/data/sdg3Data.ts` contains shared TypeScript types, symptom options, check-in questions, and initial demonstration entries.
- `src/index.css` defines Tailwind imports, font variables, base styles, and print behavior.

### Server

- `server.ts` loads environment variables, configures Express, and exposes the API endpoints.
- The Gemini client and configured model are used only on the server. The API key must not be added to frontend source.
- The same Express process runs Vite middleware in development. In production it serves the built `dist/` directory and the SPA entry point.
- The triage endpoint validates input, requests AI-written assessment content, and calculates the input-based screening index in application code.

## Data flow

1. `App.tsx` renders one active view.
2. The wellness and triage views send requests to same-origin `/api/...` endpoints.
3. `server.ts` validates requests and calls Gemini using server-side environment variables.
4. Triage scores are calculated from the submitted values; the response includes the inputs used so the UI can display their provenance.
5. The views pass new ledger records to `App.tsx`; ledger state remains in memory for the current app session.

## Current persistence boundary

There is no database or account system in the current application. Initial ledger records are demonstration data, and user-added records are kept in React state. Refreshing the page resets those changes.
