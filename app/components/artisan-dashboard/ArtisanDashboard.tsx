"use client";

import { useMemo, useState } from "react";
import ArtisanDashboardNav from "./ArtisanDashboardNav";
import ArtisanStatusBanner from "./ArtisanStatusBanner";
import ArtisanStats from "./ArtisanStats";
import ArtisanAlerts from "./ArtisanAlerts";
import ArtisanWalletSection from "./ArtisanWallet";
import ArtisanJobsPanel from "./ArtisanJobsPanel";
import ArtisanProfileCard from "./ArtisanProfileCard";
import ArtisanReviews from "./ArtisanReviews";
import ArtisanProofUploadModal from "./ArtisanProofUploadModal";
import {
  MOCK_ALERTS,
  MOCK_ARTISAN,
  MOCK_JOBS,
  MOCK_REVIEWS,
  MOCK_WALLET,
  buildDashboardStats,
} from "./mock-data";
import type {
  ArtisanJob,
  ArtisanProfile,
  ArtisanWallet,
  DashboardAlert,
  JobPrimaryAction,
} from "./types";

type ArtisanDashboardProps = {
  profile?: ArtisanProfile;
};

export default function ArtisanDashboard({
  profile: initialProfile = MOCK_ARTISAN,
}: ArtisanDashboardProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [wallet, setWallet] = useState(MOCK_WALLET);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [proofJobId, setProofJobId] = useState<string | null>(null);

  const stats = useMemo(() => buildDashboardStats(jobs), [jobs]);

  const canAcceptJobs =
    profile.verificationStatus === "verified" && profile.profileComplete;

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const openProofUpload = (jobId: string) => {
    setProofJobId(jobId);
    document.getElementById(jobId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleJobPrimaryAction = (job: ArtisanJob, action: JobPrimaryAction) => {
    switch (action) {
      case "upload_proof":
        openProofUpload(job.id);
        break;
      case "start_work":
        setJobs((prev) =>
          prev.map((item) =>
            item.id === job.id
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
  };

  const handleAlertAction = (alert: DashboardAlert) => {
    if (alert.actionType === "upload_proof" && alert.actionJobId) {
      openProofUpload(alert.actionJobId);
    }
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
    setAlerts((prev) =>
      prev.filter(
        (alert) =>
          !(alert.actionType === "upload_proof" && alert.actionJobId === jobId),
      ),
    );
  };

  const proofJob = jobs.find((job) => job.id === proofJobId) ?? null;

  const handleAccountChange = (data: { phone: string; email: string }) => {
    setProfile((prev) => ({ ...prev, phone: data.phone, email: data.email }));
  };

  const handlePayoutChange = (payout: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    setWallet((prev) => ({
      ...prev,
      bankAccount: {
        bankName: payout.bankName,
        accountNumber: payout.accountNumber,
        accountName: payout.accountName,
      },
    }));
    setProfile((prev) => ({ ...prev, payoutStatus: "pending" }));
  };

  return (
    <div className="adash-page">
      <ArtisanDashboardNav
        artisanName={profile.fullName}
        unreadNotifications={alerts.length}
      />

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
            alerts={alerts}
            onDismiss={dismissAlert}
            onAction={handleAlertAction}
          />
          <ArtisanStats {...stats} />

          <div className="adash-layout">
            <ArtisanJobsPanel
              jobs={jobs}
              canAcceptJobs={canAcceptJobs}
              onPrimaryAction={handleJobPrimaryAction}
            />
            <ArtisanProfileCard
              profile={profile}
              bankAccount={wallet.bankAccount}
              onProfileChange={setProfile}
              onAccountChange={handleAccountChange}
              onPayoutChange={handlePayoutChange}
            />
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
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
