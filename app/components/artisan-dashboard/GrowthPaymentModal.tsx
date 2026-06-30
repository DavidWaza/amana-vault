"use client";

import { X, CreditCard } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { GrowthFeatureConfig } from "./growth-constants";
import { formatNaira } from "./utils";

type GrowthPaymentModalProps = {
  feature: GrowthFeatureConfig;
  open: boolean;
  paying: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function GrowthPaymentModal({
  feature,
  open,
  paying,
  error,
  onClose,
  onConfirm,
}: GrowthPaymentModalProps) {
  if (!open) return null;

  return (
    <div
      className="adash-modal-overlay"
      role="presentation"
      onClick={() => !paying && onClose()}
    >
      <div
        className="adash-modal adash-modal--growth"
        role="dialog"
        aria-labelledby="growth-pay-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <h3 id="growth-pay-title">Confirm payment</h3>
            <p className="adash-modal-subtext">{feature.title}</p>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            disabled={paying}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="adash-growth-pay-summary">
          <div>
            <span>Amount</span>
            <strong>{formatNaira(feature.price)}</strong>
          </div>
          {feature.period && (
            <div>
              <span>Duration</span>
              <strong>{feature.period}</strong>
            </div>
          )}
        </div>

        <p className="adash-modal-subtext">{feature.description}</p>

        <div className="adash-growth-pay-method">
          <CreditCard size={18} weight="bold" />
          Pay with card or bank transfer via our payment partner
        </div>

        {error && (
          <p className="adash-field-error" role="alert">
            {error}
          </p>
        )}

        <div className="adash-modal-actions">
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={onClose}
            disabled={paying}
          >
            Cancel
          </button>
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={onConfirm}
            disabled={paying}
            loading={paying}
            loadingLabel="Processing…"
          >
            {`Pay ${formatNaira(feature.price)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
