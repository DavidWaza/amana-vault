"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bank,
  LockSimple,
  Info,
  X,
  UserCircle,
} from "phosphor-react";
import type { ArtisanProfile, ArtisanWallet, WalletTransactionStatus } from "./types";
import { formatNaira } from "./utils";
import VaultIcon from "./VaultIcon";
import {
  adashBtn,
  adashBtnGhost,
  adashBtnPrimary,
  adashEyebrow,
  adashField,
  adashFieldError,
  adashInput,
  adashInputError,
  adashLabel,
  adashLinkBtn,
  adashModal,
  adashModalActions,
  adashModalClose,
  adashModalHeader,
  adashModalOverlay,
} from "./ui";

type ArtisanWalletProps = {
  wallet: ArtisanWallet;
  profile: ArtisanProfile;
  onRequestRelease?: (amount: number) => Promise<void> | void;
};

function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return `···${accountNumber.slice(-4)}`;
}

function formatTxStatus(status: WalletTransactionStatus): string {
  switch (status) {
    case "awaiting_approval":
      return "awaiting client approval";
    case "pending":
      return "processing to bank";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return status;
  }
}

export default function ArtisanWalletSection({
  wallet,
  profile,
  onRequestRelease,
}: ArtisanWalletProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  const parsedAmount = Number(amount.replace(/,/g, ""));
  const hasBank = wallet.bankAccount !== null && profile.payoutStatus === "verified";
  const canRequestRelease =
    hasBank &&
    wallet.availableBalance >= wallet.minWithdrawal &&
    wallet.pendingWithdrawal === 0;

  const validateReleaseRequest = (value: number): string | null => {
    if (!hasBank) return "Link a verified bank account before requesting a release.";
    if (profile.payoutStatus === "pending") {
      return "Your bank account is still being verified.";
    }
    if (wallet.pendingWithdrawal > 0) {
      return "You already have a release request awaiting client approval.";
    }
    if (!value || Number.isNaN(value)) return "Enter a valid amount.";
    if (value < wallet.minWithdrawal) {
      return `Minimum release request is ${formatNaira(wallet.minWithdrawal)}.`;
    }
    if (value > wallet.availableBalance) {
      return "Amount exceeds your available balance.";
    }
    return null;
  };

  const handleRequestRelease = async () => {
    const error = validateReleaseRequest(parsedAmount);
    if (error) {
      setWithdrawError(error);
      return;
    }

    setSubmitting(true);
    setWithdrawError(null);

    try {
      if (onRequestRelease) {
        await onRequestRelease(parsedAmount);
      }

      setWithdrawSuccess(
        `${formatNaira(parsedAmount)} release request sent to your client. Funds stay in escrow until they approve — only then will payment be sent to your bank.`,
      );
      setAmount("");
      setShowWithdraw(false);
    } catch {
      setWithdrawError("Release request failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const txAmountTone: Record<string, string> = {
    credit: "text-green2",
    withdrawal: "text-text",
  };
  const txStatusTone: Record<string, string> = {
    completed: "text-green2",
    awaiting_approval: "text-[#b45309]",
    pending: "text-green2",
    failed: "text-[#c53030]",
  };

  return (
    <section
      className="grid gap-5 p-6 rounded-3xl bg-white border border-solid border-line shadow-brand-sm"
      id="wallet"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className={adashEyebrow}>amana vault</p>
        </div>
        <span className="grid place-items-center w-13 h-13 rounded-2xl bg-soft text-green2 shrink-0">
          <VaultIcon size={72} />
        </span>
      </div>

      <div className="p-[1.35rem] rounded-[20px] bg-[linear-gradient(135deg,var(--green),var(--green2))] text-white">
        <h2 className="flex items-center">
          <VaultIcon size={50} variant="white" />
          Secured in Escrow
        </h2>
        <p className="mt-[0.35rem] mb-5 text-[clamp(2rem,4vw,2.75rem)] font-black tracking-[-0.03em]">
          {formatNaira(wallet.availableBalance)}
        </p>

        <div className="grid grid-cols-2 gap-[0.85rem] mb-5">
          <div className="p-[0.85rem] rounded-[14px] bg-white/12">
            <span className="inline-flex items-center gap-[0.35rem] text-[0.75rem] font-bold opacity-90">
              <ArrowDown size={14} weight="bold" />
              Incoming
            </span>
            <strong className="block mt-[0.35rem] text-[1.1rem]">{formatNaira(wallet.incomingBalance)}</strong>
            <small className="block mt-[0.15rem] text-[0.72rem] opacity-80">On secured jobs awaiting release</small>
          </div>
          <div className="p-[0.85rem] rounded-[14px] bg-white/12">
            <span className="inline-flex items-center gap-[0.35rem] text-[0.75rem] font-bold opacity-90">
              <ArrowUp size={14} weight="bold" />
              Pending release
            </span>
            <strong className="block mt-[0.35rem] text-[1.1rem]">{formatNaira(wallet.pendingWithdrawal)}</strong>
            <small className="block mt-[0.15rem] text-[0.72rem] opacity-80">Awaiting client approval</small>
          </div>
        </div>

        <div className="flex flex-wrap">
          <button
            type="button"
            className={`${adashBtn} bg-white text-green border-0 enabled:hover:bg-soft disabled:bg-white/35 disabled:text-white/70`}
            onClick={() => {
              setShowWithdraw(true);
              setWithdrawError(null);
              setWithdrawSuccess(null);
            }}
            disabled={!canRequestRelease}
            title={
              !hasBank
                ? "Add a verified bank account first"
                : wallet.availableBalance < wallet.minWithdrawal
                  ? `Minimum release request is ${formatNaira(wallet.minWithdrawal)}`
                  : undefined
            }
          >
            <VaultIcon size={35} />
            Request release
          </button>
        </div>

        {!hasBank && (
          <p className="flex items-start gap-2 mt-[0.85rem] text-[0.85rem] leading-[1.5] text-white/92">
            <Bank size={16} weight="bold" />
            Add a verified bank account in your profile to request fund releases.
          </p>
        )}

        {wallet.availableBalance > 0 && wallet.availableBalance < wallet.minWithdrawal && (
          <p className="flex items-start gap-2 mt-[0.85rem] text-[0.85rem] leading-[1.5] text-white/92">
            <Info size={16} weight="bold" />
            Minimum release request is {formatNaira(wallet.minWithdrawal)}.
          </p>
        )}
      </div>

      {withdrawSuccess && (
        <div
          className="flex items-start gap-[0.6rem] px-4 py-[0.9rem] rounded-[14px] bg-soft border border-solid border-line text-green text-[0.88rem] leading-[1.5]"
          role="status"
        >
          <Info size={18} weight="bold" />
          {withdrawSuccess}
        </div>
      )}

      <div>
        <h3 className="flex items-center gap-[0.45rem] mt-0 mb-3 text-base text-green">
          <Bank size={18} weight="bold" />
          Payout account
        </h3>
        {wallet.bankAccount ? (
          <div className="grid gap-[0.55rem]">
            <div className="flex justify-between gap-3 text-[0.88rem]">
              <span className="text-muted">Bank</span>
              <strong>{wallet.bankAccount.bankName}</strong>
            </div>
            <div className="flex justify-between gap-3 text-[0.88rem]">
              <span className="text-muted">Account</span>
              <strong>{maskAccountNumber(wallet.bankAccount.accountNumber)}</strong>
            </div>
            <div className="flex justify-between gap-3 text-[0.88rem]">
              <span className="text-muted">Name</span>
              <strong>{wallet.bankAccount.accountName}</strong>
            </div>
          </div>
        ) : (
          <p className="m-0 text-[0.88rem] text-muted">No bank account linked yet.</p>
        )}
      </div>

      <div>
        <h3 className="flex items-center gap-[0.45rem] mt-0 mb-3 text-base text-green">Recent activity</h3>
        {wallet.transactions.length === 0 ? (
          <p className="m-0 text-[0.88rem] text-muted">
            Completed job payments will appear here.
          </p>
        ) : (
          <ul className="list-none grid gap-[0.65rem]">
            {wallet.transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-start gap-4 py-[0.85rem] border-b border-solid border-line last:border-b-0"
              >
                <div>
                  <strong className="block text-[0.9rem] text-text">{tx.description}</strong>
                  <span className="text-[0.8rem] text-muted">
                    {new Date(tx.date).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`block text-[0.95rem] font-black ${txAmountTone[tx.type]}`}>
                    {tx.type === "credit" ? "+" : "-"}
                    {formatNaira(tx.amount)}
                  </span>
                  <span
                    className={`inline-block mt-[0.2rem] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] ${txStatusTone[tx.status]}`}
                  >
                    {formatTxStatus(tx.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-start gap-[0.45rem] m-0 text-[0.8rem] leading-[1.55] text-muted">
        <LockSimple size={14} weight="bold" />
        Release requests need client approval before funds leave escrow. After
        approval, payment is sent to your linked bank via our CBN-licensed
        partner. Amana does not hold your funds directly.
      </p>

      {showWithdraw && (
        <div className={adashModalOverlay} role="presentation" onClick={() => setShowWithdraw(false)}>
          <div
            className={adashModal}
            role="dialog"
            aria-labelledby="withdraw-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={adashModalHeader}>
              <h3 id="withdraw-title" className="m-0 text-[1.2rem] text-green">Request fund release</h3>
              <button
                type="button"
                className={adashModalClose}
                onClick={() => setShowWithdraw(false)}
                aria-label="Close"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <p className="m-0 mb-4 text-[0.9rem] text-muted">
              Available in escrow: <strong>{formatNaira(wallet.availableBalance)}</strong>
            </p>

            <div className="flex items-start gap-[0.65rem] mb-4 px-4 py-[0.85rem] rounded-xl bg-soft border border-solid border-line text-green">
              <UserCircle size={18} weight="bold" className="shrink-0 mt-[0.1rem]" />
              <p className="m-0 text-[0.86rem] leading-[1.55]">
                Your client must approve this release before any money is sent to
                your bank. Funds remain secured in escrow until then.
              </p>
            </div>

            <div className={adashField}>
              <label className={adashLabel} htmlFor="withdraw-amount">
                Amount to release (NGN)
              </label>
              <input
                id="withdraw-amount"
                type="number"
                className={`${adashInput}${withdrawError ? ` ${adashInputError}` : ""}`}
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
                className={adashLinkBtn}
                onClick={() => setAmount(String(wallet.availableBalance))}
              >
                Request full balance
              </button>
            </div>

            {wallet.bankAccount && (
              <p className="m-0 mb-4 text-[0.85rem] text-muted">
                After client approval, funds will be sent to{" "}
                {wallet.bankAccount.bankName}{" "}
                {maskAccountNumber(wallet.bankAccount.accountNumber)}
              </p>
            )}

            {withdrawError && (
              <p className={adashFieldError} role="alert">
                {withdrawError}
              </p>
            )}

            <div className={adashModalActions}>
              <button
                type="button"
                className={`${adashBtn} ${adashBtnGhost}`}
                onClick={() => setShowWithdraw(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${adashBtn} ${adashBtnPrimary}`}
                onClick={handleRequestRelease}
                disabled={submitting}
              >
                {submitting ? "Sending request..." : "Send release request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
