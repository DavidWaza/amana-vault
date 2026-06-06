"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";
import {
  isValidPhoneDigits,
  normalizePhoneInput,
  PHONE_DIGIT_LENGTH,
} from "@/app/lib/phone";

function AmanaLogo({ size = 48 }: { size?: number }) {
  const scale = size / 48;

  return (
    <div
      className="logo"
      style={{ width: size, height: size, borderWidth: 4 * scale, borderColor: "var(--artisan2)" }}
    >
      <div
        className="logo-mark"
        style={{ width: 24 * scale, height: 24 * scale, borderWidth: 4 * scale, borderColor: "var(--artisan2)" }}
      >
        <div className="logo-cross logo-cross-first" />
        <div className="logo-cross logo-cross-second" />
        <div className="logo-dot" style={{ width: 6 * scale, height: 6 * scale }} />
      </div>
    </div>
  );
}

export default function ArtisanAuthPage() {
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
    router.push("/artisan/dashboard");
  };

  return (
    <div className="auth-page auth-page--artisan">
      <div className="auth-container">
        <Link href="/" className="logo-link auth-brand">
          <AmanaLogo size={56} />
          <div>
            <h1 className="logo-text auth-brand-title">Amana</h1>
            {/* <span className="auth-portal-tag auth-portal-tag--artisan">Artisan Portal</span> */}
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{isLogin ? "Welcome back, Pro" : "Join Amana as a Pro"}</h2>
            <p>{isLogin ? "Sign in to view your secured jobs." : "Get guaranteed payments for your work."}</p>
          </div>

          {step === "auth" ? (
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <>
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input type="text" placeholder="e.g. Musa Ibrahim" required className="auth-input" />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Service Category</label>
                    <select required className="auth-select">
                      <option value="" disabled>
                        Select your trade...
                      </option>
                      <option value="borehole">Borehole Drilling</option>
                      <option value="solar">Solar & Electrical</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="carpentry">Carpentry & Furniture</option>
                      <option value="painting">Painting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="artisan-phone">
                  Phone Number
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="artisan-phone"
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
                  {isLogin ? "Sign In" : "Create Artisan Account"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="auth-card-header">
                <div className="auth-verify-icon auth-verify-icon--artisan">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p>
                  We sent a 4-digit code to <strong>{phone}</strong>. Enter it below to access your jobs.
                </p>
              </div>
              <div className="auth-otp-grid">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} type="text" maxLength={1} required className="auth-otp-input" />
                ))}
              </div>
              <div className="auth-actions">
                <button type="submit" className="auth-submit">
                  Verify & Access Dashboard
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
              <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="auth-switch">
                {isLogin ? "Apply as a Pro" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="auth-note">Launching with Abuja businesses</p>
        <p className="auth-disclaimer">
          Amana is a technology platform, not a bank or financial institution. All escrowed payments are held securely in custody by our CBN-licensed partner financial institutions.
        </p>
      </div>
    </div>
  );
}
