import { buildWorkspaceSlotDefinitions } from "@/data/solution-builder";
import type {
  AcquisitionAnalysis,
  AcquisitionCorrectionFieldId,
  AcquisitionHandoffClassificationId,
  AcquisitionHandoffEvidenceLink,
  AcquisitionHandoffPlan,
  AcquisitionHandoffSlotMapping,
  AcquisitionRecord
} from "@/types/acquisition";
import type { ComponentCategory, ComponentInventoryItem } from "@/types/component-inventory";
import type { HardwareUseCase } from "@/types/hardware";
import type { BuildSlotId } from "@/types/solution-builder";

const classificationLabels: Record<AcquisitionHandoffClassificationId, string> = {
  "adapter-path": "Adapter path",
  "base-system": "Base system",
  "component": "Component",
  "full-system": "Full system",
  "parts-donor": "Parts donor",
  "unknown-review-later": "Unknown / review later"
};

const classificationDescriptions: Record<AcquisitionHandoffClassificationId, string> = {
  "adapter-path": "A specialty adapter, dock, external power, or unusual solution path.",
  "base-system": "A chassis, workstation, laptop body, or platform that can become a project base.",
  "component": "A standalone part such as CPU, GPU, RAM, storage, PSU, cooler, or OS/license.",
  "full-system": "A listing with enough core hardware to seed multiple project slots.",
  "parts-donor": "A risky, broken, incomplete, or salvage listing that may still provide useful parts.",
  "unknown-review-later": "Not enough deterministic evidence to map confidently yet."
};

const slotCategoryById: Partial<Record<BuildSlotId, ComponentCategory>> = {
  "chassis": "chassis",
  "cpu": "cpu",
  "cpu-cooler": "cpu-cooler",
  "egpu-dock": "egpu-dock",
  "external-psu": "external-psu",
  "gpu": "gpu",
  "laptop-ram-dimm-adapter": "laptop-ram-dimm-adapter",
  "motherboard": "motherboard",
  "operating-system": "operating-system",
  "pcie-adapter": "pcie-adapter",
  "psu": "psu",
  "ram": "ram",
  "storage": "storage",
  "thunderbolt-adapter": "thunderbolt-adapter"
};

const fieldSlotMap: Array<{
  fieldId: AcquisitionCorrectionFieldId;
  slotId: BuildSlotId;
}> = [
  { fieldId: "cpu", slotId: "cpu" },
  { fieldId: "gpu", slotId: "gpu" },
  { fieldId: "ram", slotId: "ram" },
  { fieldId: "storage", slotId: "storage" }
];

function getSlotLabel(slotId: BuildSlotId) {
  return (
    buildWorkspaceSlotDefinitions.find((definition) => definition.id === slotId)
      ?.label ?? slotId
  );
}

function getListingText(record: AcquisitionRecord) {
  return [
    record.draft.title,
    record.draft.description,
    record.draft.sellerNotes,
    record.snapshot.detectedPlatformName ?? "",
    Object.values(record.draft.personalNotes).join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

function confidenceFromLevel(level: string | undefined) {
  if (level === "high") return 92;
  if (level === "medium") return 76;
  return 58;
}

function clampConfidence(value: number) {
  return Math.max(40, Math.min(98, Math.round(value)));
}

function getEffectiveField(
  analysis: AcquisitionAnalysis | null,
  fieldId: AcquisitionCorrectionFieldId
) {
  return analysis?.effectiveFields.find((field) => field.fieldId === fieldId);
}

function getEffectiveValue(
  analysis: AcquisitionAnalysis | null,
  fieldId: AcquisitionCorrectionFieldId
) {
  const field = getEffectiveField(analysis, fieldId);

  return field?.correctedValue ?? field?.value ?? null;
}

function getClassification(
  record: AcquisitionRecord,
  analysis: AcquisitionAnalysis | null
): AcquisitionHandoffClassificationId {
  const text = getListingText(record);
  const detectedCount = ["cpu", "gpu", "ram", "storage", "platform"].filter(
    (fieldId) =>
      fieldId === "platform"
        ? Boolean(record.snapshot.detectedPlatformName)
        : Boolean(getEffectiveValue(analysis, fieldId as AcquisitionCorrectionFieldId))
  ).length;

  if (record.draft.condition === "broken" || /for parts|broken|no power|salvage/.test(text)) {
    return "parts-donor";
  }

  if (/egpu|external gpu|thunderbolt|sodimm|so-dimm|adapter|riser|pcie adapter/.test(text)) {
    return "adapter-path";
  }

  if (detectedCount >= 4) {
    return "full-system";
  }

  if (record.snapshot.detectedPlatformName || /workstation|optiplex|thinkstation|precision|elite/.test(text)) {
    return "base-system";
  }

  if (detectedCount > 0) {
    return "component";
  }

  return "unknown-review-later";
}

function createMapping(input: {
  confidence: number;
  evidenceId: string;
  fieldId: AcquisitionHandoffSlotMapping["fieldId"];
  proposedLabel: string;
  reason: string;
  slotId: BuildSlotId;
  sourceText: string;
}): AcquisitionHandoffSlotMapping {
  return {
    componentCategory: slotCategoryById[input.slotId] ?? null,
    confidence: clampConfidence(input.confidence),
    evidenceId: input.evidenceId,
    fieldId: input.fieldId,
    proposedLabel: input.proposedLabel,
    reason: input.reason,
    slotId: input.slotId,
    slotLabel: getSlotLabel(input.slotId),
    sourceText: input.sourceText
  };
}

function addTextMapping(
  mappings: AcquisitionHandoffSlotMapping[],
  input: {
    confidence: number;
    evidenceId: string;
    fieldId: AcquisitionHandoffSlotMapping["fieldId"];
    proposedLabel: string;
    reason: string;
    slotId: BuildSlotId;
    sourceText: string;
  }
) {
  if (mappings.some((mapping) => mapping.slotId === input.slotId)) {
    return;
  }

  mappings.push(createMapping(input));
}

function createEvidenceLinks(
  acquisitionId: string,
  projectId: string,
  mappings: AcquisitionHandoffSlotMapping[]
): AcquisitionHandoffEvidenceLink[] {
  return mappings.map((mapping) => ({
    acquisitionId,
    confidence: mapping.confidence,
    evidenceId: mapping.evidenceId,
    fieldId: mapping.fieldId,
    projectId,
    slotId: mapping.slotId,
    sourceText: mapping.sourceText
  }));
}

export function getAcquisitionHandoffClassificationOptions() {
  return Object.entries(classificationLabels).map(([id, label]) => ({
    description: classificationDescriptions[id as AcquisitionHandoffClassificationId],
    id: id as AcquisitionHandoffClassificationId,
    label
  }));
}

export function getAcquisitionHandoffPlan(
  record: AcquisitionRecord,
  analysis: AcquisitionAnalysis | null,
  projectId = "preview"
): AcquisitionHandoffPlan {
  const classification = getClassification(record, analysis);
  const text = getListingText(record);
  const mappings: AcquisitionHandoffSlotMapping[] = [];
  const platformField = getEffectiveField(analysis, "platform");
  const platformLabel =
    record.snapshot.detectedPlatformName ??
    platformField?.correctedValue ??
    platformField?.value;

  if (
    platformLabel &&
    ["base-system", "full-system", "parts-donor"].includes(classification)
  ) {
    addTextMapping(mappings, {
      confidence: confidenceFromLevel(platformField?.confidence) + 2,
      evidenceId: `acquisition:${record.id}:platform:chassis`,
      fieldId: "platform",
      proposedLabel: platformLabel,
      reason: "Detected platform can seed the physical base system slot.",
      slotId: "chassis",
      sourceText: platformLabel
    });
    addTextMapping(mappings, {
      confidence: confidenceFromLevel(platformField?.confidence) - 4,
      evidenceId: `acquisition:${record.id}:platform:motherboard`,
      fieldId: "platform",
      proposedLabel: `${platformLabel} board/platform`,
      reason: "A detected OEM/workstation platform usually implies the motherboard family.",
      slotId: "motherboard",
      sourceText: platformLabel
    });
  }

  for (const pair of fieldSlotMap) {
    const field = getEffectiveField(analysis, pair.fieldId);
    const value = field?.correctedValue ?? field?.value;

    if (!value) {
      continue;
    }

    addTextMapping(mappings, {
      confidence: confidenceFromLevel(field?.confidence),
      evidenceId: `acquisition:${record.id}:field:${pair.fieldId}`,
      fieldId: pair.fieldId,
      proposedLabel: value,
      reason: `${field?.label ?? pair.fieldId} was parsed or corrected from the acquisition record.`,
      slotId: pair.slotId,
      sourceText: value
    });
  }

  if (/\b(psu|power supply|[0-9]{3,4}\s?w)\b/.test(text)) {
    addTextMapping(mappings, {
      confidence: 64,
      evidenceId: `acquisition:${record.id}:text:psu`,
      fieldId: "listing",
      proposedLabel: "Power solution mentioned in listing",
      reason: "Listing text mentions PSU, power supply, or wattage.",
      slotId: "psu",
      sourceText: record.draft.description
    });
  }

  if (/\b(cooler|heatsink|fan|thermal)\b/.test(text)) {
    addTextMapping(mappings, {
      confidence: 60,
      evidenceId: `acquisition:${record.id}:text:cooling`,
      fieldId: "cooling",
      proposedLabel: "Cooling hardware mentioned in listing",
      reason: "Listing text mentions cooling or airflow hardware.",
      slotId: "cpu-cooler",
      sourceText: record.draft.description
    });
  }

  if (/\b(windows|linux|ubuntu|license|os)\b/.test(text)) {
    addTextMapping(mappings, {
      confidence: 62,
      evidenceId: `acquisition:${record.id}:text:os`,
      fieldId: "os",
      proposedLabel: "Operating system/license mentioned in listing",
      reason: "Listing text mentions an operating system or license.",
      slotId: "operating-system",
      sourceText: record.draft.description
    });
  }

  if (/egpu|external gpu/.test(text)) {
    addTextMapping(mappings, {
      confidence: 82,
      evidenceId: `acquisition:${record.id}:adapter:egpu`,
      fieldId: "adapter",
      proposedLabel: "eGPU path from acquisition",
      reason: "Listing text indicates an external GPU solution path.",
      slotId: "egpu-dock",
      sourceText: record.draft.description
    });
  }

  if (/thunderbolt/.test(text)) {
    addTextMapping(mappings, {
      confidence: 78,
      evidenceId: `acquisition:${record.id}:adapter:thunderbolt`,
      fieldId: "adapter",
      proposedLabel: "Thunderbolt adapter path",
      reason: "Listing text references Thunderbolt hardware.",
      slotId: "thunderbolt-adapter",
      sourceText: record.draft.description
    });
  }

  if (/sodimm|so-dimm|laptop ram/.test(text)) {
    addTextMapping(mappings, {
      confidence: 76,
      evidenceId: `acquisition:${record.id}:adapter:laptop-ram`,
      fieldId: "adapter",
      proposedLabel: "Laptop RAM adapter path",
      reason: "Listing text references laptop memory that may need an adapter path.",
      slotId: "laptop-ram-dimm-adapter",
      sourceText: record.draft.description
    });
  }

  if (/riser|pcie adapter|bifurcation/.test(text)) {
    addTextMapping(mappings, {
      confidence: 74,
      evidenceId: `acquisition:${record.id}:adapter:pcie`,
      fieldId: "adapter",
      proposedLabel: "PCIe adapter path",
      reason: "Listing text references PCIe adapter hardware.",
      slotId: "pcie-adapter",
      sourceText: record.draft.description
    });
  }

  if (/external psu|external power/.test(text)) {
    addTextMapping(mappings, {
      confidence: 72,
      evidenceId: `acquisition:${record.id}:adapter:external-psu`,
      fieldId: "adapter",
      proposedLabel: "External PSU path",
      reason: "Listing text references an external power path.",
      slotId: "external-psu",
      sourceText: record.draft.description
    });
  }

  return {
    classification,
    evidenceLinks: createEvidenceLinks(record.id, projectId, mappings),
    mappings,
    summary:
      mappings.length > 0
        ? `${classificationLabels[classification]} with ${mappings.length} proposed slot mapping${mappings.length === 1 ? "" : "s"}.`
        : "No confident slot mappings yet. Keep this acquisition linked as evidence or review it later."
  };
}

export function createComponentSnapshotFromMapping({
  classification,
  mapping,
  record
}: {
  classification: AcquisitionHandoffClassificationId;
  mapping: AcquisitionHandoffSlotMapping;
  record: AcquisitionRecord;
}): ComponentInventoryItem {
  return {
    category: mapping.componentCategory ?? "chassis",
    compatibleSlotIds: [mapping.slotId],
    condition: record.draft.condition,
    facts: {},
    id: `acquisition-${record.id}-${mapping.slotId}`,
    location: record.draft.location,
    price:
      mapping.slotId === "chassis" || classification === "component"
        ? record.snapshot.priceAmount ?? 0
        : 0,
    recommendedUseCases: ["general" as HardwareUseCase],
    riskNotes: [
      `Derived from acquisition ${record.id}.`,
      `Mapping confidence ${mapping.confidence}%.`,
      mapping.reason
    ],
    sourceListingId: record.id,
    summary: mapping.reason,
    tags: ["acquisition-derived", classification, mapping.fieldId],
    title: mapping.proposedLabel
  };
}

export function buildHandoffEvidenceLinksForProject(
  acquisitionId: string,
  projectId: string,
  mappings: AcquisitionHandoffSlotMapping[]
) {
  return createEvidenceLinks(acquisitionId, projectId, mappings);
}
