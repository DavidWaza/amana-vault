"use client";

import { useState } from "react";
import { X, Warning, Paperclip, Plus } from "phosphor-react";
import type {
  DisputeCategory,
  DisputeOutcome,
  DisputeParty,
  RaiseDisputeInput,
} from "./types";
import {
  DISPUTE_CATEGORY_META,
  DISPUTE_OUTCOME_META,
  desiredOutcomeOptions,
  disputeCategoriesFor,
} from "./constants";

type RaiseDisputeJob = {
  id: string;
  title: string;
  amount: number;
  counterpartyName: string;
};

type RaiseDisputeModalProps = {
  open: boolean;
  perspective: DisputeParty;
  job: RaiseDisputeJob | null;
  presetCategory?: DisputeCategory;
  formatAmount: (n: number) => string;
  onClose: () => void;
  onSubmit: (jobId: string, input: RaiseDisputeInput) => void;
};

export default function RaiseDisputeModal({
  open,
  perspective,
  job,
  presetCategory,
  formatAmount,
  onClose,
  onSubmit,
}: RaiseDisputeModalProps) {
  const categories = disputeCategoriesFor(perspective);
  const outcomes = desiredOutcomeOptions(perspective);

  const [category, setCategory] = useState<DisputeCategory>(
    presetCategory && categories.includes(presetCategory)
      ? presetCategory
      : categories[0],
  );
  const [reason, setReason] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState<DisputeOutcome>(
    outcomes[0],
  );
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceDraft, setEvidenceDraft] = useState("");

  // The form resets per target job because callers mount this with a
  // `key={job.id}`, so each new dispute gets a fresh component instance.

  if (!open || !job) return null;

  const counterpartyRole = perspective === "client" ? "artisan" : "client";
  const canSubmit = reason.trim().length >= 10;

  const addEvidence = () => {
    const label = evidenceDraft.trim();
    if (!label) return;
    setEvidence((prev) => [...prev, label]);
    setEvidenceDraft("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(job.id, {
      category,
      reason: reason.trim(),
      desiredOutcome,
      evidenceLabels: evidence,
    });
  };

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal adash-modal--agreement"
        role="dialog"
        aria-labelledby="raise-dispute-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <h3 id="raise-dispute-title">Open a dispute</h3>
            <p className="adash-modal-subtext">{job.title}</p>
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

        <div className="adash-job-modal-callout adash-job-modal-callout--danger">
          <Warning size={20} weight="bold" />
          <p>
            {formatAmount(job.amount)} stays locked in escrow while this dispute
            is open. Try messaging {job.counterpartyName} first — disputes are
            for when you can&apos;t agree.
          </p>
        </div>

        <div className="dsp-field">
          <label className="dsp-field-label">What went wrong?</label>
          <div className="dsp-option-grid">
            {categories.map((id) => (
              <button
                type="button"
                key={id}
                className={`dsp-option${category === id ? " dsp-option--active" : ""}`}
                onClick={() => setCategory(id)}
              >
                <strong>{DISPUTE_CATEGORY_META[id].label}</strong>
                <span>{DISPUTE_CATEGORY_META[id].description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dsp-field">
          <label className="dsp-field-label" htmlFor="dispute-reason">
            Describe the issue
          </label>
          <textarea
            id="dispute-reason"
            className="dsp-textarea"
            rows={4}
            value={reason}
            placeholder={`Explain clearly what happened so Amana and the ${counterpartyRole} understand your side…`}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="dsp-field-hint">
            {reason.trim().length < 10
              ? "Add at least a sentence of detail."
              : "Be factual — this is shared with the other party and Amana."}
          </p>
        </div>

        <div className="dsp-field">
          <label className="dsp-field-label">What outcome do you want?</label>
          <div className="dsp-option-grid">
            {outcomes.map((id) => (
              <button
                type="button"
                key={id}
                className={`dsp-option${desiredOutcome === id ? " dsp-option--active" : ""}`}
                onClick={() => setDesiredOutcome(id)}
              >
                <strong>{DISPUTE_OUTCOME_META[id].label}</strong>
                <span>{DISPUTE_OUTCOME_META[id].description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dsp-field">
          <label className="dsp-field-label">Evidence (optional)</label>
          <div className="dsp-evidence-add">
            <input
              type="text"
              className="dsp-input"
              value={evidenceDraft}
              placeholder="e.g. photo-of-leak.jpg, chat-screenshot.png"
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
              Add
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
        </div>

        <div className="adash-modal-actions">
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="adash-btn adash-btn--danger"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Submit dispute
          </button>
        </div>
      </div>
    </div>
  );
}
