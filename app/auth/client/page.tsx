"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockSimple } from "phosphor-react";
import AmanaLogo from "@/app/components/join-amana/AmanaLogo";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";

export default function ClientAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const [handleAuthSubmit, authLoading] = useAsyncAction((e: React.FormEvent) => {
    e.preventDefault();
    setStep("verify");
  });

  const [handleVerifySubmit, verifyLoading] = useAsyncAction((e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      router.push("/client/dashboard");
    } else {
      router.push("/client/onboarding");
    }
  });

  return (
    <div className=" auth-page--client">
      <div className="max-w-[440px] mx-auto flex flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center text-center">
          <AmanaLogo variant="green" size={80} />
          <div>
            <h1 className="logo-text m-0">Amana</h1>
            <p className="auth-portal-tag auth-portal-tag--client">
              Client Portal
            </p>
          </div>
        </Link>

        <div className="auth-card">
          {step === "auth" ? (
            <div>
              <div className="mb-8 text-center">
                <h2>{isLogin ? "Welcome back" : "Create an account"}</h2>
                <p className="text-sm text-muted -mt-1">
                  {isLogin
                    ? "Sign in to manage your protected payments."
                    : "Protect your money before work begins."}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit}>
                {!isLogin && (
                  <div className="grid gap-2 mb-4">
                    <label className="auth-label">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Adaeze Obi"
                      required
                      className="auth-input"
                    />
                  </div>
                )}

                <div className="grid gap-2 mb-4">
                  <label className="auth-label" htmlFor="client-email">
                    Email
                  </label>
                  <div className="flex flex-col gap-[0.2rem]">
                    <input
                      id="client-email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. musa@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`auth-input`}
                    />
                  </div>
                </div>

                <div className="grid gap-4 mt-4">
                  <Button
                    type="submit"
                    className="auth-submit"
                    disabled={!email}
                    loading={authLoading}
                    loadingLabel={isLogin ? "Signing in…" : "Creating account…"}
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifySubmit}>
              <div className="mb-8 text-center">
                <div className="auth-verify-icon">
                  <LockSimple size={32} weight="bold" />
                </div>
                <h2>Verify your email</h2>
                <p>
                  We sent a 4-digit code to <strong>{email}</strong>. Enter it
                  below to continue.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    required
                    className="auth-otp-input"
                  />
                ))}
              </div>
              <div className="grid gap-4 mt-4">
                <Button
                  type="submit"
                  className="auth-submit"
                  loading={verifyLoading}
                  loadingLabel="Verifying…"
                >
                  Verify & Continue
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("auth")}
                  className="auth-switch"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin((prev) => !prev)}
                className="auth-switch"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="auth-note">
          Funds held by CBN-licensed financial partners
        </p>
        <p className="mt-4 text-[0.78rem] text-muted leading-[1.5] text-center">
          Amana is a technology platform, not a bank or financial institution.
          All escrowed funds are held securely in custody by our licensed
          partner bank.
        </p>
      </div>
    </div>
  );
}
