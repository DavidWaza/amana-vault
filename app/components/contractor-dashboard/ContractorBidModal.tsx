"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Receipt, Info } from "phosphor-react";
import { bidTotal, TEAM_ROLE_LABELS } from "./portal-utils";
import { formatNaira } from "./utils";
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
import type { MarketplaceProject, TeamMember } from "./types";

export type BidDraft = {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  contractorFee: number;
  timelineWeeks: number;
  teamMemberIds: string[];
  notes: string;
};

type ContractorBidModalProps = {
  project: MarketplaceProject | null;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSubmit: (project: MarketplaceProject, draft: BidDraft) => void;
};

const EMPTY: BidDraft = {
  materialCost: 0,
  laborCost: 0,
  equipmentCost: 0,
  contractorFee: 0,
  timelineWeeks: 0,
  teamMemberIds: [],
  notes: "",
};

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  return (
    <label className={ctField}>
      <span className={ctLabel}>{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-[0.9rem]">₦</span>
        <input
          className={`${ctInput} pl-7`}
          type="number"
          min={0}
          inputMode="numeric"
          value={value === 0 ? "" : value}
          placeholder={placeholder ?? "0"}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
    </label>
  );
}

export default function ContractorBidModal({
  project,
  teamMembers,
  onClose,
  onSubmit,
}: ContractorBidModalProps) {
  const [draft, setDraft] = useState<BidDraft>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) setDraft(EMPTY);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  const total = useMemo(() => bidTotal(draft), [draft]);
  const valid = total > 0 && draft.timelineWeeks > 0;

  if (!project) return null;

  const toggleMember = (id: string) =>
    setDraft((d) => ({
      ...d,
      teamMemberIds: d.teamMemberIds.includes(id)
        ? d.teamMemberIds.filter((m) => m !== id)
        : [...d.teamMemberIds, id],
    }));

  const handleSubmit = () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    onSubmit(project, draft);
    setSubmitting(false);
  };

  return (
    <div className={ctModalOverlay} role="presentation" onClick={onClose}>
      <div
        className={ctModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bid-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={ctModalHeader}>
          <div>
            <h3 id="bid-title" className="m-0 text-[1.2rem] font-black text-green">
              Submit a Bid
            </h3>
            <p className="m-0 mt-1 text-[0.88rem] text-muted">{project.name}</p>
          </div>
          <button type="button" className={ctModalClose} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <p className="m-0 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-[12px] bg-contractor-soft border border-solid border-contractor-line text-[0.82rem] text-contractor leading-[1.5]">
          <Info size={16} weight="bold" className="shrink-0 mt-[2px]" />
          Transparent pricing builds client trust before the vault is funded. Break down every cost.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Material Cost" value={draft.materialCost} onChange={(n) => setDraft((d) => ({ ...d, materialCost: n }))} />
          <NumberField label="Labor Cost" value={draft.laborCost} onChange={(n) => setDraft((d) => ({ ...d, laborCost: n }))} />
          <NumberField label="Equipment Cost" value={draft.equipmentCost} onChange={(n) => setDraft((d) => ({ ...d, equipmentCost: n }))} />
          <NumberField label="Contractor Fee" value={draft.contractorFee} onChange={(n) => setDraft((d) => ({ ...d, contractorFee: n }))} />
        </div>

        <label className={`${ctField} mt-3`}>
          <span className={ctLabel}>Timeline (weeks)</span>
          <input
            className={ctInput}
            type="number"
            min={1}
            inputMode="numeric"
            value={draft.timelineWeeks === 0 ? "" : draft.timelineWeeks}
            placeholder={`Client estimate: ${project.timelineWeeks} weeks`}
            onChange={(e) => setDraft((d) => ({ ...d, timelineWeeks: Math.max(0, Number(e.target.value) || 0) }))}
          />
        </label>

        <div className={`${ctField} mt-3`}>
          <span className={ctLabel}>Assign Team</span>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((m) => {
              const active = draft.teamMemberIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`px-3 py-1.5 rounded-full text-[0.78rem] font-bold border border-solid transition-all ${
                    active
                      ? "bg-contractor text-white border-contractor"
                      : "bg-white text-muted border-line hover:border-contractor2"
                  }`}
                >
                  {m.name.split(" ").slice(-1)[0]} · {TEAM_ROLE_LABELS[m.role]}
                </button>
              );
            })}
          </div>
        </div>

        <label className={`${ctField} mt-3`}>
          <span className={ctLabel}>Notes to Client</span>
          <textarea
            className={`${ctInput} min-h-[5rem] resize-y`}
            rows={3}
            value={draft.notes}
            placeholder="Assumptions, phasing, warranty, or anything the client should know..."
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          />
        </label>

        {/* Live total */}
        <div className="mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] bg-[linear-gradient(135deg,var(--vault-dark),var(--contractor))] text-white">
          <span className="inline-flex items-center gap-2 text-[0.85rem] font-bold">
            <Receipt size={18} weight="bold" /> Total Bid
          </span>
          <strong className="text-[1.3rem] font-black">{formatNaira(total)}</strong>
        </div>

        <div className={ctModalActions}>
          <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`${ctBtn} ${ctBtnPrimary}`}
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            Submit Bid
          </button>
        </div>
      </div>
    </div>
  );
}
