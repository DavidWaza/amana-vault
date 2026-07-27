"use client";

import { useState } from "react";
import {
  BellRinging,
  Compass,
  Envelope,
  FileText,
  LockSimple,
  NotePencil,
  Scroll,
  ShieldCheck,
  Star,
  WarningCircle,
} from "phosphor-react";
import {
  APPOINTMENT_META,
  MESSAGE_TYPE_LABELS,
  PAYMENT_MILESTONE_META,
  PROPOSAL_STATUS_META,
} from "./constants";
import {
  DetailGrid,
  EmptyState,
  Notice,
  SectionHeader,
  StatusPill,
} from "./ArchitectPrimitives";
import ArchitectOpportunityCard from "./ArchitectOpportunityCard";
import ArchitectProjectTable from "./ArchitectProjectTable";
import {
  activeProjects,
  computeFinancials,
  isOpportunityClosed,
  proposalExpiryDate,
  resolveProjectStatus,
  resolveProposalStatus,
} from "./portal-utils";
import { formatLongDate, formatNaira, formatShortDate, plural } from "./utils";
import type {
  ArchitectFinancials,
  ArchitectProfile,
  ArchitectProject,
  ArchitectProposal,
  DesignOpportunity,
  PortfolioItem,
  ProjectMessage,
  TeamMember,
} from "./types";

/* ================================================================== *
 * Opportunities
 * ================================================================== */

type OpportunitiesPanelProps = {
  opportunities: DesignOpportunity[];
  onViewBrief: (opportunity: DesignOpportunity) => void;
  onSubmitBid: (opportunity: DesignOpportunity) => void;
  onAskQuestion: (opportunity: DesignOpportunity) => void;
  onSave: (opportunity: DesignOpportunity) => void;
  onDecline: (opportunity: DesignOpportunity) => void;
};

type OpportunityFilter = "open" | "saved" | "bid_submitted" | "closed";

export function ArchitectOpportunitiesPanel({
  opportunities,
  onViewBrief,
  onSubmitBid,
  onAskQuestion,
  onSave,
  onDecline,
}: OpportunitiesPanelProps) {
  const [filter, setFilter] = useState<OpportunityFilter>("open");

  const buckets: Record<OpportunityFilter, DesignOpportunity[]> = {
    open: opportunities.filter(
      (item) =>
        !isOpportunityClosed(item) && item.status !== "declined" && item.status !== "bid_submitted",
    ),
    saved: opportunities.filter((item) => item.status === "saved"),
    bid_submitted: opportunities.filter((item) => item.status === "bid_submitted"),
    closed: opportunities.filter(
      (item) => isOpportunityClosed(item) || item.status === "declined",
    ),
  };

  const list = buckets[filter];

  return (
    <div className="ap-subpage">
      <SectionHeader
        title="New Design Opportunities"
        subtitle="Client briefs from the Amana marketplace. Every brief comes from a Build Your Dream Home submission."
      />

      <div className="ap-filter-row" role="tablist" aria-label="Opportunity filters">
        {(
          [
            ["open", "Open"],
            ["saved", "Saved"],
            ["bid_submitted", "Bid submitted"],
            ["closed", "Closed"],
          ] as [OpportunityFilter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={`ap-filter${filter === id ? " ap-filter--active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
            <span>{buckets[id].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Compass size={28} weight="bold" />}
          title={
            filter === "open"
              ? "No open opportunities right now."
              : `Nothing in ${filter.replace(/_/g, " ")}.`
          }
          body="New client briefs matching your studio's specialties will appear here."
        />
      ) : (
        <div className="ap-opportunity-grid">
          {list.map((opportunity) => (
            <ArchitectOpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onViewBrief={onViewBrief}
              onSubmitBid={onSubmitBid}
              onAskQuestion={onAskQuestion}
              onSave={onSave}
              onDecline={onDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== *
 * Projects
 * ================================================================== */

type ProjectsPanelProps = {
  projects: ArchitectProject[];
  onOpenProject: (projectId: string) => void;
  onBrowseOpportunities: () => void;
  onInviteClient: () => void;
};

type ProjectFilter = "active" | "needs_action" | "waiting" | "closed";

export function ArchitectProjectsPanel({
  projects,
  onOpenProject,
  onBrowseOpportunities,
  onInviteClient,
}: ProjectsPanelProps) {
  const [filter, setFilter] = useState<ProjectFilter>("active");

  const buckets: Record<ProjectFilter, ArchitectProject[]> = {
    active: activeProjects(projects),
    needs_action: projects.filter((project) =>
      [
        "waiting_for_architect",
        "deliverable_due",
        "deliverable_overdue",
        "revision_requested",
        "awaiting_agreement",
        "clarification_required",
        "project_blocked",
      ].includes(resolveProjectStatus(project)),
    ),
    waiting: projects.filter((project) =>
      ["waiting_for_client", "client_review_in_progress", "awaiting_payment"].includes(
        resolveProjectStatus(project),
      ),
    ),
    closed: projects.filter(
      (project) => resolveProjectStatus(project) === "project_completed",
    ),
  };

  const list = buckets[filter];

  return (
    <div className="ap-subpage">
      <SectionHeader
        title="Projects"
        subtitle="Each project shows what must happen next, who owns it, and when it is due."
      />

      <div className="ap-filter-row" role="tablist" aria-label="Project filters">
        {(
          [
            ["active", "Active"],
            ["needs_action", "Needs your action"],
            ["waiting", "Waiting on client"],
            ["closed", "Closed"],
          ] as [ProjectFilter, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={`ap-filter${filter === id ? " ap-filter--active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
            <span>{buckets[id].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Compass size={28} weight="bold" />}
          title={
            filter === "active"
              ? "You do not have an active project yet."
              : "Nothing in this view."
          }
          body={
            filter === "active"
              ? "Explore client opportunities or invite an existing client."
              : undefined
          }
          actions={
            filter === "active" ? (
              <>
                <button type="button" className="ap-btn-primary ap-btn-sm" onClick={onBrowseOpportunities}>
                  Browse opportunities
                </button>
                <button type="button" className="ap-btn-outline ap-btn-sm" onClick={onInviteClient}>
                  Invite a client
                </button>
              </>
            ) : undefined
          }
        />
      ) : (
        <ArchitectProjectTable projects={list} onOpenProject={onOpenProject} />
      )}
    </div>
  );
}

/* ================================================================== *
 * Proposals
 * ================================================================== */

type ProposalsPanelProps = {
  proposals: ArchitectProposal[];
  onRevise: (proposal: ArchitectProposal) => void;
  onBrowseOpportunities: () => void;
};

export function ArchitectProposalsPanel({
  proposals,
  onRevise,
  onBrowseOpportunities,
}: ProposalsPanelProps) {
  if (proposals.length === 0) {
    return (
      <div className="ap-subpage">
        <SectionHeader title="Proposals" subtitle="Track every bid and the client's response." />
        <EmptyState
          icon={<FileText size={28} weight="bold" />}
          title="You have not submitted a proposal yet."
          actions={
            <button type="button" className="ap-btn-primary ap-btn-sm" onClick={onBrowseOpportunities}>
              Browse opportunities
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="ap-subpage">
      <SectionHeader title="Proposals" subtitle="Track every bid and the client's response." />
      <ul className="ap-record-list">
        {proposals.map((proposal) => {
          const status = resolveProposalStatus(proposal);
          const meta = PROPOSAL_STATUS_META[status];
          const needsAction =
            status === "clarification_requested" || status === "revised_proposal_requested";

          return (
            <li key={proposal.id} className="ap-record">
              <div className="ap-record-main">
                <div className="ap-record-head">
                  <strong>{proposal.projectTitle}</strong>
                  <StatusPill label={meta.label} tone={meta.tone} size="sm" />
                </div>
                <p className="ap-record-sub">
                  {proposal.clientName} · {formatNaira(proposal.designFee)} ·{" "}
                  {plural(proposal.timelineWeeks, "week")} · {proposal.revisionsIncluded} revisions ·{" "}
                  {proposal.renders3d} renders
                </p>
                <p className="ap-record-meta">
                  Submitted {formatShortDate(proposal.submittedAt)} ·{" "}
                  {status === "expired"
                    ? `Expired ${formatShortDate(proposalExpiryDate(proposal))}`
                    : `Valid until ${formatShortDate(proposalExpiryDate(proposal))}`}
                </p>
                {proposal.clientNote && (
                  <p className="ap-record-note">
                    <Envelope size={13} weight="bold" /> {proposal.clientNote}
                  </p>
                )}
              </div>
              <div className="ap-record-actions">
                {needsAction && (
                  <button
                    type="button"
                    className="ap-btn-primary ap-btn-sm"
                    onClick={() => onRevise(proposal)}
                  >
                    Respond
                  </button>
                )}
                {status === "expired" && (
                  <button
                    type="button"
                    className="ap-btn-outline ap-btn-sm"
                    onClick={() => onRevise(proposal)}
                  >
                    Resubmit
                  </button>
                )}
                {status === "draft" && (
                  <button
                    type="button"
                    className="ap-btn-primary ap-btn-sm"
                    onClick={() => onRevise(proposal)}
                  >
                    Complete proposal
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================================================================== *
 * Agreements
 * ================================================================== */

type AgreementsPanelProps = {
  projects: ArchitectProject[];
  onOpenProject: (projectId: string) => void;
};

export function ArchitectAgreementsPanel({ projects, onOpenProject }: AgreementsPanelProps) {
  const withAgreements = projects.filter((project) => project.agreement);

  if (withAgreements.length === 0) {
    return (
      <div className="ap-subpage">
        <SectionHeader title="Agreements" subtitle="Every client–architect appointment in one place." />
        <EmptyState
          icon={<Scroll size={28} weight="bold" />}
          title="No agreements yet"
          body="An agreement is prepared automatically once a client selects your proposal."
        />
      </div>
    );
  }

  return (
    <div className="ap-subpage">
      <SectionHeader title="Agreements" subtitle="Every client–architect appointment in one place." />
      <ul className="ap-record-list">
        {withAgreements.map((project) => {
          const agreement = project.agreement!;
          const unresolved = agreement.differences.filter((d) => !d.resolution).length;
          return (
            <li key={project.id} className="ap-record">
              <div className="ap-record-main">
                <div className="ap-record-head">
                  <strong>{project.title}</strong>
                  <StatusPill
                    label={
                      agreement.status === "signed"
                        ? "Signed"
                        : agreement.status === "awaiting_signature"
                          ? "Awaiting signature"
                          : "In preparation"
                    }
                    tone={agreement.status === "signed" ? "success" : "warning"}
                    size="sm"
                  />
                  <StatusPill
                    label={APPOINTMENT_META[agreement.appointment].label}
                    tone="neutral"
                    size="sm"
                    title={APPOINTMENT_META[agreement.appointment].hint}
                  />
                </div>
                <p className="ap-record-sub">
                  {project.clientCompany ?? project.clientName} ·{" "}
                  {formatNaira(agreement.totalDesignFee)} · {agreement.includedRevisions} revisions ·{" "}
                  {agreement.designTimelineWeeks} weeks
                </p>
                <p className="ap-record-meta">
                  {agreement.signedAt
                    ? `Signed ${formatLongDate(agreement.signedAt)}`
                    : `${agreement.confirmedSteps.length} of 10 steps confirmed`}
                  {unresolved > 0 && ` · ${plural(unresolved, "difference")} unresolved`}
                </p>
              </div>
              <div className="ap-record-actions">
                <button
                  type="button"
                  className={agreement.status === "signed" ? "ap-btn-outline ap-btn-sm" : "ap-btn-primary ap-btn-sm"}
                  onClick={() => onOpenProject(project.id)}
                >
                  {agreement.status === "signed" ? "View agreement" : "Continue preparation"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ================================================================== *
 * Payments (PRD §18)
 * ================================================================== */

type PaymentsPanelProps = {
  projects: ArchitectProject[];
  financials: ArchitectFinancials;
  onWithdraw: () => void;
  withdrawBlockedReason?: string;
  onOpenProject: (projectId: string) => void;
};

export function ArchitectPaymentsPanel({
  projects,
  financials,
  onWithdraw,
  withdrawBlockedReason,
  onOpenProject,
}: PaymentsPanelProps) {
  return (
    <div className="ap-subpage">
      <SectionHeader
        title="Payments"
        subtitle="Design fees broken down by what is funded, earned, awaiting approval and paid."
      />

      <section className="ap-finance-hero">
        <div className="ap-finance-headline">
          <span>Available for withdrawal</span>
          <strong>{formatNaira(financials.availableForWithdrawal)}</strong>
          <button
            type="button"
            className="ap-btn-vault"
            onClick={onWithdraw}
            disabled={Boolean(withdrawBlockedReason)}
            title={withdrawBlockedReason}
          >
            Withdraw funds
          </button>
          {withdrawBlockedReason && <p className="ap-vault-blocked">{withdrawBlockedReason}</p>}
          <p className="ap-vault-footnote">
            <LockSimple size={13} weight="bold" />
            Funds are held by a CBN-licensed partner until each milestone is approved.
          </p>
        </div>

        <div className="ap-finance-grid">
          <div>
            <span>Total design fees</span>
            <strong>{formatNaira(financials.totalDesignFee)}</strong>
          </div>
          <div>
            <span>Amount funded</span>
            <strong>{formatNaira(financials.funded)}</strong>
          </div>
          <div>
            <span>Amount earned</span>
            <strong>{formatNaira(financials.earned)}</strong>
          </div>
          <div>
            <span>Awaiting client approval</span>
            <strong>{formatNaira(financials.awaitingApproval)}</strong>
          </div>
          <div>
            <span>Amount paid</span>
            <strong>{formatNaira(financials.paid)}</strong>
          </div>
          <div>
            <span>Remaining contract balance</span>
            <strong>{formatNaira(financials.remainingBalance)}</strong>
          </div>
        </div>
      </section>

      {financials.disputed > 0 && (
        <Notice tone="danger" icon={<WarningCircle size={16} weight="bold" />}>
          {formatNaira(financials.disputed)} is locked while a milestone dispute is under review.
        </Notice>
      )}

      {financials.nextMilestoneName && (
        <p className="ap-panel-lead">
          Next milestone: <strong>{financials.nextMilestoneName}</strong> · Next release{" "}
          {formatNaira(financials.nextMilestoneAmount)}
        </p>
      )}

      <section className="ap-inner-panel">
        <h3>Milestones by project</h3>
        {projects.length === 0 ? (
          <p className="ap-empty-inline">No milestones yet.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="ap-payment-project">
              <div className="ap-payment-project-head">
                <button type="button" className="ap-link-btn" onClick={() => onOpenProject(project.id)}>
                  {project.title}
                </button>
                <span>{formatNaira(project.designFee)}</span>
              </div>
              <ul className="ap-milestone-track">
                {project.payments.map((milestone) => {
                  const meta = PAYMENT_MILESTONE_META[milestone.status];
                  return (
                    <li key={milestone.id}>
                      <div>
                        <strong>{milestone.name}</strong>
                        <span>
                          {formatNaira(milestone.amount)}
                          {milestone.dueDate && ` · due ${formatShortDate(milestone.dueDate)}`}
                        </span>
                      </div>
                      <StatusPill label={meta.label} tone={meta.tone} title={meta.hint} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

/* ================================================================== *
 * Messages
 * ================================================================== */

type MessagesPanelProps = {
  messages: ProjectMessage[];
  projects: ArchitectProject[];
  onOpenProject: (projectId: string) => void;
  onAddConversationSummary: (projectId: string) => void;
};

export function ArchitectMessagesPanel({
  messages,
  projects,
  onOpenProject,
  onAddConversationSummary,
}: MessagesPanelProps) {
  const threads = projects
    .map((project) => ({
      project,
      thread: messages.filter((message) => message.projectId === project.id),
    }))
    .filter((entry) => entry.thread.length > 0)
    .sort(
      (a, b) =>
        new Date(b.thread[0].createdAt).getTime() - new Date(a.thread[0].createdAt).getTime(),
    );

  return (
    <div className="ap-subpage">
      <SectionHeader
        title="Messages"
        subtitle="Conversations stay available, but structured workflows remain the record of record."
      />

      <Notice tone="info">
        Any telephone or video conversation that affects scope should be recorded with{" "}
        <strong>Add conversation summary</strong> so the client can confirm, dispute or clarify it.
      </Notice>

      {threads.length === 0 ? (
        <EmptyState
          icon={<Envelope size={28} weight="bold" />}
          title="No messages yet"
          body="Client conversations will appear here, grouped by project."
        />
      ) : (
        <ul className="ap-thread-list">
          {threads.map(({ project, thread }) => {
            const unread = thread.filter((message) => !message.read).length;
            const latest = thread[0];
            return (
              <li key={project.id} className="ap-thread">
                <div className="ap-thread-main">
                  <div className="ap-record-head">
                    <strong>{project.title}</strong>
                    {unread > 0 && <StatusPill label={`${unread} unread`} tone="action" size="sm" />}
                    <StatusPill label={MESSAGE_TYPE_LABELS[latest.type]} tone="neutral" size="sm" />
                  </div>
                  <p className="ap-record-sub">
                    {latest.author}: {latest.body}
                  </p>
                  <p className="ap-record-meta">{formatShortDate(latest.createdAt)}</p>
                </div>
                <div className="ap-record-actions">
                  <button
                    type="button"
                    className="ap-btn-outline ap-btn-sm"
                    onClick={() => onAddConversationSummary(project.id)}
                  >
                    <NotePencil size={13} weight="bold" /> Summary
                  </button>
                  <button
                    type="button"
                    className="ap-btn-primary ap-btn-sm"
                    onClick={() => onOpenProject(project.id)}
                  >
                    Open thread
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== *
 * Portfolio · Team · Profile
 * ================================================================== */

export function ArchitectPortfolioPanel({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="ap-subpage">
      <SectionHeader
        title="Portfolio"
        subtitle="Completed work shown to clients browsing the Amana marketplace."
      />
      <div className="ap-portfolio-grid">
        {items.map((item) => (
          <article key={item.id} className="ap-portfolio-card">
            <span
              className="ap-portfolio-image"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              aria-hidden
            />
            <div>
              <strong>{item.title}</strong>
              <span>
                {item.category} · {item.year}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ArchitectTeamPanel({
  team,
  projects,
}: {
  team: TeamMember[];
  projects: ArchitectProject[];
}) {
  const titleFor = (id: string) => projects.find((project) => project.id === id)?.title ?? id;

  return (
    <div className="ap-subpage">
      <SectionHeader title="Team" subtitle="Studio members and the projects they are assigned to." />
      <ul className="ap-record-list">
        {team.map((member) => (
          <li key={member.id} className="ap-record">
            <div className="ap-record-main">
              <div className="ap-record-head">
                <strong>{member.name}</strong>
                <StatusPill
                  label={member.status === "active" ? "Active" : "Invited"}
                  tone={member.status === "active" ? "success" : "waiting"}
                  size="sm"
                />
              </div>
              <p className="ap-record-sub">
                {member.role} · {member.email}
              </p>
              <p className="ap-record-meta">
                {member.assignedProjectIds.length === 0
                  ? "No projects assigned"
                  : member.assignedProjectIds.map(titleFor).join(", ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchitectProfilePanel({
  profile,
  financials,
  projects,
  onOpenSettings,
}: {
  profile: ArchitectProfile;
  financials: ArchitectFinancials;
  projects: ArchitectProject[];
  onOpenSettings: () => void;
}) {
  const completed = projects.filter(
    (project) => resolveProjectStatus(project) === "project_completed",
  ).length;

  return (
    <div className="ap-subpage">
      <SectionHeader
        title="Profile"
        subtitle="How your studio appears to clients on Amana."
        action={
          <button type="button" className="ap-btn-primary ap-btn-sm" onClick={onOpenSettings}>
            Edit studio profile
          </button>
        }
      />

      <section className="ap-inner-panel">
        <div className="ap-profile-head">
          <span className="ap-profile-avatar">{profile.studioName.slice(0, 2).toUpperCase()}</span>
          <div>
            <h3>
              {profile.studioName}
              {profile.verificationStatus === "verified" && (
                <ShieldCheck size={16} weight="fill" className="ap-verified-icon" />
              )}
            </h3>
            <p>{profile.bio}</p>
            <p className="ap-record-meta">
              {profile.rating != null && (
                <>
                  <Star size={13} weight="fill" /> {profile.rating} ({profile.reviewCount} reviews) ·{" "}
                </>
              )}
              {completed} completed {completed === 1 ? "project" : "projects"}
            </p>
          </div>
        </div>

        <DetailGrid
          items={[
            { label: "Contact", value: profile.contactName },
            { label: "Phone", value: profile.phone },
            { label: "Email", value: profile.email },
            { label: "Location", value: profile.location },
            { label: "ARCON licence", value: profile.licenseNumber },
            { label: "Specialties", value: profile.specialties.join(", ") },
            {
              label: "Verification",
              value: profile.verificationStatus.replace(/_/g, " "),
            },
            { label: "Payout bank", value: profile.bankStatus.replace(/_/g, " ") },
            {
              label: "Subscription",
              value: profile.subscriptionPlan === "pro" ? "Architect Pro" : "Free",
            },
            { label: "Lifetime fees paid", value: formatNaira(financials.paid) },
          ]}
        />
      </section>
    </div>
  );
}

/* ================================================================== *
 * Reminder helper used by several panels
 * ================================================================== */

export function ReminderButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="ap-btn-outline ap-btn-sm" onClick={onClick}>
      <BellRinging size={13} weight="bold" /> {label}
    </button>
  );
}

export { computeFinancials };
