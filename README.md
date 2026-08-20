<p align="center">
  <img src="apps/mobile/assets/images/app-icon-all.png" alt="Scopes logo" width="120" />
</p>

<h1 align="center">Scopes</h1>

<p align="center">
  One glance, everything local. Weather, traffic, police, city status, and news for Ottawa.
</p>

<p align="center">
  <img src="apps/mobile/screenshots/scopes_ss_1.png" alt="Home screen" width="30%" />
  <img src="apps/mobile/screenshots/scopes_ss_2.png" alt="Alerts screen" width="30%" />
  <img src="apps/mobile/screenshots/scopes_ss_3.png" alt="News screen" width="30%" />
</p>

## What is this

Scopes pulls together Ottawa's daily civic signals: city service status, weather, traffic, police updates, and curated local news, all in one fast, honest dashboard. Nothing here is fabricated or placeholder. If it's shown, it's real.

## Stack

The mobile app is React Native and Expo, with MobX-State-Tree for state and React Navigation for routing. The API is a set of TypeScript scrapers running on a schedule, backed by Firestore, with OpenAI generating the summaries, deployed on Vercel. A shared TypeScript package keeps data shapes in sync between the app and the API. It's all one Yarn workspaces monorepo, with GitHub Actions running the scheduled jobs.

## Structure

```
apps/
  mobile/       # React Native app
services/
  api/          # scrapers + summary generation (Firebase-backed)
packages/
  shared-types/ # shared TypeScript types
```

## Data pipeline

Each scraper lives in `services/api/scripts` and runs on its own schedule via GitHub Actions (`.github/workflows`):

| Script | Schedule |
| --- | --- |
| `scrape:news` | hourly |
| `scrape:status` | every 6 hours |
| `scrape:police` | every 2 hours |
| `scrape:traffic` | every 30 min |
| `scrape:weather` | every 30 min |
| `generate:summaries` | hourly |

All Firestore access goes through a single env-aware repo layer (`services/api/lib/firestore-repo.ts`) so dev and production data never mix.

## Running locally

```bash
yarn install
yarn workspace scopes start   # mobile app (Expo)
```

For the API/scrapers, copy `services/api/.env.example` to `services/api/.env.local`, fill in `FIREBASE_SERVICE_ACCOUNT` and `OPENAI_API_KEY`, then:

```bash
yarn workspace api run scrape:news
```
