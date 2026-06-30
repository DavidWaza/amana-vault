"use client";

import {
  MapPin,
  Calendar,
  ShieldCheck,
  ChatsCircle,
  Scales,
  Scroll,
  Wallet,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
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

  const primaryDisabled =
    action?.disabled ||
    (["fund_escrow", "review_agreement"].includes(action?.action ?? "") && !canFundJobs);

  return (
    <article
      id={project.id}
      className={`cp-proj-card cp-proj-card--${status.tone}${project.priority === "urgent" ? " cp-proj-card--urgent" : ""}`}
    >
      <div className="cp-proj-card-glow" aria-hidden />

      <header className="cp-proj-card-top">
        <div className="cp-proj-card-top-row">
          <p className="cp-proj-card-eyebrow">
            {formatBuildingType(project.buildingType)} · {project.city}, {project.state}
          </p>
          <span className={`cp-proj-badge cp-proj-badge--${status.tone}`}>
            {status.label}
          </span>
        </div>
        <h3 className="cp-proj-card-title">{project.title}</h3>
        <p className="cp-proj-card-lead">
          {responsible}
          {(project.contractorVerified || project.architectVerified) && (
            <span className="cp-proj-card-verified">
              <ShieldCheck size={12} weight="fill" /> Verified
            </span>
          )}
        </p>
      </header>

      <div className="cp-proj-stage">
        <div className="cp-proj-stage-copy">
          <small>Current stage</small>
          <strong>{stageLabel}</strong>
          {project.designStage && project.lifecycleStage === "design" && (
            <span className="cp-proj-stage-sub">
              {project.designStage.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      <ul className="cp-proj-meta-list">
        <li>
          <div className="cp-proj-meta-row">
            <span className="cp-proj-meta-row-icon">
              <MapPin size={15} weight="bold" />
            </span>
            <span>
              <small>Location</small>
              <strong>{project.location}</strong>
            </span>
          </div>
        </li>
        {project.amount > 0 && (
          <li>
            <div className="cp-proj-meta-row">
              <span className="cp-proj-meta-row-icon">
                <Wallet size={15} weight="bold" />
              </span>
              <span>
                <small>Vault value</small>
                <strong>{formatNaira(project.amount)}</strong>
              </span>
            </div>
          </li>
        )}
        {project.fundedAt && (
          <li>
            <div className="cp-proj-meta-row">
              <span className="cp-proj-meta-row-icon">
                <Calendar size={15} weight="bold" />
              </span>
              <span>
                <small>Funded</small>
                <strong>{formatRelativeDate(project.fundedAt)}</strong>
              </span>
            </div>
          </li>
        )}
      </ul>

      {activeMilestone && (
        <div className="cp-proj-milestone">
          <strong>{activeMilestone.label}</strong>
          <span
            className={`cp-proj-milestone-status cp-proj-milestone-status--${activeMilestone.status}`}
          >
            {activeMilestone.status === "inspection"
              ? "Awaiting approval"
              : activeMilestone.status}
          </span>
          {activeMilestone.amount > 0 && (
            <span className="cp-proj-milestone-amount">
              {formatNaira(activeMilestone.amount)}
            </span>
          )}
        </div>
      )}

      {project.disputeReason && (
        <p className="cp-proj-alert">
          <Scales size={16} weight="bold" />
          {project.disputeReason}
        </p>
      )}

      {action?.hint && <p className="cp-proj-hint">{action.hint}</p>}

      <footer className="cp-proj-card-actions">
        {action && (
          <Button
            type="button"
            className={`adash-btn adash-btn--${action.variant}`}
            disabled={primaryDisabled}
            onClick={handlePrimaryClick}
          >
            {action.label}
          </Button>
        )}
        {canMessage && onMessage && (
          <Button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={() => onMessage(project)}
          >
            <ChatsCircle size={16} weight="bold" />
            Message
          </Button>
        )}
        {canRaiseConcern && (
          <Button
            type="button"
            className="adash-btn adash-btn--ghost adash-btn--danger-text"
            onClick={() => onRaiseConcern(project)}
          >
            Raise concern
          </Button>
        )}
        {hasBriefTrail && onViewBrief && (
          <Button
            type="button"
            className="adash-btn adash-btn--ghost"
            onClick={() => onViewBrief(project)}
          >
            <Scroll size={16} weight="bold" />
            View trail
          </Button>
        )}
      </footer>
    </article>
  );
}
