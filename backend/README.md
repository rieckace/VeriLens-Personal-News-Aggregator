# Backend (Express + MongoDB)

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install deps:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/users/preferences`
- `PUT /api/users/preferences`
- `GET /api/articles/feed`
- `POST /api/articles/refresh`
- `POST /api/articles/:id/read`
- `POST /api/articles/:id/bookmark`
- `DELETE /api/articles/:id/bookmark`
- `GET /api/users/bookmarks`
- `GET /api/users/history`
- `GET /api/analytics`
