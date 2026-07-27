"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, ImageSquare, WarningCircle, X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { COMMENTER_ROLE_LABELS, REVISION_RESPONSE_OPTIONS } from "./constants";
import { Notice, StatusPill } from "./ArchitectPrimitives";
import { revisionCounterLabel, revisionsExhausted, revisionsRemaining } from "./portal-utils";
import { formatDueLabel, formatLongDate, plural } from "./utils";
import type { ArchitectProject, RevisionRequest, RevisionResponse } from "./types";

export type RevisionResponsePayload = Record<string, { response: RevisionResponse; note: string }>;

type ArchitectRevisionModalProps = {
  project: ArchitectProject | null;
  revision: RevisionRequest | null;
  onClose: () => void;
  onSubmit: (
    project: ArchitectProject,
    revision: RevisionRequest,
    responses: RevisionResponsePayload,
  ) => void;
};

/**
 * The revision request screen (PRD §16). Every client comment gets an explicit
 * architect response, and comments from anyone other than the named
 * decision-maker are flagged as non-binding.
 */
export default function ArchitectRevisionModal({
  project,
  revision,
  onClose,
  onSubmit,
}: ArchitectRevisionModalProps) {
  // Seeded once per open; the parent keys this modal on the revision id.
  const [responses, setResponses] = useState<RevisionResponsePayload>(() =>
    (revision?.comments ?? []).reduce<RevisionResponsePayload>((acc, comment) => {
      if (comment.response) {
        acc[comment.id] = { response: comment.response, note: comment.responseNote ?? "" };
      }
      return acc;
    }, {}),
  );

  useEffect(() => {
    if (!revision) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [revision, onClose]);

  const answered = useMemo(
    () => (revision ? revision.comments.filter((comment) => responses[comment.id]).length : 0),
    [revision, responses],
  );

  const [handleSubmit, submitting] = useAsyncAction(() => {
    if (!project || !revision) return;
    onSubmit(project, revision, responses);
  });

  if (!project || !revision) return null;

  const allAnswered = answered === revision.comments.length;
  const nonBinding = revision.comments.filter((comment) => !comment.binding);
  const feeRequired = Object.values(responses).some(
    (entry) => entry.response === "additional_fee",
  );

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="revision-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>

        <header className="ap-modal-head">
          <span className="ap-modal-eyebrow">{project.title} · client feedback</span>
          <h2 id="revision-title">{revision.deliverableName}</h2>
          <p className="ap-modal-sub">
            Submitted {formatLongDate(revision.submittedAt)} · Respond by{" "}
            {formatDueLabel(revision.responseDeadline).replace("Due ", "")} ·{" "}
            {plural(revision.comments.length, "comment")}
          </p>
        </header>

        <div className="ap-modal-body">
          <div className="ap-revision-counter">
            <StatusPill
              label={revisionCounterLabel(project)}
              tone={revisionsExhausted(project) ? "warning" : "neutral"}
            />
            <span>
              {revisionsExhausted(project)
                ? "Included revisions are used up."
                : `${plural(revisionsRemaining(project), "round")} remaining.`}
            </span>
          </div>

          {revisionsExhausted(project) && (
            <Notice tone="warning" icon={<WarningCircle size={16} weight="bold" />}>
              Additional revisions may require a fee and timeline adjustment. Mark any request as
              <em> Additional fee required</em> to start that conversation with the client.
            </Notice>
          )}

          {nonBinding.length > 0 && (
            <Notice tone="info" icon={<Info size={16} weight="bold" />}>
              {plural(nonBinding.length, "comment")} came from someone other than the final
              decision-maker ({project.finalDecisionMaker}). Those comments are advisory and do not
              become binding instructions unless {project.finalDecisionMaker} confirms them.
            </Notice>
          )}

          <ul className="ap-comment-list">
            {revision.comments.map((comment) => {
              const current = responses[comment.id];
              return (
                <li
                  key={comment.id}
                  className={`ap-comment${comment.binding ? "" : " ap-comment--advisory"}`}
                >
                  <div className="ap-comment-head">
                    <div>
                      <strong>{comment.submittedBy}</strong>
                      <span className="ap-comment-role">
                        {COMMENTER_ROLE_LABELS[comment.submittedByRole]}
                      </span>
                    </div>
                    {comment.binding ? (
                      <StatusPill label="Binding" tone="action" size="sm" />
                    ) : (
                      <StatusPill label="Advisory only" tone="neutral" size="sm" />
                    )}
                  </div>

                  <p className="ap-comment-text">{comment.text}</p>
                  <p className="ap-comment-change">
                    <strong>Requested change:</strong> {comment.requestedChange}
                  </p>

                  {comment.markupUrl && (
                    <div className="ap-comment-markup">
                      <span
                        className="ap-comment-markup-thumb"
                        style={{ backgroundImage: `url(${comment.markupUrl})` }}
                        role="img"
                        aria-label="Client markup"
                      />
                      <span>
                        <ImageSquare size={13} weight="bold" /> Client markup attached
                      </span>
                    </div>
                  )}

                  <time className="ap-comment-time">{formatLongDate(comment.submittedAt)}</time>

                  <div className="ap-response-options" role="group" aria-label="Your response">
                    {REVISION_RESPONSE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`ap-response-chip ap-response-chip--${option.tone}${
                          current?.response === option.id ? " ap-response-chip--active" : ""
                        }`}
                        title={option.description}
                        aria-pressed={current?.response === option.id}
                        onClick={() =>
                          setResponses((prev) => ({
                            ...prev,
                            [comment.id]: {
                              response: option.id,
                              note: prev[comment.id]?.note ?? "",
                            },
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {current && (
                    <label className="ap-field ap-field--wide">
                      <span>Note to the client (optional)</span>
                      <textarea
                        rows={2}
                        value={current.note}
                        onChange={(event) =>
                          setResponses((prev) => ({
                            ...prev,
                            [comment.id]: { ...prev[comment.id], note: event.target.value },
                          }))
                        }
                        placeholder={
                          current.response === "additional_fee"
                            ? "State the additional fee and the timeline impact."
                            : "Explain your response."
                        }
                      />
                    </label>
                  )}
                </li>
              );
            })}
          </ul>

          {feeRequired && (
            <Notice tone="warning">
              One or more responses require an additional fee. Amana will send the client a variation
              request; work on those items should wait until it is accepted.
            </Notice>
          )}
        </div>

        <div className="ap-modal-actions ap-modal-actions--spread">
          <span className="ap-modal-progress">
            {answered} of {revision.comments.length} answered
          </span>
          <div className="ap-modal-actions-right">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Save & close
            </button>
            <Button
              type="button"
              className="ap-btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered}
              loading={submitting}
              loadingLabel="Sending…"
              title={allAnswered ? undefined : "Respond to every comment before sending."}
            >
              Send responses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
