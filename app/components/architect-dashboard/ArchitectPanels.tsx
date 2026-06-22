"use client";

import { MapPin, Clock } from "phosphor-react";
import type {
  ArchitectProject,
  ArchitectProposal,
  DesignRequest,
} from "./types";
import { formatNaira, formatRelativeTime } from "./utils";

type ArchitectProjectsPanelProps = {
  projects: ArchitectProject[];
  filter?: "all" | "active";
};

export function ArchitectProjectsPanel({ projects, filter = "all" }: ArchitectProjectsPanelProps) {
  const list =
    filter === "active"
      ? projects.filter((p) => p.status === "in_progress")
      : projects;

  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>{filter === "active" ? "Active Designs" : "Projects"}</h2>
        <p>{list.length} project{list.length !== 1 ? "s" : ""}</p>
      </header>
      {list.length === 0 ? (
        <p className="ap-empty-inline">No projects yet.</p>
      ) : (
        <div className="ap-card-grid">
          {list.map((project) => (
            <article key={project.id} className="ap-project-card">
              <div
                className="ap-project-card-image"
                style={{ backgroundImage: `url(${project.imageUrl})` }}
              />
              <div className="ap-project-card-body space-y-1">
                <span className={`ap-status-pill ap-status-pill--${project.status}`}>
                  {project.status.replace("_", " ").toUpperCase()}
                </span>
                <h3>{project.title}</h3>
                <p className="text-base font-medium text-muted flex items-center gap-1">
                  <MapPin size={14} weight="bold" />
                  {project.location} · {project.clientName}
                </p>
                <p>{formatNaira(project.contractValue)} · {project.progress}% complete</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

type ArchitectDesignRequestsPanelProps = {
  requests: DesignRequest[];
  onRespond?: (id: string) => void;
};

export function ArchitectDesignRequestsPanel({
  requests,
  onRespond,
}: ArchitectDesignRequestsPanelProps) {
  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>Design Requests</h2>
        <p>Incoming client briefs from the Amana marketplace.</p>
      </header>
      {requests.length === 0 ? (
        <p className="ap-empty-inline">No design requests right now.</p>
      ) : (
        <ul className="ap-request-list">
          {requests.map((req) => (
            <li key={req.id} className="ap-request-card">
              <div>
                <div className="flex gap-3">

                <strong>{req.clientName}</strong>
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-muted">{req.projectType}</span>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin size={12} weight="bold" />
                  {req.location} · {req.budgetRange}
                </span>
                <time className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-muted flex items-center gap-1">
                  <Clock size={12} weight="bold" />
                  {formatRelativeTime(req.receivedAt)}
                </time>
              </div>
              {req.status === "new" && onRespond && (
                <button type="button" className="ap-btn-primary ap-btn-sm" onClick={() => onRespond(req.id)}>
                  Send Proposal
                </button>
              )}
              {req.status !== "new" && (
                <span className="ap-status-pill">{req.status.toUpperCase()}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ArchitectProposalsPanelProps = {
  proposals: ArchitectProposal[];
};

export function ArchitectProposalsPanel({ proposals }: ArchitectProposalsPanelProps) {
  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>Proposals</h2>
        <p>Track sent proposals and client responses.</p>
      </header>
      {proposals.length === 0 ? (
        <p className="ap-empty-inline">No proposals sent yet.</p>
      ) : (
        <ul className="ap-proposal-list">
          {proposals.map((p) => (
            <li key={p.id} className="ap-proposal-card">
              <div className="space-x-2">
                <strong>{p.projectTitle}</strong>
                <span>{p.clientName}</span>
                <span className="text-[0.9
                
                2rem] font-bold uppercase tracking-[0.06em] text-muted">{formatNaira(p.amount)}</span>
              </div>
              <span className={`ap-status-pill ap-status-pill--${p.status}`}>
                {p.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ArchitectVaultPanelProps = {
  vault: import("./types").ArchitectVault;
  canRequestRelease: boolean;
  onRequestRelease: () => void;
  releaseBlockedReason?: string;
};

export function ArchitectVaultPanel({
  vault,
  canRequestRelease,
  onRequestRelease,
  releaseBlockedReason,
}: ArchitectVaultPanelProps) {
  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>Vault & Earnings</h2>
        <p>Milestone-protected payments from your active contracts.</p>
      </header>
      <div className="ap-vault-panel-grid">
        <div className="ap-vault-stat">
          <span>Total Contract Value</span>
          <strong>{formatNaira(vault.totalContract)}</strong>
        </div>
        <div className="ap-vault-stat">
          <span>Released to You</span>
          <strong>{formatNaira(vault.released)}</strong>
        </div>
        <div className="ap-vault-stat">
          <span>Protected Remaining</span>
          <strong>{formatNaira(vault.protected)}</strong>
        </div>
        <div className="ap-vault-stat">
          <span>Pending Release</span>
          <strong>{formatNaira(vault.pendingRelease)}</strong>
        </div>
      </div>
      <button
        type="button"
        className="ap-btn-primary"
        onClick={onRequestRelease}
        disabled={!canRequestRelease}
      >
        Request Release
      </button>
      {!canRequestRelease && releaseBlockedReason && (
        <p className="ap-vault-blocked">{releaseBlockedReason}</p>
      )}
    </div>
  );
}

export function ArchitectDocumentsPanel() {
  const docs = [
    { name: "Idemeto — Construction Drawings v3.pdf", date: "2026-06-10" },
    { name: "Adeyemi — Concept Board.pdf", date: "2026-02-15" },
  ];
  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>Documents</h2>
        <p>Shared deliverables with clients.</p>
      </header>
      <ul className="ap-doc-list">
        {docs.map((doc) => (
          <li key={doc.name}>
            <strong>{doc.name}</strong>
            <span>{doc.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchitectReviewsPanel() {
  const reviews = [
    {
      client: "Idemeto Family",
      rating: 5,
      text: "Clear communication and excellent drawings throughout.",
      date: "2026-05-01",
    },
  ];
  return (
    <div className="ap-subpage">
      <header className="ap-subpage-header">
        <h2>Reviews</h2>
        <p>Client feedback on completed design work.</p>
      </header>
      {reviews.length === 0 ? (
        <p className="ap-empty-inline">No reviews yet.</p>
      ) : (
        <ul className="ap-review-list">
          {reviews.map((r) => (
            <li key={r.client} className="ap-review-card">
              <strong>{r.client}</strong>
              <span>★ {r.rating}/5</span>
              <p>{r.text}</p>
              <time>{r.date}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
