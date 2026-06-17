import type { ClientProject, ClientJobPrimaryAction, JobStatus } from "./types";
import { LIFECYCLE_STAGE_LABELS } from "./mock-data";

export { formatNaira, formatRelativeDate } from "../artisan-dashboard/utils";

export function isClientActiveJob(project: ClientProject): boolean {
  return ["funds_secured", "in_progress", "disputed"].includes(project.status);
}

export function isClientPendingTab(project: ClientProject): boolean {
  return (
    project.status === "awaiting_funding" ||
    project.status === "invitation_pending" ||
    project.status === "proof_submitted" ||
    (project.releaseRequestAmount ?? 0) > 0 ||
    project.lifecycleStage === "contractor_bidding" ||
    project.lifecycleStage === "architect_selection"
  );
}

export function isClientHistoryJob(project: ClientProject): boolean {
  return ["released", "cancelled", "declined", "invitation_expired"].includes(
    project.status,
  );
}

export function canMessageProfessional(project: ClientProject): boolean {
  return !["declined", "cancelled", "invitation_expired", "released"].includes(
    project.status,
  );
}

/** @deprecated use canMessageProfessional */
export const canMessageArtisan = canMessageProfessional;

export const CLIENT_JOB_STATUS_META: Record<
  JobStatus,
  {
    label: string;
    tone: "secure" | "progress" | "warning" | "success" | "muted" | "danger";
    clientHint?: string;
  }
> = {
  invitation_pending: {
    label: "Setup In Progress",
    tone: "warning",
    clientHint: "Complete architect selection to move forward.",
  },
  invitation_expired: {
    label: "Expired",
    tone: "muted",
    clientHint: "Restart the project setup flow.",
  },
  awaiting_funding: {
    label: "Vault Activation Needed",
    tone: "warning",
    clientHint: "Fund the project vault to secure construction payments.",
  },
  funds_secured: {
    label: "Vault Protected",
    tone: "secure",
    clientHint: "Your project funds are held safely in the vault.",
  },
  in_progress: {
    label: "Construction Active",
    tone: "progress",
    clientHint: "Your contractor is executing the build.",
  },
  proof_submitted: {
    label: "Inspection Review",
    tone: "warning",
    clientHint: "Review inspector report and approve milestone release.",
  },
  released: {
    label: "Completed",
    tone: "success",
    clientHint: "Project milestone funds were released.",
  },
  disputed: {
    label: "Concern Raised",
    tone: "danger",
    clientHint: "Amana is reviewing evidence from all parties.",
  },
  cancelled: { label: "Cancelled", tone: "muted" },
  declined: { label: "Declined", tone: "muted" },
};

export function getProjectStageLabel(project: ClientProject): string {
  if (project.lifecycleStage === "design" && project.designStage) {
    return LIFECYCLE_STAGE_LABELS.design;
  }
  return LIFECYCLE_STAGE_LABELS[project.lifecycleStage] ?? project.lifecycleStage;
}

export function getResponsibleParty(project: ClientProject): string {
  switch (project.lifecycleStage) {
    case "vision":
    case "architect_selection":
      return project.architectName ?? "Select an architect";
    case "design":
      return project.architectName ?? "Architect";
    case "contractor_bidding":
      return "Awaiting contractor selection";
    case "vault_setup":
      return project.contractorName ?? "Contractor";
    case "construction":
      return project.contractorName ?? project.artisanName;
    default:
      return project.contractorName ?? project.architectName ?? project.artisanName;
  }
}

export function getClientJobPrimaryAction(project: ClientProject): {
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  hint?: string;
  action?: ClientJobPrimaryAction;
} | null {
  if ((project.releaseRequestAmount ?? 0) > 0 && project.status !== "disputed") {
    return {
      label: "Approve Release",
      variant: "primary",
      action: "approve_release",
      hint: "Inspector verified this milestone. Review evidence before releasing funds.",
    };
  }

  if (project.lifecycleStage === "contractor_bidding") {
    return {
      label: "Compare Proposals",
      variant: "primary",
      action: "review_proposals",
      hint: "Review contractor bids and select your builder.",
    };
  }

  if (project.lifecycleStage === "architect_selection") {
    return {
      label: "Browse Architects",
      variant: "primary",
      action: "view_architect_proposal",
      hint: "Find a verified architect for your project.",
    };
  }

  switch (project.status) {
    case "invitation_pending":
      return {
        label: "Setup In Progress",
        variant: "ghost",
        disabled: true,
        hint: CLIENT_JOB_STATUS_META.invitation_pending.clientHint,
      };
    case "invitation_expired":
      return { label: "Restart Project", variant: "primary", action: "resend_invite" };
    case "awaiting_funding":
      return project.sentByArtisan
        ? { label: "Activate Vault", variant: "primary", action: "review_agreement" }
        : { label: "Fund Vault", variant: "primary", action: "fund_escrow" };
    case "funds_secured":
      return {
        label: "Vault Active",
        variant: "ghost",
        disabled: true,
        hint: "Funds are protected. Work proceeds per milestone plan.",
      };
    case "in_progress":
      return {
        label: "View Milestones",
        variant: "secondary",
        action: "review_milestone",
        hint: "Track construction milestones and inspections.",
      };
    case "proof_submitted":
      return { label: "Review Inspection", variant: "primary", action: "approve_proof" };
    case "disputed":
      return { label: "View Concern", variant: "danger", action: "view_dispute" };
    case "released":
      return { label: "View Receipt", variant: "secondary", action: "view_receipt" };
    default:
      return null;
  }
}

export function calculateClientTotalDue(amount: number, protectionFee?: number): number {
  const fee = protectionFee ?? Math.round(amount * 0.05);
  return amount + fee;
}

export function getJobsAwaitingFunding(projects: ClientProject[]): ClientProject[] {
  return projects.filter((p) => p.status === "awaiting_funding");
}

export function formatBuildingType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
