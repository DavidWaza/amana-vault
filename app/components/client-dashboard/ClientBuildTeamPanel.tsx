"use client";

import type { ClientProject } from "./types";
import ClientPanelEmptyState from "./ClientPanelEmptyState";
import { getInitials } from "./portal-utils";
import { MOCK_ARCHITECTS } from "./mock-data";

type ClientBuildTeamPanelProps = {
  projects: ClientProject[];
  onOpenChat: (projectId: string) => void;
  onFindProfessionals: () => void;
};

export default function ClientBuildTeamPanel({
  projects,
  onOpenChat,
  onFindProfessionals,
}: ClientBuildTeamPanelProps) {
  const activeProjects = projects.filter(
    (p) => !["cancelled", "released", "declined"].includes(p.status),
  );

  return (
    <section className="cp-subpage">
      <header className="cp-subpage-header">
        <h2>Your Build Team</h2>
        <p>Architects, contractors, and inspectors across your active projects.</p>
      </header>

      <div className="cp-team-grid">
        {activeProjects.map((project) => {
          const architect = MOCK_ARCHITECTS.find((a) => a.name === project.architectName);
          return (
            <article key={project.id} className="cp-panel">
              <header className="cp-panel-header">
                <h3>{project.title}</h3>
              </header>
              <ul className="cp-team-list">
                {project.architectName && (
                  <li className="cp-team-item">
                    <span className="cp-avatar cp-avatar--sm">
                      {getInitials(project.architectName)}
                    </span>
                    <div className="cp-team-info">
                      <strong>{architect?.company ?? project.architectName}</strong>
                      <span>{project.architectName}</span>
                      <span className="cp-role-tag cp-role-tag--architect">ARCHITECT</span>
                    </div>
                    <button type="button" className="cp-link-btn" onClick={() => onOpenChat(project.id)}>
                      Message
                    </button>
                  </li>
                )}
                {project.contractorName && (
                  <li className="cp-team-item">
                    <span className="cp-avatar cp-avatar--sm">
                      {getInitials(project.contractorName)}
                    </span>
                    <div className="cp-team-info">
                      <strong>{project.contractorName}</strong>
                      <span>General Contractor</span>
                      <span className="cp-role-tag cp-role-tag--contractor">CONTRACTOR</span>
                    </div>
                    <button type="button" className="cp-link-btn" onClick={() => onOpenChat(project.id)}>
                      Message
                    </button>
                  </li>
                )}
                {project.vaultMilestones?.find((m) => m.inspectorName)?.inspectorName && (
                  <li className="cp-team-item">
                    <span className="cp-avatar cp-avatar--sm">
                      {getInitials(
                        project.vaultMilestones!.find((m) => m.inspectorName)!.inspectorName!,
                      )}
                    </span>
                    <div className="cp-team-info">
                      <strong>Independent Inspector</strong>
                      <span>
                        {project.vaultMilestones!.find((m) => m.inspectorName)!.inspectorName}
                      </span>
                      <span className="cp-role-tag cp-role-tag--inspector">INSPECTOR</span>
                    </div>
                  </li>
                )}
              </ul>
            </article>
          );
        })}
      </div>

      {activeProjects.length === 0 && (
        <ClientPanelEmptyState
          variant="build-team"
          title="No build team yet"
          message="Start a project and find verified professionals for your build."
          action={
            <button
              type="button"
              className="adash-btn adash-btn--primary"
              onClick={onFindProfessionals}
            >
              Find Professionals
            </button>
          }
        />
      )}
    </section>
  );
}
