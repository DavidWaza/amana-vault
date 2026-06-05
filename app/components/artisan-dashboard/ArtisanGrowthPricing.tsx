"use client";

import { useState, type ReactNode } from "react";
import {
  ShieldCheck,
  MagnifyingGlass,
  ListChecks,
  Sparkle,
  CheckCircle,
} from "phosphor-react";
import type { ArtisanProfile, GrowthFeatureId } from "./types";
import { GROWTH_FEATURES } from "./growth-constants";
import {
  formatBoostDate,
  getFeatureStatus,
} from "./growth-utils";
import { formatNaira } from "./utils";
import GrowthPaymentModal from "./GrowthPaymentModal";

type ArtisanGrowthPricingProps = {
  profile: ArtisanProfile;
  onPurchase: (featureId: GrowthFeatureId) => Promise<void> | void;
  variant?: "compact" | "page";
};

const FEATURE_ICONS: Record<GrowthFeatureId, ReactNode> = {
  verification_checks: <ListChecks size={24} weight="bold" />,
  verification_badge: <ShieldCheck size={24} weight="bold" />,
  recommendation_boost: <MagnifyingGlass size={24} weight="bold" />,
};

const FEATURE_ORDER: GrowthFeatureId[] = [
  "verification_checks",
  "verification_badge",
  "recommendation_boost",
];

export default function ArtisanGrowthPricing({
  profile,
  onPurchase,
  variant = "compact",
}: ArtisanGrowthPricingProps) {
  const [selectedFeature, setSelectedFeature] = useState<GrowthFeatureId | null>(
    null,
  );
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const feature = selectedFeature ? GROWTH_FEATURES[selectedFeature] : null;

  const handleConfirmPay = async () => {
    if (!selectedFeature) return;
    setPaying(true);
    setPayError(null);
    try {
      await onPurchase(selectedFeature);
      setSelectedFeature(null);
    } catch {
      setPayError("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const openCheckout = (featureId: GrowthFeatureId) => {
    setPayError(null);
    setSelectedFeature(featureId);
  };

  const renderCta = (featureId: GrowthFeatureId) => {
    const status = getFeatureStatus(featureId, profile);
    const config = GROWTH_FEATURES[featureId];

    if (status === "paid") {
      return (
        <span className="adash-growth-status adash-growth-status--paid">
          <CheckCircle size={16} weight="fill" />
          Paid
        </span>
      );
    }

    if (status === "active") {
      return (
        <div className="adash-growth-card-active">
          <span className="adash-growth-status adash-growth-status--active">
            <Sparkle size={16} weight="fill" />
            Active
            {profile.growth.boostExpiresAt && (
              <> until {formatBoostDate(profile.growth.boostExpiresAt)}</>
            )}
          </span>
          <button
            type="button"
            className="adash-btn adash-btn--secondary"
            onClick={() => openCheckout(featureId)}
          >
            Extend boost
          </button>
        </div>
      );
    }

    if (status === "locked") {
      return (
        <button type="button" className="adash-btn adash-btn--ghost" disabled>
          {featureId === "verification_badge"
            ? "Pay for checks first"
            : "Verify first"}
        </button>
      );
    }

    return (
      <button
        type="button"
        className="adash-btn adash-btn--primary"
        onClick={() => openCheckout(featureId)}
      >
        Pay {formatNaira(config.price)}
      </button>
    );
  };

  return (
    <>
      <div
        className={`adash-growth-grid${variant === "page" ? " adash-growth-grid--page" : ""}`}
      >
        {FEATURE_ORDER.map((featureId) => {
          const config = GROWTH_FEATURES[featureId];
          const status = getFeatureStatus(featureId, profile);

          return (
            <article
              key={featureId}
              className={`adash-growth-card${status === "locked" ? " adash-growth-card--locked" : ""}${variant === "page" ? " adash-growth-card--page" : ""}`}
            >
              {featureId === "recommendation_boost" && variant === "page" && (
                <span className="adash-growth-card-badge">Most popular</span>
              )}
              <span className="adash-growth-card-icon">
                {FEATURE_ICONS[featureId]}
              </span>
              <h3>{config.title}</h3>
              <p className="adash-growth-card-price">
                {formatNaira(config.price)}
                {config.period && <span> / {config.period}</span>}
              </p>
              <p className="adash-growth-card-desc">{config.description}</p>
              <ul className="adash-growth-perks">
                {config.perks.map((perk) => (
                  <li key={perk}>
                    <CheckCircle size={14} weight="fill" />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="adash-growth-card-action">{renderCta(featureId)}</div>
            </article>
          );
        })}
      </div>

      {feature && (
        <GrowthPaymentModal
          feature={feature}
          open={selectedFeature !== null}
          paying={paying}
          error={payError}
          onClose={() => setSelectedFeature(null)}
          onConfirm={handleConfirmPay}
        />
      )}
    </>
  );
}
