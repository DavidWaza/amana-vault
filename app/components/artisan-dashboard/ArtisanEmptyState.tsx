import type { ReactNode } from "react";
import { Briefcase, Envelope, ClockCounterClockwise } from "phosphor-react";
import Link from "next/link";
import type { DashboardTab } from "./types";
import { adashBtn, adashBtnPrimary } from "./ui";

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
    <div className="text-center px-6 py-12 rounded-[22px] border border-dashed border-line bg-white/70">
      <span className="inline-grid place-items-center w-18 h-18 mb-4 rounded-full bg-soft text-green2">
        {copy.icon}
      </span>
      <h3 className="mt-0 mb-2 text-green">{copy.title}</h3>
      <p className="mx-auto mb-4 max-w-[24rem] text-muted leading-[1.6] text-[0.92rem]">
        {copy.message}
      </p>
      {!canAcceptJobs && tab === "invitations" && (
        <p className="mt-0 mb-4 text-[0.85rem] font-bold text-[#b45309]">
          Verify your identity to accept client invitations.
        </p>
      )}
      {copy.cta && (
        <Link href={copy.cta.href} className={`${adashBtn} ${adashBtnPrimary}`}>
          {copy.cta.label}
        </Link>
      )}
    </div>
  );
}
