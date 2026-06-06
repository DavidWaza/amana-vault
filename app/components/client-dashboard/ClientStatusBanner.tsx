"use client";

import type { ReactNode } from "react";
import { CheckCircle, Clock, Warning, XCircle, CreditCard, UserCircle } from "phosphor-react";
import { useClientProfile } from "./ClientProfileProvider";
import type { ClientProfile } from "./types";

type ClientStatusBannerProps = {
  profile: ClientProfile;
};

export default function ClientStatusBanner({ profile }: ClientStatusBannerProps) {
  const { openProfileSettings } = useClientProfile();
  const banners: {
    tone: "warning" | "info" | "danger" | "success";
    icon: ReactNode;
    title: string;
    message: string;
    action?: { label: string; tab: "profile" | "payment" };
  }[] = [];

  if (profile.verificationStatus === "unverified") {
    banners.push({
      tone: "warning",
      icon: <UserCircle size={22} weight="bold" />,
      title: "Verify your identity",
      message:
        "Complete a quick ID check so artisans know they are working with a trusted client.",
      action: { label: "Complete verification", tab: "profile" },
    });
  }

  if (profile.verificationStatus === "pending") {
    banners.push({
      tone: "info",
      icon: <Clock size={22} weight="bold" />,
      title: "Verification in review",
      message: "Your identity check is being processed. This usually takes up to 48 hours.",
    });
  }

  if (profile.verificationStatus === "rejected") {
    banners.push({
      tone: "danger",
      icon: <XCircle size={22} weight="bold" />,
      title: "Verification needs attention",
      message:
        profile.verificationNote ??
        "Your identity check did not pass. Resubmit your documents to fund escrow.",
      action: { label: "Resubmit documents", tab: "profile" },
    });
  }

  if (!profile.profileComplete) {
    banners.push({
      tone: "warning",
      icon: <UserCircle size={22} weight="bold" />,
      title: "Complete your profile",
      message: "Add your details so artisans can confirm who they are working with.",
      action: { label: "Finish profile", tab: "profile" },
    });
  }

  if (profile.paymentMethodStatus === "not_set") {
    banners.push({
      tone: "warning",
      icon: <CreditCard size={22} weight="bold" />,
      title: "Add a payment method",
      message: "Link a card or bank transfer method before you can fund escrow.",
      action: { label: "Add payment method", tab: "payment" },
    });
  }

  if (profile.paymentMethodStatus === "pending") {
    banners.push({
      tone: "info",
      icon: <Clock size={22} weight="bold" />,
      title: "Payment method verifying",
      message: "Your payment method is being verified. Funding will unlock once approved.",
    });
  }

  if (profile.verificationStatus === "verified" && profile.paymentMethodStatus === "verified") {
    banners.push({
      tone: "success",
      icon: <CheckCircle size={22} weight="bold" />,
      title: "You're ready to protect payments",
      message: "Fund escrow on any agreement to keep your money safe until work is approved.",
    });
  }

  if (banners.length === 0) return null;

  return (
    <div className="adash-banners">
      {banners.map((banner) => (
        <div key={banner.title} className={`adash-banner adash-banner--${banner.tone}`}>
          {banner.icon}
          <div>
            <strong>{banner.title}</strong>
            <p>{banner.message}</p>
            {banner.action && (
              <button
                type="button"
                className="adash-link-btn"
                onClick={() => openProfileSettings(banner.action!.tab)}
              >
                {banner.action.label}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
