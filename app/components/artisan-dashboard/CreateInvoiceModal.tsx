"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Receipt,
  PaperPlaneTilt,
  CheckCircle,
  Calendar,
  DownloadSimple,
} from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import { buildInvoiceDraft } from "./invoice-utils";
import { downloadInvoicePdf } from "./invoice-pdf";
import type { ArtisanJob, JobInvoice } from "./types";
import { formatNaira } from "./utils";

type CreateInvoiceModalProps = {
  job: ArtisanJob | null;
  artisanName: string;
  open: boolean;
  onClose: () => void;
  onSend: (invoice: JobInvoice) => Promise<void>;
};

export default function CreateInvoiceModal({
  job,
  artisanName,
  open,
  onClose,
  onSend,
}: CreateInvoiceModalProps) {
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sent, setSent] = useState(false);
  const [sentInvoice, setSentInvoice] = useState<JobInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingInvoice = job?.invoice?.status === "sent" ? job.invoice : null;

  const draft = useMemo(() => {
    if (!job) return null;
    if (existingInvoice) return existingInvoice;
    return buildInvoiceDraft(job, notes, dueDate || undefined);
  }, [job, notes, dueDate, existingInvoice]);

  useEffect(() => {
    if (!open || !job) return;
    if (job.invoice?.status === "sent") {
      setSent(true);
      setSentInvoice(job.invoice);
      setNotes(job.invoice.notes);
      setDueDate(job.invoice.dueDate);
    } else {
      const built = buildInvoiceDraft(job);
      setNotes(built.notes);
      setDueDate(built.dueDate);
      setSent(false);
      setSentInvoice(null);
    }
    setError(null);
  }, [open, job]);

  const [handleSend, sendLoading] = useAsyncAction(async () => {
    if (!job) return;
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }

    setError(null);

    const built = buildInvoiceDraft(job, notes, dueDate);
    const invoice: JobInvoice = {
      id: `inv-${Date.now()}`,
      ...built,
      notes,
      dueDate,
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      await onSend(invoice);
      setSentInvoice(invoice);
      setSent(true);
    } catch {
      setError("Could not send invoice. Please try again.");
    }
  });

  if (!open || !job || !draft) return null;

  const invoiceForDownload = sentInvoice ?? existingInvoice;

  const handleDownload = () => {
    if (!invoiceForDownload) return;
    downloadInvoicePdf(invoiceForDownload, job, artisanName);
  };

  const displayNumber =
    invoiceForDownload?.invoiceNumber ??
    ("invoiceNumber" in draft ? draft.invoiceNumber : "");

  const displayTotal =
    invoiceForDownload?.subtotal ??
    ("subtotal" in draft ? draft.subtotal : job.amount);

  const lineItems =
    invoiceForDownload?.lineItems ??
    ("lineItems" in draft ? draft.lineItems : []);

  return (
    <div
      className="adash-modal-overlay"
      role="presentation"
      onClick={() => !sendLoading && onClose()}
    >
      <div
        className="adash-modal adash-modal--proof adash-modal--invoice"
        role="dialog"
        aria-labelledby="create-invoice-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-modal-header">
          <div>
            <p className="adash-eyebrow">
              <Receipt size={14} weight="bold" />
              Invoice
            </p>
            <h3 id="create-invoice-title">
              {sent || existingInvoice ? "Invoice ready" : "Create invoice"}
            </h3>
            {!sent && !existingInvoice && (
              <p className="adash-modal-subtext">
                Generate an invoice from the agreement and send it to{" "}
                {job.clientName}.
              </p>
            )}
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            disabled={sendLoading}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {sent || existingInvoice ? (
          <div className="adash-invoice-success">
            <div className="adash-invoice-success-icon">
              <CheckCircle size={32} weight="fill" />
            </div>
            <h4>Invoice {displayNumber} sent</h4>
            <p>
              {formatNaira(displayTotal)} invoice sent to {job.clientName}.
              Download a PDF copy for your records.
            </p>
            <div className="adash-modal-actions adash-modal-actions--stack">
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleDownload}
              >
                <DownloadSimple size={16} weight="bold" />
                Download PDF
              </Button>
              <button type="button" className="adash-btn adash-btn--ghost" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="adash-invoice-doc">
              <div className="adash-invoice-doc-header">
                <div>
                  <strong>{artisanName}</strong>
                  <span>Artisan on Amana</span>
                </div>
                <div className="adash-invoice-doc-meta">
                  <span>{"invoiceNumber" in draft ? draft.invoiceNumber : ""}</span>
                  <span>
                    {new Date().toLocaleDateString("en-NG", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="adash-invoice-doc-parties">
                <div>
                  <span>Bill to</span>
                  <strong>{job.clientName}</strong>
                </div>
                <div>
                  <span>Job</span>
                  <strong>{job.title}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{job.location}</strong>
                </div>
              </div>

              <table className="adash-invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{formatNaira(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total due</td>
                    <td>
                      {formatNaira(
                        "subtotal" in draft ? draft.subtotal : displayTotal,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="adash-invoice-fields">
              <div className="adash-field">
                <label className="adash-label" htmlFor="invoice-due">
                  <Calendar size={14} weight="bold" />
                  Due date
                </label>
                <input
                  id="invoice-due"
                  type="date"
                  className="adash-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="invoice-notes">
                  Notes to client
                </label>
                <textarea
                  id="invoice-notes"
                  className="adash-input adash-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {error && (
              <p className="adash-field-error" role="alert">
                {error}
              </p>
            )}

            <div className="adash-modal-actions">
              <button
                type="button"
                className="adash-btn adash-btn--ghost"
                onClick={onClose}
                disabled={sendLoading}
              >
                Cancel
              </button>
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSend}
                loading={sendLoading}
                loadingLabel="Sending…"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                Send to client
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
