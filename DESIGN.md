# Design Notes

## Product intent

AuraWell is an approachable, non-diagnostic wellness prototype for youth and campus-oriented use. It brings conversational support, self-reported symptom triage, and a check-in ledger into one workspace. The interface should make it clear when content is AI-generated, what inputs were used, and where professional care is needed.

## Visual language

- **Canvas:** pale slate background (`#F8FAFC`) with white content surfaces.
- **Text:** deep slate (`#0F172A`) for primary content; muted slate for supporting text.
- **Primary accent:** emerald for active controls and routine-care actions.
- **Urgency accents:** amber for non-urgent consultation and red for urgent pathways or warning signs.
- **Typography:** Plus Jakarta Sans for headings, Public Sans for body copy, and IBM Plex Mono for numeric values.
- **Components:** restrained borders, rounded cards, compact labels, and limited shadow use.

These choices are implemented primarily in `src/index.css` and utility classes in the view components.

## Layout and navigation

- A compact top bar links to Wellness Agent, Symptom Triage, and Health Ledger.
- A segmented view switcher supports navigation on smaller screens as well as desktop.
- Content is centered in a responsive workspace with a maximum width of 1360px.
- The triage view places user-entered biometrics and symptoms beside its assessment output on wide screens; the layout stacks on narrow screens.
- Preserve the existing three-view UI. The legacy Lean Canvas and Submission Kit components are not active navigation destinations.

## Interaction patterns

- Use labeled controls and visible units for vital measurements.
- The triage age can be edited as a number or adjusted with its slider; both controls share the same value.
- Any change to a submitted triage input clears the prior result. A result identifies the age, symptoms, duration, and vital values assessed.
- Show loading and API errors in the interface; do not replace failed AI responses with a result that looks successful.
- Display score contributors alongside the index so users can understand which submitted factors changed the heuristic score.
- Keep the wellness assistant conversational and broadly usable; its user-facing name is “AuraWell Assistant.”
- Keep interactive controls keyboard accessible and use semantic labels, buttons, and alert roles.

## Safety and trust

- Triage output is decision-support content only, not a diagnosis.
- The application-generated score is a heuristic screening aid and must not be described as medically validated.
- Emergency red flags and care recommendations should remain distinct from the numeric score.
- Do not imply that demonstration ledger records are real user or patient data.
- Do not expose API keys, model credentials, or sensitive user data in the browser.

## Design maintenance

When adding a view or new user flow, preserve consistent spacing, typography, color meaning, keyboard access, and explicit error/loading states. Update this file if the app-wide navigation or visual foundations materially change.
