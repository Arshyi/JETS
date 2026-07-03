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

- Complete.
- Added deterministic scoring and ranking logic.
- Added formula comments and documentation.
- Added why-this-ranks explanations.
- Added score breakdown UI.
- Added use-case presets for gaming, CAD, engineering, AI, general, and homelab.
- Added validation fixtures.
- Do not implement AI.

### Version 0.6 - Compatibility Engine

- Complete.
- Added CPU and motherboard compatibility checks.
- Added GPU PCIe, length, height, and thickness checks.
- Added PSU wattage and connector checks.
- Added RAM type, capacity, and slot checks.
- Added storage interface, M.2, and SATA checks.
- Added cooler clearance, airflow, and thermal risk checks.
- Added BIOS generation risk and platform age scoring.
- Added compatibility report page, badges, platform health, and upgrade suggestions.
- Do not implement AI, live scraping, or checkout.

### Version 0.7 - Build Generator

- Complete.
- Created the first complete end-user workflow.
- Let users choose budget, country, currency, primary use case, preferences, and already-owned hardware.
- Generated Best Overall, Best Value, Highest Performance, Best Engineering, Best AI, Best Gaming, Best Workstation, and Sleeper Build recommendations.
- Explained why each build ranks.
- Showed closest alternatives.
- Reused the decision engine and compatibility engine.
- Do not implement AI, live scraping, or checkout.

### Version 0.8 - Decision Snapshots

- Complete.
- Persist Build Generator decision snapshots.
- Preserve budget, country, currency, preferences, owned hardware, generator outputs, decision scores, compatibility scores, platform health, explanations, alternatives, timestamps, and app version.
- Let users view, compare, rename, favorite, delete, restore, and mark snapshots.
- Add score-change comparison between saved generator runs.
- Continue using Supabase-backed persistence instead of local-only storage.
- Do not implement AI, live scraping, or checkout.

### Version 0.9 - Decision Audit Foundation

- Current.
- Introduce a shared activity model for saved builds, favorites, history, snapshots, status changes, notes, and future explanations.
- Add snapshot and saved-build notes.
- Add activity timeline page.
- Show recent activity on account.
- Show per-snapshot activity on snapshot and compare views.
- Keep this foundation deterministic before adding AI assistance.

### Version 1.0 - Private Beta Hardening

- Recommended next.
- Rehearse Supabase migrations and seed data.
- Harden auth, persistence, and error handling.
- Review responsive behavior and accessibility.
- Add product onboarding for the existing deterministic workflow.
- Do not add AI or live scraping until the beta workflow is stable.

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
