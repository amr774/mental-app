# 🧠 Mindful — Mental Wellness Frontend

A clean, production-ready React frontend for a mental health app.

## Tech Stack
- **React 19** + **React Router v7**
- **Vite** — dev server & bundler
- **CSS custom properties** — design system (no CSS framework)
- **Google Fonts** — DM Serif Display + DM Sans

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx     # Auth state (React Context)
├── services/
│   └── api.js              # All API calls — plug your backend here
├── components/
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Home.jsx / .css
│   ├── Login.jsx / Auth.css
│   ├── Register.jsx
│   ├── Chatbot.jsx / .css
│   ├── MoodTracker.jsx / .css
│   ├── PersonalityTest.jsx / .css
│   ├── Profile.jsx / .css
│   └── Admin.jsx / .css
├── index.css               # Design tokens + global styles
├── App.jsx                 # Router
└── main.jsx
```

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Connecting Your Backend

1. Set `VITE_API_URL=http://localhost:8000` in `.env`
2. All API calls are in `src/services/api.js` — each function falls back to localStorage if the backend is not set
3. The service layer handles auth, articles, moods, and chat

## Routes

| Path       | Access     | Page            |
|------------|------------|-----------------|
| `/`        | Public     | Home            |
| `/login`   | Public     | Login           |
| `/register`| Public     | Register        |
| `/chatbot` | Auth       | AI Chat         |
| `/mood`    | Auth       | Mood Tracker    |
| `/test`    | Auth       | Emotional Test  |
| `/profile` | Auth       | Profile         |
| `/admin`   | Admin only | Admin Dashboard |

## Default Credentials (mock mode)

```
Admin:  admin@test.com  /  123456
User:   any@email.com   /  anypassword
```
