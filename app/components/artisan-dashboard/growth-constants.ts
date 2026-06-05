import type { GrowthFeatureId } from "./types";

export type GrowthFeatureConfig = {
  id: GrowthFeatureId;
  title: string;
  price: number;
  period?: string;
  description: string;
  perks: string[];
};

export const GROWTH_FEATURES: Record<GrowthFeatureId, GrowthFeatureConfig> = {
  verification_checks: {
    id: "verification_checks",
    title: "Verification checks",
    price: 2500,
    description:
      "Covers NIN matching, selfie-to-ID comparison, and duplicate account screening.",
    perks: [
      "NIN matches your profile details",
      "Selfie matches government ID",
      "No duplicate account on platform",
    ],
  },
  verification_badge: {
    id: "verification_badge",
    title: "Verified artisan badge",
    price: 4500,
    description:
      "Priority review to earn the verified badge and unlock secured job invites.",
    perks: [
      "Verified badge on your profile",
      "Accept client job invitations",
      "Eligible for escrow-protected work",
    ],
  },
  recommendation_boost: {
    id: "recommendation_boost",
    title: "Recommendation boost",
    price: 3500,
    period: "7 days",
    description:
      "Push your profile to the top of client recommendations in your service area.",
    perks: [
      "Featured in client search results",
      "Recommended badge for one week",
      "More visibility in your trade & area",
    ],
  },
};
