"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  X,
  ShieldCheck,
  Warning,
  Receipt,
  CheckCircle,
  Image,
  CreditCard,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import type { ClientEscrow, ClientJob } from "./types";
import { formatNaira, formatRelativeDate, calculateClientTotalDue } from "./utils";

type ClientJobModalsProps = {
  fundJob: ClientJob | null;
  agreementJob: ClientJob | null;
  proofJob: ClientJob | null;
  releaseJob: ClientJob | null;
  detailJob: ClientJob | null;
  detailMode: "dispute" | "receipt" | null;
  escrow: ClientEscrow;
  canFundJobs: boolean;
  onCloseFund: () => void;
  onCloseAgreement: () => void;
  onCloseProof: () => void;
  onCloseRelease: () => void;
  onCloseDetail: () => void;
  onConfirmFund: (jobId: string) => void;
  onApproveProof: (jobId: string) => void;
  onDisputeProof: (jobId: string) => void;
  onApproveRelease: (jobId: string) => void;
  onOpenPaymentSettings: () => void;
  funding?: boolean;
  fundingSuccess?: ClientJob | null;
};

export default function ClientJobModals({
  fundJob,
  agreementJob,
  proofJob,
  releaseJob,
  detailJob,
  detailMode,
  escrow,
  canFundJobs,
  onCloseFund,
  onCloseAgreement,
  onCloseProof,
  onCloseRelease,
  onCloseDetail,
  onConfirmFund,
  onApproveProof,
  onDisputeProof,
  onApproveRelease,
  onOpenPaymentSettings,
  funding = false,
  fundingSuccess = null,
}: ClientJobModalsProps) {
  const [authorizeCharge, setAuthorizeCharge] = useState(false);

  useEffect(() => {
    setAuthorizeCharge(false);
  }, [fundJob?.id, agreementJob?.id]);

  const renderOverlay = (
    open: boolean,
    onClose: () => void,
    title: string,
    subtitle: string,
    children: ReactNode,
    actions: ReactNode,
  ) => {
    if (!open) return null;
    return (
      <div className="adash-modal-overlay" role="presentation" onClick={onClose}>
        <div
          className="adash-modal adash-modal--agreement"
          role="dialog"
          aria-labelledby="client-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="adash-modal-header">
            <div>
              <h3 id="client-modal-title">{title}</h3>
              <p className="adash-modal-subtext">{subtitle}</p>
            </div>
            <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} weight="bold" />
            </button>
          </div>
          {children}
          <div className="adash-modal-actions">{actions}</div>
        </div>
      </div>
    );
  };

  const job = agreementJob ?? fundJob;
  const totalDue = job ? calculateClientTotalDue(job.amount, job.protectionFee) : 0;
  const fee = job ? (job.protectionFee ?? Math.round(job.amount * 0.05)) : 0;
  const fundModalOpen = fundJob !== null || agreementJob !== null;
  const paymentLabel = escrow.paymentMethod
    ? `${escrow.paymentMethod.label} ····${escrow.paymentMethod.lastFour}`
    : null;

  return (
    <>
      {fundingSuccess && renderOverlay(
        true,
        agreementJob ? onCloseAgreement : onCloseFund,
        "Funds secured",
        fundingSuccess.title,
        <div className="cdash-fund-success">
          <div className="cdash-fund-success-icon">
            <CheckCircle size={48} weight="fill" />
          </div>
          <p>
            <strong>{formatNaira(calculateClientTotalDue(fundingSuccess.amount, fundingSuccess.protectionFee))}</strong>{" "}
            is now held in escrow for {fundingSuccess.artisanName}.
          </p>
          <p className="adash-modal-subtext">
            The artisan has been notified. Your payment stays protected until you
            approve proof and release requests.
          </p>
        </div>,
        <Button
          type="button"
          className="adash-btn adash-btn--primary"
          onClick={agreementJob ? onCloseAgreement : onCloseFund}
        >
          Done
        </Button>,
      )}

      {!fundingSuccess && renderOverlay(
        fundModalOpen,
        agreementJob ? onCloseAgreement : onCloseFund,
        agreementJob ? "Review agreement" : "Fund escrow",
        job?.title ?? "",
        job && (
          <>
            {!canFundJobs ? (
              <div className="adash-job-notice adash-job-notice--warning">
                <Warning size={16} weight="bold" />
                {paymentLabel
                  ? "Your payment method is still being verified."
                  : "Verify your identity and add a payment method before funding escrow."}
              </div>
            ) : (
              <>
                <div className="adash-job-modal-details">
                  <p><strong>Artisan:</strong> {job.artisanName}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Deadline:</strong> {formatRelativeDate(job.deadline)}</p>
                </div>
                {job.agreementScope && (
                  <div className="adash-agreement-review">
                    <h4>Scope of work</h4>
                    <p>{job.agreementScope}</p>
                  </div>
                )}
                {job.paymentTerms && (
                  <p className="adash-modal-subtext">{job.paymentTerms}</p>
                )}
                {job.milestones && job.milestones.length > 0 && (
                  <div className="adash-agreement-milestones">
                    <h4>Milestones ({job.milestones.length})</h4>
                    <ul>
                      {job.milestones.map((m) => (
                        <li key={m.id}>
                          <strong>{m.title}</strong>
                          <span>{formatNaira(Number(m.amount.replace(/,/g, "")) || 0)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="adash-completion-summary adash-completion-summary--compact">
                  <div className="adash-completion-summary-row">
                    <span>Protected price</span>
                    <strong>{formatNaira(job.amount)}</strong>
                  </div>
                  <div className="adash-completion-summary-row">
                    <span>Protection fee (5%)</span>
                    <strong>{formatNaira(fee)}</strong>
                  </div>
                  <div className="adash-completion-summary-row adash-completion-summary-row--total">
                    <span>You pay total</span>
                    <strong>{formatNaira(totalDue)}</strong>
                  </div>
                </div>
                {paymentLabel && (
                  <div className="cdash-fund-payment">
                    <CreditCard size={20} weight="bold" />
                    <div>
                      <strong>Payment method</strong>
                      <span>Charge {formatNaira(totalDue)} to {paymentLabel}</span>
                    </div>
                  </div>
                )}
                <label className="cdash-fund-authorize">
                  <input
                    type="checkbox"
                    checked={authorizeCharge}
                    onChange={(e) => setAuthorizeCharge(e.target.checked)}
                  />
                  <span>
                    I authorize Amana to charge my payment method and hold{" "}
                    {formatNaira(totalDue)} in escrow until I approve releases.
                  </span>
                </label>
              </>
            )}
            <p className="adash-modal-subtext">
              Funds are held in escrow by our CBN-licensed partner. Never pay artisans
              outside the platform.
            </p>
          </>
        ),
        <>
          <button type="button" className="adash-btn adash-btn--ghost" onClick={agreementJob ? onCloseAgreement : onCloseFund}>
            Cancel
          </button>
          {!canFundJobs ? (
            <Button
              type="button"
              className="adash-btn adash-btn--primary"
              onClick={onOpenPaymentSettings}
            >
              Set up payment
            </Button>
          ) : (
            <Button
              type="button"
              className="adash-btn adash-btn--primary"
              disabled={funding || !job || !authorizeCharge}
              loading={funding}
              loadingLabel="Processing…"
              onClick={() => {
              if (job) onConfirmFund(job.id);
            }}
            >
              {`Fund ${formatNaira(totalDue)}`}
            </Button>
          )}
        </>,
      )}

      {renderOverlay(
        proofJob !== null,
        onCloseProof,
        "Review proof of work",
        proofJob?.title ?? "",
        proofJob && (
          <>
            <p className="adash-modal-subtext">
              {proofJob.artisanName} submitted proof on{" "}
              {proofJob.proofSubmittedAt
                ? new Date(proofJob.proofSubmittedAt).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "recently"}
              .
            </p>
            {proofJob.proofNote && <p>{proofJob.proofNote}</p>}
            <div className="adash-proof-preview">
              {[1, 2, 3].map((i) => (
                <div key={i} className="adash-proof-preview-item">
                  <Image size={32} weight="bold" />
                  <span>Proof file {i}</span>
                </div>
              ))}
            </div>
            <p className="adash-job-notice adash-job-notice--warning">
              <Warning size={16} weight="bold" />
              Only approve if work matches the agreement. You can open a dispute if something is wrong.
            </p>
          </>
        ),
        <>
          <button type="button" className="adash-btn adash-btn--danger" onClick={() => proofJob && onDisputeProof(proofJob.id)}>
            Open dispute
          </button>
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => {
              if (proofJob) onApproveProof(proofJob.id);
            }}
            loadingLabel="Approving…"
          >
            <CheckCircle size={16} weight="bold" />
            Approve proof
          </Button>
        </>,
      )}

      {renderOverlay(
        releaseJob !== null,
        onCloseRelease,
        "Approve fund release",
        releaseJob?.title ?? "",
        releaseJob && (
          <>
            <p className="adash-modal-subtext">
              {releaseJob.artisanName} requested release of{" "}
              <strong>{formatNaira(releaseJob.releaseRequestAmount ?? 0)}</strong> from
              escrow for completed work.
            </p>
            <div className="adash-wallet-release-notice">
              <ShieldCheck size={18} weight="bold" />
              <p>
                Approving sends this amount from escrow toward the artisan&apos;s bank.
                Only approve if you are satisfied with the completed work.
              </p>
            </div>
          </>
        ),
        <>
          <button type="button" className="adash-btn adash-btn--ghost" onClick={onCloseRelease}>
            Not yet
          </button>
          <Button
            type="button"
            className="adash-btn adash-btn--primary"
            onClick={() => {
              if (releaseJob) onApproveRelease(releaseJob.id);
            }}
            loadingLabel="Approving…"
          >
            Approve release
          </Button>
        </>,
      )}

      {detailJob && detailMode && renderOverlay(
        true,
        onCloseDetail,
        detailMode === "dispute" ? "Dispute details" : "Payment receipt",
        detailJob.title,
        detailMode === "dispute" ? (
          <>
            <p className="adash-job-modal-callout adash-job-modal-callout--danger">
              <Warning size={18} weight="bold" />
              This job is under Amana review. Both parties can submit evidence.
            </p>
            <div className="adash-job-modal-details">
              <p><strong>Artisan:</strong> {detailJob.artisanName}</p>
              <p><strong>Amount:</strong> {formatNaira(detailJob.amount)}</p>
              <p><strong>Reason:</strong> {detailJob.disputeReason}</p>
            </div>
          </>
        ) : (
          <>
            <p className="adash-job-modal-callout adash-job-modal-callout--secure">
              <ShieldCheck size={18} weight="fill" />
              Funds released from escrow
            </p>
            <div className="adash-job-modal-details">
              <p><strong>Artisan:</strong> {detailJob.artisanName}</p>
              <p><strong>Amount released:</strong> {formatNaira(detailJob.amount)}</p>
              <p><strong>Completed:</strong> {new Date(detailJob.lastUpdated).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </>
        ),
        <button type="button" className="adash-btn adash-btn--secondary" onClick={onCloseDetail}>
          <Receipt size={16} weight="bold" />
          Close
        </button>,
      )}
    </>
  );
}
