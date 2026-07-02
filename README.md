# JETS

JETS (Just Enough Tech Solutions) is an AI-assisted hardware decision engine for used PCs, laptops, workstations, servers, and components.

Version 0.2 adds the first real product experience: local mock hardware listings, filters, ranking cards, and compare selection. It still does not include scraping, authentication, Supabase, databases, checkout, or AI.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Version Plan

- **0.1:** Foundation, static pages, theme, docs. Complete.
- **0.2:** Search UI, mock data, filters, rankings, compare flow. Current.
- **0.3:** Supabase authentication, saved builds, favorites. Next.
- **0.4:** Scraper and marketplace ingestion.
- **0.5:** Decision engine and AI-assisted explanations.

## Version 0.2 Notes

- All listing data lives in `data/mock-listings.ts`.
- Hardware domain types live in `types/hardware.ts`.
- Search/filter/sort helpers live in `lib/hardware-search.ts`.
- The search experience is client-side and static.
- The compare page reads mock listing IDs from `/compare?ids=id-one,id-two`.
