export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export type PayoutStatus = "not_set" | "pending" | "verified";

export type JobStatus =
  | "invitation_pending"
  | "invitation_expired"
  | "awaiting_funding"
  | "funds_secured"
  | "in_progress"
  | "proof_submitted"
  | "released"
  | "disputed"
  | "cancelled"
  | "declined";

export type JobPriority = "normal" | "urgent";

export type ArtisanProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  category: string;
  categoryLabel: string;
  otherTrade: string;
  experience: string;
  bio: string;
  area: string;
  areaLabel: string;
  travelRadius: string;
  avatarUrl: string | null;
  rating: number | null;
  completedJobs: number;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  payoutStatus: PayoutStatus;
  profileComplete: boolean;
  memberSince: string;
};

export type ProfileSettingsTab = "profile" | "account" | "payout";

export type ArtisanAccountForm = {
  phone: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ArtisanPayoutForm = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type ArtisanJob = {
  id: string;
  title: string;
  clientName: string;
  clientVerified: boolean;
  location: string;
  amount: number;
  status: JobStatus;
  priority: JobPriority;
  createdAt: string;
  deadline: string;
  fundedAt?: string;
  proofDueAt?: string;
  disputeReason?: string;
  invitationExpiresAt?: string;
  lastUpdated: string;
};

export type JobPrimaryAction =
  | "upload_proof"
  | "review_invite"
  | "start_work"
  | "view_dispute"
  | "view_receipt";

export type DashboardAlert = {
  id: string;
  type: "warning" | "info" | "error" | "success";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: JobPrimaryAction;
  actionJobId?: string;
};

export type DashboardTab = "active" | "invitations" | "history";

export type WalletTransactionType = "credit" | "withdrawal";

export type WalletTransactionStatus = "completed" | "pending" | "failed";

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  date: string;
};

export type ArtisanBankAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type ArtisanWallet = {
  availableBalance: number;
  pendingWithdrawal: number;
  incomingBalance: number;
  bankAccount: ArtisanBankAccount | null;
  transactions: WalletTransaction[];
  minWithdrawal: number;
};

export type ArtisanReview = {
  id: string;
  clientName: string;
  clientVerified: boolean;
  jobTitle: string;
  jobId?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewFilter = "all" | "five" | "four" | "critical";
