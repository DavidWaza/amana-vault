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
import {
  adashBtn,
  adashBtnGhost,
  adashBtnPrimary,
  adashFieldError,
  adashModal,
  adashModalActions,
  adashModalClose,
  adashModalHeader,
  adashModalOverlay,
} from "./ui";

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
      className={adashModalOverlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={adashModal}
        role="dialog"
        aria-labelledby="proof-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={adashModalHeader}>
          <div>
            <h3 id="proof-upload-title" className="m-0 text-[1.2rem] text-green">Upload proof of work</h3>
            <p className="m-0 mt-1 text-[0.9rem] text-muted">{job.title}</p>
          </div>
          <button
            type="button"
            className={adashModalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <p className="m-0 mb-4 text-[0.9rem] leading-[1.6] text-muted">
          Show the client your completed work. Take a fresh photo on site or
          choose existing shots from your camera roll.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            className="flex items-center gap-3 p-4 rounded-[18px] border border-solid border-line bg-soft text-green text-left transition-[border-color,transform] duration-300"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={22} weight="bold" />
            <span>
              <strong className="block text-[0.92rem]">Take photo</strong>
              <small className="block mt-[0.15rem] text-[0.78rem] text-muted font-semibold">Opens your phone camera</small>
            </span>
          </button>

          <button
            type="button"
            className="flex items-center gap-3 p-4 rounded-[18px] border border-solid border-line bg-soft text-green text-left transition-[border-color,transform] duration-300"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Image size={22} weight="bold" />
            <span>
              <strong className="block text-[0.92rem]">Choose from gallery</strong>
              <small className="block mt-[0.15rem] text-[0.78rem] text-muted font-semibold">Camera roll or photo library</small>
            </span>
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
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
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-[0.65rem] mb-[0.85rem]">
            {previews.map((item) => (
              <figure key={item.id} className="relative m-0 aspect-square rounded-[14px] overflow-hidden border border-solid border-line bg-[#f8fafc]">
                {item.file.type.startsWith("video/") ? (
                  <video src={item.previewUrl} controls muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  className="absolute top-[0.35rem] right-[0.35rem] w-7 h-7 border-0 rounded-full bg-[rgba(15,23,42,0.72)] text-white grid place-items-center"
                  onClick={() => removePreview(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <Trash size={14} weight="bold" />
                </button>
              </figure>
            ))}
          </div>
        )}

        <p className="m-0 mb-4 text-[0.78rem] text-muted">
          JPG, PNG, MP4 · Up to {MAX_FILE_SIZE_MB}MB each · {MAX_FILES} files max
        </p>

        {error && (
          <p className={`${adashFieldError} flex items-start gap-[0.45rem] mb-4`} role="alert">
            <Warning size={16} weight="bold" />
            {error}
          </p>
        )}

        {success && (
          <p className="flex items-center gap-2 mb-4 px-4 py-[0.85rem] rounded-[14px] bg-soft border border-solid border-line text-green text-[0.88rem] font-bold" role="status">
            <CheckCircle size={18} weight="fill" />
            Proof uploaded. Waiting for client approval.
          </p>
        )}

        <div className={adashModalActions}>
          <button
            type="button"
            className={`${adashBtn} ${adashBtnGhost}`}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${adashBtn} ${adashBtnPrimary}`}
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
