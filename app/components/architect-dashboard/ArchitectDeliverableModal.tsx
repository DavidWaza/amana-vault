"use client";

import { useEffect, useRef, useState } from "react";
import { FileArrowUp, LockSimple, Trash, X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import {
  ACCEPTED_FILE_ACCEPT_ATTR,
  ACCEPTED_FILE_FORMATS,
  DELIVERABLE_STATUS_META,
} from "./constants";
import { Notice, StatusPill } from "./ArchitectPrimitives";
import { resolveDeliverableStatus, revisionsExhausted } from "./portal-utils";
import { formatDueLabel } from "./utils";
import type { ArchitectProject, Deliverable, DeliverableFile } from "./types";

type ArchitectDeliverableModalProps = {
  project: ArchitectProject | null;
  deliverable: Deliverable | null;
  onClose: () => void;
  onSubmit: (project: ArchitectProject, deliverable: Deliverable, files: DeliverableFile[], note: string) => void;
};

const MAX_FILE_MB = 50;

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function extensionOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

/**
 * Upload flow for a single deliverable. Locked deliverables are read-only —
 * the modal explains the dependency rather than silently disabling the button.
 */
export default function ArchitectDeliverableModal({
  project,
  deliverable,
  onClose,
  onSubmit,
}: ArchitectDeliverableModalProps) {
  const [files, setFiles] = useState<DeliverableFile[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!deliverable) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deliverable, onClose]);

  const [handleSubmit, submitting] = useAsyncAction(() => {
    if (!project || !deliverable || files.length === 0) return;
    onSubmit(project, deliverable, files, note.trim());
  });

  if (!project || !deliverable) return null;

  const status = resolveDeliverableStatus(deliverable);
  const statusMeta = DELIVERABLE_STATUS_META[status];
  const locked = status === "locked";
  const isRevision = deliverable.revisionRound != null && deliverable.revisionRound > 0;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted: DeliverableFile[] = [];
    let rejected = "";

    Array.from(fileList).forEach((file) => {
      const extension = extensionOf(file.name);
      if (!ACCEPTED_FILE_FORMATS.includes(extension as (typeof ACCEPTED_FILE_FORMATS)[number])) {
        rejected = `${file.name} is not an accepted format.`;
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        rejected = `${file.name} is larger than ${MAX_FILE_MB} MB.`;
        return;
      }
      accepted.push({
        id: `file-${Date.now()}-${accepted.length}`,
        name: file.name,
        format: extension,
        sizeLabel: formatSize(file.size),
        uploadedAt: new Date().toISOString(),
      });
    });

    setError(rejected || null);
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
  };

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deliverable-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>

        <header className="ap-modal-head">
          <span className="ap-modal-eyebrow">{project.title}</span>
          <h2 id="deliverable-title">{deliverable.name}</h2>
          <p className="ap-modal-sub">
            <StatusPill label={statusMeta.label} tone={statusMeta.tone} size="sm" />
            {deliverable.dueDate && <> · {formatDueLabel(deliverable.dueDate)}</>}
            {isRevision && <> · Revision round {deliverable.revisionRound}</>}
          </p>
        </header>

        <div className="ap-modal-body">
          {locked ? (
            <Notice tone="info" icon={<LockSimple size={16} weight="bold" />}>
              This deliverable is locked. {deliverable.lockedReason ?? "An earlier stage must be approved first."}
            </Notice>
          ) : (
            <>
              {isRevision && revisionsExhausted(project) && (
                <Notice tone="warning">
                  The included revisions on this project are used up. Additional revisions may
                  require a fee and a timeline adjustment — agree this with the client before
                  uploading.
                </Notice>
              )}

              <button
                type="button"
                className="ap-dropzone"
                onClick={() => inputRef.current?.click()}
              >
                <FileArrowUp size={26} weight="bold" />
                <strong>Choose design files</strong>
                <span>
                  {ACCEPTED_FILE_FORMATS.join(" · ")} · up to {MAX_FILE_MB} MB each
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILE_ACCEPT_ATTR}
                className="ap-visually-hidden"
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />

              {error && <Notice tone="danger">{error}</Notice>}

              {files.length > 0 && (
                <ul className="ap-file-list">
                  {files.map((file) => (
                    <li key={file.id}>
                      <div>
                        <strong>{file.name}</strong>
                        <span>
                          {file.format} · {file.sizeLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-btn--danger"
                        onClick={() => setFiles((prev) => prev.filter((item) => item.id !== file.id))}
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash size={15} weight="bold" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {deliverable.files.length > 0 && (
                <section className="ap-modal-section">
                  <h3>Previously submitted</h3>
                  <ul className="ap-file-list ap-file-list--muted">
                    {deliverable.files.map((file) => (
                      <li key={file.id}>
                        <div>
                          <strong>{file.name}</strong>
                          <span>
                            {file.format} · {file.sizeLabel}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <label className="ap-field ap-field--wide">
                <span>Note to the client (optional)</span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Summarise what changed in this submission."
                />
              </label>
            </>
          )}
        </div>

        <div className="ap-modal-actions">
          <button type="button" className="ap-btn-outline" onClick={onClose}>
            {locked ? "Close" : "Cancel"}
          </button>
          {!locked && (
            <Button
              type="button"
              className="ap-btn-primary"
              onClick={handleSubmit}
              disabled={files.length === 0}
              loading={submitting}
              loadingLabel="Submitting…"
            >
              Submit for client review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
