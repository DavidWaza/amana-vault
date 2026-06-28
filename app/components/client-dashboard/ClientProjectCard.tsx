"use client";

import {
  MapPin,
  Calendar,
  ShieldCheck,
  User,
  ChatsCircle,
  Scales,
  Wrench,
  SquaresFour,
  Scroll,
} from "phosphor-react";
import type { ClientProject, ClientJobPrimaryAction } from "./types";
import {
  formatNaira,
  formatRelativeDate,
  canMessageProfessional,
  getClientJobPrimaryAction,
  CLIENT_JOB_STATUS_META,
  getProjectStageLabel,
  getResponsibleParty,
  formatBuildingType,
} from "./utils";

type ClientProjectCardProps = {
  project: ClientProject;
  canFundJobs: boolean;
  hasBriefTrail?: boolean;
  onPrimaryAction?: (project: ClientProject, action: ClientJobPrimaryAction) => void;
  onMessage?: (project: ClientProject) => void;
  onRaiseConcern?: (project: ClientProject) => void;
  onViewBrief?: (project: ClientProject) => void;
};

export default function ClientProjectCard({
  project,
  canFundJobs,
  hasBriefTrail,
  onPrimaryAction,
  onMessage,
  onRaiseConcern,
  onViewBrief,
}: ClientProjectCardProps) {
  const status = CLIENT_JOB_STATUS_META[project.status];
  const action = getClientJobPrimaryAction(project);
  const responsible = getResponsibleParty(project);
  const stageLabel = getProjectStageLabel(project);
  const canMessage = canMessageProfessional(project);
  const canRaiseConcern =
    onRaiseConcern != null &&
    ["funds_secured", "in_progress", "proof_submitted"].includes(project.status);

  const handlePrimaryClick = () => {
    if (!action?.action || action.disabled || !onPrimaryAction) return;
    onPrimaryAction(project, action.action);
  };

  const activeMilestone = project.vaultMilestones?.find(
    (m) => m.status === "inspection" || m.status === "active",
  );

  return (
    <article
      id={project.id}
      className={`adash-job-card cdash-project-card${project.priority === "urgent" ? " adash-job-card--urgent" : ""}`}
    >
      <div className="adash-job-card-top">
        <div>
          <p className="cdash-project-type">
            {formatBuildingType(project.buildingType)} · {project.city}, {project.state}
          </p>
          <h3>{project.title}</h3>
          <p className="adash-job-client">
            {project.lifecycleStage === "construction" ||
            project.lifecycleStage === "vault_setup" ? (
              <>
                <Wrench size={14} weight="bold" />
                {responsible}
              </>
            ) : (
              <>
                <SquaresFour size={14} weight="bold" />
                {responsible}
              </>
            )}
            {(project.contractorVerified || project.architectVerified) && (
              <span className="adash-job-verified">
                <ShieldCheck size={12} weight="fill" /> Verified
              </span>
            )}
          </p>
        </div>
        <span className={`adash-job-badge adash-job-badge--${status.tone}`}>
          {status.label}
        </span>
      </div>

      <div className="cdash-project-stage">
        <span className="cdash-project-stage-label">Stage</span>
        <strong>{stageLabel}</strong>
        {project.designStage && project.lifecycleStage === "design" && (
          <span className="cdash-project-design-sub">
            {project.designStage.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {project.amount > 0 && (
        <div className="adash-job-meta">
          <span>
            <User size={14} weight="bold" />
            Vault value {formatNaira(project.amount)}
          </span>
          {project.fundedAt && (
            <span>
              <Calendar size={14} weight="bold" />
              Funded {formatRelativeDate(project.fundedAt)}
            </span>
          )}
        </div>
      )}

      <p className="adash-job-location">
        <MapPin size={14} weight="bold" />
        {project.location}
      </p>

      {activeMilestone && (
        <div className="cdash-milestone-preview">
          <strong>{activeMilestone.label} milestone</strong>
          <span className={`cdash-milestone-status cdash-milestone-status--${activeMilestone.status}`}>
            {activeMilestone.status === "inspection"
              ? "Awaiting your approval"
              : activeMilestone.status}
          </span>
          {activeMilestone.amount > 0 && (
            <span>{formatNaira(activeMilestone.amount)}</span>
          )}
        </div>
      )}

      {project.disputeReason && (
        <p className="adash-job-dispute">
          <Scales size={14} weight="bold" />
          {project.disputeReason}
        </p>
      )}

      {action?.hint && <p className="adash-job-hint">{action.hint}</p>}

      <div className="adash-job-actions">
        {action && (
          <button
            type="button"
            className={`adash-btn adash-btn--${action.variant}`}
            disabled={
              action.disabled ||
              (["fund_escrow", "review_agreement"].includes(action.action ?? "") &&
                !canFundJobs)
            }
            onClick={handlePrimaryClick}
          >
            {action.label}
          </button>
        )}
        {canMessage && onMessage && (
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={() => onMessage(project)}
          >
            <ChatsCircle size={16} weight="bold" />
            Message
          </button>
        )}
        {canRaiseConcern && (
          <button
            type="button"
            className="adash-btn adash-btn--ghost adash-btn--danger-text"
            onClick={() => onRaiseConcern(project)}
          >
            Raise concern
          </button>
        )}
        {hasBriefTrail && onViewBrief && (
          <button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={() => onViewBrief(project)}
          >
            <Scroll size={16} weight="bold" />
            View submission trail
          </button>
        )}
      </div>
    </article>
  );
}
