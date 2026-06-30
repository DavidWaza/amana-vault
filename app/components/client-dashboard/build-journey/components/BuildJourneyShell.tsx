"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import AmanaLogo from "../../../join-amana/AmanaLogo";

type BuildJourneyShellProps = {
  stepIndex: number;
  flowStep: number;
  flowTotal: number;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showProgress?: boolean;
  backLabel?: string;
  nextLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  hideFooter?: boolean;
  footerExtra?: ReactNode;
};

export default function BuildJourneyShell({
  stepIndex,
  flowStep,
  flowTotal,
  title,
  subtitle,
  children,
  showProgress = true,
  backLabel = "Back",
  nextLabel = "Next",
  onBack,
  onNext,
  nextDisabled,
  hideFooter,
  footerExtra,
}: BuildJourneyShellProps) {
  const progress = flowTotal > 0 ? (flowStep / flowTotal) * 100 : 0;

  return (
    <div className="bj-flow">
      <header className="bj-header">
        <div className="bj-header-brand">
          <AmanaLogo size={32} variant="green" />
          <div>
            <strong>Amana</strong>
            <span>Vault</span>
          </div>
        </div>
        {showProgress && stepIndex > 0 && (
          <div className="bj-header-meta">
            <span className="bj-step-pill">{stepIndex}</span>
            <span className="bj-step-count">
              Step {stepIndex} of {flowTotal}
            </span>
          </div>
        )}
      </header>

      {showProgress && stepIndex > 0 && (
        <div className="bj-progress-track" aria-hidden>
          <div className="bj-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className="bj-main">
        {(title || subtitle) && (
          <div className="bj-intro">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      {!hideFooter && (
        <footer className="bj-footer">
          <div className="bj-footer-left">
            {onBack ? (
              <button type="button" className="bj-btn-text" onClick={onBack}>
                <ArrowLeft size={16} weight="bold" />
                {backLabel}
              </button>
            ) : (
              <span />
            )}
          </div>
          <div className="bj-footer-right">
            {footerExtra}
            {onNext && (
              <Button
                type="button"
                className="bj-btn-primary"
                onClick={onNext}
                disabled={nextDisabled}
              >
                {nextLabel}
                <ArrowRight size={16} weight="bold" />
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
