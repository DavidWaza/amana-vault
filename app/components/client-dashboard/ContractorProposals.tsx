"use client";

import { useState } from "react";
import { ShieldCheck, Star, Users, Clock, CheckCircle } from "phosphor-react";
import type { ClientProject, ContractorProposal } from "./types";
import { formatNaira } from "./utils";
import ClientPanelEmptyState from "./ClientPanelEmptyState";

type ContractorProposalsProps = {
  projects: ClientProject[];
  proposals: ContractorProposal[];
  onAcceptProposal?: (proposal: ContractorProposal) => void;
};

export default function ContractorProposals({
  projects,
  proposals,
  onAcceptProposal,
}: ContractorProposalsProps) {
  const biddingProjects = projects.filter(
    (p) => p.lifecycleStage === "contractor_bidding",
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    biddingProjects[0]?.id ?? proposals[0]?.projectId ?? "",
  );

  const projectProposals = proposals.filter((p) => p.projectId === selectedProjectId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (proposals.length === 0) {
    return (
      <section className="cdash-section" id="proposals">
        <header className="cdash-section-header">
          <div>
            <p className="adash-eyebrow">Contractor Proposals</p>
            <h2>Compare contractor bids</h2>
            <p>
              Once your architect delivers final documents, verified contractors submit
              competitive bids for your review.
            </p>
          </div>
        </header>
        <ClientPanelEmptyState
          variant="proposals"
          title="No proposals yet"
          message="Proposals appear here when contractor bidding opens on a project."
        />
      </section>
    );
  }

  return (
    <section className="cdash-section" id="proposals">
      <header className="cdash-section-header">
        <div>
          <p className="adash-eyebrow">Contractor Proposals</p>
          <h2>Compare contractor bids</h2>
          <p>
            Review price, timeline, team, experience, reviews, and fee structure before
            selecting your builder.
          </p>
        </div>
      </header>

      {biddingProjects.length > 1 && (
        <div className="cdash-proposal-project-tabs adash-tabs">
          {biddingProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`adash-tab${selectedProjectId === project.id ? " adash-tab--active" : ""}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              {project.title}
            </button>
          ))}
        </div>
      )}

      {selectedProject && (
        <p className="cdash-proposal-context">
          Comparing bids for <strong>{selectedProject.title}</strong> —{" "}
          {selectedProject.location}
        </p>
      )}

      <div className="cdash-proposal-cards">
        {projectProposals.length === 0 ? (
          <ClientPanelEmptyState
            variant="proposals"
            title="No bids for this project yet"
            message="Contractors will submit competitive bids once bidding opens."
          />
        ) : (
          projectProposals.map((proposal) => (
          <article
            key={proposal.id}
            className={`cdash-proposal-card${proposal.accepted ? " cdash-proposal-card--accepted" : ""}`}
          >
            <header className="cdash-proposal-card-header">
              <div className="cdash-proposal-card-title">
                <strong>{proposal.contractorName}</strong>
                <span>{proposal.company}</span>
              </div>
              {proposal.verified && (
                <span className="cdash-verified-badge">
                  <ShieldCheck size={12} weight="fill" />
                  Verified
                </span>
              )}
            </header>

            <dl className="cdash-proposal-details">
              <div>
                <dt>Total price</dt>
                <dd>
                  <strong>{formatNaira(proposal.totalPrice)}</strong>
                  <small>
                    Materials {formatNaira(proposal.materialsCost)} · Labor{" "}
                    {formatNaira(proposal.laborCost)}
                  </small>
                </dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>
                  <Clock size={14} weight="bold" />
                  {proposal.timelineMonths} months
                </dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{proposal.experienceYears} years</dd>
              </div>
              <div>
                <dt>Reviews</dt>
                <dd>
                  <Star size={14} weight="fill" />
                  {proposal.rating} ({proposal.reviewCount})
                </dd>
              </div>
              <div className="cdash-proposal-details-full">
                <dt>Team</dt>
                <dd>
                  <Users size={14} weight="bold" />
                  {proposal.team.length} specialists
                  <ul className="cdash-proposal-team">
                    {proposal.team.map((member) => (
                      <li key={`${member.role}-${member.name}`}>
                        {member.role}: {member.name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="cdash-proposal-details-full">
                <dt>Fee structure</dt>
                <dd>{proposal.feeStructure}</dd>
              </div>
            </dl>

            <footer className="cdash-proposal-card-footer">
              {proposal.accepted ? (
                <span className="cdash-proposal-accepted">
                  <CheckCircle size={16} weight="fill" />
                  Selected
                </span>
              ) : (
                <button
                  type="button"
                  className="adash-btn adash-btn--primary"
                  onClick={() => onAcceptProposal?.(proposal)}
                >
                  Accept Bid
                </button>
              )}
            </footer>
          </article>
          ))
        )}
      </div>
    </section>
  );
}
