"use client";

import { useMemo, useState } from "react";
import type { ArtisanJob, DashboardTab, JobPrimaryAction } from "./types";
import { isActiveJob, isHistoryJob, isInvitation } from "./utils";
import ArtisanJobCard from "./ArtisanJobCard";
import ArtisanEmptyState from "./ArtisanEmptyState";

type ArtisanJobsPanelProps = {
  jobs: ArtisanJob[];
  canAcceptJobs: boolean;
  onPrimaryAction?: (job: ArtisanJob, action: JobPrimaryAction) => void;
  onDeclineInvite?: (jobId: string) => void;
  onMessageClient?: (job: ArtisanJob) => void;
  onCreateInvoice?: (job: ArtisanJob) => void;
  onRaiseDispute?: (job: ArtisanJob) => void;
};

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "invitations", label: "Invitations" },
  { id: "history", label: "History" },
];

export default function ArtisanJobsPanel({
  jobs,
  canAcceptJobs,
  onPrimaryAction,
  onDeclineInvite,
  onMessageClient,
  onCreateInvoice,
  onRaiseDispute,
}: ArtisanJobsPanelProps) {
  const [tab, setTab] = useState<DashboardTab>("active");

  const filteredJobs = useMemo(() => {
    switch (tab) {
      case "active":
        return jobs.filter(isActiveJob);
      case "invitations":
        return jobs.filter(isInvitation);
      case "history":
        return jobs.filter(isHistoryJob);
      default:
        return [];
    }
  }, [jobs, tab]);

  const tabCounts = useMemo(
    () => ({
      active: jobs.filter(isActiveJob).length,
      invitations: jobs.filter((j) => j.status === "invitation_pending").length,
      history: jobs.filter(isHistoryJob).length,
    }),
    [jobs],
  );

  return (
    <section className="grid gap-4" id="jobs">
      <div className="adash-jobs-header">
        <div>
          <h2>Your jobs</h2>
          <p>Track secured work, invites, and payment status in one place.</p>
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
        <ArtisanEmptyState tab={tab} canAcceptJobs={canAcceptJobs} />
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <ArtisanJobCard
              key={job.id}
              job={job}
              canAcceptJobs={canAcceptJobs}
              onPrimaryAction={onPrimaryAction}
              onDeclineInvite={onDeclineInvite}
              onMessageClient={onMessageClient}
              onCreateInvoice={onCreateInvoice}
              onRaiseDispute={onRaiseDispute}
            />
          ))}
        </div>
      )}
    </section>
  );
}
