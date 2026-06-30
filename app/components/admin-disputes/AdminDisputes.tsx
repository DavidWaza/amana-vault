"use client";

import { useMemo, useState } from "react";
import {
  Scales,
  ShieldCheck,
  Paperclip,
  ChatText,
  Warning,
  CheckCircle,
  MapPin,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import { formatNaira } from "../artisan-dashboard/utils";
import {
  DISPUTE_CATEGORY_META,
  DISPUTE_OUTCOME_META,
  describeResolution,
  partyLabel,
} from "../disputes/constants";
import type { DisputeOutcome } from "../disputes/types";
import { MOCK_ADMIN_DISPUTES } from "./mock-data";
import type { AdminDisputeCase } from "./types";

const RULING_OPTIONS: DisputeOutcome[] = [
  "release_artisan",
  "refund_client",
  "split",
];

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDisputes() {
  const [cases, setCases] = useState<AdminDisputeCase[]>(MOCK_ADMIN_DISPUTES);
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_ADMIN_DISPUTES[0]?.id ?? "",
  );
  const [outcome, setOutcome] = useState<DisputeOutcome>("split");
  const [artisanShare, setArtisanShare] = useState<number>(50);
  const [note, setNote] = useState("");

  const selected = cases.find((c) => c.id === selectedId) ?? null;

  const queueCounts = useMemo(
    () => ({
      open: cases.filter((c) => c.dispute.stage === "escalated").length,
      resolved: cases.filter((c) => c.dispute.stage === "resolved").length,
    }),
    [cases],
  );

  const issueDecision = () => {
    if (!selected) return;
    const amount = selected.dispute.amount;
    let artisanAmount = 0;
    let clientAmount = 0;
    if (outcome === "release_artisan") {
      artisanAmount = amount;
    } else if (outcome === "refund_client") {
      clientAmount = amount;
    } else {
      artisanAmount = Math.round((amount * artisanShare) / 100);
      clientAmount = amount - artisanAmount;
    }

    const now = new Date().toISOString();
    setCases((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              dispute: {
                ...c.dispute,
                stage: "resolved",
                resolution: {
                  outcome,
                  decidedBy: "amana",
                  clientAmount,
                  artisanAmount,
                  note: note.trim() || undefined,
                  decidedAt: now,
                },
                statements: [
                  ...c.dispute.statements,
                  {
                    id: `ruling-${Date.now()}`,
                    party: "amana",
                    text: `Decision: ${DISPUTE_OUTCOME_META[outcome].label}.${
                      note.trim() ? ` ${note.trim()}` : ""
                    }`,
                    createdAt: now,
                  },
                ],
                updatedAt: now,
              },
            }
          : c,
      ),
    );
    setNote("");
  };

  return (
    <div className="adash-page">
      <header className="adash-nav">
        <div className="adash-nav-inner">
          <div className="adash-nav-brand">
            <div className="adash-nav-brand-logo">
              <VaultIcon size={50} variant="green" />
              <span className="adash-nav-logo">Amana</span>
            </div>
            <span className="adash-nav-portal">Dispute Desk · Admin</span>
          </div>
          <div className="adash-nav-actions">
            <span className="admin-queue-pill">
              <Scales size={16} weight="bold" />
              {queueCounts.open} awaiting decision
            </span>
          </div>
        </div>
      </header>

      <main className="adash-main">
        <div className="adash-container">
          <header className="adash-welcome">
            <div>
              <p className="adash-eyebrow">Arbitration</p>
              <h1>Escalated disputes</h1>
              <p className="adash-welcome-text">
                Cases where the client and artisan could not settle. Review the
                evidence from both sides and issue a binding decision — funds are
                released from escrow according to your ruling.
              </p>
            </div>
          </header>

          <div className="admin-dispute-layout">
            <aside className="admin-case-list">
              <h2 className="admin-section-title">
                Queue
                <span className="adash-tab-count">{queueCounts.open}</span>
              </h2>
              {cases.map((c) => {
                const resolved = c.dispute.stage === "resolved";
                return (
                  <button
                    type="button"
                    key={c.id}
                    className={`admin-case-item${
                      c.id === selectedId ? " admin-case-item--active" : ""
                    }`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="admin-case-item-top">
                      <strong>{c.jobTitle}</strong>
                      <span
                        className={`adash-job-badge adash-job-badge--${
                          resolved ? "success" : "danger"
                        }`}
                      >
                        {resolved ? "Resolved" : "Open"}
                      </span>
                    </div>
                    <span className="admin-case-parties">
                      {c.clientName} vs {c.artisanName}
                    </span>
                    <span className="admin-case-amount">
                      {formatNaira(c.dispute.amount)} ·{" "}
                      {DISPUTE_CATEGORY_META[c.dispute.category].label}
                    </span>
                  </button>
                );
              })}
            </aside>

            <section className="admin-case-detail">
              {!selected ? (
                <p className="admin-empty">Select a case to review.</p>
              ) : (
                <>
                  <div className="admin-detail-head">
                    <div>
                      <h2>{selected.jobTitle}</h2>
                      <p className="admin-case-parties">
                        <MapPin size={14} weight="bold" /> {selected.location} ·
                        raised by {partyLabel(selected.dispute.raisedBy)}
                      </p>
                    </div>
                    <div className="admin-detail-amount">
                      <span>In escrow</span>
                      <strong>{formatNaira(selected.dispute.amount)}</strong>
                    </div>
                  </div>

                  <div className="dsp-summary">
                    <div>
                      <span className="dsp-summary-label">Client</span>
                      <strong>{selected.clientName}</strong>
                    </div>
                    <div>
                      <span className="dsp-summary-label">Artisan</span>
                      <strong>{selected.artisanName}</strong>
                    </div>
                    <div>
                      <span className="dsp-summary-label">Client wants</span>
                      <strong>
                        {DISPUTE_OUTCOME_META[selected.dispute.desiredOutcome]
                          .label}
                      </strong>
                    </div>
                  </div>

                  {selected.dispute.stage === "resolved" &&
                  selected.dispute.resolution ? (
                    <div className="adash-job-modal-callout adash-job-modal-callout--success">
                      <CheckCircle size={20} weight="fill" />
                      <p>
                        <strong>Decision issued.</strong>{" "}
                        {describeResolution(selected.dispute, formatNaira)}
                      </p>
                    </div>
                  ) : (
                    <div className="adash-job-modal-callout adash-job-modal-callout--danger">
                      <Warning size={20} weight="bold" />
                      <p>
                        Both parties failed to agree. Your decision is final and
                        moves the escrowed funds.
                      </p>
                    </div>
                  )}

                  <h3 className="admin-section-title">Case file</h3>
                  <div className="dsp-thread">
                    {selected.dispute.statements.map((s) => (
                      <div
                        key={s.id}
                        className={`dsp-statement dsp-statement--${s.party}`}
                      >
                        <div className="dsp-statement-head">
                          <ChatText size={14} weight="bold" />
                          <strong>{partyLabel(s.party)}</strong>
                          <span>{formatStamp(s.createdAt)}</span>
                        </div>
                        <p>{s.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="dsp-field">
                    <span className="dsp-field-label">
                      Evidence ({selected.dispute.evidence.length})
                    </span>
                    <ul className="dsp-evidence-list">
                      {selected.dispute.evidence.map((ev) => (
                        <li key={ev.id} className="dsp-evidence-chip">
                          <Paperclip size={14} weight="bold" />
                          <span>{ev.label}</span>
                          <em className="dsp-evidence-by">
                            {partyLabel(ev.party)}
                          </em>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selected.dispute.stage !== "resolved" && (
                    <div className="admin-ruling">
                      <h3 className="admin-section-title">Issue a decision</h3>
                      <div className="dsp-option-grid">
                        {RULING_OPTIONS.map((id) => (
                          <button
                            type="button"
                            key={id}
                            className={`dsp-option${
                              outcome === id ? " dsp-option--active" : ""
                            }`}
                            onClick={() => setOutcome(id)}
                          >
                            <strong>{DISPUTE_OUTCOME_META[id].label}</strong>
                            <span>{DISPUTE_OUTCOME_META[id].description}</span>
                          </button>
                        ))}
                      </div>

                      {outcome === "split" && (
                        <div className="admin-split">
                          <label htmlFor="admin-split-range">
                            Artisan receives {artisanShare}% ·{" "}
                            <strong>
                              {formatNaira(
                                Math.round(
                                  (selected.dispute.amount * artisanShare) / 100,
                                ),
                              )}
                            </strong>
                          </label>
                          <input
                            id="admin-split-range"
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={artisanShare}
                            onChange={(e) =>
                              setArtisanShare(Number(e.target.value))
                            }
                          />
                          <span className="dsp-field-hint">
                            Client is refunded{" "}
                            {formatNaira(
                              selected.dispute.amount -
                                Math.round(
                                  (selected.dispute.amount * artisanShare) / 100,
                                ),
                            )}
                            .
                          </span>
                        </div>
                      )}

                      <textarea
                        className="dsp-textarea"
                        rows={3}
                        value={note}
                        placeholder="Reasoning for the decision (shared with both parties)…"
                        onChange={(e) => setNote(e.target.value)}
                      />

                      <Button
                        type="button"
                        className="adash-btn adash-btn--primary admin-ruling-submit"
                        onClick={issueDecision}
                        loadingLabel="Issuing…"
                      >
                        <ShieldCheck size={16} weight="bold" />
                        Issue binding decision
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          <footer className="adash-disclaimer">
            Amana arbitration decisions are final for escrow release. Reviewers
            assess only the agreed scope and submitted evidence.
          </footer>
        </div>
      </main>
    </div>
  );
}
