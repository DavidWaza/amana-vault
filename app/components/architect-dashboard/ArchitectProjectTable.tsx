"use client";

import { CaretRight, WarningCircle } from "phosphor-react";
import {
  APPOINTMENT_META,
  DESIGN_PHASE_LABELS,
  PROJECT_PAYMENT_STATUS_META,
  PROJECT_STATUS_META,
} from "./constants";
import { ResponsibleBadge, StatusPill } from "./ArchitectPrimitives";
import {
  resolveNextAction,
  resolveProjectPaymentStatus,
  resolveProjectStatus,
  resolveResponsibleParty,
} from "./portal-utils";
import { formatDueShort, formatNairaCompact, isOverdue } from "./utils";
import type { ArchitectProject } from "./types";

type ArchitectProjectTableProps = {
  projects: ArchitectProject[];
  onOpenProject: (projectId: string) => void;
};

/**
 * The scannable project list from PRD §9. Every row answers the same three
 * questions: what happens next, who owns it, and when is it due.
 *
 * The table collapses into stacked cards on small screens — each cell keeps its
 * column name via `data-label` so nothing loses meaning.
 */
export default function ArchitectProjectTable({
  projects,
  onOpenProject,
}: ArchitectProjectTableProps) {
  return (
    <div className="ap-table-wrap">
      <table className="ap-table">
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Client</th>
            <th scope="col">Appointment</th>
            <th scope="col">Current phase</th>
            <th scope="col">Next action</th>
            <th scope="col">Responsible</th>
            <th scope="col">Due</th>
            <th scope="col">Payment</th>
            <th scope="col" className="ap-table-action-col">
              <span className="ap-visually-hidden">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const status = resolveProjectStatus(project);
            const statusMeta = PROJECT_STATUS_META[status];
            const paymentStatus = resolveProjectPaymentStatus(project);
            const paymentMeta = PROJECT_PAYMENT_STATUS_META[paymentStatus];
            const overdue = isOverdue(project.dueDate) && status !== "project_completed";

            return (
              <tr
                key={project.id}
                className={overdue ? "ap-table-row--overdue" : undefined}
                onClick={() => onOpenProject(project.id)}
                tabIndex={0}
                role="link"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenProject(project.id);
                  }
                }}
              >
                <td data-label="Project">
                  <div className="ap-table-project">
                    <span
                      className="ap-table-thumb"
                      style={{ backgroundImage: `url(${project.imageUrl})` }}
                      aria-hidden
                    />
                    <div>
                      <strong>{project.title}</strong>
                      <StatusPill label={statusMeta.label} tone={statusMeta.tone} size="sm" />
                    </div>
                  </div>
                </td>
                <td data-label="Client">
                  <span className="ap-table-strong">{project.clientCompany ?? project.clientName}</span>
                  {project.clientCompany && <small>{project.clientName}</small>}
                  {!project.clientVerified && (
                    <small className="ap-table-flag">
                      <WarningCircle size={12} weight="bold" /> Client not verified
                    </small>
                  )}
                </td>
                <td data-label="Appointment">
                  <span title={APPOINTMENT_META[project.appointment].hint}>
                    {APPOINTMENT_META[project.appointment].label}
                  </span>
                </td>
                <td data-label="Current phase">{DESIGN_PHASE_LABELS[project.phase]}</td>
                <td data-label="Next action" className="ap-table-next">
                  {resolveNextAction(project)}
                </td>
                <td data-label="Responsible">
                  <ResponsibleBadge party={resolveResponsibleParty(project)} />
                </td>
                <td data-label="Due" className={overdue ? "ap-table-due--overdue" : undefined}>
                  {formatDueShort(project.dueDate)}
                </td>
                <td data-label="Payment">
                  <StatusPill label={paymentMeta.label} tone={paymentMeta.tone} size="sm" />
                  <small>{formatNairaCompact(project.designFee)} fee</small>
                </td>
                <td data-label="" className="ap-table-action-col">
                  <button
                    type="button"
                    className="ap-btn-outline ap-btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenProject(project.id);
                    }}
                  >
                    Open project
                    <CaretRight size={13} weight="bold" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
