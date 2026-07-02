# JETS Ingestion Notes

Version 0.4 is an ingestion foundation only. It uses local mock adapters and does not make live requests to marketplaces, stores, vendor sites, checkout pages, accounts, or seller messaging surfaces.

## Current Sources

- Dubizzle: mock marketplace adapter, paused for live ingestion until compliance review is complete.
- Amazon.ae: mock retail adapter, setup required before any future live ingestion because approved APIs or policy-compliant feeds are required.
- Computer Plaza: mock local-vendor adapter, intended for future vendor-approved feeds or manual inventory files.
- Manual Upload: mock manual adapter, intended for future CSV validation and source attribution.

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
- Record an ingestion run for every adapter attempt.
- Mark freshness based on `lastSeenAt`, not on the time a user views the page.
- Keep duplicates as review candidates. Do not delete or merge source records automatically.
- Add source-specific kill switches before scheduled ingestion.
