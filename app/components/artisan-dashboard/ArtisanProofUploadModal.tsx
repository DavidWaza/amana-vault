"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Camera,
  Image,
  UploadSimple,
  Trash,
  Warning,
  CheckCircle,
} from "phosphor-react";
import type { ArtisanJob } from "./types";

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/", "video/"];

type ProofPreview = {
  id: string;
  file: File;
  previewUrl: string;
};

type ArtisanProofUploadModalProps = {
  job: ArtisanJob | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (jobId: string, files: File[]) => Promise<void> | void;
};

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.some((type) => file.type.startsWith(type));
}

export default function ArtisanProofUploadModal({
  job,
  open,
  onClose,
  onSubmit,
}: ArtisanProofUploadModalProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<ProofPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setSubmitting(false);
      setSuccess(false);
      return;
    }

    setPreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setError(null);
    setSubmitting(false);
    setSuccess(false);
  }, [open, job?.id]);

  if (!open || !job) return null;

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const next: ProofPreview[] = [];
    let nextError: string | null = null;

    for (const file of Array.from(files)) {
      if (previews.length + next.length >= MAX_FILES) {
        nextError = `You can upload up to ${MAX_FILES} photos or videos.`;
        break;
      }

      if (!isAcceptedFile(file)) {
        nextError = "Only photos and videos are supported.";
        continue;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        nextError = `Each file must be under ${MAX_FILE_SIZE_MB}MB.`;
        continue;
      }

      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (next.length > 0) {
      setPreviews((prev) => [...prev, ...next]);
    }
    setError(nextError);
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (previews.length === 0) {
      setError("Add at least one photo or video before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(
        job.id,
        previews.map((item) => item.file),
      );
      setSuccess(true);
      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="adash-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="adash-modal adash-modal--proof"
        role="dialog"
        aria-labelledby="proof-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <h3 id="proof-upload-title">Upload proof of work</h3>
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

        <p className="adash-proof-intro">
          Show the client your completed work. Take a fresh photo on site or
          choose existing shots from your camera roll.
        </p>

        <div className="adash-proof-actions">
          <button
            type="button"
            className="adash-proof-action-btn"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={22} weight="bold" />
            <span>
              <strong>Take photo</strong>
              <small>Opens your phone camera</small>
            </span>
          </button>

          <button
            type="button"
            className="adash-proof-action-btn"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Image size={22} weight="bold" />
            <span>
              <strong>Choose from gallery</strong>
              <small>Camera roll or photo library</small>
            </span>
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="adash-proof-input"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="adash-proof-input"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {previews.length > 0 && (
          <div className="adash-proof-preview-grid">
            {previews.map((item) => (
              <figure key={item.id} className="adash-proof-preview">
                {item.file.type.startsWith("video/") ? (
                  <video src={item.previewUrl} controls muted playsInline />
                ) : (
                  <img src={item.previewUrl} alt={item.file.name} />
                )}
                <button
                  type="button"
                  className="adash-proof-remove"
                  onClick={() => removePreview(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <Trash size={14} weight="bold" />
                </button>
              </figure>
            ))}
          </div>
        )}

        <p className="adash-proof-hint">
          JPG, PNG, MP4 · Up to {MAX_FILE_SIZE_MB}MB each · {MAX_FILES} files max
        </p>

        {error && (
          <p className="adash-field-error adash-proof-error" role="alert">
            <Warning size={16} weight="bold" />
            {error}
          </p>
        )}

        {success && (
          <p className="adash-proof-success" role="status">
            <CheckCircle size={18} weight="fill" />
            Proof uploaded. Waiting for client approval.
          </p>
        )}

        <div className="adash-modal-actions">
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={handleSubmit}
            disabled={submitting || success || previews.length === 0}
          >
            <UploadSimple size={16} weight="bold" />
            {submitting ? "Uploading..." : "Submit proof"}
          </button>
        </div>
      </div>
    </div>
  );
}
