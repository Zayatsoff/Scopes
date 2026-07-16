<p align="center">
  <img src="apps/mobile/assets/images/logo.png" alt="Scopes logo" width="120" />
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

To run one locally:

```bash
yarn install
yarn workspace api run scrape:news
```

Requires `FIREBASE_SERVICE_ACCOUNT` and `OPENAI_API_KEY` in your environment.
