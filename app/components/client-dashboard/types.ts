import type {
  AgreementCategoryId,
  AgreementMilestone,
  JobChatMessage,
  JobInvoice,
  JobPriority,
  JobStatus,
} from "../artisan-dashboard/types";

export type { JobChatMessage, JobStatus, JobPriority, AgreementCategoryId };

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
  area: string;
  areaLabel: string;
  avatarUrl: string | null;
  verificationStatus: ClientVerificationStatus;
  verificationNote?: string;
  paymentMethodStatus: PaymentMethodStatus;
  profileComplete: boolean;
  memberSince: string;
  jobsProtected: number;
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
  paymentMethod: ClientPaymentMethod | null;
  transactions: ClientEscrowTransaction[];
  minFunding: number;
};

export type ClientJob = {
  id: string;
  title: string;
  artisanName: string;
  artisanVerified: boolean;
  artisanCategory?: string;
  location: string;
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
  sentByArtisan?: boolean;
  sentByClient?: boolean;
  invoice?: JobInvoice;
  releaseRequestAmount?: number;
  proofSubmittedAt?: string;
  proofNote?: string;
  lastUpdated: string;
};

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
  | "leave_review";

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
