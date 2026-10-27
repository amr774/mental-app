# Mindful web client

See the [repository README](../README.md) for the architecture, verified features, demo data and limitations.

Use Node 24. Run npm ci, copy .env.example to .env without overwriting existing configuration, then npm run dev. VITE_API_URL points to the Express API (default http://localhost:3000), not the optional emotion service. Build with npm run build and check with npm run lint. Serve dist with SPA fallback; see [deployment](../DEPLOYMENT.md).
