# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Web port of *Arkham Horror: The Card Game*. Haskell (Yesod) backend serves a Vue 3 SPA. PostgreSQL for persistence, Redis for pub/sub between game instances. The codebase is dominated by the game engine in `backend/arkham-api/library/Arkham/`.

## Tech stack

- **Backend**: Stack-managed Haskell (`resolver: nightly-2025-12-30`, GHC 9.12.2). Yesod web framework. `cabal.project` exists for HLS but day-to-day builds use Stack.
- **Frontend**: Vue 3 + TypeScript + Vite + Pinia, located in `frontend/`. Dev server runs on port 8080 and proxies `/api` and `/health` to `127.0.0.1:3002`.
- **DB**: PostgreSQL via `persistent`/`esqueleto`. Migrations are managed by `sqitch` in `migrations/`.

## Backend layout

`backend/` is a multi-package Stack project (`stack.yaml`, three packages):

- `arkham-api/` — the Yesod app **and** the entire game engine.
  - `library/Arkham/` (~190 subdirs) — game model: `Game.hs`, `Investigator/`, `Asset/`, `Enemy/`, `Location/`, `Scenario/`, `Campaigns/`, `Skill/`, `Treachery/`, `Event/`, `Story/`, `Helpers/`, etc. Card implementations live under `<Type>/Cards/` subdirs (e.g. `Asset/Cards/NightOfTheZealot.hs`). Heavy use of `.hs-boot` files to break circular imports between game-model modules.
  - `library/Api/Handler/Arkham/` — REST + WebSocket handlers (Cards, Decks, Games, Investigators, etc.). Endpoints declared in `config/routes` (Yesod routing DSL).
  - `library/Application.hs`, `Foundation.hs`, `Settings.hs`, `Config.hs` — Yesod boilerplate.
  - `app/main.hs` is just `appMain`; dev uses `app/devel.hs` / `DevelMain.hs`.
  - `tests/` — hspec via `hspec-discover` (the entire `Spec.hs` is just the discover pragma). Specs mirror module paths under `tests/Arkham/`.
  - `config/routes`, `config/settings.yml`, `config/test-settings.yml`.
- `cards-discover/` — a small executable used as a `build-tool` by `arkham-api`. It walks card source directories and emits a re-export module so individual card files don't have to be added by hand. **If you add a new card file under `Asset/Cards/`, `Enemy/Cards/`, etc., the build will pick it up automatically via this tool — but a clean rebuild may be needed if discovery output is cached.**
- `validate/` — separate executable that validates card data; run with `make validate` from `backend/`.

The cabal file is generated from `package.yaml` (hpack). Edit `package.yaml`, not `arkham-api.cabal`.

### Card implementation conventions

`backend/Checklist.md` lists invariants to honor when adding/editing card code (encounter-deck access, healing, `affectsOthers`, `withBaseAbilities` / `withRevealedAbilities`, `beginSkillTest` only for non-bold skill tests, avoid `You` outside `CardDef`/`Abilities`). Read it before implementing or modifying cards.

## Frontend layout

- `src/arkham/` — game UI (Vue components, views, helpers, parser, debug). `src/arkham/components/` has the bulk of the game-board components; `src/arkham/views/` are top-level routed views (`Game.vue`, `Decks.vue`, `NewCampaign.vue`, …).
- `src/views/` — non-game views (auth, admin, settings).
- `src/stores/` — Pinia stores (`user`, `cards`, `dbCards`, `settings`, `site_settings`).
- `src/api.ts` — axios instance with `baseURL = ${VITE_API_HOST}/api/v1`. Override `VITE_API_HOST` / `VITE_ASSET_HOST` via `frontend/.env.development.local`.
- `vite.config.js` — proxy + `@` alias to `./src`.

## Common commands

All assume you're in the repo root unless noted.

### Backend (run from `backend/`)

```
make api.watch        # build + run arkham-api on file change (dev mode, port 3002)
make api.watch.test   # same, but also runs tests on each rebuild
make ghci             # stack ghci into the arkham-api target
make test             # full test build + run (pedantic, with file-watch)
make validate         # build + run the validate package once
make validate.watch   # validate with file-watch
make revalidate       # rebuild arkham-api, then `stack clean validate && stack run validate`
make tags             # fast-tags
```

`api.watch` and friends pass `-DDEVELOPMENT` and run `stack build --pedantic --fast`. They `pkill arkham-api` before relaunching, so don't run `arkham-api` manually alongside them. Extra GHC flags can be injected via `GHC_OPTIONS=...` and extra Stack flags via `EXTRA_STACK_FLAGS=...`.

### Running a single test

```
# from backend/, anywhere a single spec module exists under arkham-api/tests/
cd arkham-api
stack test arkham-api --ta '--match "<spec name>"'
# or by module path, e.g.:
stack test arkham-api --ta '-m "Arkham.Asset.Assets.BeatCopSpec"'
```

### Frontend (run from `frontend/`)

```
npm install
npm run serve   # vite dev server on :8080, proxies /api and /health to :3002
npm run build   # production build
npm run tc      # type-check (vue-tsc, no emit)
```

There is no `lint` script wired in `package.json`, despite the README mentioning `yarn lint`.

### Database (one-time, for local dev)

```
createuser arkham-horror-backend --password arkham-horror-backend --superuser
createdb arkham-horror-backend
createdb arkham-horror-backend_test
cd migrations && sqitch deploy db:pg:arkham-horror-backend
```

If `sqitch` isn't installed, the deploy SQL files in `migrations/deploy/` can be applied manually — do `users` and `arkham_games` first.

### Docker / production

`Dockerfile` + `docker-compose.yml` at the repo root build & run the full stack. `Makefile` targets `deploy` (kamal), `sync-images`, `fetch-images*`, `generate-manifest`, `sync-and-manifest`, `install-hooks` are for image-asset/CDN workflows — assets aren't in git and load from CloudFront by default.

## Style / formatting

- **Haskell**: `backend/fourmolu.yaml` — 2-space indent, 100-col limit, **leading commas**, leading function arrows, diff-friendly import/export style. The default-extension list in `arkham-api/package.yaml` is intentionally large (e.g. `OverloadedRecordDot`, `OverloadedLabels`, `NoImplicitPrelude`, `StrictData`, `DerivingVia`, `TypeFamilies`); match the surrounding module rather than reintroducing extensions per-file.
- **Prelude**: `NoImplicitPrelude` is on; the codebase uses `classy-prelude` plus `Arkham.Prelude`/`Arkham.Import`. Don't import `Prelude` directly inside `Arkham.*`.
- **GHC warnings**: Stack config sets `-Weverything` with a curated allow-list and treats them as errors under `--pedantic`. `make` targets pass `--pedantic`, so warnings will fail the build — fix them, don't suppress.
- **Generated cabal**: never hand-edit `arkham-api.cabal` / `cards-discover.cabal` / `validate.cabal`; edit the corresponding `package.yaml`.
