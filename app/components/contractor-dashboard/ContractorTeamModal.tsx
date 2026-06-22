"use client";

import { useEffect, useState } from "react";
import { X, UsersThree } from "phosphor-react";
import { TEAM_ROLE_LABELS, TEAM_PERMISSION_LABELS } from "./portal-utils";
import {
  ctBtn,
  ctBtnGhost,
  ctBtnPrimary,
  ctField,
  ctInput,
  ctLabel,
  ctModal,
  ctModalActions,
  ctModalClose,
  ctModalHeader,
  ctModalOverlay,
} from "./ui";
import type { ContractorProject, TeamPermission, TeamRole } from "./types";
import {
  isValidPhoneDigits,
  normalizePhoneInput,
  PHONE_DIGIT_LENGTH,
} from "@/app/lib/phone";

export type TeamMemberDraft = {
  name: string;
  role: TeamRole;
  phone: string;
  permissions: TeamPermission[];
  assignedProjectId?: string;
};

type ContractorTeamModalProps = {
  open: boolean;
  projects: ContractorProject[];
  onClose: () => void;
  onSubmit: (draft: TeamMemberDraft) => void;
};

const ROLES = Object.keys(TEAM_ROLE_LABELS) as TeamRole[];
const PERMISSIONS = Object.keys(TEAM_PERMISSION_LABELS) as TeamPermission[];

const EMPTY: TeamMemberDraft = {
  name: "",
  role: "engineer",
  phone: "",
  permissions: ["upload_proof"],
  assignedProjectId: undefined,
};

export default function ContractorTeamModal({ open, projects, onClose, onSubmit }: ContractorTeamModalProps) {
  const [draft, setDraft] = useState<TeamMemberDraft>(EMPTY);

  useEffect(() => {
    if (open) setDraft(EMPTY);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const valid = draft.name.trim().length >= 2 && isValidPhoneDigits(draft.phone);

  const togglePerm = (p: TeamPermission) =>
    setDraft((d) => ({
      ...d,
      permissions: d.permissions.includes(p)
        ? d.permissions.filter((x) => x !== p)
        : [...d.permissions, p],
    }));

  return (
    <div className={ctModalOverlay} role="presentation" onClick={onClose}>
      <div className={ctModal} role="dialog" aria-modal="true" aria-labelledby="team-title" onClick={(e) => e.stopPropagation()}>
        <div className={ctModalHeader}>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-contractor-soft text-contractor2">
              <UsersThree size={20} weight="bold" />
            </span>
            <div>
              <h3 id="team-title" className="m-0 text-[1.2rem] font-black text-green">Add Team Member</h3>
              <p className="m-0 text-[0.82rem] text-muted">Create a sub-account with scoped access.</p>
            </div>
          </div>
          <button type="button" className={ctModalClose} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="grid gap-3">
          <label className={ctField}>
            <span className={ctLabel}>Full Name</span>
            <input
              className={ctInput}
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Musa Danladi"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className={ctField}>
              <span className={ctLabel}>Role</span>
              <select
                className={ctInput}
                value={draft.role}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as TeamRole }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {TEAM_ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Phone</span>
              <input
                className={ctInput}
                type="tel"
                inputMode="numeric"
                value={draft.phone}
                maxLength={PHONE_DIGIT_LENGTH}
                onChange={(e) => setDraft((d) => ({ ...d, phone: normalizePhoneInput(e.target.value) }))}
                placeholder="08030000000"
              />
            </label>
          </div>

          <label className={ctField}>
            <span className={ctLabel}>Assign to Project</span>
            <select
              className={ctInput}
              value={draft.assignedProjectId ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, assignedProjectId: e.target.value || undefined }))}
            >
              <option value="">Unassigned</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <div className={ctField}>
            <span className={ctLabel}>Permissions</span>
            <div className="grid gap-2">
              {PERMISSIONS.map((p) => {
                const on = draft.permissions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePerm(p)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] border border-solid text-[0.85rem] font-bold transition-colors ${
                      on ? "border-contractor2 bg-contractor-soft text-contractor" : "border-line bg-white text-muted"
                    }`}
                  >
                    {TEAM_PERMISSION_LABELS[p]}
                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-contractor2" : "bg-line"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "left-[1.15rem]" : "left-0.5"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="m-0 text-[0.74rem] text-muted">
              Only members with “View financials” can see contract values and vault amounts.
            </p>
          </div>
        </div>

        <div className={ctModalActions}>
          <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>Cancel</button>
          <button type="button" className={`${ctBtn} ${ctBtnPrimary}`} onClick={() => valid && onSubmit(draft)} disabled={!valid}>
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
