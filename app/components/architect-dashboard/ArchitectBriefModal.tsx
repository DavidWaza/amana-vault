"use client";

import { useEffect } from "react";
import { ChatCircleDots, Prohibit, ShieldCheck, ShieldWarning, X } from "phosphor-react";
import ArchitectBriefBody from "./ArchitectBriefBody";
import { formatLongDate } from "./utils";
import type { ClientBrief } from "./types";

type ArchitectBriefModalProps = {
  brief: ClientBrief | null;
  projectName: string;
  /** Hidden for briefs opened from a live project, where bidding is long past. */
  showBidActions?: boolean;
  canBid?: boolean;
  onClose: () => void;
  onAskClarification?: () => void;
  onSubmitProposal?: () => void;
  onDecline?: () => void;
  onSaveForLater?: () => void;
};

/**
 * The client's Build Your Dream Home submission, shown in full (PRD §12).
 * Everything the client already answered lives here so the architect never has
 * to ask for it again.
 */
export default function ArchitectBriefModal({
  brief,
  projectName,
  showBidActions = false,
  canBid = true,
  onClose,
  onAskClarification,
  onSubmitProposal,
  onDecline,
  onSaveForLater,
}: ArchitectBriefModalProps) {
  useEffect(() => {
    if (!brief) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [brief, onClose]);

  if (!brief) return null;

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>

        <header className="ap-modal-head">
          <span className="ap-modal-eyebrow">Client brief · Build Your Dream Home</span>
          <h2 id="brief-title">{projectName}</h2>
          <p className="ap-modal-sub">
            Submitted {formatLongDate(brief.submittedAt)}
            {brief.clientVerified ? (
              <span className="ap-inline-verified">
                <ShieldCheck size={13} weight="fill" /> Verified client
              </span>
            ) : (
              <span className="ap-inline-unverified">
                <ShieldWarning size={13} weight="fill" /> Client not verified
              </span>
            )}
          </p>
        </header>

        <div className="ap-modal-body">
          <ArchitectBriefBody brief={brief} />
        </div>

        {showBidActions && (
          <div className="ap-modal-actions ap-modal-actions--spread">
            <div className="ap-modal-actions-left">
              <button type="button" className="ap-btn-ghost ap-btn-sm" onClick={onDecline}>
                <Prohibit size={15} weight="bold" /> Decline
              </button>
              <button type="button" className="ap-btn-ghost ap-btn-sm" onClick={onSaveForLater}>
                Save for later
              </button>
            </div>
            <div className="ap-modal-actions-right">
              <button
                type="button"
                className="ap-btn-outline ap-btn-sm"
                onClick={onAskClarification}
              >
                <ChatCircleDots size={15} weight="bold" /> Ask clarification
              </button>
              <button
                type="button"
                className="ap-btn-primary ap-btn-sm"
                onClick={onSubmitProposal}
                disabled={!canBid}
                title={canBid ? undefined : "The proposal deadline has passed."}
              >
                Submit proposal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
