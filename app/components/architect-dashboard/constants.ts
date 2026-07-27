/**
 * Label + tone metadata for every architect-portal enum.
 *
 * Keeping these in one file means a status can never render with two different
 * labels in two different surfaces, and the "who acts next" colour language stays
 * consistent between the priority cards, the project table and the project page.
 */

import type {
  AppointmentType,
  ApprovalStage,
  ApprovalStatus,
  ArchitectProjectTab,
  DeliverableClientStatus,
  DeliverableStatus,
  DesignPhase,
  MessageType,
  PaymentMilestoneStatus,
  ProjectPaymentStatus,
  ProjectStatusKey,
  ProposalStatus,
  ResponsibleParty,
  RevisionResponse,
  StatusTone,
} from "./types";

export type StatusMeta = { label: string; tone: StatusTone; hint?: string };

/* ------------------------------------------------------------------ *
 * Appointment
 * ------------------------------------------------------------------ */

export const APPOINTMENT_META: Record<AppointmentType, StatusMeta> = {
  design_only: {
    label: "Design only",
    tone: "neutral",
    hint: "Architectural design services. Construction supervision is not included.",
  },
  design_and_supervision: {
    label: "Design + supervision",
    tone: "neutral",
    hint: "Separately agreed appointment that includes site supervision.",
  },
  consultation: {
    label: "Consultation",
    tone: "neutral",
    hint: "Advisory services only, with no production drawings.",
  },
};

/* ------------------------------------------------------------------ *
 * Design phases (PRD §10)
 * ------------------------------------------------------------------ */

export const DESIGN_PHASE_ORDER: DesignPhase[] = [
  "brief_received",
  "brief_review",
  "clarification_required",
  "bid_submitted",
  "architect_selected",
  "agreement_preparation",
  "agreement_signed",
  "concept_design",
  "client_concept_review",
  "concept_revision",
  "concept_approved",
  "developed_design",
  "client_developed_review",
  "construction_drawings",
  "final_client_review",
  "final_delivery",
  "project_closed",
];

export const DESIGN_PHASE_LABELS: Record<DesignPhase, string> = {
  brief_received: "Brief received",
  brief_review: "Brief review",
  clarification_required: "Clarification required",
  bid_submitted: "Bid submitted",
  architect_selected: "Architect selected",
  agreement_preparation: "Agreement preparation",
  agreement_signed: "Agreement signed",
  concept_design: "Concept design",
  client_concept_review: "Client concept review",
  concept_revision: "Concept revision",
  concept_approved: "Concept approved",
  developed_design: "Developed design",
  client_developed_review: "Client developed-design review",
  construction_drawings: "Construction drawings",
  final_client_review: "Final client review",
  final_delivery: "Final delivery",
  project_closed: "Project closed",
};

/** Condensed stepper used on the project overview. */
export const PHASE_GROUPS: { id: string; label: string; phases: DesignPhase[] }[] = [
  {
    id: "brief",
    label: "Brief",
    phases: ["brief_received", "brief_review", "clarification_required"],
  },
  {
    id: "appointment",
    label: "Appointment",
    phases: ["bid_submitted", "architect_selected", "agreement_preparation", "agreement_signed"],
  },
  {
    id: "concept",
    label: "Concept",
    phases: ["concept_design", "client_concept_review", "concept_revision", "concept_approved"],
  },
  {
    id: "developed",
    label: "Developed design",
    phases: ["developed_design", "client_developed_review"],
  },
  {
    id: "drawings",
    label: "Drawings",
    phases: ["construction_drawings", "final_client_review"],
  },
  {
    id: "delivery",
    label: "Delivery",
    phases: ["final_delivery", "project_closed"],
  },
];

/* ------------------------------------------------------------------ *
 * Project status (PRD §8)
 * ------------------------------------------------------------------ */

export const PROJECT_STATUS_META: Record<ProjectStatusKey, StatusMeta> = {
  waiting_for_architect: { label: "Waiting for architect", tone: "action" },
  waiting_for_client: { label: "Waiting for client", tone: "waiting" },
  awaiting_agreement: { label: "Awaiting agreement", tone: "warning" },
  awaiting_payment: { label: "Awaiting payment", tone: "warning" },
  clarification_required: { label: "Clarification required", tone: "action" },
  deliverable_due: { label: "Deliverable due", tone: "action" },
  deliverable_overdue: { label: "Deliverable overdue", tone: "danger" },
  client_review_in_progress: { label: "Client review in progress", tone: "waiting" },
  revision_requested: { label: "Revision requested", tone: "action" },
  payment_milestone_ready: { label: "Payment milestone ready", tone: "money" },
  project_blocked: { label: "Project blocked", tone: "danger" },
  project_completed: { label: "Project completed", tone: "success" },
};

export const RESPONSIBLE_PARTY_LABELS: Record<ResponsibleParty, string> = {
  architect: "Architect",
  client: "Client",
  amana: "Amana",
};

/* ------------------------------------------------------------------ *
 * Payments
 * ------------------------------------------------------------------ */

export const PROJECT_PAYMENT_STATUS_META: Record<ProjectPaymentStatus, StatusMeta> = {
  not_funded: { label: "Not funded", tone: "warning" },
  funded: { label: "Milestone funded", tone: "success" },
  earned: { label: "Earned", tone: "money" },
  pending: { label: "Pending", tone: "waiting" },
  paid: { label: "Paid", tone: "neutral" },
};

export const PAYMENT_MILESTONE_META: Record<PaymentMilestoneStatus, StatusMeta> = {
  not_funded: { label: "Not funded", tone: "warning", hint: "Client has not secured this milestone yet." },
  funded: { label: "Funded", tone: "success", hint: "Money is secured. Safe to begin this stage." },
  work_in_progress: { label: "Work in progress", tone: "action" },
  deliverable_submitted: { label: "Deliverable submitted", tone: "waiting" },
  awaiting_approval: { label: "Awaiting approval", tone: "waiting" },
  earned: { label: "Earned", tone: "money", hint: "Approved by the client. Release is being prepared." },
  available_for_withdrawal: { label: "Available for withdrawal", tone: "money" },
  paid: { label: "Paid", tone: "neutral" },
  disputed: { label: "Disputed", tone: "danger", hint: "Funds stay locked until the dispute is resolved." },
};

/* ------------------------------------------------------------------ *
 * Deliverables (PRD §15)
 * ------------------------------------------------------------------ */

export const DELIVERABLE_STATUS_META: Record<DeliverableStatus, StatusMeta> = {
  not_started: { label: "Not started", tone: "neutral" },
  in_progress: { label: "In progress", tone: "action" },
  ready_to_upload: { label: "Ready to upload", tone: "action" },
  submitted: { label: "Submitted", tone: "waiting" },
  awaiting_client_review: { label: "Awaiting client review", tone: "waiting" },
  revision_requested: { label: "Revision requested", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
  locked: { label: "Locked", tone: "neutral" },
  complete: { label: "Complete", tone: "success" },
};

export const DELIVERABLE_CLIENT_STATUS_LABELS: Record<DeliverableClientStatus, string> = {
  not_submitted: "Not submitted",
  pending: "Pending",
  approved: "Approved",
  approved_with_comments: "Approved with comments",
  revision_requested: "Revision requested",
  not_applicable: "—",
};

/** Accepted upload formats (PRD §25). */
export const ACCEPTED_FILE_FORMATS = ["PDF", "JPG", "PNG", "DWG", "ZIP", "MP4"] as const;

export const ACCEPTED_FILE_ACCEPT_ATTR =
  ".pdf,.jpg,.jpeg,.png,.dwg,.zip,.mp4,application/pdf,image/jpeg,image/png,application/zip,video/mp4";

/* ------------------------------------------------------------------ *
 * Approvals (PRD §17)
 * ------------------------------------------------------------------ */

export const APPROVAL_STAGE_LABELS: Record<ApprovalStage, string> = {
  project_brief: "Project brief",
  concept_design: "Concept design",
  developed_design: "Developed design",
  final_drawings: "Final architectural drawings",
};

export const APPROVAL_STATUS_META: Record<ApprovalStatus, StatusMeta> = {
  not_submitted: { label: "Not submitted", tone: "neutral" },
  submitted_for_review: { label: "Submitted for review", tone: "waiting" },
  client_reviewing: { label: "Client reviewing", tone: "waiting" },
  approved: { label: "Approved", tone: "success" },
  approved_with_comments: { label: "Approved with comments", tone: "success" },
  revision_requested: { label: "Revision requested", tone: "warning" },
  approval_overdue: { label: "Approval overdue", tone: "danger" },
};

/* ------------------------------------------------------------------ *
 * Revisions (PRD §16)
 * ------------------------------------------------------------------ */

export const REVISION_RESPONSE_OPTIONS: {
  id: RevisionResponse;
  label: string;
  description: string;
  tone: StatusTone;
}[] = [
  {
    id: "accepted",
    label: "Accepted",
    description: "The change is within the agreed brief and will be made.",
    tone: "success",
  },
  {
    id: "requires_clarification",
    label: "Requires clarification",
    description: "More detail is needed before this can be actioned.",
    tone: "action",
  },
  {
    id: "outside_brief",
    label: "Outside agreed brief",
    description: "The request falls outside the signed scope of work.",
    tone: "warning",
  },
  {
    id: "additional_fee",
    label: "Additional fee required",
    description: "Can be done with a fee and timeline adjustment.",
    tone: "money",
  },
  {
    id: "not_recommended",
    label: "Technically not recommended",
    description: "Possible, but not advisable on technical grounds.",
    tone: "danger",
  },
  {
    id: "already_addressed",
    label: "Already addressed",
    description: "The current drawings already cover this point.",
    tone: "neutral",
  },
];

export const REVISION_RESPONSE_LABELS = REVISION_RESPONSE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.id] = option.label;
    return acc;
  },
  {} as Record<RevisionResponse, string>,
);

export const COMMENTER_ROLE_LABELS: Record<string, string> = {
  decision_maker: "Final decision-maker",
  family_member: "Family member",
  representative: "Local representative",
};

/* ------------------------------------------------------------------ *
 * Proposals (PRD §13)
 * ------------------------------------------------------------------ */

export const PROPOSAL_STATUS_META: Record<ProposalStatus, StatusMeta> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "waiting" },
  client_reviewing: { label: "Client reviewing", tone: "waiting" },
  clarification_requested: { label: "Clarification requested", tone: "action" },
  revised_proposal_requested: { label: "Revised proposal requested", tone: "action" },
  selected: { label: "Selected", tone: "success" },
  not_selected: { label: "Not selected", tone: "neutral" },
  expired: { label: "Expired", tone: "danger" },
};

export const PROPOSAL_DELIVERABLE_OPTIONS = [
  "Concept design",
  "Floor plans",
  "Elevations & sections",
  "3D exterior renders",
  "3D interior renders",
  "Construction drawings",
  "Structural coordination",
  "MEP coordination",
  "Bill of quantities",
  "Planning-approval drawing set",
];

export const PROPOSAL_OPTIONAL_SERVICES = [
  "Interior design package",
  "Landscape design",
  "Walkthrough animation",
  "Material selection support",
  "Contractor tender support",
];

export const PROPOSAL_FILE_FORMATS = ["PDF", "DWG", "JPG", "PNG", "ZIP", "MP4"];

export const PROPOSAL_EXCLUSION_PRESETS = [
  "Construction supervision",
  "Site inspection visits",
  "Statutory approval fees",
  "Structural engineering design",
  "Quantity surveying",
  "Furniture procurement",
];

/* ------------------------------------------------------------------ *
 * Agreement (PRD §14)
 * ------------------------------------------------------------------ */

export const AGREEMENT_STEPS: { id: string; title: string; description: string }[] = [
  { id: "summary", title: "Confirm project summary", description: "Name, site, property type and appointment." },
  { id: "scope", title: "Confirm architect scope", description: "What the studio is appointed to produce." },
  { id: "differences", title: "Resolve differences", description: "Where the brief and the accepted proposal disagree." },
  { id: "deliverables", title: "Confirm deliverables", description: "Every drawing, render and document included." },
  { id: "revisions", title: "Confirm revisions", description: "How many revision rounds are included." },
  { id: "fees", title: "Confirm fees and payment milestones", description: "Total design fee and how it is released." },
  { id: "timeline", title: "Confirm timeline", description: "Design programme and client review periods." },
  { id: "authority", title: "Confirm approval authority", description: "Who is authorised to approve on the client side." },
  { id: "exclusions", title: "Confirm design-only exclusions", description: "What this appointment explicitly does not cover." },
  { id: "sign", title: "Review and sign", description: "Send the agreement for signature." },
];

/** Always attached to a design-only appointment so supervision is never implied. */
export const DESIGN_ONLY_EXCLUSIONS = [
  "Construction supervision",
  "Site inspection and quality control",
  "Contractor management",
  "Project cost management on site",
];

/* ------------------------------------------------------------------ *
 * Messages (PRD §19)
 * ------------------------------------------------------------------ */

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  general: "General message",
  clarification: "Clarification request",
  deliverable: "Deliverable discussion",
  revision: "Revision request",
  payment: "Payment question",
  agreement: "Agreement question",
};

/* ------------------------------------------------------------------ *
 * Project page tabs (PRD §22)
 * ------------------------------------------------------------------ */

export const PROJECT_TABS: { id: ArchitectProjectTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "brief", label: "Brief" },
  { id: "agreement", label: "Agreement" },
  { id: "deliverables", label: "Deliverables" },
  { id: "feedback", label: "Feedback" },
  { id: "payments", label: "Payments" },
  { id: "documents", label: "Documents" },
  { id: "messages", label: "Messages" },
];

/* ------------------------------------------------------------------ *
 * Navigation (PRD §20)
 * ------------------------------------------------------------------ */

export const NAV_GROUPS: { id: string; label: string; items: string[] }[] = [
  { id: "work", label: "Work", items: ["dashboard", "opportunities", "projects", "proposals"] },
  {
    id: "administration",
    label: "Project Administration",
    items: ["agreements", "payments", "messages"],
  },
  { id: "business", label: "Business", items: ["portfolio", "team", "profile", "settings"] },
];

/** Deliverables due inside this window count as "upcoming" on the summary card. */
export const UPCOMING_DELIVERABLE_WINDOW_DAYS = 7;

/** Proposal deadlines inside this window count towards the summary card. */
export const PROPOSAL_DEADLINE_WINDOW_DAYS = 7;

/** A client approval older than this triggers a "send reminder" priority. */
export const APPROVAL_REMINDER_AFTER_DAYS = 3;
