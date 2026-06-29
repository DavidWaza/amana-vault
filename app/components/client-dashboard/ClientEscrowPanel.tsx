"use client";

import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  LockSimple,
  ShieldCheck,
  Wallet,
} from "phosphor-react";
import type { ClientEscrow, ClientJob, ClientProfile } from "./types";
import { calculateClientTotalDue, formatNaira } from "./utils";
import ClientPanelEmptyState from "./ClientPanelEmptyState";
import VaultIcon from "../artisan-dashboard/VaultIcon";

type ClientEscrowPanelProps = {
  escrow: ClientEscrow;
  profile: ClientProfile;
  awaitingFundingJobs: ClientJob[];
  canFundJobs: boolean;
  onFundJob: (job: ClientJob) => void;
  onOpenPaymentSettings: () => void;
};

function formatTxStatus(status: string): string {
  if (status === "awaiting_approval") return "awaiting your approval";
  if (status === "pending") return "processing";
  return status;
}

export default function ClientEscrowPanel({
  escrow,
  profile,
  awaitingFundingJobs,
  canFundJobs,
  onFundJob,
  onOpenPaymentSettings,
}: ClientEscrowPanelProps) {
  const hasPaymentMethod = profile.paymentMethodStatus === "verified" && escrow.paymentMethod;

  return (
    <section className="adash-wallet" id="escrow">
      <div className="adash-wallet-header">
        <div>
          <p className="adash-eyebrow">amana vault</p>
          <h2>Your protected payments</h2>
          <p className="adash-wallet-note">
            Fund escrow to secure agreements. Money stays protected until you approve
            proof and release requests.
          </p>
        </div>
        <span className="adash-wallet-icon-wrap">
          <VaultIcon size={72} />
        </span>
      </div>

      <div className="adash-wallet-balance-card">
        <h2 className="adash-wallet-title">
          <VaultIcon size={50} variant="white" />
          Total in Escrow
        </h2>
        <p className="adash-wallet-balance-value">
          {formatNaira(escrow.securedBalance)}
        </p>

        <div className="adash-wallet-breakdown">
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowDown size={14} weight="bold" />
              Pending funding
            </span>
            <strong>{formatNaira(escrow.pendingFunding)}</strong>
            <small>Agreements awaiting your payment</small>
          </div>
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowUp size={14} weight="bold" />
              Release requests
            </span>
            <strong>{formatNaira(escrow.pendingReleaseApproval)}</strong>
            <small>Awaiting your approval</small>
          </div>
        </div>

        {awaitingFundingJobs.length > 0 && (
          <div className="cdash-fund-queue">
            <h3>
              <Wallet size={18} weight="bold" />
              Ready to fund
            </h3>
            <ul className="cdash-fund-queue-list">
              {awaitingFundingJobs.map((job) => {
                const totalDue = calculateClientTotalDue(job.amount, job.protectionFee);
                return (
                  <li key={job.id} className="cdash-fund-queue-item">
                    <div className="cdash-fund-queue-info">
                      <strong>{job.title}</strong>
                      <span>
                        {job.artisanName} · {formatNaira(totalDue)} total
                      </span>
                    </div>
                    <button
                      type="button"
                      className="adash-btn adash-btn--primary cdash-fund-queue-btn"
                      disabled={!canFundJobs}
                      title={
                        !canFundJobs
                          ? "Verify identity and add a payment method first"
                          : undefined
                      }
                      onClick={() =>
                        canFundJobs ? onFundJob(job) : onOpenPaymentSettings()
                      }
                    >
                      {job.sentByArtisan ? "Review & Fund" : "Fund escrow"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="adash-wallet-actions">
          {escrow.pendingFunding > 0 && awaitingFundingJobs.length > 0 ? (
            <button
              type="button"
              className="adash-btn adash-btn--primary"
              disabled={!canFundJobs}
              onClick={() => {
                if (!canFundJobs) {
                  onOpenPaymentSettings();
                  return;
                }
                onFundJob(awaitingFundingJobs[0]);
              }}
            >
              <ShieldCheck size={18} weight="bold" />
              Fund escrow — {formatNaira(escrow.pendingFunding)}
            </button>
          ) : escrow.securedBalance === 0 && awaitingFundingJobs.length === 0 ? (
            <p className="adash-wallet-blocked adash-wallet-blocked--muted">
              <LockSimple size={16} weight="bold" />
              When an artisan sends an agreement, fund it here to secure your payment.
            </p>
          ) : null}
        </div>

        {!canFundJobs && (
          <p className="adash-wallet-blocked">
            <CreditCard size={16} weight="bold" />
            {profile.verificationStatus !== "verified"
              ? "Verify your identity in profile settings to fund escrow."
              : "Add a verified payment method in your profile to fund escrow."}
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

      <div className="adash-wallet-bank">
        <h3>
          <CreditCard size={18} weight="bold" />
          Payment method
        </h3>
        {escrow.paymentMethod ? (
          <div className="adash-wallet-bank-details">
            <div>
              <span>Method</span>
              <strong>{escrow.paymentMethod.label}</strong>
            </div>
            <div>
              <span>Ending in</span>
              <strong>···· {escrow.paymentMethod.lastFour}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                {hasPaymentMethod ? "Verified" : "Pending verification"}
              </strong>
            </div>
          </div>
        ) : (
          <p className="adash-wallet-bank-empty">No payment method linked yet.</p>
        )}
        {!hasPaymentMethod && (
          <button
            type="button"
            className="adash-btn adash-btn--secondary cdash-wallet-add-payment"
            onClick={onOpenPaymentSettings}
          >
            Add payment method
          </button>
        )}
      </div>

      <div className="adash-wallet-history">
        <h3>Escrow activity</h3>
        {escrow.transactions.length === 0 ? (
          <ClientPanelEmptyState
            variant="vault-activity"
            title="No escrow activity yet"
            message="Deposits and releases will appear here once you fund jobs."
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
        Your money is held by our CBN-licensed partner until you approve releases.
        Amana is a technology platform, not a bank.
      </p>
    </section>
  );
}
