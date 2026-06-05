import type {
  AgreementCategoryId,
  AgreementMilestone,
  CreateAgreementForm,
} from "./types";
import {
  CHANGES_OPTIONS,
  getCategoryConfig,
  WARRANTY_OPTIONS,
  type AgreementSection,
} from "./agreement-templates";

export type AgreementSummarySection = {
  title: string;
  items: string[];
};

export const PROTECTION_FEE_RATE = 0.05;

export type AgreementSummary = {
  categoryLabel: string;
  categoryEmoji: string;
  title: string;
  scope: string;
  location: string;
  price: number;
  protectionFee: number;
  totalDue: number;
  startDate: string;
  finishDate: string;
  warranty: string;
  changesPolicy: string[];
  sections: AgreementSummarySection[];
  milestones: AgreementMilestone[];
  paymentTerms: string;
};

export function parseProtectedPrice(priceInput: string): number {
  const value = Number(priceInput.replace(/,/g, ""));
  return Number.isNaN(value) ? 0 : value;
}

export function calculateProtectionFee(price: number): number {
  if (price <= 0) return 0;
  return Math.round(price * PROTECTION_FEE_RATE);
}

const MILESTONE_SPLITS: Record<
  AgreementCategoryId,
  { title: string; description: string; ratio: number }[]
> = {
  plumbing: [
    { title: "Materials & setup", description: "Procure materials and prepare work area.", ratio: 0.3 },
    { title: "Main installation", description: "Complete core plumbing work.", ratio: 0.5 },
    { title: "Testing & handover", description: "Test, clean up, and client sign-off.", ratio: 0.2 },
  ],
  electrical: [
    { title: "Assessment & materials", description: "Site check and material procurement.", ratio: 0.25 },
    { title: "Wiring & installation", description: "Complete electrical work.", ratio: 0.55 },
    { title: "Safety test & proof", description: "Power test and photo proof upload.", ratio: 0.2 },
  ],
  carpentry: [
    { title: "Measurements & materials", description: "Take measurements and source wood.", ratio: 0.35 },
    { title: "Build & finish", description: "Fabrication and finishing work.", ratio: 0.45 },
    { title: "Delivery & installation", description: "Deliver and install on site.", ratio: 0.2 },
  ],
  borehole: [
    { title: "Site prep & drilling", description: "Mobilise and complete drilling/casing.", ratio: 0.45 },
    { title: "Pump & connections", description: "Install pump, pipes, and electrical.", ratio: 0.35 },
    { title: "Water test & proof", description: "Flow test, video proof, client inspection.", ratio: 0.2 },
  ],
  solar: [
    { title: "Equipment & mounting", description: "Panels, inverter, and mounting setup.", ratio: 0.4 },
    { title: "Wiring & commissioning", description: "Connect system and run load test.", ratio: 0.45 },
    { title: "Handover", description: "Warranty explanation and sign-off.", ratio: 0.15 },
  ],
  ac: [
    { title: "Unit prep & install", description: "Mount unit and run connections.", ratio: 0.5 },
    { title: "Gas/parts & testing", description: "Service parts and performance test.", ratio: 0.35 },
    { title: "Handover", description: "Client demo and cleanup.", ratio: 0.15 },
  ],
  painting: [
    { title: "Surface prep", description: "Scraping, filling, and masking.", ratio: 0.3 },
    { title: "Painting", description: "Apply primer and paint coats.", ratio: 0.55 },
    { title: "Cleanup & inspection", description: "Remove masking and final walkthrough.", ratio: 0.15 },
  ],
  mechanic: [
    { title: "Diagnosis & parts", description: "Inspect vehicle and source parts.", ratio: 0.35 },
    { title: "Repair work", description: "Complete mechanical repair.", ratio: 0.5 },
    { title: "Test & proof", description: "Test drive and upload receipt proof.", ratio: 0.15 },
  ],
  other: [
    { title: "Start of work", description: "Mobilise and begin agreed work.", ratio: 0.4 },
    { title: "Main delivery", description: "Complete core scope of work.", ratio: 0.4 },
    { title: "Completion", description: "Final checks and handover.", ratio: 0.2 },
  ],
};

function getSelectedLabels(
  section: AgreementSection,
  selectedIds: string[],
  otherText?: string,
  customText?: string,
): string[] {
  const labels = section.options
    .filter((o) => selectedIds.includes(o.id))
    .map((o) => o.label);

  if (section.allowOther && otherText?.trim()) {
    labels.push(otherText.trim());
  }

  if (section.allowCustomInput && customText?.trim()) {
    if (selectedIds.includes("specific") || section.id === "work_description") {
      labels.push(customText.trim());
    }
  }

  return labels;
}

export function sumMilestoneAmounts(milestones: AgreementMilestone[]): number {
  return milestones.reduce((sum, m) => {
    const value = Number(m.amount.replace(/,/g, ""));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
}

export function buildMilestones(
  categoryId: AgreementCategoryId,
  price: number,
): AgreementMilestone[] {
  const splits = MILESTONE_SPLITS[categoryId] ?? MILESTONE_SPLITS.other;
  let allocated = 0;

  return splits.map((split, index) => {
    const isLast = index === splits.length - 1;
    const amount = isLast
      ? price - allocated
      : Math.round(price * split.ratio);
    allocated += amount;

    return {
      id: `ms-${index + 1}`,
      title: split.title,
      description: split.description,
      amount: String(amount),
    };
  });
}

export function buildAgreementSummary(form: CreateAgreementForm): AgreementSummary {
  const config = getCategoryConfig(form.categoryId);
  const price = parseProtectedPrice(form.price);
  const protectionFee = calculateProtectionFee(price);
  const totalDue = price + protectionFee;

  const sections: AgreementSummarySection[] = config.sections
    .map((section) => {
      const items = getSelectedLabels(
        section,
        form.selections[section.id] ?? [],
        form.otherTexts[`${section.id}_other`],
        section.customInputKey
          ? form.customTexts[section.customInputKey]
          : undefined,
      );
      return items.length > 0 ? { title: section.title, items } : null;
    })
    .filter((s): s is AgreementSummarySection => s !== null);

  const workSection = sections[0];
  const locationSection = sections.find((s) =>
    /where|area|property/i.test(s.title),
  );
  const workLabels = workSection?.items ?? [];
  const locationLabels = locationSection?.items ?? [];

  const title = `${config.label} — ${workLabels.slice(0, 2).join(", ") || "Secured job"}`;
  const location = locationLabels.join(", ") || "To be confirmed on site";

  const scopeParts = sections.map(
    (s) => `${s.title}: ${s.items.join("; ")}`,
  );
  const warrantyLabel =
    WARRANTY_OPTIONS.find((w) => w.id === form.warranty)?.label ?? form.warranty;
  const warranty =
    form.warranty === "custom" && form.warrantyCustom.trim()
      ? form.warrantyCustom.trim()
      : warrantyLabel;

  const changesPolicy = form.changesPolicy.map(
    (id) => CHANGES_OPTIONS.find((c) => c.id === id)?.label ?? id,
  );

  scopeParts.push(
    `Warranty: ${warranty}`,
    `Extra work policy: ${changesPolicy.join(" · ") || "Ask approval first"}`,
  );

  const milestones = buildMilestones(form.categoryId, price);
  const formatMoney = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });
  const paymentTerms = `${formatMoney(price)} held in Amana escrow across ${milestones.length} milestones, plus a ${formatMoney(protectionFee)} protection fee (5%). Client total: ${formatMoney(totalDue)}. Funds release after client approves each milestone.`;

  return {
    categoryLabel: config.label,
    categoryEmoji: config.emoji,
    title,
    scope: scopeParts.join("\n"),
    location,
    price,
    protectionFee,
    totalDue,
    startDate: form.startDate,
    finishDate: form.finishDate,
    warranty,
    changesPolicy,
    sections,
    milestones,
    paymentTerms,
  };
}
