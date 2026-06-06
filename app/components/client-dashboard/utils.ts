import type { ClientJob, ClientJobPrimaryAction, JobStatus } from "./types";

export { formatNaira, formatRelativeDate } from "../artisan-dashboard/utils";

export function isClientActiveJob(job: ClientJob): boolean {
  return ["funds_secured", "in_progress", "disputed"].includes(job.status);
}

export function isClientPendingTab(job: ClientJob): boolean {
  return (
    job.status === "awaiting_funding" ||
    job.status === "invitation_pending" ||
    job.status === "proof_submitted" ||
    (job.releaseRequestAmount ?? 0) > 0
  );
}

export function isClientHistoryJob(job: ClientJob): boolean {
  return ["released", "cancelled", "declined", "invitation_expired"].includes(
    job.status,
  );
}

export function canMessageArtisan(job: ClientJob): boolean {
  return !["declined", "cancelled", "invitation_expired", "released"].includes(
    job.status,
  );
}

export const CLIENT_JOB_STATUS_META: Record<
  JobStatus,
  {
    label: string;
    tone: "secure" | "progress" | "warning" | "success" | "muted" | "danger";
    clientHint?: string;
  }
> = {
  invitation_pending: {
    label: "Invite Sent",
    tone: "warning",
    clientHint: "Waiting for the artisan to accept your invite.",
  },
  invitation_expired: {
    label: "Invite Expired",
    tone: "muted",
    clientHint: "The artisan did not respond in time. Send a new invite.",
  },
  awaiting_funding: {
    label: "Awaiting Your Payment",
    tone: "warning",
    clientHint: "Review the agreement and fund escrow to secure this job.",
  },
  funds_secured: {
    label: "Funds Secured",
    tone: "secure",
    clientHint: "Your payment is held safely until work is approved.",
  },
  in_progress: {
    label: "Work In Progress",
    tone: "progress",
    clientHint: "The artisan is working on your job.",
  },
  proof_submitted: {
    label: "Proof To Review",
    tone: "warning",
    clientHint: "Review proof of work and approve or open a dispute.",
  },
  released: {
    label: "Completed",
    tone: "success",
    clientHint: "Funds were released to the artisan.",
  },
  disputed: {
    label: "In Dispute",
    tone: "danger",
    clientHint: "Amana is reviewing evidence from both sides.",
  },
  cancelled: { label: "Cancelled", tone: "muted" },
  declined: { label: "Declined", tone: "muted", clientHint: "The artisan declined your invite." },
};

export function getClientJobPrimaryAction(job: ClientJob): {
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  hint?: string;
  action?: ClientJobPrimaryAction;
} | null {
  if ((job.releaseRequestAmount ?? 0) > 0 && job.status !== "disputed") {
    return {
      label: "Approve Release",
      variant: "primary",
      action: "approve_release",
      hint: `${job.artisanName} requested release of secured funds.`,
    };
  }

  switch (job.status) {
    case "invitation_pending":
      return {
        label: "Waiting for Artisan",
        variant: "ghost",
        disabled: true,
        hint: CLIENT_JOB_STATUS_META.invitation_pending.clientHint,
        action: "cancel_invite",
      };
    case "invitation_expired":
      return { label: "Resend Invite", variant: "primary", action: "resend_invite" };
    case "awaiting_funding":
      return job.sentByArtisan
        ? { label: "Review & Fund", variant: "primary", action: "review_agreement" }
        : { label: "Fund Escrow", variant: "primary", action: "fund_escrow" };
    case "funds_secured":
      return {
        label: "Work Not Started",
        variant: "ghost",
        disabled: true,
        hint: "Waiting for the artisan to begin work.",
      };
    case "in_progress":
      return {
        label: "Awaiting Proof",
        variant: "ghost",
        disabled: true,
        hint: "The artisan will upload proof when work is done.",
      };
    case "proof_submitted":
      return { label: "Review Proof", variant: "primary", action: "approve_proof" };
    case "disputed":
      return { label: "View Dispute", variant: "danger", action: "view_dispute" };
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

export function getJobsAwaitingFunding(jobs: ClientJob[]): ClientJob[] {
  return jobs.filter((job) => job.status === "awaiting_funding");
}
