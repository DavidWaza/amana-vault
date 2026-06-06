import type { AgreementCategoryId } from "../artisan-dashboard/types";
import type { ArtisanClientReview, RecommendedArtisan } from "./types";

export type RecommendedArtisanSeed = Omit<
  RecommendedArtisan,
  | "memberSince"
  | "travelRadiusLabel"
  | "responseTime"
  | "escrowJobsCompleted"
  | "specialties"
  | "recentReviews"
>;

const SPECIALTIES_BY_CATEGORY: Record<AgreementCategoryId, string[]> = {
  plumbing: [
    "Pipe installation",
    "Bathroom refits",
    "Water heaters",
    "Leak detection",
  ],
  electrical: [
    "House wiring",
    "Inverter setup",
    "Fault finding",
    "Generator changeover",
  ],
  carpentry: [
    "Kitchen cabinets",
    "Wardrobes",
    "POP ceiling",
    "Door fitting",
  ],
  borehole: ["Pump installs", "Water treatment", "Borehole hookups"],
  solar: ["Panel installs", "Battery maintenance", "Inverter sizing"],
  ac: ["Split-unit installs", "Gas refill", "AC servicing"],
  painting: ["Interior painting", "Exterior painting", "Moisture sealing"],
  mechanic: ["Diagnostics", "Brake work", "Routine servicing"],
  other: ["General repairs", "On-site assessment"],
};

const ARTISAN_REVIEWS: Record<string, ArtisanClientReview[]> = {
  "art-001": [
    {
      clientName: "Adaeze O.",
      jobTitle: "Kitchen Pipe Installation",
      rating: 5,
      comment: "Clear communication and neat finishing. Escrow made the process stress-free.",
      createdAt: "2026-05-22T10:00:00Z",
    },
    {
      clientName: "Chidi N.",
      jobTitle: "Bathroom Renovation",
      rating: 5,
      comment: "Showed up on time and explained every milestone before work started.",
      createdAt: "2026-04-10T14:00:00Z",
    },
  ],
  "art-002": [
    {
      clientName: "Fatima B.",
      jobTitle: "POP Ceiling Repair",
      rating: 4,
      comment: "Good craftsmanship. Took an extra day but the ceiling looks brand new.",
      createdAt: "2026-05-15T09:00:00Z",
    },
  ],
  "art-003": [
    {
      clientName: "James O.",
      jobTitle: "Office Rewiring",
      rating: 5,
      comment: "Professional setup and proper safety checks after completion.",
      createdAt: "2026-05-28T11:00:00Z",
    },
  ],
  "art-005": [
    {
      clientName: "Amina Y.",
      jobTitle: "Home Solar Install",
      rating: 5,
      comment: "Helped size the inverter correctly and documented everything for escrow.",
      createdAt: "2026-05-01T16:00:00Z",
    },
  ],
  "art-008": [
    {
      clientName: "Tunde A.",
      jobTitle: "Leak Detection",
      rating: 4,
      comment: "Found the issue quickly and gave a fair quote before starting.",
      createdAt: "2026-04-20T08:00:00Z",
    },
  ],
  "art-010": [
    {
      clientName: "Grace O.",
      jobTitle: "CCTV Power Run",
      rating: 5,
      comment: "Neat conduit work and patient walkthrough of the completed install.",
      createdAt: "2026-05-18T13:00:00Z",
    },
  ],
};

const MEMBER_SINCE: Record<string, string> = {
  "art-001": "2026-01-15",
  "art-002": "2026-02-03",
  "art-003": "2025-11-20",
  "art-004": "2026-03-08",
  "art-005": "2026-01-28",
  "art-006": "2026-04-12",
  "art-007": "2026-05-01",
  "art-008": "2026-03-22",
  "art-009": "2026-05-10",
  "art-010": "2026-02-14",
};

export function enrichRecommendedArtisan(
  artisan: RecommendedArtisanSeed,
): RecommendedArtisan {
  return {
    ...artisan,
    memberSince: MEMBER_SINCE[artisan.id] ?? "2026-02-01",
    travelRadiusLabel: "All of Abuja (FCT)",
    responseTime: artisan.verified
      ? "Usually replies within 2 hours"
      : "Usually replies within 1 day",
    escrowJobsCompleted: artisan.completedJobs,
    specialties:
      SPECIALTIES_BY_CATEGORY[artisan.categoryId] ?? [artisan.categoryLabel],
    recentReviews: ARTISAN_REVIEWS[artisan.id] ?? [],
  };
}
