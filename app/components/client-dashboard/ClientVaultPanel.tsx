"use client";

import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  LockSimple,
  ShieldCheck,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { ClientEscrow, ClientProject, ClientProfile, VaultMilestone } from "./types";
import { calculateClientTotalDue, formatNaira } from "./utils";
import VaultIcon from "../artisan-dashboard/VaultIcon";
import ClientPanelEmptyState from "./ClientPanelEmptyState";

type ClientVaultPanelProps = {
  escrow: ClientEscrow;
  profile: ClientProfile;
  projects: ClientProject[];
  awaitingFundingProjects: ClientProject[];
  canFundJobs: boolean;
  onFundProject: (project: ClientProject) => void;
  onOpenPaymentSettings: () => void;
  onApproveMilestone?: (project: ClientProject) => void;
};

const MILESTONE_STATUS_LABELS: Record<VaultMilestone["status"], string> = {
  locked: "Locked",
  active: "Active",
  inspection: "Inspection",
  approved: "Approved",
  released: "Released",
};

function formatTxStatus(status: string): string {
  if (status === "awaiting_approval") return "awaiting your approval";
  if (status === "pending") return "processing";
  return status;
}

export default function ClientVaultPanel({
  escrow,
  profile,
  projects,
  awaitingFundingProjects,
  canFundJobs,
  onFundProject,
  onOpenPaymentSettings,
  onApproveMilestone,
}: ClientVaultPanelProps) {
  const hasPaymentMethod =
    profile.paymentMethodStatus === "verified" && escrow.paymentMethod;

  const vaultProjects = projects.filter(
    (p) => p.vaultMilestones && p.vaultMilestones.length > 0,
  );

  const remainingBalance = escrow.securedBalance;

  return (
    <section className="adash-wallet cdash-vault-panel" id="vault">
      <div className="adash-wallet-header">
        <div>
          <p className="adash-eyebrow">Amana Vault</p>
          <h2>Your protected project funds</h2>
          <p className="adash-wallet-note">
            Milestone-based releases keep your money protected until independent
            inspection and your approval.
          </p>
        </div>
        <span className="adash-wallet-icon-wrap">
          <VaultIcon size={72} />
        </span>
      </div>

      <div className="cdash-vault-summary">
        <article className="cdash-vault-stat">
          <span>Total Protected</span>
          <strong>{formatNaira(escrow.securedBalance)}</strong>
        </article>
        <article className="cdash-vault-stat">
          <span>Released Amount</span>
          <strong>{formatNaira(escrow.releasedTotal)}</strong>
        </article>
        <article className="cdash-vault-stat">
          <span>Remaining Balance</span>
          <strong>{formatNaira(remainingBalance)}</strong>
        </article>
      </div>

      {vaultProjects.map((project) => (
        <div key={project.id} className="cdash-vault-project">
          <div className="cdash-vault-project-header">
            <h3>{project.title}</h3>
            <span>{formatNaira(project.amount)} total value</span>
          </div>
          <ol className="cdash-milestone-track">
            {project.vaultMilestones?.map((milestone, index) => (
              <li
                key={milestone.id}
                className={`cdash-milestone-step cdash-milestone-step--${milestone.status}`}
              >
                <div className="cdash-milestone-step-marker">{index + 1}</div>
                <div className="cdash-milestone-step-body">
                  <div className="cdash-milestone-step-top">
                    <strong>{milestone.label}</strong>
                    <span className={`cdash-milestone-status cdash-milestone-status--${milestone.status}`}>
                      {MILESTONE_STATUS_LABELS[milestone.status]}
                    </span>
                  </div>
                  <span>{formatNaira(milestone.amount)}</span>
                  {milestone.status === "inspection" && onApproveMilestone && (
                    <Button
                      type="button"
                      className="adash-btn adash-btn--primary adash-btn--sm"
                      onClick={() => onApproveMilestone(project)}
                      loadingLabel="Opening…"
                    >
                      Review & Approve
                    </Button>
                  )}
                  {milestone.inspectorName && milestone.status !== "locked" && (
                    <small>Inspector: {milestone.inspectorName}</small>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div className="adash-wallet-balance-card">
        <div className="adash-wallet-breakdown">
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowDown size={14} weight="bold" />
              Pending vault activation
            </span>
            <strong>{formatNaira(escrow.pendingFunding)}</strong>
            <small>Projects awaiting vault funding</small>
          </div>
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowUp size={14} weight="bold" />
              Pending approval
            </span>
            <strong>{formatNaira(escrow.pendingReleaseApproval)}</strong>
            <small>Milestones awaiting your release</small>
          </div>
        </div>

        {awaitingFundingProjects.length > 0 && (
          <div className="cdash-fund-queue">
            <h3>Ready to activate vault</h3>
            <ul className="cdash-fund-queue-list">
              {awaitingFundingProjects.map((project) => {
                const totalDue = calculateClientTotalDue(
                  project.amount,
                  project.protectionFee,
                );
                return (
                  <li key={project.id} className="cdash-fund-queue-item">
                    <div className="cdash-fund-queue-info">
                      <strong>{project.title}</strong>
                      <span>{formatNaira(totalDue)} total</span>
                    </div>
                    <Button
                      type="button"
                      className="adash-btn adash-btn--primary cdash-fund-queue-btn"
                      disabled={!canFundJobs}
                      onClick={() =>
                        canFundJobs ? onFundProject(project) : onOpenPaymentSettings()
                      }
                    >
                      Activate Vault
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!canFundJobs && (
          <p className="adash-wallet-blocked">
            <CreditCard size={16} weight="bold" />
            Verify your identity and add a payment method to activate project vaults.
            <button
              type="button"
              className="cdash-wallet-setup-link"
              onClick={onOpenPaymentSettings}
            >
              Set up now
            </button>
          </p>
        )}
      </div>

      <div className="adash-wallet-history">
        <h3>Vault activity</h3>
        {escrow.transactions.length === 0 ? (
          <ClientPanelEmptyState
            variant="vault-activity"
            title="No vault activity yet"
            message="Deposits and milestone releases will appear here."
            compact
          />
        ) : (
          <ul className="adash-wallet-tx-list">
            {escrow.transactions.map((tx) => (
              <li key={tx.id} className="adash-wallet-tx">
                <div>
                  <strong>{tx.description}</strong>
                  <span>
                    {new Date(tx.date).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="adash-wallet-tx-right">
                  <span
                    className={`adash-wallet-tx-amount adash-wallet-tx-amount--${tx.type === "deposit" ? "credit" : "withdrawal"}`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {formatNaira(tx.amount)}
                  </span>
                  <span className={`adash-wallet-tx-status adash-wallet-tx-status--${tx.status}`}>
                    {formatTxStatus(tx.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="adash-wallet-disclaimer">
        <LockSimple size={14} weight="bold" />
        <ShieldCheck size={14} weight="bold" />
        Your project funds are held by our CBN-licensed partner until you approve each
        milestone release. Amana is a technology platform, not a bank.
      </p>
    </section>
  );
}
