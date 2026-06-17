import type {
  ArtisanClient,
  ArtisanJob,
  ArtisanProfile,
  ArtisanReview,
  ArtisanWallet,
  DashboardAlert,
  JobChatMessage,
} from "./types";
import { buildMilestones } from "./agreement-summary";

export const MOCK_ARTISAN: ArtisanProfile = {
  id: "art-001",
  fullName: "Musa Ibrahim",
  phone: "08030000000",
  email: "musa@email.com",
  category: "plumbing",
  categoryLabel: "Plumbing",
  otherTrade: "",
  bio: "Licensed plumber across Abuja. Specialising in residential pipe work, water heaters, and bathroom installations.",
  area: "gwarinpa",
  areaLabel: "Gwarinpa",
  travelRadius: "abuja",
  avatarUrl: null,
  rating: 4.8,
  completedJobs: 12,
  verificationStatus: "verified",
  payoutStatus: "verified",
  profileComplete: true,
  memberSince: "2026-01-15",
  growth: {
    checksPaid: true,
    verificationPaid: true,
    boostActive: false,
    boostExpiresAt: null,
  },
  isRecommended: false,
};

export const MOCK_ARTISAN_UNVERIFIED: ArtisanProfile = {
  ...MOCK_ARTISAN,
  verificationStatus: "unverified",
  completedJobs: 0,
  rating: null,
  growth: {
    checksPaid: false,
    verificationPaid: false,
    boostActive: false,
    boostExpiresAt: null,
  },
  isRecommended: false,
};

export const MOCK_JOBS: ArtisanJob[] = [
  {
    id: "job-101",
    title: "Kitchen Pipe Installation",
    clientName: "Adaeze Obi",
    clientVerified: true,
    location: "Gwarinpa, Abuja",
    amount: 85000,
    status: "in_progress",
    priority: "normal",
    createdAt: "2026-05-20T10:00:00Z",
    deadline: "2026-06-08T17:00:00Z",
    fundedAt: "2026-05-21T09:00:00Z",
    proofDueAt: "2026-06-07T17:00:00Z",
    lastUpdated: "2026-06-04T14:30:00Z",
  },
  {
    id: "job-102",
    title: "Bathroom Renovation",
    clientName: "Chidi Nwosu",
    clientVerified: true,
    location: "Wuse 2, Abuja",
    amount: 120000,
    status: "proof_submitted",
    priority: "normal",
    createdAt: "2026-05-10T08:00:00Z",
    deadline: "2026-06-01T17:00:00Z",
    fundedAt: "2026-05-11T11:00:00Z",
    lastUpdated: "2026-06-03T16:00:00Z",
  },
  {
    id: "job-103",
    title: "Water Heater Setup",
    clientName: "Fatima Bello",
    clientVerified: false,
    location: "Maitama, Abuja",
    amount: 45000,
    status: "funds_secured",
    priority: "urgent",
    createdAt: "2026-06-01T12:00:00Z",
    deadline: "2026-06-06T17:00:00Z",
    fundedAt: "2026-06-02T08:00:00Z",
    lastUpdated: "2026-06-02T08:00:00Z",
  },
  {
    id: "job-104",
    title: "POP Ceiling Repair",
    clientName: "James Okafor",
    clientVerified: true,
    location: "Garki, Abuja",
    amount: 65000,
    status: "disputed",
    priority: "urgent",
    createdAt: "2026-04-15T09:00:00Z",
    deadline: "2026-05-20T17:00:00Z",
    fundedAt: "2026-04-16T10:00:00Z",
    disputeReason:
      "James opened a dispute over finishing work. Respond, or accept an outcome to settle.",
    dispute: {
      id: "dsp-104",
      category: "incomplete_work",
      raisedBy: "client",
      reason:
        "The ceiling edges and two corners were left unfinished, and there is cracking near the light fitting. This does not match what we agreed.",
      desiredOutcome: "split",
      stage: "responded",
      amount: 65000,
      evidence: [
        {
          id: "dsp-104-ev-0",
          party: "client",
          label: "unfinished-corner.jpg",
          kind: "photo",
          uploadedAt: "2026-05-27T10:00:00Z",
        },
        {
          id: "dsp-104-ev-1",
          party: "artisan",
          label: "completed-ceiling-handover.jpg",
          kind: "photo",
          uploadedAt: "2026-05-28T08:30:00Z",
        },
      ],
      statements: [
        {
          id: "dsp-104-st-0",
          party: "client",
          text: "The ceiling edges and two corners were left unfinished, and there is cracking near the light fitting.",
          createdAt: "2026-05-27T10:00:00Z",
        },
        {
          id: "dsp-104-st-1",
          party: "artisan",
          text: "The two corners were added on site without a price change, and the crack is in the existing wall. I finished everything in the signed scope — open to a fair split to close this out.",
          createdAt: "2026-05-28T08:30:00Z",
        },
      ],
      createdAt: "2026-05-27T10:00:00Z",
      updatedAt: "2026-05-28T08:30:00Z",
    },
    lastUpdated: "2026-05-28T11:00:00Z",
  },
  {
    id: "job-105",
    title: "Solar Inverter Plumbing",
    clientName: "Grace Adeyemi",
    clientVerified: true,
    location: "Lugbe, Abuja",
    amount: 95000,
    status: "invitation_pending",
    priority: "normal",
    createdAt: "2026-06-04T07:00:00Z",
    deadline: "2026-06-20T17:00:00Z",
    invitationExpiresAt: "2026-06-06T23:59:00Z",
    lastUpdated: "2026-06-04T07:00:00Z",
  },
  {
    id: "job-106",
    title: "Office Toilet Refit",
    clientName: "Kola Ventures",
    clientVerified: true,
    location: "Central Area, Abuja",
    amount: 180000,
    status: "awaiting_funding",
    priority: "normal",
    createdAt: "2026-06-03T15:00:00Z",
    deadline: "2026-06-25T17:00:00Z",
    agreementScope:
      "Commercial toilet refit with multiple WC units, urinals, and shared waste mains.",
    sentByArtisan: true,
    milestones: buildMilestones("plumbing", 180000),
    lastUpdated: "2026-06-03T15:00:00Z",
  },
  {
    id: "job-107",
    title: "Borehole Pipe Connection",
    clientName: "Emeka Duru",
    clientVerified: true,
    location: "Kubwa, Abuja",
    amount: 70000,
    status: "released",
    priority: "normal",
    createdAt: "2026-03-01T10:00:00Z",
    deadline: "2026-03-20T17:00:00Z",
    fundedAt: "2026-03-02T09:00:00Z",
    lastUpdated: "2026-03-22T10:00:00Z",
  },
  {
    id: "job-108",
    title: "Garden Tap Installation",
    clientName: "Amina Yusuf",
    clientVerified: true,
    location: "Gwarinpa, Abuja",
    amount: 25000,
    status: "invitation_expired",
    priority: "normal",
    createdAt: "2026-05-25T08:00:00Z",
    deadline: "2026-06-10T17:00:00Z",
    invitationExpiresAt: "2026-05-30T23:59:00Z",
    lastUpdated: "2026-05-31T00:00:00Z",
  },
];

export const MOCK_JOB_MESSAGES: Record<string, JobChatMessage[]> = {
  "job-106": [
    {
      id: "msg-1",
      jobId: "job-106",
      sender: "artisan",
      text: "Hi Kola Ventures — I've sent the Office Toilet Refit agreement with 3 milestones. Let me know if the scope works for your team.",
      createdAt: "2026-06-03T15:05:00Z",
    },
    {
      id: "msg-2",
      jobId: "job-106",
      sender: "client",
      text: "Thanks Musa. We're reviewing the milestone amounts now. Can you confirm the after-hours strip-out timing?",
      createdAt: "2026-06-03T16:20:00Z",
    },
  ],
};

export const MOCK_CLIENTS: ArtisanClient[] = [
  {
    id: "client-001",
    name: "Adaeze Obi",
    phone: "08012345678",
    email: "adaeze@email.com",
    verified: true,
    lastJobTitle: "Kitchen Pipe Installation",
  },
  {
    id: "client-002",
    name: "Chidi Nwosu",
    phone: "08023456789",
    email: "chidi@email.com",
    verified: true,
    lastJobTitle: "Bathroom Renovation",
  },
  {
    id: "client-003",
    name: "Fatima Bello",
    phone: "08034567890",
    verified: false,
    lastJobTitle: "Water Heater Setup",
  },
  {
    id: "client-004",
    name: "Grace Adeyemi",
    phone: "08045678901",
    email: "grace@email.com",
    verified: true,
    lastJobTitle: "Solar Inverter Plumbing",
  },
  {
    id: "client-005",
    name: "Kola Ventures",
    phone: "08056789012",
    email: "ops@kolaventures.ng",
    verified: true,
    lastJobTitle: "Office Toilet Refit",
  },
  {
    id: "client-006",
    name: "Emeka Duru",
    phone: "08067890123",
    verified: true,
    lastJobTitle: "Borehole Pipe Connection",
  },
  {
    id: "client-007",
    name: "James Okafor",
    phone: "08078901234",
    verified: true,
    lastJobTitle: "POP Ceiling Repair",
  },
];

export const MOCK_WALLET: ArtisanWallet = {
  availableBalance: 68500,
  pendingWithdrawal: 0,
  incomingBalance: 120000,
  minWithdrawal: 5000,
  bankAccount: {
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Musa Ibrahim",
  },
  transactions: [
    {
      id: "txn-1",
      type: "credit",
      amount: 70000,
      status: "completed",
      description: "Payment released — Borehole Pipe Connection",
      date: "2026-03-22T10:00:00Z",
    },
    {
      id: "txn-2",
      type: "withdrawal",
      amount: 50000,
      status: "completed",
      description: "Withdrawal to GTBank ···6789",
      date: "2026-04-02T14:00:00Z",
    },
    {
      id: "txn-3",
      type: "credit",
      amount: 48500,
      status: "completed",
      description: "Payment released — Garden Tap Installation",
      date: "2026-05-10T09:30:00Z",
    },
  ],
};

export const MOCK_REVIEWS: ArtisanReview[] = [
  {
    id: "rev-1",
    clientName: "Emeka Duru",
    clientVerified: true,
    jobTitle: "Borehole Pipe Connection",
    jobId: "job-107",
    rating: 5,
    comment:
      "Musa showed up on time and finished the borehole connection in one day. Clean work, no leaks. Would hire again without hesitation.",
    createdAt: "2026-03-25T11:00:00Z",
  },
  {
    id: "rev-2",
    clientName: "Amina Yusuf",
    clientVerified: true,
    jobTitle: "Garden Tap Installation",
    jobId: "job-108",
    rating: 5,
    comment:
      "Quick and professional. The garden tap works perfectly and he cleaned up after himself. Great value for the price.",
    createdAt: "2026-05-12T09:15:00Z",
  },
  {
    id: "rev-3",
    clientName: "Adaeze Obi",
    clientVerified: true,
    jobTitle: "Kitchen Pipe Installation",
    jobId: "job-101",
    rating: 5,
    comment:
      "Excellent work on our kitchen pipes. Very tidy, explained everything clearly, and the escrow process made us feel safe paying upfront.",
    createdAt: "2026-04-18T16:30:00Z",
  },
  {
    id: "rev-4",
    clientName: "Chidi Nwosu",
    clientVerified: true,
    jobTitle: "Bathroom Renovation",
    jobId: "job-102",
    rating: 4,
    comment:
      "Bathroom renovation looks great and fixtures are solid. There was a small delay getting materials, but the final result is worth it.",
    createdAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "rev-5",
    clientName: "Fatima Bello",
    clientVerified: false,
    jobTitle: "Water Heater Setup",
    jobId: "job-103",
    rating: 5,
    comment:
      "Fixed our water heater issue the same day. He was polite, knew exactly what was wrong, and the price matched the agreement.",
    createdAt: "2026-02-08T14:20:00Z",
  },
  {
    id: "rev-6",
    clientName: "James Okafor",
    clientVerified: true,
    jobTitle: "POP Ceiling Repair",
    jobId: "job-104",
    rating: 2,
    comment:
      "Some finishing around the ceiling edges was left incomplete. We raised a dispute because it did not match what was agreed.",
    createdAt: "2026-05-22T08:45:00Z",
  },
  {
    id: "rev-7",
    clientName: "Grace Adeyemi",
    clientVerified: true,
    jobTitle: "Office Sink Replacement",
    rating: 5,
    comment:
      "Handled our office plumbing over a weekend with zero disruption. Professional from start to finish — already booked him for another job.",
    createdAt: "2026-01-28T12:00:00Z",
  },
  {
    id: "rev-8",
    clientName: "Kola Ventures",
    clientVerified: true,
    jobTitle: "Restroom Refit — Phase 1",
    rating: 4,
    comment:
      "Good commercial plumbing work. Documentation and proof uploads through Amana made approvals straightforward for our team.",
    createdAt: "2025-12-10T17:00:00Z",
  },
];

export const MOCK_NOTIFICATIONS: import("./types").ArtisanNotification[] = [
  {
    id: "notif-1",
    type: "warning",
    title: "Proof due soon",
    message:
      "Kitchen Pipe Installation needs proof uploaded before the client deadline.",
    actionLabel: "Upload proof",
    actionHref: "#job-101",
    actionType: "upload_proof",
    actionJobId: "job-101",
    createdAt: "2026-06-04T09:00:00Z",
    read: false,
  },
  {
    id: "notif-2",
    type: "info",
    title: "New client invite",
    message: "Grace Adeyemi invited you to Solar Inverter Plumbing. Expires in 2 days.",
    actionLabel: "Review invite",
    actionHref: "#job-105",
    actionType: "review_invite",
    actionJobId: "job-105",
    createdAt: "2026-06-04T07:30:00Z",
    read: false,
  },
  {
    id: "notif-3",
    type: "success",
    title: "Payment released",
    message: "₦70,000 from Borehole Pipe Connection was released to your wallet.",
    actionLabel: "View wallet",
    actionHref: "#wallet",
    createdAt: "2026-06-03T14:00:00Z",
    read: true,
  },
];

/** @deprecated Use MOCK_NOTIFICATIONS */
export const MOCK_ALERTS: DashboardAlert[] = MOCK_NOTIFICATIONS;

export function buildDashboardStats(jobs: ArtisanJob[]) {
  const secured = jobs
    .filter((j) =>
      ["funds_secured", "in_progress", "proof_submitted", "disputed"].includes(
        j.status,
      ),
    )
    .reduce((sum, j) => sum + j.amount, 0);

  const pendingRelease = jobs
    .filter((j) => j.status === "proof_submitted")
    .reduce((sum, j) => sum + j.amount, 0);

  const released = jobs
    .filter((j) => j.status === "released")
    .reduce((sum, j) => sum + j.amount, 0);

  const activeCount = jobs.filter((j) =>
    ["awaiting_funding", "funds_secured", "in_progress", "proof_submitted", "disputed"].includes(
      j.status,
    ),
  ).length;

  const inviteCount = jobs.filter((j) => j.status === "invitation_pending").length;

  return { secured, pendingRelease, released, activeCount, inviteCount };
}

export function buildReviewSummary(reviews: ArtisanReview[]) {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    breakdown[star] += 1;
    sum += review.rating;
  }

  return {
    average: sum / reviews.length,
    total: reviews.length,
    breakdown,
  };
}
