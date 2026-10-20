# Design Notes

## Product intent

AuraWell is an approachable, non-diagnostic wellness prototype for youth and campus-oriented use. It brings conversational support, self-reported symptom triage, and a check-in ledger into one workspace. The interface should make it clear when content is AI-generated, what inputs were used, and where professional care is needed.

## Visual language

- **Canvas:** warm, pale sage (`#F5F8F5`) with soft green ambient gradients.
- **Text:** deep forest for primary content; muted green-gray for supporting text.
- **Primary accent:** forest green for active controls and routine-care actions, with soft mint highlights.
- **Urgency accents:** amber for non-urgent consultation and red for urgent pathways or warning signs. Keep these meanings distinct from decorative green accents.
- **Typography:** Plus Jakarta Sans for headings, Public Sans for body copy, and IBM Plex Mono for numeric values.
- **Components:** generously rounded cards, restrained green-gray borders, subtle shadows, and clear focus indicators.
- **Welcome panel:** dark forest gradient, calm illustrative accents, and reassuring but non-clinical copy.

These choices are implemented primarily in `src/index.css` and utility classes in the view components.

## Layout and navigation

- A responsive top bar links to Wellness check-in, Symptom guide, and Health journal on desktop and mobile.
- A shared welcome panel provides product context and a gentle entry point above each active view.
- Content is centered in a responsive workspace with a maximum width of 1360px.
- The triage view places user-entered biometrics and symptoms beside its assessment output on wide screens; the layout stacks on narrow screens.
- Preserve the existing three-view UI. The legacy Lean Canvas and Submission Kit components are not active navigation destinations.

## Interaction patterns

- Use labeled controls and visible units for vital measurements.
- The triage age can be edited as a number or adjusted with its slider; both controls share the same value.
- Any change to a submitted triage input clears the prior result. A result identifies the age, symptoms, duration, and vital values assessed.
- Show loading and API errors in the interface; do not replace failed AI responses with a result that looks successful.
- Display score contributors alongside the index so users can understand which submitted factors changed the heuristic score.
- Keep the wellness assistant conversational and focused on medical/wellbeing questions and the AuraWell project's purpose, features, and concepts. The server checks scope before generating a response and redirects unrelated topics; its user-facing name is “AuraWell Assistant.”
- Keep interactive controls keyboard accessible and use semantic labels, buttons, and alert roles.

## Safety and trust

- Triage output is decision-support content only, not a diagnosis.
- The application-generated score is a heuristic screening aid and must not be described as medically validated.
- Emergency red flags and care recommendations should remain distinct from the numeric score.
- Do not imply that demonstration ledger records are real user or patient data.
- Do not expose API keys, model credentials, or sensitive user data in the browser.

## Design maintenance

When adding a view or new user flow, preserve consistent spacing, typography, color meaning, keyboard access, and explicit error/loading states. Update this file if the app-wide navigation or visual foundations materially change.
