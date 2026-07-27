"use client";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Clock,
  Compass,
  CurrencyNgn,
  FileArrowUp,
  Lightning,
  Scroll,
  Users,
  WarningCircle,
} from "phosphor-react";
import { PROJECT_STATUS_META } from "./constants";
import { EmptyState, ResponsibleBadge, SectionHeader, StatusPill } from "./ArchitectPrimitives";
import ArchitectProjectTable from "./ArchitectProjectTable";
import ArchitectOpportunityCard from "./ArchitectOpportunityCard";
import { activeProjects, openOpportunities } from "./portal-utils";
import { formatDueLabel, formatLongDate, formatNairaCompact } from "./utils";
import type {
  ArchitectProject,
  ArchitectSummary,
  DesignOpportunity,
  PriorityItem,
} from "./types";

type ArchitectDashboardHomeProps = {
  priorities: PriorityItem[];
  summary: ArchitectSummary;
  projects: ArchitectProject[];
  opportunities: DesignOpportunity[];
  onPriorityAction: (item: PriorityItem) => void;
  onOpenProject: (projectId: string) => void;
  onNavigate: (view: "opportunities" | "projects" | "proposals" | "payments") => void;
  onViewBrief: (opportunity: DesignOpportunity) => void;
  onSubmitBid: (opportunity: DesignOpportunity) => void;
  onAskQuestion: (opportunity: DesignOpportunity) => void;
  onSaveOpportunity: (opportunity: DesignOpportunity) => void;
  onDeclineOpportunity: (opportunity: DesignOpportunity) => void;
  onInviteClient: () => void;
};

const PRIORITY_ICON: Record<PriorityItem["actionType"], React.ReactNode> = {
  resolve_block: <WarningCircle size={18} weight="bold" />,
  review_comments: <Users size={18} weight="bold" />,
  upload_deliverable: <FileArrowUp size={18} weight="bold" />,
  complete_proposal: <Compass size={18} weight="bold" />,
  review_agreement: <Scroll size={18} weight="bold" />,
  answer_clarification: <Lightning size={18} weight="bold" />,
  request_withdrawal: <CurrencyNgn size={18} weight="bold" />,
  send_reminder: <Clock size={18} weight="bold" />,
  open_project: <ArrowRight size={18} weight="bold" />,
};

export default function ArchitectDashboardHome({
  priorities,
  summary,
  projects,
  opportunities,
  onPriorityAction,
  onOpenProject,
  onNavigate,
  onViewBrief,
  onSubmitBid,
  onAskQuestion,
  onSaveOpportunity,
  onDeclineOpportunity,
  onInviteClient,
}: ArchitectDashboardHomeProps) {
  const live = activeProjects(projects);
  const open = openOpportunities(opportunities);
  const topPriorities = priorities.slice(0, 8);

  return (
    <div className="ap-home">
      {/* ---------------------------------------------------------- *
          1. What needs your attention — always first.
       * ---------------------------------------------------------- */}
      <section className="ap-priorities" aria-labelledby="priorities-heading">
        <SectionHeader
          title="Your Priorities Today"
          subtitle="Everything waiting on you, most urgent first."
          count={priorities.length}
          action={
            priorities.length > topPriorities.length ? (
              <button type="button" className="ap-link-btn" onClick={() => onNavigate("projects")}>
                View all projects <ArrowRight size={14} weight="bold" />
              </button>
            ) : undefined
          }
        />
        <h2 id="priorities-heading" className="ap-visually-hidden">
          Your priorities today
        </h2>

        {priorities.length === 0 ? (
          <EmptyState
            tone="success"
            icon={<CheckCircle size={28} weight="fill" />}
            title="You are all caught up."
            body={
              summary.nextDeliverableDate
                ? `Your next deliverable is due on ${formatLongDate(summary.nextDeliverableDate)}.`
                : "Nothing is waiting on you right now. Browse opportunities to line up your next appointment."
            }
            actions={
              <button
                type="button"
                className="ap-btn-primary ap-btn-sm"
                onClick={() => onNavigate("opportunities")}
              >
                Browse opportunities
              </button>
            }
          />
        ) : (
          <div className="ap-priority-grid">
            {topPriorities.map((item) => {
              const statusMeta = PROJECT_STATUS_META[item.status];
              return (
                <article
                  key={item.id}
                  className={`ap-priority-card ap-priority-card--${item.urgency}`}
                >
                  <div className="ap-priority-top">
                    <span className="ap-priority-icon">{PRIORITY_ICON[item.actionType]}</span>
                    <StatusPill label={statusMeta.label} tone={statusMeta.tone} size="sm" />
                  </div>

                  <h3>{item.projectName}</h3>
                  <p className="ap-priority-detail">{item.detail}</p>

                  <div className="ap-priority-meta">
                    <ResponsibleBadge party={item.responsibleParty} />
                    <span
                      className={`ap-priority-due${
                        item.urgency === "overdue" ? " ap-priority-due--overdue" : ""
                      }`}
                    >
                      <CalendarCheck size={13} weight="bold" />
                      {item.dueDate ? formatDueLabel(item.dueDate) : "No deadline"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ap-btn-primary ap-btn-sm ap-priority-action"
                    onClick={() => onPriorityAction(item)}
                  >
                    {item.actionLabel}
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- *
          2. Operational summary cards (PRD §7).
       * ---------------------------------------------------------- */}
      <section className="ap-summary" aria-label="Workload summary">
        <button
          type="button"
          className="ap-summary-card ap-summary-card--action"
          onClick={() => onNavigate("projects")}
        >
          <span className="ap-summary-label">Actions Required</span>
          <strong>{summary.actionsRequired}</strong>
          <em>Items waiting on your response</em>
        </button>
        <button
          type="button"
          className="ap-summary-card ap-summary-card--due"
          onClick={() => onNavigate("projects")}
        >
          <span className="ap-summary-label">Upcoming Deliverables</span>
          <strong>{summary.upcomingDeliverables}</strong>
          <em>Design files due within 7 days</em>
        </button>
        <button
          type="button"
          className="ap-summary-card ap-summary-card--waiting"
          onClick={() => onNavigate("projects")}
        >
          <span className="ap-summary-label">Awaiting Client Approval</span>
          <strong>{summary.awaitingClientApproval}</strong>
          <em>Submitted work under client review</em>
        </button>
        <button
          type="button"
          className="ap-summary-card ap-summary-card--bid"
          onClick={() => onNavigate("opportunities")}
        >
          <span className="ap-summary-label">Proposal Deadlines</span>
          <strong>{summary.proposalDeadlines}</strong>
          <em>Bids due soon</em>
        </button>
        <button
          type="button"
          className="ap-summary-card ap-summary-card--money"
          onClick={() => onNavigate("payments")}
        >
          <span className="ap-summary-label">Payments Due</span>
          <strong>{formatNairaCompact(summary.paymentsDueAmount)}</strong>
          <em>
            {summary.paymentsDue} milestone{summary.paymentsDue === 1 ? "" : "s"} earned or awaiting
            release
          </em>
        </button>
      </section>

      {/* Secondary business totals sit below the operational cards. */}
      <section className="ap-secondary-summary" aria-label="Business totals">
        <div className="ap-secondary-card">
          <span>Active projects</span>
          <strong>{summary.activeProjects}</strong>
        </div>
        <div className="ap-secondary-card">
          <span>Total contract value</span>
          <strong>{formatNairaCompact(summary.totalContractValue)}</strong>
        </div>
        <div className="ap-secondary-card">
          <span>Completed projects</span>
          <strong>{summary.completedProjects}</strong>
        </div>
        <div className="ap-secondary-card">
          <span>Projects on hold</span>
          <strong>{summary.projectsOnHold}</strong>
        </div>
      </section>

      {/* ---------------------------------------------------------- *
          3. The project list.
       * ---------------------------------------------------------- */}
      <section className="ap-panel-block">
        <SectionHeader
          title="Your Projects"
          subtitle="Every appointment with its next action, owner and deadline."
          action={
            <button type="button" className="ap-link-btn" onClick={() => onNavigate("projects")}>
              View all <ArrowRight size={14} weight="bold" />
            </button>
          }
        />
        {live.length === 0 ? (
          <EmptyState
            icon={<Compass size={28} weight="bold" />}
            title="You do not have an active project yet."
            body="Explore client opportunities or invite an existing client."
            actions={
              <>
                <button
                  type="button"
                  className="ap-btn-primary ap-btn-sm"
                  onClick={() => onNavigate("opportunities")}
                >
                  Browse opportunities
                </button>
                <button type="button" className="ap-btn-outline ap-btn-sm" onClick={onInviteClient}>
                  Invite a client
                </button>
              </>
            }
          />
        ) : (
          <ArchitectProjectTable projects={live.slice(0, 5)} onOpenProject={onOpenProject} />
        )}
      </section>

      {/* ---------------------------------------------------------- *
          4. New design opportunities.
       * ---------------------------------------------------------- */}
      <section className="ap-panel-block">
        <SectionHeader
          title="New Design Opportunities"
          subtitle="Client briefs from the Amana marketplace that match your studio."
          count={open.length}
          action={
            <button
              type="button"
              className="ap-link-btn"
              onClick={() => onNavigate("opportunities")}
            >
              View all <ArrowRight size={14} weight="bold" />
            </button>
          }
        />
        {open.length === 0 ? (
          <EmptyState
            icon={<Compass size={28} weight="bold" />}
            title="No open opportunities right now."
            body="New client briefs matching your specialties will appear here."
          />
        ) : (
          <div className="ap-opportunity-grid">
            {open.slice(0, 2).map((opportunity) => (
              <ArchitectOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onViewBrief={onViewBrief}
                onSubmitBid={onSubmitBid}
                onAskQuestion={onAskQuestion}
                onSave={onSaveOpportunity}
                onDecline={onDeclineOpportunity}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
