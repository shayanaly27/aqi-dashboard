# Pearls AQI Predictor — Dashboard

The frontend for the Pearls AQI Predictor project: a live, interactive dashboard showing Karachi's current Air Quality Index, a 3-day forecast, historical trends, and full model explainability — all reading from a FastAPI backend, never from static files.

Built for the 10Pearls Shine — Data Science Track. Backend repo: [aqi-predictor](#).

## What this app shows

- **Hero panel** — current AQI, category, and a live gauge visualization
- **Key pollutants** — PM2.5, PM10, O₃, NO₂, SO₂, CO with status coloring
- **3-Day forecast** — three predicted days with real calendar dates and hour-offset labels (+24h/+48h/+72h), each with AQI, category, and hazard flagging
- **14-day AQI trend** — historical chart read live from the Feature Store
- **Primary factors / SHAP feature importance** — what's actually driving each forecast
- **Model performance comparison** — RMSE/MAE/R² across all algorithms and horizons, regenerated automatically by every training run
- **Model version history** — every registered model version per horizon, with the current one highlighted

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Deployment:** Vercel

This app holds no data-access or ML logic of its own — it talks to the backend exclusively over HTTP.

## Prerequisites

- Node.js 18+ and npm
- The backend API running locally or deployed (see the [aqi-predictor](#) repo)

## Setup

```bash
npm install
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

(Point this at the deployed backend URL, e.g. `https://aqi-predictor-api-wodc.onrender.com`, for a production build.)

```bash
npm run dev
# Visit http://localhost:3000 — redirects to /dashboard
```

## Configuration

The API base URL is centralized in a single `lib/api-config.ts` module, driven entirely by `NEXT_PUBLIC_API_BASE`, so the same frontend code works unmodified whether the backend is local or deployed elsewhere — no hardcoded URLs are scattered across components.

## Known limitations

- The backend runs on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after that can take 20–30 seconds while the backend cold-starts (see the backend repo's README for details).
- If the backend's underlying Hopsworks Feature Store has a materialization delay, a `data_freshness` flag in the API response indicates this — the dashboard's current-AQI values remain live regardless, since they're fetched independently of that delay.

## Related

Full architecture, model evaluation, and an honest engineering write-up (including every real issue hit during development) are documented in the accompanying project report, alongside the [aqi-predictor](#) backend repository.

## License

Educational project — 10Pearls Shine, Data Science Track.
