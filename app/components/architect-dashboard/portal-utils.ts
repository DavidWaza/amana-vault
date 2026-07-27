/**
 * Derivation layer for the architect portal.
 *
 * Nothing in the UI decides *what needs attention* on its own — every surface
 * reads from the helpers here so the priority cards, summary cards, project table
 * and project page can never disagree with each other.
 */

import {
  APPROVAL_REMINDER_AFTER_DAYS,
  APPROVAL_STAGE_LABELS,
  DESIGN_ONLY_EXCLUSIONS,
  DESIGN_PHASE_LABELS,
  DESIGN_PHASE_ORDER,
  PHASE_GROUPS,
  PROPOSAL_DEADLINE_WINDOW_DAYS,
  UPCOMING_DELIVERABLE_WINDOW_DAYS,
} from "./constants";
import {
  daysSince,
  daysUntil,
  formatNaira,
  isOverdue,
  isoInDays,
  plural,
  urgencyFor,
} from "./utils";
import type {
  AgreementStepId,
  ArchitectFinancials,
  ArchitectProfile,
  ArchitectProject,
  ArchitectProposal,
  ArchitectSummary,
  Deliverable,
  DeliverableStatus,
  DesignOpportunity,
  DesignPhase,
  PaymentMilestone,
  PriorityItem,
  ProjectPaymentStatus,
  ProjectStatusKey,
  ProposalStatus,
  ResponsibleParty,
} from "./types";

/* ------------------------------------------------------------------ *
 * Small shared helpers
 * ------------------------------------------------------------------ */

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function isDesignOnly(project: ArchitectProject): boolean {
  return project.appointment === "design_only";
}

export function phaseLabel(phase: DesignPhase): string {
  return DESIGN_PHASE_LABELS[phase];
}

export function phaseIndex(phase: DesignPhase): number {
  return DESIGN_PHASE_ORDER.indexOf(phase);
}

/** Which condensed group the project currently sits in, for the overview stepper. */
export function phaseGroupIndex(phase: DesignPhase): number {
  const index = PHASE_GROUPS.findIndex((group) => group.phases.includes(phase));
  return index === -1 ? 0 : index;
}

/* ------------------------------------------------------------------ *
 * Deliverables
 * ------------------------------------------------------------------ */

/** Statuses where the ball is with the architect, so a passed date really is late. */
const ARCHITECT_OWNED_DELIVERABLE_STATUSES: DeliverableStatus[] = [
  "not_started",
  "in_progress",
  "ready_to_upload",
  "revision_requested",
  "overdue",
];

/**
 * A deliverable waiting on the client is never counted as the architect's
 * overdue item, and a locked deliverable has no live deadline at all.
 */
export function resolveDeliverableStatus(deliverable: Deliverable): DeliverableStatus {
  if (deliverable.status === "locked") return "locked";
  if (
    ARCHITECT_OWNED_DELIVERABLE_STATUSES.includes(deliverable.status) &&
    isOverdue(deliverable.dueDate)
  ) {
    return "overdue";
  }
  return deliverable.status;
}

export function isDeliverableOverdue(deliverable: Deliverable): boolean {
  return resolveDeliverableStatus(deliverable) === "overdue";
}

export function isDeliverableActionable(deliverable: Deliverable): boolean {
  const status = resolveDeliverableStatus(deliverable);
  return (
    status !== "locked" &&
    status !== "approved" &&
    status !== "complete" &&
    status !== "awaiting_client_review" &&
    status !== "submitted"
  );
}

/** Deliverables the architect still owes, due inside the given window. */
export function getUpcomingDeliverables(
  projects: ArchitectProject[],
  windowDays = UPCOMING_DELIVERABLE_WINDOW_DAYS,
): { project: ArchitectProject; deliverable: Deliverable }[] {
  const rows: { project: ArchitectProject; deliverable: Deliverable }[] = [];
  projects.forEach((project) => {
    project.deliverables.forEach((deliverable) => {
      if (!isDeliverableActionable(deliverable) || !deliverable.dueDate) return;
      const days = daysUntil(deliverable.dueDate);
      if (days === null || days < 0 || days > windowDays) return;
      rows.push({ project, deliverable });
    });
  });
  return rows.sort(
    (a, b) =>
      new Date(a.deliverable.dueDate ?? 0).getTime() -
      new Date(b.deliverable.dueDate ?? 0).getTime(),
  );
}

export function getOverdueDeliverables(
  projects: ArchitectProject[],
): { project: ArchitectProject; deliverable: Deliverable }[] {
  const rows: { project: ArchitectProject; deliverable: Deliverable }[] = [];
  projects.forEach((project) => {
    project.deliverables.forEach((deliverable) => {
      if (isDeliverableOverdue(deliverable)) rows.push({ project, deliverable });
    });
  });
  return rows;
}

/** The soonest deliverable still owed — powers the "all caught up" empty state. */
export function getNextDeliverableDate(projects: ArchitectProject[]): string | null {
  const dates = projects
    .flatMap((project) => project.deliverables)
    .filter((deliverable) => isDeliverableActionable(deliverable) && deliverable.dueDate)
    .map((deliverable) => deliverable.dueDate as string)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return dates[0] ?? null;
}

/* ------------------------------------------------------------------ *
 * Revisions
 * ------------------------------------------------------------------ */

export function revisionsRemaining(project: ArchitectProject): number {
  return Math.max(0, project.includedRevisions - project.revisionRoundsUsed);
}

export function revisionsExhausted(project: ArchitectProject): boolean {
  return revisionsRemaining(project) === 0;
}

/** "Revision round 1 of 2 included". */
export function revisionCounterLabel(project: ArchitectProject): string {
  const round = Math.min(
    Math.max(project.revisionRoundsUsed, 1),
    Math.max(project.includedRevisions, 1),
  );
  return `Revision round ${round} of ${project.includedRevisions} included`;
}

export function getOpenRevisions(project: ArchitectProject) {
  return project.revisions.filter((revision) => revision.status === "open");
}

export function countUnansweredComments(project: ArchitectProject): number {
  return getOpenRevisions(project).reduce(
    (total, revision) =>
      total + revision.comments.filter((comment) => !comment.response).length,
    0,
  );
}

/* ------------------------------------------------------------------ *
 * Approvals
 * ------------------------------------------------------------------ */

export function getPendingApprovals(project: ArchitectProject) {
  return project.approvals.filter(
    (approval) =>
      approval.status === "submitted_for_review" ||
      approval.status === "client_reviewing" ||
      approval.status === "approval_overdue",
  );
}

/**
 * An approval is overdue once the agreed client review period has passed. The
 * status is recomputed rather than trusted so a demo left running still ages.
 */
export function isApprovalOverdue(approval: { dueDate?: string; status: string }): boolean {
  if (approval.status === "approved" || approval.status === "approved_with_comments") {
    return false;
  }
  return isOverdue(approval.dueDate);
}

export function getStalestApproval(project: ArchitectProject) {
  return getPendingApprovals(project)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.submittedAt ?? 0).getTime() - new Date(b.submittedAt ?? 0).getTime(),
    )[0];
}

/* ------------------------------------------------------------------ *
 * Payments
 * ------------------------------------------------------------------ */

const EARNED_STATUSES: PaymentMilestone["status"][] = [
  "earned",
  "available_for_withdrawal",
  "paid",
];

export function computeProjectFinancials(project: ArchitectProject): ArchitectFinancials {
  return computeFinancials([project]);
}

/** Rolls every milestone across the given projects into the payment dashboard. */
export function computeFinancials(projects: ArchitectProject[]): ArchitectFinancials {
  const milestones = projects.flatMap((project) => project.payments);

  const totalDesignFee = projects.reduce((sum, project) => sum + project.designFee, 0);
  const sumWhere = (predicate: (m: PaymentMilestone) => boolean) =>
    milestones.filter(predicate).reduce((sum, m) => sum + m.amount, 0);

  const funded = sumWhere((m) => m.status !== "not_funded" && m.status !== "disputed");
  const earned = sumWhere((m) => EARNED_STATUSES.includes(m.status));
  const awaitingApproval = sumWhere(
    (m) => m.status === "awaiting_approval" || m.status === "deliverable_submitted",
  );
  const availableForWithdrawal = sumWhere((m) => m.status === "available_for_withdrawal");
  const paid = sumWhere((m) => m.status === "paid");
  const disputed = sumWhere((m) => m.status === "disputed");

  // Undated milestones sort last, so "next release" always means the soonest
  // dated one rather than whichever happens to have no date.
  const dueTime = (milestone: PaymentMilestone) =>
    milestone.dueDate ? new Date(milestone.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

  const next = milestones
    .filter((m) => m.status === "funded" || m.status === "work_in_progress")
    .sort((a, b) => dueTime(a) - dueTime(b))[0];

  return {
    totalDesignFee,
    funded,
    earned,
    awaitingApproval,
    availableForWithdrawal,
    paid,
    remainingBalance: Math.max(0, totalDesignFee - paid),
    nextMilestoneName: next?.name ?? null,
    nextMilestoneAmount: next?.amount ?? 0,
    disputed,
  };
}

/** Coarse payment state for the project table's Payment column. */
export function resolveProjectPaymentStatus(project: ArchitectProject): ProjectPaymentStatus {
  const milestones = project.payments;
  if (milestones.length === 0) return "not_funded";
  if (milestones.every((m) => m.status === "paid")) return "paid";
  if (milestones.some((m) => m.status === "available_for_withdrawal" || m.status === "earned")) {
    return "earned";
  }
  if (milestones.some((m) => m.status === "funded" || m.status === "work_in_progress")) {
    return "funded";
  }
  if (
    milestones.some(
      (m) => m.status === "awaiting_approval" || m.status === "deliverable_submitted",
    )
  ) {
    return "pending";
  }
  return "not_funded";
}

/* ------------------------------------------------------------------ *
 * Project status & responsibility
 * ------------------------------------------------------------------ */

/**
 * Recomputes the project status from live data. The stored status is the
 * baseline for pre-award phases; the rules below only escalate it when
 * something objectively more urgent is true.
 */
/** Statuses that already say "the architect owes design work right now". */
const ARCHITECT_BUSY_STATUSES: ProjectStatusKey[] = [
  "waiting_for_architect",
  "deliverable_due",
  "deliverable_overdue",
  "revision_requested",
  "clarification_required",
  "awaiting_agreement",
];

export function resolveProjectStatus(project: ArchitectProject): ProjectStatusKey {
  if (project.phase === "project_closed") return "project_completed";
  if (project.blockedReason) return "project_blocked";
  if (project.payments.some((m) => m.status === "disputed")) return "project_blocked";
  if (project.deliverables.some(isDeliverableOverdue)) return "deliverable_overdue";
  if (getOpenRevisions(project).length > 0) return "revision_requested";
  if (
    project.agreement &&
    project.agreement.status !== "signed" &&
    phaseIndex(project.phase) >= phaseIndex("architect_selected")
  ) {
    return "awaiting_agreement";
  }
  // Money waiting in the vault only becomes the project's headline status when
  // there is no outstanding design work — a deliverable due tomorrow is the more
  // useful thing to show. The withdrawal still surfaces as its own priority.
  if (
    !ARCHITECT_BUSY_STATUSES.includes(project.status) &&
    project.payments.some((m) => m.status === "available_for_withdrawal")
  ) {
    return "payment_milestone_ready";
  }
  return project.status;
}

export function resolveResponsibleParty(project: ArchitectProject): ResponsibleParty {
  const status = resolveProjectStatus(project);
  switch (status) {
    case "waiting_for_client":
    case "client_review_in_progress":
    case "awaiting_payment":
      return "client";
    case "project_blocked":
      // A dispute sits with Amana; anything else stays with whoever owns it.
      return project.payments.some((m) => m.status === "disputed")
        ? "amana"
        : project.responsibleParty;
    case "payment_milestone_ready":
      // The funds are released — withdrawing them is the architect's move.
      return "architect";
    case "project_completed":
      return "amana";
    default:
      return "architect";
  }
}

/** The single sentence shown in the "Next action" column. */
export function resolveNextAction(project: ArchitectProject): string {
  const status = resolveProjectStatus(project);

  if (status === "project_blocked") {
    return project.blockedReason ?? "Resolve the blocker before work continues";
  }
  if (status === "deliverable_overdue") {
    const overdue = project.deliverables.find(isDeliverableOverdue);
    return overdue ? `Upload ${overdue.name.toLowerCase()} — past due` : project.nextAction;
  }
  if (status === "revision_requested") {
    const revision = getOpenRevisions(project)[0];
    return revision
      ? `Respond to client comments on ${revision.deliverableName.toLowerCase()}`
      : project.nextAction;
  }
  if (status === "payment_milestone_ready") {
    return "Withdraw released milestone funds";
  }
  if (status === "awaiting_agreement") {
    return "Complete and sign the client–architect agreement";
  }
  return project.nextAction;
}

export function activeProjects(projects: ArchitectProject[]): ArchitectProject[] {
  return projects.filter(
    (project) =>
      project.phase !== "project_closed" && resolveProjectStatus(project) !== "project_completed",
  );
}

/* ------------------------------------------------------------------ *
 * Proposals & opportunities
 * ------------------------------------------------------------------ */

/** A submitted proposal past its validity period is expired, whatever it stored. */
export function resolveProposalStatus(proposal: ArchitectProposal): ProposalStatus {
  const settled: ProposalStatus[] = ["selected", "not_selected", "draft", "expired"];
  if (settled.includes(proposal.status)) return proposal.status;
  const expiresAt = new Date(proposal.submittedAt);
  expiresAt.setDate(expiresAt.getDate() + proposal.validityDays);
  return expiresAt.getTime() < Date.now() ? "expired" : proposal.status;
}

export function proposalExpiryDate(proposal: ArchitectProposal): string {
  const expiresAt = new Date(proposal.submittedAt);
  expiresAt.setDate(expiresAt.getDate() + proposal.validityDays);
  return expiresAt.toISOString();
}

export function isOpportunityClosed(opportunity: DesignOpportunity): boolean {
  return opportunity.status === "closed" || isOverdue(opportunity.proposalDeadline);
}

export function canBidOnOpportunity(opportunity: DesignOpportunity): boolean {
  return (
    !isOpportunityClosed(opportunity) &&
    opportunity.status !== "bid_submitted" &&
    opportunity.status !== "declined"
  );
}

export function openOpportunities(opportunities: DesignOpportunity[]): DesignOpportunity[] {
  return opportunities.filter(
    (opportunity) =>
      !isOpportunityClosed(opportunity) &&
      opportunity.status !== "declined" &&
      opportunity.status !== "bid_submitted",
  );
}

/* ------------------------------------------------------------------ *
 * Summary cards (PRD §7)
 * ------------------------------------------------------------------ */

export function deriveSummary(
  projects: ArchitectProject[],
  opportunities: DesignOpportunity[],
  proposals: ArchitectProposal[],
  priorities: PriorityItem[],
): ArchitectSummary {
  const awaitingClientApproval = projects.reduce(
    (total, project) =>
      total +
      project.deliverables.filter(
        (deliverable) =>
          resolveDeliverableStatus(deliverable) === "awaiting_client_review" ||
          resolveDeliverableStatus(deliverable) === "submitted",
      ).length,
    0,
  );

  const proposalDeadlines =
    openOpportunities(opportunities).filter((opportunity) => {
      const days = daysUntil(opportunity.proposalDeadline);
      return days !== null && days >= 0 && days <= PROPOSAL_DEADLINE_WINDOW_DAYS;
    }).length +
    proposals.filter((proposal) => {
      const status = resolveProposalStatus(proposal);
      return status === "clarification_requested" || status === "revised_proposal_requested";
    }).length;

  const dueMilestones = projects
    .flatMap((project) => project.payments)
    .filter((m) => m.status === "earned" || m.status === "available_for_withdrawal");

  const completedProjects = projects.filter(
    (project) => resolveProjectStatus(project) === "project_completed",
  ).length;

  const onHold = projects.filter(
    (project) => resolveProjectStatus(project) === "project_blocked",
  ).length;

  return {
    actionsRequired: priorities.filter((item) => item.responsibleParty === "architect").length,
    upcomingDeliverables: getUpcomingDeliverables(projects).length,
    awaitingClientApproval,
    proposalDeadlines,
    paymentsDue: dueMilestones.length,
    paymentsDueAmount: dueMilestones.reduce((sum, m) => sum + m.amount, 0),
    activeProjects: activeProjects(projects).length,
    totalContractValue: projects.reduce((sum, project) => sum + project.designFee, 0),
    completedProjects,
    projectsOnHold: onHold,
    nextDeliverableDate: getNextDeliverableDate(projects),
  };
}

/* ------------------------------------------------------------------ *
 * Daily priorities (PRD §6B)
 * ------------------------------------------------------------------ */

/**
 * Lower sorts first, so the most consequential work sits at the top.
 *
 * Chasing a stalled client approval ranks highly rather than as an afterthought:
 * an approval that has gone past its review period is holding up both the next
 * design stage and the milestone payment behind it.
 */
const ACTION_WEIGHT: Record<PriorityItem["actionType"], number> = {
  resolve_block: 0,
  review_comments: 10,
  upload_deliverable: 20,
  send_reminder: 30,
  complete_proposal: 35,
  review_agreement: 45,
  answer_clarification: 50,
  request_withdrawal: 55,
  open_project: 80,
};

const URGENCY_BONUS: Record<PriorityItem["urgency"], number> = {
  overdue: -15,
  today: -10,
  soon: -5,
  normal: 0,
};

function priorityFrom(
  partial: Omit<PriorityItem, "urgency" | "weight">,
): PriorityItem {
  const urgency = urgencyFor(partial.dueDate);
  return {
    ...partial,
    urgency,
    weight: ACTION_WEIGHT[partial.actionType] + URGENCY_BONUS[urgency],
  };
}

export function derivePriorities(
  projects: ArchitectProject[],
  opportunities: DesignOpportunity[],
  proposals: ArchitectProposal[],
): PriorityItem[] {
  const items: PriorityItem[] = [];

  projects.forEach((project) => {
    const status = resolveProjectStatus(project);
    if (status === "project_completed") return;

    // Blocked work stops everything else on the project.
    if (status === "project_blocked") {
      items.push(
        priorityFrom({
          id: `pri-block-${project.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: "Project is blocked",
          detail: project.blockedReason ?? "A dependency must be resolved before work continues.",
          dueDate: project.dueDate,
          responsibleParty: resolveResponsibleParty(project),
          status,
          actionLabel: "Open project",
          actionType: "resolve_block",
        }),
      );
      return;
    }

    // Client feedback waiting on a response.
    getOpenRevisions(project).forEach((revision) => {
      const unanswered = revision.comments.filter((comment) => !comment.response).length;
      items.push(
        priorityFrom({
          id: `pri-rev-${revision.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: "Review client comments",
          detail: `${plural(unanswered, "comment")} received on ${revision.deliverableName.toLowerCase()}.`,
          dueDate: revision.responseDeadline,
          responsibleParty: "architect",
          status: "revision_requested",
          actionLabel: "Review comments",
          actionType: "review_comments",
        }),
      );
    });

    // Overdue and imminent deliverables. A deliverable already covered by an
    // open revision request is skipped — the "review comments" card is the real
    // next step, and two cards for one file is noise.
    const deliverablesUnderReview = new Set(
      getOpenRevisions(project).map((revision) => revision.deliverableId),
    );
    project.deliverables.forEach((deliverable) => {
      if (deliverablesUnderReview.has(deliverable.id)) return;
      if (!isDeliverableActionable(deliverable) || !deliverable.dueDate) return;
      const days = daysUntil(deliverable.dueDate);
      if (days === null || days > UPCOMING_DELIVERABLE_WINDOW_DAYS) return;
      const overdue = days < 0;
      items.push(
        priorityFrom({
          id: `pri-del-${deliverable.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: overdue ? "Deliverable is overdue" : "Deliverable is due",
          detail: overdue
            ? `${deliverable.name} was due ${plural(Math.abs(days), "day")} ago.`
            : `${deliverable.name} is due ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${plural(days, "day")}`}.`,
          dueDate: deliverable.dueDate,
          responsibleParty: "architect",
          status: overdue ? "deliverable_overdue" : "deliverable_due",
          actionLabel: "Upload deliverable",
          actionType: "upload_deliverable",
        }),
      );
    });

    // Client approvals that have gone quiet.
    getPendingApprovals(project).forEach((approval) => {
      const waiting = daysSince(approval.submittedAt) ?? 0;
      if (waiting < APPROVAL_REMINDER_AFTER_DAYS && !isApprovalOverdue(approval)) return;
      items.push(
        priorityFrom({
          id: `pri-app-${approval.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: "Client approval is pending",
          detail: `${APPROVAL_STAGE_LABELS[approval.stage]} approval has been pending for ${plural(waiting, "day")}.`,
          dueDate: approval.dueDate ?? null,
          responsibleParty: "client",
          status: isApprovalOverdue(approval) ? "waiting_for_client" : "client_review_in_progress",
          actionLabel: "Send reminder",
          actionType: "send_reminder",
        }),
      );
    });

    // Unsigned agreement after selection.
    if (
      project.agreement &&
      project.agreement.status !== "signed" &&
      phaseIndex(project.phase) >= phaseIndex("architect_selected")
    ) {
      items.push(
        priorityFrom({
          id: `pri-agr-${project.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: "Agreement has not been signed",
          detail:
            project.agreement.status === "awaiting_signature"
              ? "The agreement is ready for your signature."
              : `${project.agreement.confirmedSteps.length} of 10 agreement steps confirmed.`,
          dueDate: project.dueDate,
          responsibleParty: "architect",
          status: "awaiting_agreement",
          actionLabel: "Review agreement",
          actionType: "review_agreement",
        }),
      );
    }

    // Clarification the client is waiting on.
    if (resolveProjectStatus(project) === "clarification_required") {
      items.push(
        priorityFrom({
          id: `pri-clr-${project.id}`,
          sourceId: project.id,
          projectName: project.title,
          requiredAction: "Clarification required",
          detail: project.nextAction,
          dueDate: project.dueDate,
          responsibleParty: "architect",
          status: "clarification_required",
          actionLabel: "Open project",
          actionType: "answer_clarification",
        }),
      );
    }

    // Money sitting in the vault.
    project.payments
      .filter((milestone) => milestone.status === "available_for_withdrawal")
      .forEach((milestone) => {
        items.push(
          priorityFrom({
            id: `pri-pay-${milestone.id}`,
            sourceId: project.id,
            projectName: project.title,
            requiredAction: "Payment is available for withdrawal",
            detail: `${formatNaira(milestone.amount)} released for ${milestone.name}.`,
            dueDate: null,
            responsibleParty: "architect",
            status: "payment_milestone_ready",
            actionLabel: "Withdraw funds",
            actionType: "request_withdrawal",
          }),
        );
      });
  });

  // Proposal deadlines from the marketplace.
  openOpportunities(opportunities).forEach((opportunity) => {
    const days = daysUntil(opportunity.proposalDeadline);
    if (days === null || days > PROPOSAL_DEADLINE_WINDOW_DAYS) return;
    items.push(
      priorityFrom({
        id: `pri-opp-${opportunity.id}`,
        sourceId: opportunity.id,
        projectName: opportunity.projectName,
        requiredAction: "Proposal deadline approaching",
        detail:
          days === 0
            ? "Proposal deadline is today."
            : `Proposal closes in ${plural(days, "day")} · ${plural(opportunity.architectsBidding, "architect")} bidding.`,
        dueDate: opportunity.proposalDeadline,
        responsibleParty: "architect",
        status: "waiting_for_architect",
        actionLabel: "Complete proposal",
        actionType: "complete_proposal",
      }),
    );
  });

  // Proposals the client has come back on.
  proposals.forEach((proposal) => {
    const status = resolveProposalStatus(proposal);
    if (status !== "clarification_requested" && status !== "revised_proposal_requested") return;
    items.push(
      priorityFrom({
        id: `pri-prop-${proposal.id}`,
        sourceId: proposal.id,
        projectName: proposal.projectTitle,
        requiredAction:
          status === "clarification_requested"
            ? "Client asked a question on your proposal"
            : "Client requested a revised proposal",
        detail: proposal.clientNote ?? "Respond to keep the bid active.",
        dueDate: proposalExpiryDate(proposal),
        responsibleParty: "architect",
        status: "clarification_required",
        actionLabel: "Open proposal",
        actionType: "complete_proposal",
      }),
    );
  });

  return items.sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });
}

/* ------------------------------------------------------------------ *
 * Withdrawal gating
 * ------------------------------------------------------------------ */

export function getWithdrawalBlockReason(
  profile: ArchitectProfile,
  financials: ArchitectFinancials,
): string | undefined {
  if (profile.verificationStatus === "pending") {
    return "Verification is still in review. Withdrawals unlock once approved.";
  }
  if (profile.verificationStatus === "rejected") {
    return "Verification was declined. Resubmit your credentials in Settings.";
  }
  if (profile.verificationStatus !== "verified") {
    return "Complete architect verification to withdraw earned fees.";
  }
  if (profile.bankStatus !== "verified") {
    return "Add a verified payout bank account in Settings.";
  }
  if (financials.availableForWithdrawal <= 0) {
    return financials.disputed > 0
      ? "Funds are locked while a milestone dispute is open."
      : "No funds are available for withdrawal right now.";
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * Scaffolding for new projects
 * ------------------------------------------------------------------ */

/** A design-only agreement always carries the supervision exclusions. */
export function createDesignOnlyAgreement(
  designFee: number,
  proposalId: string | null,
): ArchitectProject["agreement"] {
  return {
    id: `agr-${Date.now()}`,
    appointment: "design_only",
    status: "in_preparation",
    totalDesignFee: designFee,
    includedRevisions: 2,
    designTimelineWeeks: 12,
    clientReviewPeriodDays: 5,
    finalDecisionMaker: "",
    deliverables: [],
    exclusions: [...DESIGN_ONLY_EXCLUSIONS],
    differences: [],
    confirmedSteps: [] as AgreementStepId[],
    preparedFromProposalId: proposalId,
  };
}

export function createStarterDeliverables(): Deliverable[] {
  return [
    {
      id: `del-${Date.now()}-1`,
      name: "Project brief confirmation",
      phase: "brief_review",
      status: "not_started",
      dueDate: isoInDays(5),
      revisionRound: null,
      clientStatus: "not_submitted",
      files: [],
    },
    {
      id: `del-${Date.now()}-2`,
      name: "Concept floor plans",
      phase: "concept_design",
      status: "locked",
      dueDate: null,
      revisionRound: null,
      clientStatus: "not_applicable",
      lockedReason: "Requires brief confirmation",
      files: [],
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Report export
 * ------------------------------------------------------------------ */

export function buildArchitectReport(
  profile: ArchitectProfile,
  projects: ArchitectProject[],
  priorities: PriorityItem[],
): string {
  const financials = computeFinancials(projects);
  const lines: string[] = [];

  lines.push("AMANA — ARCHITECT WORKLOAD REPORT");
  lines.push(`Studio: ${profile.studioName}`);
  lines.push(`Generated: ${new Date().toLocaleString("en-NG")}`);
  lines.push("");

  lines.push(`PRIORITIES (${priorities.length})`);
  if (priorities.length === 0) {
    lines.push("  Nothing requires your attention.");
  } else {
    priorities.forEach((item) => {
      lines.push(`  • ${item.projectName} — ${item.requiredAction} (${item.detail})`);
    });
  }
  lines.push("");

  lines.push("PAYMENTS");
  lines.push(`  Total design fees:        ${formatNaira(financials.totalDesignFee)}`);
  lines.push(`  Funded:                   ${formatNaira(financials.funded)}`);
  lines.push(`  Earned:                   ${formatNaira(financials.earned)}`);
  lines.push(`  Awaiting client approval: ${formatNaira(financials.awaitingApproval)}`);
  lines.push(`  Available for withdrawal: ${formatNaira(financials.availableForWithdrawal)}`);
  lines.push(`  Paid:                     ${formatNaira(financials.paid)}`);
  lines.push(`  Remaining balance:        ${formatNaira(financials.remainingBalance)}`);
  lines.push("");

  lines.push(`PROJECTS (${projects.length})`);
  if (projects.length === 0) {
    lines.push("  No projects yet.");
  } else {
    projects.forEach((project) => {
      lines.push(`  • ${project.title} — ${project.clientName}`);
      lines.push(`      Appointment:  ${project.appointment.replace(/_/g, " ")}`);
      lines.push(`      Phase:        ${phaseLabel(project.phase)}`);
      lines.push(`      Next action:  ${resolveNextAction(project)}`);
      lines.push(`      Responsible:  ${resolveResponsibleParty(project)}`);
      lines.push(`      Design fee:   ${formatNaira(project.designFee)}`);
    });
  }
  lines.push("");

  return lines.join("\n");
}
