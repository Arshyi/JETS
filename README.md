# JETS

JETS (Just Enough Tech Solutions) is an AI-assisted hardware decision engine for used PCs, laptops, workstations, servers, and components.

Version 0.5 adds a transparent deterministic decision engine for ranking hardware solutions. It keeps the v0.2 search experience, v0.3 Supabase-ready persistence, and v0.4 dry-run ingestion foundation, and it does not include AI, live scraping, checkout, or live marketplace ingestion.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Version Plan

- **0.1:** Foundation, static pages, theme, docs. Complete.
- **0.2:** Search UI, mock data, filters, rankings, compare flow. Complete.
- **0.3:** Supabase authentication, saved builds, favorites, history, settings. Complete.
- **0.4:** Dry-run ingestion foundation, source health, normalized listing schema. Complete.
- **0.5:** Deterministic decision engine and ranking explanations. Current.
- **0.6:** Compatibility review and recommendation workflow. Next.

## Version 0.2 Notes

- All listing data lives in `data/mock-listings.ts`.
- Hardware domain types live in `types/hardware.ts`.
- Search/filter/sort helpers live in `lib/hardware-search.ts`.
- The search experience is client-side and static.
- The compare page reads mock listing IDs from `/compare?ids=id-one,id-two`.

## Version 0.3 Notes

- Supabase config helpers live in `lib/supabase`.
- Auth pages live at `/login`, `/signup`, and `/account`.
- Persistence pages live at `/saved-builds`, `/favorites`, `/history`, and `/settings`.
- SQL migration lives in `supabase/migrations/202607020003_v0_3_auth_persistence.sql`.
- If Supabase environment variables are missing, the app still builds and shows setup messages.

## Version 0.4 Notes

- Mock source definitions live in `data/mock-ingestion.ts`.
- Ingestion domain types live in `types/ingestion.ts`.
- Adapter, normalization, freshness, and duplicate utilities live in `lib/ingestion`.
- Source health is available at `/sources`.
- Admin dry-run controls are available at `/admin/ingestion`.
- SQL migration lives in `supabase/migrations/202607020004_v0_4_ingestion_foundation.sql`.
- v0.4 does not make live requests to Dubizzle, Amazon.ae, Computer Plaza, or any marketplace.

## Version 0.5 Notes

- Decision engine types live in `types/decision.ts`.
- Use-case presets and score formulas live in `lib/decision-engine`.
- Search cards show decision score breakdowns and why-this-ranks explanations.
- Normalized ingestion samples can be scored without live scraping.
- Deterministic validation fixtures live in `data/decision-engine/validation-fixtures.ts`.
- Formula documentation lives in `docs/decision-engine.md`.
- v0.5 does not implement AI.

## Supabase Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JETS_ADMIN_EMAILS=
```

Then run the SQL migrations in Supabase before using persistence features. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used by the admin-gated dry-run action to persist ingestion logs. `JETS_ADMIN_EMAILS` is a comma-separated allowlist for `/admin/ingestion`.

## Compliance Boundary

JETS v0.4 and v0.5 use local mock adapters only. Future live ingestion must respect robots.txt, marketplace terms, approved APIs or vendor feeds, conservative rate limits, and removal requests. See `docs/ingestion.md` for the current ingestion notes.
