"use client";

import Link from "next/link";
import { Star, MapPin, Wrench, ShieldCheck, Gear, Sparkle, SignOut } from "phosphor-react";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import { adashBtn, adashBtnBlock, adashBtnDanger, adashBtnPrimary } from "./ui";

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
    <aside
      className="sticky top-[5.5rem] max-[1100px]:static p-[1.35rem] rounded-[22px] bg-white border border-solid border-line shadow-brand-sm grid gap-[1.15rem]"
      id="profile"
    >
      <div className="flex gap-[0.85rem] items-center">
        <div
          className={`w-13 h-13 rounded-2xl grid place-items-center bg-[linear-gradient(135deg,var(--green),var(--green2))] text-white font-black text-base shrink-0${
            profile.avatarUrl ? " overflow-hidden p-0" : ""
          }`}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
          ) : (
            getInitials(profile.fullName)
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-[0.45rem]">
            <h2 className="mt-0 mb-1 text-[1.1rem] text-green">{profile.fullName}</h2>
            {profile.isRecommended && (
              <span className="inline-flex items-center gap-1 px-[0.55rem] py-[0.2rem] rounded-full bg-[linear-gradient(135deg,#fef3c7,#fde68a)] text-[#92400e] text-[0.68rem] font-extrabold tracking-[0.04em] uppercase">
                <Sparkle size={12} weight="fill" />
                Recommended
              </span>
            )}
          </div>
          <p className="flex items-center gap-[0.35rem] m-0 text-[0.82rem] text-muted">
            <Wrench size={14} weight="bold" />
            {profile.categoryLabel}
          </p>
          <p className="flex items-center gap-[0.35rem] m-0 text-[0.82rem] text-muted">
            <MapPin size={14} weight="bold" />
            {profile.areaLabel}, Abuja
          </p>
        </div>
      </div>

      {profile.bio && <p className="m-0 text-[0.88rem] leading-[1.6] text-muted">{profile.bio}</p>}

      <div className="grid grid-cols-3 gap-2 text-center py-[0.85rem] border-t border-b border-solid border-line">
        <div>
          <span className="inline-flex items-center justify-center gap-[0.2rem] text-base font-black text-green">
            {profile.rating !== null ? (
              <>
                <Star size={16} weight="fill" />
                {profile.rating.toFixed(1)}
              </>
            ) : (
              "New"
            )}
          </span>
          <span className="block mt-[0.15rem] text-[0.72rem] font-bold text-muted uppercase tracking-[0.06em]">Rating</span>
        </div>
        <div>
          <span className="inline-flex items-center justify-center gap-[0.2rem] text-base font-black text-green">{profile.completedJobs}</span>
          <span className="block mt-[0.15rem] text-[0.72rem] font-bold text-muted uppercase tracking-[0.06em]">Completed</span>
        </div>
        <div>
          <span className="inline-flex items-center justify-center gap-[0.2rem] text-base font-black text-green">
            <ShieldCheck size={16} weight="fill" />
          </span>
          <span className="block mt-[0.15rem] text-[0.72rem] font-bold text-muted uppercase tracking-[0.06em]">
            {profile.verificationStatus === "verified" ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      <div className="grid gap-[0.65rem]">
        <div className="flex justify-between gap-3 text-[0.85rem]">
          <span className="text-muted">Phone</span>
          <strong className="text-text text-right">{profile.phone}</strong>
        </div>
        <div className="flex justify-between gap-3 text-[0.85rem]">
          <span className="text-muted">Email</span>
          <strong className="text-text text-right">{profile.email || "Not added"}</strong>
        </div>
        <div className="flex justify-between gap-3 text-[0.85rem]">
          <span className="text-muted">Member since</span>
          <strong className="text-text text-right">
            {new Date(profile.memberSince).toLocaleDateString("en-NG", {
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      <div className="grid gap-[0.65rem]">
        <button
          type="button"
          className={`${adashBtn} ${adashBtnPrimary} ${adashBtnBlock}`}
          onClick={() => openProfileSettings("profile")}
        >
          <Gear size={16} weight="bold" />
          Profile Settings
        </button>
        <Link href="/" className={`${adashBtn} ${adashBtnDanger} ${adashBtnBlock}`}>
          <SignOut size={16} weight="bold" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
