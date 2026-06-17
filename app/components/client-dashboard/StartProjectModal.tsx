"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Upload } from "phosphor-react";
import type { StartProjectForm, BuildingCategory, BuildingType } from "./types";
import {
  BUILDING_OPTIONS,
  LAND_STATUS_OPTIONS,
  PROJECT_START_OPTIONS,
} from "./mock-data";

type StartProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: StartProjectForm) => void;
};

const STEPS = [
  "What are you building?",
  "Project location",
  "Project vision",
  "Current stage",
] as const;

const CATEGORIES: { id: BuildingCategory; label: string }[] = [
  { id: "residential", label: "Residential" },
  { id: "religious", label: "Religious" },
  { id: "commercial", label: "Commercial" },
  { id: "community", label: "Community" },
];

const EMPTY_FORM: StartProjectForm = {
  buildingCategory: "",
  buildingType: "",
  country: "Nigeria",
  state: "",
  city: "",
  address: "",
  landStatus: "",
  projectName: "",
  description: "",
  startStage: "",
};

export default function StartProjectModal({
  open,
  onClose,
  onSubmit,
}: StartProjectModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StartProjectForm>(EMPTY_FORM);

  if (!open) return null;

  const buildingTypes = form.buildingCategory
    ? BUILDING_OPTIONS[form.buildingCategory]
    : [];

  const canNext = () => {
    switch (step) {
      case 0:
        return form.buildingCategory && form.buildingType;
      case 1:
        return form.state && form.city && form.address && form.landStatus;
      case 2:
        return form.projectName.trim() && form.description.trim();
      case 3:
        return !!form.startStage;
      default:
        return false;
    }
  };

  const handleClose = () => {
    setStep(0);
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(form);
    setStep(0);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={handleClose}>
      <div
        className="adash-modal cdash-start-project-modal"
        role="dialog"
        aria-labelledby="start-project-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdash-modal-header adash-modal-header">
          <div className="cdash-modal-header-text">
            <p className="adash-eyebrow">
              Step {step + 1} of {STEPS.length}
            </p>
            <h3 id="start-project-title">{STEPS[step]}</h3>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="cdash-start-project-progress">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`cdash-start-step${i <= step ? " cdash-start-step--active" : ""}${i < step ? " cdash-start-step--done" : ""}`}
            />
          ))}
        </div>

        <div className="cdash-modal-scroll cdash-start-project-body">
          {step === 0 && (
            <>
              <div className="cdash-category-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cdash-category-btn${form.buildingCategory === cat.id ? " cdash-category-btn--active" : ""}`}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        buildingCategory: cat.id,
                        buildingType: "",
                      }))
                    }
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {buildingTypes.length > 0 && (
                <div className="cdash-type-grid">
                  {buildingTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`cdash-type-btn${form.buildingType === type.id ? " cdash-type-btn--active" : ""}`}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          buildingType: type.id as BuildingType,
                        }))
                      }
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <div className="cdash-form-grid">
              <label>
                Country
                <input
                  className="adash-input"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
              </label>
              <label>
                State
                <input
                  className="adash-input"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="e.g. Lagos"
                />
              </label>
              <label>
                City
                <input
                  className="adash-input"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </label>
              <label className="cdash-form-full">
                Address / Area
                <input
                  className="adash-input"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </label>
              <fieldset className="cdash-form-full">
                <legend>Land status</legend>
                <div className="cdash-land-options">
                  {LAND_STATUS_OPTIONS.map((opt) => (
                    <label key={opt.id} className="cdash-land-option">
                      <input
                        type="radio"
                        name="landStatus"
                        checked={form.landStatus === opt.id}
                        onChange={() =>
                          setForm((f) => ({ ...f, landStatus: opt.id }))
                        }
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="cdash-form-grid">
              <label className="cdash-form-full">
                Project name
                <input
                  className="adash-input"
                  value={form.projectName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, projectName: e.target.value }))
                  }
                  placeholder="e.g. Obi Family Duplex"
                />
              </label>
              <label className="cdash-form-full">
                Description
                <textarea
                  className="adash-input cdash-textarea"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Bedrooms, floors, style, purpose…"
                />
              </label>
              <div className="cdash-upload-zone cdash-form-full">
                <Upload size={24} weight="bold" />
                <p>Upload photos, documents, or inspiration images</p>
                <span>MVP: file upload coming soon</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="cdash-stage-options">
              {PROJECT_START_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`cdash-stage-option${form.startStage === opt.id ? " cdash-stage-option--active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, startStage: opt.id }))}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cdash-modal-footer adash-modal-actions">
          {step > 0 ? (
            <button
              type="button"
              className="adash-btn adash-btn--secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} weight="bold" />
              Back
            </button>
          ) : (
            <button type="button" className="adash-btn adash-btn--secondary" onClick={handleClose}>
              Cancel
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="adash-btn adash-btn--primary"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              className="adash-btn adash-btn--primary"
              disabled={!canNext()}
              onClick={handleSubmit}
            >
              Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
