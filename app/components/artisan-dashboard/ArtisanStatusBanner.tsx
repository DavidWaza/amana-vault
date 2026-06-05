import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Warning,
  XCircle,
  Wallet,
  UserCircle,
} from "phosphor-react";
import type { ArtisanProfile } from "./types";

type ArtisanStatusBannerProps = {
  profile: ArtisanProfile;
};

export default function ArtisanStatusBanner({ profile }: ArtisanStatusBannerProps) {
  const banners = [];

  if (profile.verificationStatus === "unverified") {
    banners.push({
      tone: "warning" as const,
      icon: <UserCircle size={22} weight="bold" />,
      title: "Verify your identity to accept jobs",
      message:
        "Complete NIN, BVN, and document verification before you can receive secured payments.",
      action: { label: "Complete verification", href: "/join-amana" },
    });
  }

  if (profile.verificationStatus === "pending") {
    banners.push({
      tone: "info" as const,
      icon: <Clock size={22} weight="bold" />,
      title: "Identity verification in review",
      message:
        "We're reviewing your documents. You'll be notified within 48 hours. You cannot accept new jobs yet.",
      action: null,
    });
  }

  if (profile.verificationStatus === "rejected") {
    banners.push({
      tone: "danger" as const,
      icon: <XCircle size={22} weight="bold" />,
      title: "Verification needs attention",
      message:
        profile.verificationNote ??
        "Your identity check did not pass. Please resubmit your documents.",
      action: { label: "Resubmit documents", href: "/join-amana" },
    });
  }

  if (!profile.profileComplete) {
    banners.push({
      tone: "warning" as const,
      icon: <UserCircle size={22} weight="bold" />,
      title: "Complete your profile",
      message: "Add your bio and service details so clients can trust and hire you.",
      action: { label: "Finish profile", href: "#profile" },
    });
  }

  if (profile.payoutStatus === "not_set") {
    banners.push({
      tone: "warning" as const,
      icon: <Wallet size={22} weight="bold" />,
      title: "Add payout details",
      message:
        "Payments cannot be released to you until a verified bank account is linked.",
      action: { label: "Add bank account", href: "#wallet" },
    });
  }

  if (profile.payoutStatus === "pending") {
    banners.push({
      tone: "info" as const,
      icon: <Clock size={22} weight="bold" />,
      title: "Payout account under review",
      message: "Your bank details are being verified. Paid jobs will queue until approved.",
      action: null,
    });
  }

  if (profile.verificationStatus === "verified" && banners.length === 0) {
    banners.push({
      tone: "success" as const,
      icon: <CheckCircle size={22} weight="fill" />,
      title: "You're verified and ready for secured jobs",
      message:
        "Funds are held in escrow by our CBN-licensed partner until work is approved.",
      action: null,
    });
  }

  return (
    <div className="adash-banners">
      {banners.map((banner) => (
        <div key={banner.title} className={`adash-banner adash-banner--${banner.tone}`}>
          <span className="adash-banner-icon">{banner.icon}</span>
          <div className="adash-banner-body">
            <strong>{banner.title}</strong>
            <p>{banner.message}</p>
          </div>
          {banner.action && (
            <Link href={banner.action.href} className="adash-banner-action">
              {banner.action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
