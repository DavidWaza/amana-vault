import type { ClientDashboardTab } from "./types";
import ClientPanelEmptyState from "./ClientPanelEmptyState";
import type { ClientEmptyIllustrationVariant } from "./ClientPanelEmptyIllustration";

type ClientEmptyStateProps = {
  tab: ClientDashboardTab;
  canFundJobs: boolean;
  onStartProject?: () => void;
};

const TAB_VARIANT: Record<ClientDashboardTab, ClientEmptyIllustrationVariant> = {
  active: "projects-active",
  pending: "projects-pending",
  history: "projects-history",
};

const EMPTY_COPY: Record<
  ClientDashboardTab,
  { title: string; message: string }
> = {
  active: {
    title: "No active projects",
    message:
      "When your vault is funded and construction begins, active builds appear here.",
  },
  pending: {
    title: "Nothing pending your action",
    message:
      "Milestone approvals, contractor bids, and vault activations will show up here.",
  },
  history: {
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
    <ClientPanelEmptyState
      variant={TAB_VARIANT[tab]}
      title={copy.title}
      message={copy.message}
      note={
        !canFundJobs && tab === "pending"
          ? "Verify your identity and add a payment method to activate project vaults."
          : undefined
      }
      action={
        onStartProject && tab !== "history" ? (
          <button type="button" className="adash-btn adash-btn--primary" onClick={onStartProject}>
            Start a project
          </button>
        ) : undefined
      }
    />
  );
}
