# JETS Vision

JETS means Just Enough Tech Solutions.

The product is an AI-assisted hardware decision engine for used PCs, laptops, workstations, servers, and components. It is not an e-commerce store. It should help people find the best-value option for their real use case by weighing price, performance, reliability, compatibility, upgrade path, seller risk, and practical constraints.

## Current Rule

Do not build ideas the moment they appear.

Capture them here, then choose the right milestone later. This keeps the product ambitious without derailing the current version.

## Milestones

### Version 0.1 - Foundation

- Complete.
- Built the application shell.
- Added responsive static pages.
- Added light and dark mode.
- Added placeholder product surfaces.
- Avoided scraping, authentication, databases, and AI.

### Version 0.2 - Search UI With Dummy Data

- Complete.
- Built search and filter UI.
- Added local typed mock listing data.
- Added ranking cards with value, performance, reliability, aesthetic, upgrade, sleeper, and risk signals.
- Added compare selection for up to three listings through URL query params.
- Kept all data static.
- Did not scrape marketplaces.

### Version 0.3 - Supabase Accounts

- Complete.
- Added Supabase authentication.
- Added saved builds.
- Added favorites.
- Added build history with a clear action.
- Added user settings persistence.
- Added setup states when environment variables are missing.
- Do not scrape marketplaces.

### Version 0.4 - Ingestion Foundation

- Complete.
- Added source adapter architecture.
- Added dry-run mock adapters for Dubizzle, Amazon.ae, Computer Plaza, and Manual Upload.
- Added normalized listing schema.
- Added ingestion run logs.
- Added source health/status page.
- Added admin-only ingestion dry-run page.
- Added duplicate detection and listing freshness flags.
- Added compliance notes and rate-limit documentation.
- Do not implement live scraping.

### Version 0.5 - Decision Engine

- Current.
- Add deterministic scoring and ranking logic.
- Add formula comments and documentation.
- Add why-this-ranks explanations.
- Add score breakdown UI.
- Add use-case presets for gaming, CAD, engineering, AI, general, and homelab.
- Add validation fixtures.
- Do not implement AI.

### Version 0.6 - Compatibility Review

- Next.
- Add compatibility checks for GPU fit, PSU headroom, memory, storage, and platform constraints.
- Add saved decision snapshots.
- Add reviewable recommendation notes.
- Keep AI out until deterministic recommendations can be audited.

## Idea Parking Lot

Ideas below are valuable, but they are not current milestone scope.

- eGPU solutions
- Sleeper builds
- Shipping estimator
- Technician recommendations
- Negotiation prediction
- Seller reliability signals
- Local pickup radius scoring
- Power cost estimates
- Upgrade path forecasting
- Homelab bundle recommendations
- Small business workstation recommendations
- Creator laptop value analysis
- Parts compatibility checker
- GPU fit and PSU headroom checks
- Repairability and replacement part availability
- Warranty and return policy comparison
- Market price trend tracking
- Listing scam and risk heuristics

## Product Principles

- Maintainability beats cleverness.
- Every milestone should leave the codebase easier to extend.
- Recommendations should explain their reasoning.
- Marketplace data should be handled carefully and transparently.
- Users should stay in control of decisions, saved data, and preferences.
- Scraping, AI, and authentication should enter only when the surrounding product is ready for them.
