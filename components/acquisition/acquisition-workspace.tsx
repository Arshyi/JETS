"use client";

import {
  Archive,
  Check,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  GitCompare,
  Plus,
  Save,
  ShoppingBag,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import {
  acquisitionMarketplaceOptions,
  acquisitionStatusLabels,
  analyzeAcquisitionDraft,
  createAcquisitionSnapshot,
  defaultAcquisitionCorrections,
  defaultAcquisitionDraft,
  getAcquisitionGoalOptions,
  getDecisionStatusFromReadiness
} from "@/lib/acquisition/workflow";
import { cn } from "@/lib/utils";
import type {
  AcquisitionCorrection,
  AcquisitionCorrectionFieldId,
  AcquisitionDecisionStatus,
  AcquisitionDraft,
  AcquisitionMarketplaceId,
  AcquisitionRecord
} from "@/types/acquisition";
import { conditionLabels, hardwareConditions } from "@/types/hardware";

const storageKey = "jets-acquisition-records-v1";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30";

const textAreaClass = `${inputClass} min-h-28 resize-y`;

const workflowSteps = [
  "Paste listing",
  "Preview",
  "Normalize",
  "Evidence",
  "Platform Detection",
  "Listing Intelligence",
  "Recommendation Preview",
  "Create Project"
];

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `acq-${Date.now()}`;
}

function formatMoney(currency: AcquisitionDraft["currency"], value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  return `${currency} ${value.toLocaleString()}`;
}

function statusTone(status: AcquisitionDecisionStatus) {
  if (status === "ready" || status === "purchased") return "accent";
  if (status === "needs-review") return "warning";
  return "neutral";
}

function readinessTone(readiness: string) {
  if (readiness === "ready") return "accent";
  if (readiness === "not-ready") return "warning";
  return "neutral";
}

function fieldLabel(fieldId: AcquisitionCorrectionFieldId) {
  return {
    cpu: "CPU",
    gpu: "GPU",
    platform: "Platform",
    price: "Price",
    ram: "RAM",
    storage: "Storage"
  }[fieldId];
}

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-accent-strong dark:text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      ) : null}
    </div>
  );
}

function Field({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function loadRecords() {
  if (typeof window === "undefined") {
    return [] as AcquisitionRecord[];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw ? (JSON.parse(raw) as AcquisitionRecord[]) : [];
  } catch {
    return [];
  }
}

export function AcquisitionWorkspace() {
  const [draft, setDraft] = useState<AcquisitionDraft>(defaultAcquisitionDraft);
  const [corrections, setCorrections] = useState<AcquisitionCorrection[]>(
    defaultAcquisitionCorrections
  );
  const [records, setRecords] = useState<AcquisitionRecord[]>([]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastAction, setLastAction] = useState("Ready to analyze this listing.");
  const analysis = useMemo(
    () => analyzeAcquisitionDraft(draft, corrections),
    [draft, corrections]
  );
  const goalOptions = getAcquisitionGoalOptions();
  const compareRecords = records.filter((record) =>
    selectedCompareIds.includes(record.id)
  );
  const groupedRecords = {
    archived: records.filter((record) => record.status === "archived"),
    purchased: records.filter((record) => record.status === "purchased"),
    ready: records.filter((record) => record.status === "ready"),
    "needs-review": records.filter((record) => record.status === "needs-review"),
    "recently-captured": records.filter(
      (record) => record.status === "recently-captured"
    ),
    rejected: records.filter((record) => record.status === "rejected")
  } satisfies Record<AcquisitionDecisionStatus, AcquisitionRecord[]>;

  useEffect(() => {
    setRecords(loadRecords());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(records));
    }
  }, [isHydrated, records]);

  function updateDraft<K extends keyof AcquisitionDraft>(
    key: K,
    value: AcquisitionDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateNote<K extends keyof AcquisitionDraft["personalNotes"]>(
    key: K,
    value: AcquisitionDraft["personalNotes"][K]
  ) {
    setDraft((current) => ({
      ...current,
      personalNotes: {
        ...current.personalNotes,
        [key]: value
      }
    }));
  }

  function updateCorrection(
    fieldId: AcquisitionCorrectionFieldId,
    patch: Partial<AcquisitionCorrection>
  ) {
    setCorrections((current) =>
      current.map((correction) =>
        correction.fieldId === fieldId ? { ...correction, ...patch } : correction
      )
    );
  }

  function resetCapture() {
    setDraft(defaultAcquisitionDraft);
    setCorrections(defaultAcquisitionCorrections);
    setLastAction("Loaded the demo Precision 5820 acquisition.");
  }

  function saveRecord(status: AcquisitionDecisionStatus) {
    const now = new Date().toISOString();
    const record: AcquisitionRecord = {
      corrections,
      createdAt: now,
      draft,
      id: createRecordId(),
      snapshot: createAcquisitionSnapshot(draft, analysis),
      status,
      updatedAt: now
    };

    setRecords((current) => [record, ...current]);
    setLastAction(`${draft.title || "Listing"} saved as ${acquisitionStatusLabels[status]}.`);
  }

  function updateRecordStatus(
    recordId: string,
    status: AcquisitionDecisionStatus
  ) {
    const now = new Date().toISOString();

    setRecords((current) =>
      current.map((record) =>
        record.id === recordId ? { ...record, status, updatedAt: now } : record
      )
    );
  }

  function toggleCompare(recordId: string) {
    setSelectedCompareIds((current) => {
      if (current.includes(recordId)) {
        return current.filter((id) => id !== recordId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, recordId];
    });
  }

  return (
    <div className="grid gap-10">
      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="flex flex-wrap gap-2">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-subtle text-[11px]">
                {index + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-6">
          <div className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle
                eyebrow="Manual listing capture"
                title="Paste listing facts"
                description="Enter only what the listing actually says. JETS will normalize it, show missing information, and keep corrections separate as evidence."
              />
              <button
                type="button"
                onClick={resetCapture}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
              >
                Demo
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Marketplace">
                  <select
                    className={inputClass}
                    value={draft.marketplaceId}
                    onChange={(event) =>
                      updateDraft(
                        "marketplaceId",
                        event.target.value as AcquisitionMarketplaceId
                      )
                    }
                  >
                    {acquisitionMarketplaceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Listing URL">
                  <input
                    className={inputClass}
                    value={draft.listingUrl}
                    onChange={(event) =>
                      updateDraft("listingUrl", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <Field label="Title">
                <input
                  className={inputClass}
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="Dell Precision 5820 Xeon W 32GB P2000"
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={textAreaClass}
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                  placeholder="Paste the seller description exactly as shown."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Price">
                  <input
                    className={inputClass}
                    value={draft.priceText}
                    onChange={(event) =>
                      updateDraft("priceText", event.target.value)
                    }
                    placeholder="AED 1800"
                  />
                </Field>
                <Field label="Currency">
                  <select
                    className={inputClass}
                    value={draft.currency}
                    onChange={(event) =>
                      updateDraft("currency", event.target.value as "AED" | "USD")
                    }
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                  </select>
                </Field>
                <Field label="Condition">
                  <select
                    className={inputClass}
                    value={draft.condition}
                    onChange={(event) =>
                      updateDraft(
                        "condition",
                        event.target.value as AcquisitionDraft["condition"]
                      )
                    }
                  >
                    {hardwareConditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {conditionLabels[condition]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Images">
                  <input
                    className={inputClass}
                    min={0}
                    max={12}
                    type="number"
                    value={draft.imageCount}
                    onChange={(event) =>
                      updateDraft("imageCount", Number(event.target.value))
                    }
                  />
                </Field>
              </div>

              <Field label="Location">
                <input
                  className={inputClass}
                  value={draft.location}
                  onChange={(event) => updateDraft("location", event.target.value)}
                  placeholder="Dubai, UAE"
                />
              </Field>

              <Field label="Seller notes">
                <textarea
                  className={textAreaClass}
                  value={draft.sellerNotes}
                  onChange={(event) =>
                    updateDraft("sellerNotes", event.target.value)
                  }
                  placeholder="Seller claims, accessories, testing notes, pickup constraints."
                />
              </Field>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-panel p-5">
            <SectionTitle
              eyebrow="Personal notes"
              title="Why this listing matters"
              description="These notes stay with the acquisition decision and help compare purchase risk."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Why I saved this">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.whySaved}
                  onChange={(event) => updateNote("whySaved", event.target.value)}
                />
              </Field>
              <Field label="Negotiation ideas">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.negotiationIdeas}
                  onChange={(event) =>
                    updateNote("negotiationIdeas", event.target.value)
                  }
                />
              </Field>
              <Field label="Seller concerns">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.sellerConcerns}
                  onChange={(event) =>
                    updateNote("sellerConcerns", event.target.value)
                  }
                />
              </Field>
              <Field label="Meeting location">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.meetingLocation}
                  onChange={(event) =>
                    updateNote("meetingLocation", event.target.value)
                  }
                />
              </Field>
              <Field label="Repair notes">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.repairNotes}
                  onChange={(event) =>
                    updateNote("repairNotes", event.target.value)
                  }
                />
              </Field>
              <Field label="Missing accessories">
                <textarea
                  className={textAreaClass}
                  value={draft.personalNotes.missingAccessories}
                  onChange={(event) =>
                    updateNote("missingAccessories", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SectionTitle
                eyebrow="Import preview"
                title="Normalize before saving"
                description="This is the exact moment JETS uses the engine: raw listing facts become parsed fields, evidence, platform detection, and recommendation readiness."
              />
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={readinessTone(analysis.readiness)}>
                  {analysis.readiness}
                </StatusPill>
                <StatusPill>{analysis.confidence} confidence</StatusPill>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Raw listing
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  {draft.title || "Untitled listing"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {draft.description || "No description entered yet."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill>{draft.priceText || "No price"}</StatusPill>
                  <StatusPill>{draft.location || "No location"}</StatusPill>
                  <StatusPill>{conditionLabels[draft.condition]}</StatusPill>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array.from({ length: Math.min(draft.imageCount, 8) }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="grid aspect-video place-items-center rounded-lg border border-dashed border-border bg-subtle text-xs text-muted"
                      >
                        Image {index + 1}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Parsed fields
                </p>
                <div className="mt-3 grid gap-3">
                  {analysis.effectiveFields.map((field) => (
                    <div
                      key={field.fieldId}
                      className="grid gap-3 rounded-lg border border-border bg-panel p-3 sm:grid-cols-[0.75fr_1fr_0.75fr]"
                    >
                      <div>
                        <p className="text-sm font-semibold">{field.label}</p>
                        <p className="mt-1 text-xs text-muted">
                          {field.source}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">
                          Parsed: {field.value ?? "Unknown"}
                        </p>
                        {field.correctedValue ? (
                          <p className="mt-1 text-sm font-semibold text-accent-strong dark:text-accent">
                            Corrected: {field.correctedValue}
                          </p>
                        ) : null}
                      </div>
                      <StatusPill>{field.confidence}</StatusPill>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Platform detection
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone={analysis.detectedPlatformId ? "accent" : "warning"}>
                    {analysis.detectedPlatformName ?? "Unknown platform"}
                  </StatusPill>
                  <StatusPill>{analysis.confidence} confidence</StatusPill>
                  <StatusPill>
                    {formatMoney(draft.currency, analysis.priceAmount)}
                  </StatusPill>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Evidence
                </p>
                <div className="mt-3 grid gap-3">
                  {analysis.evidenceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg border border-border bg-panel p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{record.claim}</p>
                        <StatusPill>{record.confidence}</StatusPill>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {record.supportingText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Missing information
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.missingInformation.length > 0 ? (
                    analysis.missingInformation.map((item) => (
                      <StatusPill key={item} tone="warning">
                        {item}
                      </StatusPill>
                    ))
                  ) : (
                    <StatusPill tone="accent">No major missing fields</StatusPill>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-panel p-5">
            <SectionTitle
              eyebrow="User corrections"
              title="Correct before import"
              description="Corrections are treated as user-submitted evidence. They do not erase the parser output."
            />
            <div className="mt-6 grid gap-3">
              {corrections.map((correction) => (
                <div
                  key={correction.fieldId}
                  className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[0.35fr_1fr_auto]"
                >
                  <p className="text-sm font-semibold">
                    {fieldLabel(correction.fieldId)}
                  </p>
                  <input
                    className={inputClass}
                    disabled={correction.isUnknown}
                    value={correction.value}
                    onChange={(event) =>
                      updateCorrection(correction.fieldId, {
                        isUnknown: false,
                        value: event.target.value
                      })
                    }
                    placeholder={`Correct ${fieldLabel(correction.fieldId)}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateCorrection(correction.fieldId, {
                        isUnknown: !correction.isUnknown,
                        value: ""
                      })
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      correction.isUnknown
                        ? "border-warning bg-warning/10 text-warning"
                        : "border-border bg-panel text-muted hover:text-foreground"
                    )}
                  >
                    Unknown
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-panel p-5">
            <SectionTitle
              eyebrow="Recommendation preview"
              title="What JETS thinks so far"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Preview score
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {analysis.recommendationPreviewScore}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Readiness
                </p>
                <p className="mt-2 text-lg font-semibold">{analysis.readiness}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">
                  Evidence
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {analysis.evidenceRecords.length} records
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Readiness reasons</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                  {analysis.readinessReasons.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Upgrade opportunities</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                  {analysis.upgradeOpportunities.length > 0 ? (
                    analysis.upgradeOpportunities.map((opportunity) => (
                      <li key={opportunity.title}>
                        - {opportunity.title} (${opportunity.estimatedCostUsd})
                      </li>
                    ))
                  ) : (
                    <li>- Platform opportunity pending review.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {analysis.solutionClaims.map((claim) => (
                <div
                  key={claim.title}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{claim.title}</p>
                    <StatusPill>{claim.confidence}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{claim.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-lg border border-border bg-panel p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionTitle
          eyebrow="Listing decision"
          title="What should happen next?"
          description={lastAction}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <button
            type="button"
            onClick={() => saveRecord("recently-captured")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            <FileSearch className="h-4 w-4" aria-hidden="true" />
            Analyze only
          </button>
          <button
            type="button"
            onClick={() => saveRecord(getDecisionStatusFromReadiness(analysis.readiness))}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Listing
          </button>
          <button
            type="button"
            onClick={() => saveRecord("rejected")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Ignore Listing
          </button>
          <button
            type="button"
            onClick={() => saveRecord("archived")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
            Archive
          </button>
          <Link
            href={analysis.recommendedProjectGoals[0]?.href ?? "/solution-builder/projects/new"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-semibold text-accent-strong transition hover:bg-accent/20 dark:text-accent"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Project
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-border bg-panel p-5">
          <SectionTitle
            eyebrow="Project creation"
            title="Turn accepted hardware into a project"
            description="Acquisition does not replace Solution Builder. It feeds it."
          />
          <div className="mt-5 grid gap-3">
            {goalOptions.map((goal) => (
              <Link
                key={goal.id}
                href={goal.href}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-accent"
              >
                {goal.label}
                <ExternalLink className="h-4 w-4 text-muted" aria-hidden="true" />
              </Link>
            ))}
            <Link
              href="/solution-builder/projects"
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:border-accent"
            >
              Reuse Existing Project
              <ExternalLink className="h-4 w-4 text-muted" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-panel p-5">
          <SectionTitle
            eyebrow="Acquisition dashboard"
            title="Saved purchase candidates"
            description="Saved acquisitions are stored locally in this browser for now. Supabase persistence can be added after the workflow proves useful."
          />
          <div className="mt-5 grid gap-4">
            {records.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted">
                No saved acquisitions yet. Save the current listing to start a
                purchase comparison.
              </div>
            ) : (
              (Object.keys(groupedRecords) as AcquisitionDecisionStatus[]).map(
                (status) =>
                  groupedRecords[status].length > 0 ? (
                    <div key={status}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">
                          {acquisitionStatusLabels[status]}
                        </p>
                        <StatusPill tone={statusTone(status)}>
                          {groupedRecords[status].length}
                        </StatusPill>
                      </div>
                      <div className="grid gap-3">
                        {groupedRecords[status].map((record) => (
                          <div
                            key={record.id}
                            className="rounded-lg border border-border bg-background p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">
                                  {record.snapshot.title}
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                  {record.snapshot.detectedPlatformName ??
                                    "Unknown platform"}
                                </p>
                              </div>
                              <StatusPill tone={statusTone(record.status)}>
                                {acquisitionStatusLabels[record.status]}
                              </StatusPill>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <StatusPill>
                                {formatMoney(
                                  record.draft.currency,
                                  record.snapshot.priceAmount
                                )}
                              </StatusPill>
                              <StatusPill>
                                Score {record.snapshot.recommendationPreviewScore}
                              </StatusPill>
                              <StatusPill tone={readinessTone(record.snapshot.readiness)}>
                                {record.snapshot.readiness}
                              </StatusPill>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => toggleCompare(record.id)}
                                disabled={
                                  !selectedCompareIds.includes(record.id) &&
                                  selectedCompareIds.length >= 3
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
                                {selectedCompareIds.includes(record.id)
                                  ? "Remove compare"
                                  : "Compare"}
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRecordStatus(record.id, "purchased")}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
                              >
                                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                Purchased
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRecordStatus(record.id, "ready")}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                Ready
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRecordStatus(record.id, "rejected")}
                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                Rejected
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
              )
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-panel p-5">
        <SectionTitle
          eyebrow="Purchase comparison"
          title="Compare acquisitions, not builds"
          description="This side-by-side view compares purchase candidates before they become projects."
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {compareRecords.length > 0 ? (
            compareRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{record.snapshot.title}</h3>
                  <StatusPill tone={statusTone(record.status)}>
                    {acquisitionStatusLabels[record.status]}
                  </StatusPill>
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="text-muted">Price</dt>
                    <dd className="font-semibold">
                      {formatMoney(record.draft.currency, record.snapshot.priceAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Platform</dt>
                    <dd className="font-semibold">
                      {record.snapshot.detectedPlatformName ?? "Unknown"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Readiness</dt>
                    <dd className="font-semibold">{record.snapshot.readiness}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Missing</dt>
                    <dd className="font-semibold">
                      {record.snapshot.missingInformation.length > 0
                        ? record.snapshot.missingInformation.join(", ")
                        : "No major missing fields"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Personal note</dt>
                    <dd className="font-semibold">
                      {record.draft.personalNotes.whySaved || "No note"}
                    </dd>
                  </div>
                </dl>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background p-6 text-sm text-muted lg:col-span-3">
              Select up to three saved acquisitions from the dashboard to compare
              purchase candidates.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-1 h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Future browser-extension hook</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              The extension does not need its own intelligence. It should package
              the current page&apos;s title, description, price, URL, and source,
              then hand that payload to this same acquisition workflow.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
