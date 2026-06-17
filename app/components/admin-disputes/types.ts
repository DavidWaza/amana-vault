import type { Dispute } from "../disputes/types";

// A dispute that has been escalated to Amana for an arbitrated decision. The
// admin queue is its own dataset — in this prototype it represents the
// arbitrator's view of cases both parties failed to settle themselves.
export type AdminDisputeCase = {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  artisanName: string;
  location: string;
  escalatedAt: string;
  dispute: Dispute;
};
