# JETS Ingestion Notes

Version 0.4 is an ingestion foundation only. It uses local mock adapters and does not make live requests to marketplaces, stores, vendor sites, checkout pages, accounts, or seller messaging surfaces.

Phase 3 adds Marketplace Intelligence on top of this foundation. The distinction matters:

- Ingestion records source health, dry-run behavior, compliance posture, freshness, and duplicate candidates.
- Marketplace Intelligence normalizes raw marketplace input into hardware metadata, detected platforms, parsed components, confidence, listing health, opportunities, and possible futures.
- Builder, Platform Knowledge, Solution Intelligence, Optimization, and Recommendation should consume normalized hardware evidence, not raw marketplace-specific fields.

## Current Sources

- Dubizzle: mock marketplace adapter, paused for live ingestion until compliance review is complete.
- Amazon.ae: mock retail adapter, setup required before any future live ingestion because approved APIs or policy-compliant feeds are required.
- Computer Plaza: mock local-vendor adapter, intended for future vendor-approved feeds or manual inventory files.
- Manual Upload: mock manual adapter, intended for future CSV validation and source attribution.

## Phase 3 Adapter Families

Marketplace Intelligence now defines demo adapter contracts for future sources:

- Dubizzle
- Facebook Marketplace
- eBay
- Kijiji
- Craigslist
- Yahoo Auctions
- Mercari
- Amazon Renewed
- Newegg
- local computer stores
- CSV imports
- manual entry
- future APIs

These are architecture definitions only. No live adapter is implemented, no browser automation is used, and no website is scraped.

## Compliance Rules

- Respect robots.txt, source terms, copyright boundaries, and removal requests.
- Prefer approved APIs, partner feeds, vendor exports, or manual uploads before browser automation.
- Do not scrape checkout, cart, account, personalized pricing, private messages, or seller contact surfaces.
- Store only normalized facts needed for comparison, freshness, deduplication, and user decision support.
- Keep source attribution visible so users understand where a listing came from.
- Treat broken, no-boot, water-damaged, and parts-only listings as repair-risk until independently verified.

## Rate-Limit Posture

- Dubizzle future default: at most 4 requests per minute with a 45 second cooldown and immediate backoff on degraded responses.
- Amazon.ae future default: at most 2 requests per minute, only through approved API or policy-compliant access.
- Computer Plaza future default: prefer scheduled vendor uploads; if polling a vendor-approved endpoint, start at 1 request per minute or less.
- Manual Upload: no automated source requests; limits should apply to CSV size, upload frequency, and validation cost.

## Future Adapter Checklist

- Confirm the source allows the planned access method.
- Add adapter tests with captured fixtures before enabling scheduled runs.
- Normalize into `types/ingestion.ts` without leaking source-specific fields into UI components.
- Normalize marketplace listing content into `types/marketplace-intelligence.ts` before Builder, Knowledge, Intelligence, Optimization, or Recommendation consumes it.
- Attach confidence and source metadata to every parsed field.
- Leave unknown hardware facts unknown instead of inferring unsupported values.
- Record an ingestion run for every adapter attempt.
- Mark freshness based on `lastSeenAt`, not on the time a user views the page.
- Keep duplicates as review candidates. Do not delete or merge source records automatically.
- Add source-specific kill switches before scheduled ingestion.
- Add evidence review, correction, conflict handling, and takedown workflow before any live source is enabled.
