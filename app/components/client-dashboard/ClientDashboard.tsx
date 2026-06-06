"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase } from "phosphor-react";
import ClientDashboardNav from "./ClientDashboardNav";
import ClientStatusBanner from "./ClientStatusBanner";
import ClientStats from "./ClientStats";
import ClientAlerts from "./ClientAlerts";
import ClientEscrowPanel from "./ClientEscrowPanel";
import ClientJobsPanel from "./ClientJobsPanel";
import ClientProfileCard from "./ClientProfileCard";
import ClientReviews from "./ClientReviews";
import ClientJobModals from "./ClientJobModals";
import ClientArtisanWall from "./ClientArtisanWall";
import ClientArtisanDetailModal from "./ClientArtisanDetailModal";
import CreateClientJobModal from "./CreateClientJobModal";
import { useClientProfile } from "./ClientProfileProvider";
import {
  buildClientDashboardStats,
  MOCK_CLIENT_REVIEWS,
  MOCK_RECOMMENDED_ARTISANS,
} from "./mock-data";
import {
  formatNaira,
  calculateClientTotalDue,
  getJobsAwaitingFunding,
} from "./utils";
import type {
  ClientJob,
  ClientJobPrimaryAction,
  ClientNotification,
  CreateClientJobForm,
  JobChatMessage,
  RecommendedArtisan,
} from "./types";

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    setProfile,
    escrow,
    setEscrow,
    jobs,
    setJobs,
    setJobMessages,
    openChat,
    notifications,
    setNotifications,
    dismissNotification,
    markNotificationRead,
    openProfileSettings,
  } = useClientProfile();

  const [fundJobId, setFundJobId] = useState<string | null>(null);
  const [agreementJobId, setAgreementJobId] = useState<string | null>(null);
  const [proofJobId, setProofJobId] = useState<string | null>(null);
  const [releaseJobId, setReleaseJobId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<{
    jobId: string;
    mode: "dispute" | "receipt";
  } | null>(null);
  const [funding, setFunding] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState<ClientJob | null>(null);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [detailArtisan, setDetailArtisan] = useState<RecommendedArtisan | null>(null);
  const [preselectedArtisan, setPreselectedArtisan] =
    useState<RecommendedArtisan | null>(null);

  const stats = useMemo(() => buildClientDashboardStats(jobs), [jobs]);
  const awaitingFundingJobs = useMemo(
    () => getJobsAwaitingFunding(jobs),
    [jobs],
  );

  const canFundJobs =
    profile.verificationStatus === "verified" &&
    profile.paymentMethodStatus === "verified" &&
    profile.profileComplete;

  const runJobAction = useCallback(
    (action: ClientJobPrimaryAction, jobId: string) => {
      const job = jobs.find((item) => item.id === jobId);
      if (!job) return;

      switch (action) {
        case "fund_escrow":
        case "review_agreement":
          if (job.sentByArtisan) setAgreementJobId(jobId);
          else setFundJobId(jobId);
          break;
        case "approve_proof":
          setProofJobId(jobId);
          break;
        case "approve_release":
          setReleaseJobId(jobId);
          break;
        case "view_dispute":
          setDetailState({ jobId, mode: "dispute" });
          break;
        case "view_receipt":
          setDetailState({ jobId, mode: "receipt" });
          break;
        case "message_artisan":
          openChat(jobId);
          break;
        case "resend_invite":
          setJobs((prev) =>
            prev.map((item) =>
              item.id === jobId
                ? {
                    ...item,
                    status: "invitation_pending",
                    invitationExpiresAt: new Date(
                      Date.now() + 3 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    lastUpdated: new Date().toISOString(),
                  }
                : item,
            ),
          );
          break;
        case "cancel_invite":
          setJobs((prev) =>
            prev.map((item) =>
              item.id === jobId
                ? { ...item, status: "cancelled", lastUpdated: new Date().toISOString() }
                : item,
            ),
          );
          break;
        default:
          break;
      }
    },
    [jobs, openChat, setJobs],
  );

  useEffect(() => {
    const action = searchParams.get("action") as ClientJobPrimaryAction | null;
    const jobId = searchParams.get("job");
    if (!action || !jobId) return;
    runJobAction(action, jobId);
    router.replace("/client/dashboard", { scroll: false });
  }, [searchParams, runJobAction, router]);

  useEffect(() => {
    if (window.location.hash !== "#profile") return;
    openProfileSettings("profile");
    window.history.replaceState(null, "", window.location.pathname);
  }, [openProfileSettings]);

  const handleAlertAction = (alert: ClientNotification) => {
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

  const handleConfirmFund = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job || !canFundJobs) return;

    setFunding(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalDue = calculateClientTotalDue(job.amount, job.protectionFee);
    const now = new Date().toISOString();

    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "funds_secured",
              fundedAt: now,
              lastUpdated: now,
            }
          : item,
      ),
    );

    setProfile((prev) => ({
      ...prev,
      jobsProtected: prev.jobsProtected + 1,
      totalEscrowed: prev.totalEscrowed + job.amount,
    }));

    setEscrow((prev) => ({
      ...prev,
      securedBalance: prev.securedBalance + job.amount,
      pendingFunding: Math.max(0, prev.pendingFunding - totalDue),
      transactions: [
        {
          id: `ctx-${Date.now()}`,
          type: "deposit",
          amount: totalDue,
          status: "completed",
          description: `Escrow funded — ${job.title}`,
          date: now,
          jobId,
        },
        ...prev.transactions,
      ],
    }));

    const chatNote: JobChatMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      sender: "client",
      text: `Escrow funded — ${formatNaira(totalDue)} secured for ${job.title}. You may begin work when ready.`,
      createdAt: now,
    };

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [...(prev[jobId] ?? []), chatNote],
    }));

    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Escrow funded",
        message: `${formatNaira(totalDue)} is now secured for ${job.title}.`,
        actionLabel: "View job",
        actionHref: `#${jobId}`,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);

    notifications
      .filter(
        (n) =>
          n.actionJobId === jobId &&
          (n.actionType === "review_agreement" || n.actionType === "fund_escrow"),
      )
      .forEach((n) => dismissNotification(n.id));

    setFunding(false);
    setFundingSuccess(job);
  };

  const handleFundJobFromEscrow = (job: ClientJob) => {
    setFundingSuccess(null);
    if (job.sentByArtisan) setAgreementJobId(job.id);
    else setFundJobId(job.id);
  };

  const closeFundModal = () => {
    setFundingSuccess(null);
    setFundJobId(null);
  };

  const closeAgreementModal = () => {
    setFundingSuccess(null);
    setAgreementJobId(null);
  };

  const openCreateJob = (artisan?: RecommendedArtisan) => {
    setPreselectedArtisan(artisan ?? null);
    setCreateJobOpen(true);
  };

  const closeCreateJob = () => {
    setCreateJobOpen(false);
    setPreselectedArtisan(null);
  };

  const openArtisanDetail = (artisan: RecommendedArtisan) => {
    setDetailArtisan(artisan);
  };

  const closeArtisanDetail = () => {
    setDetailArtisan(null);
  };

  const handleHireFromDetail = (artisan: RecommendedArtisan) => {
    setDetailArtisan(null);
    openCreateJob(artisan);
  };

  const handleCreateJob = async (
    form: CreateClientJobForm,
    artisan: RecommendedArtisan,
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const budget = Number(form.budget.replace(/,/g, "")) || 0;
    const now = new Date().toISOString();
    const jobId = `job-c${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const deadline = form.deadline
      ? new Date(`${form.deadline}T17:00:00`).toISOString()
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const newJob: ClientJob = {
      id: jobId,
      title: form.title.trim(),
      artisanName: artisan.fullName,
      artisanVerified: artisan.verified,
      artisanCategory: artisan.categoryLabel,
      location: form.location.trim() || `${profile.areaLabel}, Abuja`,
      amount: budget,
      status: "invitation_pending",
      priority: "normal",
      createdAt: now,
      deadline,
      invitationExpiresAt: expiresAt,
      sentByClient: true,
      agreementScope: form.specifications.trim(),
      lastUpdated: now,
    };

    setJobs((prev) => [newJob, ...prev]);

    const introMessage: JobChatMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      sender: "client",
      text: `Hi ${artisan.fullName.split(" ")[0]} — I'd like to hire you for "${form.title}". ${form.specifications.trim()}`,
      createdAt: now,
    };

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [introMessage],
    }));

    setNotifications((prev) => [
      {
        id: `cnotif-${Date.now()}`,
        type: "success",
        title: "Job invite sent",
        message: `"${form.title}" was sent to ${artisan.fullName}. They have 3 days to accept and send an agreement.`,
        actionLabel: "View job",
        actionHref: `#${jobId}`,
        createdAt: now,
        read: false,
      },
      ...prev,
    ]);
  };

  const handleApproveProof = async (jobId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    const now = new Date().toISOString();
    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? { ...item, status: "released", lastUpdated: now }
          : item,
      ),
    );

    setEscrow((prev) => ({
      ...prev,
      securedBalance: Math.max(0, prev.securedBalance - job.amount),
      transactions: [
        {
          id: `ctx-${Date.now()}`,
          type: "release",
          amount: job.amount,
          status: "completed",
          description: `Released to ${job.artisanName} — ${job.title}`,
          date: now,
          jobId,
        },
        ...prev.transactions,
      ],
    }));

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [
        ...(prev[jobId] ?? []),
        {
          id: `msg-${Date.now()}`,
          jobId,
          sender: "client",
          text: `Proof approved — ${formatNaira(job.amount)} released from escrow for ${job.title}.`,
          createdAt: now,
        },
      ],
    }));

    setProofJobId(null);
    notifications
      .filter((n) => n.actionJobId === jobId && n.actionType === "approve_proof")
      .forEach((n) => dismissNotification(n.id));
  };

  const handleDisputeProof = async (jobId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              status: "disputed",
              disputeReason:
                "You opened a dispute after reviewing proof. Amana is gathering evidence.",
              lastUpdated: new Date().toISOString(),
            }
          : item,
      ),
    );
    setProofJobId(null);
    setDetailState({ jobId, mode: "dispute" });
  };

  const handleApproveRelease = async (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);
    if (!job?.releaseRequestAmount) return;

    await new Promise((resolve) => setTimeout(resolve, 600));
    const amount = job.releaseRequestAmount;
    const now = new Date().toISOString();

    setJobs((prev) =>
      prev.map((item) =>
        item.id === jobId
          ? {
              ...item,
              releaseRequestAmount: undefined,
              lastUpdated: now,
            }
          : item,
      ),
    );

    setEscrow((prev) => ({
      ...prev,
      securedBalance: Math.max(0, prev.securedBalance - amount),
      pendingReleaseApproval: Math.max(0, prev.pendingReleaseApproval - amount),
      transactions: prev.transactions.map((tx) =>
        tx.jobId === jobId && tx.status === "awaiting_approval"
          ? { ...tx, status: "completed" as const, description: tx.description.replace("Release request", "Released") }
          : tx,
      ).concat({
        id: `ctx-${Date.now()}`,
        type: "release",
        amount,
        status: "completed",
        description: `Released to ${job.artisanName} — ${job.title}`,
        date: now,
        jobId,
      }),
    }));

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [
        ...(prev[jobId] ?? []),
        {
          id: `msg-${Date.now()}`,
          jobId,
          sender: "client",
          text: `Release approved — ${formatNaira(amount)} sent from escrow to ${job.artisanName}'s bank.`,
          createdAt: now,
        },
      ],
    }));

    setReleaseJobId(null);
    notifications
      .filter((n) => n.actionJobId === jobId && n.actionType === "approve_release")
      .forEach((n) => dismissNotification(n.id));
  };

  const fundJob = jobs.find((j) => j.id === fundJobId) ?? null;
  const agreementJob = jobs.find((j) => j.id === agreementJobId) ?? null;
  const proofJob = jobs.find((j) => j.id === proofJobId) ?? null;
  const releaseJob = jobs.find((j) => j.id === releaseJobId) ?? null;
  const detailJob = detailState
    ? (jobs.find((j) => j.id === detailState.jobId) ?? null)
    : null;
  const unreadAlerts = notifications.filter((item) => !item.read);

  return (
    <>
      <ClientDashboardNav />

      <main className="adash-main">
        <div className="adash-container">
          <header className="adash-welcome">
            <div>
              <p className="adash-eyebrow">Client Dashboard</p>
              <h1>Good {getGreeting()}, {profile.fullName.split(" ")[0]}</h1>
              <p className="adash-welcome-text">
                Fund escrow, approve proof, and release payments only when work
                meets your agreement — your money stays protected until then.
              </p>
            </div>
          </header>

          <ClientEscrowPanel
            escrow={escrow}
            profile={profile}
            awaitingFundingJobs={awaitingFundingJobs}
            canFundJobs={canFundJobs}
            onFundJob={handleFundJobFromEscrow}
            onOpenPaymentSettings={() => openProfileSettings("payment")}
          />
          <ClientStatusBanner profile={profile} />
          <ClientAlerts
            alerts={unreadAlerts}
            onDismiss={dismissNotification}
            onAction={handleAlertAction}
          />
          <ClientStats {...stats} />

          <ClientArtisanWall
            artisans={MOCK_RECOMMENDED_ARTISANS}
            clientAreaLabel={profile.areaLabel}
            onCreateJob={() => openCreateJob()}
            onViewArtisan={openArtisanDetail}
          />

          <div className="adash-layout">
            <ClientJobsPanel
              jobs={jobs}
              canFundJobs={canFundJobs}
              onPrimaryAction={(job, action) => runJobAction(action, job.id)}
              onMessageArtisan={(job) => openChat(job.id)}
              onCancelInvite={(jobId) => runJobAction("cancel_invite", jobId)}
            />
            <ClientProfileCard />
          </div>

          <ClientReviews reviews={MOCK_CLIENT_REVIEWS} />

          <footer className="adash-disclaimer">
            Amana is a technology platform, not a bank or financial institution.
            Escrow custody is provided by our CBN-licensed partner financial
            institution. Never pay artisans outside the platform.
          </footer>
        </div>
      </main>

      <ClientJobModals
        fundJob={fundJob}
        agreementJob={agreementJob}
        proofJob={proofJob}
        releaseJob={releaseJob}
        detailJob={detailJob}
        detailMode={detailState?.mode ?? null}
        escrow={escrow}
        canFundJobs={canFundJobs}
        funding={funding}
        fundingSuccess={fundingSuccess}
        onCloseFund={closeFundModal}
        onCloseAgreement={closeAgreementModal}
        onCloseProof={() => setProofJobId(null)}
        onCloseRelease={() => setReleaseJobId(null)}
        onCloseDetail={() => setDetailState(null)}
        onConfirmFund={handleConfirmFund}
        onApproveProof={handleApproveProof}
        onDisputeProof={handleDisputeProof}
        onApproveRelease={handleApproveRelease}
        onOpenPaymentSettings={() => openProfileSettings("payment")}
      />

      <ClientArtisanDetailModal
        artisan={detailArtisan}
        onClose={closeArtisanDetail}
        onHire={handleHireFromDetail}
      />

      <CreateClientJobModal
        open={createJobOpen}
        artisans={MOCK_RECOMMENDED_ARTISANS}
        defaultAreaLabel={profile.areaLabel}
        preselectedArtisan={preselectedArtisan}
        onClose={closeCreateJob}
        onSubmit={handleCreateJob}
        onViewArtisan={(artisan) => {
          setCreateJobOpen(false);
          openArtisanDetail(artisan);
        }}
      />

      <button
        type="button"
        className="adash-fab"
        onClick={() => openCreateJob()}
        aria-label="Create a protected job"
      >
        <Briefcase size={20} weight="bold" />
        Create job
      </button>
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
