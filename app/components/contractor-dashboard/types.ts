// Domain types for the Amana Vault Contractor Portal.
// Mirrors the per-portal `types.ts` convention used by the artisan/architect/client
// dashboards. The contractor is a construction company managing builds from
// proposal → bid → vault funding → milestone proof → approval → release.

export type ContractorVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type ContractorBankStatus = "none" | "pending" | "verified";

export type ContractorDashboardView =
  | "dashboard"
  | "marketplace"
  | "projects"
  | "team"
  | "vault"
  | "documents"
  | "updates"
  | "reviews";

// ── Construction lifecycle ──────────────────────────────────────────────
// PRD §7: Foundation → Structure → Roofing → Electrical/Plumbing → Finishing → Handover.
export type ConstructionStage =
  | "foundation"
  | "structure"
  | "roofing"
  | "electrical_plumbing"
  | "finishing"
  | "handover";

// PRD §8: Pending → In Progress → Under Review → Approved → Released OR Disputed.
export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "under_review"
  | "approved"
  | "released"
  | "disputed";

export type ContractorMilestone = {
  id: string;
  stage: ConstructionStage;
  label: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  evidenceCount?: number;
  inspectorName?: string;
  note?: string;
};

export type ContractorProjectStatus =
  | "bidding"
  | "awarded"
  | "awaiting_funding"
  | "in_progress"
  | "completed"
  | "on_hold";

export type ClientType = "individual" | "diaspora" | "company" | "religious" | "community";

export type ContractorProject = {
  id: string;
  title: string;
  clientName: string;
  clientType: ClientType;
  location: string;
  contractValue: number;
  status: ContractorProjectStatus;
  progress: number;
  imageUrl: string;
  startedAt: string;
  deadline?: string;
  currentStage: ConstructionStage;
  milestones: ContractorMilestone[];
  teamMemberIds: string[];
  nextActionNote?: string;
};

// ── Project Marketplace (PRD §4) ────────────────────────────────────────
export type BidStatus = "open" | "saved" | "submitted" | "shortlisted" | "lost";

export type MarketplaceProject = {
  id: string;
  name: string;
  location: string;
  budget: number;
  timelineWeeks: number;
  clientType: ClientType;
  designDocsAvailable: boolean;
  imageUrl: string;
  postedAt: string;
  bidStatus: BidStatus;
  buildingType: string;
  description: string;
  scope: string[];
};

// ── Artisan Marketplace (PRD §4b) ───────────────────────────────────────
// A contractor looking for a specific trade can browse verified artisans by
// field, review their history, and invite them onto a build.
export type ArtisanField =
  | "mason"
  | "carpenter"
  | "electrician"
  | "plumber"
  | "tiler"
  | "painter"
  | "welder"
  | "pop_ceiling"
  | "aluminium"
  | "steel_fixer"
  | "roofer"
  | "surveyor";

export type ArtisanAvailability = "available" | "limited" | "engaged";

// A single past engagement shown in an artisan's project overview / history.
export type ArtisanPastProject = {
  title: string;
  role: string;
  year: string;
  location: string;
};

export type MarketplaceArtisan = {
  id: string;
  name: string;
  field: ArtisanField;
  skills: string[];
  location: string;
  bio: string;
  avatarUrl: string | null;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  yearsExperience: number;
  dayRate: number; // ₦ per day, indicative
  availability: ArtisanAvailability;
  saved: boolean;
  history: ArtisanPastProject[];
};

// ── Bid Creation (PRD §5) ───────────────────────────────────────────────
export type ContractorBidStatus = "submitted" | "accepted" | "declined";

export type ContractorBid = {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  contractorFee: number;
  total: number;
  timelineWeeks: number;
  teamMemberIds: string[];
  notes: string;
  submittedAt: string;
  status: ContractorBidStatus;
};

// ── Team / Subaccount system (PRD §6) ───────────────────────────────────
export type TeamRole =
  | "engineer"
  | "electrician"
  | "plumber"
  | "carpenter"
  | "mason"
  | "supervisor";

export type TeamPermission = "upload_proof" | "update_progress" | "view_financials";

export type TeamMemberStatus = "active" | "invited";

export type TeamMember = {
  id: string;
  name: string;
  role: TeamRole;
  phone: string;
  permissions: TeamPermission[];
  assignedProjectId?: string;
  status: TeamMemberStatus;
};

// ── Vault (PRD §8 — avoid wallet terminology) ───────────────────────────
export type ContractorVault = {
  contractValue: number;
  protectedFunds: number;
  releasedFunds: number;
  pendingMilestoneAmount: number;
};

// ── Files & updates (PRD §9) ────────────────────────────────────────────
export type DocumentKind =
  | "photo"
  | "video"
  | "receipt"
  | "boq"
  | "report"
  | "drawing"
  | "completion";

export type ContractorDocument = {
  id: string;
  name: string;
  kind: DocumentKind;
  projectName: string;
  uploadedAt: string;
  sizeLabel: string;
};

export type ContractorUpdate = {
  id: string;
  projectName: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
  tone: "success" | "info" | "neutral";
  photoCount?: number;
};

export type ContractorNotification = {
  id: string;
  type: "warning" | "info" | "error" | "success";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionLabel?: string;
  actionView?: ContractorDashboardView;
};

export type ContractorReview = {
  id: string;
  clientName: string;
  projectTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ContractorProfile = {
  companyName: string;
  rcNumber: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  specialties: string[];
  teamSize: string;
  yearsExperience: string;
  rating: number | null;
  reviewCount: number;
  completedProjects: number;
  avatarUrl: string | null;
  verificationStatus: ContractorVerificationStatus;
  bankStatus: ContractorBankStatus;
  onboardingComplete: boolean;
  onboardingStep: number;
  memberSince: string;
};

// ── Onboarding (PRD §2: Register → Verify Company → Create Profile) ──────
export type ContractorOnboardingForm = {
  companyName: string;
  rcNumber: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  bio: string;
  specialties: string[];
  teamSize: string;
  yearsExperience: string;
  nin: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type ContractorOnboardingStepId =
  | "company"
  | "capabilities"
  | "credentials"
  | "bank"
  | "verify";

export type ContractorOnboardingStep = {
  id: ContractorOnboardingStepId;
  title: string;
  subtitle: string;
};
