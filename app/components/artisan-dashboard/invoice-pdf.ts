import { jsPDF } from "jspdf";
import type { ArtisanJob, JobInvoice } from "./types";
import { formatNaira } from "./utils";

export function downloadInvoicePdf(
  invoice: JobInvoice,
  job: ArtisanJob,
  artisanName: string,
): void {
  const doc = new jsPDF();
  const margin = 18;
  let y = margin;

  const addLine = (text: string, size = 10, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 174);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.42) + 3;
  };

  doc.setFillColor(0, 107, 50);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Amana Invoice", margin, 18);
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, 210 - margin, 18, { align: "right" });

  doc.setTextColor(30, 30, 30);
  y = 38;

  addLine(artisanName, 12, "bold");
  addLine("Artisan on Amana", 9);
  y += 4;

  addLine(`Bill to: ${invoice.clientName}`, 10, "bold");
  addLine(`Job: ${job.title}`);
  addLine(`Location: ${job.location}`);
  addLine(
    `Issued: ${new Date(invoice.createdAt).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}`,
  );
  addLine(
    `Due: ${new Date(invoice.dueDate).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}`,
  );
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  addLine("Line items", 11, "bold");

  invoice.lineItems.forEach((item, index) => {
    const desc = `${index + 1}. ${item.description}`;
    addLine(desc, 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(formatNaira(item.amount), 210 - margin, y - 4, { align: "right" });
    y += 2;
  });

  y += 4;
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total due", margin, y);
  doc.text(formatNaira(invoice.subtotal), 210 - margin, y, { align: "right" });
  y += 12;

  if (invoice.notes.trim()) {
    addLine("Notes", 10, "bold");
    addLine(invoice.notes, 9);
    y += 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Payment secured via Amana escrow. Funds release per milestone upon client approval.",
    margin,
    280,
  );

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
