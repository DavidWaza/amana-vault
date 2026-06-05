import type { ArtisanJob, JobPrimaryAction, JobStatus } from "./types";

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function isInvitation(job: ArtisanJob): boolean {
  return (
    job.status === "invitation_pending" || job.status === "invitation_expired"
  );
}

export function canMessageClient(job: ArtisanJob): boolean {
  return !["declined", "cancelled", "invitation_expired", "released"].includes(
    job.status,
  );
}

export function isActiveJob(job: ArtisanJob): boolean {
  return [
    "awaiting_funding",
    "funds_secured",
    "in_progress",
    "proof_submitted",
    "disputed",
  ].includes(job.status);
}

export function isHistoryJob(job: ArtisanJob): boolean {
  return ["released", "cancelled", "declined", "invitation_expired"].includes(
    job.status,
  );
}

export const JOB_STATUS_META: Record<
  JobStatus,
  { label: string; tone: "secure" | "progress" | "warning" | "success" | "muted" | "danger" }
> = {
  invitation_pending: { label: "New Invite", tone: "warning" },
  invitation_expired: { label: "Invite Expired", tone: "muted" },
  awaiting_funding: { label: "Awaiting Funding", tone: "muted" },
  funds_secured: { label: "Funds Secured", tone: "secure" },
  in_progress: { label: "In Progress", tone: "progress" },
  proof_submitted: { label: "Awaiting Approval", tone: "warning" },
  released: { label: "Paid Out", tone: "success" },
  disputed: { label: "In Dispute", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "muted" },
  declined: { label: "Declined", tone: "muted" },
};

export function getJobPrimaryAction(job: ArtisanJob): {
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  hint?: string;
  action?: JobPrimaryAction;
} | null {
  switch (job.status) {
    case "invitation_pending":
      return { label: "Review Invite", variant: "primary", action: "review_invite" };
    case "invitation_expired":
      return {
        label: "Invite Expired",
        variant: "ghost",
        disabled: true,
        hint: "Ask the client to send a new invite.",
      };
    case "awaiting_funding":
      return {
        label: "Waiting for Client",
        variant: "ghost",
        disabled: true,
        hint: "Funds are not secured yet. Do not start work.",
      };
    case "funds_secured":
      return { label: "Start Work", variant: "primary", action: "start_work" };
    case "in_progress":
      return { label: "Upload Proof", variant: "primary", action: "upload_proof" };
    case "proof_submitted":
      return {
        label: "Awaiting Client",
        variant: "ghost",
        disabled: true,
        hint: "Client is reviewing your proof of work.",
      };
    case "disputed":
      return { label: "View Dispute", variant: "danger", action: "view_dispute" };
    case "released":
      return { label: "View Receipt", variant: "secondary", action: "view_receipt" };
    default:
      return null;
  }
}
