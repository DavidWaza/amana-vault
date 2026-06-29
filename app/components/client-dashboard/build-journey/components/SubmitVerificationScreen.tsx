"use client";

import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  ShieldCheck,
  Storefront,
  WarningCircle,
  XCircle,
} from "phosphor-react";
import SubmissionTrailPreview from "./SubmissionTrailPreview";
import type { BriefTrailStep } from "../submission-trail";

export type SubmitVerificationPhase = "loading" | "success" | "failed";

type SubmitVerificationScreenProps = {
  phase: SubmitVerificationPhase;
  projectName: string;
  submissionTrail?: BriefTrailStep[];
  loadingStep: number;
  errorMessage?: string;
  onRetry: () => void;
  onContinue: () => void;
  onBackToReview: () => void;
};

const VERIFY_STEPS = [
  "Reviewing your build brief",
  "Verifying project details",
  "Publishing to architect marketplace",
] as const;

export default function SubmitVerificationScreen({
  phase,
  projectName,
  submissionTrail = [],
  loadingStep,
  errorMessage,
  onRetry,
  onContinue,
  onBackToReview,
}: SubmitVerificationScreenProps) {
  if (phase === "loading") {
    return (
      <div className="bj-submit bj-submit--loading">
        <div className="bj-submit-card">
          <span className="bj-submit-spinner" aria-hidden>
            <CircleNotch size={40} weight="bold" />
          </span>
          <h2>Verifying your submission</h2>
          <p>
            We&apos;re securely processing your build brief before sharing it
            with verified architects.
          </p>
          <ul className="bj-submit-checklist">
            {VERIFY_STEPS.map((label, index) => {
              const done = index < loadingStep;
              const active = index === loadingStep;
              return (
                <li
                  key={label}
                  className={`bj-submit-check${done ? " bj-submit-check--done" : ""}${active ? " bj-submit-check--active" : ""}`}
                >
                  <span className="bj-submit-check-icon">
                    {done ? (
                      <CheckCircle size={18} weight="fill" />
                    ) : active ? (
                      <CircleNotch size={18} weight="bold" />
                    ) : (
                      <span className="bj-submit-check-dot" />
                    )}
                  </span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="bj-submit bj-submit--success">
        <div className="bj-submit-card">
          <span className="bj-submit-icon bj-submit-icon--success">
            <CheckCircle size={48} weight="fill" />
          </span>
          <h2>Your idea is live on the marketplace</h2>
          <p>
            <strong>{projectName}</strong> has been published. Verified
            architects can now review your brief and submit proposals.
          </p>
          <div className="bj-submit-success-meta">
            <div>
              <Storefront size={20} weight="bold" />
              <span>Visible to matched architects</span>
            </div>
            <div>
              <ShieldCheck size={20} weight="bold" />
              <span>Your information is protected</span>
            </div>
          </div>
          {submissionTrail.length > 0 && (
            <div className="bj-submit-trail">
              <h3>What you submitted</h3>
              <SubmissionTrailPreview steps={submissionTrail} />
            </div>
          )}
          <button
            type="button"
            className="bj-btn-primary bj-btn-primary--lg bj-btn-primary--full"
            onClick={onContinue}
          >
            Go to Architect Marketplace
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bj-submit bj-submit--failed">
      <div className="bj-submit-card">
        <span className="bj-submit-icon bj-submit-icon--failed">
          <XCircle size={48} weight="fill" />
        </span>
        <h2>We couldn&apos;t publish your brief</h2>
        <p>
          {errorMessage ??
            "Something went wrong while sending your idea to the architect marketplace. Your brief is saved — please try again."}
        </p>
        <div className="bj-submit-failed-note">
          <WarningCircle size={18} weight="bold" />
          <span>No changes were lost. You can retry or return to review your details.</span>
        </div>
        <div className="bj-submit-actions">
          <button
            type="button"
            className="bj-btn-primary bj-btn-primary--lg"
            onClick={onRetry}
          >
            Try Again
          </button>
          <button type="button" className="bj-btn-outline" onClick={onBackToReview}>
            Back to Review
          </button>
        </div>
      </div>
    </div>
  );
}
