"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Warning,
  XCircle,
  Wallet,
  UserCircle,
  Sparkle,
} from "phosphor-react";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import type { ArtisanProfile } from "./types";

type BannerAction =
  | { type: "link"; label: string; href: string }
  | { type: "settings"; label: string; tab: "profile" | "payout" };

type ArtisanStatusBannerProps = {
  profile: ArtisanProfile;
};

export default function ArtisanStatusBanner({ profile }: ArtisanStatusBannerProps) {
  const { openProfileSettings } = useArtisanProfile();
  const banners: {
    tone: "warning" | "info" | "danger" | "success";
    icon: ReactNode;
    title: string;
    message: string;
    action: BannerAction | null;
  }[] = [];

  const needsChecks = !profile.growth.checksPaid;
  const needsVerificationPay =
    !profile.growth.verificationPaid && profile.verificationStatus !== "verified";

  if (profile.verificationStatus === "unverified") {
    banners.push({
      tone: "warning",
      icon: <UserCircle size={22} weight="bold" />,
      title: needsChecks
        ? "Pay for verification checks to get started"
        : "Pay for verified artisan badge",
      message: needsChecks
        ? "Cover NIN, selfie, and duplicate-account checks before we can verify you for secured jobs."
        : "Complete your paid verification to unlock job invites and escrow-protected work.",
      action: { type: "link", label: "View Amana Pro", href: "/artisan/pro" },
    });
  }

  if (profile.verificationStatus === "pending") {
    banners.push({
      tone: "info",
      icon: <Clock size={22} weight="bold" />,
      title: "Verification in review",
      message:
        "Your paid verification is being processed. You'll be notified within 48 hours.",
      action: null,
    });
  }

  if (profile.verificationStatus === "rejected") {
    banners.push({
      tone: "danger",
      icon: <XCircle size={22} weight="bold" />,
      title: "Verification needs attention",
      message:
        profile.verificationNote ??
        "Your identity check did not pass. Repay for checks or resubmit documents.",
      action: { type: "link", label: "Retry verification", href: "/artisan/pro" },
    });
  }

  if (!profile.profileComplete) {
    banners.push({
      tone: "warning",
      icon: <UserCircle size={22} weight="bold" />,
      title: "Complete your profile",
      message: "Add your bio and service details so clients can trust and hire you.",
      action: { type: "settings", label: "Finish profile", tab: "profile" },
    });
  }

  if (profile.payoutStatus === "not_set") {
    banners.push({
      tone: "warning",
      icon: <Wallet size={22} weight="bold" />,
      title: "Add payout details",
      message:
        "Payments cannot be released to you until a verified bank account is linked.",
      action: { type: "settings", label: "Add bank account", tab: "payout" },
    });
  }

  if (profile.payoutStatus === "pending") {
    banners.push({
      tone: "info",
      icon: <Clock size={22} weight="bold" />,
      title: "Payout account under review",
      message: "Your bank details are being verified. Paid jobs will queue until approved.",
      action: null,
    });
  }

  if (
    profile.verificationStatus === "verified" &&
    !profile.growth.boostActive &&
    banners.length === 0
  ) {
    banners.push({
      tone: "success",
      icon: <CheckCircle size={22} weight="fill" />,
      title: "You're verified and ready for secured jobs",
      message:
        "Boost your profile to get recommended to clients searching in your area.",
      action: { type: "link", label: "Get recommended", href: "/artisan/pro" },
    });
  }

  if (profile.verificationStatus === "verified" && profile.growth.boostActive) {
    banners.push({
      tone: "success",
      icon: <Sparkle size={22} weight="fill" />,
      title: "Recommendation boost is active",
      message: profile.growth.boostExpiresAt
        ? `Clients in ${profile.areaLabel} can see you as a recommended artisan until ${new Date(profile.growth.boostExpiresAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}.`
        : "Your profile is being pushed to clients in your service area.",
      action: needsVerificationPay
        ? null
        : { type: "link", label: "Extend boost", href: "/artisan/pro" },
    });
  }

  const card =
    "flex items-start gap-[0.85rem] px-[1.15rem] py-4 rounded-[18px] border border-solid";
  const toneCard: Record<string, string> = {
    success: "bg-soft border-[rgba(0,107,50,0.25)]",
    warning: "bg-gold-soft border-[rgba(244,163,0,0.25)]",
    danger: "bg-[#fff5f5] border-[rgba(214,69,69,0.25)]",
    info: "bg-[#f0f9ff] border-[rgba(14,116,144,0.2)]",
  };
  const toneIcon: Record<string, string> = {
    success: "text-green2",
    info: "text-green2",
    warning: "text-gold",
    danger: "text-[#c53030]",
  };
  const actionClass =
    "shrink-0 px-[0.9rem] py-[0.55rem] rounded-full bg-green text-white text-[0.82rem] font-extrabold whitespace-nowrap inline-block border-0";

  return (
    <div className="grid gap-3">
      {banners.map((banner) => {
        const action = banner.action;

        return (
          <div key={banner.title} className={`${card} ${toneCard[banner.tone]}`}>
            <span className={`shrink-0 ${toneIcon[banner.tone]}`}>
              {banner.icon}
            </span>
            <div className="flex-1 min-w-0">
              <strong className="block mb-1 text-green text-[0.95rem]">
                {banner.title}
              </strong>
              <p className="m-0 text-[0.88rem] leading-[1.55] text-muted">
                {banner.message}
              </p>
            </div>
            {action?.type === "link" && (
              <Link href={action.href} className={actionClass}>
                {action.label}
              </Link>
            )}
            {action?.type === "settings" && (
              <button
                type="button"
                className={actionClass}
                onClick={() => openProfileSettings(action.tab)}
              >
                {action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
