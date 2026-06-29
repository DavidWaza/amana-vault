"use client";

import { CheckCircle } from "phosphor-react";
import type { BriefTrailStep } from "../submission-trail";

type SubmissionTrailPreviewProps = {
  steps: BriefTrailStep[];
  compact?: boolean;
};

export default function SubmissionTrailPreview({
  steps,
  compact = false,
}: SubmissionTrailPreviewProps) {
  const visible = compact ? steps.slice(0, 4) : steps;

  return (
    <ol className={`bj-trail${compact ? " bj-trail--compact" : ""}`}>
      {visible.map((step, index) => (
        <li key={step.id} className="bj-trail-step">
          <span className="bj-trail-marker" aria-hidden>
            <CheckCircle size={14} weight="fill" />
          </span>
          <div>
            <strong>{step.label}</strong>
            <span>{step.value}</span>
          </div>
        </li>
      ))}
      {!compact && (
        <li className="bj-trail-step bj-trail-step--published">
          <span className="bj-trail-marker" aria-hidden>
            <CheckCircle size={14} weight="fill" />
          </span>
          <div>
            <strong>Published</strong>
            <span>Visible on the architect marketplace</span>
          </div>
        </li>
      )}
      {compact && steps.length > 4 && (
        <li className="bj-trail-more">+{steps.length - 4} more steps in your brief</li>
      )}
    </ol>
  );
}
