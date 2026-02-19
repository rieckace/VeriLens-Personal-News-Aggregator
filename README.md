# VeriLens

VeriLens is an AI-assisted personalized news aggregator (full-stack) with authentication, preferences-based ranking, article signals (sentiment / bias / “fake probability”), bookmarks, reading history, and an analytics dashboard.

This repository contains:

- Backend: Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt
- Frontend: React (Vite) + Tailwind CSS + Axios + Chart.js
- News ingestion: NewsAPI.org (with a mock fallback for demos)
- E2E UI tests: Selenium (Python)

## Features

- Auth: Register / Login / JWT-protected APIs
- Preferences: pick categories to personalize your feed
- Feed: refresh ingestion + search + filters + ranking
- Signals per article:
	- Sentiment (lexicon-based)
	- Bias indicator (keyword heuristic)
	- Fake probability (clickbait/sensationalism heuristic)
- Bookmarks and reading history
- Analytics dashboard (based on your usage)

## Repo structure

- backend/ — Express API + MongoDB models + ingestion/scoring services
- frontend/ — React UI
- tests/selenium/ — Selenium E2E tests and instructions

## Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally (or a MongoDB Atlas connection string)
- (Optional) NewsAPI key from https://newsapi.org
- (Optional) Python 3.10+ for Selenium tests

## Quick start (Windows / PowerShell)

### 1) Backend

```powershell
cd backend
copy .env.example .env
notepad .env
npm install
npm run dev
```

Backend default URL: http://localhost:5000

Notes:

- `npm run dev` is configured to auto-free port 5000 on Windows if an old backend process is still running.
- If `NEWS_API_KEY` is missing/empty, the backend can still run (mock fallback). If you want real news, set `NEWS_API_KEY`.

### 2) Frontend

```powershell
cd frontend
copy .env.example .env
notepad .env
npm install
npm run dev
```

Frontend default URL: http://localhost:5173

If port 5173 is busy, Vite may use 5174 (or next). When that happens, set `CLIENT_ORIGIN` in backend `.env` as a comma-separated list, for example:

```text
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
```

## Environment variables

### Backend (.env)

Create `backend/.env` from `backend/.env.example`.

Required:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — long random string

Optional:

- `PORT` — default 5000
- `CLIENT_ORIGIN` — allowed frontend origins (comma-separated)
- `NEWS_API_KEY` — NewsAPI key
- `NEWS_API_BASE_URL` — default `https://newsapi.org/v2`
- `NEWS_DEFAULT_COUNTRY` — default `us`
- `NEWS_FETCH_INTERVAL_CRON` — default `*/30 * * * *`
- `ENABLE_SCHEDULED_FETCH` — `true` / `false`

### Frontend (.env)

Create `frontend/.env` from `frontend/.env.example`.

- `VITE_API_BASE_URL` — backend API base URL (example: `http://localhost:5000/api`)

## API overview (backend)

Base URL: `http://localhost:5000/api`

- Auth
	- `POST /auth/register`
	- `POST /auth/login`
	- `GET /auth/me`
- Users
	- `GET /users/preferences`
	- `PUT /users/preferences`
	- `GET /users/bookmarks`
	- `GET /users/history`
- Articles
	- `POST /articles/refresh`
	- `GET /articles/feed`
	- `GET /articles/:id`
	- `POST /articles/:id/read`
	- `POST /articles/:id/bookmark`
	- `DELETE /articles/:id/bookmark`
- Analytics
	- `GET /analytics/summary`

All endpoints under `/users`, `/articles`, `/analytics` require an `Authorization: Bearer <token>` header.

## Scoring notes

The “bias” and “fake probability” values are heuristics based on limited text fields returned by NewsAPI (often just title/description). They are meant for demo/UX purposes, not as definitive fact-checking.

## Selenium E2E tests

See tests/selenium/README.md

## GitHub safety (secrets)

- `.env` files are ignored by `.gitignore` at repo root and in each app folder.
- Keep secrets only in `.env` and share only `.env.example`.

If you accidentally committed an `.env` file in the future, remove it from git tracking:

```powershell
git rm --cached backend/.env frontend/.env
git commit -m "Remove env files from git"
```
