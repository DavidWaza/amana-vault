"use client";

import { useState } from "react";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import WaitlistForm from "./WaitlistForm";
import WaitlistHero from "./WaitlistHero";
import WaitlistSuccess from "./WaitlistSuccess";
import { HONEYPOT_FIELD, INITIAL_FORM, INITIAL_TOUCHED } from "./constants";
import { getWaitlistErrors } from "./validation";
import type {
  WaitlistErrorResponse,
  WaitlistFormData,
  WaitlistSuccessResponse,
  WaitlistTouchedState,
} from "./types";
import "./waitlist.css";

const ALL_TOUCHED: WaitlistTouchedState = {
  fullName: true,
  email: true,
  phone: true,
  role: true,
};

type SubmittedState = {
  fullName: string;
  email: string;
  position: number;
  alreadyJoined: boolean;
};

export default function WaitlistPage() {
  const [form, setForm] = useState<WaitlistFormData>(INITIAL_FORM);
  const [touched, setTouched] = useState<WaitlistTouchedState>(INITIAL_TOUCHED);
  const [serverErrors, setServerErrors] = useState<WaitlistErrorResponse["fields"]>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);

  const errors = { ...getWaitlistErrors(form), ...serverErrors };

  const updateField = <K extends keyof WaitlistFormData>(
    field: K,
    value: WaitlistFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // A field the user is fixing shouldn't keep showing the server's complaint.
    setServerErrors((prev) => {
      if (!prev || !(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as keyof typeof next];
      return next;
    });
  };

  const markTouched = (field: keyof WaitlistTouchedState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setTouched(INITIAL_TOUCHED);
    setServerErrors(undefined);
    setSubmitError(null);
    setSubmitted(null);
  };

  const [handleSubmit, loading] = useAsyncAction(async (event: React.FormEvent) => {
    event.preventDefault();

    // Honeypot lives outside React state so bots that auto-fill every input are
    // caught without the value ever affecting the UI. Read before the first
    // await, while the synthetic event still points at the form.
    const formEl = event.currentTarget as HTMLFormElement;
    const honeypot =
      (formEl.elements.namedItem(HONEYPOT_FIELD) as HTMLInputElement | null)
        ?.value ?? "";

    setSubmitError(null);
    setServerErrors(undefined);
    setTouched(ALL_TOUCHED);

    if (Object.keys(getWaitlistErrors(form)).length > 0) return;

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, [HONEYPOT_FIELD]: honeypot }),
      });

      const data: WaitlistSuccessResponse | WaitlistErrorResponse =
        await response.json();

      if (!response.ok) {
        const error = data as WaitlistErrorResponse;
        setServerErrors(error.fields);
        setSubmitError(error.error ?? "Something went wrong. Please try again.");
        return;
      }

      const success = data as WaitlistSuccessResponse;
      setSubmitted({
        fullName: form.fullName,
        email: form.email.trim().toLowerCase(),
        position: success.position,
        alreadyJoined: success.alreadyJoined,
      });
    } catch {
      setSubmitError(
        "We couldn't reach the server. Check your connection and try again.",
      );
    }
  });

  return (
    <div className="wl-page">
      <div className="wl-shell">
        <WaitlistHero />

        <section className="wl-panel">
          {submitted ? (
            <div className="wl-card wl-card--success">
              <WaitlistSuccess
                fullName={submitted.fullName}
                email={submitted.email}
                position={submitted.position}
                alreadyJoined={submitted.alreadyJoined}
                onAddAnother={resetForm}
              />
            </div>
          ) : (
            <div className="wl-card">
              <header className="wl-card-header">
                <h2>Join the waitlist</h2>
              
              </header>

              <WaitlistForm
                form={form}
                errors={errors}
                touched={touched}
                submitError={submitError}
                loading={loading}
                onChange={updateField}
                onBlur={markTouched}
                onSubmit={handleSubmit}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
