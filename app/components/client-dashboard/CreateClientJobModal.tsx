"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  MagnifyingGlass,
  MapPin,
  Calendar,
  Wallet,
  FileText,
  ShieldCheck,
  Star,
  Sparkle,
  CheckCircle,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { AGREEMENT_CATEGORIES } from "../artisan-dashboard/agreement-templates";
import type { AgreementCategoryId } from "../artisan-dashboard/types";
import type { CreateClientJobForm, RecommendedArtisan } from "./types";
import { searchRecommendedArtisans } from "./artisan-search";

type CreateClientJobModalProps = {
  open: boolean;
  artisans: RecommendedArtisan[];
  defaultAreaLabel: string;
  preselectedArtisan?: RecommendedArtisan | null;
  onClose: () => void;
  onSubmit: (form: CreateClientJobForm, artisan: RecommendedArtisan) => Promise<void>;
  onViewArtisan?: (artisan: RecommendedArtisan) => void;
};

const EMPTY_FORM: CreateClientJobForm = {
  title: "",
  categoryId: "plumbing",
  location: "",
  deadline: "",
  budget: "",
  specifications: "",
  artisanId: null,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CreateClientJobModal({
  open,
  artisans,
  defaultAreaLabel,
  preselectedArtisan = null,
  onClose,
  onSubmit,
  onViewArtisan,
}: CreateClientJobModalProps) {
  const [form, setForm] = useState<CreateClientJobForm>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [successArtisan, setSuccessArtisan] = useState<RecommendedArtisan | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setSuccessArtisan(null);
    setErrors({});
    setSearchQuery("");
    setForm({
      ...EMPTY_FORM,
      location: `${defaultAreaLabel}, Abuja`,
      categoryId: preselectedArtisan?.categoryId ?? "plumbing",
      artisanId: preselectedArtisan?.id ?? null,
    });
  }, [open, defaultAreaLabel, preselectedArtisan]);

  const searchResults = useMemo(
    () =>
      searchRecommendedArtisans(artisans, {
        query: searchQuery,
        categoryId: form.categoryId,
        limit: 8,
      }),
    [artisans, searchQuery, form.categoryId],
  );

  const selectedArtisan =
    artisans.find((item) => item.id === form.artisanId) ?? preselectedArtisan ?? null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 4) next.title = "Enter a job title (at least 4 characters).";
    if (form.specifications.trim().length < 20) {
      next.specifications = "Describe the work needed (at least 20 characters).";
    }
    if (!form.deadline) next.deadline = "Choose a target completion date.";
    if (!form.artisanId) next.artisanId = "Select an artisan to send this job to.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const [handleSubmit, submitLoading] = useAsyncAction(async () => {
    if (!selectedArtisan || !validate()) return;
    await onSubmit(form, selectedArtisan);
    setSuccessArtisan(selectedArtisan);
  });

  if (!open) return null;

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal adash-modal--agreement cdash-create-job-modal"
        role="dialog"
        aria-labelledby="create-job-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <h3 id="create-job-title">
              {successArtisan ? "Job invite sent" : "Create a protected job"}
            </h3>
            <p className="adash-modal-subtext">
              {successArtisan
                ? `${successArtisan.fullName} will review your specifications and respond within 3 days.`
                : "Drop your job specs, pick an artisan, and send a protected invite."}
            </p>
          </div>
          <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        {successArtisan ? (
          <div className="cdash-create-job-success">
            <div className="cdash-fund-success-icon">
              <CheckCircle size={48} weight="fill" />
            </div>
            <p>
              Your job <strong>{form.title}</strong> was sent to{" "}
              <strong>{successArtisan.fullName}</strong>. Once they accept, they will send
              an agreement for you to fund in escrow.
            </p>
            <div className="adash-modal-actions">
              <Button type="button" className="adash-btn adash-btn--primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="cdash-create-job-form">
              <div className="cdash-create-job-field">
                <label htmlFor="job-title">Job title</label>
                <input
                  id="job-title"
                  className={`adash-input${errors.title ? " adash-input--error" : ""}`}
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Kitchen pipe installation"
                />
                {errors.title && <span className="cdash-field-error">{errors.title}</span>}
              </div>

              <div className="cdash-create-job-grid">
                <div className="cdash-create-job-field">
                  <label htmlFor="job-category">Line of work</label>
                  <select
                    id="job-category"
                    className="adash-input adash-select"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value as AgreementCategoryId,
                        artisanId:
                          prev.artisanId &&
                          artisans.find((item) => item.id === prev.artisanId)?.categoryId ===
                            e.target.value
                            ? prev.artisanId
                            : null,
                      }))
                    }
                  >
                    {AGREEMENT_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.emoji} {category.label}
                      </option>
                    ))}
                  </select>
                  <span className="cdash-field-hint">
                    Artisans in this trade appear first in search.
                  </span>
                </div>

                <div className="cdash-create-job-field">
                  <label htmlFor="job-deadline">
                    <Calendar size={14} weight="bold" /> Target date
                  </label>
                  <input
                    id="job-deadline"
                    type="date"
                    className={`adash-input${errors.deadline ? " adash-input--error" : ""}`}
                    value={form.deadline}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                  />
                  {errors.deadline && (
                    <span className="cdash-field-error">{errors.deadline}</span>
                  )}
                </div>
              </div>

              <div className="cdash-create-job-grid">
                <div className="cdash-create-job-field">
                  <label htmlFor="job-location">
                    <MapPin size={14} weight="bold" /> Location
                  </label>
                  <input
                    id="job-location"
                    className="adash-input"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Gwarinpa, Abuja"
                  />
                </div>

                <div className="cdash-create-job-field">
                  <label htmlFor="job-budget">
                    <Wallet size={14} weight="bold" /> Estimated budget (optional)
                  </label>
                  <input
                    id="job-budget"
                    className="adash-input"
                    inputMode="numeric"
                    value={form.budget}
                    onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g. 85000"
                  />
                </div>
              </div>

              <div className="cdash-create-job-field">
                <label htmlFor="job-specs">
                  <FileText size={14} weight="bold" /> Job specifications
                </label>
                <textarea
                  id="job-specs"
                  className={`adash-input adash-textarea${errors.specifications ? " adash-input--error" : ""}`}
                  rows={4}
                  value={form.specifications}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, specifications: e.target.value }))
                  }
                  placeholder="Describe the work, materials, access notes, and anything the artisan should know before accepting."
                />
                {errors.specifications && (
                  <span className="cdash-field-error">{errors.specifications}</span>
                )}
              </div>
            </div>

            <div className="cdash-create-job-picker">
              <div className="cdash-create-job-picker-header">
                <h4>Find an artisan</h4>
                <p>
                  Recommended {AGREEMENT_CATEGORIES.find((c) => c.id === form.categoryId)?.label}{" "}
                  pros are ranked first.
                </p>
              </div>

              <label className="cdash-artisan-search cdash-artisan-search--modal">
                <MagnifyingGlass size={18} weight="bold" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artisans by name or area…"
                  aria-label="Search artisans for this job"
                />
              </label>

              {errors.artisanId && (
                <span className="cdash-field-error cdash-field-error--block">
                  {errors.artisanId}
                </span>
              )}

              <ul className="cdash-create-job-results">
                {searchResults.map((artisan) => {
                  const selected = form.artisanId === artisan.id;
                  return (
                    <li key={artisan.id} className="cdash-create-job-result-row">
                      <button
                        type="button"
                        className={`cdash-create-job-result${selected ? " cdash-create-job-result--selected" : ""}`}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, artisanId: artisan.id }))
                        }
                      >
                        <span className="cdash-artisan-avatar cdash-artisan-avatar--small">
                          {getInitials(artisan.fullName)}
                        </span>
                        <span className="cdash-create-job-result-body">
                          <strong>
                            {artisan.fullName}
                            {artisan.isRecommended && (
                              <span className="adash-profile-recommended">
                                <Sparkle size={10} weight="fill" />
                                Recommended
                              </span>
                            )}
                          </strong>
                          <span>
                            {artisan.categoryEmoji} {artisan.categoryLabel} · {artisan.areaLabel}
                          </span>
                          <span className="cdash-create-job-result-meta">
                            {artisan.rating !== null && (
                              <>
                                <Star size={12} weight="fill" />
                                {artisan.rating.toFixed(1)}
                              </>
                            )}
                            {artisan.verified && (
                              <>
                                <ShieldCheck size={12} weight="fill" />
                                Verified
                              </>
                            )}
                          </span>
                        </span>
                        {selected && <CheckCircle size={20} weight="fill" />}
                      </button>
                      {onViewArtisan && (
                        <button
                          type="button"
                          className="cdash-create-job-profile-btn"
                          onClick={() => onViewArtisan(artisan)}
                        >
                          View profile
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="adash-modal-actions">
              <button type="button" className="adash-btn adash-btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                loading={submitLoading}
                loadingLabel="Sending invite…"
                onClick={handleSubmit}
              >
                Send job invite
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
