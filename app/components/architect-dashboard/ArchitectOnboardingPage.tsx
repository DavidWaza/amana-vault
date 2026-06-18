"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Buildings,
  Bank,
  ShieldCheck,
  LockSimple,
} from "phosphor-react";
import AmanaLogo from "../join-amana/AmanaLogo";
import JoinFormActions from "../join-amana/JoinFormActions";
import { BANK_OPTIONS } from "../join-amana/constants";
import {
  ARCHITECT_ONBOARDING_STEPS,
  ARCHITECT_SPECIALTY_OPTIONS,
  INITIAL_ARCHITECT_ONBOARDING,
  ONBOARDING_STORAGE_KEY,
} from "./onboarding-constants";
import type { ArchitectOnboardingForm } from "./types";
import {
  isValidPhoneDigits,
  normalizePhoneInput,
  PHONE_DIGIT_LENGTH,
} from "@/app/lib/phone";

type SavedOnboarding = {
  stepIndex: number;
  form: ArchitectOnboardingForm;
};

function isStudioValid(form: ArchitectOnboardingForm): boolean {
  return (
    form.studioName.trim().length >= 2 &&
    form.contactName.trim().length >= 2 &&
    isValidPhoneDigits(form.phone) &&
    form.email.includes("@") &&
    form.location.trim().length >= 2
  );
}

function isPortfolioValid(form: ArchitectOnboardingForm): boolean {
  return form.specialties.length > 0 && form.bio.trim().length >= 20;
}

function isCredentialsValid(form: ArchitectOnboardingForm): boolean {
  return form.licenseNumber.trim().length >= 4 && form.nin.trim().length === 11;
}

function isBankValid(form: ArchitectOnboardingForm): boolean {
  return (
    form.bankName.length > 0 &&
    form.accountNumber.length === 10 &&
    form.accountName.trim().length >= 3
  );
}

function isVerifyValid(otp: string[]): boolean {
  return otp.every((d) => d.length === 1);
}

export default function ArchitectOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeParam = searchParams.get("resume");

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<ArchitectOnboardingForm>(INITIAL_ARCHITECT_ONBOARDING);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [hydrated, setHydrated] = useState(false);
  const [rejectedNotice, setRejectedNotice] = useState(false);

  const currentStep = ARCHITECT_ONBOARDING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / ARCHITECT_ONBOARDING_STEPS.length) * 100;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedOnboarding;
        setForm(parsed.form);
        setStepIndex(parsed.stepIndex);
      }
    } catch {
      /* fresh start */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (resumeParam === "credentials") {
      const idx = ARCHITECT_ONBOARDING_STEPS.findIndex((s) => s.id === "credentials");
      if (idx >= 0) setStepIndex(idx);
      setRejectedNotice(true);
    }
  }, [resumeParam]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: SavedOnboarding = { stepIndex, form };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
  }, [stepIndex, form, hydrated]);

  const updateField = <K extends keyof ArchitectOnboardingForm>(
    field: K,
    value: ArchitectOnboardingForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (specialty: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case "studio":
        return isStudioValid(form);
      case "portfolio":
        return isPortfolioValid(form);
      case "credentials":
        return isCredentialsValid(form);
      case "bank":
        return isBankValid(form);
      case "verify":
        return isVerifyValid(otp);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (stepIndex < ARCHITECT_ONBOARDING_STEPS.length - 1) {
      setStepIndex((p) => p + 1);
      return;
    }
    finishOnboarding();
  };

  const finishOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);

    const profilePayload = {
      studioName: form.studioName,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      location: form.location,
      bio: form.bio,
      specialties: form.specialties,
      licenseNumber: form.licenseNumber,
      rating: null,
      reviewCount: 0,
      avatarUrl: null,
      verificationStatus: "pending" as const,
      bankStatus: form.bankName ? ("pending" as const) : ("none" as const),
      onboardingComplete: true,
      onboardingStep: ARCHITECT_ONBOARDING_STEPS.length,
      subscriptionPlan: "free" as const,
    };

    localStorage.setItem("amana-architect-profile", JSON.stringify(profilePayload));
    router.push("/architect/dashboard");
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((p) => p - 1);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) {
      document.getElementById(`arch-otp-${index + 1}`)?.focus();
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case "studio":
        return (
          <>
            <label className="ap-onboard-field">
              Studio / Firm Name
              <input
                value={form.studioName}
                onChange={(e) => updateField("studioName", e.target.value)}
                placeholder="e.g. Okumagba Design Studio"
                required
              />
            </label>
            <label className="ap-onboard-field">
              Primary Contact Name
              <input
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="e.g. Chidi Okumagba"
                required
              />
            </label>
            <label className="ap-onboard-field">
              Phone Number
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => updateField("phone", normalizePhoneInput(e.target.value))}
                maxLength={PHONE_DIGIT_LENGTH}
                placeholder="08030000000"
                required
              />
            </label>
            <label className="ap-onboard-field">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="studio@example.com"
                required
              />
            </label>
            <label className="ap-onboard-field">
              Primary Location
              <input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Lagos, Nigeria"
                required
              />
            </label>
          </>
        );
      case "portfolio":
        return (
          <>
            <p className="ap-onboard-hint">Select at least one specialty.</p>
            <div className="ap-onboard-chips">
              {ARCHITECT_SPECIALTY_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ap-onboard-chip${form.specialties.includes(s) ? " ap-onboard-chip--active" : ""}`}
                  onClick={() => toggleSpecialty(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="ap-onboard-field">
              Studio Bio
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Describe your design approach, typical project sizes, and diaspora experience..."
                required
              />
            </label>
            <label className="ap-onboard-field">
              Portfolio Link (optional)
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                placeholder="https://"
              />
            </label>
          </>
        );
      case "credentials":
        return (
          <>
            {rejectedNotice && (
              <div className="ap-onboard-alert ap-onboard-alert--warning">
                Previous verification was declined. Update your license details and resubmit.
              </div>
            )}
            <div className="ap-onboard-banner">
              <ShieldCheck size={20} weight="bold" />
              <p>
                Amana Verified Architects receive more client trust and faster proposal acceptance.
              </p>
            </div>
            <label className="ap-onboard-field">
              ARCON / License Number
              <input
                value={form.licenseNumber}
                onChange={(e) => updateField("licenseNumber", e.target.value)}
                placeholder="ARCON-XXXX-XXXX"
                required
              />
            </label>
            <label className="ap-onboard-field">
              NIN
              <input
                inputMode="numeric"
                value={form.nin}
                onChange={(e) => updateField("nin", e.target.value.replace(/\D/g, "").slice(0, 11))}
                maxLength={11}
                placeholder="11-digit NIN"
                required
              />
            </label>
          </>
        );
      case "bank":
        return (
          <>
            <div className="ap-onboard-banner">
              <Bank size={20} weight="bold" />
              <p>Payout account must match the name on your government ID.</p>
            </div>
            <label className="ap-onboard-field">
              Bank
              <select
                value={form.bankName}
                onChange={(e) => updateField("bankName", e.target.value)}
                required
              >
                <option value="">Select bank...</option>
                {BANK_OPTIONS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-onboard-field">
              Account Number
              <input
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) =>
                  updateField("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                required
              />
            </label>
            <label className="ap-onboard-field">
              Account Name
              <input
                value={form.accountName}
                onChange={(e) => updateField("accountName", e.target.value)}
                required
              />
            </label>
          </>
        );
      case "verify":
        return (
          <>
            <div className="ap-onboard-banner">
              <LockSimple size={20} weight="bold" />
              <p>
                We sent a 4-digit code to <strong>{form.phone}</strong>.
              </p>
            </div>
            <div className="ap-onboard-otp">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`arch-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  required
                />
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ap-onboarding-page">
      <aside className="ap-onboarding-hero">
        <Link href="/" className="ap-onboarding-brand">
          <AmanaLogo size={64} variant="white" />
          <span>Amana Vault</span>
        </Link>
        <div className="ap-onboarding-hero-content">
          <Buildings size={48} weight="duotone" />
          <h1>Join as an Architect</h1>
          <p>
            Design with confidence. Get paid through milestone-protected vault releases — built for
            diaspora construction trust.
          </p>
          <ul>
            <li>Verified studio profile on the marketplace</li>
            <li>Vault-secured milestone payments</li>
            <li>Direct design requests from clients</li>
          </ul>
        </div>
        <p className="ap-onboarding-login">
          Already registered? <Link href="/auth/architect">Sign in</Link>
        </p>
      </aside>

      <section className="ap-onboarding-panel">
        <div className="ap-onboarding-card">
          <div className="ap-onboarding-header">
            <span>
              Step {stepIndex + 1} of {ARCHITECT_ONBOARDING_STEPS.length}
            </span>
            <h2>{currentStep.title}</h2>
            <p>{currentStep.subtitle}</p>
            <div className="ap-onboarding-progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <form
            className="ap-onboarding-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <div className="ap-onboarding-scroll">{renderStep()}</div>
            <JoinFormActions
              isFirstStep={stepIndex === 0}
              isLastStep={stepIndex === ARCHITECT_ONBOARDING_STEPS.length - 1}
              canProceed={canProceed()}
              onBack={handleBack}
            />
          </form>

          {stepIndex > 0 && (
            <p className="ap-onboarding-resume">
              Your progress is saved. You can return anytime to finish setup.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
