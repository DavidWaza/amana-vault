"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, WarningCircle, X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { AGREEMENT_STEPS, APPOINTMENT_META, DESIGN_ONLY_EXCLUSIONS } from "./constants";
import { DetailGrid, Notice } from "./ArchitectPrimitives";
import { formatNaira, plural } from "./utils";
import type { AgreementStepId, ArchitectProject } from "./types";

export type AgreementResult = {
  confirmedSteps: AgreementStepId[];
  resolutions: Record<string, string>;
  finalDecisionMaker: string;
  includedRevisions: number;
  designTimelineWeeks: number;
  clientReviewPeriodDays: number;
  signed: boolean;
};

type ArchitectAgreementModalProps = {
  project: ArchitectProject | null;
  onClose: () => void;
  onSave: (project: ArchitectProject, result: AgreementResult) => void;
};

/**
 * The 10-step agreement preparation flow (PRD §14). Amana combines the client's
 * brief with the accepted proposal; anywhere the two disagree becomes a
 * "difference" that must be resolved before the agreement can be signed.
 */
export default function ArchitectAgreementModal({
  project,
  onClose,
  onSave,
}: ArchitectAgreementModalProps) {
  const agreement = project?.agreement ?? null;

  // Seeded once per open; the parent keys this modal on the project id.
  const [stepIndex, setStepIndex] = useState(0);
  const [confirmed, setConfirmed] = useState<AgreementStepId[]>(
    () => agreement?.confirmedSteps ?? [],
  );
  const [resolutions, setResolutions] = useState<Record<string, string>>(() =>
    (agreement?.differences ?? []).reduce<Record<string, string>>((acc, difference) => {
      if (difference.resolution) acc[difference.id] = difference.resolution;
      return acc;
    }, {}),
  );
  const [decisionMaker, setDecisionMaker] = useState(
    () => agreement?.finalDecisionMaker || (project?.clientName ?? ""),
  );
  const [revisions, setRevisions] = useState(() => String(agreement?.includedRevisions ?? 2));
  const [timelineWeeks, setTimelineWeeks] = useState(() =>
    String(agreement?.designTimelineWeeks ?? 12),
  );
  const [reviewDays, setReviewDays] = useState(() =>
    String(agreement?.clientReviewPeriodDays ?? 5),
  );

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [project, onClose]);

  const unresolvedDifferences = useMemo(
    () =>
      (agreement?.differences ?? []).filter(
        (difference) => !(resolutions[difference.id] ?? "").trim(),
      ),
    [agreement, resolutions],
  );

  const [handleSign, signing] = useAsyncAction(() => {
    if (!project) return;
    onSave(project, {
      confirmedSteps: AGREEMENT_STEPS.map((step) => step.id as AgreementStepId),
      resolutions,
      finalDecisionMaker: decisionMaker.trim() || project.clientName,
      includedRevisions: Math.max(0, Number(revisions) || 0),
      designTimelineWeeks: Math.max(1, Number(timelineWeeks) || 1),
      clientReviewPeriodDays: Math.max(1, Number(reviewDays) || 1),
      signed: true,
    });
  });

  if (!project || !agreement) return null;

  const step = AGREEMENT_STEPS[stepIndex];
  const stepId = step.id as AgreementStepId;
  const isLast = stepIndex === AGREEMENT_STEPS.length - 1;
  const stepBlocked = stepId === "differences" && unresolvedDifferences.length > 0;
  const canSign = confirmed.length >= AGREEMENT_STEPS.length - 1 && unresolvedDifferences.length === 0;

  const markConfirmed = () => {
    setConfirmed((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
  };

  const goNext = () => {
    if (stepBlocked) return;
    markConfirmed();
    setStepIndex((prev) => Math.min(prev + 1, AGREEMENT_STEPS.length - 1));
  };

  const renderStep = () => {
    switch (stepId) {
      case "summary":
        return (
          <DetailGrid
            items={[
              { label: "Project", value: project.title },
              { label: "Client", value: project.clientCompany ?? project.clientName },
              { label: "Site", value: project.brief.siteLocation },
              { label: "Property type", value: project.brief.projectType },
              { label: "Appointment", value: APPOINTMENT_META[agreement.appointment].label },
              { label: "Brief submitted", value: new Date(project.brief.submittedAt).toLocaleDateString("en-NG") },
            ]}
          />
        );

      case "scope":
        return (
          <>
            <p className="ap-body-text">
              Okumagba Design Studio is appointed to produce the architectural design set described
              below. {APPOINTMENT_META[agreement.appointment].hint}
            </p>
            <ul className="ap-tick-list">
              {agreement.deliverables.map((item) => (
                <li key={item}>
                  <CheckCircle size={15} weight="fill" /> {item}
                </li>
              ))}
            </ul>
          </>
        );

      case "differences":
        return agreement.differences.length === 0 ? (
          <Notice tone="success" icon={<CheckCircle size={16} weight="fill" />}>
            The brief and the accepted proposal agree on every point. Nothing to resolve.
          </Notice>
        ) : (
          <div className="ap-difference-list">
            {agreement.differences.map((difference) => (
              <div key={difference.id} className="ap-difference">
                <h4>{difference.topic}</h4>
                <div className="ap-difference-cols">
                  <div>
                    <span>Client brief</span>
                    <p>{difference.briefSays}</p>
                  </div>
                  <div>
                    <span>Accepted proposal</span>
                    <p>{difference.proposalSays}</p>
                  </div>
                </div>
                <label className="ap-field">
                  <span>Agreed resolution</span>
                  <input
                    value={resolutions[difference.id] ?? ""}
                    onChange={(event) =>
                      setResolutions((prev) => ({ ...prev, [difference.id]: event.target.value }))
                    }
                    placeholder="State what both parties agreed."
                  />
                </label>
              </div>
            ))}
            {unresolvedDifferences.length > 0 && (
              <Notice tone="warning" icon={<WarningCircle size={16} weight="bold" />}>
                {plural(unresolvedDifferences.length, "difference")} still unresolved. The agreement
                cannot be signed until every one has an agreed resolution.
              </Notice>
            )}
          </div>
        );

      case "deliverables":
        return (
          <ul className="ap-tick-list">
            {agreement.deliverables.map((item) => (
              <li key={item}>
                <CheckCircle size={15} weight="fill" /> {item}
              </li>
            ))}
          </ul>
        );

      case "revisions":
        return (
          <>
            <label className="ap-field">
              <span>Included revision rounds</span>
              <input
                type="number"
                min={0}
                value={revisions}
                onChange={(event) => setRevisions(event.target.value)}
              />
            </label>
            <Notice tone="info">
              Once the included rounds are used, further revisions may require a fee and a timeline
              adjustment. Amana tracks the count automatically.
            </Notice>
          </>
        );

      case "fees":
        return (
          <>
            <DetailGrid
              items={[
                { label: "Total design fee", value: formatNaira(agreement.totalDesignFee) },
                { label: "Milestones", value: project.payments.length },
              ]}
            />
            <ul className="ap-milestone-list">
              {project.payments.map((milestone) => (
                <li key={milestone.id}>
                  <span>{milestone.name}</span>
                  <strong>{formatNaira(milestone.amount)}</strong>
                </li>
              ))}
            </ul>
          </>
        );

      case "timeline":
        return (
          <div className="ap-form-grid">
            <label className="ap-field">
              <span>Design programme (weeks)</span>
              <input
                type="number"
                min={1}
                value={timelineWeeks}
                onChange={(event) => setTimelineWeeks(event.target.value)}
              />
            </label>
            <label className="ap-field">
              <span>Client review period (days)</span>
              <input
                type="number"
                min={1}
                value={reviewDays}
                onChange={(event) => setReviewDays(event.target.value)}
              />
              <small className="ap-field-hint">
                Approvals become overdue once this period passes.
              </small>
            </label>
          </div>
        );

      case "authority":
        return (
          <>
            <label className="ap-field">
              <span>Final decision-maker</span>
              <input
                value={decisionMaker}
                onChange={(event) => setDecisionMaker(event.target.value)}
                placeholder="Full name"
              />
            </label>
            <Notice tone="info">
              Comments from other family members or representatives stay advisory. Only the named
              decision-maker can issue binding instructions.
            </Notice>
          </>
        );

      case "exclusions":
        return (
          <>
            <p className="ap-body-text">
              This appointment is <strong>design only</strong>. The following are explicitly not
              included:
            </p>
            <ul className="ap-tick-list ap-tick-list--exclusion">
              {(agreement.exclusions.length > 0 ? agreement.exclusions : DESIGN_ONLY_EXCLUSIONS).map(
                (exclusion) => (
                  <li key={exclusion}>
                    <X size={14} weight="bold" /> {exclusion}
                  </li>
                ),
              )}
            </ul>
          </>
        );

      case "sign":
        return (
          <>
            <DetailGrid
              items={[
                { label: "Appointment", value: APPOINTMENT_META[agreement.appointment].label },
                { label: "Total design fee", value: formatNaira(agreement.totalDesignFee) },
                { label: "Included revisions", value: revisions },
                { label: "Design timeline", value: `${timelineWeeks} weeks` },
                { label: "Client review period", value: `${reviewDays} days` },
                { label: "Final decision-maker", value: decisionMaker || project.clientName },
                { label: "Deliverables", value: `${agreement.deliverables.length} items` },
                { label: "Excluded services", value: `${agreement.exclusions.length} items` },
              ]}
            />
            {!canSign && (
              <Notice tone="warning" icon={<WarningCircle size={16} weight="bold" />}>
                Confirm every step before signing.
                {unresolvedDifferences.length > 0 &&
                  ` ${plural(unresolvedDifferences.length, "difference")} still needs a resolution.`}
              </Notice>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agreement-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>

        <header className="ap-modal-head">
          <span className="ap-modal-eyebrow">Selected — agreement required</span>
          <h2 id="agreement-title">{project.title}</h2>
          <p className="ap-modal-sub">
            Amana has combined the client brief, your accepted proposal and the agreed clarifications.
          </p>
        </header>

        <div className="ap-agreement-layout">
          <ol className="ap-agreement-steps">
            {AGREEMENT_STEPS.map((item, index) => {
              const done = confirmed.includes(item.id as AgreementStepId);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`ap-agreement-step${index === stepIndex ? " ap-agreement-step--active" : ""}${
                      done ? " ap-agreement-step--done" : ""
                    }`}
                    onClick={() => setStepIndex(index)}
                  >
                    {done ? (
                      <CheckCircle size={16} weight="fill" />
                    ) : (
                      <Circle size={16} weight="bold" />
                    )}
                    <span>
                      <strong>
                        {index + 1}. {item.title}
                      </strong>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="ap-agreement-panel">
            <h3>{step.title}</h3>
            <p className="ap-agreement-panel-sub">{step.description}</p>
            <div className="ap-agreement-panel-body">{renderStep()}</div>
          </div>
        </div>

        <div className="ap-modal-actions ap-modal-actions--spread">
          <button
            type="button"
            className="ap-btn-ghost"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
          >
            <ArrowLeft size={15} weight="bold" /> Back
          </button>
          <div className="ap-modal-actions-right">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Save & close
            </button>
            {isLast ? (
              <Button
                type="button"
                className="ap-btn-primary"
                onClick={handleSign}
                disabled={!canSign}
                loading={signing}
                loadingLabel="Signing…"
              >
                Review and sign
              </Button>
            ) : (
              <button
                type="button"
                className="ap-btn-primary"
                onClick={goNext}
                disabled={stepBlocked}
                title={stepBlocked ? "Resolve every difference to continue." : undefined}
              >
                Confirm & continue <ArrowRight size={15} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
