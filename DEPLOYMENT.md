# Mindful deployment preparation

No verified public demo is available. On 2026-10-27, repository homepage/Pages and the public deployments API contained no deployment. GitHub permissions are available; a compatible Node/MongoDB hosting account is not connected. No paid service was provisioned.

## Web and API

Use Node 24, MongoDB, HTTPS and a persistent disk for public avatars. Build `mental-app/` with `npm ci && npm run build`, setting `VITE_API_URL=/api` at build time for the included same-origin Nginx example. Publish `mental-app/dist` with SPA fallback. Native mobile needs an absolute HTTPS `EXPO_PUBLIC_API_URL` instead.

Install the backend with `npm ci --omit=dev`, inject environment variables and run `npm start` from `backend/`. The optional image builds with `docker build -t mindful-api backend`; attach a persistent, node-writable volume at `/data/uploads`. The image and Nginx configuration are prepared but not container-tested because Docker's engine was unavailable.

Required runtime variables:

| Variable | Meaning |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Dedicated authenticated database, provider-required TLS, restricted network and backups |
| `JWT_SECRET` | Random signing secret, at least 32 characters, never a public Vite/Expo variable |
| `ALLOWED_ORIGINS` | Comma-separated exact HTTPS UI origins, without paths/trailing slashes |
| `UPLOAD_DIR` | Absolute persistent avatar directory, writable by the API user |
| `PORT` | API listening port, default 3000 |
| `GROQ_API_KEY` | Optional server-only chatbot provider key; absent means limited fallback replies |
| `EMOTION_API_URL` | Optional private emotion inference origin; server/model artifacts are missing from this repository |

The API validates the production configuration before listening. `/health` returns 200 only with a connected MongoDB instance. This becomes `/api/health` behind the sample proxy. Preserve the Authorization header. Authentication uses a bearer JWT stored in browser localStorage, not cookies; do not claim HttpOnly session protection. CORS uses exact configured origins. Current rate limits are per process, with no trusted-proxy configuration: use one API instance and edge rate limiting for a demo.

`deploy/nginx.conf.example` is a location snippet for an existing HTTPS server. Set its static root/upstream and certificates in your actual host configuration. `/api/uploads/avatars/...` reaches the API's `/uploads/avatars/...`; avatars are public and must not contain private documents. MIME restrictions/size limits and safe server-generated extensions exist; decoded-content scanning is not implemented.

## Optional services and limits

- Groq requests are external network calls. Confirm the account's quota/cost and data handling before enabling them. Chatbot responses are not clinical diagnoses, and crisis responses/localized resources need product review before public health use.
- Emotion Scan is an incomplete integration. The frontend now uses the authenticated backend proxy, but `api_server.py` and required weights are not supplied. Do not advertise working inference. The `chatbot2/` Python experiments are not required to run the web app and have no reproducible complete runtime specification.
- Password recovery has no email delivery integration. Production returns a clear unavailable response instead of logging reset tokens and pretending to send email. Development recovery logs local tokens; do not publish those logs.
- Orders/pet adoption are application records, not payment, fulfillment or real adoption services. No payment gateway exists. Seven-day bearer tokens are not revoked on password change; stronger session lifecycle work is needed before sensitive public use.
- English/Arabic controls work, but not every secondary screen string is translated. No native device, camera, iOS distribution or app-store signing was tested.

## Isolated demo

Use a new `mental_demo` database, a `demo@example.test` email and a unique `DEMO_PASSWORD` of 12+ characters. Run `npm run seed:demo` from `backend/`. It creates one ordinary user with synthetic journal/mood entries and refuses an existing email or production. It never removes or rewrites existing records. The legacy catalog seed is disabled unless explicitly opted into and now refuses non-empty collections.

Verify signup/login, persisted journal and mood entries, ownership rejection, goals, avatar retrieval, mobile navigation, Arabic direction, restart persistence and HTTPS CORS on the actual host before publishing a demo link. To deploy, provide a suitable hosting connection plus MongoDB and persistent storage; supply secrets through its secret manager, not in chat or Git.
