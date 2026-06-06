"use client";

import {
  MapPin,
  Calendar,
  ShieldCheck,
  Warning,
  Clock,
  User,
  ChatsCircle,
  Wrench,
} from "phosphor-react";
import type { ClientJob, ClientJobPrimaryAction } from "./types";
import {
  formatNaira,
  formatRelativeDate,
  canMessageArtisan,
  getClientJobPrimaryAction,
  CLIENT_JOB_STATUS_META,
  calculateClientTotalDue,
} from "./utils";

type ClientJobCardProps = {
  job: ClientJob;
  canFundJobs: boolean;
  onPrimaryAction?: (job: ClientJob, action: ClientJobPrimaryAction) => void;
  onMessageArtisan?: (job: ClientJob) => void;
  onCancelInvite?: (jobId: string) => void;
};

export default function ClientJobCard({
  job,
  canFundJobs,
  onPrimaryAction,
  onMessageArtisan,
  onCancelInvite,
}: ClientJobCardProps) {
  const status = CLIENT_JOB_STATUS_META[job.status];
  const action = getClientJobPrimaryAction(job);
  const totalDue = calculateClientTotalDue(job.amount, job.protectionFee);

  const handlePrimaryClick = () => {
    if (!action?.action || action.disabled || !onPrimaryAction) return;
    onPrimaryAction(job, action.action);
  };

  return (
    <article
      id={job.id}
      className={`adash-job-card${job.priority === "urgent" ? " adash-job-card--urgent" : ""}`}
    >
      <div className="adash-job-card-top">
        <div>
          <h3>{job.title}</h3>
          <p className="adash-job-client">
            <User size={14} weight="bold" />
            {job.artisanName}
            {job.artisanCategory && (
              <span className="adash-job-unverified">
                <Wrench size={12} weight="bold" />
                {job.artisanCategory}
              </span>
            )}
            {job.artisanVerified ? (
              <span className="adash-job-verified">
                <ShieldCheck size={12} weight="fill" /> Verified
              </span>
            ) : (
              <span className="adash-job-unverified">Unverified artisan</span>
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
        {job.status === "awaiting_funding" && (
          <span className="adash-job-expiry">
            Total due {formatNaira(totalDue)} incl. 5% fee
          </span>
        )}
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
          Fund escrow to secure this job. Do not pay the artisan directly.
        </p>
      )}

      {job.status === "funds_secured" && (
        <p className="adash-job-notice adash-job-notice--secure">
          <ShieldCheck size={16} weight="fill" />
          Your payment is secured. Waiting for the artisan to start work.
        </p>
      )}

      {(job.releaseRequestAmount ?? 0) > 0 && (
        <p className="adash-job-notice adash-job-notice--warning">
          <Warning size={16} weight="bold" />
          {job.artisanName} requested release of {formatNaira(job.releaseRequestAmount!)}.
        </p>
      )}

      {job.status === "proof_submitted" && (
        <p className="adash-job-notice adash-job-notice--warning">
          <Warning size={16} weight="bold" />
          Proof uploaded — review and approve or open a dispute.
        </p>
      )}

      {job.status === "disputed" && job.disputeReason && (
        <p className="adash-job-notice adash-job-notice--danger">
          <Warning size={16} weight="bold" />
          {job.disputeReason}
        </p>
      )}

      {job.milestones && job.milestones.length > 0 && (
        <div className="adash-job-milestones-preview">
          <span>{job.milestones.length} milestones</span>
          <span>{formatNaira(job.amount)} protected</span>
        </div>
      )}

      {action && (
        <div className="adash-job-actions">
          {canMessageArtisan(job) && onMessageArtisan && (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={() => onMessageArtisan(job)}
            >
              <ChatsCircle size={16} weight="bold" />
              Message
            </button>
          )}
          {job.status === "invitation_pending" && (
            <button
              type="button"
              className="adash-btn adash-btn--ghost"
              onClick={() => onCancelInvite?.(job.id)}
            >
              Cancel invite
            </button>
          )}
          <button
            type="button"
            className={`adash-btn adash-btn--${action.variant}`}
            disabled={
              action.disabled ||
              ((action.action === "fund_escrow" || action.action === "review_agreement") &&
                !canFundJobs)
            }
            onClick={handlePrimaryClick}
            title={
              !canFundJobs &&
              (action.action === "fund_escrow" || action.action === "review_agreement")
                ? "Verify identity and add payment method first"
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
