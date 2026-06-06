"use client";

import {
  X,
  MapPin,
  ShieldCheck,
  Star,
  Sparkle,
  Briefcase,
  Clock,
  Calendar,
  LockSimple,
  User,
} from "phosphor-react";
import type { RecommendedArtisan } from "./types";

type ClientArtisanDetailModalProps = {
  artisan: RecommendedArtisan | null;
  onClose: () => void;
  onHire: (artisan: RecommendedArtisan) => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientArtisanDetailModal({
  artisan,
  onClose,
  onHire,
}: ClientArtisanDetailModalProps) {
  if (!artisan) return null;

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal adash-modal--agreement cdash-artisan-detail-modal"
        role="dialog"
        aria-labelledby="artisan-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <p className="adash-eyebrow">Artisan profile</p>
            <h3 id="artisan-detail-title">{artisan.fullName}</h3>
            <p className="adash-modal-subtext">
              Review this artisan&apos;s trade, ratings, and Amana track record before
              you send a job invite.
            </p>
          </div>
          <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="cdash-artisan-detail-hero">
          <div className="cdash-artisan-avatar cdash-artisan-avatar--large">
            {getInitials(artisan.fullName)}
          </div>
          <div className="cdash-artisan-detail-hero-body">
            <div className="cdash-artisan-name-row">
              <h4>
                {artisan.categoryEmoji} {artisan.categoryLabel}
              </h4>
              {artisan.isRecommended && (
                <span className="adash-profile-recommended">
                  <Sparkle size={12} weight="fill" />
                  Recommended
                </span>
              )}
              {artisan.verified && (
                <span className="cdash-artisan-detail-verified">
                  <ShieldCheck size={14} weight="fill" />
                  Amana Verified
                </span>
              )}
            </div>
            <p className="cdash-artisan-area">
              <MapPin size={14} weight="bold" />
              Based in {artisan.areaLabel}, Abuja · {artisan.travelRadiusLabel}
            </p>
            <p className="cdash-artisan-detail-bio">{artisan.bio}</p>
          </div>
        </div>

        <div className="cdash-artisan-detail-stats">
          <div>
            <span className="cdash-artisan-detail-stat-label">Rating</span>
            <strong>
              {artisan.rating !== null ? (
                <>
                  <Star size={16} weight="fill" />
                  {artisan.rating.toFixed(1)}
                </>
              ) : (
                "New"
              )}
            </strong>
          </div>
          <div>
            <span className="cdash-artisan-detail-stat-label">Jobs on Amana</span>
            <strong>{artisan.escrowJobsCompleted}</strong>
          </div>
          <div>
            <span className="cdash-artisan-detail-stat-label">Response time</span>
            <strong>
              <Clock size={16} weight="bold" />
              {artisan.responseTime.replace("Usually replies ", "")}
            </strong>
          </div>
          <div>
            <span className="cdash-artisan-detail-stat-label">Member since</span>
            <strong>
              <Calendar size={16} weight="bold" />
              {new Date(artisan.memberSince).toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        <div className="cdash-artisan-detail-section">
          <h4>Specialties</h4>
          <ul className="cdash-artisan-specialties">
            {artisan.specialties.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="cdash-artisan-detail-section">
          <h4>How hiring works</h4>
          <ul className="cdash-artisan-detail-steps">
            <li>
              <Briefcase size={18} weight="bold" />
              <span>Send your job specs and the artisan has 3 days to accept.</span>
            </li>
            <li>
              <LockSimple size={18} weight="bold" />
              <span>Once they send an agreement, you fund escrow — never pay outside Amana.</span>
            </li>
            <li>
              <ShieldCheck size={18} weight="bold" />
              <span>Approve proof before any release from your protected balance.</span>
            </li>
          </ul>
        </div>

        {artisan.recentReviews.length > 0 ? (
          <div className="cdash-artisan-detail-section">
            <h4>Recent client reviews</h4>
            <ul className="cdash-artisan-detail-reviews">
              {artisan.recentReviews.map((review) => (
                <li key={`${review.jobTitle}-${review.createdAt}`}>
                  <div className="cdash-artisan-detail-review-top">
                    <span>
                      <User size={14} weight="bold" />
                      {review.clientName}
                    </span>
                    <span className="cdash-artisan-detail-review-stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          weight={index < review.rating ? "fill" : "regular"}
                        />
                      ))}
                    </span>
                  </div>
                  <strong>{review.jobTitle}</strong>
                  <p>{review.comment}</p>
                  <time>
                    {new Date(review.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="cdash-artisan-detail-empty-reviews">
            No public reviews yet. This artisan is newer on Amana but identity checks may
            still apply.
          </p>
        )}

        {!artisan.verified && (
          <p className="adash-job-notice adash-job-notice--warning">
            This artisan is not yet Amana verified. You can still invite them, but verify
            their agreement carefully before funding escrow.
          </p>
        )}

        <div className="adash-modal-actions">
          <button type="button" className="adash-btn adash-btn--ghost" onClick={onClose}>
            Back to artisans
          </button>
          <button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => onHire(artisan)}
          >
            <Briefcase size={18} weight="bold" />
            Hire for a job
          </button>
        </div>
      </div>
    </div>
  );
}
