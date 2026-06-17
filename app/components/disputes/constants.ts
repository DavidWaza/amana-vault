import type {
  Dispute,
  DisputeCategory,
  DisputeOutcome,
  DisputeParty,
  DisputeStage,
  RaiseDisputeInput,
} from "./types";

export const DISPUTE_CATEGORY_META: Record<
  DisputeCategory,
  { label: string; description: string; raisableBy: DisputeParty[] }
> = {
  incomplete_work: {
    label: "Work not finished",
    description: "The artisan left part of the agreed work undone.",
    raisableBy: ["client"],
  },
  quality: {
    label: "Poor quality",
    description: "The work was completed but falls below the agreed standard.",
    raisableBy: ["client"],
  },
  not_as_agreed: {
    label: "Not as agreed",
    description: "What was delivered differs from the agreed scope.",
    raisableBy: ["client", "artisan"],
  },
  no_show: {
    label: "Abandoned / no-show",
    description: "The artisan stopped responding or never started.",
    raisableBy: ["client"],
  },
  damage: {
    label: "Property damage",
    description: "Something was damaged during the work.",
    raisableBy: ["client"],
  },
  payment_withheld: {
    label: "Payment withheld",
    description: "Work is done but the client won't approve or release funds.",
    raisableBy: ["artisan"],
  },
  other: {
    label: "Something else",
    description: "A disagreement that doesn't fit the options above.",
    raisableBy: ["client", "artisan"],
  },
};

export const DISPUTE_STAGE_META: Record<
  DisputeStage,
  { label: string; tone: "warning" | "danger" | "progress" | "success" } & {
    description: string;
  }
> = {
  open: {
    label: "Awaiting response",
    tone: "warning",
    description: "Waiting for the other party to respond.",
  },
  responded: {
    label: "In discussion",
    tone: "progress",
    description: "Both sides have responded. Try to agree on an outcome.",
  },
  escalated: {
    label: "Amana reviewing",
    tone: "danger",
    description: "Amana is reviewing the evidence and will issue a decision.",
  },
  resolved: {
    label: "Resolved",
    tone: "success",
    description: "A final decision has been issued and funds settled.",
  },
};

export const DISPUTE_OUTCOME_META: Record<
  DisputeOutcome,
  { label: string; description: string }
> = {
  refund_client: {
    label: "Refund the client",
    description: "Return the full escrowed amount to the client.",
  },
  release_artisan: {
    label: "Release to the artisan",
    description: "Release the full escrowed amount to the artisan.",
  },
  split: {
    label: "Split the amount",
    description: "Divide the escrowed amount between both parties.",
  },
  withdrawn: {
    label: "Withdraw the dispute",
    description: "Drop the dispute and let the job continue as before.",
  },
};

// Outcomes a party can propose when they RAISE a dispute, by perspective.
export function desiredOutcomeOptions(party: DisputeParty): DisputeOutcome[] {
  return party === "client"
    ? ["refund_client", "split"]
    : ["release_artisan", "split"];
}

export function disputeCategoriesFor(party: DisputeParty): DisputeCategory[] {
  return (Object.keys(DISPUTE_CATEGORY_META) as DisputeCategory[]).filter((id) =>
    DISPUTE_CATEGORY_META[id].raisableBy.includes(party),
  );
}

export function partyLabel(party: DisputeParty | "amana"): string {
  if (party === "amana") return "Amana";
  return party === "client" ? "Client" : "Artisan";
}

// Build a Dispute from intake input. `now` is passed in so callers control the
// timestamp (and the dashboards stay consistent with their own clocks).
export function buildDispute(
  raisedBy: DisputeParty,
  input: RaiseDisputeInput,
  amount: number,
  now: string,
): Dispute {
  const id = `dsp-${now}-${Math.round(amount)}`;
  return {
    id,
    category: input.category,
    raisedBy,
    reason: input.reason.trim(),
    desiredOutcome: input.desiredOutcome,
    stage: "open",
    amount,
    evidence: input.evidenceLabels.map((label, index) => ({
      id: `${id}-ev-${index}`,
      party: raisedBy,
      label,
      kind: "photo" as const,
      uploadedAt: now,
    })),
    statements: [
      {
        id: `${id}-st-0`,
        party: raisedBy,
        text: input.reason.trim(),
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

// A short, human sentence describing how a resolution settled the money.
export function describeResolution(
  dispute: Dispute,
  formatAmount: (n: number) => string,
): string {
  const r = dispute.resolution;
  if (!r) return "";
  switch (r.outcome) {
    case "refund_client":
      return `Full refund of ${formatAmount(r.clientAmount)} returned to the client.`;
    case "release_artisan":
      return `Full amount of ${formatAmount(r.artisanAmount)} released to the artisan.`;
    case "split":
      return `Split — ${formatAmount(r.artisanAmount)} to the artisan, ${formatAmount(r.clientAmount)} refunded to the client.`;
    case "withdrawn":
      return "Dispute withdrawn — the job continued as agreed.";
    default:
      return "";
  }
}
