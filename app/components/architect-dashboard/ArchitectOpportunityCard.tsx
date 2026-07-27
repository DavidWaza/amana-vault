"use client";

import {
  BookmarkSimple,
  Buildings,
  CalendarX,
  ChatCircleDots,
  Clock,
  MapPin,
  PaintBrush,
  Prohibit,
  ShieldCheck,
  ShieldWarning,
  Users,
  Wallet,
} from "phosphor-react";
import { StatusPill } from "./ArchitectPrimitives";
import { canBidOnOpportunity, isOpportunityClosed } from "./portal-utils";
import { daysUntil, formatDueLabel, plural } from "./utils";
import type { DesignOpportunity } from "./types";

type ArchitectOpportunityCardProps = {
  opportunity: DesignOpportunity;
  onViewBrief: (opportunity: DesignOpportunity) => void;
  onSubmitBid: (opportunity: DesignOpportunity) => void;
  onAskQuestion: (opportunity: DesignOpportunity) => void;
  onSave: (opportunity: DesignOpportunity) => void;
  onDecline: (opportunity: DesignOpportunity) => void;
};

export default function ArchitectOpportunityCard({
  opportunity,
  onViewBrief,
  onSubmitBid,
  onAskQuestion,
  onSave,
  onDecline,
}: ArchitectOpportunityCardProps) {
  const closed = isOpportunityClosed(opportunity);
  const canBid = canBidOnOpportunity(opportunity);
  const daysLeft = daysUntil(opportunity.proposalDeadline);
  const closingToday = daysLeft === 0;

  return (
    <article
      className={`ap-opportunity${closed ? " ap-opportunity--closed" : ""}${
        closingToday ? " ap-opportunity--urgent" : ""
      }`}
    >
      <div
        className="ap-opportunity-image"
        style={{ backgroundImage: `url(${opportunity.imageUrl})` }}
        aria-hidden
      >
        <div className="ap-opportunity-image-tags">
          {opportunity.clientVerified ? (
            <span className="ap-opportunity-verified">
              <ShieldCheck size={12} weight="fill" /> Verified client
            </span>
          ) : (
            <span className="ap-opportunity-unverified" title="This client has not completed identity verification.">
              <ShieldWarning size={12} weight="fill" /> Client not verified
            </span>
          )}
        </div>
      </div>

      <div className="ap-opportunity-body">
        <div className="ap-opportunity-head">
          <h3>{opportunity.projectName}</h3>
          {opportunity.status === "bid_submitted" ? (
            <StatusPill label="Bid submitted" tone="success" size="sm" />
          ) : opportunity.status === "declined" ? (
            <StatusPill label="Declined" tone="neutral" size="sm" />
          ) : closed ? (
            <StatusPill label="Closed" tone="neutral" size="sm" />
          ) : closingToday ? (
            <StatusPill label="Closes today" tone="danger" size="sm" />
          ) : (
            <StatusPill label="Open for bids" tone="action" size="sm" />
          )}
        </div>

        <ul className="ap-opportunity-facts">
          <li>
            <MapPin size={14} weight="bold" />
            {opportunity.location}
          </li>
          <li>
            <Buildings size={14} weight="bold" />
            {opportunity.propertyType}
          </li>
          <li>
            <Wallet size={14} weight="bold" />
            {opportunity.budgetRange}
          </li>
          <li>
            <PaintBrush size={14} weight="bold" />
            {opportunity.style}
          </li>
          <li>
            <Clock size={14} weight="bold" />
            Target timeline: {opportunity.targetTimeline}
          </li>
          <li className={closed ? "ap-opportunity-deadline--closed" : "ap-opportunity-deadline"}>
            <CalendarX size={14} weight="bold" />
            {closed ? "Proposal deadline passed" : formatDueLabel(opportunity.proposalDeadline)}
          </li>
          <li>
            <Users size={14} weight="bold" />
            {plural(opportunity.architectsBidding, "architect")} bidding
          </li>
        </ul>

        <div className="ap-opportunity-deliverables">
          <span>Required deliverables</span>
          <div>
            {opportunity.requiredDeliverables.map((item) => (
              <span key={item} className="ap-chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="ap-opportunity-actions">
          <button
            type="button"
            className="ap-btn-outline ap-btn-sm"
            onClick={() => onViewBrief(opportunity)}
          >
            View client brief
          </button>
          <button
            type="button"
            className="ap-btn-primary ap-btn-sm"
            onClick={() => onSubmitBid(opportunity)}
            disabled={!canBid}
            title={
              closed
                ? "The proposal deadline has passed."
                : opportunity.status === "bid_submitted"
                  ? "You have already submitted a bid."
                  : undefined
            }
          >
            {opportunity.status === "bid_submitted" ? "Bid submitted" : "Submit bid"}
          </button>
          <button
            type="button"
            className="ap-icon-btn"
            onClick={() => onAskQuestion(opportunity)}
            title="Ask a question"
            aria-label="Ask a question"
            disabled={closed}
          >
            <ChatCircleDots size={16} weight="bold" />
          </button>
          <button
            type="button"
            className={`ap-icon-btn${opportunity.status === "saved" ? " ap-icon-btn--active" : ""}`}
            onClick={() => onSave(opportunity)}
            title={opportunity.status === "saved" ? "Saved" : "Save opportunity"}
            aria-label="Save opportunity"
            aria-pressed={opportunity.status === "saved"}
          >
            <BookmarkSimple
              size={16}
              weight={opportunity.status === "saved" ? "fill" : "bold"}
            />
          </button>
          <button
            type="button"
            className="ap-icon-btn ap-icon-btn--danger"
            onClick={() => onDecline(opportunity)}
            title="Decline opportunity"
            aria-label="Decline opportunity"
            disabled={opportunity.status === "declined"}
          >
            <Prohibit size={16} weight="bold" />
          </button>
        </div>

        {closed && opportunity.status !== "bid_submitted" && (
          <p className="ap-opportunity-note">
            Bidding has closed for this brief. It stays visible for reference only.
          </p>
        )}
      </div>
    </article>
  );
}
