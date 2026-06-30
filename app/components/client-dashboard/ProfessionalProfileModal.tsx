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
  Image,
  Phone,
  EnvelopeSimple,
  Wrench,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { ProfessionalProfileTarget } from "./types";
import { getInitials } from "./portal-utils";
import "./professional-profile.css";

type ProfessionalProfileModalProps = {
  target: ProfessionalProfileTarget | null;
  isOnTeam?: boolean;
  onClose: () => void;
  onAddToTeam?: () => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
};

const ROLE_COPY: Record<
  ProfessionalProfileTarget["role"],
  { eyebrow: string; subtitle: string }
> = {
  architect: {
    eyebrow: "Architect profile",
    subtitle:
      "Review their portfolio, specialty, and services before requesting a proposal.",
  },
  contractor: {
    eyebrow: "Contractor profile",
    subtitle:
      "Review their experience, specialty, and track record before requesting a quote.",
  },
  artisan: {
    eyebrow: "Artisan profile",
    subtitle:
      "Review this artisan's trade, ratings, and Amana track record before you send a job invite.",
  },
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

function displayName(target: ProfessionalProfileTarget) {
  return target.role === "artisan"
    ? target.professional.fullName
    : target.professional.name;
}

export default function ProfessionalProfileModal({
  target,
  isOnTeam,
  onClose,
  onAddToTeam,
  onPrimaryAction,
  primaryLabel,
}: ProfessionalProfileModalProps) {
  if (!target) return null;

  const copy = ROLE_COPY[target.role];
  const name = displayName(target);

  return (
    <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-modal adash-modal--agreement cdash-artisan-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="professional-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <p className="adash-eyebrow">{copy.eyebrow}</p>
            <h3 id="professional-profile-title">{name}</h3>
            <p className="adash-modal-subtext">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="cdash-artisan-detail-hero">
          <div className="cdash-artisan-avatar cdash-artisan-avatar--large">
            {getInitials(name)}
          </div>
          <div className="cdash-artisan-detail-hero-body">
            <div className="cdash-artisan-name-row">
              <span
                className={`pro-profile-role-tag pro-profile-role-tag--${target.role}`}
              >
                {target.role}
              </span>
              {target.role === "artisan" && target.professional.isRecommended && (
                <span className="adash-profile-recommended">
                  <Sparkle size={12} weight="fill" />
                  Recommended
                </span>
              )}
              {((target.role === "artisan" && target.professional.verified) ||
                (target.role !== "artisan" && target.professional.verified)) && (
                <span className="cdash-artisan-detail-verified">
                  <ShieldCheck size={14} weight="fill" />
                  Amana Verified
                </span>
              )}
            </div>

            {target.role === "architect" && (
              <>
                <h4>{target.professional.company}</h4>
                <p className="cdash-artisan-area">
                  <Briefcase size={14} weight="bold" />
                  {target.professional.specialty}
                </p>
              </>
            )}

            {target.role === "contractor" && (
              <>
                <h4>{target.professional.company}</h4>
                <p className="cdash-artisan-area">
                  <Wrench size={14} weight="bold" />
                  {target.professional.specialty}
                </p>
              </>
            )}

            {target.role === "artisan" && (
              <>
                <h4>
                  {target.professional.categoryEmoji} {target.professional.categoryLabel}
                </h4>
                <p className="cdash-artisan-area">
                  <MapPin size={14} weight="bold" />
                  Based in {target.professional.areaLabel}, Abuja ·{" "}
                  {target.professional.travelRadiusLabel}
                </p>
              </>
            )}

            <p className="cdash-artisan-detail-bio">
              {target.role === "artisan"
                ? target.professional.bio
                : target.professional.bio}
            </p>
          </div>
        </div>

        <div className="cdash-artisan-detail-stats">
          {target.role === "architect" && (
            <>
              <div>
                <span className="cdash-artisan-detail-stat-label">Rating</span>
                <strong>
                  <Star size={16} weight="fill" />
                  {target.professional.rating}
                </strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Reviews</span>
                <strong>{target.professional.reviewCount}</strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Portfolio</span>
                <strong>
                  <Image size={16} weight="bold" />
                  {target.professional.portfolioCount} projects
                </strong>
              </div>
            </>
          )}

          {target.role === "contractor" && (
            <>
              <div>
                <span className="cdash-artisan-detail-stat-label">Rating</span>
                <strong>
                  <Star size={16} weight="fill" />
                  {target.professional.rating}
                </strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Reviews</span>
                <strong>{target.professional.reviewCount}</strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Experience</span>
                <strong>{target.professional.experienceYears} years</strong>
              </div>
            </>
          )}

          {target.role === "artisan" && (
            <>
              <div>
                <span className="cdash-artisan-detail-stat-label">Rating</span>
                <strong>
                  {target.professional.rating !== null ? (
                    <>
                      <Star size={16} weight="fill" />
                      {target.professional.rating.toFixed(1)}
                    </>
                  ) : (
                    "New"
                  )}
                </strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Jobs on Amana</span>
                <strong>{target.professional.escrowJobsCompleted}</strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Response time</span>
                <strong>
                  <Clock size={16} weight="bold" />
                  {target.professional.responseTime.replace("Usually replies ", "")}
                </strong>
              </div>
              <div>
                <span className="cdash-artisan-detail-stat-label">Member since</span>
                <strong>
                  <Calendar size={16} weight="bold" />
                  {new Date(target.professional.memberSince).toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </>
          )}
        </div>

        <div className="cdash-artisan-detail-section">
          <h4>Contact</h4>
          <ul className="pro-profile-contacts">
            <li>
              <a
                href={`tel:${
                  target.role === "artisan"
                    ? target.professional.phone
                    : target.professional.phone
                }`}
                className="pro-profile-contact"
              >
                <span className="pro-profile-contact-icon">
                  <Phone size={15} weight="bold" />
                </span>
                <span>
                  <small>Phone</small>
                  <strong>
                    {formatPhone(
                      target.role === "artisan"
                        ? target.professional.phone
                        : target.professional.phone,
                    )}
                  </strong>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${
                  target.role === "artisan"
                    ? target.professional.email
                    : target.professional.email
                }`}
                className="pro-profile-contact"
              >
                <span className="pro-profile-contact-icon">
                  <EnvelopeSimple size={15} weight="bold" />
                </span>
                <span>
                  <small>Email</small>
                  <strong>
                    {target.role === "artisan"
                      ? target.professional.email
                      : target.professional.email}
                  </strong>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="cdash-artisan-detail-section">
          <h4>{target.role === "artisan" ? "Specialties" : "Services"}</h4>
          <ul className="cdash-artisan-specialties">
            {(target.role === "artisan"
              ? target.professional.specialties
              : target.professional.services
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {target.role === "artisan" && (
          <div className="cdash-artisan-detail-section">
            <h4>How hiring works</h4>
            <ul className="cdash-artisan-detail-steps">
              <li>
                <Briefcase size={18} weight="bold" />
                <span>Send your job specs and the artisan has 3 days to accept.</span>
              </li>
              <li>
                <LockSimple size={18} weight="bold" />
                <span>
                  Once they send an agreement, you fund escrow — never pay outside Amana.
                </span>
              </li>
              <li>
                <ShieldCheck size={18} weight="bold" />
                <span>Approve proof before any release from your protected balance.</span>
              </li>
            </ul>
          </div>
        )}

        {target.role === "artisan" &&
          (target.professional.recentReviews.length > 0 ? (
            <div className="cdash-artisan-detail-section">
              <h4>Recent client reviews</h4>
              <ul className="cdash-artisan-detail-reviews">
                {target.professional.recentReviews.map((review) => (
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
              No public reviews yet. This artisan is newer on Amana but identity checks
              may still apply.
            </p>
          ))}

        {target.role === "artisan" && !target.professional.verified && (
          <p className="adash-job-notice adash-job-notice--warning">
            This artisan is not yet Amana verified. You can still invite them, but verify
            their agreement carefully before funding escrow.
          </p>
        )}

        <div className="adash-modal-actions adash-modal-actions--stack">
          <button type="button" className="adash-btn adash-btn--ghost" onClick={onClose}>
            Back to marketplace
          </button>
          {isOnTeam ? (
            <button type="button" className="adash-btn adash-btn--secondary" disabled>
              On your build team
            </button>
          ) : (
            onAddToTeam && (
              <Button
                type="button"
                className="adash-btn adash-btn--secondary"
                onClick={onAddToTeam}
                loadingLabel="Adding…"
              >
                Add to Team
              </Button>
            )
          )}
          {onPrimaryAction && primaryLabel && (
            <Button
              type="button"
              className="adash-btn adash-btn--primary"
              onClick={onPrimaryAction}
            >
              {primaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
