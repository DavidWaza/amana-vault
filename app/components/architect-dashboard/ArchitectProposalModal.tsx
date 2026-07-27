"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import {
  PROPOSAL_DELIVERABLE_OPTIONS,
  PROPOSAL_EXCLUSION_PRESETS,
  PROPOSAL_FILE_FORMATS,
  PROPOSAL_OPTIONAL_SERVICES,
} from "./constants";
import { Notice } from "./ArchitectPrimitives";
import { formatNaira } from "./utils";
import type { ArchitectProposal, DesignOpportunity } from "./types";

export type ProposalDraft = {
  projectTitle: string;
  designFee: number;
  timelineWeeks: number;
  deliverables: string[];
  revisionsIncluded: number;
  renders3d: number;
  fileFormats: string[];
  planningApprovalAssistance: boolean;
  consultantCoordination: boolean;
  optionalServices: string[];
  exclusions: string[];
  assumptions: string;
  validityDays: number;
  saveAsDraft: boolean;
};

type ArchitectProposalModalProps = {
  opportunity: DesignOpportunity | null;
  /** Set when revising an existing proposal after client feedback. */
  existing?: ArchitectProposal | null;
  onClose: () => void;
  onSubmit: (draft: ProposalDraft, opportunity: DesignOpportunity | null) => void;
};

const DEFAULT_DELIVERABLES = [
  "Concept design",
  "Floor plans",
  "Elevations & sections",
  "3D exterior renders",
  "Construction drawings",
];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * The full proposal form from PRD §13. Construction supervision is always
 * carried as an exclusion so a design-only bid can never read as a site
 * appointment.
 */
export default function ArchitectProposalModal({
  opportunity,
  existing,
  onClose,
  onSubmit,
}: ArchitectProposalModalProps) {
  const open = Boolean(opportunity || existing);

  // Seeded once per open. The parent keys this modal on the brief/proposal id,
  // so opening a different one remounts with fresh values.
  const [projectTitle, setProjectTitle] = useState(
    () => existing?.projectTitle ?? opportunity?.projectName ?? "",
  );
  const [designFee, setDesignFee] = useState(() =>
    existing ? String(existing.designFee) : "",
  );
  const [timelineWeeks, setTimelineWeeks] = useState(() =>
    String(existing?.timelineWeeks ?? 12),
  );
  const [deliverables, setDeliverables] = useState<string[]>(
    () =>
      existing?.deliverables ??
      (opportunity && opportunity.requiredDeliverables.length > 0
        ? opportunity.requiredDeliverables
        : DEFAULT_DELIVERABLES),
  );
  const [revisionsIncluded, setRevisionsIncluded] = useState(() =>
    String(existing?.revisionsIncluded ?? 2),
  );
  const [renders3d, setRenders3d] = useState(() => String(existing?.renders3d ?? 2));
  const [fileFormats, setFileFormats] = useState<string[]>(
    () => existing?.fileFormats ?? ["PDF", "DWG"],
  );
  const [planningApproval, setPlanningApproval] = useState(
    () => existing?.planningApprovalAssistance ?? false,
  );
  const [consultantCoordination, setConsultantCoordination] = useState(
    () => existing?.consultantCoordination ?? false,
  );
  const [optionalServices, setOptionalServices] = useState<string[]>(
    () => existing?.optionalServices ?? [],
  );
  const [exclusions, setExclusions] = useState<string[]>(
    () => existing?.exclusions ?? ["Construction supervision"],
  );
  const [assumptions, setAssumptions] = useState(() => existing?.assumptions ?? "");
  const [validityDays, setValidityDays] = useState(() => String(existing?.validityDays ?? 30));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const feeValue = Number(designFee);
  const canSubmit =
    projectTitle.trim().length > 0 &&
    Number.isFinite(feeValue) &&
    feeValue > 0 &&
    deliverables.length > 0;

  const missing = useMemo(() => {
    const problems: string[] = [];
    if (!projectTitle.trim()) problems.push("a project title");
    if (!Number.isFinite(feeValue) || feeValue <= 0) problems.push("a design fee");
    if (deliverables.length === 0) problems.push("at least one deliverable");
    return problems;
  }, [projectTitle, feeValue, deliverables.length]);

  const buildDraft = (saveAsDraft: boolean): ProposalDraft => ({
    projectTitle: projectTitle.trim(),
    designFee: Number(designFee),
    timelineWeeks: Math.max(1, Number(timelineWeeks) || 0),
    deliverables,
    revisionsIncluded: Math.max(0, Number(revisionsIncluded) || 0),
    renders3d: Math.max(0, Number(renders3d) || 0),
    fileFormats,
    planningApprovalAssistance: planningApproval,
    consultantCoordination,
    optionalServices,
    exclusions,
    assumptions: assumptions.trim(),
    validityDays: Math.max(1, Number(validityDays) || 30),
    saveAsDraft,
  });

  const [handleSubmit, submitLoading] = useAsyncAction((event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(buildDraft(false), opportunity);
  });

  const [handleSaveDraft, draftLoading] = useAsyncAction(() => {
    if (!projectTitle.trim()) return;
    onSubmit(buildDraft(true), opportunity);
  });

  if (!open) return null;

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>

        <header className="ap-modal-head">
          <span className="ap-modal-eyebrow">
            {existing ? "Revise proposal" : "New proposal"} · Design only
          </span>
          <h2 id="proposal-title">{opportunity?.projectName ?? existing?.projectTitle}</h2>
          <p className="ap-modal-sub">
            {opportunity
              ? `${opportunity.clientName} · ${opportunity.location} · ${opportunity.budgetRange}`
              : `${existing?.clientName ?? ""}`}
          </p>
        </header>

        {existing?.clientNote && (
          <Notice tone="info">
            <strong>Client asked:</strong> {existing.clientNote}
          </Notice>
        )}

        <form className="ap-form ap-modal-body" onSubmit={handleSubmit} id="proposal-form">
          <div className="ap-form-grid">
            <label className="ap-field ap-field--wide">
              <span>Project title</span>
              <input
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                placeholder="e.g. Banex Office Project"
                required
              />
            </label>

            <label className="ap-field">
              <span>Design fee (₦)</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={designFee}
                onChange={(event) => setDesignFee(event.target.value)}
                placeholder="14500000"
                required
              />
              {Number.isFinite(feeValue) && feeValue > 0 && (
                <small className="ap-field-hint">{formatNaira(feeValue)}</small>
              )}
            </label>

            <label className="ap-field">
              <span>Proposed timeline (weeks)</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={timelineWeeks}
                onChange={(event) => setTimelineWeeks(event.target.value)}
              />
            </label>

            <label className="ap-field">
              <span>Revisions included</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={revisionsIncluded}
                onChange={(event) => setRevisionsIncluded(event.target.value)}
              />
              <small className="ap-field-hint">
                Further rounds may attract a fee and timeline adjustment.
              </small>
            </label>

            <label className="ap-field">
              <span>3D renders included</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={renders3d}
                onChange={(event) => setRenders3d(event.target.value)}
              />
            </label>

            <label className="ap-field">
              <span>Proposal validity (days)</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={validityDays}
                onChange={(event) => setValidityDays(event.target.value)}
              />
              <small className="ap-field-hint">The bid expires automatically after this period.</small>
            </label>
          </div>

          <fieldset className="ap-fieldset">
            <legend>Included deliverables</legend>
            <div className="ap-check-grid">
              {PROPOSAL_DELIVERABLE_OPTIONS.map((option) => (
                <label key={option} className="ap-check">
                  <input
                    type="checkbox"
                    checked={deliverables.includes(option)}
                    onChange={() => setDeliverables((prev) => toggle(prev, option))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>File formats supplied</legend>
            <div className="ap-check-grid ap-check-grid--tight">
              {PROPOSAL_FILE_FORMATS.map((format) => (
                <label key={format} className="ap-check">
                  <input
                    type="checkbox"
                    checked={fileFormats.includes(format)}
                    onChange={() => setFileFormats((prev) => toggle(prev, format))}
                  />
                  <span>{format}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Additional services</legend>
            <label className="ap-check">
              <input
                type="checkbox"
                checked={planningApproval}
                onChange={(event) => setPlanningApproval(event.target.checked)}
              />
              <span>Planning-approval assistance</span>
            </label>
            <label className="ap-check">
              <input
                type="checkbox"
                checked={consultantCoordination}
                onChange={(event) => setConsultantCoordination(event.target.checked)}
              />
              <span>Consultant coordination (structural, MEP, QS)</span>
            </label>
            <div className="ap-check-grid">
              {PROPOSAL_OPTIONAL_SERVICES.map((service) => (
                <label key={service} className="ap-check">
                  <input
                    type="checkbox"
                    checked={optionalServices.includes(service)}
                    onChange={() => setOptionalServices((prev) => toggle(prev, service))}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ap-fieldset">
            <legend>Exclusions</legend>
            <div className="ap-check-grid">
              {PROPOSAL_EXCLUSION_PRESETS.map((exclusion) => {
                const locked = exclusion === "Construction supervision";
                return (
                  <label
                    key={exclusion}
                    className={`ap-check${locked ? " ap-check--locked" : ""}`}
                    title={
                      locked
                        ? "A design-only appointment always excludes construction supervision."
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={exclusions.includes(exclusion)}
                      disabled={locked}
                      onChange={() => setExclusions((prev) => toggle(prev, exclusion))}
                    />
                    <span>{exclusion}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="ap-field ap-field--wide">
            <span>Assumptions</span>
            <textarea
              rows={3}
              value={assumptions}
              onChange={(event) => setAssumptions(event.target.value)}
              placeholder="e.g. The survey plan is accurate and the plot is free of encumbrance."
            />
          </label>

          {!canSubmit && missing.length > 0 && (
            <p className="ap-form-hint">Add {missing.join(", ")} to submit this proposal.</p>
          )}
        </form>

        <div className="ap-modal-actions ap-modal-actions--spread">
          <Button
            type="button"
            className="ap-btn-ghost"
            onClick={handleSaveDraft}
            disabled={!projectTitle.trim()}
            loading={draftLoading}
            loadingLabel="Saving…"
          >
            Save as draft
          </Button>
          <div className="ap-modal-actions-right">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <Button
              type="submit"
              form="proposal-form"
              className="ap-btn-primary"
              disabled={!canSubmit}
              loading={submitLoading}
              loadingLabel="Submitting…"
            >
              {existing ? "Send revised proposal" : "Submit proposal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
