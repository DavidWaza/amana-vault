"use client";

import { useState } from "react";
import {
  X,
  Warning,
  ShieldCheck,
  Paperclip,
  ChatText,
  Scales,
  CheckCircle,
  Plus,
} from "phosphor-react";
import type { DisputeJobView, DisputeOutcome, DisputeParty } from "./types";
import {
  DISPUTE_CATEGORY_META,
  DISPUTE_OUTCOME_META,
  DISPUTE_STAGE_META,
  describeResolution,
  partyLabel,
} from "./constants";

type DisputeWorkspaceModalProps = {
  open: boolean;
  perspective: DisputeParty;
  view: DisputeJobView | null;
  formatAmount: (n: number) => string;
  onClose: () => void;
  onAddResponse: (jobId: string, text: string, evidenceLabels: string[]) => void;
  onAcceptOutcome: (jobId: string, outcome: DisputeOutcome) => void;
  onWithdraw: (jobId: string) => void;
  onEscalate: (jobId: string) => void;
};

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DisputeWorkspaceModal({
  open,
  perspective,
  view,
  formatAmount,
  onClose,
  onAddResponse,
  onAcceptOutcome,
  onWithdraw,
  onEscalate,
}: DisputeWorkspaceModalProps) {
  const [responseDraft, setResponseDraft] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceDraft, setEvidenceDraft] = useState("");

  // Draft state resets per dispute because callers mount this with a
  // `key={view.id}`, giving each dispute a fresh component instance.

  if (!open || !view) return null;

  const { dispute } = view;
  const stageMeta = DISPUTE_STAGE_META[dispute.stage];
  const iRaisedIt = dispute.raisedBy === perspective;
  const isResolved = dispute.stage === "resolved";
  const isEscalated = dispute.stage === "escalated";
  const canAct = !isResolved && !isEscalated;

  const addEvidence = () => {
    const label = evidenceDraft.trim();
    if (!label) return;
    setEvidence((prev) => [...prev, label]);
    setEvidenceDraft("");
  };

  const submitResponse = () => {
    if (!responseDraft.trim() && evidence.length === 0) return;
    onAddResponse(view.id, responseDraft.trim(), evidence);
    setResponseDraft("");
    setEvidence([]);
  };

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal adash-modal--agreement dsp-workspace"
        role="dialog"
        aria-labelledby="dispute-workspace-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <h3 id="dispute-workspace-title">Dispute · {view.title}</h3>
            <p className="adash-modal-subtext">
              with {view.counterpartyName} · {formatAmount(dispute.amount)} in
              escrow
            </p>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={`dsp-stage-banner dsp-stage-banner--${stageMeta.tone}`}>
          <Scales size={18} weight="bold" />
          <div>
            <strong>{stageMeta.label}</strong>
            <span>{stageMeta.description}</span>
          </div>
        </div>

        <div className="dsp-summary">
          <div>
            <span className="dsp-summary-label">Raised by</span>
            <strong>{partyLabel(dispute.raisedBy)}</strong>
          </div>
          <div>
            <span className="dsp-summary-label">Issue</span>
            <strong>{DISPUTE_CATEGORY_META[dispute.category].label}</strong>
          </div>
          <div>
            <span className="dsp-summary-label">Requested</span>
            <strong>{DISPUTE_OUTCOME_META[dispute.desiredOutcome].label}</strong>
          </div>
        </div>

        {isResolved && dispute.resolution && (
          <div className="adash-job-modal-callout adash-job-modal-callout--success">
            <CheckCircle size={20} weight="fill" />
            <p>
              <strong>
                Resolved by {partyLabel(dispute.resolution.decidedBy)}.
              </strong>{" "}
              {describeResolution(dispute, formatAmount)}
              {dispute.resolution.note ? ` "${dispute.resolution.note}"` : ""}
            </p>
          </div>
        )}

        {isEscalated && (
          <div className="adash-job-modal-callout adash-job-modal-callout--danger">
            <Warning size={20} weight="bold" />
            <p>
              This dispute is with Amana for an independent decision. You&apos;ll
              be notified once a ruling is issued. Funds remain protected in
              escrow until then.
            </p>
          </div>
        )}

        {/* Conversation / evidence thread */}
        <div className="dsp-thread">
          {dispute.statements.map((s) => (
            <div
              key={s.id}
              className={`dsp-statement dsp-statement--${
                s.party === perspective ? "self" : s.party
              }`}
            >
              <div className="dsp-statement-head">
                <ChatText size={14} weight="bold" />
                <strong>{partyLabel(s.party)}</strong>
                <span>{formatStamp(s.createdAt)}</span>
              </div>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        {dispute.evidence.length > 0 && (
          <div className="dsp-field">
            <span className="dsp-field-label">
              Evidence ({dispute.evidence.length})
            </span>
            <ul className="dsp-evidence-list">
              {dispute.evidence.map((ev) => (
                <li key={ev.id} className="dsp-evidence-chip">
                  <Paperclip size={14} weight="bold" />
                  <span>{ev.label}</span>
                  <em className="dsp-evidence-by">{partyLabel(ev.party)}</em>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Response composer */}
        {canAct && (
          <div className="dsp-field">
            <label className="dsp-field-label" htmlFor="dispute-response">
              Add your response
            </label>
            <textarea
              id="dispute-response"
              className="dsp-textarea"
              rows={3}
              value={responseDraft}
              placeholder="Add context, respond to the other party, or attach evidence…"
              onChange={(e) => setResponseDraft(e.target.value)}
            />
            <div className="dsp-evidence-add">
              <input
                type="text"
                className="dsp-input"
                value={evidenceDraft}
                placeholder="Attach evidence by name…"
                onChange={(e) => setEvidenceDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEvidence();
                  }
                }}
              />
              <button
                type="button"
                className="adash-btn adash-btn--secondary"
                onClick={addEvidence}
              >
                <Plus size={16} weight="bold" />
                Attach
              </button>
            </div>
            {evidence.length > 0 && (
              <ul className="dsp-evidence-list">
                {evidence.map((label, index) => (
                  <li key={`${label}-${index}`} className="dsp-evidence-chip">
                    <Paperclip size={14} weight="bold" />
                    <span>{label}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${label}`}
                      onClick={() =>
                        setEvidence((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="adash-btn adash-btn--secondary dsp-response-submit"
              disabled={!responseDraft.trim() && evidence.length === 0}
              onClick={submitResponse}
            >
              <ChatText size={16} weight="bold" />
              Post response
            </button>
          </div>
        )}

        {/* Decision actions */}
        <div className="adash-modal-actions dsp-actions">
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>

          {canAct && iRaisedIt && (
            <>
              <button
                type="button"
                className="adash-btn adash-btn--secondary"
                onClick={() => onWithdraw(view.id)}
              >
                Withdraw dispute
              </button>
              <button
                type="button"
                className="adash-btn adash-btn--danger"
                onClick={() => onEscalate(view.id)}
              >
                <Scales size={16} weight="bold" />
                Escalate to Amana
              </button>
            </>
          )}

          {canAct && !iRaisedIt && (
            <>
              <button
                type="button"
                className="adash-btn adash-btn--danger"
                onClick={() => onEscalate(view.id)}
              >
                <Scales size={16} weight="bold" />
                Reject & escalate
              </button>
              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={() => onAcceptOutcome(view.id, dispute.desiredOutcome)}
              >
                <ShieldCheck size={16} weight="bold" />
                Accept ·{" "}
                {DISPUTE_OUTCOME_META[dispute.desiredOutcome].label}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
