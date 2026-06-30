"use client";

import { MapPin, ShieldCheck, Gear, SignOut } from "phosphor-react";
import { useClientProfile } from "./ClientProfileProvider";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientProfileCard() {
  const { profile, openProfileSettings, logout } = useClientProfile();

  return (
    <aside className="adash-profile-card" id="profile">
      <div className="adash-profile-header">
        <div
          className={`adash-profile-avatar${profile.avatarUrl ? " adash-profile-avatar--image" : ""}`}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} />
          ) : (
            getInitials(profile.fullName)
          )}
        </div>
        <div>
          <h2>{profile.fullName}</h2>
          <p className="adash-profile-meta">
            <MapPin size={14} weight="bold" />
            {profile.areaLabel}, Abuja
          </p>
        </div>
      </div>

      <div className="adash-profile-stats">
        <div>
          <span className="adash-profile-stat-value">{profile.jobsProtected}</span>
          <span className="adash-profile-stat-label">Jobs protected</span>
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
          onClick={() => openProfileSettings("profile")}
        >
          <Gear size={16} weight="bold" />
          Profile Settings
        </button>
        <button
          type="button"
          className="adash-btn adash-btn--danger adash-btn--block"
          onClick={logout}
        >
          <SignOut size={16} weight="bold" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
