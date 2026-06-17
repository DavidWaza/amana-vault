"use client";

import { ShieldCheck, Star, Image, ArrowRight } from "phosphor-react";
import type { Architect } from "./types";

type ArchitectMarketplaceProps = {
  architects: Architect[];
  onRequestProposal?: (architect: Architect) => void;
  onViewProfile?: (architect: Architect) => void;
};

export default function ArchitectMarketplace({
  architects,
  onRequestProposal,
  onViewProfile,
}: ArchitectMarketplaceProps) {
  return (
    <section className="cdash-section" id="architects">
      <header className="cdash-section-header">
        <div>
          <p className="adash-eyebrow">Architect Marketplace</p>
          <h2>Verified architects for your vision</h2>
          <p>
            Turn your project vision into professional construction documents — floor
            plans, renderings, drawings, and bill of quantities.
          </p>
        </div>
      </header>

      <div className="cdash-architect-grid">
        {architects.map((architect) => (
          <article key={architect.id} className="cdash-architect-card">
            <div className="cdash-architect-card-top">
              <div className="cdash-architect-avatar" aria-hidden>
                {architect.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="cdash-architect-identity">
                <h3>{architect.name}</h3>
                <p className="cdash-architect-company">{architect.company}</p>
              </div>
              {architect.verified && (
                <span className="cdash-verified-badge">
                  <ShieldCheck size={14} weight="fill" />
                  Verified
                </span>
              )}
            </div>

            <p className="cdash-architect-bio">{architect.bio}</p>

            <div className="cdash-architect-meta">
              <span>
                <Star size={14} weight="fill" />
                {architect.rating} ({architect.reviewCount} reviews)
              </span>
              <span>
                <Image size={14} weight="bold" />
                {architect.portfolioCount} portfolio
              </span>
            </div>

            <p className="cdash-architect-specialty">
              <strong>Specialty:</strong> {architect.specialty}
            </p>

            <ul className="cdash-architect-services">
              {architect.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>

            <div className="cdash-architect-actions">
              <button
                type="button"
                className="adash-btn adash-btn--secondary"
                onClick={() => onViewProfile?.(architect)}
              >
                View Profile
              </button>
              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={() => onRequestProposal?.(architect)}
              >
                Request Proposal
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
