export type ArchitectVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type ArchitectBankStatus = "none" | "pending" | "verified";

export type ArchitectDashboardView =
  | "dashboard"
  | "projects"
  | "design-requests"
  | "proposals"
  | "active-designs"
  | "vault"
  | "documents"
  | "reviews";

export type DesignPhase =
  | "concept"
  | "rendering"
  | "drawings"
  | "boq"
  | "handover";

export type DesignPhaseStatus = "completed" | "in_progress" | "upcoming";

export type ArchitectDesignMilestone = {
  phase: DesignPhase;
  label: string;
  status: DesignPhaseStatus;
  dueDate?: string;
};

export type ArchitectProjectStatus = "draft" | "in_progress" | "completed" | "on_hold";

export type ArchitectProject = {
  id: string;
  title: string;
  clientName: string;
  location: string;
  contractValue: number;
  status: ArchitectProjectStatus;
  progress: number;
  imageUrl: string;
  startedAt: string;
  milestones: ArchitectDesignMilestone[];
  nextMilestoneNote?: string;
};

export type DesignRequest = {
  id: string;
  clientName: string;
  projectType: string;
  location: string;
  budgetRange: string;
  receivedAt: string;
  status: "new" | "responded" | "declined";
};

export type ArchitectProposal = {
  id: string;
  projectTitle: string;
  clientName: string;
  amount: number;
  sentAt: string;
  status: "pending" | "accepted" | "declined";
};

export type ArchitectVault = {
  totalContract: number;
  released: number;
  protected: number;
  pendingRelease: number;
  earningsThisMonth: number;
  earningsDeltaPct: number;
};

export type ArchitectActivity = {
  id: string;
  text: string;
  createdAt: string;
  tone: "success" | "info" | "neutral";
};

export type ArchitectNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ArchitectProfile = {
  studioName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  specialties: string[];
  licenseNumber: string;
  rating: number | null;
  reviewCount: number;
  avatarUrl: string | null;
  verificationStatus: ArchitectVerificationStatus;
  bankStatus: ArchitectBankStatus;
  onboardingComplete: boolean;
  onboardingStep: number;
  subscriptionPlan: "free" | "pro";
  subscriptionRenewal?: string;
};

export type ArchitectOnboardingForm = {
  studioName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  specialties: string[];
  licenseNumber: string;
  portfolioUrl: string;
  nin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type ArchitectOnboardingStepId =
  | "studio"
  | "portfolio"
  | "credentials"
  | "bank"
  | "verify";

export type ArchitectOnboardingStep = {
  id: ArchitectOnboardingStepId;
  title: string;
  subtitle: string;
};
