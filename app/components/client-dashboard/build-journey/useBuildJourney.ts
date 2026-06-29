"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BUILD_JOURNEY_STEPS,
  EMPTY_BUILD_JOURNEY_FORM,
  type BuildJourneyForm,
} from "./types";

export const BUILD_JOURNEY_DRAFT_KEY = "amana-client-build-journey-draft";

export function useBuildJourney(open: boolean) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<BuildJourneyForm>(EMPTY_BUILD_JOURNEY_FORM);
  const [hydrated, setHydrated] = useState(false);

  const step = BUILD_JOURNEY_STEPS[stepIndex];
  const isWelcome = step === "welcome";
  const flowStep = isWelcome ? 0 : stepIndex;
  const flowTotal = BUILD_JOURNEY_STEPS.length - 1;

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(BUILD_JOURNEY_DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          stepIndex?: number;
          form?: BuildJourneyForm;
        };
        if (saved.form) setForm({ ...EMPTY_BUILD_JOURNEY_FORM, ...saved.form });
        if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [open]);

  useEffect(() => {
    if (!open || !hydrated) return;
    const { inspirationImages, landDocuments, ...draftForm } = form;
    localStorage.setItem(
      BUILD_JOURNEY_DRAFT_KEY,
      JSON.stringify({
        stepIndex,
        form: {
          ...draftForm,
          inspirationImageCount: inspirationImages.length,
          landDocumentCount: landDocuments.length,
        },
      }),
    );
  }, [open, hydrated, stepIndex, form]);

  const patchForm = useCallback((patch: Partial<BuildJourneyForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setForm(EMPTY_BUILD_JOURNEY_FORM);
    localStorage.removeItem(BUILD_JOURNEY_DRAFT_KEY);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, BUILD_JOURNEY_STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setStepIndex(Math.max(0, Math.min(index, BUILD_JOURNEY_STEPS.length - 1)));
  }, []);

  return {
    step,
    stepIndex,
    flowStep,
    flowTotal,
    form,
    setForm,
    patchForm,
    goNext,
    goBack,
    goToStep,
    reset,
    isWelcome,
  };
}
