"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Warning } from "phosphor-react";
import ArchitectPortalSidebar from "./ArchitectPortalSidebar";
import ArchitectPortalHeader, {
  type AddProjectMode,
  type SearchHit,
} from "./ArchitectPortalHeader";
import ArchitectDashboardHome from "./ArchitectDashboardHome";
import ArchitectProjectDetail from "./ArchitectProjectDetail";
import ArchitectBriefModal from "./ArchitectBriefModal";
import ArchitectProposalModal, { type ProposalDraft } from "./ArchitectProposalModal";
import ArchitectAgreementModal, { type AgreementResult } from "./ArchitectAgreementModal";
import ArchitectDeliverableModal from "./ArchitectDeliverableModal";
import ArchitectRevisionModal, {
  type RevisionResponsePayload,
} from "./ArchitectRevisionModal";
import ArchitectSettingsModal from "./ArchitectSettingsModal";
import {
  ArchitectAddProjectModal,
  ArchitectConversationSummaryModal,
  ArchitectQuestionModal,
  ArchitectWithdrawModal,
  type AddProjectDraft,
  type ConversationSummaryDraft,
} from "./ArchitectSmallModals";
import {
  ArchitectAgreementsPanel,
  ArchitectMessagesPanel,
  ArchitectOpportunitiesPanel,
  ArchitectPaymentsPanel,
  ArchitectPortfolioPanel,
  ArchitectProfilePanel,
  ArchitectProjectsPanel,
  ArchitectProposalsPanel,
  ArchitectTeamPanel,
} from "./ArchitectPanels";
import { useArchitectProfile } from "./ArchitectProfileProvider";
import { MOCK_PORTFOLIO } from "./mock-data";
import { DESIGN_ONLY_EXCLUSIONS } from "./constants";
import {
  buildArchitectReport,
  createStarterDeliverables,
  getWithdrawalBlockReason,
  resolveProposalStatus,
} from "./portal-utils";
import { formatNaira, isoInDays } from "./utils";
import type {
  AgreementStepId,
  ArchitectDashboardView,
  ArchitectNotification,
  ArchitectProject,
  ArchitectProjectTab,
  ArchitectProposal,
  Deliverable,
  DeliverableFile,
  DesignOpportunity,
  DesignPhase,
  PriorityItem,
  ProjectMessage,
  RevisionRequest,
} from "./types";
import "./architect-dashboard.css";

const VALID_VIEWS: ArchitectDashboardView[] = [
  "dashboard",
  "opportunities",
  "projects",
  "proposals",
  "agreements",
  "payments",
  "messages",
  "portfolio",
  "team",
  "profile",
];

const PAGE_META: Record<ArchitectDashboardView, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Here is what needs you today.",
  },
  opportunities: { title: "Opportunities", subtitle: "New client briefs from the marketplace." },
  projects: { title: "Projects", subtitle: "Every appointment and what happens next." },
  proposals: { title: "Proposals", subtitle: "Bids you have submitted and their status." },
  agreements: { title: "Agreements", subtitle: "Client–architect appointments and their terms." },
  payments: { title: "Payments", subtitle: "Funded, earned, awaiting approval and paid." },
  messages: { title: "Messages", subtitle: "Client conversations grouped by project." },
  portfolio: { title: "Portfolio", subtitle: "Work shown to clients on Amana." },
  team: { title: "Team", subtitle: "Studio members and their assignments." },
  profile: { title: "Profile", subtitle: "How your studio appears to clients." },
  "project-detail": { title: "Project", subtitle: "" },
};

const NEW_PROJECT_IMAGE = "/assets/duplex-suplex.jpeg";

/** After a deliverable is submitted, the project moves into the matching review phase. */
const REVIEW_PHASE_FOR: Partial<Record<DesignPhase, DesignPhase>> = {
  concept_design: "client_concept_review",
  concept_revision: "client_concept_review",
  developed_design: "client_developed_review",
  construction_drawings: "final_client_review",
};

export default function ArchitectDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    projects,
    setProjects,
    opportunities,
    setOpportunities,
    proposals,
    setProposals,
    messages,
    setMessages,
    team,
    setNotifications,
    priorities,
    summary,
    financials,
    pushActivity,
    settingsOpen,
    closeProfileSettings,
    openProfileSettings,
  } = useArchitectProfile();

  /* ---------------------------------------------------------------- *
   * Shell state
   * ---------------------------------------------------------------- */
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArchitectProjectTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHydrated, setSidebarHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  /* ---------------------------------------------------------------- *
   * Modal state
   * ---------------------------------------------------------------- */
  const [briefTarget, setBriefTarget] = useState<
    { opportunity: DesignOpportunity } | { project: ArchitectProject } | null
  >(null);
  const [proposalOpportunity, setProposalOpportunity] = useState<DesignOpportunity | null>(null);
  const [proposalExisting, setProposalExisting] = useState<ArchitectProposal | null>(null);
  const [agreementProjectId, setAgreementProjectId] = useState<string | null>(null);
  const [deliverableTarget, setDeliverableTarget] = useState<{
    projectId: string;
    deliverableId: string;
  } | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<{
    projectId: string;
    revisionId: string;
  } | null>(null);
  const [addProjectMode, setAddProjectMode] = useState<AddProjectMode | null>(null);
  const [summaryProjectId, setSummaryProjectId] = useState<string | null>(null);
  const [questionSubject, setQuestionSubject] = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  /**
   * The view is derived from the URL rather than mirrored into state, so browser
   * back/forward works and there is no effect keeping two sources in sync.
   * Opening a project is the one client-side override.
   */
  const urlView = useMemo(() => {
    const view = searchParams.get("view") as ArchitectDashboardView | null;
    return view && VALID_VIEWS.includes(view) ? view : "dashboard";
  }, [searchParams]);
  const activeView: ArchitectDashboardView = activeProjectId ? "project-detail" : urlView;

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  const withdrawBlockedReason = useMemo(
    () => getWithdrawalBlockReason(profile, financials),
    [profile, financials],
  );

  /* ---------------------------------------------------------------- *
   * Boot & persistence
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!profile.onboardingComplete) router.replace("/architect/onboarding");
  }, [profile.onboardingComplete, router]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       Reading localStorage during render would desync the server-rendered markup,
       so the stored preference is applied after hydration. */
    try {
      const saved = localStorage.getItem("amana-architect-sidebar-collapsed");
      if (saved !== null) setSidebarCollapsed(saved === "true");
    } catch {
      /* default */
    }
    setSidebarHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!sidebarHydrated) return;
    localStorage.setItem("amana-architect-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarHydrated]);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3600);
  }, []);

  const navigate = useCallback(
    (view: ArchitectDashboardView) => {
      setActiveProjectId(null);
      setMobileNavOpen(false);
      router.replace(`/architect/dashboard?view=${view}`, { scroll: false });
    },
    [router],
  );

  const openProject = useCallback(
    (projectId: string, tab: ArchitectProjectTab = "overview") => {
      setActiveProjectId(projectId);
      setActiveTab(tab);
      setMobileNavOpen(false);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [],
  );

  const notify = useCallback(
    (notification: Omit<ArchitectNotification, "id" | "createdAt" | "read">) => {
      setNotifications((prev) => [
        { ...notification, id: `n-${Date.now()}`, read: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    },
    [setNotifications],
  );

  /* ---------------------------------------------------------------- *
   * Project mutation helper
   * ---------------------------------------------------------------- */
  const updateProject = useCallback(
    (projectId: string, updater: (project: ArchitectProject) => ArchitectProject) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...updater(project), lastUpdated: new Date().toISOString() }
            : project,
        ),
      );
    },
    [setProjects],
  );

  /* ---------------------------------------------------------------- *
   * Opportunities
   * ---------------------------------------------------------------- */
  const handleSaveOpportunity = (opportunity: DesignOpportunity) => {
    const saving = opportunity.status !== "saved";
    setOpportunities((prev) =>
      prev.map((item) =>
        item.id === opportunity.id ? { ...item, status: saving ? "saved" : "open" } : item,
      ),
    );
    showToast(saving ? "Opportunity saved." : "Removed from saved.");
  };

  const handleDeclineOpportunity = (opportunity: DesignOpportunity) => {
    setOpportunities((prev) =>
      prev.map((item) => (item.id === opportunity.id ? { ...item, status: "declined" } : item)),
    );
    pushActivity(`Declined ${opportunity.projectName}`, "neutral");
    showToast(`${opportunity.projectName} declined.`);
  };

  const handleSubmitProposal = (draft: ProposalDraft, opportunity: DesignOpportunity | null) => {
    const now = new Date().toISOString();

    if (proposalExisting) {
      setProposals((prev) =>
        prev.map((item) =>
          item.id === proposalExisting.id
            ? {
                ...item,
                ...draft,
                submittedAt: draft.saveAsDraft ? item.submittedAt : now,
                status: draft.saveAsDraft ? "draft" : "submitted",
                clientNote: undefined,
              }
            : item,
        ),
      );
      pushActivity(`Revised proposal sent for ${draft.projectTitle}`, "info");
      showToast(draft.saveAsDraft ? "Draft saved." : "Revised proposal sent.");
    } else {
      const proposal: ArchitectProposal = {
        id: `prop-${Date.now()}`,
        opportunityId: opportunity?.id ?? null,
        projectTitle: draft.projectTitle,
        clientName: opportunity?.clientName ?? "Client",
        designFee: draft.designFee,
        timelineWeeks: draft.timelineWeeks,
        deliverables: draft.deliverables,
        revisionsIncluded: draft.revisionsIncluded,
        renders3d: draft.renders3d,
        fileFormats: draft.fileFormats,
        planningApprovalAssistance: draft.planningApprovalAssistance,
        consultantCoordination: draft.consultantCoordination,
        optionalServices: draft.optionalServices,
        exclusions: draft.exclusions,
        assumptions: draft.assumptions,
        validityDays: draft.validityDays,
        submittedAt: now,
        status: draft.saveAsDraft ? "draft" : "submitted",
      };
      setProposals((prev) => [proposal, ...prev]);

      if (opportunity && !draft.saveAsDraft) {
        setOpportunities((prev) =>
          prev.map((item) =>
            item.id === opportunity.id
              ? { ...item, status: "bid_submitted", architectsBidding: item.architectsBidding + 1 }
              : item,
          ),
        );
      }

      pushActivity(
        draft.saveAsDraft
          ? `Proposal draft saved for ${draft.projectTitle}`
          : `Proposal submitted for ${draft.projectTitle}`,
        "info",
      );
      showToast(
        draft.saveAsDraft
          ? "Proposal saved as a draft."
          : `${formatNaira(draft.designFee)} proposal submitted.`,
      );
    }

    setProposalOpportunity(null);
    setProposalExisting(null);
  };

  /* ---------------------------------------------------------------- *
   * Agreement
   * ---------------------------------------------------------------- */
  const handleSaveAgreement = (project: ArchitectProject, result: AgreementResult) => {
    updateProject(project.id, (current) => {
      if (!current.agreement) return current;
      const differences = current.agreement.differences.map((difference) => ({
        ...difference,
        resolution: result.resolutions[difference.id]?.trim() || difference.resolution,
      }));

      return {
        ...current,
        phase: result.signed ? "agreement_signed" : current.phase,
        status: result.signed ? "waiting_for_architect" : current.status,
        responsibleParty: "architect",
        nextAction: result.signed
          ? "Start the concept design"
          : "Finish preparing the agreement",
        includedRevisions: result.includedRevisions,
        clientReviewPeriodDays: result.clientReviewPeriodDays,
        finalDecisionMaker: result.finalDecisionMaker,
        dueDate: result.signed ? isoInDays(14) : current.dueDate,
        agreement: {
          ...current.agreement,
          status: result.signed ? "signed" : "in_preparation",
          confirmedSteps: result.confirmedSteps as AgreementStepId[],
          differences,
          includedRevisions: result.includedRevisions,
          designTimelineWeeks: result.designTimelineWeeks,
          clientReviewPeriodDays: result.clientReviewPeriodDays,
          finalDecisionMaker: result.finalDecisionMaker,
          signedAt: result.signed ? new Date().toISOString() : current.agreement.signedAt,
        },
        deliverables: result.signed
          ? current.deliverables.map((deliverable) =>
              deliverable.status === "locked" &&
              deliverable.lockedReason === "Requires a signed agreement"
                ? {
                    ...deliverable,
                    status: "not_started",
                    lockedReason: undefined,
                    dueDate: deliverable.dueDate ?? isoInDays(7),
                    clientStatus: "not_submitted",
                  }
                : deliverable,
            )
          : current.deliverables,
      };
    });

    if (result.signed) {
      pushActivity(`Agreement signed — ${project.title}`, "success");
      notify({
        type: "agreement_ready",
        title: "Agreement signed",
        body: `${project.title} is now a live design-only appointment.`,
        targetView: "project-detail",
        targetProjectId: project.id,
        targetTab: "agreement",
      });
      showToast("Agreement signed. The client has been notified.");
    } else {
      showToast("Agreement progress saved.");
    }
    setAgreementProjectId(null);
  };

  /* ---------------------------------------------------------------- *
   * Deliverables
   * ---------------------------------------------------------------- */
  const handleSubmitDeliverable = (
    project: ArchitectProject,
    deliverable: Deliverable,
    files: DeliverableFile[],
    note: string,
  ) => {
    const now = new Date().toISOString();
    const reviewDue = isoInDays(project.clientReviewPeriodDays);

    updateProject(project.id, (current) => ({
      ...current,
      phase: REVIEW_PHASE_FOR[deliverable.phase] ?? current.phase,
      status: "client_review_in_progress",
      responsibleParty: "client",
      nextAction: `Waiting for the client to review ${deliverable.name.toLowerCase()}`,
      dueDate: reviewDue,
      waitingOnClientSince: now,
      deliverables: current.deliverables.map((item) =>
        item.id === deliverable.id
          ? {
              ...item,
              status: "awaiting_client_review",
              clientStatus: "pending",
              files: [...item.files, ...files],
              submittedAt: now,
            }
          : item,
      ),
      approvals: current.approvals.map((approval) =>
        approval.status === "not_submitted" &&
        (approval.stage === "concept_design" || approval.stage === "developed_design")
          ? { ...approval, status: "submitted_for_review", submittedAt: now, dueDate: reviewDue }
          : approval,
      ),
      payments: current.payments.map((milestone) =>
        milestone.status === "work_in_progress"
          ? { ...milestone, status: "deliverable_submitted" }
          : milestone,
      ),
    }));

    if (note) {
      setMessages((prev) => [
        {
          id: `msg-${Date.now()}`,
          projectId: project.id,
          type: "deliverable",
          author: profile.studioName,
          authorRole: "architect",
          body: note,
          createdAt: now,
          read: true,
        },
        ...prev,
      ]);
    }

    pushActivity(`${deliverable.name} submitted — ${project.title}`, "success");
    setDeliverableTarget(null);
    showToast(`${deliverable.name} submitted for client review.`);
  };

  /* ---------------------------------------------------------------- *
   * Revisions
   * ---------------------------------------------------------------- */
  const handleSubmitRevision = (
    project: ArchitectProject,
    revision: RevisionRequest,
    responses: RevisionResponsePayload,
  ) => {
    const now = new Date().toISOString();
    const accepted = Object.values(responses).filter(
      (entry) => entry.response === "accepted",
    ).length;
    const feeRequired = Object.values(responses).some(
      (entry) => entry.response === "additional_fee",
    );

    updateProject(project.id, (current) => ({
      ...current,
      status: accepted > 0 ? "deliverable_due" : "waiting_for_client",
      responsibleParty: accepted > 0 ? "architect" : "client",
      nextAction:
        accepted > 0
          ? `Upload the revised ${revision.deliverableName.toLowerCase()}`
          : "Waiting for the client to respond to your assessment",
      dueDate: accepted > 0 ? isoInDays(5) : current.dueDate,
      revisions: current.revisions.map((item) =>
        item.id === revision.id
          ? {
              ...item,
              status: "responded",
              comments: item.comments.map((comment) => {
                const entry = responses[comment.id];
                return entry
                  ? { ...comment, response: entry.response, responseNote: entry.note }
                  : comment;
              }),
            }
          : item,
      ),
      deliverables: current.deliverables.map((item) =>
        item.id === revision.deliverableId && accepted > 0
          ? { ...item, status: "in_progress", dueDate: item.dueDate ?? isoInDays(5) }
          : item,
      ),
    }));

    setMessages((prev) => [
      {
        id: `msg-${Date.now()}`,
        projectId: project.id,
        type: "revision",
        author: profile.studioName,
        authorRole: "architect",
        body: `Responses sent for ${revision.comments.length} comments on ${revision.deliverableName}.${
          feeRequired ? " One or more items require an additional fee." : ""
        }`,
        createdAt: now,
        read: true,
      },
      ...prev,
    ]);

    pushActivity(
      `Responded to client comments on ${revision.deliverableName} — ${project.title}`,
      feeRequired ? "warning" : "info",
    );
    setRevisionTarget(null);
    showToast("Responses sent to the client.");
  };

  /* ---------------------------------------------------------------- *
   * Payments
   * ---------------------------------------------------------------- */
  const handleWithdraw = () => {
    if (withdrawBlockedReason) {
      showToast(withdrawBlockedReason);
      return;
    }
    const amount = financials.availableForWithdrawal;

    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        payments: project.payments.map((milestone) =>
          milestone.status === "available_for_withdrawal"
            ? { ...milestone, status: "paid", paidAt: new Date().toISOString() }
            : milestone,
        ),
      })),
    );

    notify({
      type: "payment_available",
      title: "Withdrawal submitted",
      body: `${formatNaira(amount)} is on its way to your payout account.`,
      targetView: "payments",
    });
    pushActivity(`Withdrew ${formatNaira(amount)} from the vault`, "success");
    setWithdrawOpen(false);
    showToast(`${formatNaira(amount)} sent to your payout account.`);
  };

  /* ---------------------------------------------------------------- *
   * Reminders, summaries, messages
   * ---------------------------------------------------------------- */
  const handleSendReminder = (projectId: string, subject: string) => {
    const project = projects.find((item) => item.id === projectId);
    setMessages((prev) => [
      {
        id: `msg-${Date.now()}`,
        projectId,
        type: "deliverable",
        author: profile.studioName,
        authorRole: "architect",
        body: `Reminder: ${subject} is waiting for your review.`,
        createdAt: new Date().toISOString(),
        read: true,
      },
      ...prev,
    ]);
    pushActivity(`Reminder sent — ${subject} (${project?.title ?? "project"})`, "info");
    showToast("Reminder sent to the client.");
  };

  const handleAddConversationSummary = (draft: ConversationSummaryDraft) => {
    if (!summaryProjectId) return;
    updateProject(summaryProjectId, (current) => ({
      ...current,
      conversationSummaries: [
        {
          id: `cs-${Date.now()}`,
          projectId: current.id,
          date: draft.date,
          participants: draft.participants,
          discussion: draft.discussion,
          decision: draft.decision,
          requiredAction: draft.requiredAction,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        ...current.conversationSummaries,
      ],
    }));
    pushActivity("Conversation summary sent for client confirmation", "info");
    setSummaryProjectId(null);
    showToast("Summary sent. The client can confirm, dispute or clarify it.");
  };

  const handleSendMessage = (projectId: string, body: string, type: ProjectMessage["type"]) => {
    setMessages((prev) => [
      {
        id: `msg-${Date.now()}`,
        projectId,
        type,
        author: profile.studioName,
        authorRole: "architect",
        body,
        createdAt: new Date().toISOString(),
        read: true,
      },
      ...prev,
    ]);
    showToast("Message sent.");
  };

  /* ---------------------------------------------------------------- *
   * Add client project
   * ---------------------------------------------------------------- */
  const handleAddProject = (draft: AddProjectDraft) => {
    const now = new Date().toISOString();
    const project: ArchitectProject = {
      id: `ap-${Date.now()}`,
      title: draft.projectTitle,
      clientName: draft.clientName,
      clientVerified: false,
      location: draft.location,
      imageUrl: NEW_PROJECT_IMAGE,
      origin:
        draft.mode === "invite_client"
          ? "invited_client"
          : draft.mode === "off_platform"
            ? "off_platform"
            : "imported",
      appointment: "design_only",
      phase: draft.mode === "import" ? "brief_review" : "brief_received",
      status: "waiting_for_architect",
      nextAction:
        draft.mode === "invite_client"
          ? "Waiting for the client to accept your invitation"
          : "Confirm the brief with the client",
      responsibleParty: draft.mode === "invite_client" ? "client" : "architect",
      dueDate: isoInDays(7),
      paymentStatus: "not_funded",
      designFee: draft.designFee,
      startedAt: now,
      lastUpdated: now,
      includedRevisions: 2,
      revisionRoundsUsed: 0,
      clientReviewPeriodDays: 5,
      finalDecisionMaker: draft.clientName,
      brief: {
        id: `brief-${Date.now()}`,
        submittedAt: now,
        projectType: "To be confirmed",
        siteLocation: draft.location,
        clientLocation: draft.location,
        bedrooms: null,
        floors: null,
        requiredSpaces: [],
        preferredStyle: "To be confirmed",
        budgetRange: "To be confirmed",
        inspirationImages: [],
        desiredTimeline: "To be confirmed",
        specialRequests: "",
        surveyPlan: null,
        documents: [],
        localRepresentative: null,
        clientVerified: false,
      },
      agreement: {
        id: `agr-${Date.now()}`,
        appointment: "design_only",
        status: "in_preparation",
        totalDesignFee: draft.designFee,
        includedRevisions: 2,
        designTimelineWeeks: 12,
        clientReviewPeriodDays: 5,
        finalDecisionMaker: draft.clientName,
        deliverables: ["Concept design", "Floor plans", "Construction drawings"],
        exclusions: [...DESIGN_ONLY_EXCLUSIONS],
        differences: [],
        confirmedSteps: [],
        preparedFromProposalId: null,
      },
      deliverables: createStarterDeliverables(),
      approvals: [{ id: `app-${Date.now()}`, stage: "project_brief", status: "not_submitted" }],
      revisions: [],
      payments:
        draft.designFee > 0
          ? [
              {
                id: `pm-${Date.now()}-1`,
                name: "Brief confirmation",
                amount: Math.round(draft.designFee * 0.15),
                status: "not_funded",
              },
              {
                id: `pm-${Date.now()}-2`,
                name: "Concept presentation",
                amount: Math.round(draft.designFee * 0.25),
                status: "not_funded",
              },
              {
                id: `pm-${Date.now()}-3`,
                name: "Developed design",
                amount: Math.round(draft.designFee * 0.3),
                status: "not_funded",
              },
              {
                id: `pm-${Date.now()}-4`,
                name: "Construction drawings",
                amount: draft.designFee - Math.round(draft.designFee * 0.7),
                status: "not_funded",
              },
            ]
          : [],
      documents: [],
      conversationSummaries: [],
    };

    setProjects((prev) => [project, ...prev]);
    pushActivity(`New project added — ${draft.projectTitle}`, "neutral");
    setAddProjectMode(null);
    showToast(
      draft.mode === "invite_client"
        ? `Invitation sent to ${draft.clientName}.`
        : `${draft.projectTitle} added.`,
    );
    openProject(project.id);
  };

  /* ---------------------------------------------------------------- *
   * Priority routing
   * ---------------------------------------------------------------- */
  const handlePriorityAction = (item: PriorityItem) => {
    const project = projects.find((entry) => entry.id === item.sourceId);

    switch (item.actionType) {
      case "review_comments": {
        const revisionId = item.id.replace("pri-rev-", "");
        if (project) {
          openProject(project.id, "feedback");
          setRevisionTarget({ projectId: project.id, revisionId });
        }
        return;
      }
      case "upload_deliverable": {
        const deliverableId = item.id.replace("pri-del-", "");
        if (project) {
          openProject(project.id, "deliverables");
          setDeliverableTarget({ projectId: project.id, deliverableId });
        }
        return;
      }
      case "review_agreement":
        if (project) {
          openProject(project.id, "agreement");
          setAgreementProjectId(project.id);
        }
        return;
      case "send_reminder":
        if (project) handleSendReminder(project.id, item.detail);
        return;
      case "request_withdrawal":
        navigate("payments");
        setWithdrawOpen(true);
        return;
      case "complete_proposal": {
        const opportunity = opportunities.find((entry) => entry.id === item.sourceId);
        if (opportunity) {
          setProposalExisting(null);
          setProposalOpportunity(opportunity);
          return;
        }
        const proposal = proposals.find((entry) => entry.id === item.sourceId);
        if (proposal) {
          setProposalOpportunity(null);
          setProposalExisting(proposal);
          return;
        }
        navigate("opportunities");
        return;
      }
      case "answer_clarification":
        if (project) openProject(project.id, "messages");
        return;
      case "resolve_block":
      case "open_project":
      default:
        if (project) openProject(project.id, "overview");
    }
  };

  /* ---------------------------------------------------------------- *
   * Notifications & search
   * ---------------------------------------------------------------- */
  const handleNotificationAction = (notification: ArchitectNotification) => {
    if (notification.targetProjectId) {
      openProject(notification.targetProjectId, notification.targetTab ?? "overview");
      return;
    }
    if (notification.targetView && VALID_VIEWS.includes(notification.targetView)) {
      navigate(notification.targetView);
    }
  };

  const searchHits = useCallback(
    (query: string): SearchHit[] => {
      const needle = query.trim().toLowerCase();
      const hits: SearchHit[] = [];

      projects.forEach((project) => {
        if (
          project.title.toLowerCase().includes(needle) ||
          project.clientName.toLowerCase().includes(needle) ||
          (project.clientCompany ?? "").toLowerCase().includes(needle) ||
          project.location.toLowerCase().includes(needle)
        ) {
          hits.push({
            id: `hit-project-${project.id}`,
            label: project.title,
            sublabel: `Project · ${project.clientCompany ?? project.clientName}`,
            view: "project-detail",
            projectId: project.id,
          });
        }
      });

      opportunities.forEach((opportunity) => {
        if (
          opportunity.projectName.toLowerCase().includes(needle) ||
          opportunity.clientName.toLowerCase().includes(needle) ||
          opportunity.location.toLowerCase().includes(needle)
        ) {
          hits.push({
            id: `hit-opp-${opportunity.id}`,
            label: opportunity.projectName,
            sublabel: `Opportunity · ${opportunity.location}`,
            view: "opportunities",
          });
        }
      });

      proposals.forEach((proposal) => {
        if (
          proposal.projectTitle.toLowerCase().includes(needle) ||
          proposal.clientName.toLowerCase().includes(needle)
        ) {
          hits.push({
            id: `hit-prop-${proposal.id}`,
            label: proposal.projectTitle,
            sublabel: `Proposal · ${proposal.clientName}`,
            view: "proposals",
          });
        }
      });

      return hits.slice(0, 8);
    },
    [projects, opportunities, proposals],
  );

  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;
    const report = buildArchitectReport(profile, projects, priorities);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amana-architect-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Workload report downloaded.");
  };

  /* ---------------------------------------------------------------- *
   * Banners
   * ---------------------------------------------------------------- */
  const verificationBanner = useMemo(() => {
    if (profile.verificationStatus === "pending") {
      return {
        tone: "info" as const,
        text: "Your architect credentials are under review. Withdrawals unlock once verification completes.",
      };
    }
    if (profile.verificationStatus === "rejected") {
      return {
        tone: "warning" as const,
        text: "Verification was declined. Update your credentials to resubmit.",
      };
    }
    if (profile.bankStatus !== "verified") {
      return {
        tone: "info" as const,
        text: "Connect a verified payout bank account to withdraw earned design fees.",
      };
    }
    return null;
  }, [profile.verificationStatus, profile.bankStatus]);

  /* ---------------------------------------------------------------- *
   * Derived modal targets
   * ---------------------------------------------------------------- */
  const deliverableModalProject = deliverableTarget
    ? (projects.find((project) => project.id === deliverableTarget.projectId) ?? null)
    : null;
  const deliverableModalItem =
    deliverableModalProject && deliverableTarget
      ? (deliverableModalProject.deliverables.find(
          (item) => item.id === deliverableTarget.deliverableId,
        ) ?? null)
      : null;

  const revisionModalProject = revisionTarget
    ? (projects.find((project) => project.id === revisionTarget.projectId) ?? null)
    : null;
  const revisionModalItem =
    revisionModalProject && revisionTarget
      ? (revisionModalProject.revisions.find((item) => item.id === revisionTarget.revisionId) ??
        null)
      : null;

  const agreementModalProject = agreementProjectId
    ? (projects.find((project) => project.id === agreementProjectId) ?? null)
    : null;

  const summaryModalProject = summaryProjectId
    ? (projects.find((project) => project.id === summaryProjectId) ?? null)
    : null;

  const unreadMessages = messages.filter((message) => !message.read).length;

  const badges = {
    opportunities: opportunities.filter((item) => item.status === "open").length,
    projects: priorities.filter((item) => item.responsibleParty === "architect").length,
    proposals: proposals.filter((item) => {
      const status = resolveProposalStatus(item);
      return status === "clarification_requested" || status === "revised_proposal_requested" || status === "draft";
    }).length,
    agreements: projects.filter(
      (project) => project.agreement && project.agreement.status !== "signed",
    ).length,
    payments: financials.availableForWithdrawal > 0 ? 1 : 0,
    messages: unreadMessages,
  };

  /* ---------------------------------------------------------------- *
   * View rendering
   * ---------------------------------------------------------------- */
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <ArchitectDashboardHome
            priorities={priorities}
            summary={summary}
            projects={projects}
            opportunities={opportunities}
            onPriorityAction={handlePriorityAction}
            onOpenProject={openProject}
            onNavigate={navigate}
            onViewBrief={(opportunity) => setBriefTarget({ opportunity })}
            onSubmitBid={(opportunity) => {
              setProposalExisting(null);
              setProposalOpportunity(opportunity);
            }}
            onAskQuestion={(opportunity) => setQuestionSubject(opportunity.projectName)}
            onSaveOpportunity={handleSaveOpportunity}
            onDeclineOpportunity={handleDeclineOpportunity}
            onInviteClient={() => setAddProjectMode("invite_client")}
          />
        );

      case "opportunities":
        return (
          <ArchitectOpportunitiesPanel
            opportunities={opportunities}
            onViewBrief={(opportunity) => setBriefTarget({ opportunity })}
            onSubmitBid={(opportunity) => {
              setProposalExisting(null);
              setProposalOpportunity(opportunity);
            }}
            onAskQuestion={(opportunity) => setQuestionSubject(opportunity.projectName)}
            onSave={handleSaveOpportunity}
            onDecline={handleDeclineOpportunity}
          />
        );

      case "projects":
        return (
          <ArchitectProjectsPanel
            projects={projects}
            onOpenProject={openProject}
            onBrowseOpportunities={() => navigate("opportunities")}
            onInviteClient={() => setAddProjectMode("invite_client")}
          />
        );

      case "proposals":
        return (
          <ArchitectProposalsPanel
            proposals={proposals}
            onRevise={(proposal) => {
              setProposalOpportunity(null);
              setProposalExisting(proposal);
            }}
            onBrowseOpportunities={() => navigate("opportunities")}
          />
        );

      case "agreements":
        return (
          <ArchitectAgreementsPanel
            projects={projects}
            onOpenProject={(projectId) => openProject(projectId, "agreement")}
          />
        );

      case "payments":
        return (
          <ArchitectPaymentsPanel
            projects={projects}
            financials={financials}
            onWithdraw={() => setWithdrawOpen(true)}
            withdrawBlockedReason={withdrawBlockedReason}
            onOpenProject={(projectId) => openProject(projectId, "payments")}
          />
        );

      case "messages":
        return (
          <ArchitectMessagesPanel
            messages={messages}
            projects={projects}
            onOpenProject={(projectId) => openProject(projectId, "messages")}
            onAddConversationSummary={(projectId) => setSummaryProjectId(projectId)}
          />
        );

      case "portfolio":
        return <ArchitectPortfolioPanel items={MOCK_PORTFOLIO} />;

      case "team":
        return <ArchitectTeamPanel team={team} projects={projects} />;

      case "profile":
        return (
          <ArchitectProfilePanel
            profile={profile}
            financials={financials}
            projects={projects}
            onOpenSettings={openProfileSettings}
          />
        );

      case "project-detail":
        return activeProject ? (
          <ArchitectProjectDetail
            project={activeProject}
            messages={messages}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBack={() => navigate("projects")}
            onOpenDeliverable={(deliverable) =>
              setDeliverableTarget({ projectId: activeProject.id, deliverableId: deliverable.id })
            }
            onOpenRevision={(revision) =>
              setRevisionTarget({ projectId: activeProject.id, revisionId: revision.id })
            }
            onOpenAgreement={() => setAgreementProjectId(activeProject.id)}
            onSendReminder={(subject) => handleSendReminder(activeProject.id, subject)}
            onAddConversationSummary={() => setSummaryProjectId(activeProject.id)}
            onSendMessage={(body, type) => handleSendMessage(activeProject.id, body, type)}
            onWithdraw={() => setWithdrawOpen(true)}
            withdrawBlockedReason={withdrawBlockedReason}
          />
        ) : null;

      default:
        return null;
    }
  };

  if (!profile.onboardingComplete) return null;

  const pageMeta =
    activeView === "project-detail"
      ? { title: activeProject?.title ?? "Project", subtitle: "" }
      : PAGE_META[activeView];

  return (
    <div className="ap-shell">
      <ArchitectPortalSidebar
        activeView={activeView}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavigate={navigate}
        onOpenSettings={openProfileSettings}
        badges={badges}
      />

      <div className="ap-main">
        <ArchitectPortalHeader
          title={pageMeta.title}
          subtitle={
            activeView === "dashboard"
              ? priorities.length > 0
                ? `${priorities.length} item${priorities.length === 1 ? "" : "s"} need your attention.`
                : "You are all caught up."
              : pageMeta.subtitle
          }
          showGreeting={activeView === "dashboard"}
          unreadMessages={unreadMessages}
          onAddClientProject={setAddProjectMode}
          onDownloadReport={handleDownloadReport}
          onOpenMessages={() => navigate("messages")}
          onNotificationAction={handleNotificationAction}
          onSearchSelect={(hit) =>
            hit.projectId ? openProject(hit.projectId) : navigate(hit.view)
          }
          searchHits={searchHits}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

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

      {toast && (
        <div className="ap-toast" role="status">
          {toast}
        </div>
      )}

      {/* ------------------------------ Modals ------------------------------ */}
      <ArchitectBriefModal
        brief={
          briefTarget
            ? "opportunity" in briefTarget
              ? briefTarget.opportunity.brief
              : briefTarget.project.brief
            : null
        }
        projectName={
          briefTarget
            ? "opportunity" in briefTarget
              ? briefTarget.opportunity.projectName
              : briefTarget.project.title
            : ""
        }
        showBidActions={Boolean(briefTarget && "opportunity" in briefTarget)}
        canBid={
          briefTarget && "opportunity" in briefTarget
            ? briefTarget.opportunity.status === "open" || briefTarget.opportunity.status === "saved"
            : false
        }
        onClose={() => setBriefTarget(null)}
        onAskClarification={() => {
          if (briefTarget && "opportunity" in briefTarget) {
            setQuestionSubject(briefTarget.opportunity.projectName);
            setBriefTarget(null);
          }
        }}
        onSubmitProposal={() => {
          if (briefTarget && "opportunity" in briefTarget) {
            setProposalExisting(null);
            setProposalOpportunity(briefTarget.opportunity);
            setBriefTarget(null);
          }
        }}
        onDecline={() => {
          if (briefTarget && "opportunity" in briefTarget) {
            handleDeclineOpportunity(briefTarget.opportunity);
            setBriefTarget(null);
          }
        }}
        onSaveForLater={() => {
          if (briefTarget && "opportunity" in briefTarget) {
            handleSaveOpportunity(briefTarget.opportunity);
            setBriefTarget(null);
          }
        }}
      />

      <ArchitectProposalModal
        key={`proposal-${proposalExisting?.id ?? proposalOpportunity?.id ?? "none"}`}
        opportunity={proposalOpportunity}
        existing={proposalExisting}
        onClose={() => {
          setProposalOpportunity(null);
          setProposalExisting(null);
        }}
        onSubmit={handleSubmitProposal}
      />

      <ArchitectAgreementModal
        key={`agreement-${agreementProjectId ?? "none"}`}
        project={agreementModalProject}
        onClose={() => setAgreementProjectId(null)}
        onSave={handleSaveAgreement}
      />

      <ArchitectDeliverableModal
        key={`deliverable-${deliverableTarget?.deliverableId ?? "none"}`}
        project={deliverableModalProject}
        deliverable={deliverableModalItem}
        onClose={() => setDeliverableTarget(null)}
        onSubmit={handleSubmitDeliverable}
      />

      <ArchitectRevisionModal
        key={`revision-${revisionTarget?.revisionId ?? "none"}`}
        project={revisionModalProject}
        revision={revisionModalItem}
        onClose={() => setRevisionTarget(null)}
        onSubmit={handleSubmitRevision}
      />

      <ArchitectAddProjectModal
        key={`add-${addProjectMode ?? "none"}`}
        mode={addProjectMode}
        onClose={() => setAddProjectMode(null)}
        onSubmit={handleAddProject}
      />

      <ArchitectConversationSummaryModal
        key={`summary-${summaryProjectId ?? "none"}`}
        open={Boolean(summaryModalProject)}
        projectName={summaryModalProject?.title ?? ""}
        onClose={() => setSummaryProjectId(null)}
        onSubmit={handleAddConversationSummary}
      />

      <ArchitectQuestionModal
        key={`question-${questionSubject ?? "none"}`}
        open={Boolean(questionSubject)}
        subject={questionSubject ?? ""}
        onClose={() => setQuestionSubject(null)}
        onSubmit={(question) => {
          pushActivity(`Clarification question sent — ${questionSubject}`, "info");
          setQuestionSubject(null);
          showToast("Question sent to the client.");
          void question;
        }}
      />

      <ArchitectWithdrawModal
        open={withdrawOpen}
        amount={financials.availableForWithdrawal}
        blockedReason={withdrawBlockedReason}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />

      <ArchitectSettingsModal open={settingsOpen} onClose={closeProfileSettings} />
    </div>
  );
}
