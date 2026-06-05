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

export default function ArtisanDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    wallet,
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
          setDetailState({ jobId, mode: "dispute" });
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

  const proofJob = jobs.find((job) => job.id === proofJobId) ?? null;
  const inviteJob = jobs.find((job) => job.id === inviteJobId) ?? null;
  const detailJob = detailState
    ? (jobs.find((job) => job.id === detailState.jobId) ?? null)
    : null;
  const invoiceJob = jobs.find((job) => job.id === invoiceJobId) ?? null;

  const unreadAlerts = notifications.filter((item) => !item.read);

  return (
    <div className="adash-page">
      <ArtisanDashboardNav currentPage="dashboard" />

      <main className="adash-main">
        <div className="adash-container">
          <header className="adash-welcome">
            <div>
              <p className="adash-eyebrow">Artisan Dashboard</p>
              <h1>Good {getGreeting()}, {profile.fullName.split(" ")[0]}</h1>
              <p className="adash-welcome-text">
                Manage secured jobs, upload proof of work, and track payments —
                all held safely in escrow until approval.
              </p>
            </div>
          </header>

          <ArtisanWalletSection wallet={wallet} profile={profile} />
          <ArtisanStatusBanner profile={profile} />
          <ArtisanAlerts
            alerts={unreadAlerts}
            onDismiss={dismissNotification}
            onAction={handleAlertAction}
          />
          <ArtisanStats {...stats} />

          <ArtisanProPromo profile={profile} />

          <div className="adash-layout">
            <ArtisanJobsPanel
              jobs={jobs}
              canAcceptJobs={canAcceptJobs}
              onPrimaryAction={handleJobPrimaryAction}
              onDeclineInvite={handleDeclineInvite}
              onMessageClient={(job) => openChat(job.id)}
              onCreateInvoice={(job) => setInvoiceJobId(job.id)}
            />
            <ArtisanProfileCard />
          </div>

          <ArtisanReviews reviews={MOCK_REVIEWS} />

          <footer className="adash-disclaimer">
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
