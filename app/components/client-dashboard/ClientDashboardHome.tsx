"use client";

import {
  MapPin,
  ShieldCheck,
  Buildings,
  UsersThree,
  CalendarBlank,
  CheckCircle,
  LockSimple,
  CaretRight,
  Warning,
  Info,
  ChatsCircle,
  Wallet,
} from "phosphor-react";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import type {
  ClientEscrow,
  ClientNotification,
  ClientProject,
  ProjectUpdate,
} from "./types";
import { formatNaira, formatRelativeDate } from "./utils";
import { getProjectProgress, getInitials } from "./portal-utils";
import { MOCK_ARCHITECTS } from "./mock-data";

type BuildTeamMember = {
  id: string;
  name: string;
  company: string;
  role: "ARCHITECT" | "CONTRACTOR" | "INSPECTOR";
  status: "Completed" | "Active" | "Pending";
};

type ClientDashboardHomeProps = {
  activeProject: ClientProject | null;
  escrow: ClientEscrow;
  updates: ProjectUpdate[];
  alerts: ClientNotification[];
  onAlertAction: (alert: ClientNotification) => void;
  onNavigate: (view: string) => void;
  onOpenChat: (projectId: string) => void;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

const STEPPER_PHASES = [
  { key: "foundation", label: "Foundation" },
  { key: "structure", label: "Structure" },
  { key: "roofing", label: "Roofing" },
  { key: "finishing", label: "Finishing" },
  { key: "handover", label: "Handover" },
] as const;

function buildTeamFromProject(project: ClientProject | null): BuildTeamMember[] {
  if (!project) return [];
  const team: BuildTeamMember[] = [];
  if (project.architectName) {
    team.push({
      id: "arch",
      name: project.architectName,
      company: MOCK_ARCHITECTS.find((a) => a.name === project.architectName)?.company ?? `${project.architectName} Studio`,
      role: "ARCHITECT",
      status: project.lifecycleStage === "construction" ? "Completed" : "Active",
    });
  }
  if (project.contractorName) {
    team.push({
      id: "con",
      name: project.contractorName,
      company: project.contractorName,
      role: "CONTRACTOR",
      status: project.status === "in_progress" ? "Active" : "Pending",
    });
  }
  const inspector = project.vaultMilestones?.find((m) => m.inspectorName)?.inspectorName;
  if (inspector) {
    team.push({
      id: "insp",
      name: inspector,
      company: "Independent Inspector",
      role: "INSPECTOR",
      status: "Pending",
    });
  }
  return team;
}

function getStepState(
  project: ClientProject | null,
  phaseKey: string,
): "completed" | "active" | "upcoming" {
  if (!project?.vaultMilestones) {
    if (phaseKey === "foundation") return "completed";
    if (phaseKey === "structure") return "active";
    return "upcoming";
  }
  if (phaseKey === "handover") {
    const allReleased = project.vaultMilestones.every((m) => m.status === "released");
    return allReleased ? "completed" : "upcoming";
  }
  const milestone = project.vaultMilestones.find((m) => m.name === phaseKey);
  if (!milestone) return "upcoming";
  if (milestone.status === "released") return "completed";
  if (["inspection", "approved", "active"].includes(milestone.status)) return "active";
  return "upcoming";
}

function mapAlertTone(type: ClientNotification["type"]): string {
  switch (type) {
    case "warning":
      return "yellow";
    case "info":
      return "blue";
    case "success":
      return "green";
    default:
      return "purple";
  }
}

export default function ClientDashboardHome({
  activeProject,
  escrow,
  updates,
  alerts,
  onAlertAction,
  onNavigate,
  onOpenChat,
}: ClientDashboardHomeProps) {
  const totalValue = activeProject?.amount ?? escrow.securedBalance + escrow.releasedTotal;
  const released = escrow.releasedTotal;
  const remaining = escrow.securedBalance;
  const progress = activeProject ? getProjectProgress(activeProject) : 0;
  const releasedPct = totalValue > 0 ? Math.round((released / totalValue) * 1000) / 10 : 0;
  const protectedPct = totalValue > 0 ? Math.round((remaining / totalValue) * 1000) / 10 : 0;

  const team = buildTeamFromProject(activeProject);
  const recentUpdates = updates.slice(0, 4);
  const pendingAlerts = alerts.slice(0, 4);

  const nextAction = alerts[0];
  const currentPhase =
    activeProject?.vaultMilestones?.find((m) =>
      ["inspection", "active", "approved"].includes(m.status),
    )?.label ?? "Structure";

  return (
    <div className="cp-dashboard">
      {activeProject && (
        <section className="cp-hero">
          <div className="cp-hero-card">
            <span className="cp-hero-label">
              <span className="cp-hero-dot" />
              ACTIVE PROJECT
            </span>
            <h2>{activeProject.title}</h2>
            <p className="cp-hero-location">
              <MapPin size={16} weight="bold" />
              {activeProject.city}, {activeProject.state}, Nigeria
            </p>
            <div className="cp-hero-vault">
              <VaultIcon size={28} variant="white" />
              <div>
                <span>Amana Vault</span>
                <strong>{formatNaira(totalValue)}</strong>
                <small>Protected Amount</small>
              </div>
            </div>
            <div className="cp-hero-stats">
              <div>
                <span>Released</span>
                <strong>{formatNaira(released)}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{formatNaira(remaining)}</strong>
              </div>
              <div>
                <span>Overall Progress</span>
                <strong>{progress}%</strong>
              </div>
            </div>
          </div>

          <div
            className="cp-hero-image"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
            role="img"
            aria-label={`${activeProject.title} residence`}
          />

          <div className="cp-hero-stepper">
            {STEPPER_PHASES.map((phase) => {
              const state = getStepState(activeProject, phase.key);
              return (
                <div key={phase.key} className={`cp-step cp-step--${state}`}>
                  <span className="cp-step-icon">
                    {state === "completed" ? (
                      <CheckCircle size={18} weight="fill" />
                    ) : state === "active" ? (
                      <Buildings size={18} weight="bold" />
                    ) : (
                      <LockSimple size={16} weight="bold" />
                    )}
                  </span>
                  <span className="cp-step-label">{phase.label}</span>
                  <span className="cp-step-status">
                    {state === "completed"
                      ? "Completed"
                      : state === "active"
                        ? "In Progress"
                        : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="cp-metrics">
        <article className="cp-metric-card">
          <span className="cp-metric-icon cp-metric-icon--green">
            <ShieldCheck size={22} weight="fill" />
          </span>
          <div>
            <strong>{formatNaira(remaining)}</strong>
            <span>Remaining in vault</span>
            <small>Protected</small>
          </div>
        </article>
        <article className="cp-metric-card">
          <span className="cp-metric-icon cp-metric-icon--gold">
            <Buildings size={22} weight="bold" />
          </span>
          <div>
            <strong>{currentPhase}</strong>
            <span>
              Since{" "}
              {activeProject?.lastUpdated
                ? new Date(activeProject.lastUpdated).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <small>Current Phase</small>
          </div>
        </article>
        <article className="cp-metric-card">
          <span className="cp-metric-icon cp-metric-icon--teal">
            <UsersThree size={22} weight="bold" />
          </span>
          <div>
            <strong>{team.length} Professionals</strong>
            <span>Architect · Contractor · Inspector</span>
            <small>Project Team</small>
          </div>
        </article>
        <article className="cp-metric-card">
          <span className="cp-metric-icon cp-metric-icon--purple">
            <CalendarBlank size={22} weight="bold" />
          </span>
          <div>
            <strong>{nextAction?.title ?? "All caught up"}</strong>
            <span>{nextAction?.message ?? "No pending actions"}</span>
            <small>Next Action</small>
          </div>
        </article>
      </section>

      <section className="cp-grid">
        <article className="cp-panel">
          <header className="cp-panel-header">
            <h3>Your Build Team</h3>
            <button type="button" className="cp-link-btn" onClick={() => onNavigate("team")}>
              View All
            </button>
          </header>
          <ul className="cp-team-list">
            {team.map((member) => (
              <li key={member.id} className="cp-team-item">
                <span className="cp-avatar cp-avatar--sm">{getInitials(member.name)}</span>
                <div className="cp-team-info">
                  <strong>{member.company}</strong>
                  <span>{member.name}</span>
                  <span className={`cp-role-tag cp-role-tag--${member.role.toLowerCase()}`}>
                    {member.role}
                  </span>
                </div>
                <div className="cp-team-status">
                  <span className={`cp-status-dot cp-status-dot--${member.status.toLowerCase()}`} />
                  {member.status}
                </div>
                <button
                  type="button"
                  className="cp-link-btn"
                  onClick={() => activeProject && onOpenChat(activeProject.id)}
                >
                  View Details
                </button>
              </li>
            ))}
            {team.length === 0 && (
              <li className="cp-empty-inline">Assign your build team to get started.</li>
            )}
          </ul>
          <button type="button" className="cp-outline-btn" onClick={() => onNavigate("architects")}>
            Assign Inspector
          </button>
        </article>

        <article className="cp-panel">
          <header className="cp-panel-header">
            <h3>Recent Project Updates</h3>
            <button type="button" className="cp-link-btn" onClick={() => onNavigate("updates")}>
              View All
            </button>
          </header>
          <ul className="cp-updates-list">
            {recentUpdates.map((update) => (
              <li key={update.id} className="cp-update-item">
                <span className={`cp-update-icon cp-update-icon--${update.professionalRole}`}>
                  <CheckCircle size={16} weight="fill" />
                </span>
                <div>
                  <strong>{update.update}</strong>
                  <span>{formatRelativeDate(update.date)}</span>
                  {(update.photos ?? 0) > 0 && (
                    <div className="cp-update-thumbs">
                      {Array.from({ length: Math.min(update.photos ?? 0, 4) }).map((_, i) => (
                        <span key={i} className="cp-update-thumb" />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <div className="cp-panel-stack">
          <article className="cp-panel">
            <header className="cp-panel-header">
              <h3>Vault Overview</h3>
            </header>
            <div className="cp-vault-donut-wrap">
              <div
                className="cp-vault-donut"
                style={{
                  background: `conic-gradient(var(--client) 0% ${releasedPct}%, var(--client-soft) ${releasedPct}% 100%)`,
                }}
              >
                <div className="cp-vault-donut-center">
                  <VaultIcon size={32} />
                  <strong>{formatNaira(totalValue)}</strong>
                </div>
              </div>
              <ul className="cp-vault-legend">
                <li>
                  <span className="cp-legend-swatch cp-legend-swatch--released" />
                  Released {formatNaira(released)} ({releasedPct}%)
                </li>
                <li>
                  <span className="cp-legend-swatch cp-legend-swatch--protected" />
                  Protected {formatNaira(remaining)} ({protectedPct}%)
                </li>
              </ul>
            </div>
          </article>

          <article className="cp-panel">
            <header className="cp-panel-header">
              <h3>Pending Actions</h3>
            </header>
            <ul className="cp-pending-list">
              {pendingAlerts.length === 0 ? (
                <li className="cp-empty-inline">No pending actions right now.</li>
              ) : (
                pendingAlerts.map((alert) => (
                  <li key={alert.id}>
                    <button
                      type="button"
                      className={`cp-pending-card cp-pending-card--${mapAlertTone(alert.type)}`}
                      onClick={() => onAlertAction(alert)}
                    >
                      <span className="cp-pending-icon">
                        {alert.type === "warning" ? (
                          <Warning size={18} weight="bold" />
                        ) : alert.type === "info" ? (
                          <Info size={18} weight="bold" />
                        ) : alert.type === "success" ? (
                          <Wallet size={18} weight="bold" />
                        ) : (
                          <ChatsCircle size={18} weight="bold" />
                        )}
                      </span>
                      <div>
                        <strong>{alert.title}</strong>
                        <span>{alert.message}</span>
                      </div>
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
