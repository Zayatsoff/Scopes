<p align="center">
  <img src="apps/mobile/assets/images/app-icon-all.png" alt="Scopes logo" width="120" />
</p>

<h1 align="center">Scopes</h1>

<p align="center">
  One glance, everything local — weather, traffic, police, city status, and news for Ottawa.
</p>

## Run all scrapers on GitHub (manual test trigger)

Every scraper workflow supports `workflow_dispatch`, so you can kick them all off by hand instead of waiting for the cron schedule. Requires the [GitHub CLI](https://cli.github.com/) (`gh`), authenticated (`gh auth login`).

```bash
for wf in news-scraper.yml ottawa-scraper.yml police-scraper.yml traffic-scraper.yml weather-alerts-scraper.yml summaries-generator.yml; do
  gh workflow run "$wf" -R Zayatsoff/Scopes
done
```

Check progress with:

```bash
gh run list -R Zayatsoff/Scopes -L 10
```

## What is this

Scopes consolidates Ottawa's daily civic signals — city service status, weather, traffic, police updates, and curated local news — into one fast, honest dashboard. No fabricated or placeholder data; if it's shown, it's real.

## Structure

```
apps/
  mobile/       # React Native app
services/
  api/          # scrapers + summary generation (Firebase-backed)
packages/
  shared-types/ # shared TypeScript types
```

## Scrapers

Each scraper lives in `services/api/scripts` and runs on its own schedule via GitHub Actions (`.github/workflows`):

| Script | Workflow | Schedule |
| --- | --- | --- |
| `scrape:news` | `news-scraper.yml` | hourly |
| `scrape:status` | `ottawa-scraper.yml` | every 6 hours |
| `scrape:police` | `police-scraper.yml` | every 2 hours |
| `scrape:traffic` | `traffic-scraper.yml` | every 30 min |
| `scrape:weather` | `weather-alerts-scraper.yml` | every 30 min |
| `generate:summaries` | `summaries-generator.yml` | hourly |

To run one locally, copy `services/api/.env.example` to `services/api/.env.local` and fill in your values, then:

```bash
yarn install
yarn workspace api run scrape:news
```

Each `scrape:*`/`generate:*` script loads `services/api/.env.local` automatically (via `dotenv`). It's gitignored, so your credentials never get committed. Required vars: `FIREBASE_SERVICE_ACCOUNT`, `OPENAI_API_KEY`, and `FIRESTORE_ENV` (see below — defaults to `dev` if omitted).

## Firestore environments (dev vs. production)

All Firestore access — scrapers (writes) and the Vercel API endpoints (reads) — goes through `services/api/lib/firestore-repo.ts`, which resolves every collection name based on `FIRESTORE_ENV`:

- `FIRESTORE_ENV=production` → real collections (`news`, `policeNews`, ...)
- anything else, including unset → `*_dev` collections (`news_dev`, `policeNews_dev`, ...)

**Dev is the default everywhere on purpose.** A local script run, or a workflow run with no explicit config, can never touch production data by accident.

There are two independent places this is controlled, and they only produce a working app when they agree:

| Side | What it does | Controlled by |
| --- | --- | --- |
| GitHub Actions (scrapers) | writes data | `FIRESTORE_ENV` repo variable (scheduled runs) or the `firestore_env` input (manual `workflow_dispatch` runs — lets you test against `dev` without touching the scheduled/production runs) |
| Vercel (API endpoints) | reads data, serves the app | `FIRESTORE_ENV` env var in the Vercel project settings |

If these two disagree — e.g. Vercel reads `production` while the scrapers still write to `*_dev` — the app won't error, it'll just quietly serve stale/empty data, since nothing is writing to the collections it's reading from. Flip both together.

To manually test a scraper against `dev` without touching prod, at any time, regardless of what the repo variable is set to:

```bash
gh workflow run news-scraper.yml -f firestore_env=dev
```

### Before launch

- [ ] Set the `FIRESTORE_ENV` repo variable to `production` in GitHub (Settings → Secrets and variables → Actions → Variables) — switches scheduled scraper runs from `*_dev` to real collections
- [ ] Set `FIRESTORE_ENV=production` in the Vercel project's production environment variables — switches the read endpoints to serve real collections
- [ ] Set the `SCRAPERS_ENABLED` repo variable to `true` — scheduled scraper runs are paused until this is set
- [ ] Confirm a scheduled run actually wrote to the unsuffixed collections (`gh run list`, then check Firestore) before relying on it
- [ ] Wire up Sentry (crash-reporting seams already exist, no service connected yet)
- [ ] EAS production build + App Store / Play Store submission
