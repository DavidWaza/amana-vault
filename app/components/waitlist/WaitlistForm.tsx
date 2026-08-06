"use client";

import { PaperPlaneTilt, Warning } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { normalizePhoneInput } from "@/app/lib/phone";
import {
  CITY_OPTIONS,
  HONEYPOT_FIELD,
  MESSAGE_MAX_LENGTH,
  REFERRAL_OPTIONS,
} from "./constants";
import { ROLE_OPTIONS } from "./ui-options";
import type {
  WaitlistFieldErrors,
  WaitlistFormData,
  WaitlistTouchedState,
} from "./types";

type WaitlistFormProps = {
  form: WaitlistFormData;
  errors: WaitlistFieldErrors;
  touched: WaitlistTouchedState;
  submitError: string | null;
  loading: boolean;
  onChange: <K extends keyof WaitlistFormData>(
    field: K,
    value: WaitlistFormData[K],
  ) => void;
  onBlur: (field: keyof WaitlistTouchedState) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export default function WaitlistForm({
  form,
  errors,
  touched,
  submitError,
  loading,
  onChange,
  onBlur,
  onSubmit,
}: WaitlistFormProps) {
  /** Only surface an error once the field has been visited or submit was tried. */
  const errorFor = (field: keyof WaitlistTouchedState) =>
    touched[field] ? errors[field] : undefined;

  return (
    <form className="wl-form" onSubmit={onSubmit} noValidate>
      <div className="wl-form-scroll">
        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-full-name">
            Full name
          </label>
          <input
            id="wl-full-name"
            className={`wl-input${errorFor("fullName") ? " wl-input--error" : ""}`}
            type="text"
            autoComplete="name"
            placeholder="Idemeto Emediong"
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            onBlur={() => onBlur("fullName")}
            aria-invalid={errorFor("fullName") ? true : undefined}
            aria-describedby={errorFor("fullName") ? "wl-full-name-error" : undefined}
          />
          {errorFor("fullName") && (
            <p className="wl-field-error" id="wl-full-name-error">
              {errorFor("fullName")}
            </p>
          )}
        </div>

        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-email">
            Email address
          </label>
          <input
            id="wl-email"
            className={`wl-input${errorFor("email") ? " wl-input--error" : ""}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => onBlur("email")}
            aria-invalid={errorFor("email") ? true : undefined}
            aria-describedby={errorFor("email") ? "wl-email-error" : undefined}
          />
          {errorFor("email") && (
            <p className="wl-field-error" id="wl-email-error">
              {errorFor("email")}
            </p>
          )}
        </div>

        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-phone">
            Phone number <span className="wl-optional">(optional)</span>
          </label>
          <input
            id="wl-phone"
            className={`wl-input${errorFor("phone") ? " wl-input--error" : ""}`}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="08012345678"
            value={form.phone}
            onChange={(e) => onChange("phone", normalizePhoneInput(e.target.value))}
            onBlur={() => onBlur("phone")}
            aria-invalid={errorFor("phone") ? true : undefined}
            aria-describedby={errorFor("phone") ? "wl-phone-error" : undefined}
          />
          {errorFor("phone") && (
            <p className="wl-field-error" id="wl-phone-error">
              {errorFor("phone")}
            </p>
          )}
        </div>

        <fieldset className="wl-field wl-fieldset">
          <legend className="wl-label">I&apos;m joining as</legend>
          <div className="wl-roles" role="radiogroup" aria-label="I'm joining as">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={form.role === option.value}
                className={`wl-role${form.role === option.value ? " wl-role--active" : ""}`}
                onClick={() => {
                  onChange("role", option.value);
                  onBlur("role");
                }}
              >
                <span className="wl-role-icon">{option.icon}</span>
                <span className="wl-role-text">
                  <strong>{option.label}</strong>
                  <small>{option.hint}</small>
                </span>
              </button>
            ))}
          </div>
          {errorFor("role") && <p className="wl-field-error">{errorFor("role")}</p>}
        </fieldset>

        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-city">
            Where are you based? <span className="wl-optional">(optional)</span>
          </label>
          <select
            id="wl-city"
            className="wl-input wl-select"
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
          >
            <option value="">Select a city</option>
            {CITY_OPTIONS.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-referral">
            How did you hear about us? <span className="wl-optional">(optional)</span>
          </label>
          <select
            id="wl-referral"
            className="wl-input wl-select"
            value={form.referralSource}
            onChange={(e) => onChange("referralSource", e.target.value)}
          >
            <option value="">Select an option</option>
            {REFERRAL_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="wl-field">
          <label className="wl-label" htmlFor="wl-message">
            Anything you&apos;d like us to know?{" "}
            <span className="wl-optional">(optional)</span>
          </label>
          <textarea
            id="wl-message"
            className="wl-input wl-textarea"
            rows={3}
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder="Tell us what you're building, or what you'd want from Amana."
            value={form.message}
            onChange={(e) => onChange("message", e.target.value)}
          />
          <p className="wl-field-hint">
            {form.message.length}/{MESSAGE_MAX_LENGTH}
          </p>
        </div>

        {/*
          Honeypot — hidden from users, checked server-side. The opt-out
          attributes matter: without them Chrome autofill, 1Password and
          LastPass fill this field for real people, who then get silently
          discarded as bots.
        */}
        <div className="wl-honeypot" aria-hidden>
          <label htmlFor="wl-hp-contact-ref">Leave this field empty</label>
          <input
            id="wl-hp-contact-ref"
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          />
        </div>
      </div>

      <div className="wl-form-actions">
        {submitError && (
          <p className="wl-submit-error" role="alert">
            <Warning size={16} weight="fill" />
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          className="wl-submit"
          loading={loading}
          loadingLabel="Joining…"
        >
          Join the waitlist
          <PaperPlaneTilt size={18} weight="fill" />
        </Button>
        <p className="wl-form-note">
          No spam. We&apos;ll only email you about early access.
        </p>
      </div>
    </form>
  );
}
