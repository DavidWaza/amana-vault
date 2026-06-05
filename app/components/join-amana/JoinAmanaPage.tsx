"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JoinAmanaHero from "./JoinAmanaHero";
import JoinAmanaIntro from "./JoinAmanaIntro";
import JoinAmanaSuccess from "./JoinAmanaSuccess";
import JoinFormHeader from "./JoinFormHeader";
import JoinFormActions from "./JoinFormActions";
import ProfileStep from "./steps/ProfileStep";
import TradeStep from "./steps/TradeStep";
import LocationStep from "./steps/LocationStep";
import IdentityStep from "./steps/IdentityStep";
import BankStep from "./steps/BankStep";
import PhoneVerifyStep from "./steps/PhoneVerifyStep";
import {
  INITIAL_FORM,
  INITIAL_IDENTITY_FILES,
  INITIAL_TOUCHED,
} from "./constants";
import {
  isBankStepValid,
  isIdentityStepValid,
  isLocationStepValid,
  isPhoneVerifyStepValid,
  isProfileStepValid,
  isTradeStepValid,
} from "./validation";
import { JOIN_STEPS, type ArtisanFormData, type JoinTouchedState } from "./types";

export default function JoinAmanaPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [complete, setComplete] = useState(false);
  const [form, setForm] = useState<ArtisanFormData>(INITIAL_FORM);
  const [identityFiles, setIdentityFiles] = useState(INITIAL_IDENTITY_FILES);
  const [governmentIdPreview, setGovernmentIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [identityConsent, setIdentityConsent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [touched, setTouched] = useState<JoinTouchedState>(INITIAL_TOUCHED);

  const currentStep = JOIN_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / JOIN_STEPS.length) * 100;

  const updateField = <K extends keyof ArtisanFormData>(
    field: K,
    value: ArtisanFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof JoinTouchedState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resetIdentityFiles = () => {
    if (governmentIdPreview) URL.revokeObjectURL(governmentIdPreview);
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setIdentityFiles(INITIAL_IDENTITY_FILES);
    setGovernmentIdPreview(null);
    setSelfiePreview(null);
    setIdentityConsent(false);
  };

  const resetFormState = () => {
    setForm(INITIAL_FORM);
    resetIdentityFiles();
    setOtp(["", "", "", ""]);
    setTouched(INITIAL_TOUCHED);
  };

  const updateCategory = (value: string) => {
    setForm((prev) => ({
      ...prev,
      category: value,
      otherTrade: value === "other" ? prev.otherTrade : "",
    }));
    if (value !== "other") {
      setTouched((prev) => ({ ...prev, otherTrade: false }));
    }
  };

  const showOtherTradeError =
    touched.otherTrade &&
    form.category === "other" &&
    form.otherTrade.trim().length <= 2;

  useEffect(() => {
    return () => {
      if (governmentIdPreview) URL.revokeObjectURL(governmentIdPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [governmentIdPreview, selfiePreview]);

  const handleGovernmentIdChange = (file: File | null) => {
    if (governmentIdPreview) URL.revokeObjectURL(governmentIdPreview);

    if (!file) {
      setIdentityFiles((prev) => ({ ...prev, governmentId: null }));
      setGovernmentIdPreview(null);
      return;
    }

    setIdentityFiles((prev) => ({ ...prev, governmentId: file }));
    setGovernmentIdPreview(URL.createObjectURL(file));
    setTouched((prev) => ({ ...prev, governmentId: true }));
  };

  const handleSelfieChange = (file: File | null) => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);

    if (!file) {
      setIdentityFiles((prev) => ({ ...prev, selfie: null }));
      setSelfiePreview(null);
      return;
    }

    setIdentityFiles((prev) => ({ ...prev, selfie: file }));
    setSelfiePreview(URL.createObjectURL(file));
    setTouched((prev) => ({ ...prev, selfie: true }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case "profile":
        return isProfileStepValid(form);
      case "trade":
        return isTradeStepValid(form);
      case "location":
        return isLocationStepValid(form);
      case "identity":
        return isIdentityStepValid(form, identityFiles, identityConsent);
      case "bank":
        return isBankStepValid(form);
      case "verify":
        return isPhoneVerifyStepValid(otp);
      default:
        return false;
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep.id) {
      case "profile":
        setTouched((prev) => ({
          ...prev,
          dateOfBirth: true,
          password: true,
          confirmPassword: true,
        }));
        return isProfileStepValid(form);
      case "trade":
        setTouched((prev) => ({ ...prev, otherTrade: true }));
        return isTradeStepValid(form);
      case "identity":
        setTouched((prev) => ({
          ...prev,
          nin: true,
          governmentId: true,
          selfie: true,
        }));
        return isIdentityStepValid(form, identityFiles, identityConsent);
      case "bank":
        setTouched((prev) => ({
          ...prev,
          bankName: true,
          accountNumber: true,
          accountName: true,
        }));
        return isBankStepValid(form);
      default:
        return canProceed();
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (stepIndex < JOIN_STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    setComplete(true);
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    } else {
      setStarted(false);
      resetFormState();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 3) {
      document.getElementById(`join-otp-${index + 1}`)?.focus();
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case "profile":
        return (
          <ProfileStep
            data={{
              fullName: form.fullName,
              dateOfBirth: form.dateOfBirth,
              phone: form.phone,
              email: form.email,
              password: form.password,
              confirmPassword: form.confirmPassword,
            }}
            onChange={updateField}
            touched={{
              dateOfBirth: touched.dateOfBirth,
              password: touched.password,
              confirmPassword: touched.confirmPassword,
            }}
            onBlur={markTouched}
          />
        );
      case "trade":
        return (
          <TradeStep
            data={{
              category: form.category,
              otherTrade: form.otherTrade,
              bio: form.bio,
            }}
            onChange={updateField}
            onCategoryChange={updateCategory}
            showOtherTradeError={showOtherTradeError}
            onOtherTradeBlur={() => markTouched("otherTrade")}
          />
        );
      case "location":
        return (
          <LocationStep
            data={{ area: form.area, travelRadius: form.travelRadius }}
            onChange={updateField}
          />
        );
      case "identity":
        return (
          <IdentityStep
            data={{ nin: form.nin }}
            files={identityFiles}
            governmentIdPreview={governmentIdPreview}
            selfiePreview={selfiePreview}
            identityConsent={identityConsent}
            touched={{
              nin: touched.nin,
              governmentId: touched.governmentId,
              selfie: touched.selfie,
            }}
            onChange={updateField}
            onBlur={markTouched}
            onGovernmentIdChange={handleGovernmentIdChange}
            onSelfieChange={handleSelfieChange}
            onConsentChange={setIdentityConsent}
          />
        );
      case "bank":
        return (
          <BankStep
            data={{
              bankName: form.bankName,
              accountNumber: form.accountNumber,
              accountName: form.accountName,
            }}
            touched={{
              bankName: touched.bankName,
              accountNumber: touched.accountNumber,
              accountName: touched.accountName,
            }}
            onChange={updateField}
            onBlur={markTouched}
          />
        );
      case "verify":
        return (
          <PhoneVerifyStep
            phone={form.phone}
            otp={otp}
            onOtpChange={handleOtpChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="join-amana-page">
      <div className="join-amana-shell">
        <JoinAmanaHero
          started={started}
          onStart={() => setStarted(true)}
          onJoinAsClient={() => router.push("/auth/client")}
        />

        <section className="join-amana-panel">
          {!started ? (
            <JoinAmanaIntro onStart={() => setStarted(true)} />
          ) : complete ? (
            <JoinAmanaSuccess
              fullName={form.fullName}
              phone={form.phone}
              onGoToPortal={() => router.push("/artisan/dashboard")}
            />
          ) : (
            <div className="join-amana-form-card">
              <JoinFormHeader stepIndex={stepIndex} progress={progress} />

              <form
                className="join-amana-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!validateCurrentStep()) return;
                  handleNext();
                }}
              >
                <div className="join-amana-form-scroll">{renderStep()}</div>
                <JoinFormActions
                  isFirstStep={stepIndex === 0}
                  isLastStep={stepIndex === JOIN_STEPS.length - 1}
                  canProceed={canProceed()}
                  onBack={handleBack}
                />
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
