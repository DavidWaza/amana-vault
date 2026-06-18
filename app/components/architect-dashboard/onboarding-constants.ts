import type { ArchitectOnboardingStep } from "./types";

export const ARCHITECT_ONBOARDING_STEPS: ArchitectOnboardingStep[] = [
  {
    id: "studio",
    title: "Studio Profile",
    subtitle: "Tell clients who you are and where you practice.",
  },
  {
    id: "portfolio",
    title: "Portfolio & Specialties",
    subtitle: "Show the types of builds you design best.",
  },
  {
    id: "credentials",
    title: "Credentials & Verification",
    subtitle: "Upload license details for Amana Verified Architect status.",
  },
  {
    id: "bank",
    title: "Payout Bank Account",
    subtitle: "Connect the account where vault releases will be sent.",
  },
  {
    id: "verify",
    title: "Verify Phone",
    subtitle: "Secure your studio account with a one-time code.",
  },
];

export const ARCHITECT_SPECIALTY_OPTIONS = [
  "Residential",
  "Duplex",
  "Commercial",
  "Religious",
  "Modern Tropical",
  "Renovation",
  "Interior Architecture",
] as const;

export const INITIAL_ARCHITECT_ONBOARDING = {
  studioName: "",
  contactName: "",
  phone: "",
  email: "",
  location: "",
  bio: "",
  specialties: [] as string[],
  licenseNumber: "",
  portfolioUrl: "",
  nin: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export const ONBOARDING_STORAGE_KEY = "amana-architect-onboarding";
