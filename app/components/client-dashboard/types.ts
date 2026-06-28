import type {
  AgreementCategoryId,
  AgreementMilestone,
  JobChatMessage,
  JobInvoice,
  JobPriority,
  JobStatus,
} from "../artisan-dashboard/types";
import type { Dispute } from "../disputes/types";
import type { BuildJourneyForm } from "./build-journey/types";

export type { JobChatMessage, JobStatus, JobPriority, AgreementCategoryId };
export type { Dispute };

export type ArtisanClientReview = {
  clientName: string;
  jobTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RecommendedArtisan = {
  id: string;
  fullName: string;
  categoryId: AgreementCategoryId;
  categoryLabel: string;
  categoryEmoji: string;
  areaLabel: string;
  bio: string;
  rating: number | null;
  completedJobs: number;
  verified: boolean;
  isRecommended: boolean;
  avatarUrl: string | null;
  memberSince: string;
  travelRadiusLabel: string;
  responseTime: string;
  escrowJobsCompleted: number;
  specialties: string[];
  recentReviews: ArtisanClientReview[];
};

export type CreateClientJobForm = {
  title: string;
  categoryId: AgreementCategoryId;
  location: string;
  deadline: string;
  budget: string;
  specifications: string;
  artisanId: string | null;
};

export type ClientDashboardView =
  | "dashboard"
  | "projects"
  | "team"
  | "architects"
  | "proposals"
  | "vault"
  | "payments"
  | "approvals"
  | "updates"
  | "documents"
  | "reviews";

export type BuildingCategory =
  | "residential"
  | "religious"
  | "commercial"
  | "community";

export type BuildingType =
  | "bungalow"
  | "duplex"
  | "mansion"
  | "family_compound"
  | "church"
  | "mosque"
  | "worship_center"
  | "office"
  | "plaza"
  | "rental_property"
  | "school"
  | "nonprofit";

export type LandStatus =
  | "own"
  | "family_owns"
  | "purchasing"
  | "need_assistance";

export type ProjectStartStage =
  | "need_architect"
  | "have_drawings"
  | "have_contractor";

export type ProjectLifecycleStage =
  | "vision"
  | "architect_selection"
  | "design"
  | "contractor_bidding"
  | "vault_setup"
  | "construction"
  | "completed";

export type DesignStage =
  | "initial_consultation"
  | "concept_design"
  | "client_review"
  | "final_documents"
  | "ready_for_bidding";

export type VaultMilestoneName =
  | "foundation"
  | "structure"
  | "roofing"
  | "finishing";

export type VaultMilestoneStatus =
  | "locked"
  | "active"
  | "inspection"
  | "approved"
  | "released";

export type InspectionResult = "pass" | "pass_with_concerns" | "fail";

export type VaultMilestone = {
  id: string;
  name: VaultMilestoneName;
  label: string;
  amount: number;
  status: VaultMilestoneStatus;
  inspectionResult?: InspectionResult;
  inspectorName?: string;
  inspectorReport?: string;
  contractorEvidence?: string;
  dueDate?: string;
};

export type Architect = {
  id: string;
  name: string;
  company: string;
  verified: boolean;
  portfolioCount: number;
  specialty: string;
  rating: number;
  reviewCount: number;
  bio: string;
  services: string[];
  avatarUrl: string | null;
};

export type ContractorTeamMember = {
  role: string;
  name: string;
};

export type ContractorProposal = {
  id: string;
  projectId: string;
  contractorName: string;
  company: string;
  verified: boolean;
  totalPrice: number;
  timelineMonths: number;
  materialsCost: number;
  laborCost: number;
  managementFee: number;
  team: ContractorTeamMember[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  feeStructure: string;
  accepted?: boolean;
};

export type ProjectUpdate = {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  professional: string;
  professionalRole: "architect" | "contractor" | "inspector" | "amana";
  update: string;
  photos?: number;
  videos?: number;
  documents?: number;
};

export type DocumentFolder =
  | "architect_documents"
  | "contracts"
  | "receipts"
  | "inspection_reports"
  | "payment_records";

export type ProjectDocument = {
  id: string;
  projectId: string;
  projectName: string;
  folder: DocumentFolder;
  name: string;
  uploadedAt: string;
  sizeLabel: string;
};

export type StartProjectSubmitPayload = {
  startProject: StartProjectForm;
  brief: BuildJourneyForm;
};

export type StartProjectForm = {
  buildingCategory: BuildingCategory | "";
  buildingType: BuildingType | "";
  country: string;
  state: string;
  city: string;
  address: string;
  landStatus: LandStatus | "";
  projectName: string;
  description: string;
  startStage: ProjectStartStage | "";
};

export type ClientVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type PaymentMethodStatus = "not_set" | "pending" | "verified";

export type ClientProfileSettingsTab = "profile" | "account" | "payment";

export type ClientProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  countryOfResidence: string;
  area: string;
  areaLabel: string;
  avatarUrl: string | null;
  verificationStatus: ClientVerificationStatus;
  verificationNote?: string;
  paymentMethodStatus: PaymentMethodStatus;
  profileComplete: boolean;
  memberSince: string;
  projectsProtected: number;
  totalVaultProtected: number;
  /** @deprecated use projectsProtected */
  jobsProtected: number;
  /** @deprecated use totalVaultProtected */
  totalEscrowed: number;
};

export type ClientPaymentMethod = {
  type: "card" | "bank_transfer";
  label: string;
  lastFour: string;
};

export type ClientEscrowTransactionType = "deposit" | "release" | "refund";

export type ClientEscrowTransactionStatus =
  | "completed"
  | "pending"
  | "awaiting_approval"
  | "failed";

export type ClientEscrowTransaction = {
  id: string;
  type: ClientEscrowTransactionType;
  amount: number;
  status: ClientEscrowTransactionStatus;
  description: string;
  date: string;
  jobId?: string;
};

export type ClientEscrow = {
  securedBalance: number;
  pendingFunding: number;
  pendingReleaseApproval: number;
  releasedTotal: number;
  paymentMethod: ClientPaymentMethod | null;
  transactions: ClientEscrowTransaction[];
  minFunding: number;
};

export type ClientProject = {
  id: string;
  title: string;
  buildingCategory: BuildingCategory;
  buildingType: BuildingType;
  location: string;
  city: string;
  state: string;
  landStatus: LandStatus;
  description?: string;
  lifecycleStage: ProjectLifecycleStage;
  designStage?: DesignStage;
  architectName?: string;
  architectVerified?: boolean;
  contractorName?: string;
  contractorVerified?: boolean;
  /** Legacy field kept for messaging / dispute modals */
  artisanName: string;
  artisanVerified: boolean;
  artisanCategory?: string;
  amount: number;
  protectionFee?: number;
  status: JobStatus;
  priority: JobPriority;
  createdAt: string;
  deadline: string;
  fundedAt?: string;
  disputeReason?: string;
  invitationExpiresAt?: string;
  agreementScope?: string;
  paymentTerms?: string;
  milestones?: AgreementMilestone[];
  vaultMilestones?: VaultMilestone[];
  sentByArtisan?: boolean;
  sentByClient?: boolean;
  invoice?: JobInvoice;
  releaseRequestAmount?: number;
  proofSubmittedAt?: string;
  proofNote?: string;
  dispute?: Dispute;
  lastUpdated: string;
};

/** @deprecated use ClientProject */
export type ClientJob = ClientProject;

export type ClientJobPrimaryAction =
  | "fund_escrow"
  | "review_agreement"
  | "approve_proof"
  | "approve_release"
  | "view_dispute"
  | "view_receipt"
  | "message_artisan"
  | "resend_invite"
  | "cancel_invite"
  | "leave_review"
  | "review_milestone"
  | "activate_vault"
  | "review_proposals"
  | "view_architect_proposal";

export type ClientDashboardTab = "active" | "pending" | "history";

export type ClientNotificationActionType =
  | ClientJobPrimaryAction
  | "open_settings";

export type ClientAlert = {
  id: string;
  type: "warning" | "info" | "error" | "success";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: ClientNotificationActionType;
  actionJobId?: string;
  settingsTab?: ClientProfileSettingsTab;
  dashboardView?: ClientDashboardView;
};

export type ClientNotification = ClientAlert & {
  createdAt: string;
  read: boolean;
};

export type ClientReview = {
  id: string;
  artisanName: string;
  jobTitle: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: string;
};
