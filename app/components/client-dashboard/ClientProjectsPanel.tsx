"use client";

import { useMemo, useState } from "react";
import type { ClientProject, ClientDashboardTab, ClientJobPrimaryAction } from "./types";
import { isClientActiveJob, isClientHistoryJob, isClientPendingTab } from "./utils";
import ClientProjectCard from "./ClientProjectCard";
import ClientEmptyState from "./ClientEmptyState";

type ClientProjectsPanelProps = {
  projects: ClientProject[];
  canFundJobs: boolean;
  onPrimaryAction?: (project: ClientProject, action: ClientJobPrimaryAction) => void;
  onMessage?: (project: ClientProject) => void;
  onRaiseConcern?: (project: ClientProject) => void;
  onStartProject?: () => void;
};

const TABS: { id: ClientDashboardTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Needs Action" },
  { id: "history", label: "History" },
];

export default function ClientProjectsPanel({
  projects,
  canFundJobs,
  onPrimaryAction,
  onMessage,
  onRaiseConcern,
  onStartProject,
}: ClientProjectsPanelProps) {
  const [tab, setTab] = useState<ClientDashboardTab>("pending");

  const filteredProjects = useMemo(() => {
    switch (tab) {
      case "active":
        return projects.filter(isClientActiveJob);
      case "pending":
        return projects.filter(isClientPendingTab);
      case "history":
        return projects.filter(isClientHistoryJob);
      default:
        return [];
    }
  }, [projects, tab]);

  const tabCounts = useMemo(
    () => ({
      active: projects.filter(isClientActiveJob).length,
      pending: projects.filter(isClientPendingTab).length,
      history: projects.filter(isClientHistoryJob).length,
    }),
    [projects],
  );

  return (
    <section className="adash-jobs" id="projects">
      <div className="adash-jobs-header">
        <div>
          <h2>My Projects</h2>
          <p>
            Track every build from vision to completion — know your stage, your team,
            and what action is needed.
          </p>
        </div>
        {onStartProject && (
          <button
            type="button"
            className="adash-btn adash-btn--primary cdash-jobs-header-btn"
            onClick={onStartProject}
          >
            Start Project
          </button>
        )}
      </div>

      <div className="adash-tabs" role="tablist" aria-label="Project categories">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`adash-tab${tab === item.id ? " adash-tab--active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {tabCounts[item.id] > 0 && (
              <span className="adash-tab-count">{tabCounts[item.id]}</span>
            )}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <ClientEmptyState tab={tab} canFundJobs={canFundJobs} onStartProject={onStartProject} />
      ) : (
        <div className="adash-job-list">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              canFundJobs={canFundJobs}
              onPrimaryAction={onPrimaryAction}
              onMessage={onMessage}
              onRaiseConcern={onRaiseConcern}
            />
          ))}
        </div>
      )}
    </section>
  );
}
