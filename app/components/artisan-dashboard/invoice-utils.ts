import type { ArtisanJob, InvoiceLineItem, JobInvoice } from "./types";

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${year}-${seq}`;
}

export function buildInvoiceDraft(
  job: ArtisanJob,
  notes = "",
  dueDate?: string,
): Omit<JobInvoice, "id" | "status" | "sentAt" | "createdAt"> {
  const lineItems: InvoiceLineItem[] =
    job.milestones && job.milestones.length > 0
      ? job.milestones.map((milestone) => ({
          id: milestone.id,
          description: `${milestone.title} — ${milestone.description}`,
          amount: Number(milestone.amount.replace(/,/g, "")) || 0,
        }))
      : [
          {
            id: "line-1",
            description: job.title,
            amount: job.amount,
          },
        ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  return {
    jobId: job.id,
    invoiceNumber: generateInvoiceNumber(),
    clientName: job.clientName,
    lineItems,
    subtotal,
    notes:
      notes ||
      "Payment held in Amana escrow. Funds release per milestone upon client approval.",
    dueDate: dueDate ?? defaultDue.toISOString().slice(0, 10),
  };
}
