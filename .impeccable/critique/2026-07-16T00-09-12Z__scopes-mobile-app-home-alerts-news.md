---
target: Scopes mobile app (home, alerts, news)
total_score: 26
p0_count: 0
p1_count: 2
timestamp: 2026-07-16T00-09-12Z
slug: scopes-mobile-app-home-alerts-news
---
# Design Critique — Scopes (Home · Alerts · News)

Method: single-context (degraded — no sub-agents per user instruction; native RN so web detector/browser overlay N/A). Evidence: 3 dark-mode screenshots + theme/component source.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading/refresh/timestamps present; City Status icon row has no state labels |
| 2 | Match System / Real World | 3 | Plain civic language; abstract flame/snowflake status icons ambiguous |
| 3 | User Control & Freedom | 3 | Tabs, sort, removable filter chip, back nav |
| 4 | Consistency & Standards | 3 | Consistent to a fault — one card treatment everywhere |
| 5 | Error Prevention | 3 | Read-only; little to get wrong |
| 6 | Recognition Rather Than Recall | 2 | Category meaning by color w/ no legend; tab labels truncate |
| 7 | Flexibility & Efficiency | 2 | Sort + filter only; no news search/favorites/per-category control |
| 8 | Aesthetic & Minimalist Design | 2 | Core problem — sea of gray cards, colored spines, all-bold text |
| 9 | Error Recovery | 3 | EmptyState + ErrorScreen components, plain-language empties |
| 10 | Help & Documentation | 2 | Ambiguous icons/colors never explained |
| **Total** | | **26/40** | **Acceptable — aesthetics are the weak axis** |

## Anti-Patterns Verdict

Trips two absolute bans:
- **Side-stripe borders** — EnhancedAlertCard.tsx:234 and CompactSummaryCards.tsx:161 use borderLeftWidth:4 in category color on every card. Primary driver of "utilitarian/exhausting"; forces a rainbow of accents on a flat gray field.
- **Identical card grids** — home summaries, alerts, news all the same container (fill + 1px border + 4px stripe + shadow + radius:3). Sameness + noise simultaneously.
- **Muddy gray stack** — dark mode #4B4B4B cards on #292929 bg (colorsDark.ts:57-58); cards barely separate, whole screen is one heavy gray mass.

Deterministic scan: N/A (RN, not HTML/CSS). Both bans confirmed by reading RN style objects directly.

## Overall Impression

IA is genuinely good (tabs, sort/filter, source attribution, timestamps, photo-hero header). Dragged down because every piece of content ships in the same boxed, bordered, stripe-tagged, all-bold container on gray-on-gray. Reads like an admin dashboard, not a calm consumer app. Biggest lever: kill cards-as-default, let content breathe (dividers + type instead of boxes, one accent not five).

## What's Working

- Photo-hero home header ("Ottawa / Good evening" over Parliament) — the one moment with real personality; this is the brand voice.
- Source credibility (favicons + named sources + bylines) — builds the trust the PRD centers on.
- Clear tab + sort + filter model; removable "Filtering by" chip is clean.

## Priority Issues

[P1] Cards-as-default with colored side-stripes — exhausting sameness. Fix: drop borderLeftWidth; hairline dividers + vertical rhythm; category via icon+label not spine; filled container only for elevated items. → /impeccable layout, /impeccable quieter

[P1] Rainbow category colors carrying meaning alone — noise + a11y gap (fails AA color-only). Fix: pair category with icon AND text label; demote color to one restrained accent family. → /impeccable colorize, /impeccable audit

[P2] Muddy gray-on-gray surface stack. Fix: widen surface/bg separation or go borderless w/ spacing; real elevation scale. → /impeccable colorize, /impeccable layout

[P2] Everything is bold — no hierarchy. Fix: bold for titles, regular body, muted meta; 3-4 roles. → /impeccable typeset

[P2] Intended font may not render (bug) — typography.primary = instrumentSans but only Space Grotesk is loaded; falls back to system on iOS. Fix: bundle Instrument Sans or commit to Space Grotesk. → /impeccable typeset

## Persona Red Flags

- Sam (a11y): color-only category on a safety app; meta text opacity 0.7 over mid-gray risks <4.5:1.
- Casey (mobile): good bottom tab bar; but Alerts tab strip truncates ("Road &…"), fourth tab may be missed.
- Jordan (first-timer): home City Status icon row (flame/car/snowflake/bus) unlabeled, colors unexplained.

## Minor Observations

- borderRadius:3 very tight, reads boxy; 12-16 would warm it.
- Home shows slice(4,8)+slice(8,16) — items 0-3 skipped, likely a bug.
- "Today" on every summary card is noise.
- Redundant separation: border + shadow + stripe + radius all at once.

## Questions to Consider

- Home screen as mostly type + space, card only where elevation is earned?
- Does a calm civic app need a colored spine on every row?
- What if the "Good evening, Ottawa" confidence set the tone for the whole app?
