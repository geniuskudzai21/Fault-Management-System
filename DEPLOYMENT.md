# Deployment Guide

Backend on **Render**, frontend on **Vercel**, database on **Neon Postgres**.

```
Neon Postgres  <--  Render (backend API)  <--  Vercel (frontend SPA)
```

## 1. Neon Postgres

Create a project at [console.neon.tech](https://console.neon.tech), then copy the
**pooled** connection string (Dashboard -> Connection Details -> Pooled connection):

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

Do not append `&channel_binding=require` — the serverless HTTP driver does not
support SCRAM channel binding and auth will fail.

The schema is created automatically on boot (`CREATE TABLE IF NOT EXISTS`), so no
manual migration step is needed for a fresh database.

## 2. Render (backend)

`render.yaml` at the repo root is a ready-to-use Blueprint. Either push it to GitHub
and use **New -> Blueprint**, or create a Web Service manually:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

Environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://fault-management.vercel.app` |

Render injects `PORT` automatically — do not set it. The free plan sleeps after 15
minutes idle and cold-starts on the next request, which can take ~30s.

## 3. Vercel (frontend)

Import the repo, set the **Root Directory** to `frontend`, and Vercel will detect
Vite (`npm run build`, output `dist`). `frontend/vercel.json` pins all three.

Add one environment variable:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

Only `VITE_`-prefixed variables reach the browser bundle, so the prefix is required.
Remember to redeploy after changing it.

## 4. Migrating existing data from SQLite

The data in `database.sqlite` has already been copied to Neon. To repeat it (or to
target a different database), set `DATABASE_URL` and run:

```bash
npm run migrate:sqlite-to-neon
```

The script is idempotent — rows whose primary key already exists are skipped, and
identity sequences are reset afterwards. Original user IDs are preserved, so JWTs
issued before the migration stay valid.

It reads SQLite through Node's built-in `node:sqlite` (Node >= 22.5), so there is no
`sqlite3` native dependency to install.

Delete `database.sqlite` and `database.sqlite.bak` once you are satisfied.

## Notes for future schema changes

- `load_shedding_schedules.date` is deliberately `TEXT` holding `YYYY-MM-DD`, not a
  `DATE` column. The frontend feeds it straight into `<input type="date">` and renders
  it as a raw string; a real `DATE` would serialise as `2026-04-22T00:00:00.000Z` and
  render as the previous day for anyone west of UTC. Do not "fix" this to `DATE`.
- `start_time` / `end_time` are `TEXT` for the same reason.
- All timestamps are `TIMESTAMPTZ` and reach the browser as ISO-8601 strings.
- Aggregate queries must use `COUNT(*)::int`. Plain `COUNT(*)` returns `bigint`,
  which the driver turns into a *string* and which would break the dashboard counters.
- The JSON-looking columns (`photos`, `gps_location`, `signature`, `resolution_data`,
  `customer_feedback`) are `JSONB` and are not read or written by the current code.
- Foreign keys are enforced. Deleting a user with linked faults returns `409`; use the
  status toggle instead.