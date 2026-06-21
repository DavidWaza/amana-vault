"use client";

import {
  MapPin,
  Calendar,
  ShieldCheck,
  Warning,
  Clock,
  User,
  ChatsCircle,
  Receipt,
  Scales,
} from "phosphor-react";
import type { ArtisanJob, JobPrimaryAction } from "./types";
import {
  formatNaira,
  formatRelativeDate,
  canMessageClient,
  getJobPrimaryAction,
  JOB_STATUS_META,
} from "./utils";
import {
  adashBtn,
  adashBtnDanger,
  adashBtnGhost,
  adashBtnPrimary,
  adashBtnSecondary,
} from "./ui";

const BADGE_BASE =
  "shrink-0 px-[0.7rem] py-[0.4rem] rounded-full text-[0.72rem] font-extrabold tracking-[0.04em] uppercase";
const BADGE_TONE: Record<string, string> = {
  secure: "bg-soft text-green2",
  progress: "bg-[#eff6ff] text-[#1d4ed8]",
  warning: "bg-gold-soft text-[#b45309]",
  success: "bg-soft text-green2",
  danger: "bg-[#fff5f5] text-[#c53030]",
  muted: "bg-bg2 text-muted",
};
const NOTICE_BASE =
  "flex items-start gap-2 m-0 mb-[0.85rem] px-[0.9rem] py-3 rounded-[14px] text-[0.85rem] leading-[1.5]";
const NOTICE_TONE = {
  secure: "bg-soft text-green",
  warning: "bg-gold-soft text-[#92400e]",
  danger: "bg-[#fff5f5] text-[#c53030]",
};
const BTN_VARIANT: Record<string, string> = {
  primary: adashBtnPrimary,
  secondary: adashBtnSecondary,
  danger: adashBtnDanger,
  ghost: adashBtnGhost,
};

type ArtisanJobCardProps = {
  job: ArtisanJob;
  canAcceptJobs: boolean;
  onPrimaryAction?: (job: ArtisanJob, action: JobPrimaryAction) => void;
  onDeclineInvite?: (jobId: string) => void;
  onMessageClient?: (job: ArtisanJob) => void;
  onCreateInvoice?: (job: ArtisanJob) => void;
  onRaiseDispute?: (job: ArtisanJob) => void;
};

const DISPUTABLE_STATUSES = ["funds_secured", "in_progress", "proof_submitted"];

export default function ArtisanJobCard({
  job,
  canAcceptJobs,
  onPrimaryAction,
  onDeclineInvite,
  onMessageClient,
  onCreateInvoice,
  onRaiseDispute,
}: ArtisanJobCardProps) {
  const status = JOB_STATUS_META[job.status];
  const action = getJobPrimaryAction(job);
  const isOverdue =
    job.status === "in_progress" &&
    new Date(job.deadline) < new Date();
  const canRaiseDispute =
    onRaiseDispute != null && DISPUTABLE_STATUSES.includes(job.status);

  const handlePrimaryClick = () => {
    if (!action?.action || action.disabled || !onPrimaryAction) return;
    onPrimaryAction(job, action.action);
  };

  return (
    <article
      id={job.id}
      className={`p-5 rounded-[22px] bg-white border border-solid shadow-brand-sm transition-[border-color,box-shadow] duration-300 hover:border-green2 hover:shadow-brand-md ${
        job.priority === "urgent" ? "border-[rgba(244,163,0,0.45)]" : "border-line"
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-[0.85rem]">
        <div>
          <h3 className="mt-0 mb-[0.35rem] text-[1.05rem] text-green">{job.title}</h3>
          <p className="inline-flex items-center flex-wrap gap-[0.4rem] m-0 text-[0.85rem] text-muted">
            <User size={14} weight="bold" />
            {job.clientName}
            {job.clientVerified ? (
              <span className="inline-flex items-center gap-[0.2rem] text-green2 font-bold text-[0.75rem]">
                <ShieldCheck size={12} weight="fill" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-[0.2rem] text-gold font-bold text-[0.75rem]">
                Unverified client
              </span>
            )}
          </p>
        </div>
        <span className={`${BADGE_BASE} ${BADGE_TONE[status.tone]}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-[0.85rem] text-[0.85rem] text-muted">
        <span className="inline-flex items-center gap-[0.35rem]">
          <MapPin size={14} weight="bold" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-[0.35rem]">
          <Calendar size={14} weight="bold" />
          {formatRelativeDate(job.deadline)}
        </span>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-3 mb-[0.85rem]">
        <div>
          <span className="block text-[0.72rem] font-extrabold tracking-[0.08em] uppercase text-muted">Protected amount</span>
          <span className="block text-[1.35rem] font-black text-green tracking-[-0.02em]">{formatNaira(job.amount)}</span>
        </div>
        {job.status === "invitation_pending" && job.invitationExpiresAt && (
          <span className="inline-flex items-center gap-[0.35rem] text-[0.82rem] font-bold text-[#b45309]">
            <Clock size={14} weight="bold" />
            Expires {formatRelativeDate(job.invitationExpiresAt)}
          </span>
        )}
      </div>

      {job.status === "awaiting_funding" && (
        <p className={`${NOTICE_BASE} ${NOTICE_TONE.warning}`}>
          <Warning size={16} weight="bold" />
          Do not start work — client has not funded escrow yet.
        </p>
      )}

      {job.status === "funds_secured" && (
        <p className={`${NOTICE_BASE} ${NOTICE_TONE.secure}`}>
          <ShieldCheck size={16} weight="fill" />
          Funds secured by our CBN-licensed partner. Safe to begin.
        </p>
      )}

      {job.status === "disputed" && job.disputeReason && (
        <p className={`${NOTICE_BASE} ${NOTICE_TONE.danger}`}>
          <Warning size={16} weight="bold" />
          {job.disputeReason}
        </p>
      )}

      {isOverdue && (
        <p className={`${NOTICE_BASE} ${NOTICE_TONE.danger}`}>
          <Warning size={16} weight="bold" />
          Deadline passed — upload proof or contact support.
        </p>
      )}

      {job.milestones && job.milestones.length > 0 && (
        <div className="flex justify-between gap-3 px-3 py-[0.55rem] rounded-[10px] bg-soft text-[0.78rem] font-bold text-green">
          <span>{job.milestones.length} milestones</span>
          <span>{formatNaira(job.amount)} total</span>
        </div>
      )}

      {job.invoice?.status === "sent" && (
        <p className={`${NOTICE_BASE} ${NOTICE_TONE.secure}`}>
          <Receipt size={16} weight="bold" />
          Invoice {job.invoice.invoiceNumber} sent
        </p>
      )}

      {action && (
        <div className="flex flex-wrap gap-[0.65rem]">
          {job.sentByArtisan && onCreateInvoice && (
            <button
              type="button"
              className={`${adashBtn} ${adashBtnSecondary}`}
              onClick={() => onCreateInvoice(job)}
            >
              <Receipt size={16} weight="bold" />
              {job.invoice ? "View invoice" : "Create invoice"}
            </button>
          )}
          {canMessageClient(job) && onMessageClient && (
            <button
              type="button"
              className={`${adashBtn} ${adashBtnSecondary}`}
              onClick={() => onMessageClient(job)}
            >
              <ChatsCircle size={16} weight="bold" />
              Message
            </button>
          )}
          {canRaiseDispute && (
            <button
              type="button"
              className={`${adashBtn} ${adashBtnGhost}`}
              onClick={() => onRaiseDispute?.(job)}
            >
              <Scales size={16} weight="bold" />
              Dispute
            </button>
          )}
          {job.status === "invitation_pending" && (
            <button
              type="button"
              className={`${adashBtn} ${adashBtnGhost}`}
              onClick={() => onDeclineInvite?.(job.id)}
            >
              Decline
            </button>
          )}
          <button
            type="button"
            className={`${adashBtn} ${BTN_VARIANT[action.variant]}`}
            disabled={action.disabled || (job.status === "invitation_pending" && !canAcceptJobs)}
            onClick={handlePrimaryClick}
            title={
              job.status === "invitation_pending" && !canAcceptJobs
                ? "Complete verification to accept jobs"
                : undefined
            }
          >
            {action.label}
          </button>
        </div>
      )}

      {action?.hint && <p className="mt-2 mb-0 text-[0.82rem] text-muted">{action.hint}</p>}
    </article>
  );
}
