import {
  decisionAuditEventLabels,
  decisionAuditSubjectLabels
} from "@/types/decision-audit";
import type {
  DecisionAuditEventType,
  DecisionAuditSubjectType
} from "@/types/decision-audit";

export function getDecisionAuditEventLabel(eventType: string) {
  return (
    decisionAuditEventLabels[eventType as DecisionAuditEventType] ??
    eventType.replaceAll("_", " ")
  );
}

export function getDecisionAuditSubjectLabel(subjectType: string) {
  return (
    decisionAuditSubjectLabels[subjectType as DecisionAuditSubjectType] ??
    subjectType.replaceAll("_", " ")
  );
}

export function formatAuditTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
