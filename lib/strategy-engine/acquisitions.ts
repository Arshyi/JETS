import type { AcquisitionRecord } from "@/types/acquisition";
import type { BuildGeneratorCurrency } from "@/types/build-generator";
import type { StrategyAcquisitionInput } from "@/types/strategy";

function normalizeCurrency(value: string): BuildGeneratorCurrency {
  if (value === "USD" || value === "AED" || value === "CAD" || value === "GBP") {
    return value;
  }

  return "USD";
}

function normalizeConfidence(value: AcquisitionRecord["snapshot"]["confidence"]) {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "medium";
}

export function acquisitionRecordToStrategyInput(
  record: AcquisitionRecord
): StrategyAcquisitionInput {
  return {
    acquisitionId: record.id,
    condition: record.draft.condition,
    confidence: normalizeConfidence(record.snapshot.confidence),
    currency: normalizeCurrency(record.draft.currency),
    detectedPlatformId: null,
    detectedPlatformName: record.snapshot.detectedPlatformName,
    priceAmount: record.snapshot.priceAmount,
    readiness: record.snapshot.readiness,
    recommendationPreviewScore: record.snapshot.recommendationPreviewScore,
    status: record.status,
    title: record.snapshot.title
  };
}

export function acquisitionRecordsToStrategyInputs(
  records: AcquisitionRecord[],
  limit = 5
) {
  return records.slice(0, limit).map(acquisitionRecordToStrategyInput);
}
