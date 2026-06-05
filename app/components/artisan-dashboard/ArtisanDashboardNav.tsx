"use client";

import Link from "next/link";
import { Bell, SignOut, UserCircle } from "phosphor-react";

type ArtisanDashboardNavProps = {
  artisanName: string;
  unreadNotifications?: number;
};

export default function ArtisanDashboardNav({
  artisanName,
  unreadNotifications = 0,
}: ArtisanDashboardNavProps) {
  return (
    <header className="adash-nav">
      <div className="adash-nav-inner">
        <Link href="/artisan/dashboard" className="adash-nav-brand">
          <span className="adash-nav-logo">Amana</span>
          <span className="adash-nav-portal">Artisan Portal</span>
        </Link>

        <nav className="adash-nav-links" aria-label="Dashboard navigation">
          <a href="#jobs" className="adash-nav-link adash-nav-link--active">
            Jobs
          </a>
          <a href="#wallet" className="adash-nav-link">
            Wallet
          </a>
          <a href="#reviews" className="adash-nav-link">
            Reviews
          </a>
          <a href="#profile" className="adash-nav-link">
            Profile
          </a>
        </nav>

        <div className="adash-nav-actions">
          <button
            type="button"
            className="adash-icon-btn"
            aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
          >
            <Bell size={20} weight="bold" />
            {unreadNotifications > 0 && (
              <span className="adash-icon-badge">{unreadNotifications}</span>
            )}
          </button>

          <a href="#profile" className="adash-profile-chip">
            <UserCircle size={22} weight="bold" />
            <span>{artisanName.split(" ")[0]}</span>
          </a>

          <Link href="/" className="adash-icon-btn" aria-label="Sign out">
            <SignOut size={20} weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
