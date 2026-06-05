"use client";

import { useState } from "react";
import { Star, MapPin, Wrench, ShieldCheck, Gear } from "phosphor-react";
import type { ArtisanProfile } from "./types";
import type { ArtisanBankAccount } from "./types";
import ArtisanProfileSettings from "./ArtisanProfileSettings";

type ArtisanProfileCardProps = {
  profile: ArtisanProfile;
  bankAccount: ArtisanBankAccount | null;
  onProfileChange: (profile: ArtisanProfile) => void;
  onAccountChange: (data: { phone: string; email: string }) => void;
  onPayoutChange: (payout: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ArtisanProfileCard({
  profile,
  bankAccount,
  onProfileChange,
  onAccountChange,
  onPayoutChange,
}: ArtisanProfileCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside className="adash-profile-card" id="profile">
        <div className="adash-profile-header">
          <div className={`adash-profile-avatar${profile.avatarUrl ? " adash-profile-avatar--image" : ""}`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} />
            ) : (
              getInitials(profile.fullName)
            )}
          </div>
          <div>
            <h2>{profile.fullName}</h2>
            <p className="adash-profile-meta">
              <Wrench size={14} weight="bold" />
              {profile.categoryLabel}
            </p>
            <p className="adash-profile-meta">
              <MapPin size={14} weight="bold" />
              {profile.areaLabel}, Abuja
            </p>
          </div>
        </div>

        {profile.bio && <p className="adash-profile-bio">{profile.bio}</p>}

        <div className="adash-profile-stats">
          <div>
            <span className="adash-profile-stat-value">
              {profile.rating !== null ? (
                <>
                  <Star size={16} weight="fill" />
                  {profile.rating.toFixed(1)}
                </>
              ) : (
                "New"
              )}
            </span>
            <span className="adash-profile-stat-label">Rating</span>
          </div>
          <div>
            <span className="adash-profile-stat-value">{profile.completedJobs}</span>
            <span className="adash-profile-stat-label">Completed</span>
          </div>
          <div>
            <span className="adash-profile-stat-value">
              <ShieldCheck size={16} weight="fill" />
            </span>
            <span className="adash-profile-stat-label">
              {profile.verificationStatus === "verified" ? "Verified" : "Pending"}
            </span>
          </div>
        </div>

        <div className="adash-profile-details">
          <div>
            <span>Phone</span>
            <strong>{profile.phone}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{profile.email || "Not added"}</strong>
          </div>
          <div>
            <span>Member since</span>
            <strong>
              {new Date(profile.memberSince).toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        <div className="adash-profile-actions">
          <button
            type="button"
            className="adash-btn adash-btn--primary adash-btn--block"
            onClick={() => setSettingsOpen(true)}
          >
            <Gear size={16} weight="bold" />
            Profile Settings
          </button>
        </div>
      </aside>

      <ArtisanProfileSettings
        profile={profile}
        bankAccount={bankAccount}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveProfile={(updated) => {
          onProfileChange(updated);
          setSettingsOpen(false);
        }}
        onSaveAccount={onAccountChange}
        onSavePassword={async () => {
          /* API hook — mock accepts any password for now */
        }}
        onSavePayout={(payout) => {
          onPayoutChange(payout);
          setSettingsOpen(false);
        }}
      />
    </>
  );
}
