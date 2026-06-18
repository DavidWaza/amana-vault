import type {
  ArchitectDesignMilestone,
  ArchitectProfile,
  ArchitectProject,
  ArchitectVault,
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

export function getActiveDesign(projects: ArchitectProject[]): ArchitectProject | null {
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

export function createDraftMilestones(): ArchitectDesignMilestone[] {
  return [
    { phase: "concept", label: "Concept Design", status: "upcoming" },
    { phase: "rendering", label: "3D Rendering", status: "upcoming" },
    { phase: "drawings", label: "Construction Drawings", status: "upcoming" },
    { phase: "boq", label: "BOQ Preparation", status: "upcoming" },
    { phase: "handover", label: "Handover", status: "upcoming" },
  ];
}

/**
 * Builds a plain-text earnings & project summary the architect can download.
 * Kept as a string so the calling component owns the browser download.
 */
export function buildArchitectReport(
  profile: ArchitectProfile,
  vault: ArchitectVault,
  projects: ArchitectProject[],
): string {
  const lines: string[] = [];
  lines.push("AMANA VAULT — ARCHITECT REPORT");
  lines.push(`Studio: ${profile.studioName}`);
  lines.push(`Generated: ${new Date().toLocaleString("en-NG")}`);
  lines.push("");
  lines.push("VAULT SUMMARY");
  lines.push(`  Total contract value: ${formatNaira(vault.totalContract)}`);
  lines.push(`  Released to you:       ${formatNaira(vault.released)}`);
  lines.push(`  Protected remaining:   ${formatNaira(vault.protected)}`);
  lines.push(`  Pending release:       ${formatNaira(vault.pendingRelease)}`);
  lines.push(`  Earnings this month:   ${formatNaira(vault.earningsThisMonth)}`);
  lines.push("");
  lines.push(`PROJECTS (${projects.length})`);
  if (projects.length === 0) {
    lines.push("  No projects yet.");
  } else {
    projects.forEach((p) => {
      lines.push(
        `  • ${p.title} — ${p.clientName} — ${p.status.replace("_", " ")} — ${p.progress}% — ${formatNaira(p.contractValue)}`,
      );
    });
  }
  lines.push("");
  return lines.join("\n");
}
