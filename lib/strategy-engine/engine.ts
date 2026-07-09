import {
  convertCurrencyToUsd,
  convertUsdToCurrency,
  currencyToUsd,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import { getEncyclopediaReferencesForStrategy } from "@/lib/platform-encyclopedia";
import { getReasoningGraphPathIdsForContext } from "@/lib/reasoning-graph/engine";
import { getPlaybookStrategySignalsForAcquisition } from "@/lib/playbook-engine/engine";
import { useCaseLabels } from "@/types/hardware";
import { platformKnowledgeIds } from "@/types/platform-knowledge";
import type { OwnedItems } from "@/types/build-generator";
import type { HardwareUseCase } from "@/types/hardware";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type {
  HardwareStrategyRecommendation,
  HardwareStrategyTypeId,
  StrategyAcquisitionInput,
  StrategyEngineResult,
  StrategyInput,
  StrategyProjectSeed,
  StrategyTradeoffKey,
  StrategyTradeoffMatrix
} from "@/types/strategy";

type StrategyDefinition = {
  baseTradeoffs: StrategyTradeoffMatrix;
  defaultLifespanYears: number;
  id: HardwareStrategyTypeId;
  projectTitle: string;
  risks: string[];
  summary: string;
  title: string;
};

type StrategySignal = {
  encyclopediaEntryIds: string[];
  hiddenOpportunities: string[];
  reasons: string[];
  reasoningPathIds: string[];
  risks: string[];
  tradeoffs: StrategyTradeoffMatrix;
};

const strategyDefinitions: StrategyDefinition[] = [
  {
    baseTradeoffs: {
      confidence: 74,
      cost: 30,
      difficulty: 44,
      futureExpansion: 66,
      noise: 35,
      performance: 58,
      platformPotential: 62,
      powerDraw: 40,
      reliability: 62,
      repairability: 74,
      upgradeability: 68
    },
    defaultLifespanYears: 3,
    id: "upgrade-existing-machine",
    projectTitle: "Upgrade Existing Machine",
    risks: [
      "Existing platform limits can cap the final performance ceiling.",
      "Unknown PSU, airflow, and BIOS details must still be validated."
    ],
    summary:
      "Reuse the current machine as the base and spend only where bottlenecks are clear.",
    title: "Upgrade existing machine"
  },
  {
    baseTradeoffs: {
      confidence: 78,
      cost: 45,
      difficulty: 55,
      futureExpansion: 82,
      noise: 60,
      performance: 76,
      platformPotential: 86,
      powerDraw: 70,
      reliability: 72,
      repairability: 65,
      upgradeability: 84
    },
    defaultLifespanYears: 4,
    id: "buy-used-workstation",
    projectTitle: "Used Workstation Strategy",
    risks: [
      "Older workstation platforms can require BIOS, power cable, or cooler checks.",
      "Shipping weight and noise are usually higher than consumer desktops."
    ],
    summary:
      "Use an enterprise tower or workstation as a strong base platform, then upgrade selectively.",
    title: "Buy used workstation"
  },
  {
    baseTradeoffs: {
      confidence: 82,
      cost: 78,
      difficulty: 72,
      futureExpansion: 92,
      noise: 48,
      performance: 82,
      platformPotential: 80,
      powerDraw: 62,
      reliability: 80,
      repairability: 70,
      upgradeability: 89
    },
    defaultLifespanYears: 5,
    id: "build-from-scratch",
    projectTitle: "Build From Scratch",
    risks: [
      "Usually costs more upfront than reusing a base system.",
      "Requires full parts selection and assembly validation."
    ],
    summary:
      "Select every major part deliberately for clean compatibility, warranty, and upgrade room.",
    title: "Build from scratch"
  },
  {
    baseTradeoffs: {
      confidence: 62,
      cost: 68,
      difficulty: 78,
      futureExpansion: 58,
      noise: 70,
      performance: 69,
      platformPotential: 48,
      powerDraw: 55,
      reliability: 58,
      repairability: 42,
      upgradeability: 52
    },
    defaultLifespanYears: 3,
    id: "laptop-egpu",
    projectTitle: "Laptop and eGPU Strategy",
    risks: [
      "Thunderbolt bandwidth, dock compatibility, and external PSU wiring need review.",
      "Performance can be inconsistent compared with a desktop GPU path."
    ],
    summary:
      "Use a laptop as the compute base and add an external GPU path when portability matters.",
    title: "Laptop plus eGPU"
  },
  {
    baseTradeoffs: {
      confidence: 76,
      cost: 48,
      difficulty: 28,
      futureExpansion: 30,
      noise: 22,
      performance: 46,
      platformPotential: 35,
      powerDraw: 18,
      reliability: 76,
      repairability: 40,
      upgradeability: 32
    },
    defaultLifespanYears: 3,
    id: "mini-pc",
    projectTitle: "Mini PC Strategy",
    risks: [
      "GPU, PSU, and motherboard upgrade paths are usually limited.",
      "Thermal headroom can be tight under sustained CAD, rendering, or AI loads."
    ],
    summary:
      "Prioritize a small, quiet, efficient system for general, office, homelab, or light dev work.",
    title: "Mini PC"
  },
  {
    baseTradeoffs: {
      confidence: 64,
      cost: 42,
      difficulty: 74,
      futureExpansion: 85,
      noise: 84,
      performance: 68,
      platformPotential: 78,
      powerDraw: 88,
      reliability: 66,
      repairability: 72,
      upgradeability: 80
    },
    defaultLifespanYears: 4,
    id: "server-conversion",
    projectTitle: "Server Conversion Strategy",
    risks: [
      "Server platforms can be loud, power hungry, proprietary, and awkward for desktop use.",
      "GPU and storage upgrades often need riser, power, and airflow validation."
    ],
    summary:
      "Convert retired server-class hardware into a homelab, storage, virtualization, or render path.",
    title: "Server conversion"
  },
  {
    baseTradeoffs: {
      confidence: 55,
      cost: 25,
      difficulty: 82,
      futureExpansion: 50,
      noise: 48,
      performance: 54,
      platformPotential: 58,
      powerDraw: 50,
      reliability: 38,
      repairability: 90,
      upgradeability: 57
    },
    defaultLifespanYears: 2,
    id: "repair-existing-hardware",
    projectTitle: "Repair Existing Hardware",
    risks: [
      "Fault diagnosis can reveal additional hidden failures.",
      "The time cost can erase the apparent savings."
    ],
    summary:
      "Repair or salvage an existing machine when the fault is bounded and parts are reusable.",
    title: "Repair existing hardware"
  },
  {
    baseTradeoffs: {
      confidence: 84,
      cost: 8,
      difficulty: 10,
      futureExpansion: 62,
      noise: 20,
      performance: 35,
      platformPotential: 58,
      powerDraw: 20,
      reliability: 70,
      repairability: 20,
      upgradeability: 50
    },
    defaultLifespanYears: 0,
    id: "wait-for-better-value",
    projectTitle: "Wait For Better Value",
    risks: [
      "Waiting delays the project and can miss short-lived local deals.",
      "This is a decision path, not a build path."
    ],
    summary:
      "Do not force a project yet. Keep watching until the budget, platform, or evidence improves.",
    title: "Wait for better value"
  },
  {
    baseTradeoffs: {
      confidence: 70,
      cost: 52,
      difficulty: 78,
      futureExpansion: 89,
      noise: 55,
      performance: 78,
      platformPotential: 82,
      powerDraw: 58,
      reliability: 68,
      repairability: 78,
      upgradeability: 88
    },
    defaultLifespanYears: 4,
    id: "hybrid-strategy",
    projectTitle: "Hybrid Hardware Strategy",
    risks: [
      "Hybrid paths need the most careful evidence trail because they combine multiple sources.",
      "Adapters, donor parts, and used platforms increase validation complexity."
    ],
    summary:
      "Combine owned hardware, one promising acquisition, and targeted upgrades into one solution.",
    title: "Hybrid strategy"
  }
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneTradeoffs(value: StrategyTradeoffMatrix): StrategyTradeoffMatrix {
  return { ...value };
}

function applyTradeoffDelta(
  tradeoffs: StrategyTradeoffMatrix,
  delta: Partial<StrategyTradeoffMatrix>
) {
  for (const [key, value] of Object.entries(delta) as Array<
    [StrategyTradeoffKey, number]
  >) {
    tradeoffs[key] = clampScore(tradeoffs[key] + value);
  }
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getOverallScore(tradeoffs: StrategyTradeoffMatrix) {
  const positiveScore = average([
    tradeoffs.confidence,
    tradeoffs.futureExpansion,
    tradeoffs.performance,
    tradeoffs.platformPotential,
    tradeoffs.reliability,
    tradeoffs.repairability,
    tradeoffs.upgradeability
  ]);
  const burdenScore = average([
    tradeoffs.cost,
    tradeoffs.difficulty,
    tradeoffs.noise,
    tradeoffs.powerDraw
  ]);

  // Strategy scoring blends upside with practical burden so a powerful but
  // expensive/loud path can lose to a simpler path when constraints demand it.
  return clampScore(positiveScore * 0.68 + (100 - burdenScore) * 0.32);
}

function getOwnedHardwareLabels(ownedHardware: OwnedItems) {
  return Object.entries(ownedHardware)
    .filter(([, value]) => value)
    .map(([key]) => key.toUpperCase());
}

function hasOwnedDesktopKit(ownedHardware: OwnedItems) {
  return ownedHardware.monitor || ownedHardware.keyboard || ownedHardware.mouse;
}

function getBudgetUsd(input: StrategyInput) {
  return convertCurrencyToUsd(input.budget, input.currency);
}

function getAcquisitionPriceUsd(acquisition: StrategyAcquisitionInput) {
  if (typeof acquisition.priceAmount !== "number") {
    return null;
  }

  return Math.round(acquisition.priceAmount * currencyToUsd[acquisition.currency]);
}

function isWorkstationPlatform(acquisition: StrategyAcquisitionInput) {
  const platform = `${acquisition.detectedPlatformId ?? ""} ${
    acquisition.detectedPlatformName ?? ""
  }`.toLowerCase();

  return (
    platform.includes("thinkstation") ||
    platform.includes("precision") ||
    platform.includes("z440") ||
    platform.includes("z4") ||
    platform.includes("workstation")
  );
}

function findBestAcquisition(input: StrategyInput) {
  return input.acquisitions
    .filter((acquisition) => acquisition.status !== "archived")
    .sort(
      (a, b) =>
        b.recommendationPreviewScore - a.recommendationPreviewScore ||
        (getAcquisitionPriceUsd(a) ?? Number.MAX_SAFE_INTEGER) -
          (getAcquisitionPriceUsd(b) ?? Number.MAX_SAFE_INTEGER)
    )[0];
}

function getAcquisitionSignals(input: StrategyInput) {
  const best = findBestAcquisition(input);
  const budgetUsd = getBudgetUsd(input);

  if (!best) {
    return {
      best: null,
      isAmazingDeal: false,
      isBadPlatform: false,
      isBroken: false,
      isExcellentPlatform: false,
      isOverpriced: false,
      priceUsd: null,
      withinBudget: false
    };
  }

  const priceUsd = getAcquisitionPriceUsd(best);
  const isBroken =
    best.condition.toLowerCase().includes("broken") ||
    best.condition.toLowerCase().includes("parts");
  const isExcellentPlatform =
    isWorkstationPlatform(best) &&
    best.confidence === "high" &&
    best.recommendationPreviewScore >= 72;
  const isBadPlatform =
    best.confidence === "low" ||
    best.readiness === "not-ready" ||
    best.recommendationPreviewScore < 45;
  const withinBudget = typeof priceUsd === "number" && priceUsd <= budgetUsd * 1.1;
  const isOverpriced =
    typeof priceUsd === "number" &&
    (priceUsd > budgetUsd * 1.2 ||
      (isWorkstationPlatform(best) && best.recommendationPreviewScore < 55));
  const isAmazingDeal =
    isExcellentPlatform &&
    typeof priceUsd === "number" &&
    priceUsd <= budgetUsd * 0.9 &&
    !isBroken;

  return {
    best,
    isAmazingDeal,
    isBadPlatform,
    isBroken,
    isExcellentPlatform,
    isOverpriced,
    priceUsd,
    withinBudget
  };
}

function isPlatformKnowledgeId(value: string | null): value is PlatformKnowledgeId {
  return Boolean(value && platformKnowledgeIds.includes(value as PlatformKnowledgeId));
}

function getPrimaryGoal(input: StrategyInput): HardwareUseCase {
  return input.goals[0] ?? "general";
}

function addSignal(
  signal: StrategySignal,
  delta: Partial<StrategyTradeoffMatrix>,
  reason?: string
) {
  applyTradeoffDelta(signal.tradeoffs, delta);

  if (reason) {
    signal.reasons.push(reason);
  }
}

function addRisk(signal: StrategySignal, risk: string) {
  if (!signal.risks.includes(risk)) {
    signal.risks.push(risk);
  }
}

function addHiddenOpportunity(signal: StrategySignal, opportunity: string) {
  if (!signal.hiddenOpportunities.includes(opportunity)) {
    signal.hiddenOpportunities.push(opportunity);
  }
}

function addEncyclopediaReferences(
  signal: StrategySignal,
  references: string[]
) {
  signal.encyclopediaEntryIds = [
    ...new Set([...signal.encyclopediaEntryIds, ...references])
  ];
}

function addReasoningPathIds(signal: StrategySignal, pathIds: string[]) {
  signal.reasoningPathIds = [
    ...new Set([...signal.reasoningPathIds, ...pathIds])
  ];
}

function applyBudgetSignals(
  definition: StrategyDefinition,
  input: StrategyInput,
  signal: StrategySignal
) {
  const budgetUsd = getBudgetUsd(input);

  if (budgetUsd < 350) {
    const hasReusableHardware = getOwnedHardwareLabels(input.ownedHardware).length > 0;

    if (definition.id === "wait-for-better-value") {
      addSignal(signal, { confidence: 16, cost: -10, difficulty: -6 }, "Budget is tight, so the safest path avoids forcing a full build.");
    } else if (definition.id === "upgrade-existing-machine" && hasReusableHardware) {
      addSignal(signal, { confidence: 10, cost: -8, difficulty: -4 }, "Budget is tight, so the safest path avoids forcing a full build.");
    } else if (definition.id === "upgrade-existing-machine") {
      addSignal(signal, { confidence: -8, repairability: -6 }, "Upgrade ranks lower because no reusable existing machine or major owned parts were provided.");
    } else if (definition.id === "repair-existing-hardware") {
      addSignal(signal, { confidence: 7, cost: -5 }, "Repair stays viable because the cash budget is too small for a clean build.");
    } else {
      addSignal(signal, { confidence: -10, cost: 18 }, "Budget is below the normal floor for this path.");
      addRisk(signal, "The budget is likely too small for this strategy without a rare local deal.");
    }
  } else if (budgetUsd < 750) {
    if (
      definition.id === "upgrade-existing-machine" ||
      definition.id === "mini-pc" ||
      definition.id === "buy-used-workstation"
    ) {
      addSignal(signal, { confidence: 5, cost: -5 }, "Budget favors reuse, mini systems, or carefully chosen surplus workstations.");
    }

    if (definition.id === "build-from-scratch") {
      addSignal(signal, { confidence: -7, cost: 10 }, "A clean scratch build may consume too much of the available budget.");
    }
  } else if (budgetUsd >= 1200) {
    if (
      definition.id === "build-from-scratch" ||
      definition.id === "buy-used-workstation" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { confidence: 7, performance: 5, futureExpansion: 5 }, "Budget is large enough to evaluate stronger long-term platforms.");
    }
  }
}

function applyGoalSignals(
  definition: StrategyDefinition,
  input: StrategyInput,
  signal: StrategySignal
) {
  const goal = getPrimaryGoal(input);

  if (goal === "gaming") {
    if (definition.id === "build-from-scratch" || definition.id === "hybrid-strategy") {
      addSignal(signal, { performance: 8, confidence: 5 }, "Gaming rewards GPU-first paths with cleaner airflow and power planning.");
    }

    if (definition.id === "buy-used-workstation") {
      addSignal(signal, { noise: 8, powerDraw: 8 }, "Workstations can game well, but noise and PSU/GPU details matter.");
    }
  }

  if (goal === "cad" || goal === "engineering") {
    if (
      definition.id === "buy-used-workstation" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { confidence: 9, platformPotential: 9, reliability: 5 }, "Engineering and CAD benefit from reliable enterprise platforms and upgrade paths.");
    }

    if (definition.id === "mini-pc") {
      addSignal(signal, { performance: -8, futureExpansion: -8 }, "Mini PCs can work, but sustained CAD and engineering workloads need more headroom.");
    }
  }

  if (goal === "ai") {
    if (
      definition.id === "buy-used-workstation" ||
      definition.id === "hybrid-strategy" ||
      definition.id === "build-from-scratch"
    ) {
      addSignal(signal, { performance: 8, upgradeability: 7, platformPotential: 6 }, "Local AI paths need GPU, PSU, cooling, and future VRAM headroom.");
    }

    if (definition.id === "mini-pc") {
      addSignal(signal, { performance: -14, futureExpansion: -12 }, "Mini PCs are usually constrained for local AI unless the target workload is tiny.");
    }
  }

  if (goal === "homelab") {
    if (definition.id === "server-conversion" || definition.id === "mini-pc") {
      addSignal(signal, { confidence: 8, platformPotential: 6 }, "Homelab work benefits from either efficient mini systems or expandable server-class gear.");
    }
  }

  if (goal === "programming" || goal === "general") {
    if (definition.id === "mini-pc" || definition.id === "upgrade-existing-machine") {
      addSignal(signal, { confidence: 6, cost: -4, noise: -4 }, "General and programming work often rewards quiet, inexpensive reuse over maximum performance.");
    }
  }
}

function applyOwnedHardwareSignals(
  definition: StrategyDefinition,
  input: StrategyInput,
  signal: StrategySignal
) {
  const owned = input.ownedHardware;
  const ownedLabels = getOwnedHardwareLabels(owned);

  if (ownedLabels.length > 0) {
    signal.reasons.push(`Already-owned hardware is part of the strategy: ${ownedLabels.join(", ")}.`);
  } else if (definition.id === "upgrade-existing-machine") {
    addSignal(signal, { confidence: -12, cost: 6, repairability: -6 }, "Upgrade ranks lower because no existing reusable hardware was provided.");
  }

  if (owned.gpu) {
    if (
      definition.id === "upgrade-existing-machine" ||
      definition.id === "hybrid-strategy" ||
      definition.id === "laptop-egpu"
    ) {
      addSignal(signal, { cost: -12, performance: 5, confidence: 5 }, "Owned GPU can reduce spend if power and physical fit validate.");
      addHiddenOpportunity(signal, "Reuse the owned GPU before buying another one.");
    }
  }

  if (owned.ram || owned.ssd || owned.psu) {
    if (
      definition.id === "upgrade-existing-machine" ||
      definition.id === "repair-existing-hardware" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { cost: -8, repairability: 5 }, "Owned RAM, storage, or PSU can make reuse paths materially cheaper.");
    }

    if (owned.ram) {
      addHiddenOpportunity(signal, "Check whether owned RAM can be reused directly or through an adapter path.");
    }
  }

  if (hasOwnedDesktopKit(owned)) {
    if (
      definition.id === "build-from-scratch" ||
      definition.id === "buy-used-workstation" ||
      definition.id === "upgrade-existing-machine"
    ) {
      addSignal(signal, { cost: -4 }, "Existing monitor, keyboard, or mouse lowers the real desktop setup cost.");
    }
  }
}

function applyAcquisitionSignals(
  definition: StrategyDefinition,
  input: StrategyInput,
  signal: StrategySignal
) {
  const acquisition = getAcquisitionSignals(input);

  if (!acquisition.best) {
    return;
  }

  const title = acquisition.best.title;
  const playbookSignals =
    !acquisition.isBroken || definition.id === "repair-existing-hardware"
      ? getPlaybookStrategySignalsForAcquisition(acquisition.best, definition.id)
      : {
          hiddenOpportunities: [],
          reasons: [],
          risks: []
        };

  if (playbookSignals.reasons.length > 0) {
    addSignal(
      signal,
      { confidence: 4, platformPotential: 5, upgradeability: 3 },
      playbookSignals.reasons[0]
    );

    for (const reason of playbookSignals.reasons.slice(1)) {
      signal.reasons.push(reason);
    }
  }

  for (const opportunity of playbookSignals.hiddenOpportunities) {
    addHiddenOpportunity(signal, opportunity);
  }

  for (const risk of playbookSignals.risks) {
    addRisk(signal, risk);
  }

  if (isPlatformKnowledgeId(acquisition.best.detectedPlatformId)) {
    const references = getEncyclopediaReferencesForStrategy(
      acquisition.best.detectedPlatformId,
      definition.id,
      "Strategy uses encyclopedia sections for recognized acquisition context."
    );

    if (references.length > 0) {
      addEncyclopediaReferences(
        signal,
        references.map((reference) => reference.entryId)
      );
      signal.reasons.push(
        `Encyclopedia context: ${references
          .slice(0, 2)
          .map((reference) => reference.sectionId.replaceAll("-", " "))
          .join(", ")}.`
      );
    }

    const graphPathIds = getReasoningGraphPathIdsForContext({
      platformId: acquisition.best.detectedPlatformId,
      strategyType: definition.id
    });

    if (graphPathIds.length > 0) {
      addReasoningPathIds(signal, graphPathIds);
      signal.reasons.push(
        `Reasoning graph contributes ${graphPathIds.length} path${graphPathIds.length === 1 ? "" : "s"} for this platform.`
      );
    }
  }

  if (acquisition.isAmazingDeal) {
    if (definition.id === "buy-used-workstation") {
      addSignal(signal, { confidence: 20, cost: -18, platformPotential: 14 }, `${title} looks like a strong acquisition input within budget.`);
      addHiddenOpportunity(signal, "Use the acquisition as the base project only after slot mapping review.");
    } else if (definition.id === "hybrid-strategy") {
      addSignal(signal, { confidence: 6, cost: -8, platformPotential: 6 }, `${title} can support a hybrid path, but the clean workstation buy is simpler.`);
      addHiddenOpportunity(signal, "Use the acquisition as the base project only after slot mapping review.");
    }

    if (definition.id === "wait-for-better-value") {
      addSignal(signal, { confidence: -14 }, "Waiting ranks lower because a strong acquisition is already available.");
    }
  }

  if (acquisition.isExcellentPlatform && acquisition.withinBudget) {
    if (definition.id === "buy-used-workstation") {
      addSignal(signal, { confidence: 16, cost: -10, platformPotential: 12 }, "The acquisition has a recognized platform with useful expansion potential.");
    }

    if (definition.id === "hybrid-strategy") {
      addSignal(signal, { confidence: 3, upgradeability: 4 }, "The acquisition can become a base plus targeted upgrades.");
    }
  }

  if (acquisition.isOverpriced || acquisition.isBadPlatform) {
    if (definition.id === "wait-for-better-value") {
      const repairableBrokenInput =
        acquisition.isBroken &&
        (input.repairWillingness === "major" ||
          input.repairWillingness === "moderate");

      addSignal(
        signal,
        {
          confidence: repairableBrokenInput ? -25 : 38,
          cost: repairableBrokenInput ? 5 : -15,
          difficulty: repairableBrokenInput ? 2 : -8
        },
        repairableBrokenInput
          ? "Walking away remains valid, but repair willingness keeps the broken acquisition in play."
          : "The saved acquisition is weak enough that walking away is a valid strategy."
      );
    } else if (definition.id === "upgrade-existing-machine") {
      addSignal(signal, { confidence: -8, cost: -2 }, "The saved acquisition is weak, so only confirmed owned hardware can justify an upgrade path.");
    } else if (definition.id !== "repair-existing-hardware") {
      addSignal(signal, { confidence: -18, cost: 12, difficulty: 5 }, "Weak acquisition evidence penalizes project-creation strategies.");
    }

    if (
      definition.id === "buy-used-workstation" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { confidence: -12, cost: 14 }, "The acquisition needs more evidence before it should become a project.");
      addRisk(signal, "Saved acquisition may be overpriced, low-confidence, or not ready.");
    }
  }

  if (acquisition.isBroken) {
    if (definition.id === "repair-existing-hardware") {
      const repairBoost =
        input.repairWillingness === "major" || input.repairWillingness === "moderate"
          ? 42
          : 8;

      addSignal(signal, { confidence: repairBoost, cost: -14, performance: 8, repairability: 18, platformPotential: 12 }, "Broken or parts listings can be viable only as explicit repair strategies.");
    } else if (definition.id !== "wait-for-better-value") {
      addSignal(signal, { confidence: -16, difficulty: 8 }, "Broken acquisition input penalizes non-repair strategies.");
      if (definition.id === "upgrade-existing-machine") {
        addSignal(signal, { confidence: -35, difficulty: 10, platformPotential: -20 }, "A broken acquisition should not be treated as a normal upgrade base.");
      }
      addRisk(signal, "Broken acquisition input should not be treated as a solved build.");
    }
  }
}

function applyConstraintSignals(
  definition: StrategyDefinition,
  input: StrategyInput,
  signal: StrategySignal
) {
  if (input.riskTolerance === "low") {
    if (
      definition.id === "repair-existing-hardware" ||
      definition.id === "server-conversion" ||
      definition.id === "laptop-egpu" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { confidence: -9, difficulty: 8 }, "Low risk tolerance penalizes complex or repair-heavy paths.");
    }

    if (definition.id === "build-from-scratch" || definition.id === "mini-pc") {
      addSignal(signal, { reliability: 5, confidence: 4 }, "Low risk tolerance rewards cleaner, more predictable strategies.");
    }
  }

  if (input.riskTolerance === "high") {
    if (
      definition.id === "repair-existing-hardware" ||
      definition.id === "server-conversion" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { confidence: 7, repairability: 6 }, "High risk tolerance makes niche and repair paths acceptable.");
    }
  }

  if (input.noisePreference === "quiet") {
    if (definition.id === "mini-pc" || definition.id === "upgrade-existing-machine") {
      addSignal(signal, { noise: -10, confidence: 5 }, "Quiet preference favors efficient low-noise paths.");
    }

    if (
      definition.id === "server-conversion" ||
      definition.id === "buy-used-workstation"
    ) {
      addSignal(signal, { confidence: -6, noise: 14 }, "Quiet preference penalizes surplus enterprise hardware unless fan behavior is known.");
    }
  }

  if (input.powerConstraint === "strict") {
    if (definition.id === "mini-pc" || definition.id === "wait-for-better-value") {
      addSignal(signal, { confidence: 8, powerDraw: -10 }, "Strict power limits favor efficient or deferred paths.");
    }

    if (
      definition.id === "server-conversion" ||
      definition.id === "buy-used-workstation"
    ) {
      addSignal(signal, { confidence: -10, powerDraw: 18 }, "Strict power limits penalize older workstation and server-class platforms.");
    }
  }

  if (input.portability === "required") {
    if (definition.id === "mini-pc" || definition.id === "laptop-egpu") {
      addSignal(signal, { confidence: 12, cost: -2 }, "Portability requirement keeps compact and laptop-based paths in play.");
    }

    if (
      definition.id === "buy-used-workstation" ||
      definition.id === "build-from-scratch" ||
      definition.id === "server-conversion"
    ) {
      addSignal(signal, { confidence: -15, difficulty: 6 }, "Portability requirement penalizes tower and server strategies.");
    }
  }

  if (input.repairWillingness === "none") {
    if (definition.id === "repair-existing-hardware") {
      addSignal(signal, { confidence: -25, difficulty: 18 }, "Repair willingness is none, so repair should not become the primary path.");
    }
  }

  if (input.repairWillingness === "major") {
    if (
      definition.id === "repair-existing-hardware" ||
      definition.id === "hybrid-strategy" ||
      definition.id === "server-conversion"
    ) {
      addSignal(signal, { confidence: 8, repairability: 7 }, "Major repair willingness unlocks salvage, donor, and conversion strategies.");
    }
  }

  if (input.timeHorizon === "short") {
    if (
      definition.id === "mini-pc" ||
      definition.id === "upgrade-existing-machine" ||
      definition.id === "buy-used-workstation"
    ) {
      addSignal(signal, { confidence: 5, difficulty: -5 }, "Short time horizon rewards strategies that start from a known base.");
    }

    if (definition.id === "server-conversion" || definition.id === "hybrid-strategy") {
      addSignal(signal, { confidence: -6, difficulty: 8 }, "Short time horizon penalizes complex multi-source paths.");
    }
  }

  if (input.timeHorizon === "long") {
    if (
      definition.id === "build-from-scratch" ||
      definition.id === "buy-used-workstation" ||
      definition.id === "hybrid-strategy"
    ) {
      addSignal(signal, { futureExpansion: 8, upgradeability: 6 }, "Long time horizon rewards platform growth and future expansion.");
    }
  }
}

function buildProjectSeed(
  definition: StrategyDefinition,
  input: StrategyInput,
  overallScore: number,
  shouldCreateProject: boolean
): StrategyProjectSeed | null {
  if (!shouldCreateProject) {
    return null;
  }

  const goal = getPrimaryGoal(input);
  const purpose = definition.id === "mini-pc" && goal === "ai" ? "general" : goal;

  return {
    branchNotes: [
      `Strategy: ${definition.title}.`,
      `Strategy score: ${overallScore}.`,
      `Primary goal: ${useCaseLabels[goal]}.`,
      "Created before component-level optimization."
    ].join(" "),
    budget: input.budget,
    country: input.country,
    currency: input.currency,
    ownedHardware: input.ownedHardware,
    purpose,
    title: `${definition.projectTitle} - ${useCaseLabels[goal]}`
  };
}

function scoreStrategy(
  definition: StrategyDefinition,
  input: StrategyInput
): Omit<HardwareStrategyRecommendation, "rank" | "whyAlternativesRankedLower"> {
  const signal: StrategySignal = {
    encyclopediaEntryIds: [],
    hiddenOpportunities: [],
    reasons: [`${definition.title} starts from the ${definition.summary.toLowerCase()}`],
    reasoningPathIds: [],
    risks: [...definition.risks],
    tradeoffs: cloneTradeoffs(definition.baseTradeoffs)
  };

  applyBudgetSignals(definition, input, signal);
  applyGoalSignals(definition, input, signal);
  applyOwnedHardwareSignals(definition, input, signal);
  applyAcquisitionSignals(definition, input, signal);
  applyConstraintSignals(definition, input, signal);
  addReasoningPathIds(
    signal,
    getReasoningGraphPathIdsForContext({ strategyType: definition.id })
  );

  if (definition.id === "wait-for-better-value") {
    signal.hiddenOpportunities.push(
      "Use acquisition history as a watchlist instead of creating a project prematurely."
    );
  }

  if (definition.id === "buy-used-workstation") {
    signal.hiddenOpportunities.push(
      "Check known platform upgrades such as PCIe NVMe adapters, GPU cable kits, and ECC RAM capacity."
    );
  }

  if (definition.id === "laptop-egpu") {
    signal.hiddenOpportunities.push(
      "Use eGPU and external PSU paths only when bandwidth, power, and monitor setup are validated."
    );
  }

  const overallScore = getOverallScore(signal.tradeoffs);
  const shouldCreateProject =
    definition.id !== "wait-for-better-value" &&
    !(definition.id === "repair-existing-hardware" && input.repairWillingness === "none");
  const projectSeed = buildProjectSeed(
    definition,
    input,
    overallScore,
    shouldCreateProject
  );
  const acquisitionIds = input.acquisitions
    .map((acquisition) => acquisition.acquisitionId)
    .filter((id): id is string => Boolean(id));

  return {
    confidence: signal.tradeoffs.confidence,
    encyclopediaEntryIds: signal.encyclopediaEntryIds,
    expectedLifespanYears:
      definition.defaultLifespanYears +
      (input.timeHorizon === "long" && definition.defaultLifespanYears > 0 ? 1 : 0),
    hiddenOpportunities: signal.hiddenOpportunities,
    id: `strategy-${definition.id}`,
    overallScore,
    projectSeed,
    reasoningPathIds: signal.reasoningPathIds,
    risks: signal.risks,
    shouldCreateProject,
    sourceAcquisitionIds: acquisitionIds,
    summary: definition.summary,
    title: definition.title,
    tradeoffs: signal.tradeoffs,
    type: definition.id,
    whyChosen: signal.reasons.slice(0, 6)
  };
}

function explainLowerAlternative(
  winner: HardwareStrategyRecommendation,
  lower: HardwareStrategyRecommendation
) {
  const differences = [
    lower.tradeoffs.confidence + 6 < winner.tradeoffs.confidence
      ? `${lower.title} has lower confidence`
      : null,
    lower.tradeoffs.performance + 8 < winner.tradeoffs.performance
      ? `${lower.title} has lower performance headroom`
      : null,
    lower.tradeoffs.cost > winner.tradeoffs.cost + 8
      ? `${lower.title} carries higher cost burden`
      : null,
    lower.tradeoffs.difficulty > winner.tradeoffs.difficulty + 8
      ? `${lower.title} is harder to execute`
      : null,
    lower.tradeoffs.powerDraw > winner.tradeoffs.powerDraw + 10
      ? `${lower.title} uses more power`
      : null
  ].filter((value): value is string => Boolean(value));

  return differences[0] ?? `${lower.title} scored lower after constraints and tradeoffs were applied.`;
}

function addAlternativeExplanations(
  recommendations: Array<
    Omit<HardwareStrategyRecommendation, "rank" | "whyAlternativesRankedLower">
  >
): HardwareStrategyRecommendation[] {
  const sorted = recommendations
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((recommendation, index) => ({
      ...recommendation,
      rank: index + 1,
      whyAlternativesRankedLower: [] as string[]
    }));

  return sorted.map((recommendation) => {
    const lowerStrategies = sorted
      .filter((candidate) => candidate.overallScore < recommendation.overallScore)
      .slice(0, 3);

    return {
      ...recommendation,
      whyAlternativesRankedLower:
        lowerStrategies.length > 0
          ? lowerStrategies.map((candidate) =>
              explainLowerAlternative(recommendation, candidate)
            )
          : ["No lower-ranked strategy remains; this is the current fallback path."]
    };
  });
}

function getBestBy(
  recommendations: HardwareStrategyRecommendation[],
  key: StrategyTradeoffKey,
  direction: "higher-better" | "lower-better"
) {
  return [...recommendations].sort((a, b) =>
    direction === "higher-better"
      ? b.tradeoffs[key] - a.tradeoffs[key]
      : a.tradeoffs[key] - b.tradeoffs[key]
  )[0];
}

function buildComparisonHighlights(
  recommendations: HardwareStrategyRecommendation[]
) {
  const bestCost = getBestBy(recommendations, "cost", "lower-better");
  const bestPerformance = getBestBy(recommendations, "performance", "higher-better");
  const bestReliability = getBestBy(recommendations, "reliability", "higher-better");
  const bestPower = getBestBy(recommendations, "powerDraw", "lower-better");
  const bestPlatform = getBestBy(
    recommendations,
    "platformPotential",
    "higher-better"
  );

  return [
    {
      bestStrategyId: bestCost.id,
      explanation: `${bestCost.title} has the lowest cost burden under the current budget and owned-hardware assumptions.`,
      label: "Lowest cost burden"
    },
    {
      bestStrategyId: bestPerformance.id,
      explanation: `${bestPerformance.title} has the strongest raw performance path before optimization.`,
      label: "Highest performance"
    },
    {
      bestStrategyId: bestReliability.id,
      explanation: `${bestReliability.title} looks most reliable before specific component validation.`,
      label: "Highest reliability"
    },
    {
      bestStrategyId: bestPower.id,
      explanation: `${bestPower.title} best respects power and noise constraints.`,
      label: "Lowest power pressure"
    },
    {
      bestStrategyId: bestPlatform.id,
      explanation: `${bestPlatform.title} leaves the most platform opportunity for later upgrades.`,
      label: "Best platform potential"
    }
  ];
}

export function createDefaultStrategyInput(
  overrides: Partial<StrategyInput> = {}
): StrategyInput {
  return {
    acquisitions: [],
    budget: 850,
    country: "United States",
    currency: "USD",
    goals: ["engineering"],
    noisePreference: "balanced",
    portability: "not-needed",
    powerConstraint: "moderate",
    region: "United States",
    repairWillingness: "minor",
    riskTolerance: "medium",
    timeHorizon: "medium",
    ...overrides,
    ownedHardware: {
      ...defaultOwnedItems,
      ...(overrides.ownedHardware ?? {})
    }
  };
}

export function generateHardwareStrategies(
  input: StrategyInput
): StrategyEngineResult {
  const recommendations = addAlternativeExplanations(
    strategyDefinitions.map((definition) => scoreStrategy(definition, input))
  );

  return {
    comparison: buildComparisonHighlights(recommendations),
    input,
    recommendations
  };
}

export function estimateStrategyBudgetInCurrency(
  input: StrategyInput,
  budgetUsd: number
) {
  return convertUsdToCurrency(budgetUsd, input.currency);
}
