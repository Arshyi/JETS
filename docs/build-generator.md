# JETS Build Generator

Version 0.7 added the Build Generator, the first complete end-user workflow in JETS.

The generator does not use AI, live scraping, checkout, or databases. It uses local mock listings plus the existing deterministic decision and compatibility engines.

## User Inputs

The workflow accepts:

- budget
- country
- currency
- primary use case
- optional preferences
- already-owned hardware and peripherals

Supported use cases:

- Gaming
- Engineering
- CAD
- AI
- Programming
- General
- Homelab

Preferences include:

- prefer laptops
- prefer desktops
- prefer workstations
- small form factor
- low power usage
- quiet operation
- upgradeability priority
- reliability priority
- aesthetics priority
- lowest price priority

Already-owned items include:

- monitor
- keyboard
- mouse
- speakers
- SSD
- HDD
- GPU
- RAM
- PSU

## Recommendation Categories

The generator produces:

- Best Overall
- Best Value
- Highest Performance
- Best Engineering
- Best AI
- Best Gaming
- Best Workstation
- Sleeper Build

Each recommendation includes:

- overall score
- compatibility score
- decision score
- reliability
- upgradeability
- estimated remaining lifetime
- estimated negotiation price
- estimated shipping weight
- platform health
- risk level
- why-this-build reasons
- closest alternatives

## Architecture

The generator reuses:

- `data/mock-listings.ts` for current mock listings
- `types/hardware.ts` for search/listing models
- `lib/decision-engine` for deterministic decision scoring
- `lib/compatibility-engine` for compatibility scoring
- `data/compatibility/profiles.ts` for compatibility profiles

Generator-specific code lives in:

- `types/build-generator.ts`
- `lib/build-generator`
- `components/build-generator`
- `data/build-generator/validation-fixtures.ts`
- `app/(workspace)/build-generator/page.tsx`

## Scoring Boundary

The Build Generator does not duplicate decision or compatibility scoring. It only combines existing engine outputs with workflow-specific packaging signals:

- budget fit
- setup allowance for missing peripherals
- selected preferences
- country shipping weight multiplier
- already-owned component boost
- complete-system preference over individual components

## v0.8 Snapshot Layer

Version 0.8 persists generator runs as decision snapshots:

- user inputs
- generated recommendations
- closest alternatives
- decision score
- compatibility report summary
- timestamps
- app version
- accepted, rejected, purchased, or archived outcome

See `docs/build-snapshots.md`.
