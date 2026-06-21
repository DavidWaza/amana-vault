"use client";

import { X, ShieldCheck, Warning, Receipt } from "phosphor-react";
import type { ArtisanJob } from "./types";
import { formatNaira, formatRelativeDate } from "./utils";
import {
  adashBtn,
  adashBtnGhost,
  adashBtnPrimary,
  adashModal,
  adashModalActions,
  adashModalClose,
  adashModalHeader,
  adashModalOverlay,
} from "./ui";

const H3 = "m-0 text-[1.2rem] text-green";
const SUBTEXT = "m-0 mb-4 text-[0.9rem] text-muted";
const DETAILS = "grid gap-[0.45rem] my-3 px-4 py-[0.85rem] rounded-xl bg-soft";
const DETAIL_P = "m-0 text-[0.88rem] text-text";
const CALLOUT = "flex items-start gap-[0.65rem] px-4 py-[0.85rem] rounded-xl mb-3";
const CALLOUT_P = "m-0 text-[0.88rem] leading-[1.5]";

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
          className={adashModalOverlay}
          role="presentation"
          onClick={onCloseInvite}
        >
          <div
            className={adashModal}
            role="dialog"
            aria-labelledby="invite-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={adashModalHeader}>
              <div>
                <h3 id="invite-title" className={H3}>Review job invite</h3>
                <p className={SUBTEXT}>{inviteJob.title}</p>
              </div>
              <button
                type="button"
                className={adashModalClose}
                onClick={onCloseInvite}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className={DETAILS}>
              <p className={DETAIL_P}>
                <strong>Client:</strong> {inviteJob.clientName}
              </p>
              <p className={DETAIL_P}>
                <strong>Location:</strong> {inviteJob.location}
              </p>
              <p className={DETAIL_P}>
                <strong>Amount:</strong> {formatNaira(inviteJob.amount)}
              </p>
              <p className={DETAIL_P}>
                <strong>Deadline:</strong> {formatRelativeDate(inviteJob.deadline)}
              </p>
            </div>

            <p className={SUBTEXT}>
              Accepting moves this job to your active list. The client must fund
              escrow before you start work.
            </p>

            <div className={adashModalActions}>
              <button
                type="button"
                className={`${adashBtn} ${adashBtnGhost}`}
                onClick={() => onDeclineInvite(inviteJob.id)}
              >
                Decline
              </button>
              <button
                type="button"
                className={`${adashBtn} ${adashBtnPrimary}`}
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
          className={adashModalOverlay}
          role="presentation"
          onClick={onCloseDetail}
        >
          <div
            className={adashModal}
            role="dialog"
            aria-labelledby="job-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={adashModalHeader}>
              <div>
                <h3 id="job-detail-title" className={H3}>
                  {detailMode === "dispute" ? "Dispute details" : "Payment receipt"}
                </h3>
                <p className={SUBTEXT}>{detailJob.title}</p>
              </div>
              <button
                type="button"
                className={adashModalClose}
                onClick={onCloseDetail}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {detailMode === "dispute" ? (
              <>
                <div className={`${CALLOUT} bg-[#fef2f2] text-[#991b1b]`}>
                  <Warning size={20} weight="bold" />
                  <p className={CALLOUT_P}>{detailJob.disputeReason ?? "This job is under dispute review."}</p>
                </div>
                <p className={SUBTEXT}>
                  Amana is reviewing evidence from both sides. Do not start new
                  work on this job until a decision is issued.
                </p>
              </>
            ) : (
              <>
                <div className={`${CALLOUT} bg-[#ecfdf5] text-[#065f46]`}>
                  <Receipt size={20} weight="bold" />
                  <p className={CALLOUT_P}>
                    {formatNaira(detailJob.amount)} released to your wallet for{" "}
                    {detailJob.title}.
                  </p>
                </div>
                <div className={DETAILS}>
                  <p className={DETAIL_P}>
                    <strong>Client:</strong> {detailJob.clientName}
                  </p>
                  <p className={DETAIL_P}>
                    <strong>Completed:</strong>{" "}
                    {new Date(detailJob.lastUpdated).toLocaleDateString("en-NG", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className={DETAIL_P}>
                    <ShieldCheck size={14} weight="fill" /> Funds released from escrow
                  </p>
                </div>
              </>
            )}

            <div className={adashModalActions}>
              <button
                type="button"
                className={`${adashBtn} ${adashBtnPrimary}`}
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
