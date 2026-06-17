"use client";

import { useMemo, useState } from "react";
import type { ClientJob, ClientDashboardTab, ClientJobPrimaryAction } from "./types";
import { isClientActiveJob, isClientHistoryJob, isClientPendingTab } from "./utils";
import ClientJobCard from "./ClientJobCard";
import ClientEmptyState from "./ClientEmptyState";

type ClientJobsPanelProps = {
  jobs: ClientJob[];
  canFundJobs: boolean;
  onPrimaryAction?: (job: ClientJob, action: ClientJobPrimaryAction) => void;
  onMessageArtisan?: (job: ClientJob) => void;
  onCancelInvite?: (jobId: string) => void;
  onRaiseDispute?: (job: ClientJob) => void;
};

const TABS: { id: ClientDashboardTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "pending", label: "Needs Action" },
  { id: "history", label: "History" },
];

export default function ClientJobsPanel({
  jobs,
  canFundJobs,
  onPrimaryAction,
  onMessageArtisan,
  onCancelInvite,
  onRaiseDispute,
}: ClientJobsPanelProps) {
  const [tab, setTab] = useState<ClientDashboardTab>("pending");

  const filteredJobs = useMemo(() => {
    switch (tab) {
      case "active":
        return jobs.filter(isClientActiveJob);
      case "pending":
        return jobs.filter(isClientPendingTab);
      case "history":
        return jobs.filter(isClientHistoryJob);
      default:
        return [];
    }
  }, [jobs, tab]);

  const tabCounts = useMemo(
    () => ({
      active: jobs.filter(isClientActiveJob).length,
      pending: jobs.filter(isClientPendingTab).length,
      history: jobs.filter(isClientHistoryJob).length,
    }),
    [jobs],
  );

  return (
    <section className="adash-jobs" id="jobs">
      <div className="adash-jobs-header">
        <div>
          <h2>Your protected jobs</h2>
          <p>Track agreements, fund escrow, and approve releases in one place.</p>
        </div>
      </div>

      <div className="adash-tabs" role="tablist" aria-label="Job categories">
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

      {filteredJobs.length === 0 ? (
        <ClientEmptyState tab={tab} canFundJobs={canFundJobs} />
      ) : (
        <div className="adash-job-list">
          {filteredJobs.map((job) => (
            <ClientJobCard
              key={job.id}
              job={job}
              canFundJobs={canFundJobs}
              onPrimaryAction={onPrimaryAction}
              onMessageArtisan={onMessageArtisan}
              onCancelInvite={onCancelInvite}
              onRaiseDispute={onRaiseDispute}
            />
          ))}
        </div>
      )}
    </section>
  );
}
