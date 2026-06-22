import type {
  ArtisanAvailability,
  ArtisanField,
  ConstructionStage,
  ContractorBid,
  ContractorMilestone,
  ContractorProfile,
  ContractorProject,
  ContractorVault,
  MilestoneStatus,
  TeamPermission,
  TeamRole,
} from "./types";
import { formatNaira } from "./utils";

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getActiveProject(projects: ContractorProject[]): ContractorProject | null {
  return (
    projects.find((p) => p.status === "in_progress") ??
    projects.find((p) => p.status !== "completed") ??
    null
  );
}

export function countByStatus<T extends { status: string }>(
  items: T[],
  status: string,
): number {
  return items.filter((item) => item.status === status).length;
}

// ── Construction stages (PRD §7) ────────────────────────────────────────
export const CONSTRUCTION_STAGES: { stage: ConstructionStage; label: string }[] = [
  { stage: "foundation", label: "Foundation" },
  { stage: "structure", label: "Structure" },
  { stage: "roofing", label: "Roofing" },
  { stage: "electrical_plumbing", label: "Electrical/Plumbing" },
  { stage: "finishing", label: "Finishing" },
  { stage: "handover", label: "Handover" },
];

export const STAGE_LABELS: Record<ConstructionStage, string> = {
  foundation: "Foundation",
  structure: "Structure",
  roofing: "Roofing",
  electrical_plumbing: "Electrical/Plumbing",
  finishing: "Finishing",
  handover: "Handover",
};

export function stageIndex(stage: ConstructionStage): number {
  return CONSTRUCTION_STAGES.findIndex((s) => s.stage === stage);
}

/** Default milestone schedule when a new awarded project is created. */
export function createConstructionMilestones(contractValue: number): ContractorMilestone[] {
  // Weighted split across the six standard construction stages.
  const weights: { stage: ConstructionStage; label: string; weight: number }[] = [
    { stage: "foundation", label: "Foundation", weight: 0.18 },
    { stage: "structure", label: "Structure", weight: 0.27 },
    { stage: "roofing", label: "Roofing", weight: 0.18 },
    { stage: "electrical_plumbing", label: "Electrical & Plumbing", weight: 0.15 },
    { stage: "finishing", label: "Finishing", weight: 0.15 },
    { stage: "handover", label: "Handover", weight: 0.07 },
  ];
  return weights.map((w, i) => ({
    id: `ms-${Date.now()}-${i}`,
    stage: w.stage,
    label: w.label,
    amount: Math.round((contractValue * w.weight) / 1000) * 1000,
    status: "pending" as MilestoneStatus,
  }));
}

// ── Milestone status presentation ───────────────────────────────────────
export const MILESTONE_STATUS_META: Record<
  MilestoneStatus,
  { label: string; tone: "muted" | "progress" | "warning" | "secure" | "success" | "danger" }
> = {
  pending: { label: "Pending", tone: "muted" },
  in_progress: { label: "In Progress", tone: "progress" },
  under_review: { label: "Under Review", tone: "warning" },
  approved: { label: "Approved", tone: "secure" },
  released: { label: "Released", tone: "success" },
  disputed: { label: "Disputed", tone: "danger" },
};

// ── Team roles & permissions (PRD §6) ───────────────────────────────────
export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  engineer: "Engineer",
  electrician: "Electrician",
  plumber: "Plumber",
  carpenter: "Carpenter",
  mason: "Mason",
  supervisor: "Supervisor",
};

export const TEAM_PERMISSION_LABELS: Record<TeamPermission, string> = {
  upload_proof: "Upload proof",
  update_progress: "Update progress",
  view_financials: "View financials",
};

// ── Artisan marketplace fields (PRD §4b) ────────────────────────────────
// Order doubles as the filter-chip order in the artisan marketplace.
export const ARTISAN_FIELDS: { field: ArtisanField; label: string }[] = [
  { field: "mason", label: "Mason / Bricklayer" },
  { field: "carpenter", label: "Carpenter" },
  { field: "electrician", label: "Electrician" },
  { field: "plumber", label: "Plumber" },
  { field: "tiler", label: "Tiler" },
  { field: "painter", label: "Painter" },
  { field: "welder", label: "Welder / Fabricator" },
  { field: "pop_ceiling", label: "POP & Ceiling" },
  { field: "aluminium", label: "Aluminium Works" },
  { field: "steel_fixer", label: "Steel Fixer / Iron Bender" },
  { field: "roofer", label: "Roofer" },
  { field: "surveyor", label: "Surveyor" },
];

export const ARTISAN_FIELD_LABELS: Record<ArtisanField, string> = ARTISAN_FIELDS.reduce(
  (acc, f) => {
    acc[f.field] = f.label;
    return acc;
  },
  {} as Record<ArtisanField, string>,
);

export const ARTISAN_AVAILABILITY_META: Record<
  ArtisanAvailability,
  { label: string; tone: "success" | "warning" | "muted" }
> = {
  available: { label: "Available now", tone: "success" },
  limited: { label: "Limited slots", tone: "warning" },
  engaged: { label: "Currently engaged", tone: "muted" },
};

// ── Bid math (PRD §5) ───────────────────────────────────────────────────
export function bidTotal(parts: {
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  contractorFee: number;
}): number {
  return (
    (parts.materialCost || 0) +
    (parts.laborCost || 0) +
    (parts.equipmentCost || 0) +
    (parts.contractorFee || 0)
  );
}

/** Plain-text build report a contractor can download for their records. */
export function buildContractorReport(
  profile: ContractorProfile,
  vault: ContractorVault,
  projects: ContractorProject[],
  bids: ContractorBid[],
): string {
  const lines: string[] = [];
  lines.push("AMANA VAULT — CONTRACTOR REPORT");
  lines.push(`Company: ${profile.companyName}`);
  lines.push(`Generated: ${new Date().toLocaleString("en-NG")}`);
  lines.push("");
  lines.push("VAULT SUMMARY");
  lines.push(`  Total contract value:    ${formatNaira(vault.contractValue)}`);
  lines.push(`  Protected funds:         ${formatNaira(vault.protectedFunds)}`);
  lines.push(`  Released funds:          ${formatNaira(vault.releasedFunds)}`);
  lines.push(`  Pending milestone amount:${formatNaira(vault.pendingMilestoneAmount)}`);
  lines.push("");
  lines.push(`ACTIVE PROJECTS (${projects.length})`);
  if (projects.length === 0) {
    lines.push("  No projects yet.");
  } else {
    projects.forEach((p) => {
      lines.push(
        `  • ${p.title} — ${p.clientName} — ${STAGE_LABELS[p.currentStage]} — ${p.progress}% — ${formatNaira(p.contractValue)}`,
      );
    });
  }
  lines.push("");
  lines.push(`BIDS (${bids.length})`);
  bids.forEach((b) => {
    lines.push(`  • ${b.projectName} — ${formatNaira(b.total)} — ${b.status}`);
  });
  lines.push("");
  return lines.join("\n");
}
