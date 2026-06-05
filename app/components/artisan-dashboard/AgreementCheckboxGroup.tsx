"use client";

import type { AgreementSection } from "./agreement-templates";

type AgreementCheckboxGroupProps = {
  section: AgreementSection;
  selected: string[];
  otherText?: string;
  customText?: string;
  error?: string;
  onChange: (selected: string[]) => void;
  onOtherTextChange?: (value: string) => void;
  onCustomTextChange?: (value: string) => void;
};

export default function AgreementCheckboxGroup({
  section,
  selected,
  otherText = "",
  customText = "",
  error,
  onChange,
  onOtherTextChange,
  onCustomTextChange,
}: AgreementCheckboxGroupProps) {
  const toggle = (optionId: string) => {
    if (section.multi) {
      onChange(
        selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      );
      return;
    }
    onChange(selected.includes(optionId) ? [] : [optionId]);
  };

  const showCustomInput =
    section.allowCustomInput &&
    (selected.includes("specific") || section.id === "work_description");

  return (
    <fieldset className="adash-agreement-fieldset">
      <legend className="adash-agreement-legend">{section.title}</legend>

      <div className="adash-agreement-checkgrid">
        {section.options.map((option) => (
          <label
            key={option.id}
            className={`adash-agreement-check${selected.includes(option.id) ? " adash-agreement-check--on" : ""}`}
          >
            <input
              type={section.multi ? "checkbox" : "radio"}
              name={section.id}
              checked={selected.includes(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}

      </div>

      {section.allowOther && (
        <div className="adash-field">
          <label className="adash-label" htmlFor={`other-${section.id}`}>
            Other
          </label>
          <input
            id={`other-${section.id}`}
            className="adash-input"
            placeholder="Describe other…"
            value={otherText}
            onChange={(e) => onOtherTextChange?.(e.target.value)}
          />
        </div>
      )}

      {showCustomInput && (
        <div className="adash-field">
          <label className="adash-label" htmlFor={`custom-${section.id}`}>
            {section.customInputLabel ?? "Details"}
          </label>
          <input
            id={`custom-${section.id}`}
            className="adash-input"
            value={customText}
            onChange={(e) => onCustomTextChange?.(e.target.value)}
            placeholder={section.customInputLabel}
          />
        </div>
      )}

      {error && <p className="adash-field-error">{error}</p>}
    </fieldset>
  );
}
