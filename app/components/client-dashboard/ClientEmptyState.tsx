import type { ReactNode } from "react";
import { Buildings, ClockCounterClockwise, Bell } from "phosphor-react";
import type { ClientDashboardTab } from "./types";

type ClientEmptyStateProps = {
  tab: ClientDashboardTab;
  canFundJobs: boolean;
  onStartProject?: () => void;
};

const EMPTY_COPY: Record<
  ClientDashboardTab,
  { icon: ReactNode; title: string; message: string }
> = {
  active: {
    icon: <Buildings size={40} weight="bold" />,
    title: "No active projects",
    message:
      "When your vault is funded and construction begins, active builds appear here.",
  },
  pending: {
    icon: <Bell size={40} weight="bold" />,
    title: "Nothing pending your action",
    message:
      "Milestone approvals, contractor bids, and vault activations will show up here.",
  },
  history: {
    icon: <ClockCounterClockwise size={40} weight="bold" />,
    title: "No project history yet",
    message: "Completed and archived projects will appear here for your records.",
  },
};

export default function ClientEmptyState({
  tab,
  canFundJobs,
  onStartProject,
}: ClientEmptyStateProps) {
  const copy = EMPTY_COPY[tab];

  return (
    <div className="adash-empty">
      <span className="adash-empty-icon">{copy.icon}</span>
      <h3>{copy.title}</h3>
      <p>{copy.message}</p>
      {!canFundJobs && tab === "pending" && (
        <p className="adash-empty-note">
          Verify your identity and add a payment method to activate project vaults.
        </p>
      )}
      {onStartProject && tab !== "history" && (
        <button type="button" className="adash-btn adash-btn--primary" onClick={onStartProject}>
          Start a project
        </button>
      )}
    </div>
  );
}
