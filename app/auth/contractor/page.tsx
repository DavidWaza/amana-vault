"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";
import AmanaLogo from "@/app/components/join-amana/AmanaLogo";
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      setPhoneError(`Enter exactly ${PHONE_DIGIT_LENGTH} digits.`);
      return;
    }
    setPhoneError(null);
    setStep("verify");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/join-amana");
  };

  return (
    <div className="auth-page auth-page--contractor">
      <div className="auth-container">
        <Link href="/" className="logo-link auth-brand">
          <AmanaLogo variant="green" size={80} />
          <div>
            <h1 className="logo-text auth-brand-title">Amana</h1>
            <p className="auth-portal-tag auth-portal-tag--contractor">Contractor Portal</p>
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
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
                <div className="auth-field">
                  <label className="auth-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. BuildRight Nigeria Ltd"
                    required
                    className="auth-input"
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="contractor-phone">
                  Phone Number
                </label>
                <div className="auth-input-wrap">
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
                  <p className="auth-field-hint">
                    {phone.length}/{PHONE_DIGIT_LENGTH} digits
                  </p>
                </div>
                {phoneError && <p className="auth-field-error">{phoneError}</p>}
              </div>

              <div className="auth-actions">
                <button
                  type="submit"
                  className="auth-submit auth-submit--contractor"
                  disabled={!isValidPhoneDigits(phone)}
                >
                  {isLogin ? "Sign In" : "Continue"}
                </button>
              </div>

              {!isLogin && (
                <p className="auth-field-hint" style={{ marginTop: "0.75rem" }}>
                  Full contractor onboarding launches soon. You&apos;ll complete company verification
                  after sign-up.
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="auth-card-header">
                <div className="auth-verify-icon auth-verify-icon--contractor">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p>
                  We sent a 4-digit code to <strong>{phone}</strong>.
                </p>
              </div>
              <div className="auth-otp-grid">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} type="text" maxLength={1} required className="auth-otp-input" />
                ))}
              </div>
              <div className="auth-actions">
                <button type="submit" className="auth-submit auth-submit--contractor">
                  Verify & Continue
                </button>
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
