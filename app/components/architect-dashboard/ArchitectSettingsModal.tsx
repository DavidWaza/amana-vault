"use client";

import { X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { useArchitectProfile } from "./ArchitectProfileProvider";

type ArchitectSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ArchitectSettingsModal({ open, onClose }: ArchitectSettingsModalProps) {
  const { profile, setProfile } = useArchitectProfile();

  const [handleSubmit, saveLoading] = useAsyncAction((e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  });

  if (!open) return null;

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="ap-modal ap-modal--wide" role="dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ap-modal-close" onClick={onClose}>
          <X size={20} weight="bold" />
        </button>
        <h2>Studio Settings</h2>
        <form className="ap-settings-form" onSubmit={handleSubmit}>
          <label>
            Studio Name
            <input
              value={profile.studioName}
              onChange={(e) => setProfile((p) => ({ ...p, studioName: e.target.value }))}
            />
          </label>
          <label>
            Contact Name
            <input
              value={profile.contactName}
              onChange={(e) => setProfile((p) => ({ ...p, contactName: e.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </label>
          <label>
            Location
            <input
              value={profile.location}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
            />
          </label>
          <label>
            Bio
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            />
          </label>
          <div className="ap-modal-actions">
            <button type="button" className="ap-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <Button
              type="submit"
              className="ap-btn-primary"
              loading={saveLoading}
              loadingLabel="Saving…"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
