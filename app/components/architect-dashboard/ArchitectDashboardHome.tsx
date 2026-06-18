"use client";

import {
  MapPin,
  CalendarBlank,
  LockSimple,
  CaretRight,
  CheckCircle,
  Circle,
  FileText,
} from "phosphor-react";
import type {
  ArchitectActivity,
  ArchitectProject,
  ArchitectVault,
} from "./types";
import { formatNaira, formatShortDate, formatRelativeTime } from "./utils";

type ArchitectDashboardHomeProps = {
  activeDesign: ArchitectProject | null;
  vault: ArchitectVault;
  activity: ArchitectActivity[];
  designRequestCount: number;
  proposalCount: number;
  activeDesignCount: number;
  onViewMilestones: () => void;
  onRequestRelease: () => void;
  onNavigate: (view: string) => void;
  canRequestRelease: boolean;
  releaseBlockedReason?: string;
};

export default function ArchitectDashboardHome({
  activeDesign,
  vault,
  activity,
  designRequestCount,
  proposalCount,
  activeDesignCount,
  onViewMilestones,
  onRequestRelease,
  onNavigate,
  canRequestRelease,
  releaseBlockedReason,
}: ArchitectDashboardHomeProps) {
  const upcoming = activeDesign?.milestones.filter(
    (m) => m.status === "in_progress" || m.status === "upcoming",
  ).slice(0, 3) ?? [];

  return (
    <div className="ap-home">
      <div className="ap-metrics">
        <button type="button" className="ap-metric-card" onClick={() => onNavigate("active-designs")}>
          <span>Active Designs</span>
          <strong>{activeDesignCount}</strong>
        </button>
        <button type="button" className="ap-metric-card" onClick={() => onNavigate("design-requests")}>
          <span>Design Requests</span>
          <strong>{designRequestCount}</strong>
        </button>
        <button type="button" className="ap-metric-card" onClick={() => onNavigate("proposals")}>
          <span>Proposals Sent</span>
          <strong>{proposalCount}</strong>
        </button>
        <button type="button" className="ap-metric-card" onClick={() => onNavigate("vault")}>
          <span>Earnings (This Month)</span>
          <strong>{formatNaira(vault.earningsThisMonth)}</strong>
          <em>+{vault.earningsDeltaPct}% vs last month</em>
        </button>
      </div>

      <div className="ap-hero-row">
        {activeDesign ? (
          <article className="ap-active-design">
            <div
              className="ap-active-design-image"
              style={{ backgroundImage: `url(${activeDesign.imageUrl})` }}
            />
            <div className="ap-active-design-body">
              <div className="ap-active-design-head">
                <div>
                  <span className="ap-status-pill">IN PROGRESS</span>
                  <h2>{activeDesign.title}</h2>
                  <p className="ap-active-design-meta">
                    <MapPin size={14} weight="bold" />
                    {activeDesign.location}
                    · Client: {activeDesign.clientName}
                  </p>
                  <p className="ap-active-design-meta">
                    <CalendarBlank size={14} weight="bold" />
                    Contract: {formatNaira(activeDesign.contractValue)}
                  </p>
                </div>
              </div>

              <div className="ap-progress-bar">
                <span style={{ width: `${activeDesign.progress}%` }} />
              </div>
              <p className="ap-progress-label">{activeDesign.progress}% complete</p>

              <div className="ap-milestone-stepper">
                {activeDesign.milestones.map((m) => (
                  <div
                    key={m.phase}
                    className={`ap-milestone-step ap-milestone-step--${m.status}`}
                  >
                    {m.status === "completed" ? (
                      <CheckCircle size={18} weight="fill" />
                    ) : m.status === "in_progress" ? (
                      <FileText size={18} weight="bold" />
                    ) : (
                      <Circle size={18} />
                    )}
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>

              {activeDesign.nextMilestoneNote && (
                <p className="ap-next-milestone">
                  Next: {activeDesign.nextMilestoneNote}
                </p>
              )}

              <button type="button" className="ap-btn-outline ap-btn-sm" onClick={onViewMilestones}>
                View Milestones
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </article>
        ) : (
          <article className="ap-active-design ap-active-design--empty">
            <h2>No active design yet</h2>
            <p>Respond to a design request or create a new project to get started.</p>
            <button type="button" className="ap-btn-primary" onClick={() => onNavigate("design-requests")}>
              View Design Requests
            </button>
          </article>
        )}

        <aside className="ap-vault-card">
          <h3>Your Vault</h3>
          <p className="ap-vault-total-label">Total Contract</p>
          <p className="ap-vault-total">{formatNaira(vault.totalContract)}</p>
          <div className="ap-vault-breakdown">
            <div>
              <span>Released</span>
              <strong>{formatNaira(vault.released)}</strong>
            </div>
            <div>
              <span>Protected</span>
              <strong>{formatNaira(vault.protected)}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>{formatNaira(vault.pendingRelease)}</strong>
            </div>
          </div>
          <button
            type="button"
            className="ap-btn-vault"
            onClick={onRequestRelease}
            disabled={!canRequestRelease}
            title={releaseBlockedReason}
          >
            Request Release
          </button>
          {!canRequestRelease && releaseBlockedReason && (
            <p className="ap-vault-blocked">{releaseBlockedReason}</p>
          )}
          <p className="ap-vault-footnote">
            <LockSimple size={14} weight="bold" />
            Funds are secure in Amana Vault until milestones are approved.
          </p>
        </aside>
      </div>

      <div className="ap-bottom-row">
        <section className="ap-panel">
          <h3>Upcoming Milestones</h3>
          {upcoming.length === 0 ? (
            <p className="ap-empty-inline">No upcoming milestones.</p>
          ) : (
            <ul className="ap-list">
              {upcoming.map((m) => (
                <li key={m.phase}>
                  <strong>{m.label}</strong>
                  {m.dueDate && <span>Due {formatShortDate(m.dueDate)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ap-panel">
          <h3>Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="ap-empty-inline">No recent activity.</p>
          ) : (
            <ul className="ap-activity-list">
              {activity.slice(0, 4).map((item) => (
                <li key={item.id} className={`ap-activity-item ap-activity-item--${item.tone}`}>
                  <span>{item.text}</span>
                  <time>{formatRelativeTime(item.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
