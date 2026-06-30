"use client";

import "./projects-panel.css";
import { useMemo, useState } from "react";
import { ClockCounterClockwise, Plus, Wrench, WarningCircle } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { ClientProject, ClientDashboardTab, ClientJobPrimaryAction } from "./types";
import { isClientActiveJob, isClientHistoryJob, isClientPendingTab } from "./utils";
import ClientProjectCard from "./ClientProjectCard";
import ClientEmptyState from "./ClientEmptyState";

type ClientProjectsPanelProps = {
  projects: ClientProject[];
  canFundJobs: boolean;
  briefTrailProjectIds?: Set<string>;
  onPrimaryAction?: (project: ClientProject, action: ClientJobPrimaryAction) => void;
  onMessage?: (project: ClientProject) => void;
  onRaiseConcern?: (project: ClientProject) => void;
  onStartProject?: () => void;
  onViewBrief?: (project: ClientProject) => void;
};

const TABS: {
  id: ClientDashboardTab;
  label: string;
  statKey: "active" | "pending" | "history";
  icon: typeof Wrench;
}[] = [
  { id: "active", label: "Active", statKey: "active", icon: Wrench },
  { id: "pending", label: "Needs Action", statKey: "pending", icon: WarningCircle },
  { id: "history", label: "History", statKey: "history", icon: ClockCounterClockwise },
];

export default function ClientProjectsPanel({
  projects,
  canFundJobs,
  briefTrailProjectIds,
  onPrimaryAction,
  onMessage,
  onRaiseConcern,
  onStartProject,
  onViewBrief,
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
    <section className="cp-subpage cp-proj-page" id="projects">
      <header
        className={`cp-proj-hero${projects.length === 0 ? " cp-proj-hero--empty" : ""}`}
      >
        <div className="cp-proj-hero-body">
          <div className="cp-proj-hero-copy">
            <p className="adash-eyebrow">My Projects</p>
            <h2>
              {projects.length === 0
                ? "Start your first build"
                : "Every build, from vision to keys"}
            </h2>
            <p>
              {projects.length === 0
                ? "Tell us about your land, budget, and timeline — we will guide you from brief to keys."
                : "Track your stage, your team, and what needs your attention — all in one place."}
            </p>
          </div>

          {projects.length > 0 && (
            <div className="cp-proj-hero-aside">
              <div className="cp-proj-stats" aria-label="Project counts">
                {TABS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`cp-proj-stat cp-proj-stat--${item.statKey}`}
                    >
                      <Icon size={20} weight="bold" />
                      <strong>{tabCounts[item.statKey]}</strong>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              {onStartProject && (
                <Button
                  type="button"
                  className="adash-btn adash-btn--primary cp-proj-hero-start"
                  onClick={onStartProject}
                >
                  <Plus size={18} weight="bold" />
                  Create New Build
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="cp-proj-tabs" role="tablist" aria-label="Project categories">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cp-proj-tab${tab === item.id ? " cp-proj-tab--active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {tabCounts[item.statKey] > 0 && (
              <span className="cp-proj-tab-count">{tabCounts[item.statKey]}</span>
            )}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <ClientEmptyState tab={tab} canFundJobs={canFundJobs} onStartProject={onStartProject} />
      ) : (
        <div className="cp-proj-card-grid">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              canFundJobs={canFundJobs}
              hasBriefTrail={briefTrailProjectIds?.has(project.id)}
              onPrimaryAction={onPrimaryAction}
              onMessage={onMessage}
              onRaiseConcern={onRaiseConcern}
              onViewBrief={onViewBrief}
            />
          ))}
        </div>
      )}
    </section>
  );
}
