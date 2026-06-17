import type { AdminDisputeCase } from "./types";

export const MOCK_ADMIN_DISPUTES: AdminDisputeCase[] = [
  {
    id: "case-9001",
    jobId: "job-104",
    jobTitle: "POP Ceiling Repair",
    clientName: "James Okafor",
    artisanName: "Musa Ibrahim",
    location: "Garki, Abuja",
    escalatedAt: "2026-05-29T09:00:00Z",
    dispute: {
      id: "dsp-9001",
      category: "incomplete_work",
      raisedBy: "client",
      reason:
        "Ceiling edges and two corners left unfinished, with cracking near the light fitting. Does not match the agreed finishing.",
      desiredOutcome: "split",
      stage: "escalated",
      amount: 65000,
      evidence: [
        {
          id: "dsp-9001-ev-0",
          party: "client",
          label: "unfinished-corner.jpg",
          kind: "photo",
          uploadedAt: "2026-05-27T10:00:00Z",
        },
        {
          id: "dsp-9001-ev-1",
          party: "client",
          label: "crack-near-light.jpg",
          kind: "photo",
          uploadedAt: "2026-05-27T10:01:00Z",
        },
        {
          id: "dsp-9001-ev-2",
          party: "artisan",
          label: "signed-scope.pdf",
          kind: "document",
          uploadedAt: "2026-05-28T08:30:00Z",
        },
        {
          id: "dsp-9001-ev-3",
          party: "artisan",
          label: "handover-photos.jpg",
          kind: "photo",
          uploadedAt: "2026-05-28T08:31:00Z",
        },
      ],
      statements: [
        {
          id: "dsp-9001-st-0",
          party: "client",
          text: "The ceiling edges and two corners were left unfinished, and there is cracking near the light fitting.",
          createdAt: "2026-05-27T10:00:00Z",
        },
        {
          id: "dsp-9001-st-1",
          party: "artisan",
          text: "The two corners were added on site without a price change. The crack is in the existing wall, not my work. I completed everything in the signed scope.",
          createdAt: "2026-05-28T08:30:00Z",
        },
        {
          id: "dsp-9001-st-2",
          party: "amana",
          text: "Escalated to Amana — both parties could not agree on a split. Reviewer assigned.",
          createdAt: "2026-05-29T09:00:00Z",
        },
      ],
      createdAt: "2026-05-27T10:00:00Z",
      updatedAt: "2026-05-29T09:00:00Z",
    },
  },
  {
    id: "case-9002",
    jobId: "job-221",
    jobTitle: "Standby Generator Wiring",
    clientName: "Lagos Retail Ltd",
    artisanName: "Emeka Nwosu",
    location: "Wuse 2, Abuja",
    escalatedAt: "2026-06-08T14:30:00Z",
    dispute: {
      id: "dsp-9002",
      category: "payment_withheld",
      raisedBy: "artisan",
      reason:
        "Changeover wiring completed and tested in front of the client's facility manager, but the client has not approved release for 9 days.",
      desiredOutcome: "release_artisan",
      stage: "escalated",
      amount: 140000,
      evidence: [
        {
          id: "dsp-9002-ev-0",
          party: "artisan",
          label: "load-test-video.mp4",
          kind: "video",
          uploadedAt: "2026-06-06T11:00:00Z",
        },
        {
          id: "dsp-9002-ev-1",
          party: "artisan",
          label: "manager-signoff.jpg",
          kind: "photo",
          uploadedAt: "2026-06-06T11:05:00Z",
        },
        {
          id: "dsp-9002-ev-2",
          party: "client",
          label: "noise-complaint-note.txt",
          kind: "document",
          uploadedAt: "2026-06-07T16:00:00Z",
        },
      ],
      statements: [
        {
          id: "dsp-9002-st-0",
          party: "artisan",
          text: "Work completed and load-tested with the facility manager present. Release has been pending for 9 days with no reason given.",
          createdAt: "2026-06-06T11:00:00Z",
        },
        {
          id: "dsp-9002-st-1",
          party: "client",
          text: "The changeover works but the unit is louder than expected. We want an adjustment before releasing the full amount.",
          createdAt: "2026-06-07T16:00:00Z",
        },
        {
          id: "dsp-9002-st-2",
          party: "amana",
          text: "Escalated to Amana. Scope did not specify a noise threshold; reviewing whether the complaint justifies withholding.",
          createdAt: "2026-06-08T14:30:00Z",
        },
      ],
      createdAt: "2026-06-06T11:00:00Z",
      updatedAt: "2026-06-08T14:30:00Z",
    },
  },
];
