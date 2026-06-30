"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Warning, X } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import ArchitectPortalSidebar from "./ArchitectPortalSidebar";
import ArchitectPortalHeader from "./ArchitectPortalHeader";
import ArchitectDashboardHome from "./ArchitectDashboardHome";
import {
  ArchitectProjectsPanel,
  ArchitectDesignRequestsPanel,
  ArchitectProposalsPanel,
  ArchitectVaultPanel,
  ArchitectDocumentsPanel,
  ArchitectReviewsPanel,
} from "./ArchitectPanels";
import ArchitectSettingsModal from "./ArchitectSettingsModal";
import ArchitectProposalModal, { type ProposalDraft } from "./ArchitectProposalModal";
import ArchitectNewProjectModal, { type NewProjectDraft } from "./ArchitectNewProjectModal";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import {
  MOCK_DESIGN_REQUESTS,
  MOCK_ARCHITECT_PROPOSALS,
  MOCK_ARCHITECT_ACTIVITY,
} from "./mock-data";
import {
  getActiveDesign,
  countByStatus,
  createDraftMilestones,
  buildArchitectReport,
} from "./portal-utils";
import { formatNaira } from "./utils";
import type {
  ArchitectActivity,
  ArchitectDashboardView,
  ArchitectProject,
  ArchitectProposal,
  DesignRequest,
} from "./types";

const NEW_PROJECT_IMAGE =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80";

const VALID_VIEWS: ArchitectDashboardView[] = [
  "dashboard",
  "projects",
  "design-requests",
  "proposals",
  "active-designs",
  "vault",
  "documents",
  "reviews",
];

const PAGE_TITLES: Record<ArchitectDashboardView, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  "design-requests": "Design Requests",
  proposals: "Proposals",
  "active-designs": "Active Designs",
  vault: "Vault",
  documents: "Documents",
  reviews: "Reviews",
};

export default function ArchitectDashboard() {
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
  } = useArchitectProfile();

  const [activeView, setActiveView] = useState<ArchitectDashboardView>("dashboard");
  const [designRequests, setDesignRequests] = useState(MOCK_DESIGN_REQUESTS);
  const [proposals, setProposals] = useState(MOCK_ARCHITECT_PROPOSALS);
  const [activity, setActivity] = useState<ArchitectActivity[]>(MOCK_ARCHITECT_ACTIVITY);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHydrated, setSidebarHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [proposalRequestId, setProposalRequestId] = useState<string | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const activeDesign = useMemo(() => getActiveDesign(projects), [projects]);
  const designRequestCount = countByStatus(designRequests, "new");
  const proposalCount = proposals.filter((p) => p.status === "pending").length;
  const activeDesignCount = projects.filter((p) => p.status === "in_progress").length;

  const canRequestRelease =
    profile.verificationStatus === "verified" &&
    profile.bankStatus === "verified" &&
    vault.pendingRelease > 0;

  const releaseBlockedReason = useMemo(() => {
    if (profile.verificationStatus === "pending") {
      return "Verification is still in review. Releases unlock once approved.";
    }
    if (profile.verificationStatus === "rejected") {
      return "Verification was declined. Resubmit credentials in Settings.";
    }
    if (profile.verificationStatus !== "verified") {
      return "Complete verification to request vault releases.";
    }
    if (profile.bankStatus !== "verified") {
      return "Add a verified payout bank account in Settings.";
    }
    if (vault.pendingRelease <= 0) {
      return "No funds pending release right now.";
    }
    return undefined;
  }, [profile.verificationStatus, profile.bankStatus, vault.pendingRelease]);

  useEffect(() => {
    if (!profile.onboardingComplete) {
      router.replace("/architect/onboarding");
    }
  }, [profile.onboardingComplete, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("amana-architect-sidebar-collapsed");
      if (saved !== null) setSidebarCollapsed(saved === "true");
    } catch {
      /* default */
    }
    setSidebarHydrated(true);
  }, []);

  useEffect(() => {
    if (!sidebarHydrated) return;
    localStorage.setItem("amana-architect-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarHydrated]);

  useEffect(() => {
    const view = searchParams.get("view") as ArchitectDashboardView | null;
    if (view && VALID_VIEWS.includes(view)) setActiveView(view);
  }, [searchParams]);

  const navigate = useCallback(
    (view: ArchitectDashboardView) => {
      setActiveView(view);
      router.replace(`/architect/dashboard?view=${view}`, { scroll: false });
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReleaseModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [releaseModalOpen]);

  const pushActivity = useCallback((text: string, tone: ArchitectActivity["tone"]) => {
    setActivity((prev) => [
      { id: `act-${Date.now()}`, text, tone, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const handleRequestRelease = () => {
    if (!canRequestRelease) return;
    setReleaseModalOpen(true);
  };

  const [handleConfirmRelease, releaseLoading] = useAsyncAction(() => {
    if (!canRequestRelease) return;
    const amount = vault.pendingRelease;

    setVault((prev) => ({ ...prev, pendingRelease: 0 }));
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Release requested",
        body: `${formatNaira(amount)} submitted for release. Awaiting client approval.`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    pushActivity(`Release requested — ${formatNaira(amount)} (awaiting client approval)`, "info");

    setReleaseModalOpen(false);
    showToast("Release request submitted. Client approval may be required.");
  });

  const handleSendProposal = (request: DesignRequest, draft: ProposalDraft) => {
    const now = new Date().toISOString();
    const proposal: ArchitectProposal = {
      id: `pr-${Date.now()}`,
      projectTitle: draft.projectTitle,
      clientName: request.clientName,
      amount: draft.amount,
      sentAt: now,
      status: "pending",
    };

    setProposals((prev) => [proposal, ...prev]);
    setDesignRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: "responded" } : r)),
    );
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Proposal sent",
        body: `${formatNaira(draft.amount)} proposal sent to ${request.clientName}${
          draft.timelineWeeks > 0 ? ` · ${draft.timelineWeeks} week timeline` : ""
        }.`,
        read: false,
        createdAt: now,
      },
      ...prev,
    ]);
    pushActivity(`Proposal sent to ${request.clientName}`, "info");

    setProposalRequestId(null);
    showToast(`Proposal sent to ${request.clientName}.`);
  };

  const handleCreateProject = (draft: NewProjectDraft) => {
    const now = new Date().toISOString();
    const project: ArchitectProject = {
      id: `ap-${Date.now()}`,
      title: draft.title,
      clientName: draft.clientName,
      location: draft.location,
      contractValue: draft.contractValue,
      status: "draft",
      progress: 0,
      imageUrl: NEW_PROJECT_IMAGE,
      startedAt: now,
      milestones: createDraftMilestones(),
      nextMilestoneNote: "Confirm scope with the client and start the concept design.",
    };

    setProjects((prev) => [project, ...prev]);
    pushActivity(`New project created — ${draft.title}`, "neutral");

    setNewProjectOpen(false);
    showToast(`"${draft.title}" created as a draft.`);
    navigate("projects");
  };

  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;
    const report = buildArchitectReport(profile, vault, projects);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amana-architect-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Report downloaded.");
  };

  const verificationBanner = useMemo(() => {
    if (profile.verificationStatus === "pending") {
      return {
        tone: "info" as const,
        text: "Your architect credentials are under review. Some actions are limited until verification completes.",
      };
    }
    if (profile.verificationStatus === "rejected") {
      return {
        tone: "warning" as const,
        text: "Verification was declined. Update your credentials in onboarding or Settings to resubmit.",
      };
    }
    if (profile.bankStatus === "none") {
      return {
        tone: "info" as const,
        text: "Connect a payout bank account to receive vault releases.",
      };
    }
    return null;
  }, [profile.verificationStatus, profile.bankStatus]);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ArchitectDashboardHome
            activeDesign={activeDesign}
            vault={vault}
            activity={activity}
            designRequestCount={designRequestCount}
            proposalCount={proposals.length}
            activeDesignCount={activeDesignCount}
            onViewMilestones={() => navigate("active-designs")}
            onRequestRelease={handleRequestRelease}
            onNavigate={(v) => navigate(v as ArchitectDashboardView)}
            canRequestRelease={canRequestRelease}
            releaseBlockedReason={releaseBlockedReason}
          />
        );
      case "projects":
        return <ArchitectProjectsPanel projects={projects} />;
      case "active-designs":
        return <ArchitectProjectsPanel projects={projects} filter="active" />;
      case "design-requests":
        return (
          <ArchitectDesignRequestsPanel
            requests={designRequests}
            onRespond={(id) => setProposalRequestId(id)}
          />
        );
      case "proposals":
        return <ArchitectProposalsPanel proposals={proposals} />;
      case "vault":
        return (
          <ArchitectVaultPanel
            vault={vault}
            canRequestRelease={canRequestRelease}
            onRequestRelease={handleRequestRelease}
            releaseBlockedReason={releaseBlockedReason}
          />
        );
      case "documents":
        return <ArchitectDocumentsPanel />;
      case "reviews":
        return <ArchitectReviewsPanel />;
      default:
        return null;
    }
  };

  if (!profile.onboardingComplete) return null;

  return (
    <div className="ap-shell">
      <ArchitectPortalSidebar
        activeView={activeView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onNavigate={navigate}
        onOpenSettings={openProfileSettings}
        onOpenMessages={() => showToast("Messaging is coming soon.")}
        designRequestCount={designRequestCount}
        proposalCount={proposalCount}
        activeDesignCount={activeDesignCount}
        unreadMessages={0}
      />

      <div className="ap-main">
        {activeView !== "dashboard" && (
          <div className="ap-page-title-bar">
            <h1>{PAGE_TITLES[activeView]}</h1>
          </div>
        )}

        {activeView === "dashboard" && (
          <ArchitectPortalHeader
            onNewProject={() => setNewProjectOpen(true)}
            onDownloadReport={handleDownloadReport}
          />
        )}

        {verificationBanner && (
          <div className={`ap-banner ap-banner--${verificationBanner.tone}`}>
            <Warning size={18} weight="bold" />
            <p>{verificationBanner.text}</p>
            {profile.verificationStatus === "rejected" && (
              <button
                type="button"
                className="ap-banner-link"
                onClick={() => router.push("/architect/onboarding?resume=credentials")}
              >
                Resubmit
              </button>
            )}
          </div>
        )}

        <main className="ap-content">{renderView()}</main>
      </div>

      {toast && <div className="ap-toast">{toast}</div>}

      {releaseModalOpen && (
        <div className="ap-modal-backdrop" role="presentation" onClick={() => setReleaseModalOpen(false)}>
          <div
            className="ap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="ap-modal-close" onClick={() => setReleaseModalOpen(false)} aria-label="Close">
              <X size={20} weight="bold" />
            </button>
            <h2 id="release-title">Request Vault Release</h2>
            <p>
              Submit a release request for {formatNaira(vault.pendingRelease)} in pending milestone
              funds. The client may need to approve before funds are sent to your bank account.
            </p>
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn-outline" onClick={() => setReleaseModalOpen(false)}>
                Cancel
              </button>
              <Button
                type="button"
                className="ap-btn-primary"
                onClick={handleConfirmRelease}
                disabled={!canRequestRelease}
                loading={releaseLoading}
                loadingLabel="Submitting…"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      <ArchitectProposalModal
        request={designRequests.find((r) => r.id === proposalRequestId) ?? null}
        onClose={() => setProposalRequestId(null)}
        onSubmit={handleSendProposal}
      />

      <ArchitectNewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      <ArchitectSettingsModal open={settingsOpen} onClose={closeProfileSettings} />
    </div>
  );
}
