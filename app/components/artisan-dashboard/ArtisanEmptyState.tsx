import type { ReactNode } from "react";
import { Briefcase, Envelope, ClockCounterClockwise } from "phosphor-react";
import Link from "next/link";
import type { DashboardTab } from "./types";

type ArtisanEmptyStateProps = {
  tab: DashboardTab;
  canAcceptJobs: boolean;
};

const EMPTY_COPY: Record<
  DashboardTab,
  { icon: ReactNode; title: string; message: string; cta?: { label: string; href: string } }
> = {
  active: {
    icon: <Briefcase size={40} weight="bold" />,
    title: "No active jobs yet",
    message:
      "When a client secures payment for your work, it will appear here. Share your profile to get hired faster.",
    cta: { label: "Complete your profile", href: "#profile" },
  },
  invitations: {
    icon: <Envelope size={40} weight="bold" />,
    title: "No pending invitations",
    message:
      "Clients can invite you via WhatsApp or phone. Make sure your profile is complete and verified.",
  },
  history: {
    icon: <ClockCounterClockwise size={40} weight="bold" />,
    title: "No completed jobs yet",
    message:
      "Released, cancelled, and expired jobs will show up here for your records.",
  },
};

export default function ArtisanEmptyState({ tab, canAcceptJobs }: ArtisanEmptyStateProps) {
  const copy = EMPTY_COPY[tab];

  return (
    <div className="adash-empty">
      <span className="adash-empty-icon">{copy.icon}</span>
      <h3>{copy.title}</h3>
      <p>{copy.message}</p>
      {!canAcceptJobs && tab === "invitations" && (
        <p className="adash-empty-note">
          Verify your identity to accept client invitations.
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
