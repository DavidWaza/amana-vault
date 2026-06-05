import { getCategoryConfig } from "./agreement-templates";
import type { CreateAgreementForm, CreateAgreementStep } from "./types";

export function validateAgreementStep(
  form: CreateAgreementForm,
  step: CreateAgreementStep,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === "category") {
    if (!form.categoryId) {
      errors.categoryId = "Select the type of work you are protecting.";
    }
  }

  if (step === "details" || step === "terms" || step === "client" || step === "summary") {
    const config = getCategoryConfig(form.categoryId);

    config.sections.forEach((section) => {
      const selected = form.selections[section.id] ?? [];
      const hasOther = section.allowOther && form.otherTexts[`${section.id}_other`]?.trim();
      const hasCustom =
        section.allowCustomInput &&
        section.customInputKey &&
        form.customTexts[section.customInputKey]?.trim();

      if (
        section.id === "work_description" &&
        section.customInputKey &&
        !form.customTexts[section.customInputKey]?.trim()
      ) {
        errors[section.customInputKey] = "Describe the work.";
      } else if (selected.length === 0 && !hasOther && !hasCustom) {
        errors[section.id] = `Select at least one option for "${section.title}".`;
      }

      if (
        section.allowCustomInput &&
        selected.includes("specific") &&
        !form.customTexts[section.customInputKey ?? ""]?.trim()
      ) {
        errors[section.customInputKey ?? section.id] = "Enter the specific depth.";
      }
    });
  }

  if (step === "terms" || step === "client" || step === "summary") {
    const price = Number(form.price.replace(/,/g, ""));
    if (!form.price.trim()) {
      errors.price = "Enter the protected price.";
    } else if (Number.isNaN(price) || price < 5000) {
      errors.price = "Minimum agreement amount is ₦5,000.";
    }

    if (!form.startDate) errors.startDate = "Start date is required.";
    if (!form.finishDate) errors.finishDate = "Finish date is required.";

    if (form.startDate && form.finishDate) {
      const start = new Date(form.startDate);
      const finish = new Date(form.finishDate);
      if (finish < start) {
        errors.finishDate = "Finish date must be on or after start date.";
      }
    }

    if (form.warranty === "custom" && !form.warrantyCustom.trim()) {
      errors.warrantyCustom = "Describe your custom warranty.";
    }

    if (form.changesPolicy.length === 0) {
      errors.changesPolicy = "Select how extra work should be handled.";
    }
  }

  if (step === "client" || step === "summary") {
    if (!form.clientId) {
      errors.clientId = "Select a client to send this agreement to.";
    }
  }

  return errors;
}
