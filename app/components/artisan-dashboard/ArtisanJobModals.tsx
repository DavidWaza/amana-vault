"use client";

import { X, ShieldCheck, Warning, Receipt } from "phosphor-react";
import type { ArtisanJob } from "./types";
import { formatNaira, formatRelativeDate } from "./utils";

type ArtisanJobModalsProps = {
  inviteJob: ArtisanJob | null;
  detailJob: ArtisanJob | null;
  detailMode: "dispute" | "receipt" | null;
  onCloseInvite: () => void;
  onCloseDetail: () => void;
  onAcceptInvite: (jobId: string) => void;
  onDeclineInvite: (jobId: string) => void;
};

export default function ArtisanJobModals({
  inviteJob,
  detailJob,
  detailMode,
  onCloseInvite,
  onCloseDetail,
  onAcceptInvite,
  onDeclineInvite,
}: ArtisanJobModalsProps) {
  return (
    <>
      {inviteJob && (
        <div
          className="adash-modal-overlay"
          role="presentation"
          onClick={onCloseInvite}
        >
          <div
            className="adash-modal"
            role="dialog"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adash-modal-header">
              <div>
                <h3 id="invite-title">Review job invite</h3>
                <p className="adash-modal-subtext">{inviteJob.title}</p>
              </div>
              <button
                type="button"
                className="adash-modal-close"
                onClick={onCloseInvite}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="adash-job-modal-details">
              <p>
                <strong>Client:</strong> {inviteJob.clientName}
              </p>
              <p>
                <strong>Location:</strong> {inviteJob.location}
              </p>
              <p>
                <strong>Amount:</strong> {formatNaira(inviteJob.amount)}
              </p>
              <p>
                <strong>Deadline:</strong> {formatRelativeDate(inviteJob.deadline)}
              </p>
            </div>

            <p className="adash-modal-subtext">
              Accepting moves this job to your active list. The client must fund
              escrow before you start work.
            </p>

            <div className="adash-modal-actions">
              <button
                type="button"
                className="adash-btn adash-btn--ghost"
                onClick={() => onDeclineInvite(inviteJob.id)}
              >
                Decline
              </button>
              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={() => onAcceptInvite(inviteJob.id)}
              >
                Accept invite
              </button>
            </div>
          </div>
        </div>
      )}

      {detailJob && detailMode && (
        <div
          className="adash-modal-overlay"
          role="presentation"
          onClick={onCloseDetail}
        >
          <div
            className="adash-modal"
            role="dialog"
            aria-labelledby="job-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adash-modal-header">
              <div>
                <h3 id="job-detail-title">
                  {detailMode === "dispute" ? "Dispute details" : "Payment receipt"}
                </h3>
                <p className="adash-modal-subtext">{detailJob.title}</p>
              </div>
              <button
                type="button"
                className="adash-modal-close"
                onClick={onCloseDetail}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {detailMode === "dispute" ? (
              <>
                <div className="adash-job-modal-callout adash-job-modal-callout--danger">
                  <Warning size={20} weight="bold" />
                  <p>{detailJob.disputeReason ?? "This job is under dispute review."}</p>
                </div>
                <p className="adash-modal-subtext">
                  Amana is reviewing evidence from both sides. Do not start new
                  work on this job until a decision is issued.
                </p>
              </>
            ) : (
              <>
                <div className="adash-job-modal-callout adash-job-modal-callout--success">
                  <Receipt size={20} weight="bold" />
                  <p>
                    {formatNaira(detailJob.amount)} released to your wallet for{" "}
                    {detailJob.title}.
                  </p>
                </div>
                <div className="adash-job-modal-details">
                  <p>
                    <strong>Client:</strong> {detailJob.clientName}
                  </p>
                  <p>
                    <strong>Completed:</strong>{" "}
                    {new Date(detailJob.lastUpdated).toLocaleDateString("en-NG", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <ShieldCheck size={14} weight="fill" /> Funds released from escrow
                  </p>
                </div>
              </>
            )}

            <div className="adash-modal-actions">
              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={onCloseDetail}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
