# Kulinara

An iOS-first smart kitchen experiment built with React Native and Expo. The idea was to reduce food waste and grocery costs by photographing groceries, tracking when they might expire, and reminding you to use them.

**Status: discontinued proof of concept.** I am keeping the code public as a record of the experiment and what I learned. It is available for local experimentation, with no active product roadmap.

## Why I stopped

I wanted this app to make everyday life easier. In practice, I think the workflow added too much friction: take a photo, wait for recognition, review the results, correct the items and dates, and then keep the inventory up to date as food gets used or thrown away.

My own shopping trips made that friction clear. I would put products in the cart, move them into bags, and then, once home, take them out and arrange them so they were spread out and visible enough for a photo before finally putting them in the fridge or cupboards. It felt like handling the same groceries over and over again. The app added another step right when I wanted to finish unpacking.

Photo recognition could help with the first step, but it could not remove the ongoing work of maintaining an accurate picture of the kitchen. Estimated expiration dates also needed judgment and correction. The app risked becoming another list to manage, rather than something that quietly saved time.

For me, that made the experience too cumbersome for the value it offered. This is my assessment of the experiment, rather than a conclusion from a user study. The useful lesson was that reducing typing is only one part of reducing effort; the whole daily workflow has to be easier.

I can imagine the idea working better with store app integrations that could send a digital receipt and use it to create the item list. That would capture the purchase without asking me to arrange everything for another photo, although keeping track of what gets consumed would still need solving.

One experience I really liked was shopping at a Kaufland store here in Bulgaria: I could pick up a handheld scanner, scan items as I took them, and then go to self-checkout. The scanning fitted into what I was already doing. That is closer to the kind of convenience I wanted Kulinara to provide. Receipt integration is a possible direction, rather than a feature implemented in this prototype.

## What the prototype contains

- A grocery list ordered by expiration, with expired and expiring-soon indicators.
- Manual add, edit, and delete, including optional weight and notes.
- Local SQLite storage.
- Camera or photo-library input, sent to OpenAI for grocery recognition and estimated shelf life.
- Editable recognition results before saving.
- Local reminders scheduled for the day before expiration and on the expiration day, subject to notification permission.

Cloud sync, accounts, remote push notifications, recipes, and subscriptions were planned but were not implemented. The original proposals are in [docs/mvp.md](docs/mvp.md) and [docs/phase_1.md](docs/phase_1.md); they describe historical intent and may differ from the code.

## Run locally

The intended target is iOS. Use Node.js 22 LTS (22.13 or newer), npm, and macOS with Xcode and its iOS tooling for a local native build. The app uses native modules, including the image editor, so use a development build rather than Expo Go.

```bash
git clone https://github.com/niksfred/kulinara.git
cd kulinara
npm ci
cp .env.example .env
```

Manual grocery tracking does not require an API key. To try photo classification, put your own key in `.env`:

```dotenv
OPENAI_API_KEY=your-own-key-here
```

Then build and run:

```bash
npm run ios
```

For subsequent development sessions with the development build already installed:

```bash
npm run start -- --dev-client
```

Restart Expo after changing `.env`. Rebuild the native app after changing native dependencies or configuration. Camera capture needs a physical device; use a photo from the library in the simulator. Grant camera/photo and notification permissions when testing those features.

`npm run android` and `npm run web` remain available as development commands, but Android and web are not validated targets. Native storage, notifications, the date picker, and image processing can require platform-specific work.

## Configuration, privacy, and limitations

`.env` and its variants are ignored by Git; `.env.example` contains placeholders only. `OPENAI_API_KEY` is optional and is used only for photo classification. Missing configuration produces an error when classification is attempted.

**The key is embedded in the app's public Expo configuration.** An ignored environment file keeps it out of source control, but does not make it secret inside a built app. This direct API integration is for local experiments using your own key. Do not share an app build or web export containing it. A distributed app would need a backend that holds the provider key. See [Expo's app configuration documentation](https://docs.expo.dev/workflow/configuration/).

Classification uses `gpt-4o-mini`, requires network access, and can incur charges on your API account. Photos are resized and encoded as JPEG before being sent to OpenAI. Saved grocery records remain in local SQLite; there is no app-owned backend or cloud sync.

Dates inferred from a photo or the default mapping are rough shelf-life estimates, not verified package dates or food-safety advice. Review and correct them. Recognition can miss or misidentify groceries. The app does not automatically know when food has been consumed; update or delete items manually (long-press to delete).

Reminder scheduling is experimental. If a reminder time is already past, the current code schedules it 30 or 60 minutes from now instead. Delivery depends on system permissions and device behavior.

## Checks and manual verification

```bash
npm run lint
npm run typecheck
```

No automated device test suite is configured. Lint and type checks do not establish that the native app works end to end. To verify a local build:

1. Without a key, add a grocery, restart the app, and check that it persists.
2. Edit its name, notes, and expiration; confirm the saved values after reopening.
3. Grant notification permission, check scheduled reminders, change the date, and verify old reminders are canceled. Delete the item and check cancellation again. Repeat with notification permission denied.
4. With your own key, select a grocery photo, review/correct the detected items and dates, remove an unwanted detection, save, and check the list.
5. Try a missing/invalid key and an offline classification request; check that errors are understandable and manual tracking remains usable.

### Verification on 23 November 2026

Lint, TypeScript checking, Expo dependency compatibility, native iOS project generation (without compiling), an iOS JavaScript bundle export, and a clean lockfile install passed during publication preparation. A temporary logic smoke check exercised SQLite CRUD, reminder replacement/cancellation with mocked notifications, and photo-result mapping with a mocked provider. These checks do not replace native device testing; simulator/device flows and real API recognition remain unverified.

Gitleaks found no secrets in the publishable files or fetched Git history. Compatible dependency updates removed the critical audit findings. The remaining npm audit report contains 28 findings (22 moderate, 6 high); further remediation is outside this preservation cleanup and needs dependency/SDK compatibility review. This prototype is not a production-ready release.

## Code layout

- `app/`: Expo Router screens and navigation.
- `services/`: photo classification and local notifications.
- `storage/`: SQLite persistence.
- `types/`, `constants/`, `utils/`: data shapes, expiration defaults, and date helpers.
- `docs/`: original product proposals.

## License

[MIT](LICENSE).
