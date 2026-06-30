"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";
import AmanaLogo from "@/app/components/join-amana/AmanaLogo";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import {
  isValidPhoneDigits,
  normalizePhoneInput,
  PHONE_DIGIT_LENGTH,
} from "@/app/lib/phone";

export default function ContractorAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const router = useRouter();

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhoneInput(value));
    if (phoneError) setPhoneError(null);
  };

  const [handleAuthSubmit, authLoading] = useAsyncAction((e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      setPhoneError(`Enter exactly ${PHONE_DIGIT_LENGTH} digits.`);
      return;
    }
    setPhoneError(null);
    setStep("verify");
  });

  const [handleVerifySubmit, verifyLoading] = useAsyncAction((e: React.FormEvent) => {
    e.preventDefault();
    router.push(isLogin ? "/contractor/dashboard" : "/contractor/onboarding");
  });

  return (
    <div className="auth-page auth-page--contractor">
      <div className="max-w-[440px] mx-auto flex flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center text-center">
          <AmanaLogo variant="green" size={80} />
          <div>
            <h1 className="logo-text m-0">Amana</h1>
            <p className="auth-portal-tag auth-portal-tag--contractor">Contractor Portal</p>
          </div>
        </Link>

        <div className="auth-card">
          <div className="mb-8 text-center">
            <h2>{isLogin ? "Welcome back" : "Create a contractor account"}</h2>
            <p>
              {isLogin
                ? "Sign in to manage bids, builds, and vault-protected payments."
                : "Join verified construction teams on diaspora-backed projects."}
            </p>
          </div>

          {step === "auth" ? (
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <div className="grid gap-2 mb-4">
                  <label className="auth-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. BuildRight Nigeria Ltd"
                    required
                    className="auth-input"
                  />
                </div>
              )}

              <div className="grid gap-2 mb-4">
                <label className="auth-label" htmlFor="contractor-phone">
                  Phone Number
                </label>
                <div className="flex flex-col gap-[0.2rem]">
                  <input
                    id="contractor-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="e.g. 08030000000"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    minLength={PHONE_DIGIT_LENGTH}
                    maxLength={PHONE_DIGIT_LENGTH}
                    pattern="\d{11}"
                    required
                    aria-invalid={phoneError ? true : undefined}
                    className={`auth-input${phoneError ? " auth-input--error" : ""}`}
                  />
                  <p className="m-0 px-[0.35rem] text-[0.72rem] font-bold text-muted leading-[1.2] text-right">
                    {phone.length}/{PHONE_DIGIT_LENGTH} digits
                  </p>
                </div>
                {phoneError && (
                  <p className="m-0 text-[0.8rem] font-bold text-[#c53030] leading-[1.45]">
                    {phoneError}
                  </p>
                )}
              </div>

              <div className="grid gap-4 mt-4">
                <Button
                  type="submit"
                  className="auth-submit auth-submit--contractor"
                  disabled={!isValidPhoneDigits(phone)}
                  loading={authLoading}
                  loadingLabel={isLogin ? "Signing in…" : "Continuing…"}
                >
                  {isLogin ? "Sign In" : "Continue"}
                </Button>
              </div>

              {!isLogin && (
                <p className="m-0 mt-3 px-[0.35rem] text-[0.72rem] font-bold text-muted leading-[1.2] text-right">
                  After sign-up you&apos;ll complete company onboarding and verification.
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="mb-8 text-center">
                <div className="auth-verify-icon auth-verify-icon--contractor">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p>
                  We sent a 4-digit code to <strong>{phone}</strong>.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} type="text" maxLength={1} required className="auth-otp-input" />
                ))}
              </div>
              <div className="grid gap-4 mt-4">
                <Button
                  type="submit"
                  className="auth-submit auth-submit--contractor"
                  loading={verifyLoading}
                  loadingLabel="Verifying…"
                >
                  Verify & Continue
                </Button>
                <button type="button" onClick={() => setStep("auth")} className="auth-switch">
                  Change phone number
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider">
            <p>
              {isLogin ? "New to Amana?" : "Already registered?"}{" "}
              {isLogin ? (
                <Link href="/join-amana" className="auth-switch">
                  Choose your role
                </Link>
              ) : (
                <button type="button" onClick={() => setIsLogin(true)} className="auth-switch">
                  Sign in
                </button>
              )}
            </p>
          </div>
        </div>

        <p className="auth-note">Vault funds held by CBN-licensed financial partners</p>
      </div>
    </div>
  );
}
