import type { ReactNode } from "react";
import { Briefcase, ClockCounterClockwise, Wallet } from "phosphor-react";
import Link from "next/link";
import type { ClientDashboardTab } from "./types";

type ClientEmptyStateProps = {
  tab: ClientDashboardTab;
  canFundJobs: boolean;
};

const EMPTY_COPY: Record<
  ClientDashboardTab,
  { icon: ReactNode; title: string; message: string; cta?: { label: string; href: string } }
> = {
  active: {
    icon: <Briefcase size={40} weight="bold" />,
    title: "No active protected jobs",
    message:
      "When you fund escrow for an artisan, the job appears here until work is completed.",
    cta: { label: "Find an artisan", href: "/join-amana" },
  },
  pending: {
    icon: <Wallet size={40} weight="bold" />,
    title: "Nothing pending your action",
    message:
      "Agreements awaiting payment, invites, and release requests will show up here.",
  },
  history: {
    icon: <ClockCounterClockwise size={40} weight="bold" />,
    title: "No job history yet",
    message: "Completed, cancelled, and expired jobs will appear here for your records.",
  },
};

export default function ClientEmptyState({ tab, canFundJobs }: ClientEmptyStateProps) {
  const copy = EMPTY_COPY[tab];

  return (
    <div className="adash-empty">
      <span className="adash-empty-icon">{copy.icon}</span>
      <h3>{copy.title}</h3>
      <p>{copy.message}</p>
      {!canFundJobs && tab === "pending" && (
        <p className="adash-empty-note">
          Verify your identity and add a payment method to fund escrow.
        </p>
      )}
      {copy.cta && (
        <Link href={copy.cta.href} className="adash-btn adash-btn--primary">
          {copy.cta.label}
        </Link>
      )}
    </div>
  );
}
