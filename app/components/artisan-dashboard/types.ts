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

export type GrowthFeatureId =
  | "verification_checks"
  | "verification_badge"
  | "recommendation_boost";

export type ArtisanGrowthFeatures = {
  checksPaid: boolean;
  verificationPaid: boolean;
  boostActive: boolean;
  boostExpiresAt: string | null;
};

export type ArtisanProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  category: string;
  categoryLabel: string;
  otherTrade: string;
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
  growth: ArtisanGrowthFeatures;
  isRecommended: boolean;
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

export type ArtisanClient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  verified: boolean;
  lastJobTitle?: string;
};

export type AgreementCategoryId =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "borehole"
  | "solar"
  | "ac"
  | "painting"
  | "mechanic"
  | "other";

export type CreateAgreementStep =
  | "category"
  | "details"
  | "terms"
  | "client"
  | "summary";

export type AgreementWarranty = "none" | "7_days" | "30_days" | "custom";

export type AgreementMilestone = {
  id: string;
  title: string;
  description: string;
  amount: string;
};

export type CreateAgreementForm = {
  categoryId: AgreementCategoryId;
  selections: Record<string, string[]>;
  otherTexts: Record<string, string>;
  customTexts: Record<string, string>;
  price: string;
  startDate: string;
  finishDate: string;
  warranty: AgreementWarranty;
  warrantyCustom: string;
  changesPolicy: string[];
  clientId: string | null;
};

export type JobChatMessage = {
  id: string;
  jobId: string;
  sender: "artisan" | "client";
  text: string;
  createdAt: string;
};

export type ChatThread = {
  jobId: string;
  clientName: string;
  jobTitle: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  amount: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid";

export type JobInvoice = {
  id: string;
  jobId: string;
  invoiceNumber: string;
  clientName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  notes: string;
  dueDate: string;
  status: InvoiceStatus;
  sentAt?: string;
  createdAt: string;
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
  agreementScope?: string;
  paymentTerms?: string;
  milestones?: AgreementMilestone[];
  sentByArtisan?: boolean;
  invoice?: JobInvoice;
  lastUpdated: string;
};

export type JobPrimaryAction =
  | "upload_proof"
  | "review_invite"
  | "start_work"
  | "view_dispute"
  | "view_receipt"
  | "message_client";

export type NotificationActionType = JobPrimaryAction | "open_settings";

export type DashboardAlert = {
  id: string;
  type: "warning" | "info" | "error" | "success";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  actionType?: NotificationActionType;
  actionJobId?: string;
  settingsTab?: ProfileSettingsTab;
};

export type ArtisanNotification = DashboardAlert & {
  createdAt: string;
  read: boolean;
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
