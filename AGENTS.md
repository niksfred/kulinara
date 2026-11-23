# Repository Guidelines

## Project Status

- Discontinued proof of concept, preserved for learning and local experimentation.
- README.md is the source of truth for current behavior and setup.
- docs/mvp.md and docs/phase_1.md are historical proposals, not an active roadmap.
- Keep changes bounded to maintenance unless explicitly asked to resume product development.

## Original Product Direction

- Build an iOS-first smart kitchen app: detect groceries from photos, track expirations, remind users, and suggest recipes.
- Core user value: reduce food waste and grocery cost with low manual effort.
- See `docs/mvp.md` for the original roadmap and feature intent.

## Historical MVP Priorities (Execution Order)

- Phase 1: local-first grocery tracking, photo classification via external API, manual edits, local expiration notifications.
- Phase 2: Cloudflare backend (Worker + D1/KV), Sign in with Apple, cloud sync.
- Phase 3: APNs push notifications from backend scheduled jobs.
- Phase 4: recipe suggestions from expiring items.
- Phase 5: subscriptions and premium gating.

## Project Structure & Module Organization

- `app/`: Expo Router screens/layouts. Keep route files focused on UI and orchestration.
- `components/` and `components/ui/`: reusable presentation components.
- `hooks/`: app-specific hooks (`.web.*` variants only when needed).
- `constants/`: shared constants and theme values.
- `assets/`: static images/icons/fonts.
- `docs/`: product and planning docs (`docs/mvp.md`).
- `ios/`: native project files for iOS builds.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run start`: run Expo dev server.
- `npm run ios`: run iOS app locally.
- `npm run android`: run Android app locally.
- `npm run web`: run web target.
- `npm run lint`: run ESLint checks.

## Coding Style & Naming Conventions

- Use 2-space indentation and keep lint clean before PRs.
- JavaScript and TypeScript are both allowed; avoid mixing styles within a file.
- Prefer clear, small modules and explicit data-shape boundaries around API/storage code.
- Component files use PascalCase (example: `ParallaxScrollView.tsx`); hooks use `useXxx` naming.

## Testing Guidelines

- No test runner is configured yet; add one with a `npm test` script when introducing tests.
- Suggested naming: `*.test.tsx` or `*.test.jsx`.
- Minimum expectation for MVP features: verify item CRUD flow, expiration scheduling logic, and photo-to-item mapping behavior.

## Commit & Pull Request Guidelines

- Commit messages: short imperative format (example: `Add expiration reminder scheduling`).
- PRs must include: scope summary, user-facing impact, and screenshots for UI changes.
- Link issues/tasks and note any follow-up work against MVP phases.

## Architecture & Integration Notes

- Frontend stack: React Native + Expo.
- Planned backend: Cloudflare Workers with D1/KV/R2.
- Notifications path: local notifications first, APNs server-driven push later.
- Keep premium checks and feature flags isolated so subscription rollout is incremental.
