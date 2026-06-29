"use client";

import { X, CheckCircle } from "phosphor-react";
import type { ProjectBriefTrail } from "./build-journey/submission-trail";

type ProjectBriefTrailModalProps = {
  trail: ProjectBriefTrail | null;
  onClose: () => void;
};

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProjectBriefTrailModal({
  trail,
  onClose,
}: ProjectBriefTrailModalProps) {
  if (!trail) return null;

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal cdash-brief-trail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-trail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cdash-brief-trail-header adash-modal-header">
          <div className="cdash-modal-header-text">
            <p className="adash-eyebrow">Submission trail</p>
            <h2 id="brief-trail-title">{trail.projectName}</h2>
            <p className="cdash-brief-trail-meta">
              Submitted {formatSubmittedAt(trail.submittedAt)}
            </p>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            aria-label="Close submission trail"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <ol className="cdash-brief-trail">
          {trail.steps.map((step, index) => (
            <li key={step.id} className="cdash-brief-trail-step">
              <span className="cdash-brief-trail-marker" aria-hidden>
                <CheckCircle size={16} weight="fill" />
              </span>
              <div className="cdash-brief-trail-body">
                <span className="cdash-brief-trail-step-num">Step {index + 1}</span>
                <strong>{step.label}</strong>
                <p>{step.value}</p>
              </div>
            </li>
          ))}
          <li className="cdash-brief-trail-step cdash-brief-trail-step--published">
            <span className="cdash-brief-trail-marker" aria-hidden>
              <CheckCircle size={16} weight="fill" />
            </span>
            <div className="cdash-brief-trail-body">
              <span className="cdash-brief-trail-step-num">Published</span>
              <strong>Sent to architect marketplace</strong>
              <p>Your brief is visible to verified architects for proposals.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
