"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bank,
  LockSimple,
  Info,
  X,
} from "phosphor-react";
import type { ArtisanProfile, ArtisanWallet } from "./types";
import { formatNaira } from "./utils";
import VaultIcon from "./VaultIcon";

type ArtisanWalletProps = {
  wallet: ArtisanWallet;
  profile: ArtisanProfile;
  onWithdraw?: (amount: number) => Promise<void> | void;
};

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return `···${accountNumber.slice(-4)}`;
}

export default function ArtisanWalletSection({
  wallet: initialWallet,
  profile,
  onWithdraw,
}: ArtisanWalletProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  const parsedAmount = Number(amount.replace(/,/g, ""));
  const hasBank = wallet.bankAccount !== null && profile.payoutStatus === "verified";
  const canWithdraw =
    hasBank &&
    wallet.availableBalance >= wallet.minWithdrawal &&
    wallet.pendingWithdrawal === 0;

  const validateWithdrawal = (value: number): string | null => {
    if (!hasBank) return "Link a verified bank account before withdrawing.";
    if (profile.payoutStatus === "pending") {
      return "Your bank account is still being verified.";
    }
    if (wallet.pendingWithdrawal > 0) {
      return "You already have a withdrawal in progress.";
    }
    if (!value || Number.isNaN(value)) return "Enter a valid amount.";
    if (value < wallet.minWithdrawal) {
      return `Minimum withdrawal is ${formatNaira(wallet.minWithdrawal)}.`;
    }
    if (value > wallet.availableBalance) {
      return "Amount exceeds your available balance.";
    }
    return null;
  };

  const handleWithdraw = async () => {
    const error = validateWithdrawal(parsedAmount);
    if (error) {
      setWithdrawError(error);
      return;
    }

    setWithdrawing(true);
    setWithdrawError(null);

    try {
      if (onWithdraw) {
        await onWithdraw(parsedAmount);
      }

      setWallet((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance - parsedAmount,
        pendingWithdrawal: parsedAmount,
        transactions: [
          {
            id: `txn-${Date.now()}`,
            type: "withdrawal",
            amount: parsedAmount,
            status: "pending",
            description: `Withdrawal to ${prev.bankAccount?.bankName} ${maskAccountNumber(prev.bankAccount?.accountNumber ?? "")}`,
            date: new Date().toISOString(),
          },
          ...prev.transactions,
        ],
      }));

      setWithdrawSuccess(
        `${formatNaira(parsedAmount)} withdrawal initiated. Funds typically arrive within 24 hours.`,
      );
      setAmount("");
      setShowWithdraw(false);
    } catch {
      setWithdrawError("Withdrawal failed. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <section className="adash-wallet" id="wallet">
      <div className="adash-wallet-header">
        <div>
          <p className="adash-eyebrow">amana vault</p>
        </div>
        <span className="adash-wallet-icon-wrap">
          <VaultIcon size={72} />
        </span>
      </div>

      <div className="adash-wallet-balance-card">
      <h2 className="adash-wallet-title">
            <VaultIcon size={50} variant="white"/>
            Secured in Escrow
          </h2>
        <p className="adash-wallet-balance-value">
          {formatNaira(wallet.availableBalance)}
        </p>

        <div className="adash-wallet-breakdown">
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowDown size={14} weight="bold" />
              Incoming
            </span>
            <strong>{formatNaira(wallet.incomingBalance)}</strong>
            <small>Processing to your bank</small>
          </div>
          <div>
            <span className="adash-wallet-breakdown-label">
              <ArrowUp size={14} weight="bold" />
              Pending withdrawal
            </span>
            <strong>{formatNaira(wallet.pendingWithdrawal)}</strong>
            <small>Awaiting client approval</small>

          </div>
        </div>

        <div className="adash-wallet-actions">
          <button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => {
              setShowWithdraw(true);
              setWithdrawError(null);
              setWithdrawSuccess(null);
            }}
            disabled={!canWithdraw}
            title={
              !hasBank
                ? "Add a verified bank account first"
                : wallet.availableBalance < wallet.minWithdrawal
                  ? `Minimum withdrawal is ${formatNaira(wallet.minWithdrawal)}`
                  : undefined
            }
          >
            <VaultIcon size={35} />
            Request to withdraw
          </button>
        </div>

        {!hasBank && (
          <p className="adash-wallet-blocked">
            <Bank size={16} weight="bold" />
            Add a verified bank account in your profile to withdraw earnings.
          </p>
        )}

        {wallet.availableBalance > 0 && wallet.availableBalance < wallet.minWithdrawal && (
          <p className="adash-wallet-blocked">
            <Info size={16} weight="bold" />
            Minimum withdrawal is {formatNaira(wallet.minWithdrawal)}.
          </p>
        )}
      </div>

      {withdrawSuccess && (
        <div className="adash-wallet-success" role="status">
          <Info size={18} weight="bold" />
          {withdrawSuccess}
        </div>
      )}

      <div className="adash-wallet-bank">
        <h3>
          <Bank size={18} weight="bold" />
          Payout account
        </h3>
        {wallet.bankAccount ? (
          <div className="adash-wallet-bank-details">
            <div>
              <span>Bank</span>
              <strong>{wallet.bankAccount.bankName}</strong>
            </div>
            <div>
              <span>Account</span>
              <strong>{maskAccountNumber(wallet.bankAccount.accountNumber)}</strong>
            </div>
            <div>
              <span>Name</span>
              <strong>{wallet.bankAccount.accountName}</strong>
            </div>
          </div>
        ) : (
          <p className="adash-wallet-bank-empty">No bank account linked yet.</p>
        )}
      </div>

      <div className="adash-wallet-history">
        <h3>Recent activity</h3>
        {wallet.transactions.length === 0 ? (
          <p className="adash-wallet-history-empty">
            Completed job payments will appear here.
          </p>
        ) : (
          <ul className="adash-wallet-tx-list">
            {wallet.transactions.map((tx) => (
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
                    className={`adash-wallet-tx-amount adash-wallet-tx-amount--${tx.type}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatNaira(tx.amount)}
                  </span>
                  <span className={`adash-wallet-tx-status adash-wallet-tx-status--${tx.status}`}>
                    {tx.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="adash-wallet-disclaimer">
        <LockSimple size={14} weight="bold" />
        Withdrawals are sent to your linked bank via our CBN-licensed partner.
        Amana does not hold your funds directly.
      </p>

      {showWithdraw && (
        <div className="adash-modal-overlay" role="presentation" onClick={() => setShowWithdraw(false)}>
          <div
            className="adash-modal"
            role="dialog"
            aria-labelledby="withdraw-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adash-modal-header">
              <h3 id="withdraw-title">Withdraw funds</h3>
              <button
                type="button"
                className="adash-modal-close"
                onClick={() => setShowWithdraw(false)}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <p className="adash-modal-subtext">
              Available: <strong>{formatNaira(wallet.availableBalance)}</strong>
            </p>

            <div className="adash-field">
              <label className="adash-label" htmlFor="withdraw-amount">
                Amount (NGN)
              </label>
              <input
                id="withdraw-amount"
                type="number"
                className={`adash-input${withdrawError ? " adash-input--error" : ""}`}
                placeholder={`Min ${wallet.minWithdrawal.toLocaleString()}`}
                min={wallet.minWithdrawal}
                max={wallet.availableBalance}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setWithdrawError(null);
                }}
              />
              <button
                type="button"
                className="adash-link-btn"
                onClick={() => setAmount(String(wallet.availableBalance))}
              >
                Withdraw all
              </button>
            </div>

            {wallet.bankAccount && (
              <p className="adash-modal-bank">
                Sending to {wallet.bankAccount.bankName}{" "}
                {maskAccountNumber(wallet.bankAccount.accountNumber)}
              </p>
            )}

            {withdrawError && (
              <p className="adash-field-error" role="alert">
                {withdrawError}
              </p>
            )}

            <div className="adash-modal-actions">
              <button
                type="button"
                className="adash-btn adash-btn--ghost"
                onClick={() => setShowWithdraw(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
