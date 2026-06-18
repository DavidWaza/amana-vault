import type {
  ArchitectActivity,
  ArchitectNotification,
  ArchitectProfile,
  ArchitectProject,
  ArchitectProposal,
  ArchitectVault,
  DesignRequest,
} from "./types";

export const MOCK_ARCHITECT_PROFILE: ArchitectProfile = {
  studioName: "Okumagba Design Studio",
  contactName: "Chidi Okumagba",
  phone: "08031234567",
  email: "studio@okumagba.design",
  location: "Lagos, Nigeria",
  bio: "Residential and commercial architecture with a focus on diaspora-led builds.",
  specialties: ["Residential", "Duplex", "Modern Tropical"],
  licenseNumber: "ARCON-2019-4421",
  rating: 4.9,
  reviewCount: 28,
  avatarUrl: null,
  verificationStatus: "verified",
  bankStatus: "verified",
  onboardingComplete: true,
  onboardingStep: 5,
  subscriptionPlan: "pro",
  subscriptionRenewal: "2026-09-14",
};

export const MOCK_ARCHITECT_VAULT: ArchitectVault = {
  totalContract: 5_000_000,
  released: 2_500_000,
  protected: 2_500_000,
  pendingRelease: 500_000,
  earningsThisMonth: 1_250_000,
  earningsDeltaPct: 22,
};

export const MOCK_ARCHITECT_PROJECTS: ArchitectProject[] = [
  {
    id: "ap-1",
    title: "Idemeto Family Residence",
    clientName: "Idemeto Family",
    location: "Enugu, Nigeria",
    contractValue: 5_000_000,
    status: "in_progress",
    progress: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    startedAt: "2025-11-01",
    nextMilestoneNote: "Complete BOQ preparation and submit for client approval.",
    milestones: [
      { phase: "concept", label: "Concept Design", status: "completed" },
      { phase: "rendering", label: "3D Rendering", status: "completed" },
      { phase: "drawings", label: "Construction Drawings", status: "completed" },
      { phase: "boq", label: "BOQ Preparation", status: "in_progress", dueDate: "2026-06-25" },
      { phase: "handover", label: "Handover", status: "upcoming" },
    ],
  },
  {
    id: "ap-2",
    title: "Adeyemi Duplex",
    clientName: "Tunde Adeyemi",
    location: "Abuja, Nigeria",
    contractValue: 3_200_000,
    status: "in_progress",
    progress: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    startedAt: "2026-02-10",
    milestones: [
      { phase: "concept", label: "Concept Design", status: "completed" },
      { phase: "rendering", label: "3D Rendering", status: "in_progress", dueDate: "2026-06-28" },
      { phase: "drawings", label: "Construction Drawings", status: "upcoming" },
      { phase: "boq", label: "BOQ Preparation", status: "upcoming" },
      { phase: "handover", label: "Handover", status: "upcoming" },
    ],
  },
];

export const MOCK_DESIGN_REQUESTS: DesignRequest[] = [
  {
    id: "dr-1",
    clientName: "Ngozi Eze",
    projectType: "4-bedroom duplex",
    location: "Port Harcourt",
    budgetRange: "₦4M – ₦6M",
    receivedAt: "2026-06-15T10:00:00Z",
    status: "new",
  },
  {
    id: "dr-2",
    clientName: "Obi Family",
    projectType: "Family compound",
    location: "Owerri",
    budgetRange: "₦8M+",
    receivedAt: "2026-06-12T14:30:00Z",
    status: "new",
  },
  {
    id: "dr-3",
    clientName: "James Okonkwo",
    projectType: "Bungalow renovation",
    location: "Lagos",
    budgetRange: "₦2M – ₦3M",
    receivedAt: "2026-06-08T09:00:00Z",
    status: "responded",
  },
];

export const MOCK_ARCHITECT_PROPOSALS: ArchitectProposal[] = [
  {
    id: "pr-1",
    projectTitle: "Idemeto Family Residence",
    clientName: "Idemeto Family",
    amount: 5_000_000,
    sentAt: "2025-10-20T11:00:00Z",
    status: "accepted",
  },
  {
    id: "pr-2",
    projectTitle: "Adeyemi Duplex",
    clientName: "Tunde Adeyemi",
    amount: 3_200_000,
    sentAt: "2026-01-28T16:00:00Z",
    status: "accepted",
  },
  {
    id: "pr-3",
    projectTitle: "Eze Residence Concept",
    clientName: "Ngozi Eze",
    amount: 4_500_000,
    sentAt: "2026-06-16T08:00:00Z",
    status: "pending",
  },
];

export const MOCK_ARCHITECT_ACTIVITY: ArchitectActivity[] = [
  {
    id: "act-1",
    text: "Milestone payment released — Concept Design (Idemeto)",
    createdAt: "2026-06-14T09:00:00Z",
    tone: "success",
  },
  {
    id: "act-2",
    text: "Proposal sent to Ngozi Eze",
    createdAt: "2026-06-16T08:00:00Z",
    tone: "info",
  },
  {
    id: "act-3",
    text: "Client approved 3D renders for Adeyemi Duplex",
    createdAt: "2026-06-13T15:30:00Z",
    tone: "neutral",
  },
];

export const MOCK_ARCHITECT_NOTIFICATIONS: ArchitectNotification[] = [
  {
    id: "n-1",
    title: "New design request",
    body: "Ngozi Eze requested a proposal for a 4-bedroom duplex.",
    read: false,
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "n-2",
    title: "Milestone ready for release",
    body: "BOQ preparation can be submitted for vault release on Idemeto Family Residence.",
    read: false,
    createdAt: "2026-06-14T09:00:00Z",
  },
];
