export const decisionAuditEventTypes = [
  "snapshot_created",
  "snapshot_renamed",
  "snapshot_favorited",
  "snapshot_unfavorited",
  "snapshot_status_changed",
  "snapshot_restored",
  "snapshot_deleted",
  "snapshot_note_updated",
  "build_saved",
  "build_favorited",
  "build_note_updated",
  "history_cleared"
] as const;

export const decisionAuditSubjectTypes = [
  "build_snapshot",
  "hardware_listing",
  "build_history"
] as const;

export type DecisionAuditEventType = (typeof decisionAuditEventTypes)[number];
export type DecisionAuditSubjectType = (typeof decisionAuditSubjectTypes)[number];

export const decisionAuditEventLabels: Record<DecisionAuditEventType, string> = {
  build_favorited: "Build favorited",
  build_note_updated: "Build note updated",
  build_saved: "Build saved",
  history_cleared: "History cleared",
  snapshot_created: "Snapshot created",
  snapshot_deleted: "Snapshot deleted",
  snapshot_favorited: "Snapshot favorited",
  snapshot_note_updated: "Snapshot note updated",
  snapshot_renamed: "Snapshot renamed",
  snapshot_restored: "Snapshot restored",
  snapshot_status_changed: "Snapshot status changed",
  snapshot_unfavorited: "Snapshot unfavorited"
};

export const decisionAuditSubjectLabels: Record<DecisionAuditSubjectType, string> = {
  build_history: "Build history",
  build_snapshot: "Build snapshot",
  hardware_listing: "Hardware listing"
};
