"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Warning, X } from "phosphor-react";
import ContractorPortalSidebar from "./ContractorPortalSidebar";
import ContractorPortalHeader from "./ContractorPortalHeader";
import ContractorDashboardHome, { type HomeAlert } from "./ContractorDashboardHome";
import {
  MarketplacePanel,
  ProjectCenterPanel,
  TeamPanel,
  VaultPanel,
  DocumentsPanel,
  UpdatesPanel,
  ReviewsPanel,
} from "./ContractorPanels";
import ContractorBidModal, { type BidDraft } from "./ContractorBidModal";
import ContractorMilestoneModal from "./ContractorMilestoneModal";
import ContractorTeamModal, { type TeamMemberDraft } from "./ContractorTeamModal";
import ContractorSettingsModal from "./ContractorSettingsModal";
import { useContractorProfile } from "./ContractorProfileProvider";
import {
  MOCK_MARKETPLACE_PROJECTS,
  MOCK_MARKETPLACE_ARTISANS,
  MOCK_CONTRACTOR_BIDS,
  MOCK_TEAM_MEMBERS,
  MOCK_CONTRACTOR_DOCUMENTS,
  MOCK_CONTRACTOR_UPDATES,
  MOCK_CONTRACTOR_REVIEWS,
} from "./mock-data";
import { SIDEBAR_STORAGE_KEY } from "./onboarding-constants";
import { getActiveProject, buildContractorReport } from "./portal-utils";
import { formatNaira } from "./utils";
import { ctBtn, ctBtnGhost, ctBtnPrimary } from "./ui";
import type {
  ContractorBid,
  ContractorDashboardView,
  ContractorProject,
  ContractorUpdate,
  MarketplaceArtisan,
  MarketplaceProject,
  TeamMember,
} from "./types";

const VALID_VIEWS: ContractorDashboardView[] = [
  "dashboard",
  "marketplace",
  "projects",
  "team",
  "vault",
  "documents",
  "updates",
  "reviews",
];

const PAGE_TITLES: Record<ContractorDashboardView, string> = {
  dashboard: "Dashboard",
  marketplace: "Marketplace",
  projects: "Project Center",
  team: "Build Team",
  vault: "Vault & Milestones",
  documents: "Documents",
  updates: "Updates",
  reviews: "Reviews",
};

export default function ContractorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    vault,
    setVault,
    projects,
    setProjects,
    setNotifications,
    settingsOpen,
    closeProfileSettings,
    openProfileSettings,
  } = useContractorProfile();

  const [activeView, setActiveView] = useState<ContractorDashboardView>("dashboard");
  const [marketplace, setMarketplace] = useState<MarketplaceProject[]>(MOCK_MARKETPLACE_PROJECTS);
  const [artisans, setArtisans] = useState<MarketplaceArtisan[]>(MOCK_MARKETPLACE_ARTISANS);
  const [bids, setBids] = useState<ContractorBid[]>(MOCK_CONTRACTOR_BIDS);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [updates, setUpdates] = useState<ContractorUpdate[]>(MOCK_CONTRACTOR_UPDATES);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHydrated, setSidebarHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bidProject, setBidProject] = useState<MarketplaceProject | null>(null);
  const [milestoneProject, setMilestoneProject] = useState<ContractorProject | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const activeProject = useMemo(() => getActiveProject(projects), [projects]);

  const metrics = useMemo(
    () => ({
      activeBuilds: projects.filter((p) => p.status === "in_progress").length,
      openBids: bids.filter((b) => b.status === "submitted").length,
      marketplaceOpen: marketplace.filter((m) => m.bidStatus === "open").length,
      teamSize: team.length,
    }),
    [projects, bids, marketplace, team],
  );

  const pendingMilestoneCount = useMemo(
    () =>
      projects.reduce(
        (acc, p) => acc + p.milestones.filter((m) => m.status === "under_review").length,
        0,
      ),
    [projects],
  );

  // Updates posted during this session (e.g. after submitting a milestone) count
  // as "new" for the sidebar badge — avoids an impure Date.now() during render.
  const unreadUpdates = Math.max(0, updates.length - MOCK_CONTRACTOR_UPDATES.length);

  const canRequestRelease =
    profile.verificationStatus === "verified" &&
    profile.bankStatus === "verified" &&
    vault.pendingMilestoneAmount > 0;

  const releaseBlockedReason = useMemo(() => {
    if (profile.verificationStatus === "pending") return "Company verification is still in review. Releases unlock once approved.";
    if (profile.verificationStatus === "rejected") return "Verification was declined. Resubmit company details in Settings.";
    if (profile.verificationStatus !== "verified") return "Complete verification to request vault releases.";
    if (profile.bankStatus !== "verified") return "Add a verified payout bank account in Settings.";
    if (vault.pendingMilestoneAmount <= 0) return "No funds pending release right now.";
    return undefined;
  }, [profile.verificationStatus, profile.bankStatus, vault.pendingMilestoneAmount]);

  const alerts = useMemo<HomeAlert[]>(() => {
    const list: HomeAlert[] = [];
    if (pendingMilestoneCount > 0) {
      list.push({
        id: "a-review",
        tone: "warning",
        text: `${pendingMilestoneCount} milestone${pendingMilestoneCount > 1 ? "s" : ""} under inspection — track approval in the vault.`,
        actionLabel: "Open vault",
        view: "vault",
      });
    }
    if (metrics.marketplaceOpen > 0) {
      list.push({
        id: "a-marketplace",
        tone: "info",
        text: `${metrics.marketplaceOpen} new project${metrics.marketplaceOpen > 1 ? "s" : ""} open for bids on the marketplace.`,
        actionLabel: "Browse",
        view: "marketplace",
      });
    }
    if (team.some((m) => m.status === "invited")) {
      list.push({
        id: "a-team",
        tone: "info",
        text: "A team member invite is still pending acceptance.",
        actionLabel: "Manage team",
        view: "team",
      });
    }
    return list;
  }, [pendingMilestoneCount, metrics.marketplaceOpen, team]);

  // Onboarding gate.
  useEffect(() => {
    if (!profile.onboardingComplete) router.replace("/contractor/onboarding");
  }, [profile.onboardingComplete, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved !== null) setSidebarCollapsed(saved === "true");
    } catch {
      /* default */
    }
    setSidebarHydrated(true);
  }, []);

  useEffect(() => {
    if (!sidebarHydrated) return;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarHydrated]);

  useEffect(() => {
    const view = searchParams.get("view") as ContractorDashboardView | null;
    if (view && VALID_VIEWS.includes(view)) setActiveView(view);
  }, [searchParams]);

  const navigate = useCallback(
    (view: ContractorDashboardView) => {
      setActiveView(view);
      router.replace(`/contractor/dashboard?view=${view}`, { scroll: false });
    },
    [router],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!releaseModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReleaseModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [releaseModalOpen]);

  const pushNotification = useCallback(
    (title: string, body: string, type: "info" | "success" | "warning" = "info") => {
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, type, title, body, read: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [setNotifications],
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSubmitBid = (project: MarketplaceProject, draft: BidDraft) => {
    const now = new Date().toISOString();
    const total = draft.materialCost + draft.laborCost + draft.equipmentCost + draft.contractorFee;
    const bid: ContractorBid = {
      id: `bid-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      clientName: project.name,
      materialCost: draft.materialCost,
      laborCost: draft.laborCost,
      equipmentCost: draft.equipmentCost,
      contractorFee: draft.contractorFee,
      total,
      timelineWeeks: draft.timelineWeeks,
      teamMemberIds: draft.teamMemberIds,
      notes: draft.notes,
      submittedAt: now,
      status: "submitted",
    };
    setBids((prev) => [bid, ...prev]);
    setMarketplace((prev) => prev.map((m) => (m.id === project.id ? { ...m, bidStatus: "submitted" } : m)));
    pushNotification("Bid submitted", `${formatNaira(total)} bid sent for ${project.name}.`, "success");
    setBidProject(null);
    showToast(`Bid of ${formatNaira(total)} submitted for ${project.name}.`);
  };

  const handleToggleSave = (id: string) => {
    setMarketplace((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, bidStatus: m.bidStatus === "saved" ? "open" : m.bidStatus === "open" ? "saved" : m.bidStatus }
          : m,
      ),
    );
  };

  const handleInviteArtisan = (artisan: MarketplaceArtisan) => {
    pushNotification(
      "Artisan invited",
      `Invite sent to ${artisan.name} (${artisan.field.replace(/_/g, " ")}). You'll be notified when they respond.`,
      "success",
    );
    showToast(`Invite sent to ${artisan.name}.`);
  };

  const handleToggleSaveArtisan = (id: string) => {
    setArtisans((prev) => prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a)));
  };

  const handleAddTeamMember = (draft: TeamMemberDraft) => {
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: draft.name,
      role: draft.role,
      phone: draft.phone,
      permissions: draft.permissions,
      assignedProjectId: draft.assignedProjectId,
      status: "invited",
    };
    setTeam((prev) => [member, ...prev]);
    setTeamModalOpen(false);
    showToast(`Invite sent to ${draft.name}.`);
  };

  const openMilestoneModal = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId) ?? null;
    setMilestoneProject(project);
  };

  const handleMilestoneSubmit = (projectId: string, milestoneId: string, fileCount: number) => {
    let label = "Milestone";
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) => {
            if (m.id !== milestoneId) return m;
            label = m.label;
            return { ...m, status: "under_review", evidenceCount: fileCount };
          }),
        };
      }),
    );
    const project = projects.find((p) => p.id === projectId);
    setUpdates((prev) => [
      {
        id: `up-${Date.now()}`,
        projectName: project?.title ?? "Project",
        authorName: profile.contactName,
        authorRole: "Contractor",
        text: `${label} submitted for inspection with ${fileCount} evidence file${fileCount > 1 ? "s" : ""}.`,
        createdAt: new Date().toISOString(),
        tone: "success",
        photoCount: fileCount,
      },
      ...prev,
    ]);
    pushNotification("Milestone under review", `${label} submitted for independent inspection.`, "warning");
    showToast("Milestone submitted for inspection.");
  };

  const handleConfirmRelease = () => {
    if (!canRequestRelease) return;
    const amount = vault.pendingMilestoneAmount;
    setVault((prev) => ({ ...prev, pendingMilestoneAmount: 0 }));
    pushNotification(
      "Release requested",
      `${formatNaira(amount)} submitted for release — awaiting client approval.`,
      "info",
    );
    setReleaseModalOpen(false);
    showToast("Release request submitted. Client approval may be required.");
  };

  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;
    const report = buildContractorReport(profile, vault, projects, bids);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amana-contractor-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Report downloaded.");
  };

  const verificationBanner = useMemo(() => {
    if (profile.verificationStatus === "pending")
      return { tone: "info" as const, text: "Your company is under review. Some actions are limited until verification completes." };
    if (profile.verificationStatus === "rejected")
      return { tone: "warning" as const, text: "Verification was declined. Update company details to resubmit." };
    if (profile.bankStatus === "none")
      return { tone: "info" as const, text: "Connect a payout bank account to receive vault releases." };
    return null;
  }, [profile.verificationStatus, profile.bankStatus]);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ContractorDashboardHome
            activeProject={activeProject}
            vault={vault}
            updates={updates}
            metrics={metrics}
            alerts={alerts}
            onNavigate={navigate}
            onSubmitMilestone={openMilestoneModal}
          />
        );
      case "marketplace":
        return (
          <MarketplacePanel
            projects={marketplace}
            artisans={artisans}
            onBid={setBidProject}
            onToggleSave={handleToggleSave}
            onInviteArtisan={handleInviteArtisan}
            onToggleSaveArtisan={handleToggleSaveArtisan}
          />
        );
      case "projects":
        return (
          <ProjectCenterPanel
            projects={projects}
            onSubmitMilestone={openMilestoneModal}
            onMessage={() => showToast("Client messaging is coming soon.")}
          />
        );
      case "team":
        return <TeamPanel members={team} projects={projects} onAddMember={() => setTeamModalOpen(true)} />;
      case "vault":
        return (
          <VaultPanel
            vault={vault}
            projects={projects}
            canRequestRelease={canRequestRelease}
            releaseBlockedReason={releaseBlockedReason}
            onRequestRelease={() => setReleaseModalOpen(true)}
          />
        );
      case "documents":
        return <DocumentsPanel documents={MOCK_CONTRACTOR_DOCUMENTS} onUpload={() => showToast("Use Submit Milestone to attach site evidence.")} />;
      case "updates":
        return <UpdatesPanel updates={updates} />;
      case "reviews":
        return <ReviewsPanel reviews={MOCK_CONTRACTOR_REVIEWS} rating={profile.rating} reviewCount={profile.reviewCount} />;
      default:
        return null;
    }
  };

  if (!profile.onboardingComplete) return null;

  return (
    <div className="flex min-h-screen">
      <ContractorPortalSidebar
        activeView={activeView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onNavigate={navigate}
        onOpenSettings={openProfileSettings}
        onFindProjects={() => navigate("marketplace")}
        marketplaceOpenCount={metrics.marketplaceOpen}
        activeProjectCount={metrics.activeBuilds}
        teamCount={team.length}
        pendingMilestoneCount={pendingMilestoneCount}
        unreadUpdates={unreadUpdates}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-5 lg:px-8 py-5">
          {activeView === "dashboard" ? (
            <ContractorPortalHeader
              onDownloadReport={handleDownloadReport}
              onOpenSettings={openProfileSettings}
              onNavigate={navigate}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="m-0 text-[clamp(1.3rem,2.2vw,1.7rem)] font-black text-green">
                {PAGE_TITLES[activeView]}
              </h1>
            </div>
          )}
        </div>

        {verificationBanner && (
          <div
            className={`mx-5 lg:mx-8 mb-4 flex items-center gap-2.5 px-4 py-3 rounded-[14px] border border-solid text-[0.85rem] font-semibold ${
              verificationBanner.tone === "warning"
                ? "bg-[rgba(244,163,0,0.1)] border-[rgba(244,163,0,0.3)] text-[#b7791f]"
                : "bg-contractor-soft border-contractor-line text-contractor"
            }`}
          >
            <Warning size={18} weight="bold" className="shrink-0" />
            <p className="m-0 flex-1">{verificationBanner.text}</p>
            {profile.verificationStatus === "rejected" && (
              <button
                type="button"
                className="shrink-0 underline font-extrabold"
                onClick={() => router.push("/contractor/onboarding?resume=credentials")}
              >
                Resubmit
              </button>
            )}
          </div>
        )}

        <main className="flex-1 px-5 lg:px-8 pb-10">{renderView()}</main>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-full bg-green text-white text-[0.85rem] font-bold shadow-brand-md">
          {toast}
        </div>
      )}

      {/* Request release confirm modal */}
      {releaseModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-5 bg-[rgba(6,43,24,0.45)] backdrop-blur-[4px]" role="presentation" onClick={() => setReleaseModalOpen(false)}>
          <div className="w-full max-w-[440px] p-6 rounded-[22px] bg-white border border-solid border-line shadow-brand-lg relative" role="dialog" aria-modal="true" aria-labelledby="release-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 grid place-items-center w-8 h-8 border-0 rounded-[10px] bg-contractor-soft text-contractor" onClick={() => setReleaseModalOpen(false)} aria-label="Close">
              <X size={18} weight="bold" />
            </button>
            <h2 id="release-title" className="m-0 text-[1.25rem] font-black text-green">Request Vault Release</h2>
            <p className="m-0 mt-2 text-[0.9rem] text-muted leading-[1.6]">
              Submit a release request for {formatNaira(vault.pendingMilestoneAmount)} in approved milestone funds.
              The client may need to approve before funds are sent to your payout account.
            </p>
            <div className={`${"flex gap-[0.65rem] justify-end mt-5"}`}>
              <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={() => setReleaseModalOpen(false)}>Cancel</button>
              <button type="button" className={`${ctBtn} ${ctBtnPrimary}`} onClick={handleConfirmRelease} disabled={!canRequestRelease}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <ContractorBidModal project={bidProject} teamMembers={team} onClose={() => setBidProject(null)} onSubmit={handleSubmitBid} />

      <ContractorMilestoneModal
        project={milestoneProject}
        open={Boolean(milestoneProject)}
        onClose={() => setMilestoneProject(null)}
        onSubmit={handleMilestoneSubmit}
      />

      <ContractorTeamModal open={teamModalOpen} projects={projects} onClose={() => setTeamModalOpen(false)} onSubmit={handleAddTeamMember} />

      <ContractorSettingsModal open={settingsOpen} onClose={closeProfileSettings} onSaved={showToast} />
    </div>
  );
}
