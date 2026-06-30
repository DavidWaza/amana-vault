"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ClipboardText,
  User,
  PaperPlaneTilt,
  ShieldCheck,
  MagnifyingGlass,
  CheckCircle,
  ChatsCircle,
  Lock,
  Receipt,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import {
  AGREEMENT_CATEGORIES,
  CHANGES_OPTIONS,
  WARRANTY_OPTIONS,
  getCategoryConfig,
  mapProfileCategoryToAgreement,
} from "./agreement-templates";
import {
  buildAgreementSummary,
  calculateProtectionFee,
  parseProtectedPrice,
  PROTECTION_FEE_RATE,
} from "./agreement-summary";
import AgreementCheckboxGroup from "./AgreementCheckboxGroup";
import type {
  AgreementCategoryId,
  ArtisanClient,
  CreateAgreementForm,
  CreateAgreementStep,
} from "./types";
import { validateAgreementStep } from "./agreement-validation";
import { formatNaira } from "./utils";

const WIZARD_STEPS: { id: CreateAgreementStep; label: string }[] = [
  { id: "category", label: "Work type" },
  { id: "details", label: "Scope" },
  { id: "terms", label: "Price" },
  { id: "client", label: "Client" },
  { id: "summary", label: "Send" },
];

const DEFAULT_FORM: CreateAgreementForm = {
  categoryId: "plumbing",
  selections: {},
  otherTexts: {},
  customTexts: {},
  price: "",
  startDate: "",
  finishDate: "",
  warranty: "7_days",
  warrantyCustom: "",
  changesPolicy: ["ask_approval"],
  clientId: null,
};

type CreateAgreementModalProps = {
  open: boolean;
  clients: ArtisanClient[];
  artisanCategory?: string;
  onClose: () => void;
  onSend: (form: CreateAgreementForm, client: ArtisanClient) => Promise<string>;
  onOpenChat?: (jobId: string) => void;
  onCreateInvoice?: (jobId: string) => void;
};

export default function CreateAgreementModal({
  open,
  clients,
  artisanCategory = "plumbing",
  onClose,
  onSend,
  onOpenChat,
  onCreateInvoice,
}: CreateAgreementModalProps) {
  const [step, setStep] = useState<CreateAgreementStep>("category");
  const [form, setForm] = useState<CreateAgreementForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [sent, setSent] = useState(false);
  const [sentJobId, setSentJobId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const categoryConfig = useMemo(
    () => getCategoryConfig(form.categoryId),
    [form.categoryId],
  );

  const summary = useMemo(() => {
    if (step !== "summary" && !sent) return null;
    try {
      return buildAgreementSummary(form);
    } catch {
      return null;
    }
  }, [form, step, sent]);

  useEffect(() => {
    if (!open) return;
    const defaultCategory = mapProfileCategoryToAgreement(artisanCategory);
    setStep("category");
    setForm({
      ...DEFAULT_FORM,
      categoryId: defaultCategory,
    });
    setErrors({});
    setSearch("");
    setSent(false);
    setSentJobId(null);
    setSendError(null);
  }, [open, artisanCategory]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === form.clientId) ?? null,
    [clients, form.clientId],
  );

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.email?.toLowerCase().includes(query),
    );
  }, [clients, search]);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);

  const protectedPrice = useMemo(
    () => parseProtectedPrice(form.price),
    [form.price],
  );
  const protectionFee = useMemo(
    () => calculateProtectionFee(protectedPrice),
    [protectedPrice],
  );
  const totalDue = protectedPrice + protectionFee;

  const [handleSend, sendLoading] = useAsyncAction(async () => {
    const stepErrors = validateAgreementStep(form, "summary");
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    const client = clients.find((item) => item.id === form.clientId);
    if (!client) return;

    setSendError(null);
    try {
      const jobId = await onSend(form, client);
      setSentJobId(jobId);
      setSent(true);
    } catch {
      setSendError("Could not send agreement. Please try again.");
    }
  });

  if (!open) return null;

  const setSelection = (sectionId: string, values: string[]) => {
    setForm((prev) => ({
      ...prev,
      selections: { ...prev.selections, [sectionId]: values },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  const setOtherText = (sectionId: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      otherTexts: { ...prev.otherTexts, [`${sectionId}_other`]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  };

  const setCustomText = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      customTexts: { ...prev.customTexts, [key]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const goNext = () => {
    const stepErrors = validateAgreementStep(form, step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const next = WIZARD_STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    setSendError(null);
    const prev = WIZARD_STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleCategoryChange = (categoryId: AgreementCategoryId) => {
    setForm({
      ...DEFAULT_FORM,
      categoryId,
    });
    setErrors({});
  };

  const toggleChangesPolicy = (id: string) => {
    setForm((prev) => ({
      ...prev,
      changesPolicy: prev.changesPolicy.includes(id)
        ? prev.changesPolicy.filter((item) => item !== id)
        : [...prev.changesPolicy, id],
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.changesPolicy;
      return next;
    });
  };

  const displaySummary = sent && summary ? summary : summary;

  return (
    <div
      className="adash-modal-overlay"
      role="presentation"
      onClick={() => !sendLoading && onClose()}
    >
      <div
        className="adash-modal adash-modal--proof adash-modal--agreement"
        role="dialog"
        aria-labelledby="create-agreement-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <p className="adash-eyebrow">
              <Lock size={14} weight="bold" />
              Create Agreement
            </p>
            <h3 id="create-agreement-title">
              {sent ? "Agreement sent" : "What work are you protecting?"}
            </h3>
            {!sent && step === "category" && (
              <p className="adash-modal-subtext">
                Pick your trade, define the scope with checklists, then send a
                clear summary to your client.
              </p>
            )}
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            disabled={sendLoading}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {!sent && (
          <div className="adash-agreement-steps" aria-label="Agreement steps">
            {WIZARD_STEPS.map((item, index) => {
              const active = item.id === step;
              const complete = index < stepIndex;

              return (
                <div
                  key={item.id}
                  className={`adash-agreement-step${active ? " adash-agreement-step--active" : ""}${complete ? " adash-agreement-step--complete" : ""}`}
                >
                  <span>
                    {complete ? <CheckCircle size={14} weight="fill" /> : index + 1}
                  </span>
                  {item.label}
                </div>
              );
            })}
          </div>
        )}

        {sent && displaySummary && selectedClient ? (
          <div className="adash-agreement-success">
            <div className="adash-agreement-success-icon">
              <PaperPlaneTilt size={28} weight="fill" />
            </div>
            <h4>Sent to {selectedClient.name}</h4>
            <p>
              Your <strong>{displaySummary.title}</strong> agreement is live.
              {selectedClient.name} can review milestones and fund escrow.
            </p>
            <div className="adash-completion-summary adash-completion-summary--compact">
              <div className="adash-completion-summary-row">
                <span>Protected price</span>
                <strong>{formatNaira(displaySummary.price)}</strong>
              </div>
              <div className="adash-completion-summary-row">
                <span>Protection fee (5%)</span>
                <strong>{formatNaira(displaySummary.protectionFee)}</strong>
              </div>
              <div className="adash-completion-summary-row adash-completion-summary-row--total">
                <span>Client total</span>
                <strong>{formatNaira(displaySummary.totalDue)}</strong>
              </div>
              <div className="adash-completion-summary-row">
                <span>Milestones</span>
                <strong>{displaySummary.milestones.length}</strong>
              </div>
            </div>
            <div className="adash-modal-actions adash-modal-actions--stack">
              {sentJobId && onCreateInvoice && (
                <Button
                  type="button"
                  className="adash-btn adash-btn--primary"
                  onClick={() => {
                    onCreateInvoice(sentJobId);
                    onClose();
                  }}
                >
                  <Receipt size={16} weight="bold" />
                  Create invoice & send
                </Button>
              )}
              {sentJobId && onOpenChat && (
                <button
                  type="button"
                  className="adash-btn adash-btn--secondary"
                  onClick={() => {
                    onOpenChat(sentJobId);
                    onClose();
                  }}
                >
                  <ChatsCircle size={16} weight="bold" />
                  Message client
                </button>
              )}
              <button type="button" className="adash-btn adash-btn--ghost" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {step === "category" && (
              <div className="adash-agreement-form">
                <div className="adash-field">
                  <label className="adash-label" htmlFor="agreement-category">
                    What work are you protecting?
                  </label>
                  <select
                    id="agreement-category"
                    className={`adash-input adash-select adash-select--emoji${errors.categoryId ? " adash-input--error" : ""}`}
                    value={form.categoryId}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value as AgreementCategoryId)
                    }
                  >
                    {AGREEMENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="adash-field-error">{errors.categoryId}</p>
                  )}
                </div>

                <div className="adash-agreement-category-preview">
                  <span className="adash-agreement-category-emoji">
                    {categoryConfig.emoji}
                  </span>
                  <div>
                    <strong>{categoryConfig.label} template</strong>
                    <p>
                      {categoryConfig.sections.length} sections · checklist-based
                      scope · auto-generated milestones
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="adash-agreement-form adash-agreement-form--sections">
                <p className="adash-agreement-template-label">
                  {categoryConfig.emoji} {categoryConfig.label} template
                </p>

                {categoryConfig.sections.map((section) => (
                  <AgreementCheckboxGroup
                    key={section.id}
                    section={section}
                    selected={form.selections[section.id] ?? []}
                    otherText={form.otherTexts[`${section.id}_other`]}
                    customText={
                      section.customInputKey
                        ? form.customTexts[section.customInputKey]
                        : ""
                    }
                    error={errors[section.id] ?? errors[section.customInputKey ?? ""]}
                    onChange={(values) => setSelection(section.id, values)}
                    onOtherTextChange={(value) => setOtherText(section.id, value)}
                    onCustomTextChange={
                      section.customInputKey
                        ? (value) => setCustomText(section.customInputKey!, value)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {step === "terms" && (
              <div className="adash-agreement-form">
                <div className="adash-field">
                  <label className="adash-label" htmlFor="agreement-price">
                    Protected price (NGN)
                  </label>
                  <input
                    id="agreement-price"
                    type="number"
                    min={5000}
                    step={1000}
                    className={`adash-input${errors.price ? " adash-input--error" : ""}`}
                    value={form.price}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, price: e.target.value }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.price;
                        return next;
                      });
                    }}
                    placeholder="85000"
                  />
                  {errors.price && <p className="adash-field-error">{errors.price}</p>}
                  <div className="adash-protection-fee-box">
                    <div className="adash-protection-fee-row">
                      <span>Protection fee (5%)</span>
                      <strong>{formatNaira(protectionFee)}</strong>
                    </div>
                    {protectedPrice > 0 && (
                      <div className="adash-protection-fee-row adash-protection-fee-row--total">
                        <span>Client pays total</span>
                        <strong>{formatNaira(totalDue)}</strong>
                      </div>
                    )}
                    <p className="adash-protection-fee-hint">
                      Amana protection fee is {PROTECTION_FEE_RATE * 100}% of your
                      protected price, calculated automatically.
                    </p>
                  </div>
                </div>

                <div className="adash-settings-grid">
                  <div className="adash-field">
                    <label className="adash-label" htmlFor="agreement-start">
                      Start date
                    </label>
                    <input
                      id="agreement-start"
                      type="date"
                      className={`adash-input${errors.startDate ? " adash-input--error" : ""}`}
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                    {errors.startDate && (
                      <p className="adash-field-error">{errors.startDate}</p>
                    )}
                  </div>
                  <div className="adash-field">
                    <label className="adash-label" htmlFor="agreement-finish">
                      Finish date
                    </label>
                    <input
                      id="agreement-finish"
                      type="date"
                      className={`adash-input${errors.finishDate ? " adash-input--error" : ""}`}
                      value={form.finishDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, finishDate: e.target.value }))
                      }
                    />
                    {errors.finishDate && (
                      <p className="adash-field-error">{errors.finishDate}</p>
                    )}
                  </div>
                </div>

                <fieldset className="adash-agreement-fieldset">
                  <legend className="adash-agreement-legend">Warranty</legend>
                  <div className="adash-agreement-checkgrid">
                    {WARRANTY_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`adash-agreement-check${form.warranty === option.id ? " adash-agreement-check--on" : ""}`}
                      >
                        <input
                          type="radio"
                          name="warranty"
                          checked={form.warranty === option.id}
                          onChange={() =>
                            setForm((prev) => ({
                              ...prev,
                              warranty: option.id,
                            }))
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {form.warranty === "custom" && (
                    <input
                      className={`adash-input${errors.warrantyCustom ? " adash-input--error" : ""}`}
                      placeholder="Describe warranty terms"
                      value={form.warrantyCustom}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          warrantyCustom: e.target.value,
                        }))
                      }
                    />
                  )}
                  {errors.warrantyCustom && (
                    <p className="adash-field-error">{errors.warrantyCustom}</p>
                  )}
                </fieldset>

                <fieldset className="adash-agreement-fieldset">
                  <legend className="adash-agreement-legend">
                    If extra work comes up
                  </legend>
                  <div className="adash-agreement-checkgrid">
                    {CHANGES_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`adash-agreement-check${form.changesPolicy.includes(option.id) ? " adash-agreement-check--on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.changesPolicy.includes(option.id)}
                          onChange={() => toggleChangesPolicy(option.id)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.changesPolicy && (
                    <p className="adash-field-error">{errors.changesPolicy}</p>
                  )}
                </fieldset>
              </div>
            )}

            {step === "client" && (
              <div className="adash-agreement-clients">
                <div className="adash-field">
                  <label className="adash-label" htmlFor="client-search">
                    Who is this agreement for?
                  </label>
                  <div className="adash-agreement-search">
                    <MagnifyingGlass size={18} weight="bold" />
                    <input
                      id="client-search"
                      className="adash-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, phone, or email"
                    />
                  </div>
                  {errors.clientId && (
                    <p className="adash-field-error">{errors.clientId}</p>
                  )}
                </div>

                <ul className="adash-agreement-client-list">
                  {filteredClients.length === 0 ? (
                    <li className="adash-agreement-client-empty">
                      No clients match your search.
                    </li>
                  ) : (
                    filteredClients.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          className={`adash-agreement-client${form.clientId === client.id ? " adash-agreement-client--selected" : ""}`}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, clientId: client.id }));
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.clientId;
                              return next;
                            });
                          }}
                        >
                          <span className="adash-agreement-client-avatar">
                            <User size={18} weight="bold" />
                          </span>
                          <span className="adash-agreement-client-info">
                            <strong>
                              {client.name}
                              {client.verified && (
                                <span className="adash-agreement-client-verified">
                                  <ShieldCheck size={12} weight="fill" />
                                  Verified
                                </span>
                              )}
                            </strong>
                            <span>{client.phone}</span>
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            {step === "summary" && displaySummary && selectedClient && (
              <div className="adash-agreement-review">
                <div className="adash-completion-summary">
                  <div className="adash-completion-summary-hero">
                    <span>{displaySummary.categoryEmoji}</span>
                    <div>
                      <p className="adash-eyebrow">Completion summary</p>
                      <h4>{displaySummary.title}</h4>
                      <p>
                        Sending to <strong>{selectedClient.name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="adash-completion-summary-grid">
                    <div>
                      <span>Protected price</span>
                      <strong>{formatNaira(displaySummary.price)}</strong>
                    </div>
                    <div>
                      <span>Protection fee (5%)</span>
                      <strong>{formatNaira(displaySummary.protectionFee)}</strong>
                    </div>
                    <div>
                      <span>Client total</span>
                      <strong>{formatNaira(displaySummary.totalDue)}</strong>
                    </div>
                    <div>
                      <span>Timeline</span>
                      <strong>
                        {new Date(displaySummary.startDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" → "}
                        {new Date(displaySummary.finishDate).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>Warranty</span>
                      <strong>{displaySummary.warranty}</strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{displaySummary.location}</strong>
                    </div>
                  </div>

                  {displaySummary.sections.map((section) => (
                    <div key={section.title} className="adash-completion-summary-block">
                      <strong>{section.title}</strong>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="adash-completion-summary-block">
                    <strong>Payment milestones</strong>
                    <ul className="adash-completion-milestones">
                      {displaySummary.milestones.map((milestone, index) => (
                        <li key={milestone.id}>
                          <span>
                            {index + 1}. {milestone.title}
                          </span>
                          <span>{formatNaira(Number(milestone.amount))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="adash-completion-summary-block">
                    <strong>Extra work policy</strong>
                    <p>{displaySummary.changesPolicy.join(" · ")}</p>
                  </div>

                  <div className="adash-job-modal-callout adash-job-modal-callout--success">
                    <ShieldCheck size={20} weight="bold" />
                    <p>
                      Client must accept this summary before escrow is funded. You
                      can message them on the contract thread after sending.
                    </p>
                  </div>
                </div>

                {sendError && (
                  <p className="adash-field-error" role="alert">
                    {sendError}
                  </p>
                )}
              </div>
            )}

            <div className="adash-modal-actions">
              {stepIndex > 0 && (
                <button
                  type="button"
                  className="adash-btn adash-btn--ghost"
                  onClick={goBack}
                  disabled={sendLoading}
                >
                  Back
                </button>
              )}
              {step !== "summary" ? (
                <Button
                  type="button"
                  className="adash-btn adash-btn--primary"
                  onClick={goNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  className="adash-btn adash-btn--primary"
                  onClick={handleSend}
                  disabled={sendLoading || !displaySummary}
                  loading={sendLoading}
                  loadingLabel="Sending…"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  Send agreement
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
