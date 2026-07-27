"use client";

import { useEffect, useState } from "react";
import { LockSimple, X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { Notice } from "./ArchitectPrimitives";
import { formatNaira } from "./utils";
import type { AddProjectMode } from "./ArchitectPortalHeader";

/* ================================================================== *
 * Shared shell
 * ================================================================== */

function ModalShell({
  title,
  eyebrow,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="ap-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`ap-modal${wide ? " ap-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} weight="bold" />
        </button>
        <header className="ap-modal-head">
          {eyebrow && <span className="ap-modal-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {subtitle && <p className="ap-modal-sub">{subtitle}</p>}
        </header>
        <div className="ap-modal-body">{children}</div>
        <div className="ap-modal-actions">{footer}</div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Add client project (PRD §6A)
 * ================================================================== */

export type AddProjectDraft = {
  mode: AddProjectMode;
  clientName: string;
  clientPhone: string;
  projectTitle: string;
  location: string;
  designFee: number;
};

const MODE_COPY: Record<AddProjectMode, { title: string; subtitle: string; cta: string }> = {
  invite_client: {
    title: "Invite a client",
    subtitle: "Send an invitation so your client joins Amana and the project is protected.",
    cta: "Send invitation",
  },
  off_platform: {
    title: "Add an existing off-platform client",
    subtitle:
      "Record a client you already work with. Approvals are captured by your studio until they join Amana.",
    cta: "Add client project",
  },
  import: {
    title: "Import an existing design project",
    subtitle: "Bring a project already underway into the portal so its deliverables are tracked.",
    cta: "Import project",
  },
};

export function ArchitectAddProjectModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: AddProjectMode | null;
  onClose: () => void;
  onSubmit: (draft: AddProjectDraft) => void;
}) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [location, setLocation] = useState("");
  const [designFee, setDesignFee] = useState("");

  const feeValue = Number(designFee);
  const phoneOk = mode !== "invite_client" || /^\d{11}$/.test(clientPhone);
  const canSubmit =
    clientName.trim().length > 1 &&
    projectTitle.trim().length > 1 &&
    location.trim().length > 1 &&
    phoneOk;

  const [handleSubmit, submitting] = useAsyncAction(() => {
    if (!mode || !canSubmit) return;
    onSubmit({
      mode,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      projectTitle: projectTitle.trim(),
      location: location.trim(),
      designFee: Number.isFinite(feeValue) && feeValue > 0 ? feeValue : 0,
    });
  });

  if (!mode) return null;
  const copy = MODE_COPY[mode];

  return (
    <ModalShell
      wide
      eyebrow="Add client project"
      title={copy.title}
      subtitle={copy.subtitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ap-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <Button
            type="button"
            className="ap-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            loadingLabel="Saving…"
          >
            {copy.cta}
          </Button>
        </>
      }
    >
      <div className="ap-form-grid">
        <label className="ap-field">
          <span>Client name</span>
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="e.g. Ema Umoh"
          />
        </label>

        {mode === "invite_client" && (
          <label className="ap-field">
            <span>Client phone (11 digits)</span>
            <input
              inputMode="numeric"
              value={clientPhone}
              onChange={(event) =>
                setClientPhone(event.target.value.replace(/\D/g, "").slice(0, 11))
              }
              placeholder="08031234567"
            />
            <small className="ap-field-hint">{clientPhone.length}/11 digits</small>
          </label>
        )}

        <label className="ap-field">
          <span>Project title</span>
          <input
            value={projectTitle}
            onChange={(event) => setProjectTitle(event.target.value)}
            placeholder="e.g. Gwarinpa Duplex"
          />
        </label>

        <label className="ap-field">
          <span>Location</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Gwarinpa, Abuja"
          />
        </label>

        <label className="ap-field">
          <span>Design fee (₦, optional)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={designFee}
            onChange={(event) => setDesignFee(event.target.value)}
            placeholder="3600000"
          />
          {Number.isFinite(feeValue) && feeValue > 0 && (
            <small className="ap-field-hint">{formatNaira(feeValue)}</small>
          )}
        </label>
      </div>

      {mode === "off_platform" && (
        <Notice tone="info">
          Off-platform clients cannot approve deliverables inside Amana. Record their approvals and
          conversation summaries yourself, or invite them to join later.
        </Notice>
      )}
      {mode === "import" && (
        <Notice tone="info">
          Imported projects start at <strong>Brief review</strong>. Add the deliverables you still
          owe so deadlines and payments stay tracked.
        </Notice>
      )}
    </ModalShell>
  );
}

/* ================================================================== *
 * Conversation summary (PRD §19)
 * ================================================================== */

export type ConversationSummaryDraft = {
  date: string;
  participants: string;
  discussion: string;
  decision: string;
  requiredAction: string;
};

export function ArchitectConversationSummaryModal({
  open,
  projectName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onSubmit: (draft: ConversationSummaryDraft) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = useState("");
  const [discussion, setDiscussion] = useState("");
  const [decision, setDecision] = useState("");
  const [requiredAction, setRequiredAction] = useState("");

  const canSubmit =
    participants.trim().length > 1 && discussion.trim().length > 3 && decision.trim().length > 1;

  const [handleSubmit, submitting] = useAsyncAction(() => {
    if (!canSubmit) return;
    onSubmit({
      date: new Date(date).toISOString(),
      participants: participants.trim(),
      discussion: discussion.trim(),
      decision: decision.trim(),
      requiredAction: requiredAction.trim(),
    });
  });

  if (!open) return null;

  return (
    <ModalShell
      wide
      eyebrow={projectName}
      title="Add conversation summary"
      subtitle="Record a phone or video conversation that affected scope. The client can confirm, dispute or add clarification."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ap-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <Button
            type="button"
            className="ap-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            loadingLabel="Saving…"
          >
            Send to client
          </Button>
        </>
      }
    >
      <div className="ap-form-grid">
        <label className="ap-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="ap-field">
          <span>Participants</span>
          <input
            value={participants}
            onChange={(event) => setParticipants(event.target.value)}
            placeholder="e.g. Chidi Okumagba, Ema Umoh"
          />
        </label>
      </div>
      <label className="ap-field ap-field--wide">
        <span>Discussion summary</span>
        <textarea
          rows={3}
          value={discussion}
          onChange={(event) => setDiscussion(event.target.value)}
          placeholder="What was discussed?"
        />
      </label>
      <label className="ap-field ap-field--wide">
        <span>Decision made</span>
        <textarea
          rows={2}
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          placeholder="What was agreed?"
        />
      </label>
      <label className="ap-field ap-field--wide">
        <span>Required action</span>
        <textarea
          rows={2}
          value={requiredAction}
          onChange={(event) => setRequiredAction(event.target.value)}
          placeholder="What happens next, and who does it?"
        />
      </label>
    </ModalShell>
  );
}

/* ================================================================== *
 * Ask a clarification question
 * ================================================================== */

export function ArchitectQuestionModal({
  open,
  subject,
  onClose,
  onSubmit,
}: {
  open: boolean;
  subject: string;
  onClose: () => void;
  onSubmit: (question: string) => void;
}) {
  const [question, setQuestion] = useState("");

  const [handleSubmit, submitting] = useAsyncAction(() => {
    if (question.trim().length < 5) return;
    onSubmit(question.trim());
  });

  if (!open) return null;

  return (
    <ModalShell
      eyebrow={subject}
      title="Ask a clarification question"
      subtitle="Your question goes to the client and is recorded against the brief."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ap-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <Button
            type="button"
            className="ap-btn-primary"
            onClick={handleSubmit}
            disabled={question.trim().length < 5}
            loading={submitting}
            loadingLabel="Sending…"
          >
            Send question
          </Button>
        </>
      }
    >
      <label className="ap-field ap-field--wide">
        <span>Your question</span>
        <textarea
          rows={4}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Is the survey plan the latest version? Does the budget include the boys' quarters?"
        />
      </label>
    </ModalShell>
  );
}

/* ================================================================== *
 * Withdraw funds
 * ================================================================== */

export function ArchitectWithdrawModal({
  open,
  amount,
  blockedReason,
  onClose,
  onConfirm,
}: {
  open: boolean;
  amount: number;
  blockedReason?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [handleConfirm, confirming] = useAsyncAction(() => {
    if (blockedReason) return;
    onConfirm();
  });

  if (!open) return null;

  return (
    <ModalShell
      eyebrow="Amana Vault"
      title="Withdraw earned fees"
      subtitle={
        amount > 0
          ? `${formatNaira(amount)} has been approved by your clients and released from escrow.`
          : "Nothing is available to withdraw yet. Fees appear here once a client approves the milestone behind them."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ap-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <Button
            type="button"
            className="ap-btn-primary"
            onClick={handleConfirm}
            disabled={Boolean(blockedReason) || amount <= 0}
            loading={confirming}
            loadingLabel="Submitting…"
          >
            {amount > 0 ? `Withdraw ${formatNaira(amount)}` : "Withdraw"}
          </Button>
        </>
      }
    >
      {blockedReason ? (
        <Notice tone="warning" icon={<LockSimple size={16} weight="bold" />}>
          {blockedReason}
        </Notice>
      ) : (
        <Notice tone="info" icon={<LockSimple size={16} weight="bold" />}>
          Funds move from the CBN-licensed partner to your verified payout account. Only fees the
          client has already approved can be withdrawn.
        </Notice>
      )}
    </ModalShell>
  );
}
