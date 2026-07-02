import type { DecisionScoreWeights, DecisionUseCasePreset } from "@/types/decision";
import type { HardwareUseCase } from "@/types/hardware";

const baseWeights: DecisionScoreWeights = {
  aesthetics: 0.05,
  freshness: 0.08,
  performance: 0.18,
  reliability: 0.14,
  risk: 0.13,
  shippingPenalty: 0.08,
  upgradePotential: 0.11,
  useCaseFit: 0.11,
  value: 0.20
};

export const useCasePresets: Record<HardwareUseCase, DecisionUseCasePreset> = {
  ai: {
    budgetCeiling: 1100,
    idealFormFactors: ["desktop", "workstation", "component", "laptop"],
    keywords: ["cuda", "rtx", "a2000", "3060", "4060", "vram", "ai"],
    label: "AI",
    maxShippingPenalty: 18,
    minimumReliability: 68,
    repairRiskTolerance: 18,
    targetPerformance: 82,
    useCase: "ai",
    weights: {
      ...baseWeights,
      performance: 0.24,
      reliability: 0.12,
      upgradePotential: 0.12,
      value: 0.18
    }
  },
  cad: {
    budgetCeiling: 950,
    idealFormFactors: ["workstation", "laptop", "desktop"],
    keywords: ["cad", "quadro", "a2000", "p2000", "p620", "workstation"],
    label: "CAD",
    maxShippingPenalty: 14,
    minimumReliability: 76,
    repairRiskTolerance: 12,
    targetPerformance: 74,
    useCase: "cad",
    weights: {
      ...baseWeights,
      performance: 0.19,
      reliability: 0.20,
      risk: 0.16,
      useCaseFit: 0.14
    }
  },
  engineering: {
    budgetCeiling: 900,
    idealFormFactors: ["workstation", "desktop", "laptop"],
    keywords: ["ecc", "engineering", "thinkstation", "workstation", "xeon"],
    label: "Engineering",
    maxShippingPenalty: 16,
    minimumReliability: 78,
    repairRiskTolerance: 14,
    targetPerformance: 76,
    useCase: "engineering",
    weights: {
      ...baseWeights,
      reliability: 0.19,
      risk: 0.16,
      upgradePotential: 0.14,
      value: 0.18
    }
  },
  gaming: {
    budgetCeiling: 850,
    idealFormFactors: ["desktop", "component", "laptop"],
    keywords: ["gaming", "rtx", "gtx", "radeon", "rx", "1440p", "rog"],
    label: "Gaming",
    maxShippingPenalty: 16,
    minimumReliability: 66,
    repairRiskTolerance: 22,
    targetPerformance: 80,
    useCase: "gaming",
    weights: {
      ...baseWeights,
      aesthetics: 0.07,
      performance: 0.24,
      reliability: 0.11,
      value: 0.22
    }
  },
  general: {
    budgetCeiling: 500,
    idealFormFactors: ["desktop", "laptop", "workstation"],
    keywords: ["office", "productivity", "general", "business", "ssd"],
    label: "General",
    maxShippingPenalty: 12,
    minimumReliability: 74,
    repairRiskTolerance: 10,
    targetPerformance: 58,
    useCase: "general",
    weights: {
      ...baseWeights,
      performance: 0.13,
      reliability: 0.18,
      risk: 0.16,
      value: 0.22
    }
  },
  homelab: {
    budgetCeiling: 650,
    idealFormFactors: ["workstation", "desktop"],
    keywords: ["ecc", "homelab", "lab", "node", "optiplex", "render", "server", "xeon"],
    label: "Homelab",
    maxShippingPenalty: 20,
    minimumReliability: 70,
    repairRiskTolerance: 18,
    targetPerformance: 62,
    useCase: "homelab",
    weights: {
      ...baseWeights,
      aesthetics: 0.03,
      performance: 0.14,
      reliability: 0.16,
      upgradePotential: 0.18,
      value: 0.22
    }
  }
};

export function getUseCasePreset(useCase: HardwareUseCase) {
  return useCasePresets[useCase];
}
