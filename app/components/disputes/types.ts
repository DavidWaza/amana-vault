// Shared dispute-resolution model used by the client dashboard, artisan
// dashboard, and the Amana admin (arbitrator) view. A dispute is embedded on a
// job (mirroring how `invoice` is embedded) rather than living in a global
// store, because client and artisan each operate on their own job records.

export type DisputeParty = "client" | "artisan";

// Who is empowered to resolve at a given moment.
export type DisputeDecider = DisputeParty | "amana";

export type DisputeCategory =
  | "incomplete_work" // work was not finished
  | "quality" // finished but below the agreed standard
  | "not_as_agreed" // delivered something different from the scope
  | "no_show" // artisan never showed / abandoned the job
  | "damage" // property was damaged during the work
  | "payment_withheld" // client won't approve/release despite completed work
  | "other";

export type DisputeStage =
  | "open" // raised by one party, awaiting the other's response
  | "responded" // the other party answered — parties are negotiating
  | "escalated" // handed to Amana for an arbitrated ruling
  | "resolved"; // closed with a final outcome

export type DisputeOutcome =
  | "refund_client" // full disputed amount returned to the client
  | "release_artisan" // full disputed amount released to the artisan
  | "split" // amount split between the two parties
  | "withdrawn"; // the raiser dropped the dispute; job continues as before

export type DisputeEvidenceKind = "photo" | "video" | "document";

export type DisputeEvidence = {
  id: string;
  party: DisputeParty;
  label: string;
  kind: DisputeEvidenceKind;
  uploadedAt: string;
};

export type DisputeStatement = {
  id: string;
  party: DisputeParty | "amana";
  text: string;
  createdAt: string;
};

export type DisputeResolution = {
  outcome: DisputeOutcome;
  decidedBy: DisputeDecider;
  // For split/refund/release these record how the escrowed amount is divided.
  clientAmount: number;
  artisanAmount: number;
  note?: string;
  decidedAt: string;
};

export type Dispute = {
  id: string;
  category: DisputeCategory;
  raisedBy: DisputeParty;
  reason: string;
  // What the party that raised it is asking Amana / the counterparty to do.
  desiredOutcome: DisputeOutcome;
  stage: DisputeStage;
  amount: number; // the escrowed amount under dispute
  evidence: DisputeEvidence[];
  statements: DisputeStatement[];
  resolution?: DisputeResolution;
  createdAt: string;
  updatedAt: string;
};

// Input collected by the RaiseDisputeModal before a Dispute is constructed.
export type RaiseDisputeInput = {
  category: DisputeCategory;
  reason: string;
  desiredOutcome: DisputeOutcome;
  evidenceLabels: string[];
};

// Minimal, perspective-aware view passed to the shared dispute modals so they
// don't need to know about ClientJob vs ArtisanJob.
export type DisputeJobView = {
  id: string;
  title: string;
  amount: number;
  counterpartyName: string; // the OTHER side, from the viewer's perspective
  dispute: Dispute;
};
