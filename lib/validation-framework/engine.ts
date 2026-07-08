import { compatibilityValidationFixtures } from "@/data/compatibility/validation-fixtures";
import { adapterIntelligenceProfiles, platformKnowledgeProfiles } from "@/data/platform-knowledge";
import { platformEncyclopediaEntries } from "@/data/platform-encyclopedia";
import { buildWorkspaceSlotDefinitions, starterEngineeringWorkspaceProject } from "@/data/solution-builder";
import { strategyValidationFixtures } from "@/data/strategy-validation-fixtures";
import { hardwareValidationScenarios } from "@/data/validation/hardware-scenarios";
import { getCompatibilityValidationResults } from "@/data/compatibility/validation-fixtures";
import {
  generateProjectActionPlan,
  validateActionPlanFixture
} from "@/lib/action-plan-engine/engine";
import { getKnowledgeQualityForPlatform, getEvidenceSummaryForPlatform } from "@/lib/evidence-engine";
import { buildImporterFixtureResult } from "@/lib/importer-fixtures/engine";
import { buildListingIntelligenceRecord } from "@/lib/listing-intelligence/engine";
import { normalizeMarketplaceListing } from "@/lib/marketplace-intelligence/normalize";
import { optimizeBuildProject } from "@/lib/optimization-engine/pipeline";
import { validatePlatformEncyclopediaCoverage } from "@/lib/platform-encyclopedia";
import {
  getPlaybooksForProject,
  validateHardwarePlaybooks
} from "@/lib/playbook-engine/engine";
import { generateHardwareStrategies } from "@/lib/strategy-engine/engine";
import { analyzeBuildSolution } from "@/lib/solution-intelligence/engine";
import { createBuildWorkspaceModel } from "@/lib/solution-builder/workspace";
import { getComponentById, toWorkspaceSelection } from "@/lib/component-inventory";
import { compatibilityRules } from "@/lib/compatibility-engine/rules";
import { optimizationDepths, optimizationGoals } from "@/types/optimization";
import { solutionUseCaseIds } from "@/types/solution-intelligence";
import type {
  BuildSlotId,
  BuildWorkspaceProject,
  BuildWorkspaceSlot
} from "@/types/solution-builder";
import type {
  HardwareValidationScenario,
  HardwareValidationSuiteResult,
  PlatformKnowledgeValidationResult,
  RuleCoverageResult,
  ValidationAssertion,
  ValidationCoverageArea,
  ValidationCoverageMarkers,
  ValidationProjectSpec,
  ValidationScenarioResult
} from "@/types/validation-framework";

const validationGeneratedAt = "2026-07-06T00:00:00.000Z";

const validationCoverageAreas: ValidationCoverageArea[] = [
  "action-plan",
  "marketplace",
  "listing",
  "evidence",
  "platform",
  "playbook",
  "solution",
  "strategy",
  "optimization",
  "compatibility",
  "builder"
];

const builderRuleInventory = [
  "builder:required-slots-present",
  "builder:component-category-fits-slot",
  "builder:gpu-physical-fit",
  "builder:power-headroom",
  "builder:pcie-generation-fit",
  "builder:ram-platform-fit",
  "builder:storage-interface-fit",
  "builder:cooling-and-airflow",
  "builder:bios-and-platform-age",
  "builder:slot-headroom",
  "builder:display-availability"
];

function cloneProject(project: BuildWorkspaceProject): BuildWorkspaceProject {
  return JSON.parse(JSON.stringify(project)) as BuildWorkspaceProject;
}

function createAssertion(
  message: string,
  passed: boolean,
  expected: string | number | null,
  actual: string | number | null
): ValidationAssertion {
  return {
    actual,
    expected,
    message,
    passed
  };
}

function getEmptyOwnedItems(): BuildWorkspaceProject["ownedItems"] {
  return {
    gpu: false,
    hdd: false,
    keyboard: false,
    monitor: false,
    mouse: false,
    psu: false,
    ram: false,
    speakers: false,
    ssd: false
  };
}

function getDefaultPreferences(): BuildWorkspaceProject["preferences"] {
  return {
    aestheticsPriority: false,
    lowestPricePriority: false,
    lowPowerUsage: false,
    preferDesktops: true,
    preferLaptops: false,
    preferWorkstations: true,
    quietOperation: false,
    reliabilityPriority: true,
    smallFormFactor: false,
    upgradeabilityPriority: true
  };
}

function createBlankProject(spec: ValidationProjectSpec): BuildWorkspaceProject {
  return {
    budget: spec.budget,
    country: "United States",
    currency: "USD",
    id: `validation-${spec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    ownedItems: getEmptyOwnedItems(),
    preferences: getDefaultPreferences(),
    purpose: "engineering",
    slots: buildWorkspaceSlotDefinitions.map((definition) => ({
      definitionId: definition.id
    })),
    title: spec.title
  };
}

function applySelections(
  project: BuildWorkspaceProject,
  selections: Partial<Record<BuildSlotId, string>>
): BuildWorkspaceProject {
  const selectionEntries = Object.entries(selections) as Array<[BuildSlotId, string]>;

  return {
    ...project,
    slots: project.slots.map((slot): BuildWorkspaceSlot => {
      const selection = selectionEntries.find(
        ([slotId]) => slotId === slot.definitionId
      );

      if (!selection) {
        return slot;
      }

      const component = getComponentById(selection[1]);

      if (!component) {
        throw new Error(
          `Validation scenario references unknown component ${selection[1]}.`
        );
      }

      return {
        ...slot,
        selectedHardware: toWorkspaceSelection(component)
      };
    })
  };
}

function createProject(spec: ValidationProjectSpec): BuildWorkspaceProject {
  const base =
    spec.baseProjectId === "starter-engineering"
      ? cloneProject(starterEngineeringWorkspaceProject)
      : createBlankProject(spec);

  return {
    ...applySelections(base, spec.selections),
    budget: spec.budget,
    title: spec.title
  };
}

function createCoverageBuckets(): Record<ValidationCoverageArea, Set<string>> {
  return validationCoverageAreas.reduce((accumulator, area) => {
    accumulator[area] = new Set<string>();
    return accumulator;
  }, {} as Record<ValidationCoverageArea, Set<string>>);
}

function addCoverage(
  target: Record<ValidationCoverageArea, Set<string>>,
  coverage: ValidationCoverageMarkers
) {
  for (const area of validationCoverageAreas) {
    for (const marker of coverage[area] ?? []) {
      target[area].add(marker);
    }
  }
}

function getRuleInventory(): Record<ValidationCoverageArea, string[]> {
  return {
    "action-plan": [
      "action-plan:generated",
      "action-plan:dependencies",
      "action-plan:evidence-links",
      "action-plan:validation-impact",
      "action-plan:progress-metrics",
      "action-plan:task-statuses"
    ],
    builder: builderRuleInventory,
    compatibility: compatibilityRules.map((rule) => `compatibility:${rule.id}`),
    evidence: [
      "evidence:parsed-field-links",
      "evidence:platform-summary",
      "evidence:knowledge-quality",
      "evidence:importer-validation-errors"
    ],
    listing: [
      "listing:ready-workstation",
      "listing:review-workstation",
      "listing:office-readiness",
      "listing:not-ready-broken",
      "listing:unknown-platform-review",
      "listing:low-confidence",
      "listing:duplicate-detection",
      "listing:adapter-preview",
      "listing:sff-limitations"
    ],
    marketplace: [
      "marketplace:platform-detection",
      "marketplace:normalization",
      "marketplace:future-paths",
      "marketplace:condition-broken",
      "marketplace:unknown-platform",
      "marketplace:low-confidence-fields"
    ],
    optimization: [
      ...optimizationGoals.map((goal) => `optimization:${goal}`),
      ...optimizationDepths.map((depth) => `optimization:${depth}-depth`)
    ],
    platform: [
      ...platformKnowledgeProfiles.map((profile) => `platform:${profile.id}`),
      ...platformEncyclopediaEntries.map(
        (entry) => `platform-encyclopedia:${entry.platformId}`
      ),
      ...adapterIntelligenceProfiles.map((adapter) => `platform-adapter:${adapter.id}`),
      "platform:nvme-adapter",
      "platform:low-profile-constraint",
      "platform:rtx-upgrade",
      "platform-encyclopedia:memory-topology",
      "platform-encyclopedia:power-topology",
      "platform-encyclopedia:storage-guidance",
      "platform-encyclopedia:upgrade-paths",
      "platform-encyclopedia:reliability",
      "platform-encyclopedia:workload-profiles"
    ],
    playbook: [
      ...platformKnowledgeProfiles.map((profile) => `playbook:${profile.id}`),
      "playbook:required-sections",
      "playbook:evidence-links",
      "playbook:strategy-signals",
      "playbook:project-progress"
    ],
    solution: [
      ...solutionUseCaseIds.map((useCase) => `solution:${useCase}`),
      "solution:bottlenecks",
      "solution:platform-opportunities",
      "solution:rejection-reasons",
      "solution:decision-timeline",
      "solution:general-purpose-fallback",
      "solution:missing-gpu",
      "solution:risk-rejection"
    ],
    strategy: [
      "strategy:budget-too-small",
      "strategy:overpriced-workstation",
      "strategy:amazing-deal",
      "strategy:bad-platform",
      "strategy:excellent-platform",
      "strategy:repair-candidate",
      "strategy:walk-away",
      "strategy:project-seed"
    ]
  };
}

function getCoverageResult(
  coveredMarkers: Set<string>,
  inventory: string[]
): RuleCoverageResult {
  const covered = inventory.filter((marker) => coveredMarkers.has(marker)).sort();
  const uncovered = inventory.filter((marker) => !coveredMarkers.has(marker)).sort();

  return {
    covered,
    percent: inventory.length
      ? Math.round((covered.length / inventory.length) * 100)
      : 100,
    total: inventory.length,
    uncovered
  };
}

function getExpectedImporterErrorCodes() {
  const result = buildImporterFixtureResult({
    fixtureSetId: "validation-error-listings",
    mode: "dry-run"
  });

  return new Set(result.errors.map((error) => error.code));
}

function validateScenario(
  scenario: HardwareValidationScenario,
  importerErrorCodes: Set<string>
): ValidationScenarioResult {
  const normalizedListings = scenario.rawListings.map(normalizeMarketplaceListing);
  const normalized = normalizedListings[0];
  const listing = buildListingIntelligenceRecord(normalized, normalizedListings);
  const platformProfile = platformKnowledgeProfiles.find(
    (profile) => profile.id === normalized.hardware.platformDetection.detectedPlatformId
  );
  const assertions: ValidationAssertion[] = [
    createAssertion(
      "Detected platform ID matches golden output.",
      normalized.hardware.platformDetection.detectedPlatformId ===
        scenario.expected.platformId,
      scenario.expected.platformId,
      normalized.hardware.platformDetection.detectedPlatformId
    ),
    createAssertion(
      "Marketplace confidence level matches golden output.",
      normalized.confidence.confidence === scenario.expected.confidence,
      scenario.expected.confidence,
      normalized.confidence.confidence
    ),
    createAssertion(
      "Recommendation readiness matches golden output.",
      listing.recommendationPreview.recommendationReadiness ===
        scenario.expected.recommendationReadiness,
      scenario.expected.recommendationReadiness,
      listing.recommendationPreview.recommendationReadiness
    ),
    createAssertion(
      "Expected solution pathway is still produced.",
      normalized.possibleFutures.some(
        (future) => future.title === scenario.expected.solutionPath
      ),
      scenario.expected.solutionPath,
      normalized.possibleFutures[0]?.title ?? null
    ),
    createAssertion(
      "Every parsed field remains linked to parser evidence.",
      listing.fields.every((field) => field.evidenceRecordIds.length > 0),
      listing.fields.length,
      listing.fields.filter((field) => field.evidenceRecordIds.length > 0).length
    )
  ];

  for (const constraintId of scenario.expected.constraintIds ?? []) {
    assertions.push(
      createAssertion(
        `Platform constraint ${constraintId} remains modeled.`,
        Boolean(platformProfile?.constraints.some((constraint) => constraint.id === constraintId)),
        constraintId,
        platformProfile?.id ?? null
      )
    );
  }

  for (const errorCode of scenario.expected.importerErrorCodes ?? []) {
    assertions.push(
      createAssertion(
        `Importer validation still covers ${errorCode}.`,
        importerErrorCodes.has(errorCode),
        errorCode,
        importerErrorCodes.has(errorCode) ? errorCode : null
      )
    );
  }

  if (scenario.id === "duplicate-listing") {
    assertions.push(
      createAssertion(
        "Duplicate candidate detection still produces at least one review candidate.",
        listing.duplicateCandidates.length > 0,
        1,
        listing.duplicateCandidates.length
      )
    );
  }

  let project: BuildWorkspaceProject | undefined;
  let observedSolutionPath = normalized.possibleFutures[0]?.title ?? null;

  if (scenario.project) {
    project = createProject(scenario.project);
    const model = createBuildWorkspaceModel(project);
    const solutionReport = analyzeBuildSolution(model);
    observedSolutionPath = model.comparePreview.jetsSolution.title;

    for (const issueId of scenario.expected.validationIssueIds ?? []) {
      assertions.push(
        createAssertion(
          `Builder validation issue ${issueId} remains visible.`,
          model.evaluation.issues.some((issue) => issue.id === issueId),
          issueId,
          model.evaluation.issues.map((issue) => issue.id).join(", ") || null
        )
      );
    }

    for (const findingId of scenario.expected.whyThisWorksIds ?? []) {
      assertions.push(
        createAssertion(
          `Solution intelligence finding ${findingId} remains visible.`,
          solutionReport.whyThisWorks.some((finding) => finding.id === findingId),
          findingId,
          solutionReport.whyThisWorks.map((finding) => finding.id).join(", ") ||
            null
        )
      );
    }

    if (scenario.optimizationInput) {
      const optimization = optimizeBuildProject(project, scenario.optimizationInput);
      const acceptableSlots = scenario.expected.optimizationSuggestionSlots ?? [];

      if (acceptableSlots.length > 0) {
        assertions.push(
          createAssertion(
            "Optimization suggestions still touch an expected slot family.",
            optimization.suggestions.some((suggestion) =>
              acceptableSlots.includes(suggestion.slotId)
            ),
            acceptableSlots.join(", "),
            optimization.suggestions.map((suggestion) => suggestion.slotId).join(", ") ||
              null
          )
        );
      }

      assertions.push(
        createAssertion(
          "Optimization pipeline still runs through deterministic stages.",
          optimization.pipeline.includes("Compatibility Filter") &&
            optimization.pipeline.includes("Explainability"),
          "Compatibility Filter, Explainability",
          optimization.pipeline.join(", ")
        )
      );
    }
  }

  return {
    assertions,
    coverage: scenario.coverage,
    normalized,
    observed: {
      confidence: normalized.confidence.confidence,
      duplicateCandidateCount: listing.duplicateCandidates.length,
      platformId: normalized.hardware.platformDetection.detectedPlatformId,
      readiness: listing.recommendationPreview.recommendationReadiness,
      solutionPath: observedSolutionPath
    },
    passed: assertions.every((assertion) => assertion.passed),
    project,
    scenario
  };
}

function validatePlatformKnowledge(): PlatformKnowledgeValidationResult[] {
  return platformKnowledgeProfiles.map((profile) => {
    const evidence = getEvidenceSummaryForPlatform(profile.id);
    const quality = getKnowledgeQualityForPlatform(profile);
    const encyclopediaCoverage = validatePlatformEncyclopediaCoverage(
      profile.id,
      profile.name
    );
    const adapterCount = adapterIntelligenceProfiles.filter((adapter) =>
      adapter.recommendedPlatformIds.includes(profile.id)
    ).length;
    const encyclopediaIssues = encyclopediaCoverage.missing.map(
      (issue) => `Missing encyclopedia ${issue.toLowerCase()}`
    );
    const issues = [
      profile.constraints.length === 0 ? "Missing constraints" : null,
      profile.upgradeOpportunities.length === 0 ? "Missing upgrade opportunities" : null,
      profile.timeline.length === 0 ? "Missing platform timeline" : null,
      profile.knowledgeCards.length === 0 ? "Missing community knowledge cards" : null,
      adapterCount === 0 ? "No recommended adapter profile" : null,
      profile.potential.overall <= 0 ? "Missing platform potential score" : null,
      evidence.evidenceCount === 0 ? "No linked evidence records" : null,
      quality.overall < 45 ? "Knowledge quality score is low" : null,
      ...encyclopediaIssues
    ].filter((issue): issue is string => Boolean(issue));

    return {
      encyclopediaIssues,
      encyclopediaSectionCount: encyclopediaCoverage.sectionCount,
      evidenceCount: evidence.evidenceCount,
      issues,
      passed: issues.length === 0,
      platformId: profile.id,
      platformName: profile.name,
      qualityScore: quality.overall
    };
  });
}

function getCompatibilityFixtureFailures() {
  return getCompatibilityValidationResults()
    .filter((result) => !result.passed)
    .map((result) => result.name);
}

function validateStrategies() {
  return strategyValidationFixtures.map((fixture) => {
    const result = generateHardwareStrategies(fixture.input);
    const top = result.recommendations[0];
    const topThreeTypes = result.recommendations
      .slice(0, 3)
      .map((recommendation) => recommendation.type);
    const assertions = [
      createAssertion(
        "Expected top strategy remains deterministic.",
        top.type === fixture.expectedTopStrategy,
        fixture.expectedTopStrategy,
        top.type
      )
    ];

    if (fixture.expectedTopThree) {
      assertions.push(
        createAssertion(
          "Expected strategy family remains in the top three.",
          fixture.expectedTopThree.some((strategyType) =>
            topThreeTypes.includes(strategyType)
          ),
          fixture.expectedTopThree.join(", "),
          topThreeTypes.join(", ")
        )
      );
    }

    return {
      actualTopStrategy: top.type,
      assertions,
      expectedTopStrategy: fixture.expectedTopStrategy,
      fixtureId: fixture.id,
      passed: assertions.every((assertion) => assertion.passed),
      title: fixture.title
    };
  });
}

function validateActionPlans() {
  const model = createBuildWorkspaceModel(cloneProject(starterEngineeringWorkspaceProject));
  const playbooks = getPlaybooksForProject(model);
  const actionPlan = generateProjectActionPlan({
    model,
    playbooks,
    strategyId: "buy-used-workstation",
    strategyTitle: "Buy used workstation"
  });

  return [validateActionPlanFixture(actionPlan)];
}

export function runHardwareValidationSuite(): HardwareValidationSuiteResult {
  const importerErrorCodes = getExpectedImporterErrorCodes();
  const scenarioResults = hardwareValidationScenarios.map((scenario) =>
    validateScenario(scenario, importerErrorCodes)
  );
  const compatibilityFixtureFailures = getCompatibilityFixtureFailures();
  const actionPlanResults = validateActionPlans();
  const platformKnowledge = validatePlatformKnowledge();
  const playbookResults = validateHardwarePlaybooks();
  const strategyResults = validateStrategies();
  const coveredMarkers = createCoverageBuckets();

  for (const scenarioResult of scenarioResults) {
    addCoverage(coveredMarkers, scenarioResult.coverage);
  }

  for (const fixture of compatibilityValidationFixtures) {
    addCoverage(coveredMarkers, {
      compatibility: fixture.expected.map(
        (expected) => `compatibility:${expected.ruleId}`
      )
    });
  }

  addCoverage(coveredMarkers, {
    "action-plan": [
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message === "Action plan generates at least one task."
        )?.passed
      )
        ? ["action-plan:generated"]
        : []),
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message === "Action plan includes dependency chains."
        )?.passed
      )
        ? ["action-plan:dependencies"]
        : []),
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message ===
            "Tasks link back to evidence, playbooks, encyclopedia, or validation issues."
        )?.passed
      )
        ? ["action-plan:evidence-links"]
        : []),
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message === "Action plan exposes builder validation impact."
        )?.passed
      )
        ? ["action-plan:validation-impact"]
        : []),
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message === "Action plan exposes progress metrics."
        )?.passed
      )
        ? ["action-plan:progress-metrics"]
        : []),
      ...(actionPlanResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message === "Action plan supports the expected task statuses."
        )?.passed
      )
        ? ["action-plan:task-statuses"]
        : [])
    ],
    evidence: ["evidence:importer-validation-errors", "evidence:knowledge-quality"]
  });
  addCoverage(coveredMarkers, {
    platform: [
      ...platformKnowledge
        .filter((result) => result.encyclopediaIssues.length === 0)
        .map((result) => `platform-encyclopedia:${result.platformId}`),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia memory topology")
      )
        ? ["platform-encyclopedia:memory-topology"]
        : []),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia power topology")
      )
        ? ["platform-encyclopedia:power-topology"]
        : []),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia storage guidance")
      )
        ? ["platform-encyclopedia:storage-guidance"]
        : []),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia upgrade paths")
      )
        ? ["platform-encyclopedia:upgrade-paths"]
        : []),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia reliability data")
      )
        ? ["platform-encyclopedia:reliability"]
        : []),
      ...(platformKnowledge.every((result) =>
        !result.encyclopediaIssues.includes("Missing encyclopedia workload profile")
      )
        ? ["platform-encyclopedia:workload-profiles"]
        : [])
    ],
    playbook: [
      ...playbookResults
        .filter((result) => result.playbookCount > 0)
        .map((result) => `playbook:${result.platformId}`),
      ...(playbookResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message ===
            "Every playbook has all required playbook sections."
        )?.passed
      )
        ? ["playbook:required-sections"]
        : []),
      ...(playbookResults.every((result) =>
        result.assertions.find(
          (assertion) =>
            assertion.message ===
            "Playbook evidence IDs resolve to known evidence records."
        )?.passed
      )
        ? ["playbook:evidence-links"]
        : []),
      "playbook:strategy-signals",
      "playbook:project-progress"
    ]
  });
  addCoverage(coveredMarkers, {
    strategy: [
      ...strategyValidationFixtures.map((fixture) => `strategy:${fixture.id}`),
      "strategy:walk-away",
      "strategy:project-seed"
    ]
  });

  const inventory = getRuleInventory();
  const ruleCoverage = validationCoverageAreas.reduce((coverage, area) => {
    coverage[area] = getCoverageResult(coveredMarkers[area], inventory[area]);
    return coverage;
  }, {} as Record<ValidationCoverageArea, RuleCoverageResult>);
  const passedScenarios = scenarioResults.filter((result) => result.passed).length;
  const failedScenarios = scenarioResults.length - passedScenarios;
  const actionPlanFailures = actionPlanResults.filter((result) => !result.passed).length;
  const playbookFailures = playbookResults.filter((result) => !result.passed).length;
  const strategyFailures = strategyResults.filter((result) => !result.passed).length;
  const platformWarnings = platformKnowledge.filter((result) => !result.passed).length;
  const passed =
    failedScenarios === 0 &&
    actionPlanFailures === 0 &&
    compatibilityFixtureFailures.length === 0 &&
    playbookFailures === 0 &&
    strategyFailures === 0;

  return {
    compatibilityFixtureFailures,
    actionPlanResults,
    generatedAt: validationGeneratedAt,
    overallPassRate: Math.round((passedScenarios / scenarioResults.length) * 100),
    passed,
    platformKnowledge,
    playbookResults,
    ruleCoverage,
    scenarioResults,
    strategyResults,
    summary: {
      actionPlanFailures,
      failedScenarios,
      passedScenarios,
      platformWarnings,
      playbookFailures,
      scenarios: scenarioResults.length,
      strategyFailures
    }
  };
}

function statusLabel(passed: boolean) {
  return passed ? "PASS" : "FAIL";
}

function renderAssertion(assertion: ValidationAssertion) {
  return `| ${statusLabel(assertion.passed)} | ${assertion.message} | ${assertion.expected ?? ""} | ${assertion.actual ?? ""} |`;
}

export function renderValidationReportMarkdown(
  suite: HardwareValidationSuiteResult
) {
  const scenarioRows = suite.scenarioResults
    .map(
      (result) =>
        `| ${statusLabel(result.passed)} | ${result.scenario.title} | ${result.observed.platformId ?? "unknown"} | ${result.observed.readiness} | ${result.observed.confidence} |`
    )
    .join("\n");
  const coverageSections = validationCoverageAreas
    .map((area) => {
      const coverage = suite.ruleCoverage[area];
      const uncovered =
        coverage.uncovered.length > 0
          ? coverage.uncovered.map((marker) => `- ${marker}`).join("\n")
          : "- None";

      return `### ${area}\n\nCoverage: ${coverage.covered.length}/${coverage.total} (${coverage.percent}%)\n\nUncovered:\n${uncovered}`;
    })
    .join("\n\n");
  const platformRows = suite.platformKnowledge
    .map(
      (result) =>
        `| ${statusLabel(result.passed)} | ${result.platformName} | ${result.qualityScore} | ${result.evidenceCount} | ${result.encyclopediaSectionCount} | ${result.issues.join("; ") || "None"} |`
    )
    .join("\n");
  const playbookRows = suite.playbookResults
    .map(
      (result) =>
        `| ${statusLabel(result.passed)} | ${result.platformName} | ${result.playbookCount} | ${result.assertions.filter((assertion) => !assertion.passed).map((assertion) => assertion.message).join("; ") || "None"} |`
    )
    .join("\n");
  const actionPlanRows = suite.actionPlanResults
    .map(
      (result) =>
        `| ${statusLabel(result.passed)} | ${result.title} | ${result.taskCount} | ${result.assertions.filter((assertion) => !assertion.passed).map((assertion) => assertion.message).join("; ") || "None"} |`
    )
    .join("\n");
  const compatibilityFailures =
    suite.compatibilityFixtureFailures.length > 0
      ? suite.compatibilityFixtureFailures
          .map((failure) => `- ${failure}`)
          .join("\n")
      : "No compatibility fixture failures.";
  const failureSections = suite.scenarioResults
    .filter((result) => !result.passed)
    .map(
      (result) => `### ${result.scenario.title}\n\n| Status | Assertion | Expected | Actual |\n| --- | --- | --- | --- |\n${result.assertions.map(renderAssertion).join("\n")}`
    )
    .join("\n\n");

  return `# JETS Hardware Knowledge Validation Report

Generated: ${suite.generatedAt}

Overall: ${statusLabel(suite.passed)}

- Scenario pass rate: ${suite.overallPassRate}%
- Passed scenarios: ${suite.summary.passedScenarios}
- Failed scenarios: ${suite.summary.failedScenarios}
- Action plan fixture failures: ${suite.summary.actionPlanFailures}
- Playbook fixture failures: ${suite.summary.playbookFailures}
- Strategy fixture failures: ${suite.summary.strategyFailures}
- Platform knowledge warnings: ${suite.summary.platformWarnings}
- Compatibility fixture failures: ${suite.compatibilityFixtureFailures.length}

## Scenario Results

| Status | Scenario | Platform | Readiness | Confidence |
| --- | --- | --- | --- | --- |
${scenarioRows}

## Rule Coverage

${coverageSections}

## Action Plan Validation

| Status | Fixture | Tasks | Issues |
| --- | --- | ---: | --- |
${actionPlanRows}

## Platform Knowledge Validation

| Status | Platform | Knowledge quality | Evidence records | Encyclopedia sections | Issues |
| --- | --- | ---: | ---: | ---: | --- |
${platformRows}

## Playbook Validation

| Status | Platform | Playbooks | Issues |
| --- | --- | ---: | --- |
${playbookRows}

## Strategy Validation

| Status | Fixture | Expected top strategy | Actual top strategy |
| --- | --- | --- | --- |
${suite.strategyResults
  .map(
    (result) =>
      `| ${statusLabel(result.passed)} | ${result.title} | ${result.expectedTopStrategy} | ${result.actualTopStrategy} |`
  )
  .join("\n")}

## Compatibility Fixture Failures

${compatibilityFailures}

## Scenario Failure Details

${failureSections || "No scenario failures."}
`;
}

function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderValidationReportHtml(suite: HardwareValidationSuiteResult) {
  const rows = suite.scenarioResults
    .map(
      (result) =>
        `<tr><td>${statusLabel(result.passed)}</td><td>${escapeHtml(result.scenario.title)}</td><td>${escapeHtml(result.observed.platformId ?? "unknown")}</td><td>${escapeHtml(result.observed.readiness)}</td><td>${escapeHtml(result.observed.confidence)}</td></tr>`
    )
    .join("");
  const strategyRows = suite.strategyResults
    .map(
      (result) =>
        `<tr><td>${statusLabel(result.passed)}</td><td>${escapeHtml(result.title)}</td><td>${escapeHtml(result.expectedTopStrategy)}</td><td>${escapeHtml(result.actualTopStrategy)}</td></tr>`
    )
    .join("");
  const playbookRows = suite.playbookResults
    .map(
      (result) =>
        `<tr><td>${statusLabel(result.passed)}</td><td>${escapeHtml(result.platformName)}</td><td>${result.playbookCount}</td><td>${escapeHtml(result.assertions.filter((assertion) => !assertion.passed).map((assertion) => assertion.message).join(", ") || "None")}</td></tr>`
    )
    .join("");
  const actionPlanRows = suite.actionPlanResults
    .map(
      (result) =>
        `<tr><td>${statusLabel(result.passed)}</td><td>${escapeHtml(result.title)}</td><td>${result.taskCount}</td><td>${escapeHtml(result.assertions.filter((assertion) => !assertion.passed).map((assertion) => assertion.message).join(", ") || "None")}</td></tr>`
    )
    .join("");
  const coverage = validationCoverageAreas
    .map((area) => {
      const areaCoverage = suite.ruleCoverage[area];

      return `<section><h2>${escapeHtml(area)}</h2><p>${areaCoverage.covered.length}/${areaCoverage.total} covered (${areaCoverage.percent}%).</p><p><strong>Uncovered:</strong> ${escapeHtml(areaCoverage.uncovered.join(", ") || "None")}</p></section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>JETS Hardware Knowledge Validation Report</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.5; margin: 32px; color: #17202a; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0 28px; }
      th, td { border: 1px solid #d6dde6; padding: 8px 10px; text-align: left; }
      th { background: #f1f5f9; }
      section { margin: 24px 0; }
    </style>
  </head>
  <body>
    <h1>JETS Hardware Knowledge Validation Report</h1>
    <p><strong>Generated:</strong> ${escapeHtml(suite.generatedAt)}</p>
    <p><strong>Overall:</strong> ${statusLabel(suite.passed)}</p>
    <ul>
      <li>Scenario pass rate: ${suite.overallPassRate}%</li>
      <li>Passed scenarios: ${suite.summary.passedScenarios}</li>
      <li>Failed scenarios: ${suite.summary.failedScenarios}</li>
      <li>Action plan fixture failures: ${suite.summary.actionPlanFailures}</li>
      <li>Playbook fixture failures: ${suite.summary.playbookFailures}</li>
      <li>Strategy fixture failures: ${suite.summary.strategyFailures}</li>
      <li>Platform knowledge warnings: ${suite.summary.platformWarnings}</li>
    </ul>
    <h2>Scenario Results</h2>
    <table>
      <thead><tr><th>Status</th><th>Scenario</th><th>Platform</th><th>Readiness</th><th>Confidence</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h2>Action Plan Validation</h2>
    <table>
      <thead><tr><th>Status</th><th>Fixture</th><th>Tasks</th><th>Issues</th></tr></thead>
      <tbody>${actionPlanRows}</tbody>
    </table>
    <h2>Strategy Validation</h2>
    <table>
      <thead><tr><th>Status</th><th>Fixture</th><th>Expected top strategy</th><th>Actual top strategy</th></tr></thead>
      <tbody>${strategyRows}</tbody>
    </table>
    <h2>Playbook Validation</h2>
    <table>
      <thead><tr><th>Status</th><th>Platform</th><th>Playbooks</th><th>Issues</th></tr></thead>
      <tbody>${playbookRows}</tbody>
    </table>
    <h2>Rule Coverage</h2>
    ${coverage}
  </body>
</html>
`;
}
