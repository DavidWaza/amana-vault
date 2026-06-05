"use client";

import Link from "next/link";
import { Star, MapPin, Wrench, ShieldCheck, Gear, Sparkle, SignOut } from "phosphor-react";
import { useArtisanProfile } from "./ArtisanProfileProvider";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ArtisanProfileCard() {
  const { profile, openProfileSettings } = useArtisanProfile();

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
          <div className="adash-profile-name-row">
            <h2>{profile.fullName}</h2>
            {profile.isRecommended && (
              <span className="adash-profile-recommended">
                <Sparkle size={12} weight="fill" />
                Recommended
              </span>
            )}
          </div>
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
          onClick={() => openProfileSettings("profile")}
        >
          <Gear size={16} weight="bold" />
          Profile Settings
        </button>
        <Link href="/" className="adash-btn adash-btn--danger adash-btn--block">
          <SignOut size={16} weight="bold" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
