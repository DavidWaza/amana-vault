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

// function AmanaLogo({ size = 48 }: { size?: number }) {
//   const scale = size / 48;

//   return (
//     <div
//       className="logo"
//       style={{ width: size, height: size, borderWidth: 4 * scale, borderColor: "var(--green2)" }}
//     >
//       <div
//         className="logo-mark"
//         style={{ width: 24 * scale, height: 24 * scale, borderWidth: 4 * scale, borderColor: "var(--green2)" }}
//       >
//         <div className="logo-cross logo-cross-first" />
//         <div className="logo-cross logo-cross-second" />
//         <div className="logo-dot" style={{ width: 6 * scale, height: 6 * scale }} />
//       </div>
//     </div>
//   );
// }

export default function ClientAuthPage() {
  
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
    router.push("/client/dashboard");
  };

  return (
    <div className="auth-page auth-page--client">
      <div className="auth-container">
        <Link href="/" className="logo-link auth-brand">
        <AmanaLogo variant="green" size={80} />
          <div>
            <h1 className="logo-text auth-brand-title">Amana</h1>
            <p className="auth-portal-tag auth-portal-tag--client">Client Portal</p>
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{isLogin ? "Welcome back" : "Create an account"}</h2>
            <p>{isLogin ? "Sign in to manage your protected payments." : "Protect your money before work begins."}</p>
          </div>

          {step === "auth" ? (
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <input type="text" placeholder="e.g. Adaeze Obi" required className="auth-input" />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="client-phone">
                  Phone Number
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="client-phone"
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
                  className="auth-submit"
                  disabled={!isValidPhoneDigits(phone)}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="auth-card-header">
                <div className="auth-verify-icon">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p>
                  We sent a 4-digit code to <strong>{phone}</strong>. Enter it below to continue.
                </p>
              </div>
              <div className="auth-otp-grid">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} type="text" maxLength={1} required className="auth-otp-input" />
                ))}
              </div>
              <div className="auth-actions">
                <button type="submit" className="auth-submit">
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
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="auth-switch">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="auth-note">Funds held by CBN-licensed financial partners</p>
        <p className="auth-disclaimer">
          Amana is a technology platform, not a bank or financial institution. All escrowed funds are held securely in custody by our licensed partner bank.
        </p>
      </div>
    </div>
  );
}
