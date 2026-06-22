import type { ContractorOnboardingStep } from "./types";

// PRD §2 flow: Register → Verify Company → Create Profile.
export const CONTRACTOR_ONBOARDING_STEPS: ContractorOnboardingStep[] = [
  {
    id: "company",
    title: "Company Profile",
    subtitle: "Tell clients who builds and where you operate.",
  },
  {
    id: "capabilities",
    title: "Capabilities & Team",
    subtitle: "Show the kinds of builds your team delivers best.",
  },
  {
    id: "credentials",
    title: "Verify Company",
    subtitle: "Submit CAC registration and ID for Amana Verified Contractor status.",
  },
  {
    id: "bank",
    title: "Payout Bank Account",
    subtitle: "Connect the account where vault releases will be sent.",
  },
  {
    id: "verify",
    title: "Verify Phone",
    subtitle: "Secure your company account with a one-time code.",
  },
];

export const CONTRACTOR_SPECIALTY_OPTIONS = [
  "Residential Builds",
  "Duplexes & Mansions",
  "Commercial",
  "Religious",
  "Renovation",
  "Civil / Structural",
  "Finishing & Interiors",
  "Solar & Electrical",
] as const;

export const TEAM_SIZE_OPTIONS = [
  "1–5",
  "6–15",
  "16–30",
  "31–50",
  "50+",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Under 2 years",
  "2–5 years",
  "6–10 years",
  "10+ years",
] as const;

export const INITIAL_CONTRACTOR_ONBOARDING = {
  companyName: "",
  rcNumber: "",
  contactName: "",
  phone: "",
  email: "",
  location: "",
  bio: "",
  specialties: [] as string[],
  teamSize: "",
  yearsExperience: "",
  nin: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export const ONBOARDING_STORAGE_KEY = "amana-contractor-onboarding";
export const PROFILE_STORAGE_KEY = "amana-contractor-profile";
export const SIDEBAR_STORAGE_KEY = "amana-contractor-sidebar-collapsed";
