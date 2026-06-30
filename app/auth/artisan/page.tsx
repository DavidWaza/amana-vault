"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
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
    router.push("/artisan/dashboard");
  });

  return (
    <div className="auth-page auth-page--artisan">
      <div className="max-w-[440px] mx-auto flex flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center text-center">
          <AmanaLogo size={56} />
          <div>
            <h1 className="logo-text m-0">Amana</h1>
            {/* <span className="auth-portal-tag auth-portal-tag--artisan">Artisan Portal</span> */}
          </div>
        </Link>

        <div className="auth-card">
          <div className="mb-8 text-center">
            <h2>{isLogin ? "Welcome back, Pro" : "Join Amana as a Pro"}</h2>
            <p>{isLogin ? "Sign in to view your secured jobs." : "Get guaranteed payments for your work."}</p>
          </div>

          {step === "auth" ? (
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <>
                  <div className="grid gap-2 mb-4">
                    <label className="auth-label">Full Name</label>
                    <input type="text" placeholder="e.g. Musa Ibrahim" required className="auth-input" />
                  </div>
                  <div className="grid gap-2 mb-4">
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

              <div className="grid gap-2 mb-4">
                <label className="auth-label" htmlFor="artisan-phone">
                  Phone Number
                </label>
                <div className="flex flex-col gap-[0.2rem]">
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
                  className="auth-submit"
                  disabled={!isValidPhoneDigits(phone)}
                  loading={authLoading}
                  loadingLabel={isLogin ? "Signing in…" : "Creating account…"}
                >
                  {isLogin ? "Sign In" : "Create Artisan Account"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="mb-8 text-center">
                <div className="auth-verify-icon auth-verify-icon--artisan">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p>
                  We sent a 4-digit code to <strong>{phone}</strong>. Enter it below to access your jobs.
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
                  className="auth-submit"
                  loading={verifyLoading}
                  loadingLabel="Verifying…"
                >
                  Verify & Access Dashboard
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
              <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="auth-switch">
                {isLogin ? "Apply as a Pro" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="auth-note">Launching with Abuja businesses</p>
        <p className="mt-4 text-[0.78rem] text-muted leading-[1.5] text-center">
          Amana is a technology platform, not a bank or financial institution. All escrowed payments are held securely in custody by our CBN-licensed partner financial institutions.
        </p>
      </div>
    </div>
  );
}
