import {
  componentKnowledgeEntries,
  knowledgeExpansionRelationshipHints,
  platformKnowledgeExpansionFacts
} from "@/data/knowledge-expansion";
import { platformEncyclopediaEntries } from "@/data/platform-encyclopedia";
import { reasoningGraph } from "@/data/reasoning-graph";
import { platformKnowledgeProfiles } from "@/data/platform-knowledge";
import type { KnowledgeExpansionMetrics } from "@/types/knowledge-expansion";

export const knowledgeExpansionThresholds = {
  minimumEvidenceCoveragePercent: 55,
  minimumFactsPerPlatform: 18,
  minimumKnowledgeQualityScore: 62,
  minimumRelationshipsPerPlatform: 18,
  minimumVerificationPercent: 55
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

export function getKnowledgeExpansionMetrics(): KnowledgeExpansionMetrics {
  const platformFactCount = platformEncyclopediaEntries.reduce(
    (total, entry) => total + entry.facts.length,
    0
  );
  const componentFactCount = componentKnowledgeEntries.reduce(
    (total, entry) => total + entry.facts.length,
    0
  );
  const allFacts = [
    ...platformEncyclopediaEntries.flatMap((entry) => entry.facts),
    ...componentKnowledgeEntries.flatMap((entry) => entry.facts)
  ];
  const evidenceBackedFacts = allFacts.filter(
    (fact) => fact.evidenceIds.length > 0
  ).length;
  const verifiedFactCount = allFacts.filter(
    (fact) => fact.verification === "verified"
  ).length;
  const platformRelationshipCount = reasoningGraph.edges.filter(
    (edge) =>
      edge.from.startsWith("platform:") ||
      edge.to.startsWith("platform:") ||
      edge.from.startsWith("pcie-slot:")
  ).length;
  const supportedPlatformCount = platformKnowledgeProfiles.length;

  return {
    averageFactsPerPlatform: Math.round(
      platformFactCount / Math.max(1, supportedPlatformCount)
    ),
    averageRelationshipsPerPlatform: Math.round(
      platformRelationshipCount / Math.max(1, supportedPlatformCount)
    ),
    componentFactCount,
    componentKnowledgeEntries: componentKnowledgeEntries.length,
    evidenceBackedFacts,
    evidenceCoveragePercent: Math.round(
      (evidenceBackedFacts / Math.max(1, allFacts.length)) * 100
    ),
    graphEdgeCount: reasoningGraph.edges.length,
    graphNodeCount: reasoningGraph.nodes.length,
    knowledgeQualityScore: average(
      allFacts.map((fact) => fact.knowledgeQualityScore)
    ),
    platformFactCount,
    platformRelationshipCount,
    supportedPlatformCount,
    totalFactCount: allFacts.length,
    verifiedFactCount,
    verificationPercent: Math.round(
      (verifiedFactCount / Math.max(1, allFacts.length)) * 100
    )
  };
}

export function getKnowledgeExpansionValidationIssues(
  metrics: KnowledgeExpansionMetrics = getKnowledgeExpansionMetrics()
) {
  return [
    metrics.averageFactsPerPlatform <
    knowledgeExpansionThresholds.minimumFactsPerPlatform
      ? `Platform knowledge density below ${knowledgeExpansionThresholds.minimumFactsPerPlatform} facts per platform.`
      : null,
    metrics.averageRelationshipsPerPlatform <
    knowledgeExpansionThresholds.minimumRelationshipsPerPlatform
      ? `Relationship density below ${knowledgeExpansionThresholds.minimumRelationshipsPerPlatform} relationships per platform.`
      : null,
    metrics.evidenceCoveragePercent <
    knowledgeExpansionThresholds.minimumEvidenceCoveragePercent
      ? `Evidence coverage below ${knowledgeExpansionThresholds.minimumEvidenceCoveragePercent}%.`
      : null,
    metrics.verificationPercent <
    knowledgeExpansionThresholds.minimumVerificationPercent
      ? `Verification coverage below ${knowledgeExpansionThresholds.minimumVerificationPercent}%.`
      : null,
    metrics.knowledgeQualityScore <
    knowledgeExpansionThresholds.minimumKnowledgeQualityScore
      ? `Knowledge quality below ${knowledgeExpansionThresholds.minimumKnowledgeQualityScore}.`
      : null
  ].filter((issue): issue is string => Boolean(issue));
}

export function getKnowledgeExpansionInventorySummary() {
  return {
    componentEntryCount: componentKnowledgeEntries.length,
    relationshipHintCount: knowledgeExpansionRelationshipHints.length,
    templateFactCount: platformKnowledgeExpansionFacts.length
  };
}
