"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bank,
  ShieldCheck,
  LockSimple,
  Wrench,
  CheckCircle,
} from "phosphor-react";
import AmanaLogo from "../join-amana/AmanaLogo";
import JoinFormActions from "../join-amana/JoinFormActions";
import { BANK_OPTIONS } from "../join-amana/constants";
import {
  CONTRACTOR_ONBOARDING_STEPS,
  CONTRACTOR_SPECIALTY_OPTIONS,
  EXPERIENCE_OPTIONS,
  INITIAL_CONTRACTOR_ONBOARDING,
  ONBOARDING_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  TEAM_SIZE_OPTIONS,
} from "./onboarding-constants";
import type { ContractorOnboardingForm, ContractorProfile } from "./types";
import { ctField, ctInput, ctLabel } from "./ui";
import {
  isValidPhoneDigits,
  normalizePhoneInput,
  PHONE_DIGIT_LENGTH,
} from "@/app/lib/phone";

type SavedOnboarding = {
  stepIndex: number;
  form: ContractorOnboardingForm;
};

function isCompanyValid(form: ContractorOnboardingForm): boolean {
  return (
    form.companyName.trim().length >= 2 &&
    form.contactName.trim().length >= 2 &&
    isValidPhoneDigits(form.phone) &&
    form.email.includes("@") &&
    form.location.trim().length >= 2
  );
}

function isCapabilitiesValid(form: ContractorOnboardingForm): boolean {
  return (
    form.specialties.length > 0 &&
    form.bio.trim().length >= 20 &&
    form.teamSize.length > 0 &&
    form.yearsExperience.length > 0
  );
}

function isCredentialsValid(form: ContractorOnboardingForm): boolean {
  return form.rcNumber.trim().length >= 4 && form.nin.trim().length === 11;
}

function isBankValid(form: ContractorOnboardingForm): boolean {
  return (
    form.bankName.length > 0 &&
    form.accountNumber.length === 10 &&
    form.accountName.trim().length >= 3
  );
}

function isVerifyValid(otp: string[]): boolean {
  return otp.every((d) => d.length === 1);
}

const TRUST_POINTS = [
  "Verified company profile on the marketplace",
  "Vault-secured milestone payments",
  "Bid on diaspora-funded projects",
];

export default function ContractorOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeParam = searchParams.get("resume");

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<ContractorOnboardingForm>(INITIAL_CONTRACTOR_ONBOARDING);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [hydrated, setHydrated] = useState(false);
  const [rejectedNotice, setRejectedNotice] = useState(false);

  const currentStep = CONTRACTOR_ONBOARDING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / CONTRACTOR_ONBOARDING_STEPS.length) * 100;

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
      const idx = CONTRACTOR_ONBOARDING_STEPS.findIndex((s) => s.id === "credentials");
      if (idx >= 0) setStepIndex(idx);
      setRejectedNotice(true);
    }
  }, [resumeParam]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: SavedOnboarding = { stepIndex, form };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
  }, [stepIndex, form, hydrated]);

  const updateField = <K extends keyof ContractorOnboardingForm>(
    field: K,
    value: ContractorOnboardingForm[K],
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
      case "company":
        return isCompanyValid(form);
      case "capabilities":
        return isCapabilitiesValid(form);
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
    if (stepIndex < CONTRACTOR_ONBOARDING_STEPS.length - 1) {
      setStepIndex((p) => p + 1);
      return;
    }
    finishOnboarding();
  };

  const finishOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);

    const profilePayload: ContractorProfile = {
      companyName: form.companyName,
      rcNumber: form.rcNumber,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      location: form.location,
      bio: form.bio,
      specialties: form.specialties,
      teamSize: form.teamSize,
      yearsExperience: form.yearsExperience,
      rating: null,
      reviewCount: 0,
      completedProjects: 0,
      avatarUrl: null,
      verificationStatus: "pending",
      bankStatus: form.bankName ? "pending" : "none",
      onboardingComplete: true,
      onboardingStep: CONTRACTOR_ONBOARDING_STEPS.length,
      memberSince: new Date().toISOString(),
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profilePayload));
    router.push("/contractor/dashboard");
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
      document.getElementById(`ct-otp-${index + 1}`)?.focus();
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case "company":
        return (
          <>
            <label className={ctField}>
              <span className={ctLabel}>Company / Firm Name</span>
              <input
                className={ctInput}
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="e.g. BuildRight Nigeria Ltd"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Primary Contact Name</span>
              <input
                className={ctInput}
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="e.g. Emeka Okafor"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Phone Number</span>
              <input
                className={ctInput}
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => updateField("phone", normalizePhoneInput(e.target.value))}
                maxLength={PHONE_DIGIT_LENGTH}
                placeholder="08030000000"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Email</span>
              <input
                className={ctInput}
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="projects@company.ng"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Operating Base</span>
              <input
                className={ctInput}
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Abuja, FCT"
                required
              />
            </label>
          </>
        );
      case "capabilities":
        return (
          <>
            <div className={ctField}>
              <span className={ctLabel}>What does your team build? (select all)</span>
              <div className="flex flex-wrap gap-2">
                {CONTRACTOR_SPECIALTY_OPTIONS.map((s) => {
                  const active = form.specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-[0.85rem] py-[0.5rem] rounded-full text-[0.82rem] font-bold border border-solid transition-all duration-200 ${
                        active
                          ? "bg-contractor text-white border-contractor"
                          : "bg-white text-muted border-line hover:border-contractor2"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className={ctField}>
                <span className={ctLabel}>Team Size</span>
                <select
                  className={ctInput}
                  value={form.teamSize}
                  onChange={(e) => updateField("teamSize", e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {TEAM_SIZE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ctField}>
                <span className={ctLabel}>Experience</span>
                <select
                  className={ctInput}
                  value={form.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {EXPERIENCE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className={ctField}>
              <span className={ctLabel}>Company Bio</span>
              <textarea
                className={`${ctInput} min-h-[7rem] resize-y`}
                rows={4}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Describe your typical projects, capacity, and diaspora-build experience..."
                required
              />
            </label>
          </>
        );
      case "credentials":
        return (
          <>
            {rejectedNotice && (
              <div className="rounded-[14px] px-4 py-3 bg-[rgba(244,163,0,0.12)] border border-solid border-[rgba(244,163,0,0.3)] text-[#b7791f] text-[0.85rem] font-semibold">
                Previous verification was declined. Update your registration details and resubmit.
              </div>
            )}
            <div className="flex items-start gap-3 rounded-[14px] px-4 py-3 bg-contractor-soft border border-solid border-contractor-line text-contractor">
              <ShieldCheck size={20} weight="bold" className="shrink-0 mt-[2px]" />
              <p className="m-0 text-[0.85rem] leading-[1.5]">
                Amana Verified Contractors win more bids and unlock vault-protected projects.
              </p>
            </div>
            <label className={ctField}>
              <span className={ctLabel}>CAC / RC Registration Number</span>
              <input
                className={ctInput}
                value={form.rcNumber}
                onChange={(e) => updateField("rcNumber", e.target.value)}
                placeholder="RC-XXXXXXX"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Director&apos;s NIN</span>
              <input
                className={ctInput}
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
            <div className="flex items-start gap-3 rounded-[14px] px-4 py-3 bg-contractor-soft border border-solid border-contractor-line text-contractor">
              <Bank size={20} weight="bold" className="shrink-0 mt-[2px]" />
              <p className="m-0 text-[0.85rem] leading-[1.5]">
                Payout account should be a corporate account matching your CAC registration.
              </p>
            </div>
            <label className={ctField}>
              <span className={ctLabel}>Bank</span>
              <select
                className={ctInput}
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
            <label className={ctField}>
              <span className={ctLabel}>Account Number</span>
              <input
                className={ctInput}
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) =>
                  updateField("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                placeholder="10-digit NUBAN"
                required
              />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Account Name</span>
              <input
                className={ctInput}
                value={form.accountName}
                onChange={(e) => updateField("accountName", e.target.value)}
                placeholder="As registered with the bank"
                required
              />
            </label>
          </>
        );
      case "verify":
        return (
          <>
            <div className="flex items-start gap-3 rounded-[14px] px-4 py-3 bg-contractor-soft border border-solid border-contractor-line text-contractor">
              <LockSimple size={20} weight="bold" className="shrink-0 mt-[2px]" />
              <p className="m-0 text-[0.85rem] leading-[1.5]">
                We sent a 4-digit code to <strong>{form.phone || "your phone"}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`ct-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="h-16 rounded-[18px] border border-solid border-line text-center text-2xl font-extrabold text-text outline-none focus:border-contractor2 focus:shadow-[0_0_0_4px_rgba(180,83,9,0.14)]"
                  required
                />
              ))}
            </div>
            <p className="m-0 text-center text-[0.82rem] text-muted">
              After verification your company goes into review — we&apos;ll confirm within 48 hours.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid lg:grid-cols-2 bg-[linear-gradient(145deg,var(--contractor)_0%,var(--contractor2)_55%,#a35309_100%)] text-white">
      <aside className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 70%, rgba(244,163,0,0.14), transparent 40%)",
          }}
        />
        <Link href="/" className="relative inline-flex items-center gap-2 w-fit">
          <AmanaLogo size={56} variant="white" />
          <span className="text-[1.5rem] font-black tracking-[-0.04em]">Amana Vault</span>
        </Link>
        <div className="relative max-w-md">
          <Wrench size={48} weight="duotone" className="text-[var(--gold-soft)]" />
          <h1 className="mt-4 text-[clamp(2rem,3.5vw,3rem)] font-black leading-[1.05]">
            Join as a Contractor
          </h1>
          <p className="mt-4 text-[1.05rem] leading-[1.7] text-white/85">
            Your construction command center. Bid, build, and get paid through
            milestone-protected vault releases — built for diaspora trust.
          </p>
          <ul className="mt-6 grid gap-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[0.98rem] font-semibold">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-white/15 text-[var(--gold-soft)]">
                  <CheckCircle size={18} weight="fill" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[0.95rem] text-white/75">
          Already registered?{" "}
          <Link href="/auth/contractor" className="font-extrabold underline underline-offset-[3px]">
            Sign in
          </Link>
        </p>
      </aside>

      <section className="flex items-center justify-center p-4 sm:p-8 lg:bg-white/[0.04] lg:border-l lg:border-white/10 min-h-0">
        <div className="w-full max-w-[480px] lg:max-h-[calc(100dvh-4rem)] flex flex-col min-h-0 bg-white text-text rounded-brand-lg shadow-brand-lg border border-solid border-line overflow-hidden">
          <div className="shrink-0 p-8 pb-5 border-b border-solid border-line">
            <span className="inline-block text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-contractor2">
              Step {stepIndex + 1} of {CONTRACTOR_ONBOARDING_STEPS.length}
            </span>
            <h2 className="mt-1 text-[1.5rem] font-black text-green">{currentStep.title}</h2>
            <p className="mt-1 text-[0.95rem] text-muted">{currentStep.subtitle}</p>
            <div className="mt-4 h-[6px] rounded-full bg-contractor-soft overflow-hidden">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--contractor2),var(--contractor3))] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-5 grid gap-4 content-start">
              {renderStep()}
            </div>
            <JoinFormActions
              isFirstStep={stepIndex === 0}
              isLastStep={stepIndex === CONTRACTOR_ONBOARDING_STEPS.length - 1}
              canProceed={canProceed()}
              onBack={handleBack}
            />
          </form>
        </div>
      </section>
    </div>
  );
}
