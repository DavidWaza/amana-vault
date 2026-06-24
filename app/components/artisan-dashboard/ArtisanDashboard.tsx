"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardText } from "phosphor-react";
import { useRouter, useSearchParams } from "next/navigation";
import ArtisanDashboardNav from "./ArtisanDashboardNav";
import ArtisanStatusBanner from "./ArtisanStatusBanner";
import ArtisanStats from "./ArtisanStats";
import ArtisanAlerts from "./ArtisanAlerts";
import ArtisanWalletSection from "./ArtisanWallet";
import ArtisanJobsPanel from "./ArtisanJobsPanel";
import ArtisanProfileCard from "./ArtisanProfileCard";
import ArtisanReviews from "./ArtisanReviews";
import ArtisanProofUploadModal from "./ArtisanProofUploadModal";
import ArtisanJobModals from "./ArtisanJobModals";
import CreateAgreementModal from "./CreateAgreementModal";
import CreateInvoiceModal from "./CreateInvoiceModal";
import ArtisanProPromo from "./ArtisanProPromo";
import RaiseDisputeModal from "../disputes/RaiseDisputeModal";
import DisputeWorkspaceModal from "../disputes/DisputeWorkspaceModal";
import { buildDispute } from "../disputes/constants";
import { buildAgreementSummary } from "./agreement-summary";
import { formatNaira } from "./utils";
import { useArtisanProfile } from "./ArtisanProfileProvider";
import {
  MOCK_CLIENTS,
  MOCK_REVIEWS,
  buildDashboardStats,
} from "./mock-data";
import type {
  ArtisanClient,
  ArtisanJob,
  CreateAgreementForm,
  DashboardAlert,
  JobChatMessage,
  JobInvoice,
  JobPrimaryAction,
} from "./types";
import type {
  Dispute,
  DisputeDecider,
  DisputeOutcome,
  DisputeStatement,
  RaiseDisputeInput,
} from "../disputes/types";

export default function ArtisanDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    wallet,
    setWallet,
    jobs,
    setJobs,
    setJobMessages,
    openChat,
    notifications,
    setNotifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
  } = useArtisanProfile();

  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [invoiceJobId, setInvoiceJobId] = useState<string | null>(null);
  const [proofJobId, setProofJobId] = useState<string | null>(null);
  const [inviteJobId, setInviteJobId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<{
    jobId: string;
    mode: "dispute" | "receipt";
  } | null>(null);
  const [raiseDisputeJobId, setRaiseDisputeJobId] = useState<string | null>(null);
  const [disputeWorkspaceJobId, setDisputeWorkspaceJobId] = useState<
    string | null
  >(null);

  const stats = useMemo(() => buildDashboardStats(jobs), [jobs]);

  const canAcceptJobs =
    profile.verificationStatus === "verified" && profile.profileComplete;

  const openProofUpload = useCallback((jobId: string) => {
    setProofJobId(jobId);
    document.getElementById(jobId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const runJobAction = useCallback(
    (action: JobPrimaryAction, jobId: string) => {
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return;

      switch (action) {
        case "upload_proof":
          openProofUpload(jobId);
          break;
        case "review_invite":
          setInviteJobId(jobId);
          break;
        case "view_dispute":
          setDisputeWorkspaceJobId(jobId);
          break;
        case "view_receipt":
          setDetailState({ jobId, mode: "receipt" });
          break;
        case "start_work":
          setJobs((prev) =>
            prev.map((item) =>
              item.id === jobId
                ? {
                    ...item,
                    status: "in_progress",
                    lastUpdated: new Date().toISOString(),
                  }
                : item,
            ),
          );
          break;
        default:
          break;
      }
    },
    [jobs, openProofUpload],
  );

  useEffect(() => {
    const action = searchParams.get("action") as JobPrimaryAction | null;
    const jobId = searchParams.get("job");
    if (!action || !jobId) return;

    runJobAction(action, jobId);
    router.replace("/artisan/dashboard", { scroll: false });
  }, [searchParams, runJobAction, router]);

  useEffect(() => {
    if (window.location.hash !== "#profile") return;
    openProfileSettings("profile");
    window.history.replaceState(null, "", window.location.pathname);
  }, [openProfileSettings]);

  const handleJobPrimaryAction = (job: ArtisanJob, action: JobPrimaryAction) => {
    runJobAction(action, job.id);
  };

  const handleDeclineInvite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? { ...item, status: "declined", lastUpdated: new Date().toISOString() }
          : item,
      ),
    );
    setInviteJobId(null);
    notifications
      .filter(
        (item) =>
          item.actionType === "review_invite" && item.actionJobId === jobId,
      )
      .forEach((item) => dismissNotification(item.id));
  };

  const handleAcceptInvite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "awaiting_funding",
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    );
    setInviteJobId(null);
    notifications
      .filter(
        (item) =>
          item.actionType === "review_invite" && item.actionJobId === jobId,
      )
      .forEach((item) => dismissNotification(item.id));
  };

  const handleAlertAction = (alert: DashboardAlert) => {
    markNotificationRead(alert.id);

    if (alert.actionType === "open_settings") {
      openProfileSettings(alert.settingsTab ?? "profile");
      return;
    }

    if (alert.actionType && alert.actionJobId) {
      runJobAction(alert.actionType, alert.actionJobId);
      return;
    }

    if (alert.actionHref?.startsWith("#")) {
      document
        .querySelector(alert.actionHref)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSendAgreement = async (
    form: CreateAgreementForm,
    client: ArtisanClient,
  ): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const built = buildAgreementSummary(form);
    const now = new Date().toISOString();
    const jobId = `job-${Date.now()}`;
    const daysUntilFinish = Math.ceil(
      (new Date(form.finishDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    const newJob: ArtisanJob = {
      id: jobId,
      title: built.title,
      clientName: client.name,
      clientVerified: client.verified,
      location: built.location,
      amount: built.price,
      status: "awaiting_funding",
      priority: daysUntilFinish <= 7 ? "urgent" : "normal",
      createdAt: now,
      deadline: new Date(form.finishDate).toISOString(),
      agreementScope: built.scope,
      paymentTerms: built.paymentTerms,
      milestones: built.milestones,
      sentByArtisan: true,
      lastUpdated: now,
    };

    const introMessage: JobChatMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      sender: "artisan",
      text: `Hi ${client.name.split(" ")[0]} — I've sent the ${built.title} agreement (${formatNaira(built.price)} across ${built.milestones.length} milestones). Please review the completion summary and fund escrow when ready.`,
      createdAt: now,
    };

    setJobs((prev) => [newJob, ...prev]);
    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [introMessage],
    }));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "success",
        title: "Agreement sent",
        message: `Your agreement for ${built.title} was sent to ${client.name}.`,
        actionLabel: "View job",
        actionHref: `#${jobId}`,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    return jobId;
  };

  const handleRequestRelease = async (amount: number) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const releaseJob =
      jobs.find((job) => job.status === "proof_submitted") ??
      jobs.find((job) =>
        ["in_progress", "funds_secured", "disputed"].includes(job.status),
      );

    const now = new Date().toISOString();
    const clientName = releaseJob?.clientName ?? "your client";

    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      pendingWithdrawal: prev.pendingWithdrawal + amount,
      transactions: [
        {
          id: `txn-${Date.now()}`,
          type: "withdrawal",
          amount,
          status: "awaiting_approval",
          description: releaseJob
            ? `Release request — ${releaseJob.title} (awaiting ${clientName}'s approval)`
            : "Release request — awaiting client approval",
          date: now,
        },
        ...prev.transactions,
      ],
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "info",
        title: "Release request sent",
        message: `Your ${formatNaira(amount)} release request was sent to ${clientName}. Funds stay in escrow until they approve.`,
        actionLabel: releaseJob ? "View job" : undefined,
        actionHref: releaseJob ? `#${releaseJob.id}` : undefined,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    if (releaseJob) {
      const chatNote: JobChatMessage = {
        id: `msg-${Date.now()}`,
        jobId: releaseJob.id,
        sender: "artisan",
        text: `I've requested release of ${formatNaira(amount)} for completed work on ${releaseJob.title}. Please review and approve so funds can leave escrow to my bank.`,
        createdAt: now,
      };

      setJobMessages((prev) => ({
        ...prev,
        [releaseJob.id]: [...(prev[releaseJob.id] ?? []), chatNote],
      }));
    }
  };

  const handleSendInvoice = async (invoice: JobInvoice) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    setJobs((prev) =>
      prev.map((item) =>
        item.id === invoice.jobId ? { ...item, invoice, lastUpdated: new Date().toISOString() } : item,
      ),
    );

    const chatNote: JobChatMessage = {
      id: `msg-${Date.now()}`,
      jobId: invoice.jobId,
      sender: "artisan",
      text: `Invoice ${invoice.invoiceNumber} sent — ${formatNaira(invoice.subtotal)} due by ${new Date(invoice.dueDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}. Review line items and fund escrow to proceed.`,
      createdAt: new Date().toISOString(),
    };

    setJobMessages((prev) => ({
      ...prev,
      [invoice.jobId]: [...(prev[invoice.jobId] ?? []), chatNote],
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "info",
        title: "Invoice sent",
        message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.clientName}.`,
        actionLabel: "View job",
        actionHref: `#${invoice.jobId}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleProofSubmit = async (jobId: string, _files: File[]) => {
    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "proof_submitted",
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    );
    notifications
      .filter(
        (item) =>
          item.actionType === "upload_proof" && item.actionJobId === jobId,
      )
      .forEach((item) => dismissNotification(item.id));
  };

  // ---- Dispute resolution ----------------------------------------------

  const patchDispute = (
    jobId: string,
    updater: (dispute: Dispute) => Dispute,
    extra?: Partial<ArtisanJob>,
  ) => {
    setJobs((prev) =>
      prev.map((item) => {
        if (item.id !== jobId || !item.dispute) return item;
        return {
          ...item,
          dispute: updater(item.dispute),
          lastUpdated: new Date().toISOString(),
          ...extra,
        };
      }),
    );
  };

  const handleRaiseDispute = (jobId: string, input: RaiseDisputeInput) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;
    const now = new Date().toISOString();
    const dispute = buildDispute("artisan", input, job.amount, now);

    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "disputed",
              disputeReason: `You opened a dispute — waiting for ${job.clientName} to respond.`,
              dispute,
              lastUpdated: now,
            }
          : item,
      ),
    );

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [
        ...(prev[jobId] ?? []),
        {
          id: `msg-${Date.now()}`,
          jobId,
          sender: "artisan",
          text: `I've opened a dispute on ${job.title}. The ${formatNaira(job.amount)} stays in escrow until Amana or we resolve it.`,
          createdAt: now,
        },
      ],
    }));

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "warning",
        title: "Dispute opened",
        message: `Your dispute on ${job.title} was sent to ${job.clientName}.`,
        actionLabel: "View dispute",
        actionType: "view_dispute",
        actionJobId: jobId,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    setRaiseDisputeJobId(null);
    setDisputeWorkspaceJobId(jobId);

    // Simulate the client responding so the negotiation can progress.
    window.setTimeout(() => {
      const reply: DisputeStatement = {
        id: `dsp-reply-${Date.now()}`,
        party: "client",
        text: "I've seen your dispute and added my response. Let's try to settle on a fair outcome before escalating to Amana.",
        createdAt: new Date().toISOString(),
      };
      patchDispute(jobId, (d) => ({
        ...d,
        stage: d.stage === "open" ? "responded" : d.stage,
        statements: [...d.statements, reply],
        updatedAt: new Date().toISOString(),
      }));
    }, 2200);
  };

  const handleDisputeResponse = (
    jobId: string,
    text: string,
    evidenceLabels: string[],
  ) => {
    const now = new Date().toISOString();
    patchDispute(jobId, (d) => ({
      ...d,
      statements: text
        ? [
            ...d.statements,
            {
              id: `dsp-st-${Date.now()}`,
              party: "artisan",
              text,
              createdAt: now,
            },
          ]
        : d.statements,
      evidence: [
        ...d.evidence,
        ...evidenceLabels.map((label, i) => ({
          id: `dsp-ev-${Date.now()}-${i}`,
          party: "artisan" as const,
          label,
          kind: "photo" as const,
          uploadedAt: now,
        })),
      ],
      updatedAt: now,
    }));
  };

  // Apply the agreed/ruled split to the artisan wallet and close out the job.
  const settleDispute = (
    jobId: string,
    outcome: DisputeOutcome,
    decidedBy: DisputeDecider,
    note?: string,
  ) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job || !job.dispute) return;
    const amount = job.dispute.amount;
    const now = new Date().toISOString();

    let artisanAmount = 0;
    let clientAmount = 0;
    let nextStatus: ArtisanJob["status"] = "disputed";

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
      jobId,
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
      {
        status: nextStatus,
        disputeReason:
          outcome === "withdrawn"
            ? undefined
            : `Dispute resolved — ${outcome === "refund_client" ? "refunded to client" : outcome === "release_artisan" ? "released to you" : "split"}.`,
      },
    );

    if (artisanAmount > 0) {
      setWallet((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance + artisanAmount,
        incomingBalance: Math.max(0, prev.incomingBalance - amount),
        transactions: [
          {
            id: `txn-${Date.now()}`,
            type: "credit",
            amount: artisanAmount,
            status: "completed",
            description: `Dispute settlement — ${job.title}`,
            date: now,
          },
          ...prev.transactions,
        ],
      }));
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: outcome === "refund_client" ? "warning" : "success",
        title: "Dispute resolved",
        message:
          outcome === "withdrawn"
            ? `The dispute on ${job.title} was withdrawn. The job is active again.`
            : `${job.title} settled — ${
                artisanAmount > 0
                  ? `${formatNaira(artisanAmount)} credited to your wallet`
                  : "no funds released to you"
              }.`,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
  };

  const handleAcceptDisputeOutcome = (
    jobId: string,
    outcome: DisputeOutcome,
  ) => {
    settleDispute(jobId, outcome, "artisan");
  };

  const handleWithdrawDispute = (jobId: string) => {
    settleDispute(jobId, "withdrawn", "artisan");
  };

  const handleEscalateDispute = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;
    const now = new Date().toISOString();
    patchDispute(
      jobId,
      (d) => ({
        ...d,
        stage: "escalated",
        statements: [
          ...d.statements,
          {
            id: `dsp-esc-${Date.now()}`,
            party: "amana",
            text: "This dispute has been escalated to Amana. A reviewer will assess the evidence from both sides and issue a binding decision.",
            createdAt: now,
          },
        ],
        updatedAt: now,
      }),
      {
        disputeReason: "Escalated to Amana — awaiting an independent decision.",
      },
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "warning",
        title: "Escalated to Amana",
        message: `${job.title} is now with Amana for review. Funds stay in escrow until a decision is issued.`,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
  };

  const proofJob = jobs.find((job) => job.id === proofJobId) ?? null;
  const inviteJob = jobs.find((job) => job.id === inviteJobId) ?? null;
  const detailJob = detailState
    ? (jobs.find((job) => job.id === detailState.jobId) ?? null)
    : null;
  const invoiceJob = jobs.find((job) => job.id === invoiceJobId) ?? null;
  const raiseDisputeJob = jobs.find((job) => job.id === raiseDisputeJobId) ?? null;
  const disputeWorkspaceJob =
    jobs.find((job) => job.id === disputeWorkspaceJobId) ?? null;
  const disputeView =
    disputeWorkspaceJob && disputeWorkspaceJob.dispute
      ? {
          id: disputeWorkspaceJob.id,
          title: disputeWorkspaceJob.title,
          amount: disputeWorkspaceJob.amount,
          counterpartyName: disputeWorkspaceJob.clientName,
          dispute: disputeWorkspaceJob.dispute,
        }
      : null;

  const unreadAlerts = notifications.filter((item) => !item.read);

  return (
    <div className="adash-page">
      <ArtisanDashboardNav currentPage="dashboard" />

      <main className="adash-main">
        <div className="adash-container">
          <header>
            <div>
              <p className="text-[0.82rem] font-extrabold tracking-[0.14em] uppercase text-green2">
                Artisan Dashboard
              </p>
              <h1 className="mt-[0.35rem] mb-2 text-[clamp(1.75rem,3vw,2.5rem)] text-green">
                Good {getGreeting()}, {profile.fullName.split(" ")[0]}
              </h1>
              <p className="m-0 text-muted max-w-[40rem] leading-[1.7]">
                Manage secured jobs, upload proof of work, and track payments —
                all held safely in escrow until approval.
              </p>
            </div>
          </header>

          <ArtisanWalletSection
            wallet={wallet}
            profile={profile}
            onRequestRelease={handleRequestRelease}
          />
          <ArtisanStatusBanner profile={profile} />
          <ArtisanAlerts
            alerts={unreadAlerts}
            onDismiss={dismissNotification}
            onAction={handleAlertAction}
          />
          <ArtisanStats {...stats} />

          <ArtisanProPromo profile={profile} />

          <div className="grid grid-cols-[1fr_300px] gap-6 items-start max-[1100px]:grid-cols-1">
            <ArtisanJobsPanel
              jobs={jobs}
              canAcceptJobs={canAcceptJobs}
              onPrimaryAction={handleJobPrimaryAction}
              onDeclineInvite={handleDeclineInvite}
              onMessageClient={(job) => openChat(job.id)}
              onCreateInvoice={(job) => setInvoiceJobId(job.id)}
              onRaiseDispute={(job) => setRaiseDisputeJobId(job.id)}
            />
            <ArtisanProfileCard />
          </div>

          <ArtisanReviews reviews={MOCK_REVIEWS} />

          <footer className="px-[1.15rem] py-4 rounded-2xl bg-white/80 border border-solid border-line text-[0.8rem] leading-[1.6] text-muted">
            Amana is a technology platform, not a bank or financial institution.
            Escrow custody is provided by our CBN-licensed partner financial
            institution. Never start work until funds show as secured.
          </footer>
        </div>
      </main>

      <ArtisanProofUploadModal
        job={proofJob}
        open={proofJobId !== null}
        onClose={() => setProofJobId(null)}
        onSubmit={handleProofSubmit}
      />

      <ArtisanJobModals
        inviteJob={inviteJob}
        detailJob={detailJob}
        detailMode={detailState?.mode ?? null}
        onCloseInvite={() => setInviteJobId(null)}
        onCloseDetail={() => setDetailState(null)}
        onAcceptInvite={handleAcceptInvite}
        onDeclineInvite={handleDeclineInvite}
      />

      <RaiseDisputeModal
        key={`raise-${raiseDisputeJob?.id ?? "none"}`}
        open={raiseDisputeJob !== null}
        perspective="artisan"
        job={
          raiseDisputeJob
            ? {
                id: raiseDisputeJob.id,
                title: raiseDisputeJob.title,
                amount: raiseDisputeJob.amount,
                counterpartyName: raiseDisputeJob.clientName,
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
        perspective="artisan"
        view={disputeView}
        formatAmount={formatNaira}
        onClose={() => setDisputeWorkspaceJobId(null)}
        onAddResponse={handleDisputeResponse}
        onAcceptOutcome={handleAcceptDisputeOutcome}
        onWithdraw={handleWithdrawDispute}
        onEscalate={handleEscalateDispute}
      />

      <CreateAgreementModal
        open={agreementModalOpen}
        clients={MOCK_CLIENTS}
        artisanCategory={profile.category}
        onClose={() => setAgreementModalOpen(false)}
        onSend={handleSendAgreement}
        onOpenChat={(jobId) => openChat(jobId)}
        onCreateInvoice={(jobId) => setInvoiceJobId(jobId)}
      />

      <CreateInvoiceModal
        job={invoiceJob}
        artisanName={profile.fullName}
        open={invoiceJobId !== null}
        onClose={() => setInvoiceJobId(null)}
        onSend={handleSendInvoice}
      />

      <button
        type="button"
        className="adash-fab"
        onClick={() => setAgreementModalOpen(true)}
        aria-label="Create agreement"
      >
        <ClipboardText size={22} weight="bold" />
        <span>Create agreement</span>
      </button>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
