"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ShieldCheck, CaretRight } from "phosphor-react";
import ClientPortalSidebar from "./ClientPortalSidebar";
import { Button } from "@/app/components/ui/Button";
import ClientPortalHeader from "./ClientPortalHeader";
import ClientDashboardHome from "./ClientDashboardHome";
import ClientBuildTeamPanel from "./ClientBuildTeamPanel";
import ClientProjectsPanel from "./ClientProjectsPanel";
import ProfessionalMarketplace from "./ProfessionalMarketplace";
import ProfessionalProfileModal from "./ProfessionalProfileModal";
import ContractorProposals from "./ContractorProposals";
import ClientVaultPanel from "./ClientVaultPanel";
import ProjectUpdatesFeed from "./ProjectUpdatesFeed";
import DocumentCenter from "./DocumentCenter";
import ClientReviews from "./ClientReviews";
import ClientJobModals from "./ClientJobModals";
import ProjectBriefTrailModal from "./ProjectBriefTrailModal";
import StartProjectModal from "./StartProjectModal";
import MilestoneApprovalModal from "./MilestoneApprovalModal";
import RaiseDisputeModal from "../disputes/RaiseDisputeModal";
import DisputeWorkspaceModal from "../disputes/DisputeWorkspaceModal";
import { buildDispute } from "../disputes/constants";
import { useClientProfile } from "./ClientProfileProvider";
import { MOCK_ARCHITECTS, MOCK_CONTRACTORS, MOCK_RECOMMENDED_ARTISANS } from "./mock-data";
import {
  isOnBuildTeam,
  memberFromArchitect,
  memberFromArtisan,
  memberFromContractor,
  memberFromProposal,
} from "./build-team-utils";
import {
  formatNaira,
  calculateClientTotalDue,
  getJobsAwaitingFunding,
  isClientPendingTab,
} from "./utils";
import { getActiveProject } from "./portal-utils";
import { createProjectBriefTrail } from "./build-journey/submission-trail";
import type {
  Architect,
  BuildTeamRole,
  ClientDashboardView,
  ClientJobPrimaryAction,
  ClientNotification,
  ClientProject,
  ContractorProposal,
  MarketplaceContractor,
  ProfessionalProfileTarget,
  RecommendedArtisan,
  StartProjectSubmitPayload,
} from "./types";
import type {
  Dispute,
  DisputeDecider,
  DisputeOutcome,
  DisputeStatement,
  RaiseDisputeInput,
} from "../disputes/types";

const VALID_VIEWS: ClientDashboardView[] = [
  "dashboard",
  "projects",
  "team",
  "architects",
  "proposals",
  "vault",
  "payments",
  "approvals",
  "updates",
  "documents",
  "reviews",
];

const PAGE_TITLES: Record<ClientDashboardView, string> = {
  dashboard: "Dashboard",
  projects: "My Projects",
  team: "Build Team",
  architects: "Find Professionals",
  proposals: "Contractor Proposals",
  vault: "Vault",
  payments: "Payments",
  approvals: "Approvals",
  updates: "Project Updates",
  documents: "Documents",
  reviews: "Reviews",
};

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    setProfile,
    escrow,
    setEscrow,
    jobs: projects,
    setJobs: setProjects,
    setJobMessages,
    openChat,
    notifications,
    setNotifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
    proposals,
    setProposals,
    briefTrails,
    setBriefTrails,
    buildTeam,
    addToBuildTeam,
    removeFromBuildTeam,
  } = useClientProfile();

  const [activeView, setActiveView] = useState<ClientDashboardView>("dashboard");
  const [fundJobId, setFundJobId] = useState<string | null>(null);
  const [agreementJobId, setAgreementJobId] = useState<string | null>(null);
  const [proofJobId, setProofJobId] = useState<string | null>(null);
  const [releaseJobId, setReleaseJobId] = useState<string | null>(null);
  const [milestoneApprovalId, setMilestoneApprovalId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<{
    jobId: string;
    mode: "dispute" | "receipt";
  } | null>(null);
  const [raiseDisputeJobId, setRaiseDisputeJobId] = useState<string | null>(null);
  const [disputeWorkspaceJobId, setDisputeWorkspaceJobId] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState<ClientProject | null>(null);
  const [startProjectOpen, setStartProjectOpen] = useState(false);
  const [briefTrailProjectId, setBriefTrailProjectId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHydrated, setSidebarHydrated] = useState(false);
  const [highlightMemberId, setHighlightMemberId] = useState<string | null>(null);
  const [profileTarget, setProfileTarget] = useState<ProfessionalProfileTarget | null>(null);

  const activeProject = useMemo(() => {
    if (selectedProjectId) {
      return projects.find((p) => p.id === selectedProjectId) ?? getActiveProject(projects);
    }
    return getActiveProject(projects);
  }, [projects, selectedProjectId]);
  const awaitingFundingProjects = useMemo(
    () => getJobsAwaitingFunding(projects),
    [projects],
  );
  const priorityProjects = useMemo(
    () => projects.filter(isClientPendingTab),
    [projects],
  );

  const briefTrailProjectIds = useMemo(
    () => new Set(briefTrails.map((trail) => trail.projectId)),
    [briefTrails],
  );

  const activeBriefTrail = useMemo(
    () => briefTrails.find((trail) => trail.projectId === briefTrailProjectId) ?? null,
    [briefTrails, briefTrailProjectId],
  );

  const canFundJobs =
    profile.verificationStatus === "verified" &&
    profile.paymentMethodStatus === "verified" &&
    profile.profileComplete;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("amana-client-sidebar-collapsed");
      if (saved !== null) setSidebarCollapsed(saved === "true");
    } catch {
      /* use default */
    }
    setSidebarHydrated(true);
  }, []);

  useEffect(() => {
    if (!highlightMemberId || activeView !== "team") return;
    const timer = window.setTimeout(() => setHighlightMemberId(null), 2800);
    return () => window.clearTimeout(timer);
  }, [highlightMemberId, activeView]);

  const flashBuildTeamMember = useCallback((memberId: string) => {
    setHighlightMemberId(memberId);
  }, []);

  useEffect(() => {
    if (!sidebarHydrated) return;
    localStorage.setItem("amana-client-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarHydrated]);

  useEffect(() => {
    const view = searchParams.get("view") as ClientDashboardView | null;
    if (view && VALID_VIEWS.includes(view)) setActiveView(view);
  }, [searchParams]);

  useEffect(() => {
    if (window.location.hash !== "#profile") return;
    openProfileSettings("profile");
    window.history.replaceState(null, "", window.location.pathname);
  }, [openProfileSettings]);

  const navigate = useCallback(
    (view: ClientDashboardView, options?: { profession?: BuildTeamRole }) => {
      setActiveView(view);
      const params = new URLSearchParams({ view });
      if (options?.profession) params.set("profession", options.profession);
      router.replace(`/client/dashboard?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  const runProjectAction = useCallback(
    (action: ClientJobPrimaryAction, projectId: string) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) return;

      switch (action) {
        case "fund_escrow":
        case "review_agreement":
          if (project.sentByArtisan) setAgreementJobId(projectId);
          else setFundJobId(projectId);
          break;
        case "approve_proof":
          setProofJobId(projectId);
          break;
        case "approve_release":
        case "review_milestone":
          setMilestoneApprovalId(projectId);
          setReleaseJobId(projectId);
          break;
        case "view_dispute":
          setDisputeWorkspaceJobId(projectId);
          break;
        case "view_receipt":
          setDetailState({ jobId: projectId, mode: "receipt" });
          break;
        case "message_artisan":
          openChat(projectId);
          break;
        case "review_proposals":
          navigate("proposals");
          break;
        case "view_architect_proposal":
          navigate("architects");
          break;
        case "resend_invite":
          setStartProjectOpen(true);
          break;
        case "cancel_invite":
          setProjects((prev) =>
            prev.map((item) =>
              item.id === projectId
                ? { ...item, status: "cancelled", lastUpdated: new Date().toISOString() }
                : item,
            ),
          );
          break;
        default:
          break;
      }
    },
    [projects, openChat, setProjects, navigate],
  );

  useEffect(() => {
    const action = searchParams.get("action") as ClientJobPrimaryAction | null;
    const projectId = searchParams.get("job");
    if (!action || !projectId) return;
    runProjectAction(action, projectId);
    router.replace(`/client/dashboard?view=${activeView}`, { scroll: false });
  }, [searchParams, runProjectAction, router, activeView]);

  useEffect(() => {
    if (window.location.hash !== "#profile") return;
    openProfileSettings("profile");
    window.history.replaceState(null, "", window.location.pathname);
  }, [openProfileSettings]);

  const handleAlertAction = (alert: ClientNotification) => {
    markNotificationRead(alert.id);
    if (alert.dashboardView) {
      navigate(alert.dashboardView);
      return;
    }
    if (alert.actionType === "open_settings") {
      openProfileSettings(alert.settingsTab ?? "profile");
      return;
    }
    if (alert.actionType && alert.actionJobId) {
      runProjectAction(alert.actionType, alert.actionJobId);
      return;
    }
    if (alert.actionHref?.startsWith("#")) {
      document
        .querySelector(alert.actionHref)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleConfirmFund = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project || !canFundJobs) return;

    setFunding(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalDue = calculateClientTotalDue(project.amount, project.protectionFee);
    const now = new Date().toISOString();

    setProjects((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? {
              ...item,
              status: "funds_secured",
              lifecycleStage: item.lifecycleStage === "vault_setup" ? "construction" : item.lifecycleStage,
              fundedAt: now,
              lastUpdated: now,
            }
          : item,
      ),
    );

    setProfile((prev) => ({
      ...prev,
      projectsProtected: prev.projectsProtected + 1,
      jobsProtected: prev.jobsProtected + 1,
      totalVaultProtected: prev.totalVaultProtected + project.amount,
      totalEscrowed: prev.totalEscrowed + project.amount,
    }));

    setEscrow((prev) => ({
      ...prev,
      securedBalance: prev.securedBalance + project.amount,
      pendingFunding: Math.max(0, prev.pendingFunding - totalDue),
      transactions: [
        {
          id: `ctx-${Date.now()}`,
          type: "deposit",
          amount: totalDue,
          status: "completed",
          description: `Vault activated — ${project.title}`,
          date: now,
          jobId: projectId,
        },
        ...prev.transactions,
      ],
    }));

    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Vault activated",
        message: `${formatNaira(totalDue)} is now protected for ${project.title}.`,
        actionLabel: "View vault",
        dashboardView: "vault",
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    notifications
      .filter(
        (n) =>
          n.actionJobId === projectId &&
          (n.actionType === "review_agreement" || n.actionType === "fund_escrow"),
      )
      .forEach((n) => dismissNotification(n.id));

    setFunding(false);
    setFundingSuccess(project);
  };

  const handleApproveRelease = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project?.releaseRequestAmount) return;

    await new Promise((resolve) => setTimeout(resolve, 600));
    const amount = project.releaseRequestAmount;
    const now = new Date().toISOString();

    setProjects((prev) =>
      prev.map((item) => {
        if (item.id !== projectId) return item;
        const vaultMilestones = item.vaultMilestones?.map((m) =>
          m.status === "inspection"
            ? { ...m, status: "released" as const }
            : m.status === "active"
              ? { ...m, status: "active" as const }
              : m,
        );
        return {
          ...item,
          releaseRequestAmount: undefined,
          vaultMilestones,
          lastUpdated: now,
        };
      }),
    );

    setEscrow((prev) => ({
      ...prev,
      securedBalance: Math.max(0, prev.securedBalance - amount),
      pendingReleaseApproval: Math.max(0, prev.pendingReleaseApproval - amount),
      releasedTotal: prev.releasedTotal + amount,
      transactions: prev.transactions
        .map((tx) =>
          tx.jobId === projectId && tx.status === "awaiting_approval"
            ? { ...tx, status: "completed" as const, description: tx.description.replace("awaiting your approval", "released") }
            : tx,
        )
        .concat({
          id: `ctx-${Date.now()}`,
          type: "release",
          amount,
          status: "completed",
          description: `Milestone released — ${project.title}`,
          date: now,
          jobId: projectId,
        }),
    }));

    setMilestoneApprovalId(null);
    setReleaseJobId(null);
    notifications
      .filter((n) => n.actionJobId === projectId && n.actionType === "approve_release")
      .forEach((n) => dismissNotification(n.id));
  };

  const handleStartProject = async ({ startProject: form, brief }: StartProjectSubmitPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const now = new Date().toISOString();
    const projectId = `proj-${Date.now()}`;

    const lifecycleStage =
      form.startStage === "need_architect"
        ? "architect_selection"
        : form.startStage === "have_drawings"
          ? "contractor_bidding"
          : "vault_setup";

    const status =
      form.startStage === "have_contractor" ? "awaiting_funding" : "invitation_pending";

    const newProject: ClientProject = {
      id: projectId,
      title: form.projectName.trim(),
      buildingCategory: form.buildingCategory as ClientProject["buildingCategory"],
      buildingType: form.buildingType as ClientProject["buildingType"],
      location: `${form.address}, ${form.city}`,
      city: form.city,
      state: form.state,
      landStatus: form.landStatus as ClientProject["landStatus"],
      description: form.description.trim(),
      lifecycleStage,
      artisanName: "Pending selection",
      artisanVerified: false,
      amount: 0,
      status,
      priority: "normal",
      createdAt: now,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      sentByClient: true,
      lastUpdated: now,
    };

    setProjects((prev) => [newProject, ...prev]);

    setBriefTrails((prev) => [
      createProjectBriefTrail(projectId, form.projectName.trim(), brief, now),
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Project created",
        message: `"${form.projectName}" was created. ${
          form.startStage === "need_architect"
            ? "Browse architects to request a proposal."
            : form.startStage === "have_drawings"
              ? "Contractor bidding will open shortly."
              : "Set up your project vault when ready."
        }`,
        dashboardView:
          form.startStage === "need_architect"
            ? "architects"
            : form.startStage === "have_drawings"
              ? "proposals"
              : "vault",
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    if (form.startStage === "need_architect") navigate("architects");
    else if (form.startStage === "have_drawings") navigate("proposals");
    else navigate("projects");
  };

  const handleAcceptProposal = (proposal: ContractorProposal) => {
    const member = memberFromProposal(proposal);
    addToBuildTeam(member);
    flashBuildTeamMember(member.id);
    const now = new Date().toISOString();
    setProposals((prev) =>
      prev.map((p) => ({
        ...p,
        accepted: p.id === proposal.id,
      })),
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === proposal.projectId
          ? {
              ...p,
              contractorName: proposal.contractorName,
              contractorVerified: proposal.verified,
              artisanName: proposal.contractorName,
              artisanVerified: proposal.verified,
              amount: proposal.totalPrice,
              protectionFee: Math.round(proposal.totalPrice * 0.05),
              lifecycleStage: "vault_setup",
              status: "awaiting_funding",
              lastUpdated: now,
            }
          : p,
      ),
    );
    setEscrow((prev) => ({
      ...prev,
      pendingFunding: prev.pendingFunding + proposal.totalPrice,
    }));
    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Contractor selected",
        message: `${proposal.contractorName} was selected. Activate the project vault to begin construction.`,
        actionLabel: "Activate vault",
        actionType: "review_agreement",
        actionJobId: proposal.projectId,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
    navigate("vault");
  };

  const handleAddArchitectToTeam = (architect: Architect) => {
    const member = memberFromArchitect(architect);
    addToBuildTeam(member);
    flashBuildTeamMember(member.id);
    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Added to build team",
        message: `${architect.name} was added to your architect shortlist.`,
        dashboardView: "team",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const openProfessionalProfile = useCallback((target: ProfessionalProfileTarget) => {
    setProfileTarget(target);
  }, []);

  const handleAddContractorToTeam = (contractor: MarketplaceContractor) => {
    const member = memberFromContractor(contractor);
    addToBuildTeam(member);
    flashBuildTeamMember(member.id);
    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Added to build team",
        message: `${contractor.name} was added to your contractor shortlist.`,
        dashboardView: "team",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleRequestContractorQuote = () => {
    setStartProjectOpen(true);
  };

  const handleRequestArtisanJob = () => {
    setStartProjectOpen(true);
  };

  const handleAddProposalToTeam = (proposal: ContractorProposal) => {
    const member = memberFromProposal(proposal);
    addToBuildTeam(member);
    flashBuildTeamMember(member.id);
    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Added to build team",
        message: `${proposal.contractorName} was added to your contractor shortlist.`,
        dashboardView: "team",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleAddArtisanToTeam = (artisan: RecommendedArtisan) => {
    const member = memberFromArtisan(artisan);
    addToBuildTeam(member);
    flashBuildTeamMember(member.id);
    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Added to build team",
        message: `${artisan.fullName} was added to your artisan shortlist.`,
        dashboardView: "team",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleRequestArchitectProposal = (architect: Architect) => {
    handleAddArchitectToTeam(architect);
    setStartProjectOpen(true);
  };

  const profileIsOnTeam = useMemo(() => {
    if (!profileTarget) return false;
    if (profileTarget.role === "architect") {
      return isOnBuildTeam(buildTeam, "architect", profileTarget.professional.id);
    }
    if (profileTarget.role === "contractor") {
      return isOnBuildTeam(buildTeam, "contractor", profileTarget.professional.id);
    }
    return isOnBuildTeam(buildTeam, "artisan", profileTarget.professional.id);
  }, [profileTarget, buildTeam]);

  const handleProfileAddToTeam = useCallback(() => {
    if (!profileTarget) return;
    if (profileTarget.role === "architect") {
      handleAddArchitectToTeam(profileTarget.professional);
    } else if (profileTarget.role === "contractor") {
      handleAddContractorToTeam(profileTarget.professional);
    } else {
      handleAddArtisanToTeam(profileTarget.professional);
    }
  }, [profileTarget]);

  const handleProfilePrimaryAction = useCallback(() => {
    if (!profileTarget) return;
    if (profileTarget.role === "architect") {
      const architect = profileTarget.professional;
      setProfileTarget(null);
      handleRequestArchitectProposal(architect);
      return;
    }
    if (profileTarget.role === "contractor") {
      setProfileTarget(null);
      setStartProjectOpen(true);
      return;
    }
    setProfileTarget(null);
    setStartProjectOpen(true);
  }, [profileTarget]);

  const profilePrimaryLabel = useMemo(() => {
    if (!profileTarget) return undefined;
    if (profileTarget.role === "architect") return "Request proposal";
    if (profileTarget.role === "contractor") return "Request quote";
    return "Request for a job";
  }, [profileTarget]);

  const patchDispute = (
    projectId: string,
    updater: (dispute: Dispute) => Dispute,
    extra?: (project: ClientProject) => Partial<ClientProject>,
  ) => {
    setProjects((prev) =>
      prev.map((item) => {
        if (item.id !== projectId || !item.dispute) return item;
        return {
          ...item,
          dispute: updater(item.dispute),
          lastUpdated: new Date().toISOString(),
          ...(extra ? extra(item) : {}),
        };
      }),
    );
  };

  const handleRaiseDispute = (projectId: string, input: RaiseDisputeInput) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const now = new Date().toISOString();
    const dispute = buildDispute("client", input, project.amount, now);

    setProjects((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? {
              ...item,
              status: "disputed",
              disputeReason: `You raised a concern — waiting for ${project.artisanName} to respond.`,
              dispute,
              lastUpdated: now,
            }
          : item,
      ),
    );

    setRaiseDisputeJobId(null);
    setMilestoneApprovalId(null);
    setDisputeWorkspaceJobId(projectId);
  };

  const handleDisputeResponse = (
    projectId: string,
    text: string,
    evidenceLabels: string[],
  ) => {
    const now = new Date().toISOString();
    patchDispute(projectId, (d) => ({
      ...d,
      statements: text
        ? [...d.statements, { id: `dsp-st-${Date.now()}`, party: "client", text, createdAt: now }]
        : d.statements,
      evidence: [
        ...d.evidence,
        ...evidenceLabels.map((label, i) => ({
          id: `dsp-ev-${Date.now()}-${i}`,
          party: "client" as const,
          label,
          kind: "photo" as const,
          uploadedAt: now,
        })),
      ],
      updatedAt: now,
    }));
  };

  const settleDispute = (
    projectId: string,
    outcome: DisputeOutcome,
    decidedBy: DisputeDecider,
    note?: string,
  ) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project?.dispute) return;
    const amount = project.dispute.amount;
    const now = new Date().toISOString();

    let artisanAmount = 0;
    let clientAmount = 0;
    let nextStatus: ClientProject["status"] = "disputed";

    switch (outcome) {
      case "refund_client":
        clientAmount = amount;
        nextStatus = "cancelled";
        break;
      case "release_artisan":
        artisanAmount = amount;
        nextStatus = "released";
        break;
      case "split":
        artisanAmount = Math.round(amount / 2);
        clientAmount = amount - artisanAmount;
        nextStatus = "released";
        break;
      case "withdrawn":
        nextStatus = "funds_secured";
        break;
    }

    patchDispute(
      projectId,
      (d) => ({
        ...d,
        stage: "resolved",
        resolution: {
          outcome,
          decidedBy,
          clientAmount,
          artisanAmount,
          note,
          decidedAt: now,
        },
        updatedAt: now,
      }),
      () => ({
        status: nextStatus,
        disputeReason:
          outcome === "withdrawn"
            ? undefined
            : `Concern resolved — ${outcome === "refund_client" ? "refunded to you" : outcome === "release_artisan" ? "released to contractor" : "split"}.`,
      }),
    );
  };

  const fundProject = projects.find((p) => p.id === fundJobId) ?? null;
  const agreementProject = projects.find((p) => p.id === agreementJobId) ?? null;
  const proofProject = projects.find((p) => p.id === proofJobId) ?? null;
  const releaseProject = projects.find((p) => p.id === releaseJobId) ?? null;
  const milestoneProject = projects.find((p) => p.id === milestoneApprovalId) ?? null;
  const raiseDisputeProject = projects.find((p) => p.id === raiseDisputeJobId) ?? null;
  const workspaceProject = projects.find((p) => p.id === disputeWorkspaceJobId) ?? null;
  const disputeView =
    workspaceProject?.dispute
      ? {
          id: workspaceProject.id,
          title: workspaceProject.title,
          amount: workspaceProject.amount,
          counterpartyName: workspaceProject.artisanName,
          dispute: workspaceProject.dispute,
        }
      : null;
  const unreadAlerts = notifications.filter((item) => !item.read);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ClientDashboardHome
            activeProject={activeProject}
            escrow={escrow}
            updates={[]}
            alerts={unreadAlerts}
            onAlertAction={handleAlertAction}
            onNavigate={(view) => navigate(view as ClientDashboardView)}
            onOpenChat={openChat}
          />
        );
      case "projects":
        return (
          <ClientProjectsPanel
            projects={projects}
            canFundJobs={canFundJobs}
            briefTrailProjectIds={briefTrailProjectIds}
            onPrimaryAction={(project, action) => runProjectAction(action, project.id)}
            onMessage={(project) => openChat(project.id)}
            onRaiseConcern={(project) => setRaiseDisputeJobId(project.id)}
            onStartProject={() => setStartProjectOpen(true)}
            onViewBrief={(project) => setBriefTrailProjectId(project.id)}
          />
        );
      case "team":
        return (
          <ClientBuildTeamPanel
            projects={projects}
            shortlisted={buildTeam}
            highlightMemberId={highlightMemberId}
            onRemove={removeFromBuildTeam}
            onFindArchitects={() => navigate("architects", { profession: "architect" })}
            onFindContractors={() => navigate("architects", { profession: "contractor" })}
            onFindArtisans={() => navigate("architects", { profession: "artisan" })}
          />
        );
      case "architects": {
        const professionParam = searchParams.get("profession");
        const initialRole =
          professionParam === "architect" ||
          professionParam === "contractor" ||
          professionParam === "artisan"
            ? professionParam
            : "all";

        return (
          <ProfessionalMarketplace
            architects={MOCK_ARCHITECTS}
            contractors={MOCK_CONTRACTORS}
            artisans={MOCK_RECOMMENDED_ARTISANS}
            clientAreaLabel={profile.areaLabel || "your area"}
            initialRole={initialRole}
            hasProjectBids={proposals.length > 0}
            onRequestArchitectProposal={handleRequestArchitectProposal}
            onViewArchitect={(architect) =>
              openProfessionalProfile({ role: "architect", professional: architect })
            }
            onAddArchitect={handleAddArchitectToTeam}
            onAddContractor={handleAddContractorToTeam}
            onViewContractor={(contractor) =>
              openProfessionalProfile({ role: "contractor", professional: contractor })
            }
            onRequestContractorQuote={handleRequestContractorQuote}
            onAddArtisan={handleAddArtisanToTeam}
            onViewArtisan={(artisan) =>
              openProfessionalProfile({ role: "artisan", professional: artisan })
            }
            onRequestArtisanJob={handleRequestArtisanJob}
            onCreateJob={() => setStartProjectOpen(true)}
            onViewProposals={() => navigate("proposals")}
            isArchitectOnTeam={(id) => isOnBuildTeam(buildTeam, "architect", id)}
            isContractorOnTeam={(id) => isOnBuildTeam(buildTeam, "contractor", id)}
            isArtisanOnTeam={(id) => isOnBuildTeam(buildTeam, "artisan", id)}
          />
        );
      }
      case "proposals":
        return (
          <ContractorProposals
            projects={projects}
            proposals={proposals}
            onAcceptProposal={handleAcceptProposal}
            onAddToTeam={handleAddProposalToTeam}
            isOnTeam={(id) => isOnBuildTeam(buildTeam, "contractor", id)}
          />
        );
      case "vault":
      case "payments":
        return (
          <ClientVaultPanel
            escrow={escrow}
            profile={profile}
            projects={projects}
            awaitingFundingProjects={awaitingFundingProjects}
            canFundJobs={canFundJobs}
            onFundProject={(project) => {
              setFundingSuccess(null);
              if (project.sentByArtisan) setAgreementJobId(project.id);
              else setFundJobId(project.id);
            }}
            onOpenPaymentSettings={() => openProfileSettings("payment")}
            onApproveMilestone={(project) => setMilestoneApprovalId(project.id)}
          />
        );
      case "approvals":
        return (
          <ClientProjectsPanel
            projects={priorityProjects}
            canFundJobs={canFundJobs}
            briefTrailProjectIds={briefTrailProjectIds}
            onPrimaryAction={(project, action) => runProjectAction(action, project.id)}
            onMessage={(project) => openChat(project.id)}
            onRaiseConcern={(project) => setRaiseDisputeJobId(project.id)}
            onStartProject={() => setStartProjectOpen(true)}
            onViewBrief={(project) => setBriefTrailProjectId(project.id)}
          />
        );
      case "updates":
        return <ProjectUpdatesFeed updates={[]} />;
      case "documents":
        return <DocumentCenter documents={[]} />;
      case "reviews":
        return <ClientReviews reviews={[]} />;
      default:
        return null;
    }
  };

  return (
    <div className={`cp-shell${sidebarCollapsed ? " cp-shell--sidebar-collapsed" : ""}`}>
      <ClientPortalSidebar
        activeView={activeView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={navigate}
        onStartProject={() => setStartProjectOpen(true)}
        onOpenMessages={() => openChat(activeProject?.id ?? projects[0]?.id ?? "")}
        onOpenSettings={() => openProfileSettings("profile")}
        approvalCount={priorityProjects.length}
      />

      <div className="cp-main">
        {activeView === "dashboard" ? (
          <ClientPortalHeader
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onNotificationAction={handleAlertAction}
            onStartProject={() => setStartProjectOpen(true)}
          />
        ) : (
          <header
            className={`cp-subpage-header cp-subpage-header--bar${projects.length === 0 ? " cp-subpage-header--with-actions" : ""}`}
          >
            <h1>{PAGE_TITLES[activeView]}</h1>
            {projects.length === 0 && (
              <Button
                type="button"
                className="adash-btn adash-btn--primary cp-subpage-create-build"
                onClick={() => setStartProjectOpen(true)}
              >
                <Plus size={18} weight="bold" />
                Create New Build
              </Button>
            )}
          </header>
        )}

        <div className="cp-content">{renderView()}</div>

        <footer className="cp-footer">
          <div className="cp-footer-left">
            <ShieldCheck size={18} weight="fill" />
            <p>
              Your money is held by our CBN-licensed partner. Amana is a technology
              platform, not a bank.
            </p>
          </div>
          <button type="button" className="cp-footer-link">
            Learn more
            <CaretRight size={14} weight="bold" />
          </button>
        </footer>
      </div>

      <ClientJobModals
        fundJob={fundProject}
        agreementJob={agreementProject}
        proofJob={proofProject}
        releaseJob={releaseProject}
        detailJob={
          detailState ? (projects.find((p) => p.id === detailState.jobId) ?? null) : null
        }
        detailMode={detailState?.mode ?? null}
        escrow={escrow}
        canFundJobs={canFundJobs}
        funding={funding}
        fundingSuccess={fundingSuccess}
        onCloseFund={() => {
          setFundingSuccess(null);
          setFundJobId(null);
        }}
        onCloseAgreement={() => {
          setFundingSuccess(null);
          setAgreementJobId(null);
        }}
        onCloseProof={() => setProofJobId(null)}
        onCloseRelease={() => setReleaseJobId(null)}
        onCloseDetail={() => setDetailState(null)}
        onConfirmFund={handleConfirmFund}
        onApproveProof={() => {}}
        onDisputeProof={(id) => {
          setProofJobId(null);
          setRaiseDisputeJobId(id);
        }}
        onApproveRelease={handleApproveRelease}
        onOpenPaymentSettings={() => openProfileSettings("payment")}
      />

      <MilestoneApprovalModal
        project={milestoneProject}
        open={milestoneApprovalId !== null}
        onClose={() => setMilestoneApprovalId(null)}
        onApprove={handleApproveRelease}
        onRequestInfo={(id) => openChat(id)}
        onRaiseConcern={(id) => {
          setMilestoneApprovalId(null);
          setRaiseDisputeJobId(id);
        }}
      />

      <ProfessionalProfileModal
        target={profileTarget}
        isOnTeam={profileIsOnTeam}
        onClose={() => setProfileTarget(null)}
        onAddToTeam={handleProfileAddToTeam}
        onPrimaryAction={handleProfilePrimaryAction}
        primaryLabel={profilePrimaryLabel}
      />

      <StartProjectModal
        open={startProjectOpen}
        onClose={() => setStartProjectOpen(false)}
        onSubmit={handleStartProject}
      />

      <ProjectBriefTrailModal
        trail={activeBriefTrail}
        onClose={() => setBriefTrailProjectId(null)}
      />

      <RaiseDisputeModal
        key={`raise-${raiseDisputeProject?.id ?? "none"}`}
        open={raiseDisputeProject !== null}
        perspective="client"
        job={
          raiseDisputeProject
            ? {
                id: raiseDisputeProject.id,
                title: raiseDisputeProject.title,
                amount: raiseDisputeProject.amount,
                counterpartyName: raiseDisputeProject.artisanName,
              }
            : null
        }
        formatAmount={formatNaira}
        onClose={() => setRaiseDisputeJobId(null)}
        onSubmit={handleRaiseDispute}
      />

      <DisputeWorkspaceModal
        key={`ws-${disputeView?.id ?? "none"}`}
        open={disputeView !== null}
        perspective="client"
        view={disputeView}
        formatAmount={formatNaira}
        onClose={() => setDisputeWorkspaceJobId(null)}
        onAddResponse={handleDisputeResponse}
        onAcceptOutcome={(id, outcome) => settleDispute(id, outcome, "client")}
        onWithdraw={(id) => settleDispute(id, "withdrawn", "client")}
        onEscalate={() => {}}
      />

      {activeView !== "dashboard" && (
        <button
          type="button"
          className="adash-fab cp-fab-hidden"
          onClick={() => setStartProjectOpen(true)}
          aria-label="Start a project"
        >
          <Plus size={20} weight="bold" />
          Start Project
        </button>
      )}
    </div>
  );
}
