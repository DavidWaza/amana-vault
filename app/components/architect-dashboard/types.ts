/**
 * Architect portal domain model.
 *
 * The model is deliberately "action-first": every project carries a next action,
 * a responsible party and a deadline so the dashboard can answer *what must happen
 * next* rather than only *how complete is this*.
 *
 * Appointments here are design-only by default. Construction supervision is a
 * separate appointment type and must never be implied by a design-only project.
 */

export type ArchitectVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type ArchitectBankStatus = "none" | "pending" | "verified";

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export type ArchitectDashboardView =
  // Work
  | "dashboard"
  | "opportunities"
  | "projects"
  | "proposals"
  // Project administration
  | "agreements"
  | "payments"
  | "messages"
  // Business
  | "portfolio"
  | "team"
  | "profile"
  // Drill-down
  | "project-detail";

export type ArchitectProjectTab =
  | "overview"
  | "brief"
  | "agreement"
  | "deliverables"
  | "feedback"
  | "payments"
  | "documents"
  | "messages";

/* ------------------------------------------------------------------ *
 * Appointment, phases and statuses
 * ------------------------------------------------------------------ */

/** Design-only is the MVP appointment. Supervision is explicitly separate. */
export type AppointmentType = "design_only" | "design_and_supervision" | "consultation";

/**
 * The 17 precise design-only stages. Broad labels such as "Design Phase" or
 * "Construction Phase" are intentionally absent — see PRD §10.
 */
export type DesignPhase =
  | "brief_received"
  | "brief_review"
  | "clarification_required"
  | "bid_submitted"
  | "architect_selected"
  | "agreement_preparation"
  | "agreement_signed"
  | "concept_design"
  | "client_concept_review"
  | "concept_revision"
  | "concept_approved"
  | "developed_design"
  | "client_developed_review"
  | "construction_drawings"
  | "final_client_review"
  | "final_delivery"
  | "project_closed";

/** Who is expected to act. Drives colour and the "waiting on" copy everywhere. */
export type ResponsibleParty = "architect" | "client" | "amana";

/** Every project must resolve to exactly one of these. */
export type ProjectStatusKey =
  | "waiting_for_architect"
  | "waiting_for_client"
  | "awaiting_agreement"
  | "awaiting_payment"
  | "clarification_required"
  | "deliverable_due"
  | "deliverable_overdue"
  | "client_review_in_progress"
  | "revision_requested"
  | "payment_milestone_ready"
  | "project_blocked"
  | "project_completed";

/** Coarse payment state shown in the project table. */
export type ProjectPaymentStatus = "not_funded" | "funded" | "earned" | "pending" | "paid";

export type StatusTone =
  | "action"
  | "waiting"
  | "warning"
  | "danger"
  | "success"
  | "neutral"
  | "money";

/* ------------------------------------------------------------------ *
 * Client brief (Build Your Dream Home submission)
 * ------------------------------------------------------------------ */

export type BriefDocument = {
  id: string;
  name: string;
  kind: "survey_plan" | "land_document" | "drawing" | "photo" | "other";
  uploadedAt: string;
};

/**
 * Mirrors the client's Build Your Dream Home submission. The architect should
 * never have to re-request anything captured here.
 */
export type ClientBrief = {
  id: string;
  submittedAt: string;
  projectType: string;
  siteLocation: string;
  clientLocation: string;
  bedrooms: number | null;
  floors: number | null;
  requiredSpaces: string[];
  preferredStyle: string;
  budgetRange: string;
  inspirationImages: string[];
  desiredTimeline: string;
  specialRequests: string;
  surveyPlan: BriefDocument | null;
  documents: BriefDocument[];
  localRepresentative: string | null;
  clientVerified: boolean;
};

/* ------------------------------------------------------------------ *
 * Opportunities (marketplace)
 * ------------------------------------------------------------------ */

export type OpportunityStatus =
  | "open"
  | "saved"
  | "bid_submitted"
  | "declined"
  | "closed";

export type DesignOpportunity = {
  id: string;
  projectName: string;
  clientName: string;
  location: string;
  propertyType: string;
  budgetRange: string;
  style: string;
  requiredDeliverables: string[];
  targetTimeline: string;
  /** ISO date. Past dates render as closed and block bidding. */
  proposalDeadline: string;
  architectsBidding: number;
  clientVerified: boolean;
  postedAt: string;
  imageUrl: string;
  status: OpportunityStatus;
  brief: ClientBrief;
};

/* ------------------------------------------------------------------ *
 * Proposals
 * ------------------------------------------------------------------ */

export type ProposalStatus =
  | "draft"
  | "submitted"
  | "client_reviewing"
  | "clarification_requested"
  | "revised_proposal_requested"
  | "selected"
  | "not_selected"
  | "expired";

export type ArchitectProposal = {
  id: string;
  opportunityId: string | null;
  projectTitle: string;
  clientName: string;
  designFee: number;
  timelineWeeks: number;
  deliverables: string[];
  revisionsIncluded: number;
  renders3d: number;
  fileFormats: string[];
  planningApprovalAssistance: boolean;
  consultantCoordination: boolean;
  optionalServices: string[];
  exclusions: string[];
  assumptions: string;
  /** Days the quote stays valid from submission — drives the `expired` status. */
  validityDays: number;
  submittedAt: string;
  status: ProposalStatus;
  /** Set when the client asks a question or requests a revised proposal. */
  clientNote?: string;
};

/* ------------------------------------------------------------------ *
 * Agreement
 * ------------------------------------------------------------------ */

export type AgreementStepId =
  | "summary"
  | "scope"
  | "differences"
  | "deliverables"
  | "revisions"
  | "fees"
  | "timeline"
  | "authority"
  | "exclusions"
  | "sign";

export type AgreementStatus =
  | "not_started"
  | "in_preparation"
  | "awaiting_signature"
  | "signed";

/**
 * A point where the brief and the accepted proposal disagree. These must be
 * resolved before the agreement can be signed.
 */
export type AgreementDifference = {
  id: string;
  topic: string;
  briefSays: string;
  proposalSays: string;
  resolution: string | null;
};

export type ProjectAgreement = {
  id: string;
  appointment: AppointmentType;
  status: AgreementStatus;
  totalDesignFee: number;
  includedRevisions: number;
  designTimelineWeeks: number;
  clientReviewPeriodDays: number;
  finalDecisionMaker: string;
  deliverables: string[];
  exclusions: string[];
  differences: AgreementDifference[];
  confirmedSteps: AgreementStepId[];
  preparedFromProposalId: string | null;
  signedAt?: string;
};

/* ------------------------------------------------------------------ *
 * Deliverables
 * ------------------------------------------------------------------ */

export type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "ready_to_upload"
  | "submitted"
  | "awaiting_client_review"
  | "revision_requested"
  | "approved"
  | "overdue"
  | "locked"
  | "complete";

export type DeliverableClientStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "approved_with_comments"
  | "revision_requested"
  | "not_applicable";

export type DeliverableFile = {
  id: string;
  name: string;
  /** PDF · JPG · PNG · DWG · ZIP · MP4 — see PRD §25 file handling. */
  format: string;
  sizeLabel: string;
  uploadedAt: string;
};

export type Deliverable = {
  id: string;
  name: string;
  phase: DesignPhase;
  status: DeliverableStatus;
  dueDate: string | null;
  /** null until the deliverable enters a revision cycle. */
  revisionRound: number | null;
  clientStatus: DeliverableClientStatus;
  /** Populated when `status === "locked"`, e.g. "Requires concept approval". */
  lockedReason?: string;
  files: DeliverableFile[];
  submittedAt?: string;
  approvedAt?: string;
};

/* ------------------------------------------------------------------ *
 * Approvals
 * ------------------------------------------------------------------ */

export type ApprovalStage =
  | "project_brief"
  | "concept_design"
  | "developed_design"
  | "final_drawings";

export type ApprovalStatus =
  | "not_submitted"
  | "submitted_for_review"
  | "client_reviewing"
  | "approved"
  | "approved_with_comments"
  | "revision_requested"
  | "approval_overdue";

export type ProjectApproval = {
  id: string;
  stage: ApprovalStage;
  status: ApprovalStatus;
  submittedAt?: string;
  /** Client review period expiry — past this the approval is overdue. */
  dueDate?: string;
  decidedAt?: string;
  decidedBy?: string;
  note?: string;
};

/* ------------------------------------------------------------------ *
 * Client feedback & revisions
 * ------------------------------------------------------------------ */

export type RevisionResponse =
  | "accepted"
  | "requires_clarification"
  | "outside_brief"
  | "additional_fee"
  | "not_recommended"
  | "already_addressed";

export type CommenterRole = "decision_maker" | "family_member" | "representative";

export type RevisionComment = {
  id: string;
  text: string;
  requestedChange: string;
  markupUrl?: string;
  submittedBy: string;
  submittedByRole: CommenterRole;
  submittedAt: string;
  /**
   * Only the approved decision-maker produces binding instructions. Comments
   * from other participants stay advisory until confirmed.
   */
  binding: boolean;
  response?: RevisionResponse;
  responseNote?: string;
};

export type RevisionRequest = {
  id: string;
  deliverableId: string;
  deliverableName: string;
  round: number;
  submittedAt: string;
  /** Deadline for the architect to respond to every comment. */
  responseDeadline: string;
  status: "open" | "responded" | "closed";
  comments: RevisionComment[];
};

/* ------------------------------------------------------------------ *
 * Payments
 * ------------------------------------------------------------------ */

export type PaymentMilestoneStatus =
  | "not_funded"
  | "funded"
  | "work_in_progress"
  | "deliverable_submitted"
  | "awaiting_approval"
  | "earned"
  | "available_for_withdrawal"
  | "paid"
  | "disputed";

export type PaymentMilestone = {
  id: string;
  name: string;
  amount: number;
  status: PaymentMilestoneStatus;
  dueDate?: string;
  fundedAt?: string;
  earnedAt?: string;
  paidAt?: string;
  disputeReason?: string;
};

/** Derived from every milestone across the portfolio — never stored raw. */
export type ArchitectFinancials = {
  totalDesignFee: number;
  funded: number;
  earned: number;
  awaitingApproval: number;
  availableForWithdrawal: number;
  paid: number;
  remainingBalance: number;
  nextMilestoneName: string | null;
  nextMilestoneAmount: number;
  disputed: number;
};

/* ------------------------------------------------------------------ *
 * Messages & conversation summaries
 * ------------------------------------------------------------------ */

export type MessageType =
  | "general"
  | "clarification"
  | "deliverable"
  | "revision"
  | "payment"
  | "agreement";

export type ProjectMessage = {
  id: string;
  projectId: string;
  type: MessageType;
  author: string;
  authorRole: "architect" | "client" | "amana";
  body: string;
  createdAt: string;
  read: boolean;
};

export type ConversationSummaryStatus = "pending" | "confirmed" | "disputed" | "clarified";

/** Records a phone/video conversation that affected scope. */
export type ConversationSummary = {
  id: string;
  projectId: string;
  date: string;
  participants: string;
  discussion: string;
  decision: string;
  requiredAction: string;
  status: ConversationSummaryStatus;
  clientNote?: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ *
 * Documents
 * ------------------------------------------------------------------ */

export type ProjectDocument = {
  id: string;
  name: string;
  format: string;
  category: "survey" | "land" | "drawing" | "agreement" | "receipt" | "other";
  uploadedAt: string;
  uploadedBy: string;
};

/* ------------------------------------------------------------------ *
 * Project
 * ------------------------------------------------------------------ */

export type ProjectOrigin = "marketplace" | "invited_client" | "off_platform" | "imported";

export type ArchitectProject = {
  id: string;
  title: string;
  clientName: string;
  clientCompany?: string;
  clientVerified: boolean;
  location: string;
  imageUrl: string;
  origin: ProjectOrigin;
  appointment: AppointmentType;
  phase: DesignPhase;
  status: ProjectStatusKey;
  /** Plain-language sentence: "Upload revised floor plans". */
  nextAction: string;
  responsibleParty: ResponsibleParty;
  dueDate: string | null;
  paymentStatus: ProjectPaymentStatus;
  designFee: number;
  startedAt: string;
  lastUpdated: string;
  /** Populated only when `status === "project_blocked"`. */
  blockedReason?: string;
  /** Days the client has been sitting on the current approval, if any. */
  waitingOnClientSince?: string;
  includedRevisions: number;
  revisionRoundsUsed: number;
  clientReviewPeriodDays: number;
  finalDecisionMaker: string;
  brief: ClientBrief;
  agreement: ProjectAgreement | null;
  deliverables: Deliverable[];
  approvals: ProjectApproval[];
  revisions: RevisionRequest[];
  payments: PaymentMilestone[];
  documents: ProjectDocument[];
  conversationSummaries: ConversationSummary[];
};

/* ------------------------------------------------------------------ *
 * Daily priorities (derived)
 * ------------------------------------------------------------------ */

export type PriorityActionType =
  | "review_comments"
  | "upload_deliverable"
  | "send_reminder"
  | "review_agreement"
  | "complete_proposal"
  | "answer_clarification"
  | "request_withdrawal"
  | "resolve_block"
  | "open_project";

export type PriorityUrgency = "overdue" | "today" | "soon" | "normal";

export type PriorityItem = {
  id: string;
  /** Project id, or opportunity/proposal id for pre-award work. */
  sourceId: string;
  projectName: string;
  requiredAction: string;
  detail: string;
  dueDate: string | null;
  responsibleParty: ResponsibleParty;
  status: ProjectStatusKey;
  actionLabel: string;
  actionType: PriorityActionType;
  urgency: PriorityUrgency;
  /** Lower sorts first. */
  weight: number;
};

/* ------------------------------------------------------------------ *
 * Dashboard summary
 * ------------------------------------------------------------------ */

export type ArchitectSummary = {
  actionsRequired: number;
  upcomingDeliverables: number;
  awaitingClientApproval: number;
  proposalDeadlines: number;
  /** Count of milestones earned or awaiting release. */
  paymentsDue: number;
  /** Naira value behind `paymentsDue`. */
  paymentsDueAmount: number;
  activeProjects: number;
  totalContractValue: number;
  completedProjects: number;
  projectsOnHold: number;
  /** ISO date of the soonest deliverable — powers the "all caught up" copy. */
  nextDeliverableDate: string | null;
};

/* ------------------------------------------------------------------ *
 * Notifications & activity
 * ------------------------------------------------------------------ */

export type ArchitectNotificationType =
  | "opportunity"
  | "clarification"
  | "proposal_deadline"
  | "proposal_selected"
  | "agreement_ready"
  | "client_feedback"
  | "client_approved"
  | "revision_requested"
  | "deliverable_due"
  | "deliverable_overdue"
  | "payment_funded"
  | "payment_earned"
  | "payment_available";

export type ArchitectNotification = {
  id: string;
  type: ArchitectNotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  /** Deep link target so every notification reaches the required action. */
  targetView?: ArchitectDashboardView;
  targetProjectId?: string;
  targetTab?: ArchitectProjectTab;
};

export type ArchitectActivity = {
  id: string;
  text: string;
  createdAt: string;
  tone: "success" | "info" | "neutral" | "warning";
};

/* ------------------------------------------------------------------ *
 * Team & portfolio
 * ------------------------------------------------------------------ */

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "invited";
  assignedProjectIds: string[];
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
};

/* ------------------------------------------------------------------ *
 * Profile & onboarding (unchanged shape)
 * ------------------------------------------------------------------ */

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
