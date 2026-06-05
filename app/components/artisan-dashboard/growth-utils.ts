import type { ArtisanProfile, GrowthFeatureId } from "./types";

export type GrowthFeatureStatus = "available" | "paid" | "active" | "locked";

export function getFeatureStatus(
  featureId: GrowthFeatureId,
  profile: ArtisanProfile,
): GrowthFeatureStatus {
  const { growth, verificationStatus } = profile;

  if (featureId === "verification_checks") {
    return growth.checksPaid ? "paid" : "available";
  }

  if (featureId === "verification_badge") {
    if (verificationStatus === "verified") return "paid";
    if (growth.verificationPaid) return "paid";
    if (!growth.checksPaid) return "locked";
    return "available";
  }

  if (featureId === "recommendation_boost") {
    if (verificationStatus !== "verified") return "locked";
    if (growth.boostActive) return "active";
    return "available";
  }

  return "available";
}

export function applyGrowthPurchase(
  profile: ArtisanProfile,
  featureId: GrowthFeatureId,
): ArtisanProfile {
  const growth = { ...profile.growth };

  switch (featureId) {
    case "verification_checks":
      growth.checksPaid = true;
      return { ...profile, growth };
    case "verification_badge":
      growth.verificationPaid = true;
      if (growth.checksPaid && profile.verificationStatus !== "verified") {
        return {
          ...profile,
          growth,
          verificationStatus: "pending",
        };
      }
      return { ...profile, growth };
    case "recommendation_boost": {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      growth.boostActive = true;
      growth.boostExpiresAt = expires.toISOString();
      return {
        ...profile,
        growth,
        isRecommended: true,
      };
    }
    default:
      return profile;
  }
}

export function formatBoostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}
