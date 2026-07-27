"use client";

import { FileArrowDown, ShieldWarning } from "phosphor-react";
import { DetailGrid, Notice } from "./ArchitectPrimitives";
import { formatLongDate } from "./utils";
import type { ClientBrief } from "./types";

/**
 * The body of a Build Your Dream Home submission, shared by the opportunity
 * modal and the project page's Brief tab so both always show the same fields.
 */
export default function ArchitectBriefBody({ brief }: { brief: ClientBrief }) {
  const documents = [...(brief.surveyPlan ? [brief.surveyPlan] : []), ...brief.documents];

  return (
    <>
      {!brief.clientVerified && (
        <Notice tone="warning" icon={<ShieldWarning size={16} weight="bold" />}>
          This client has not completed identity verification.
        </Notice>
      )}

      <DetailGrid
        items={[
          { label: "Project type", value: brief.projectType },
          { label: "Site location", value: brief.siteLocation },
          { label: "Client location", value: brief.clientLocation },
          { label: "Bedrooms", value: brief.bedrooms ?? "Not applicable" },
          { label: "Floors", value: brief.floors ?? "Not stated" },
          { label: "Preferred style", value: brief.preferredStyle },
          { label: "Budget range", value: brief.budgetRange },
          { label: "Desired design timeline", value: brief.desiredTimeline },
          { label: "Local representative", value: brief.localRepresentative ?? "None appointed" },
        ]}
      />

      <section className="ap-modal-section">
        <h3>Required spaces</h3>
        <div className="ap-chip-row">
          {brief.requiredSpaces.map((space) => (
            <span key={space} className="ap-chip">
              {space}
            </span>
          ))}
        </div>
      </section>

      {brief.specialRequests && brief.specialRequests !== "—" && (
        <section className="ap-modal-section">
          <h3>Special requests</h3>
          <p className="ap-body-text">{brief.specialRequests}</p>
        </section>
      )}

      {brief.inspirationImages.length > 0 && (
        <section className="ap-modal-section">
          <h3>Inspiration images</h3>
          <div className="ap-inspiration-row">
            {brief.inspirationImages.map((image, index) => (
              <span
                key={`${image}-${index}`}
                className="ap-inspiration-tile"
                style={{ backgroundImage: `url(${image})` }}
                role="img"
                aria-label={`Inspiration image ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="ap-modal-section">
        <h3>Survey plan & uploaded documents</h3>
        {documents.length === 0 ? (
          <p className="ap-empty-inline">
            No documents uploaded. Ask a clarification question if you need the survey plan.
          </p>
        ) : (
          <ul className="ap-doc-list">
            {documents.map((document) => (
              <li key={document.id}>
                <FileArrowDown size={16} weight="bold" />
                <div>
                  <strong>{document.name}</strong>
                  <span>
                    {document.kind.replace(/_/g, " ")} · uploaded {formatLongDate(document.uploadedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
