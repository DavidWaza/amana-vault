"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";

function AmanaLogo({ size = 48 }: { size?: number }) {
  const scale = size / 48;

  return (
    <div
      className="logo"
      style={{ width: size, height: size, borderWidth: 4 * scale, borderColor: "var(--green2)" }}
    >
      <div
        className="logo-mark"
        style={{ width: 24 * scale, height: 24 * scale, borderWidth: 4 * scale, borderColor: "var(--green2)" }}
      >
        <div className="logo-cross logo-cross-first" />
        <div className="logo-cross logo-cross-second" />
        <div className="logo-dot" style={{ width: 6 * scale, height: 6 * scale }} />
      </div>
    </div>
  );
}

export default function ClientAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 5) {
      setStep("verify");
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/#dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link href="/" className="logo-link" style={{ flexDirection: "column", gap: "1rem" }}>
          <AmanaLogo size={56} />
          <div style={{ textAlign: "center" }}>
            <h1 className="logo-text">Amana</h1>
            <p className="logo-tag" style={{ color: "var(--muted)", marginTop: "0.25rem" }}>Client Portal</p>
          </div>
        </Link>

        <div className="auth-card">
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
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
                <label className="auth-label">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0803 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>

              <div className="auth-actions">
                <button type="submit" className="auth-submit">
                  {isLogin ? "Sign In" : "Create Account"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <div style={{ margin: "0 auto 1rem", width: "4rem", height: "4rem", borderRadius: "999px", background: "var(--soft)", display: "grid", placeItems: "center", fontSize: "1.75rem" }}>
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your number</h2>
                <p style={{ color: "var(--muted)", marginTop: "0.75rem", lineHeight: 1.7 }}>
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

          <div style={{ marginTop: "2rem", borderTop: "1px solid var(--line)", paddingTop: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="auth-switch">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="auth-note">Protected by bank-level security</p>
      </div>
    </div>
  );
}
