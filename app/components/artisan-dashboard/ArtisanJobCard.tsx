"use client";

import {
  MapPin,
  Calendar,
  ShieldCheck,
  Warning,
  Clock,
  User,
} from "phosphor-react";
import type { ArtisanJob, JobPrimaryAction } from "./types";
import {
  formatNaira,
  formatRelativeDate,
  getJobPrimaryAction,
  JOB_STATUS_META,
} from "./utils";

type ArtisanJobCardProps = {
  job: ArtisanJob;
  canAcceptJobs: boolean;
  onPrimaryAction?: (job: ArtisanJob, action: JobPrimaryAction) => void;
};

export default function ArtisanJobCard({
  job,
  canAcceptJobs,
  onPrimaryAction,
}: ArtisanJobCardProps) {
  const status = JOB_STATUS_META[job.status];
  const action = getJobPrimaryAction(job);
  const isOverdue =
    job.status === "in_progress" &&
    new Date(job.deadline) < new Date();

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

      {action && (
        <div className="adash-job-actions">
          {job.status === "invitation_pending" && (
            <button
              type="button"
              className="adash-btn adash-btn--ghost"
              disabled={!canAcceptJobs}
              title={!canAcceptJobs ? "Complete verification first" : undefined}
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
