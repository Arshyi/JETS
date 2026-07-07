import { createDefaultStrategyInput } from "@/lib/strategy-engine/engine";
import type { StrategyValidationFixture } from "@/types/strategy";

export const strategyValidationFixtures: StrategyValidationFixture[] = [
  {
    expectedTopStrategy: "wait-for-better-value",
    expectedTopThree: ["wait-for-better-value", "upgrade-existing-machine"],
    id: "budget-too-small",
    input: createDefaultStrategyInput({
      budget: 240,
      goals: ["gaming"],
      powerConstraint: "strict",
      repairWillingness: "none",
      riskTolerance: "low"
    }),
    title: "Budget too small"
  },
  {
    expectedTopStrategy: "wait-for-better-value",
    expectedTopThree: ["wait-for-better-value", "upgrade-existing-machine"],
    id: "overpriced-workstation",
    input: createDefaultStrategyInput({
      acquisitions: [
        {
          condition: "good",
          confidence: "medium",
          currency: "USD",
          detectedPlatformId: "precision-5820",
          detectedPlatformName: "Dell Precision 5820",
          priceAmount: 2600,
          readiness: "needs-review",
          recommendationPreviewScore: 52,
          status: "reviewing",
          title: "Overpriced Precision 5820"
        }
      ],
      budget: 900,
      goals: ["engineering"],
      riskTolerance: "low"
    }),
    title: "Overpriced workstation"
  },
  {
    expectedTopStrategy: "buy-used-workstation",
    expectedTopThree: ["buy-used-workstation", "hybrid-strategy"],
    id: "amazing-deal",
    input: createDefaultStrategyInput({
      acquisitions: [
        {
          condition: "excellent",
          confidence: "high",
          currency: "AED",
          detectedPlatformId: "thinkstation-p520",
          detectedPlatformName: "Lenovo ThinkStation P520",
          priceAmount: 950,
          readiness: "needs-review",
          recommendationPreviewScore: 88,
          status: "ready",
          title: "ThinkStation P520 under market"
        }
      ],
      budget: 2200,
      country: "United Arab Emirates",
      currency: "AED",
      goals: ["engineering"],
      timeHorizon: "long"
    }),
    title: "Amazing deal"
  },
  {
    expectedTopStrategy: "wait-for-better-value",
    expectedTopThree: ["wait-for-better-value", "mini-pc"],
    id: "bad-platform",
    input: createDefaultStrategyInput({
      acquisitions: [
        {
          condition: "fair",
          confidence: "low",
          currency: "USD",
          detectedPlatformId: null,
          detectedPlatformName: null,
          priceAmount: 700,
          readiness: "not-ready",
          recommendationPreviewScore: 28,
          status: "reviewing",
          title: "Generic unknown desktop"
        }
      ],
      goals: ["general"],
      noisePreference: "quiet",
      riskTolerance: "low"
    }),
    title: "Bad platform"
  },
  {
    expectedTopStrategy: "buy-used-workstation",
    expectedTopThree: ["buy-used-workstation", "hybrid-strategy"],
    id: "excellent-platform",
    input: createDefaultStrategyInput({
      acquisitions: [
        {
          condition: "good",
          confidence: "high",
          currency: "AED",
          detectedPlatformId: "precision-5820",
          detectedPlatformName: "Dell Precision 5820",
          priceAmount: 1350,
          readiness: "needs-review",
          recommendationPreviewScore: 82,
          status: "ready",
          title: "Precision 5820 verified tower"
        }
      ],
      budget: 2600,
      country: "United Arab Emirates",
      currency: "AED",
      goals: ["cad"],
      timeHorizon: "long"
    }),
    title: "Excellent platform"
  },
  {
    expectedTopStrategy: "repair-existing-hardware",
    expectedTopThree: ["repair-existing-hardware", "hybrid-strategy"],
    id: "repair-candidate",
    input: createDefaultStrategyInput({
      acquisitions: [
        {
          condition: "broken",
          confidence: "medium",
          currency: "USD",
          detectedPlatformId: "thinkstation-p520",
          detectedPlatformName: "Lenovo ThinkStation P520",
          priceAmount: 180,
          readiness: "not-ready",
          recommendationPreviewScore: 58,
          status: "reviewing",
          title: "Broken P520 parts donor"
        }
      ],
      budget: 420,
      goals: ["homelab"],
      ownedHardware: {
        gpu: true,
        hdd: false,
        keyboard: false,
        monitor: true,
        mouse: true,
        psu: false,
        ram: true,
        speakers: false,
        ssd: true
      },
      repairWillingness: "major",
      riskTolerance: "high"
    }),
    title: "Repair candidate"
  }
];
