"use client";

import { X, Warning, CheckCircle, Question } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { ClientProject } from "./types";
import { formatNaira } from "./utils";

type MilestoneApprovalModalProps = {
  project: ClientProject | null;
  open: boolean;
  onClose: () => void;
  onApprove: (projectId: string) => void;
  onRequestInfo: (projectId: string) => void;
  onRaiseConcern: (projectId: string) => void;
};

export default function MilestoneApprovalModal({
  project,
  open,
  onClose,
  onApprove,
  onRequestInfo,
  onRaiseConcern,
}: MilestoneApprovalModalProps) {
  if (!open || !project) return null;

  const inspectionMilestone = project.vaultMilestones?.find(
    (m) => m.status === "inspection",
  );
  const amount = project.releaseRequestAmount ?? inspectionMilestone?.amount ?? 0;

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal cdash-approval-modal"
        role="dialog"
        aria-labelledby="approval-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdash-modal-header adash-modal-header">
          <div className="cdash-modal-header-text">
            <p className="adash-eyebrow">Client Approval</p>
            <h3 id="approval-title">
              {inspectionMilestone?.label ?? "Milestone"} — {project.title}
            </h3>
            <p className="adash-modal-subtext">
              Review contractor evidence and the independent inspector report before
              releasing funds.
            </p>
          </div>
          <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="cdash-modal-scroll cdash-approval-body">
          <section className="cdash-approval-section">
            <h4>Contractor evidence</h4>
            <p>{inspectionMilestone?.contractorEvidence ?? "Site photos and progress documentation uploaded by your contractor."}</p>
          </section>

          <section className="cdash-approval-section">
            <h4>Inspector report</h4>
            {inspectionMilestone?.inspectorName && (
              <p className="cdash-approval-inspector">
                Inspector: <strong>{inspectionMilestone.inspectorName}</strong>
              </p>
            )}
            <p>
              {inspectionMilestone?.inspectorReport ??
                "Independent inspection report pending."}
            </p>
            {inspectionMilestone?.inspectionResult === "pass_with_concerns" && (
              <p className="cdash-approval-warning">
                <Warning size={16} weight="bold" />
                Result: Pass with concerns — review notes before approving release.
              </p>
            )}
            {inspectionMilestone?.inspectionResult === "pass" && (
              <p className="cdash-approval-success">
                <CheckCircle size={16} weight="fill" />
                Result: Pass
              </p>
            )}
          </section>

          <div className="cdash-approval-amount">
            <span>Release amount</span>
            <strong>{formatNaira(amount)}</strong>
          </div>
        </div>

        <div className="cdash-modal-footer adash-modal-actions cdash-approval-actions">
          <button
            type="button"
            className="adash-btn adash-btn--secondary"
            onClick={() => onRequestInfo(project.id)}
          >
            <Question size={16} weight="bold" />
            Request more information
          </button>
          <button
            type="button"
            className="adash-btn adash-btn--ghost adash-btn--danger-text"
            onClick={() => onRaiseConcern(project.id)}
          >
            Raise concern
          </button>
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => onApprove(project.id)}
            loadingLabel="Approving…"
          >
            Approve release
          </Button>
        </div>
      </div>
    </div>
  );
}
