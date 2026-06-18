"use client";

import { useEffect, useState } from "react";
import { X } from "phosphor-react";

export type NewProjectDraft = {
  title: string;
  clientName: string;
  location: string;
  contractValue: number;
};

type ArchitectNewProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: NewProjectDraft) => void;
};

export default function ArchitectNewProjectModal({
  open,
  onClose,
  onSubmit,
}: ArchitectNewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [contractValue, setContractValue] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setClientName("");
      setLocation("");
      setContractValue("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const valueNumber = Number(contractValue);
  const canSubmit = title.trim().length > 0 && clientName.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      clientName: clientName.trim(),
      location: location.trim() || "Location TBC",
      contractValue: Number.isFinite(valueNumber) && valueNumber > 0 ? valueNumber : 0,
    });
  };

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ap-modal ap-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>
        <h2 id="new-project-title">New Project</h2>
        <p className="ap-modal-sub">
          Create a draft design project. You can add milestones and invite the client later.
        </p>
        <form className="ap-settings-form" onSubmit={handleSubmit}>
          <label>
            Project Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Okafor Family Duplex"
              required
            />
          </label>
          <label>
            Client Name
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Okafor Family"
              required
            />
          </label>
          <label>
            Location
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Nigeria"
            />
          </label>
          <label>
            Contract Value (₦)
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="3200000"
            />
          </label>
          <div className="ap-modal-actions">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ap-btn-primary" disabled={!canSubmit}>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
