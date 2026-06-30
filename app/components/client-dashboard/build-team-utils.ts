import type {
  Architect,
  BuildTeamMember,
  BuildTeamRole,
  ClientProject,
  ContractorProposal,
  MarketplaceContractor,
  RecommendedArtisan,
} from "./types";
import { MOCK_ARCHITECTS, MOCK_CONTRACTOR_PROPOSALS, MOCK_CONTRACTORS } from "./mock-data";

export const BUILD_TEAM_ROLE_LABELS: Record<BuildTeamRole, string> = {
  architect: "Architects",
  contractor: "Contractors",
  artisan: "Artisans",
};

export const BUILD_TEAM_ROLE_ORDER: BuildTeamRole[] = [
  "architect",
  "contractor",
  "artisan",
];

const FALLBACK_CONTACT = {
  phone: "08030000000",
  email: "contact@amana.ng",
};

function lookupArchitectContact(name: string) {
  const match = MOCK_ARCHITECTS.find(
    (item) => item.name === name || item.company === name,
  );
  return match
    ? { phone: match.phone, email: match.email }
    : FALLBACK_CONTACT;
}

function lookupContractorContact(name: string) {
  const fromMarketplace = MOCK_CONTRACTORS.find(
    (item) => item.name === name || item.company === name,
  );
  if (fromMarketplace) {
    return { phone: fromMarketplace.phone, email: fromMarketplace.email };
  }
  const match = MOCK_CONTRACTOR_PROPOSALS.find(
    (item) => item.contractorName === name || item.company === name,
  );
  return match
    ? { phone: match.phone, email: match.email }
    : FALLBACK_CONTACT;
}

export function buildTeamMemberId(role: BuildTeamRole, sourceId: string): string {
  return `${role}-${sourceId}`;
}

export function memberFromArchitect(architect: Architect): BuildTeamMember {
  return {
    id: buildTeamMemberId("architect", architect.id),
    role: "architect",
    sourceId: architect.id,
    name: architect.name,
    subtitle: architect.company,
    detail: architect.specialty,
    phone: architect.phone,
    email: architect.email,
    addedAt: new Date().toISOString(),
  };
}

export function memberFromContractor(
  contractor: MarketplaceContractor,
): BuildTeamMember {
  return {
    id: buildTeamMemberId("contractor", contractor.id),
    role: "contractor",
    sourceId: contractor.id,
    name: contractor.name,
    subtitle: contractor.company,
    detail: contractor.specialty,
    phone: contractor.phone,
    email: contractor.email,
    addedAt: new Date().toISOString(),
  };
}

export function memberFromProposal(proposal: ContractorProposal): BuildTeamMember {
  return {
    id: buildTeamMemberId("contractor", proposal.id),
    role: "contractor",
    sourceId: proposal.id,
    name: proposal.contractorName,
    subtitle: proposal.company,
    detail: `${proposal.timelineMonths} month timeline`,
    phone: proposal.phone,
    email: proposal.email,
    addedAt: new Date().toISOString(),
  };
}

export function memberFromArtisan(artisan: RecommendedArtisan): BuildTeamMember {
  return {
    id: buildTeamMemberId("artisan", artisan.id),
    role: "artisan",
    sourceId: artisan.id,
    name: artisan.fullName,
    subtitle: artisan.categoryLabel,
    detail: `${artisan.areaLabel}, Abuja`,
    phone: artisan.phone,
    email: artisan.email,
    addedAt: new Date().toISOString(),
  };
}

export function upsertBuildTeamMember(
  team: BuildTeamMember[],
  member: BuildTeamMember,
): BuildTeamMember[] {
  const existing = team.find((item) => item.id === member.id);
  if (existing) return team;
  return [member, ...team];
}

export function removeBuildTeamMember(
  team: BuildTeamMember[],
  memberId: string,
): BuildTeamMember[] {
  return team.filter((item) => item.id !== memberId);
}

export function isOnBuildTeam(
  team: BuildTeamMember[],
  role: BuildTeamRole,
  sourceId: string,
): boolean {
  return team.some(
    (item) => item.role === role && item.sourceId === sourceId,
  );
}

export function groupBuildTeamByRole(
  team: BuildTeamMember[],
): Record<BuildTeamRole, BuildTeamMember[]> {
  return {
    architect: team.filter((item) => item.role === "architect"),
    contractor: team.filter((item) => item.role === "contractor"),
    artisan: team.filter((item) => item.role === "artisan"),
  };
}

/** Confirmed professionals already assigned on active projects. */
export function assignedTeamFromProjects(
  projects: ClientProject[],
): BuildTeamMember[] {
  const members: BuildTeamMember[] = [];
  const seen = new Set<string>();

  for (const project of projects) {
    if (["cancelled", "released", "declined"].includes(project.status)) continue;

    if (project.architectName) {
      const id = buildTeamMemberId("architect", `project-${project.id}-arch`);
      if (!seen.has(id)) {
        seen.add(id);
        const contact = lookupArchitectContact(project.architectName);
        members.push({
          id,
          role: "architect",
          sourceId: project.id,
          name: project.architectName,
          subtitle: project.title,
          detail: "Assigned to project",
          phone: contact.phone,
          email: contact.email,
          addedAt: project.lastUpdated,
          status: "assigned",
        });
      }
    }

    if (project.contractorName) {
      const id = buildTeamMemberId("contractor", `project-${project.id}-con`);
      if (!seen.has(id)) {
        seen.add(id);
        const contact = lookupContractorContact(project.contractorName);
        members.push({
          id,
          role: "contractor",
          sourceId: project.id,
          name: project.contractorName,
          subtitle: project.title,
          detail: "Selected builder",
          phone: contact.phone,
          email: contact.email,
          addedAt: project.lastUpdated,
          status: "assigned",
        });
      }
    }
  }

  return members;
}

export function mergeBuildTeamView(
  shortlisted: BuildTeamMember[],
  projects: ClientProject[],
): Record<BuildTeamRole, BuildTeamMember[]> {
  const assigned = assignedTeamFromProjects(projects);
  const combined = [
    ...assigned,
    ...shortlisted.map((item) => ({ ...item, status: "shortlisted" as const })),
  ];
  return groupBuildTeamByRole(combined);
}

export function findBuildTeamMemberName(
  team: BuildTeamMember[],
  projects: ClientProject[],
  memberId: string,
): string | null {
  const grouped = mergeBuildTeamView(team, projects);
  for (const role of BUILD_TEAM_ROLE_ORDER) {
    const match = grouped[role].find((item) => item.id === memberId);
    if (match) return match.name;
  }
  return null;
}
