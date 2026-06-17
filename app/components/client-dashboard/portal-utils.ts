import type { ClientProject } from "./types";

export function getActiveProject(projects: ClientProject[]): ClientProject | null {
  return (
    projects.find(
      (p) => p.lifecycleStage === "construction" && p.status === "in_progress",
    ) ??
    projects.find(
      (p) =>
        !["cancelled", "released", "declined", "invitation_expired"].includes(
          p.status,
        ),
    ) ??
    null
  );
}

export function getProjectProgress(project: ClientProject): number {
  const milestones = project.vaultMilestones ?? [];
  if (milestones.length === 0) {
    if (project.lifecycleStage === "completed") return 100;
    if (project.lifecycleStage === "construction") return 38;
    return 0;
  }
  const done = milestones.filter((m) => m.status === "released").length;
  const inFlight = milestones.filter((m) =>
    ["inspection", "approved", "active"].includes(m.status),
  ).length;
  return Math.min(
    100,
    Math.round(((done + inFlight * 0.5) / milestones.length) * 100),
  );
}

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
