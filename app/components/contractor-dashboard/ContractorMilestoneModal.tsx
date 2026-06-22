"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, Image as ImageIcon, Trash, UploadSimple, Warning, CheckCircle } from "phosphor-react";
import { STAGE_LABELS } from "./portal-utils";
import { formatNaira } from "./utils";
import {
  ctBtn,
  ctBtnGhost,
  ctBtnPrimary,
  ctField,
  ctFieldError,
  ctLabel,
  ctModal,
  ctModalActions,
  ctModalClose,
  ctModalHeader,
  ctModalOverlay,
} from "./ui";
import type { ContractorProject } from "./types";

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 10;

type ProofPreview = { id: string; file: File; previewUrl: string };

type ContractorMilestoneModalProps = {
  project: ContractorProject | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (projectId: string, milestoneId: string, fileCount: number) => void;
};

export default function ContractorMilestoneModal({
  project,
  open,
  onClose,
  onSubmit,
}: ContractorMilestoneModalProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [milestoneId, setMilestoneId] = useState<string>("");
  const [previews, setPreviews] = useState<ProofPreview[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Submittable milestones: whatever is in progress or pending next.
  const submittable =
    project?.milestones.filter((m) => m.status === "in_progress" || m.status === "pending") ?? [];

  useEffect(() => {
    if (open && project) {
      const first =
        project.milestones.find((m) => m.status === "in_progress") ??
        project.milestones.find((m) => m.status === "pending");
      setMilestoneId(first?.id ?? "");
      setNote("");
      setError(null);
      setSuccess(false);
      return;
    }
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !project) return null;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: ProofPreview[] = [];
    let err: string | null = null;
    for (const file of Array.from(files)) {
      if (previews.length + next.length >= MAX_FILES) {
        err = `Up to ${MAX_FILES} files.`;
        break;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        err = "Only photos and videos are supported.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        err = `Each file must be under ${MAX_FILE_SIZE_MB}MB.`;
        continue;
      }
      next.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) });
    }
    if (next.length) setPreviews((p) => [...p, ...next]);
    setError(err);
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const t = prev.find((p) => p.id === id);
      if (t) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!milestoneId) {
      setError("Select a milestone to submit.");
      return;
    }
    if (previews.length === 0) {
      setError("Add at least one photo or video as proof.");
      return;
    }
    onSubmit(project.id, milestoneId, previews.length);
    setSuccess(true);
    window.setTimeout(onClose, 1200);
  };

  const selected = project.milestones.find((m) => m.id === milestoneId);

  return (
    <div className={ctModalOverlay} role="presentation" onClick={onClose}>
      <div className={ctModal} role="dialog" aria-modal="true" aria-labelledby="ms-title" onClick={(e) => e.stopPropagation()}>
        <div className={ctModalHeader}>
          <div>
            <h3 id="ms-title" className="m-0 text-[1.2rem] font-black text-green">Submit Milestone Proof</h3>
            <p className="m-0 mt-1 text-[0.88rem] text-muted">{project.title}</p>
          </div>
          <button type="button" className={ctModalClose} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <label className={ctField}>
          <span className={ctLabel}>Milestone / Stage</span>
          <select
            className="w-full border border-solid border-line rounded-[14px] px-4 py-[0.9rem] text-base bg-white text-text outline-none focus:border-contractor2"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
          >
            {submittable.length === 0 && <option value="">No submittable milestone</option>}
            {submittable.map((m) => (
              <option key={m.id} value={m.id}>
                {STAGE_LABELS[m.stage]} — {m.label} ({formatNaira(m.amount)})
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <p className="m-0 mt-2 text-[0.8rem] text-muted">
            On submit, <strong className="text-green">{selected.label}</strong> moves to{" "}
            <strong className="text-[#b7791f]">Under Review</strong> for independent inspection before release.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-3 p-4 rounded-[16px] border border-solid border-line bg-contractor-soft text-contractor text-left"
          >
            <Camera size={22} weight="bold" />
            <span>
              <strong className="block text-[0.9rem]">Take photo</strong>
              <small className="block text-[0.76rem] text-muted font-semibold">On-site camera</small>
            </span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex items-center gap-3 p-4 rounded-[16px] border border-solid border-line bg-contractor-soft text-contractor text-left"
          >
            <ImageIcon size={22} weight="bold" />
            <span>
              <strong className="block text-[0.9rem]">From gallery</strong>
              <small className="block text-[0.76rem] text-muted font-semibold">Photos & videos</small>
            </span>
          </button>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <input ref={galleryRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

        {previews.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2 mt-3">
            {previews.map((p) => (
              <figure key={p.id} className="relative m-0 aspect-square rounded-[12px] overflow-hidden border border-solid border-line bg-[#f8fafc]">
                {p.file.type.startsWith("video/") ? (
                  <video src={p.previewUrl} muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removePreview(p.id)}
                  aria-label="Remove"
                  className="absolute top-1 right-1 w-7 h-7 grid place-items-center rounded-full border-0 bg-[rgba(15,23,42,0.72)] text-white"
                >
                  <Trash size={13} weight="bold" />
                </button>
              </figure>
            ))}
          </div>
        )}

        <label className={`${ctField} mt-3`}>
          <span className={ctLabel}>Note (optional)</span>
          <textarea
            className="w-full border border-solid border-line rounded-[14px] px-4 py-[0.9rem] text-base bg-white text-text outline-none focus:border-contractor2 min-h-[4rem] resize-y"
            rows={2}
            value={note}
            placeholder="What was completed for this milestone?"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <p className="m-0 mt-2 text-[0.74rem] text-muted">
          Site photos, videos, receipts, reports · JPG/PNG/MP4 · up to {MAX_FILE_SIZE_MB}MB each
        </p>

        {error && (
          <p className={`${ctFieldError} flex items-center gap-2 mt-2`} role="alert">
            <Warning size={15} weight="bold" /> {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 mt-2 text-[0.85rem] font-bold text-green2" role="status">
            <CheckCircle size={16} weight="fill" /> Submitted for inspection.
          </p>
        )}

        <div className={ctModalActions}>
          <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>Cancel</button>
          <button type="button" className={`${ctBtn} ${ctBtnPrimary}`} onClick={handleSubmit} disabled={success || submittable.length === 0}>
            <UploadSimple size={16} weight="bold" /> Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
