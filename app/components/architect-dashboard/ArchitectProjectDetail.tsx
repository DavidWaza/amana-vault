"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BellRinging,
  CheckCircle,
  ChatCircleDots,
  Circle,
  FileArrowDown,
  FileArrowUp,
  LockSimple,
  MapPin,
  NotePencil,
  WarningCircle,
} from "phosphor-react";
import {
  APPOINTMENT_META,
  APPROVAL_STAGE_LABELS,
  APPROVAL_STATUS_META,
  DELIVERABLE_CLIENT_STATUS_LABELS,
  DELIVERABLE_STATUS_META,
  DESIGN_PHASE_LABELS,
  MESSAGE_TYPE_LABELS,
  PAYMENT_MILESTONE_META,
  PHASE_GROUPS,
  PROJECT_STATUS_META,
} from "./constants";
import {
  DetailGrid,
  EmptyState,
  Notice,
  ResponsibleBadge,
  StatusPill,
} from "./ArchitectPrimitives";
import ArchitectBriefBody from "./ArchitectBriefBody";
import {
  computeProjectFinancials,
  isApprovalOverdue,
  isDeliverableActionable,
  phaseGroupIndex,
  resolveDeliverableStatus,
  resolveNextAction,
  resolveProjectStatus,
  resolveResponsibleParty,
  revisionCounterLabel,
  revisionsExhausted,
} from "./portal-utils";
import { formatDueLabel, formatLongDate, formatNaira, formatShortDate, plural } from "./utils";
import type {
  ArchitectProject,
  ArchitectProjectTab,
  Deliverable,
  ProjectMessage,
  RevisionRequest,
} from "./types";
import { PROJECT_TABS } from "./constants";

type ArchitectProjectDetailProps = {
  project: ArchitectProject;
  messages: ProjectMessage[];
  activeTab: ArchitectProjectTab;
  onTabChange: (tab: ArchitectProjectTab) => void;
  onBack: () => void;
  onOpenDeliverable: (deliverable: Deliverable) => void;
  onOpenRevision: (revision: RevisionRequest) => void;
  onOpenAgreement: () => void;
  onSendReminder: (stage: string) => void;
  onAddConversationSummary: () => void;
  onSendMessage: (body: string, type: ProjectMessage["type"]) => void;
  onWithdraw: () => void;
  withdrawBlockedReason?: string;
};

export default function ArchitectProjectDetail({
  project,
  messages,
  activeTab,
  onTabChange,
  onBack,
  onOpenDeliverable,
  onOpenRevision,
  onOpenAgreement,
  onSendReminder,
  onAddConversationSummary,
  onSendMessage,
  onWithdraw,
  withdrawBlockedReason,
}: ArchitectProjectDetailProps) {
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<ProjectMessage["type"]>("general");

  const status = resolveProjectStatus(project);
  const statusMeta = PROJECT_STATUS_META[status];
  const financials = computeProjectFinancials(project);
  const currentGroup = phaseGroupIndex(project.phase);
  const projectMessages = messages.filter((message) => message.projectId === project.id);

  return (
    <div className="ap-project-detail">
      <button type="button" className="ap-link-btn ap-back-btn" onClick={onBack}>
        <ArrowLeft size={15} weight="bold" /> Back to projects
      </button>

      <header className="ap-project-hero">
        <span
          className="ap-project-hero-image"
          style={{ backgroundImage: `url(${project.imageUrl})` }}
          aria-hidden
        />
        <div className="ap-project-hero-body">
          <div className="ap-project-hero-top">
            <StatusPill label={statusMeta.label} tone={statusMeta.tone} />
            <StatusPill
              label={APPOINTMENT_META[project.appointment].label}
              tone="neutral"
              title={APPOINTMENT_META[project.appointment].hint}
            />
          </div>
          <h1>{project.title}</h1>
          <p className="ap-project-hero-meta">
            <MapPin size={14} weight="bold" />
            {project.location} · Client: {project.clientCompany ?? project.clientName}
          </p>

          <div className="ap-project-hero-facts">
            <div>
              <span>Current phase</span>
              <strong>{DESIGN_PHASE_LABELS[project.phase]}</strong>
            </div>
            <div>
              <span>Next action</span>
              <strong>{resolveNextAction(project)}</strong>
            </div>
            <div>
              <span>Responsible</span>
              <ResponsibleBadge party={resolveResponsibleParty(project)} />
            </div>
            <div>
              <span>Deadline</span>
              <strong>{project.dueDate ? formatDueLabel(project.dueDate) : "No deadline set"}</strong>
            </div>
            <div>
              <span>Design fee</span>
              <strong>{formatNaira(project.designFee)}</strong>
            </div>
          </div>

          {/* Condensed design-only phase stepper. Construction supervision is
              never represented here. */}
          <ol className="ap-phase-stepper">
            {PHASE_GROUPS.map((group, index) => (
              <li
                key={group.id}
                className={
                  index < currentGroup
                    ? "ap-phase-step--done"
                    : index === currentGroup
                      ? "ap-phase-step--current"
                      : "ap-phase-step--upcoming"
                }
              >
                {index < currentGroup ? (
                  <CheckCircle size={15} weight="fill" />
                ) : (
                  <Circle size={15} weight={index === currentGroup ? "fill" : "bold"} />
                )}
                <span>{group.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      {project.blockedReason && (
        <Notice tone="danger" icon={<WarningCircle size={16} weight="bold" />}>
          {project.blockedReason}
        </Notice>
      )}

      {project.origin === "off_platform" && (
        <Notice tone="info">
          This client was added off-platform. Approvals and conversation summaries are recorded by
          your studio rather than confirmed in the client portal.
        </Notice>
      )}

      <nav className="ap-tabs" aria-label="Project sections">
        {PROJECT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`ap-tab${activeTab === tab.id ? " ap-tab--active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
            {tab.id === "feedback" && project.revisions.some((r) => r.status === "open") && (
              <span className="ap-tab-dot" aria-hidden />
            )}
          </button>
        ))}
      </nav>

      <div className="ap-tab-panel">
        {/* ------------------------------------------------ Overview */}
        {activeTab === "overview" && (
          <div className="ap-stack">
            <DetailGrid
              items={[
                { label: "Appointment type", value: APPOINTMENT_META[project.appointment].label },
                { label: "Current phase", value: DESIGN_PHASE_LABELS[project.phase] },
                { label: "Next action", value: resolveNextAction(project) },
                {
                  label: "Responsible party",
                  value: <ResponsibleBadge party={resolveResponsibleParty(project)} />,
                },
                {
                  label: "Deadline",
                  value: project.dueDate ? formatDueLabel(project.dueDate) : "None set",
                },
                { label: "Final decision-maker", value: project.finalDecisionMaker },
                { label: "Client review period", value: plural(project.clientReviewPeriodDays, "day") },
                { label: "Revisions", value: revisionCounterLabel(project) },
                { label: "Started", value: formatLongDate(project.startedAt) },
              ]}
            />

            <section className="ap-inner-panel">
              <h3>Financial status</h3>
              <div className="ap-money-grid">
                <div>
                  <span>Total design fee</span>
                  <strong>{formatNaira(financials.totalDesignFee)}</strong>
                </div>
                <div>
                  <span>Funded</span>
                  <strong>{formatNaira(financials.funded)}</strong>
                </div>
                <div>
                  <span>Earned</span>
                  <strong>{formatNaira(financials.earned)}</strong>
                </div>
                <div>
                  <span>Awaiting approval</span>
                  <strong>{formatNaira(financials.awaitingApproval)}</strong>
                </div>
                <div>
                  <span>Available to withdraw</span>
                  <strong>{formatNaira(financials.availableForWithdrawal)}</strong>
                </div>
                <div>
                  <span>Remaining balance</span>
                  <strong>{formatNaira(financials.remainingBalance)}</strong>
                </div>
              </div>
            </section>

            <section className="ap-inner-panel">
              <h3>Approvals</h3>
              <ul className="ap-approval-list">
                {project.approvals.map((approval) => {
                  const overdue = isApprovalOverdue(approval);
                  const meta =
                    APPROVAL_STATUS_META[overdue ? "approval_overdue" : approval.status];
                  return (
                    <li key={approval.id}>
                      <div>
                        <strong>{APPROVAL_STAGE_LABELS[approval.stage]}</strong>
                        <span>
                          {approval.decidedAt
                            ? `${approval.decidedBy ?? "Client"} · ${formatShortDate(approval.decidedAt)}`
                            : approval.submittedAt
                              ? `Submitted ${formatShortDate(approval.submittedAt)}`
                              : "Not submitted"}
                        </span>
                      </div>
                      <div className="ap-approval-actions">
                        <StatusPill label={meta.label} tone={meta.tone} size="sm" />
                        {(approval.status === "client_reviewing" ||
                          approval.status === "submitted_for_review" ||
                          overdue) && (
                          <button
                            type="button"
                            className="ap-btn-outline ap-btn-sm"
                            onClick={() => onSendReminder(APPROVAL_STAGE_LABELS[approval.stage])}
                          >
                            <BellRinging size={13} weight="bold" /> Remind
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {/* ------------------------------------------------ Brief */}
        {activeTab === "brief" && (
          <div className="ap-stack">
            <p className="ap-panel-lead">
              The client’s original Build Your Dream Home submission, captured{" "}
              {formatLongDate(project.brief.submittedAt)}.
            </p>
            <ArchitectBriefBody brief={project.brief} />
          </div>
        )}

        {/* ------------------------------------------------ Agreement */}
        {activeTab === "agreement" &&
          (project.agreement ? (
            <div className="ap-stack">
              {project.agreement.status !== "signed" && (
                <Notice tone="warning" icon={<WarningCircle size={16} weight="bold" />}>
                  This agreement is not signed yet.{" "}
                  {project.agreement.differences.filter((d) => !d.resolution).length > 0 &&
                    `${plural(
                      project.agreement.differences.filter((d) => !d.resolution).length,
                      "difference",
                    )} between the brief and your proposal still needs resolving.`}
                </Notice>
              )}

              <section className="ap-inner-panel">
                <div className="ap-inner-panel-head">
                  <h3>Agreement summary</h3>
                  <button type="button" className="ap-btn-primary ap-btn-sm" onClick={onOpenAgreement}>
                    {project.agreement.status === "signed" ? "View agreement" : "Continue preparation"}
                  </button>
                </div>
                <DetailGrid
                  items={[
                    {
                      label: "Appointment",
                      value: APPOINTMENT_META[project.agreement.appointment].label,
                    },
                    { label: "Total design fee", value: formatNaira(project.agreement.totalDesignFee) },
                    { label: "Included revisions", value: project.agreement.includedRevisions },
                    {
                      label: "Design timeline",
                      value: `${project.agreement.designTimelineWeeks} weeks`,
                    },
                    {
                      label: "Client review period",
                      value: plural(project.agreement.clientReviewPeriodDays, "day"),
                    },
                    { label: "Final decision-maker", value: project.agreement.finalDecisionMaker || "—" },
                    {
                      label: "Status",
                      value: project.agreement.status.replace(/_/g, " "),
                    },
                    {
                      label: "Signed",
                      value: project.agreement.signedAt
                        ? formatLongDate(project.agreement.signedAt)
                        : "Not signed",
                    },
                  ]}
                />
              </section>

              <section className="ap-inner-panel">
                <h3>Deliverables covered</h3>
                <ul className="ap-tick-list">
                  {project.agreement.deliverables.map((item) => (
                    <li key={item}>
                      <CheckCircle size={15} weight="fill" /> {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="ap-inner-panel">
                <h3>Excluded services</h3>
                <ul className="ap-tick-list ap-tick-list--exclusion">
                  {project.agreement.exclusions.map((item) => (
                    <li key={item}>
                      <WarningCircle size={14} weight="bold" /> {item}
                    </li>
                  ))}
                </ul>
                <p className="ap-fine-print">
                  A design-only appointment does not include construction supervision. Site
                  supervision would require a separate agreement.
                </p>
              </section>
            </div>
          ) : (
            <EmptyState
              title="No agreement yet"
              body="An agreement is prepared once a client selects your proposal."
            />
          ))}

        {/* ------------------------------------------------ Deliverables */}
        {activeTab === "deliverables" && (
          <div className="ap-stack">
            {revisionsExhausted(project) && (
              <Notice tone="warning">
                {revisionCounterLabel(project)} — additional revisions may require a fee and timeline
                adjustment.
              </Notice>
            )}
            <div className="ap-table-wrap">
              <table className="ap-table ap-table--compact">
                <thead>
                  <tr>
                    <th scope="col">Deliverable</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due date</th>
                    <th scope="col">Revision round</th>
                    <th scope="col">Client status</th>
                    <th scope="col" className="ap-table-action-col">
                      <span className="ap-visually-hidden">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.deliverables.map((deliverable) => {
                    const deliverableStatus = resolveDeliverableStatus(deliverable);
                    const meta = DELIVERABLE_STATUS_META[deliverableStatus];
                    const locked = deliverableStatus === "locked";
                    const actionable = isDeliverableActionable(deliverable);
                    const actionLabel = locked
                      ? "View"
                      : deliverableStatus === "not_started"
                        ? "Start"
                        : actionable
                          ? "Upload"
                          : deliverableStatus === "awaiting_client_review" ||
                              deliverableStatus === "submitted"
                            ? "Remind"
                            : "View";

                    return (
                      <tr key={deliverable.id}>
                        <td data-label="Deliverable">
                          <strong>{deliverable.name}</strong>
                          {locked && deliverable.lockedReason && (
                            <small className="ap-table-flag">
                              <LockSimple size={12} weight="bold" /> {deliverable.lockedReason}
                            </small>
                          )}
                          {deliverable.files.length > 0 && (
                            <small>{plural(deliverable.files.length, "file")} submitted</small>
                          )}
                        </td>
                        <td data-label="Status">
                          <StatusPill label={meta.label} tone={meta.tone} size="sm" />
                        </td>
                        <td data-label="Due date">
                          {deliverable.dueDate ? formatShortDate(deliverable.dueDate) : "—"}
                        </td>
                        <td data-label="Revision round">
                          {deliverable.revisionRound ?? "—"}
                        </td>
                        <td data-label="Client status">
                          {DELIVERABLE_CLIENT_STATUS_LABELS[deliverable.clientStatus]}
                        </td>
                        <td data-label="" className="ap-table-action-col">
                          <button
                            type="button"
                            className={
                              actionable ? "ap-btn-primary ap-btn-sm" : "ap-btn-outline ap-btn-sm"
                            }
                            onClick={() =>
                              actionLabel === "Remind"
                                ? onSendReminder(deliverable.name)
                                : onOpenDeliverable(deliverable)
                            }
                          >
                            {actionLabel === "Upload" && <FileArrowUp size={13} weight="bold" />}
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ Feedback */}
        {activeTab === "feedback" && (
          <div className="ap-stack">
            <div className="ap-revision-counter">
              <StatusPill
                label={revisionCounterLabel(project)}
                tone={revisionsExhausted(project) ? "warning" : "neutral"}
              />
            </div>

            {project.revisions.length === 0 ? (
              <EmptyState
                title="No client feedback yet"
                body="Comments and revision requests from the client will appear here as a tracked list, not only as messages."
              />
            ) : (
              <ul className="ap-revision-list">
                {project.revisions.map((revision) => {
                  const unanswered = revision.comments.filter((c) => !c.response).length;
                  return (
                    <li key={revision.id} className="ap-revision-row">
                      <div>
                        <strong>{revision.deliverableName}</strong>
                        <span>
                          Round {revision.round} · {plural(revision.comments.length, "comment")} ·
                          submitted {formatShortDate(revision.submittedAt)}
                        </span>
                        <span className="ap-revision-deadline">
                          Respond by {formatShortDate(revision.responseDeadline)}
                        </span>
                      </div>
                      <div className="ap-revision-row-actions">
                        <StatusPill
                          label={
                            revision.status === "open"
                              ? `${unanswered} awaiting response`
                              : revision.status === "responded"
                                ? "Responded"
                                : "Closed"
                          }
                          tone={revision.status === "open" ? "warning" : "success"}
                          size="sm"
                        />
                        <button
                          type="button"
                          className="ap-btn-primary ap-btn-sm"
                          onClick={() => onOpenRevision(revision)}
                        >
                          {revision.status === "open" ? "Review comments" : "View responses"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <section className="ap-inner-panel">
              <div className="ap-inner-panel-head">
                <h3>Conversation summaries</h3>
                <button
                  type="button"
                  className="ap-btn-outline ap-btn-sm"
                  onClick={onAddConversationSummary}
                >
                  <NotePencil size={13} weight="bold" /> Add conversation summary
                </button>
              </div>
              {project.conversationSummaries.length === 0 ? (
                <p className="ap-empty-inline">
                  Record any phone or video conversation that affected scope so it becomes part of
                  the project record.
                </p>
              ) : (
                <ul className="ap-summary-list">
                  {project.conversationSummaries.map((summary) => (
                    <li key={summary.id}>
                      <div className="ap-summary-head">
                        <strong>{formatLongDate(summary.date)}</strong>
                        <StatusPill
                          label={
                            summary.status === "confirmed"
                              ? "Confirmed by client"
                              : summary.status === "disputed"
                                ? "Disputed by client"
                                : summary.status === "clarified"
                                  ? "Clarification added"
                                  : "Awaiting client confirmation"
                          }
                          tone={
                            summary.status === "confirmed"
                              ? "success"
                              : summary.status === "disputed"
                                ? "danger"
                                : "waiting"
                          }
                          size="sm"
                        />
                      </div>
                      <p>
                        <strong>Participants:</strong> {summary.participants}
                      </p>
                      <p>{summary.discussion}</p>
                      <p>
                        <strong>Decision:</strong> {summary.decision}
                      </p>
                      <p>
                        <strong>Required action:</strong> {summary.requiredAction}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* ------------------------------------------------ Payments */}
        {activeTab === "payments" && (
          <div className="ap-stack">
            <section className="ap-inner-panel">
              <h3>Design fee</h3>
              <div className="ap-money-grid">
                <div>
                  <span>Total fee</span>
                  <strong>{formatNaira(financials.totalDesignFee)}</strong>
                </div>
                <div>
                  <span>Funded</span>
                  <strong>{formatNaira(financials.funded)}</strong>
                </div>
                <div>
                  <span>Earned</span>
                  <strong>{formatNaira(financials.earned)}</strong>
                </div>
                <div>
                  <span>Awaiting client approval</span>
                  <strong>{formatNaira(financials.awaitingApproval)}</strong>
                </div>
                <div>
                  <span>Available for withdrawal</span>
                  <strong>{formatNaira(financials.availableForWithdrawal)}</strong>
                </div>
                <div>
                  <span>Paid</span>
                  <strong>{formatNaira(financials.paid)}</strong>
                </div>
              </div>
              {financials.nextMilestoneName && (
                <p className="ap-panel-lead">
                  Next milestone: <strong>{financials.nextMilestoneName}</strong> · Next release{" "}
                  {formatNaira(financials.nextMilestoneAmount)}
                </p>
              )}
              {financials.availableForWithdrawal > 0 && (
                <button
                  type="button"
                  className="ap-btn-primary ap-btn-sm"
                  onClick={onWithdraw}
                  disabled={Boolean(withdrawBlockedReason)}
                  title={withdrawBlockedReason}
                >
                  Withdraw {formatNaira(financials.availableForWithdrawal)}
                </button>
              )}
              {withdrawBlockedReason && <p className="ap-fine-print">{withdrawBlockedReason}</p>}
            </section>

            <section className="ap-inner-panel">
              <h3>Payment milestones</h3>
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
                        {milestone.disputeReason && (
                          <small className="ap-table-flag">
                            <WarningCircle size={12} weight="bold" /> {milestone.disputeReason}
                          </small>
                        )}
                      </div>
                      <StatusPill label={meta.label} tone={meta.tone} title={meta.hint} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {/* ------------------------------------------------ Documents */}
        {activeTab === "documents" && (
          <div className="ap-stack">
            {project.documents.length === 0 && !project.brief.surveyPlan ? (
              <EmptyState
                title="No documents yet"
                body="Survey plans, land documents, drawings and receipts for this project will collect here."
              />
            ) : (
              <ul className="ap-doc-list">
                {project.brief.surveyPlan && (
                  <li key={project.brief.surveyPlan.id}>
                    <FileArrowDown size={16} weight="bold" />
                    <div>
                      <strong>{project.brief.surveyPlan.name}</strong>
                      <span>
                        Survey plan · from client brief ·{" "}
                        {formatShortDate(project.brief.surveyPlan.uploadedAt)}
                      </span>
                    </div>
                  </li>
                )}
                {project.documents.map((document) => (
                  <li key={document.id}>
                    <FileArrowDown size={16} weight="bold" />
                    <div>
                      <strong>{document.name}</strong>
                      <span>
                        {document.category} · {document.uploadedBy} ·{" "}
                        {formatShortDate(document.uploadedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ------------------------------------------------ Messages */}
        {activeTab === "messages" && (
          <div className="ap-stack">
            <Notice tone="info">
              Messages support the workflow but do not replace it. Anything that changes scope should
              be recorded as a conversation summary or a revision response.
            </Notice>

            {projectMessages.length === 0 ? (
              <p className="ap-empty-inline">No messages on this project yet.</p>
            ) : (
              <ul className="ap-message-list">
                {projectMessages.map((message) => (
                  <li
                    key={message.id}
                    className={`ap-message ap-message--${message.authorRole}`}
                  >
                    <div className="ap-message-head">
                      <strong>{message.author}</strong>
                      <StatusPill
                        label={MESSAGE_TYPE_LABELS[message.type]}
                        tone="neutral"
                        size="sm"
                      />
                      <time>{formatShortDate(message.createdAt)}</time>
                    </div>
                    <p>{message.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form
              className="ap-message-composer"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) return;
                onSendMessage(draft.trim(), draftType);
                setDraft("");
              }}
            >
              <select
                value={draftType}
                onChange={(event) => setDraftType(event.target.value as ProjectMessage["type"])}
                aria-label="Message type"
              >
                {Object.entries(MESSAGE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${project.clientName}…`}
                aria-label="Message body"
              />
              <button type="submit" className="ap-btn-primary ap-btn-sm" disabled={!draft.trim()}>
                <ChatCircleDots size={15} weight="bold" /> Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
