# JETS Decision Engine

Version 0.5 adds deterministic ranking. It does not use AI, live scraping, checkout, or hidden model calls.

The engine is intentionally transparent: each listing is converted into a common decision candidate, scored through fixed formulas, and explained with visible strengths and cautions.

## Files

- `types/decision.ts`: shared score, preset, candidate, and evaluation types.
- `lib/decision-engine/presets.ts`: use-case presets and score weights.
- `lib/decision-engine/scoring.ts`: deterministic score formulas with inline formula comments.
- `lib/decision-engine/adapters.ts`: adapters for mock hardware listings and normalized ingestion rows.
- `lib/decision-engine/ranking.ts`: search sorting helpers.
- `data/decision-engine/validation-fixtures.ts`: deterministic validation fixtures.
- `components/decision`: score breakdown and why-this-ranks UI.

## Use-Case Presets

The current presets are:

- Gaming
- CAD
- Engineering
- AI
- Programming
- General
- Homelab

Each preset defines:

- target budget ceiling
- preferred form factors
- keywords that signal fit
- minimum reliability expectation
- repair-risk tolerance
- shipping-friction tolerance
- score weights

## Scores

- Performance: trusted mock performance when available, otherwise inferred from CPU, GPU, memory, and platform tokens.
- Value: performance relative to effective USD price and preset budget ceiling.
- Reliability: condition baseline blended with trusted mock reliability when available.
- Risk control: condition baseline minus penalties for explicit risk notes and failure language.
- Freshness: v0.4 normalized freshness, with a neutral-current score for v0.2 static mock listings.
- Upgrade potential: trusted mock upgrade score when available, otherwise inferred from form factor and expansion keywords.
- Aesthetics: trusted mock aesthetic score when available, otherwise inferred from chassis, laptop, premium-brand, and condition language.
- Shipping penalty: friction score based on shipping location, heavy systems, components, and repair-risk items.
- Use-case fit: recommended use-case match, preferred form factor, and preset keyword match.

The final score is a weighted average of positive scores minus the shipping penalty weight.

## Validation Fixtures

The current deterministic fixtures assert that:

- A working RTX 3060 gaming tower outranks a no-boot Alienware for gaming.
- A ThinkStation P520 sleeper outranks an OptiPlex SFF for homelab.
- A reliable tiny workstation outranks an older fair-condition render node for CAD.

These fixtures are deliberately small. They are not a replacement for full tests, but they give later workflow layers a clear starting point for regression checks.

## Boundaries

- No AI.
- No live scraping.
- No checkout.
- No automatic purchase recommendation.
- No automatic duplicate merge.
- No claim that mock or dry-run listings are available in the real world.

## v0.9 Direction

The decision engine now feeds the Build Generator and v0.8 decision snapshots. The next durable layer should create a shared decision audit model for status changes, notes, comparisons, and future explanations.
