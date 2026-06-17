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
    <article id={job.id} className={`adash-job-card${job.priority === "urgent" ? " adash-job-card--urgent" : ""}`}>
      <div className="adash-job-card-top">
        <div>
          <h3>{job.title}</h3>
          <p className="adash-job-client">
            <User size={14} weight="bold" />
            {job.clientName}
            {job.clientVerified ? (
              <span className="adash-job-verified">
                <ShieldCheck size={12} weight="fill" /> Verified
              </span>
            ) : (
              <span className="adash-job-unverified">Unverified client</span>
            )}
          </p>
        </div>
        <span className={`adash-job-badge adash-job-badge--${status.tone}`}>
          {status.label}
        </span>
      </div>

      <div className="adash-job-meta">
        <span>
          <MapPin size={14} weight="bold" />
          {job.location}
        </span>
        <span>
          <Calendar size={14} weight="bold" />
          {formatRelativeDate(job.deadline)}
        </span>
      </div>

      <div className="adash-job-amount-row">
        <div>
          <span className="adash-job-amount-label">Protected amount</span>
          <span className="adash-job-amount">{formatNaira(job.amount)}</span>
        </div>
        {job.status === "invitation_pending" && job.invitationExpiresAt && (
          <span className="adash-job-expiry">
            <Clock size={14} weight="bold" />
            Expires {formatRelativeDate(job.invitationExpiresAt)}
          </span>
        )}
      </div>

      {job.status === "awaiting_funding" && (
        <p className="adash-job-notice adash-job-notice--warning">
          <Warning size={16} weight="bold" />
          Do not start work — client has not funded escrow yet.
        </p>
      )}

      {job.status === "funds_secured" && (
        <p className="adash-job-notice adash-job-notice--secure">
          <ShieldCheck size={16} weight="fill" />
          Funds secured by our CBN-licensed partner. Safe to begin.
        </p>
      )}

      {job.status === "disputed" && job.disputeReason && (
        <p className="adash-job-notice adash-job-notice--danger">
          <Warning size={16} weight="bold" />
          {job.disputeReason}
        </p>
      )}

      {isOverdue && (
        <p className="adash-job-notice adash-job-notice--danger">
          <Warning size={16} weight="bold" />
          Deadline passed — upload proof or contact support.
        </p>
      )}

      {job.milestones && job.milestones.length > 0 && (
        <div className="adash-job-milestones-preview">
          <span>{job.milestones.length} milestones</span>
          <span>{formatNaira(job.amount)} total</span>
        </div>
      )}

      {job.invoice?.status === "sent" && (
        <p className="adash-job-notice adash-job-notice--secure">
          <Receipt size={16} weight="bold" />
          Invoice {job.invoice.invoiceNumber} sent
        </p>
      )}

      {action && (
        <div className="adash-job-actions">
          {job.sentByArtisan && onCreateInvoice && (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={() => onCreateInvoice(job)}
            >
              <Receipt size={16} weight="bold" />
              {job.invoice ? "View invoice" : "Create invoice"}
            </button>
          )}
          {canMessageClient(job) && onMessageClient && (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={() => onMessageClient(job)}
            >
              <ChatsCircle size={16} weight="bold" />
              Message
            </button>
          )}
          {canRaiseDispute && (
            <button
              type="button"
              className="adash-btn adash-btn--ghost"
              onClick={() => onRaiseDispute?.(job)}
            >
              <Scales size={16} weight="bold" />
              Dispute
            </button>
          )}
          {job.status === "invitation_pending" && (
            <button
              type="button"
              className="adash-btn adash-btn--ghost"
              onClick={() => onDeclineInvite?.(job.id)}
            >
              Decline
            </button>
          )}
          <button
            type="button"
            className={`adash-btn adash-btn--${action.variant}`}
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

      {action?.hint && <p className="adash-job-hint">{action.hint}</p>}
    </article>
  );
}
