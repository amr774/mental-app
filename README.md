# Mindful · mental-app

A wellness application for recording moods, keeping a personal journal and tracking small goals. The repository contains a React web client, Express/MongoDB API, Expo mobile client and separate Python experiments.

![Mindful journal with a synthetic demo entry](docs/screenshots/desktop.png)

[Arabic mobile view](docs/screenshots/mobile-ar.png) · [Current review](docs/PORTFOLIO_REVIEW.md) · [Deployment](DEPLOYMENT.md)

These are real screenshots of the locally running app on 2026-10-27, using non-personal demo content. No verified public demo is available.

## Implemented scope

- Account registration/login, profile editing and avatar uploads.
- User-scoped journals, daily moods/history, goals and completion tracking.
- Dashboard, breathing timer, questionnaire, community posts and article views.
- Store/pet listings and order records; **no online payment or fulfillment integration**.
- Arabic/English controls and light/dark themes; some secondary strings remain English.
- Chat routes with optional Groq integration and limited fallback replies without a key.

Emotion Scan has a frontend and backend proxy but its inference server/weights are not included. It is not a working bundled feature. This project is not a diagnostic service or a substitute for professional care; health content and crisis handling are not clinically validated.

## Stack and directories

| Directory | Role |
| --- | --- |
| `mental-app/` | React 19, Vite, React Router, Recharts web UI |
| `backend/` | Express 5, Mongoose/MongoDB, JWT, bcrypt, Multer API |
| `mobile/` | Expo 52, React Native 0.76 mobile client |
| `chatbot2/` | Python RAG/recommendation experiments, separate from the running API |

Generated node_modules are no longer tracked; install from each lockfile. There is no root npm workspace.

## Local web setup

Use Node 24, npm and a running MongoDB instance. In `backend/`:

```sh
npm ci
# Copy .env.example to .env only if it does not exist; replace JWT_SECRET.
npm start
```

In a second terminal, from `mental-app/`:

```sh
npm ci
# Copy .env.example to .env only if it does not exist.
npm run dev
```

Open http://localhost:5173. API: http://localhost:3000; database readiness: http://localhost:3000/health. The frontend must use the matching `VITE_API_URL`; do not point it at the optional Python service.

| Variable | Location / meaning |
| --- | --- |
| `MONGO_URI` | Backend private connection; choose a dedicated database |
| `JWT_SECRET` | Backend random 32+ character signing secret |
| `PORT` | Backend port, default 3000 |
| `ALLOWED_ORIGINS` | Exact frontend origins, comma separated |
| `NODE_ENV` | development or production |
| `UPLOAD_DIR` | Persistent avatar directory; defaults to backend/uploads |
| `GROQ_API_KEY` | Optional backend-only provider key |
| `EMOTION_API_URL` | Optional backend-only inference origin; service not supplied |
| `VITE_API_URL` | Public web API base without trailing slash |
| `EXPO_PUBLIC_API_URL` | Public absolute API base for mobile |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(40).toString('hex'))"` and save it only in your local/hosting secret configuration. Do not commit .env, uploads or user exports.

## Demo and mobile

For synthetic data, select a new `mental_demo` database, set `DEMO_EMAIL=demo@example.test` and a unique `DEMO_PASSWORD` of 12+ characters, then run `npm run seed:demo` in backend. It refuses an existing account and never clears data. Do not use the legacy catalog seed for portfolio content.

For Expo, copy `mobile/.env.example` to `mobile/.env`, then run `npm ci` and `npm start` inside mobile. Android emulator uses 10.0.2.2 for the development host; a physical phone needs your host LAN address. An Android JavaScript/Hermes export was verified; that is not a signed APK or a native-device test. Configure your own EAS project, signing and app identifiers before distribution.

## Checks and limits

- Backend: `npm test` (requires a dedicated local `mental_test` or `mental_portfolio_DATE` database). Tests cover configuration, login, ownership, journal, mood, goals and avatar retrieval.
- Web: `npm run lint`, `npm run build`. Current lint has existing warnings documented in the review.
- Mobile: `npx expo export --platform android --output-dir dist`.

Chromium signup/login, journal creation, Arabic direction and mobile navigation were exercised. Groq responses, emotion inference, native camera and signed native builds were not verified. Password recovery has no email provider; production returns unavailable. Authentication stores bearer JWTs in localStorage and does not revoke old tokens on password change. See [deployment boundaries](DEPLOYMENT.md).

## Portfolio / CV description

> React and Express wellness application backed by MongoDB, with personal journaling, mood history, goal tracking, profile uploads and Arabic/English interfaces, plus an Expo mobile client and optional chatbot integration.
