"use client";

import { useEffect, useState } from "react";
import { X } from "phosphor-react";
import type { DesignRequest } from "./types";

export type ProposalDraft = {
  projectTitle: string;
  amount: number;
  timelineWeeks: number;
  note: string;
};

type ArchitectProposalModalProps = {
  request: DesignRequest | null;
  onClose: () => void;
  onSubmit: (request: DesignRequest, draft: ProposalDraft) => void;
};

export default function ArchitectProposalModal({
  request,
  onClose,
  onSubmit,
}: ArchitectProposalModalProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("");
  const [note, setNote] = useState("");

  // Reset the form whenever a new request is opened.
  useEffect(() => {
    if (request) {
      setProjectTitle(`${request.clientName} — ${request.projectType}`);
      setAmount("");
      setTimelineWeeks("");
      setNote("");
    }
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [request, onClose]);

  if (!request) return null;

  const amountValue = Number(amount);
  const timelineValue = Number(timelineWeeks);
  const canSubmit =
    projectTitle.trim().length > 0 &&
    Number.isFinite(amountValue) &&
    amountValue > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(request, {
      projectTitle: projectTitle.trim(),
      amount: amountValue,
      timelineWeeks: Number.isFinite(timelineValue) && timelineValue > 0 ? timelineValue : 0,
      note: note.trim(),
    });
  };

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>
        <h2 id="proposal-title">Send Proposal</h2>
        <p className="ap-modal-sub">
          Responding to {request.clientName} · {request.location} · {request.budgetRange}
        </p>
        <form className="ap-settings-form" onSubmit={handleSubmit}>
          <label>
            Project Title
            <input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Eze Residence Concept"
              required
            />
          </label>
          <label>
            Proposed Fee (₦)
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="4500000"
              required
            />
          </label>
          <label>
            Estimated Timeline (weeks)
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="8"
            />
          </label>
          <label>
            Cover Note
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Briefly introduce your studio and approach for this brief."
            />
          </label>
          <div className="ap-modal-actions">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ap-btn-primary" disabled={!canSubmit}>
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
