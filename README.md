# MOOL

> Memories. Our people. Our routines. Living independently.

An AI-powered cognitive and independence companion for elderly people,
built with React + Vite + TypeScript. The app connects memories, family,
routines and everyday safety — personalising gentle activities (memory
match, pattern recall, story recall, music, language games) from
family-added memories, and adapting difficulty to the patient's comfort
— never scoring or labelling them.

**Status: prototype build — not a live product.** All people, memories,
family messages and observations shown in the app are fictional demo
content. See `/privacy-policy`, `/terms` and `/cookies-policy` in the app
for plain-language details.

## Highlights

- Trilingual: English, Assamese (অসমীয়া), Bengali (বাংলা) — persisted.
- Caregiver app: memory bank with a real *sensitive* flag (sensitive
  memories are hard-excluded from every generated activity), routine
  reminders (times/tasks only — never dosages), plain-language insights,
  weekly report, family alerts, consent-based location safety.
- Patient app: personalised games driven by `activityGenerator` +
  `adaptationEngine` (accuracy, skips, response time and comfort feedback
  measurably reshape future sessions), diary, music garden with
  synthesised WebAudio soundscapes, voice mode, seed→tree journey.
- No backend: everything persists in browser `localStorage`, structured so
  a real API can be added later.
- Accessibility: WCAG AA-checked colour pairings, 48px+ touch targets,
  reduced-motion support, screen-reader labels, status never conveyed by
  colour alone.

## Third-party assets & licensing

| Asset | Source | License |
| --- | --- | --- |
| Lucide icons | `lucide-react` | ISC |
| Bricolage Grotesque, Atkinson Hyperlegible, Noto Sans Bengali | Google Fonts | SIL Open Font License |
| Cultural motif icons | hand-drawn inline SVG in `src/data/motifs.tsx` | project-owned |
| Family illustrations | AI-generated for this project | project-owned |
| Audio | synthesised in-browser via Web Audio API | no assets |

No analytics, tracking libraries or cookies are used (see `/cookies-policy`).

## Local-law note (India)

A real deployment of this product would need to comply with India's
**Digital Personal Data Protection (DPDP) Act, 2023** before processing any
real personal data — including:

- the patient's personal data (name, age, health-adjacent activity data),
- a family member's **voice recordings** and **photographs** shared through
  the app.

That would require, at minimum: explicit, revocable consent (the app's
consent-based location toggle is a small step in this direction), purpose
limitation, storage limited to the device or a secured backend, data-principal
rights (access, correction, erasure — partially prototyped via Export/Delete
in Caregiver → Privacy), and a grievance mechanism. None of this is
implemented here; this repository is an academic/hackathon prototype holding
only fictional demo data.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
```
