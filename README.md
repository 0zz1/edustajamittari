# Edustajamittari 🏛️

Kuka tekee töitä, kuka ei? Läsnäolomittari + vaalikone kaikille 200 kansanedustajalle.

## Monorepo structure

```
edustajamittari/
├── api/               Flask JSON API (3 services in Railway)
│   ├── api.py
│   └── requirements.txt
├── frontend/          React + Vite app
│   ├── src/
│   ├── index.html
│   └── package.json
├── pipeline/          Data fetcher (weekly cron)
│   ├── pipeline.py
│   └── requirements.txt
├── railway.toml       Railway service definitions
└── README.md
```

---

## Deploy to Railway — step by step

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create edustajamittari --public --push  # or use github.com
```

### 2. Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo** → pick your repo
3. Railway will detect `railway.toml` and create three services automatically

### 3. Add Postgres database

In your Railway project dashboard:
1. Click **+ New** → **Database** → **Add PostgreSQL**
2. Railway automatically sets `DATABASE_URL` in all services via the `${{Postgres.DATABASE_URL}}` reference in `railway.toml`

### 4. Run the initial data load

The pipeline service starts automatically on deploy, but for the very first run you'll want to watch it:

```
Railway dashboard → pipeline service → Deployments → View logs
```

The first full run takes 30–60 minutes (fetching all historical votes). Subsequent weekly runs take ~5 minutes.

You can also trigger a manual run from the Railway dashboard: **pipeline → Settings → Restart**.

### 5. Your URLs

Railway gives each service a public URL:
- **Frontend**: `https://frontend-xxxx.up.railway.app`
- **API**: `https://api-xxxx.up.railway.app`

Set a custom domain in Railway Settings → Custom Domain (e.g. `edustajamittari.fi`).

---

## Local development

```bash
# Backend
cd api
pip install -r requirements.txt
python api.py            # → http://localhost:5000

# Pipeline (first run)
cd pipeline
pip install -r requirements.txt
python pipeline.py --skip-mp-votes   # fast test run
python pipeline.py                   # full run (30–60 min)

# Frontend
cd frontend
npm install
npm run dev              # → http://localhost:5173
```

Switch off mock data in `frontend/src/hooks/useApi.js`:
```js
const USE_MOCK = false
```

---

## Environment variables

| Variable       | Service        | Value                          |
|----------------|----------------|--------------------------------|
| `DATABASE_URL` | api, pipeline  | Set automatically by Railway   |
| `VITE_API_URL` | frontend       | Set to your api Railway URL    |
| `PORT`         | api, frontend  | Set automatically by Railway   |

---

## Weekly cron schedule

The pipeline runs every Sunday at 03:00 UTC (`0 3 * * 0` in `railway.toml`).
To run manually: Railway dashboard → pipeline → Restart.

---

## Estimated Railway cost

| Service  | Plan   | Est. cost/mo |
|----------|--------|--------------|
| API      | Hobby  | ~€2          |
| Frontend | Hobby  | ~€1          |
| Pipeline | Hobby  | <€1 (cron)   |
| Postgres | Hobby  | €0 (free)    |
| **Total**|        | **~€3–5/mo** |

Free tier covers ~500h/month — enough for all three services with room to spare.

---

## Phase 2: custom domain

```bash
# Buy edustajamittari.fi at domains.google or namecheap
# Railway Settings → Custom Domain → add CNAME record
```
