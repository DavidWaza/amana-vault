import type {
  Architect,
  ClientEscrow,
  ClientNotification,
  ClientProfile,
  ClientProject,
  ContractorProposal,
  JobChatMessage,
  ProjectDocument,
  ProjectUpdate,
  VaultMilestone,
} from "./types";

export const MOCK_CLIENT: ClientProfile = {
  id: "client-001",
  fullName: "Adaeze Obi",
  phone: "+1 202 555 0142",
  email: "adaeze@email.com",
  countryOfResidence: "USA",
  area: "gwarinpa",
  areaLabel: "Gwarinpa, Abuja",
  avatarUrl: null,
  verificationStatus: "verified",
  paymentMethodStatus: "verified",
  profileComplete: true,
  memberSince: "2026-01-10",
  projectsProtected: 2,
  totalVaultProtected: 48500000,
  jobsProtected: 2,
  totalEscrowed: 48500000,
};

export const MOCK_CLIENT_UNVERIFIED: ClientProfile = {
  ...MOCK_CLIENT,
  verificationStatus: "unverified",
  paymentMethodStatus: "not_set",
  profileComplete: false,
  projectsProtected: 0,
  totalVaultProtected: 0,
  jobsProtected: 0,
  totalEscrowed: 0,
};

function buildVaultMilestones(total: number): VaultMilestone[] {
  const splits = [0.25, 0.3, 0.2, 0.25];
  const labels: VaultMilestone["name"][] = [
    "foundation",
    "structure",
    "roofing",
    "finishing",
  ];
  const names = ["Foundation", "Structure", "Roofing", "Finishing"];

  return labels.map((name, i) => ({
    id: `vm-${name}`,
    name,
    label: names[i],
    amount: Math.round(total * splits[i]),
    status: i === 0 ? "released" : i === 1 ? "inspection" : i === 2 ? "active" : "locked",
    ...(i === 0
      ? { inspectorName: "Chika Nwosu", inspectionResult: "pass" as const }
      : {}),
    ...(i === 1
      ? {
          inspectorName: "Chika Nwosu",
          inspectionResult: "pass_with_concerns" as const,
          inspectorReport:
            "Structural frame meets spec. Minor beam alignment noted on east wing — contractor to document remediation before release.",
          contractorEvidence: "12 site photos, 2 walkthrough videos",
        }
      : {}),
  }));
}

export const MOCK_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "proj-001",
    title: "Obi Family Duplex",
    buildingCategory: "residential",
    buildingType: "duplex",
    location: "Plot 14, Gwarinpa Estate, Abuja",
    city: "Abuja",
    state: "FCT",
    landStatus: "family_owns",
    description:
      "5-bedroom duplex with modern finish, open-plan living, and a detached boys' quarters.",
    lifecycleStage: "construction",
    designStage: "ready_for_bidding",
    architectName: "Adeola Ogunleye",
    architectVerified: true,
    contractorName: "BuildRight Nigeria Ltd",
    contractorVerified: true,
    artisanName: "BuildRight Nigeria Ltd",
    artisanVerified: true,
    artisanCategory: "General Contractor",
    amount: 48500000,
    protectionFee: 2425000,
    status: "in_progress",
    priority: "normal",
    createdAt: "2025-11-10T10:00:00Z",
    deadline: "2026-10-30T17:00:00Z",
    fundedAt: "2026-02-15T09:00:00Z",
    vaultMilestones: buildVaultMilestones(48500000),
    releaseRequestAmount: 14550000,
    lastUpdated: "2026-06-10T14:30:00Z",
  },
  {
    id: "proj-002",
    title: "Grace Chapel Extension",
    buildingCategory: "religious",
    buildingType: "church",
    location: "Kubwa Express, Abuja",
    city: "Abuja",
    state: "FCT",
    landStatus: "own",
    description:
      "800-seat worship hall extension with fellowship wing and parking structure.",
    lifecycleStage: "contractor_bidding",
    designStage: "ready_for_bidding",
    architectName: "VisionArc Studio",
    architectVerified: true,
    artisanName: "VisionArc Studio",
    artisanVerified: true,
    artisanCategory: "Architect",
    amount: 120000000,
    status: "awaiting_funding",
    priority: "normal",
    createdAt: "2026-03-01T08:00:00Z",
    deadline: "2027-06-01T17:00:00Z",
    agreementScope:
      "Competitive contractor bidding open. Final vault activation after contractor selection.",
    paymentTerms: "Milestone vault to be created upon contractor acceptance.",
    sentByArtisan: true,
    lastUpdated: "2026-06-08T11:00:00Z",
  },
  {
    id: "proj-003",
    title: "Lagos Rental Plaza",
    buildingCategory: "commercial",
    buildingType: "plaza",
    location: "Lekki Phase 1, Lagos",
    city: "Lagos",
    state: "Lagos",
    landStatus: "purchasing",
    description: "12-unit commercial plaza with shared generator and water treatment.",
    lifecycleStage: "design",
    designStage: "client_review",
    architectName: "Meridian Design Co.",
    architectVerified: true,
    artisanName: "Meridian Design Co.",
    artisanVerified: true,
    artisanCategory: "Architect",
    amount: 8500000,
    protectionFee: 425000,
    status: "funds_secured",
    priority: "normal",
    createdAt: "2026-04-20T09:00:00Z",
    deadline: "2026-08-15T17:00:00Z",
    fundedAt: "2026-05-02T10:00:00Z",
    lastUpdated: "2026-06-05T16:00:00Z",
  },
  {
    id: "proj-004",
    title: "Enugu Family Bungalow",
    buildingCategory: "residential",
    buildingType: "bungalow",
    location: "Independence Layout, Enugu",
    city: "Enugu",
    state: "Enugu",
    landStatus: "own",
    description: "Retirement bungalow for parents — 3 bedrooms, accessibility features.",
    lifecycleStage: "architect_selection",
    artisanName: "Pending selection",
    artisanVerified: false,
    amount: 0,
    status: "invitation_pending",
    priority: "normal",
    createdAt: "2026-06-12T07:00:00Z",
    deadline: "2027-03-01T17:00:00Z",
    sentByClient: true,
    lastUpdated: "2026-06-12T07:00:00Z",
  },
];

/** @deprecated use MOCK_CLIENT_PROJECTS */
export const MOCK_CLIENT_JOBS = MOCK_CLIENT_PROJECTS;

export const MOCK_CLIENT_JOB_MESSAGES: Record<string, JobChatMessage[]> = {
  "proj-001": [
    {
      id: "msg-c1",
      jobId: "proj-001",
      sender: "artisan",
      text: "Structure milestone is complete. Inspector Chika has been assigned — you'll receive the report for approval shortly.",
      createdAt: "2026-06-10T14:00:00Z",
    },
    {
      id: "msg-c2",
      jobId: "proj-001",
      sender: "client",
      text: "Thank you. I'll review the inspector report once it's ready.",
      createdAt: "2026-06-10T14:30:00Z",
    },
  ],
  "proj-002": [
    {
      id: "msg-c3",
      jobId: "proj-002",
      sender: "artisan",
      text: "Three contractor proposals are ready for your comparison. Let me know if you'd like a walkthrough of any bid.",
      createdAt: "2026-06-08T11:05:00Z",
    },
  ],
  "proj-003": [
    {
      id: "msg-c4",
      jobId: "proj-003",
      sender: "artisan",
      text: "Concept designs are uploaded for your review. Please share feedback on the plaza facade and unit layouts.",
      createdAt: "2026-06-05T16:00:00Z",
    },
  ],
};

export const MOCK_CLIENT_ESCROW: ClientEscrow = {
  securedBalance: 33950000,
  pendingFunding: 120000000,
  pendingReleaseApproval: 14550000,
  releasedTotal: 12125000,
  minFunding: 500000,
  paymentMethod: {
    type: "card",
    label: "Visa",
    lastFour: "4242",
  },
  transactions: [
    {
      id: "ctx-1",
      type: "deposit",
      amount: 50925000,
      status: "completed",
      description: "Vault activated — Obi Family Duplex",
      date: "2026-02-15T09:00:00Z",
      jobId: "proj-001",
    },
    {
      id: "ctx-2",
      type: "release",
      amount: 12125000,
      status: "completed",
      description: "Foundation milestone released — Obi Family Duplex",
      date: "2026-04-02T10:00:00Z",
      jobId: "proj-001",
    },
    {
      id: "ctx-3",
      type: "deposit",
      amount: 8925000,
      status: "completed",
      description: "Architect retainer — Lagos Rental Plaza",
      date: "2026-05-02T10:00:00Z",
      jobId: "proj-003",
    },
    {
      id: "ctx-4",
      type: "release",
      amount: 14550000,
      status: "awaiting_approval",
      description: "Structure milestone — awaiting your approval (Obi Family Duplex)",
      date: "2026-06-10T14:30:00Z",
      jobId: "proj-001",
    },
  ],
};

export const MOCK_CLIENT_NOTIFICATIONS: ClientNotification[] = [
  {
    id: "cnotif-1",
    type: "warning",
    title: "Milestone ready for approval",
    message:
      "Structure milestone on Obi Family Duplex passed inspection with minor concerns. Review contractor evidence and inspector report.",
    actionLabel: "Review & approve",
    actionType: "approve_release",
    actionJobId: "proj-001",
    createdAt: "2026-06-10T14:35:00Z",
    read: false,
  },
  {
    id: "cnotif-2",
    type: "info",
    title: "Contractor proposals ready",
    message:
      "3 verified contractors submitted bids for Grace Chapel Extension. Compare price, timeline, and team.",
    actionLabel: "Compare bids",
    actionType: "review_proposals",
    actionJobId: "proj-002",
    dashboardView: "proposals",
    createdAt: "2026-06-08T11:10:00Z",
    read: false,
  },
  {
    id: "cnotif-3",
    type: "success",
    title: "Design update from architect",
    message:
      "Meridian Design Co. uploaded concept designs for Lagos Rental Plaza. Your review is requested.",
    actionLabel: "View update",
    dashboardView: "updates",
    createdAt: "2026-06-05T16:05:00Z",
    read: false,
  },
];

export const MOCK_ARCHITECTS: Architect[] = [
  {
    id: "arch-001",
    name: "Adeola Ogunleye",
    company: "Adeola Designs Ltd",
    verified: true,
    portfolioCount: 34,
    specialty: "Residential & mixed-use",
    rating: 4.9,
    reviewCount: 28,
    bio: "Diaspora-focused architect with 12 years delivering homes across Abuja, Lagos, and Port Harcourt.",
    services: ["Floor Plans", "3D Renderings", "Construction Drawings", "Bill of Quantities"],
    avatarUrl: null,
  },
  {
    id: "arch-002",
    name: "Emeka Nwankwo",
    company: "VisionArc Studio",
    verified: true,
    portfolioCount: 22,
    specialty: "Religious & institutional",
    rating: 4.8,
    reviewCount: 19,
    bio: "Specializes in worship centers, schools, and community buildings with phased delivery plans.",
    services: ["Floor Plans", "3D Renderings", "Construction Drawings", "Bill of Quantities"],
    avatarUrl: null,
  },
  {
    id: "arch-003",
    name: "Fatima Bello",
    company: "Meridian Design Co.",
    verified: true,
    portfolioCount: 18,
    specialty: "Commercial plazas",
    rating: 4.7,
    reviewCount: 14,
    bio: "Commercial and rental property design with BOQ-ready packages for contractor bidding.",
    services: ["Floor Plans", "3D Renderings", "Construction Drawings", "Bill of Quantities"],
    avatarUrl: null,
  },
  {
    id: "arch-004",
    name: "Tunde Adeyemi",
    company: "Heritage Architects",
    verified: true,
    portfolioCount: 41,
    specialty: "Family compounds & estates",
    rating: 4.6,
    reviewCount: 33,
    bio: "Multi-building family estates and compound layouts with traditional-modern fusion.",
    services: ["Floor Plans", "3D Renderings", "Construction Drawings", "Bill of Quantities"],
    avatarUrl: null,
  },
];

export const MOCK_CONTRACTOR_PROPOSALS: ContractorProposal[] = [
  {
    id: "bid-001",
    projectId: "proj-002",
    contractorName: "BuildRight Nigeria Ltd",
    company: "BuildRight Nigeria Ltd",
    verified: true,
    totalPrice: 118500000,
    timelineMonths: 14,
    materialsCost: 72000000,
    laborCost: 38000000,
    managementFee: 8500000,
    team: [
      { role: "Structural Engineer", name: "Eng. Ibrahim Musa" },
      { role: "Electrician", name: "Emeka Nwosu" },
      { role: "Plumber", name: "Grace Okon" },
      { role: "Carpenter", name: "James Okafor" },
    ],
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 24,
    feeStructure: "5% contractor management fee included in total",
  },
  {
    id: "bid-002",
    projectId: "proj-002",
    contractorName: "Cornerstone Builders",
    company: "Cornerstone Builders",
    verified: true,
    totalPrice: 112000000,
    timelineMonths: 16,
    materialsCost: 68000000,
    laborCost: 36000000,
    managementFee: 8000000,
    team: [
      { role: "Structural Engineer", name: "Eng. Ngozi Eze" },
      { role: "Electrician", name: "Chidi Eze" },
      { role: "Plumber", name: "Musa Ibrahim" },
    ],
    experienceYears: 8,
    rating: 4.5,
    reviewCount: 16,
    feeStructure: "Fixed management fee — no hidden markups",
  },
  {
    id: "bid-003",
    projectId: "proj-002",
    contractorName: "Summit Construction Group",
    company: "Summit Construction Group",
    verified: true,
    totalPrice: 125000000,
    timelineMonths: 12,
    materialsCost: 76000000,
    laborCost: 40000000,
    managementFee: 9000000,
    team: [
      { role: "Structural Engineer", name: "Eng. Amina Yusuf" },
      { role: "Electrician", name: "Ngozi Eze" },
      { role: "Plumber", name: "Fatima Bello" },
      { role: "Carpenter", name: "Tunde Adeyemi" },
      { role: "Project Manager", name: "David Waza" },
    ],
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 31,
    feeStructure: "Premium tier — accelerated timeline guarantee",
  },
];

export const MOCK_PROJECT_UPDATES: ProjectUpdate[] = [
  {
    id: "upd-001",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    date: "2026-06-10T14:00:00Z",
    professional: "Chika Nwosu",
    professionalRole: "inspector",
    update:
      "Structure milestone inspection complete — pass with minor concerns on east wing beam alignment.",
    photos: 8,
    videos: 2,
    documents: 1,
  },
  {
    id: "upd-002",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    date: "2026-06-08T09:00:00Z",
    professional: "BuildRight Nigeria Ltd",
    professionalRole: "contractor",
    update: "Structural frame completed. Ready for independent inspection.",
    photos: 12,
    videos: 1,
  },
  {
    id: "upd-003",
    projectId: "proj-003",
    projectName: "Lagos Rental Plaza",
    date: "2026-06-05T16:00:00Z",
    professional: "Meridian Design Co.",
    professionalRole: "architect",
    update: "Concept designs uploaded for client review — facade options A and B.",
    photos: 6,
    documents: 2,
  },
  {
    id: "upd-004",
    projectId: "proj-002",
    projectName: "Grace Chapel Extension",
    date: "2026-06-08T11:00:00Z",
    professional: "VisionArc Studio",
    professionalRole: "architect",
    update: "Final construction drawings approved. Contractor bidding is now open.",
    documents: 4,
  },
  {
    id: "upd-005",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    date: "2026-04-02T10:00:00Z",
    professional: "Amana Vault",
    professionalRole: "amana",
    update: "Foundation milestone payment released after client approval.",
    documents: 1,
  },
];

export const MOCK_PROJECT_DOCUMENTS: ProjectDocument[] = [
  {
    id: "doc-001",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    folder: "architect_documents",
    name: "Approved Construction Drawings v3.pdf",
    uploadedAt: "2026-01-20T10:00:00Z",
    sizeLabel: "4.2 MB",
  },
  {
    id: "doc-002",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    folder: "contracts",
    name: "BuildRight Contract Agreement.pdf",
    uploadedAt: "2026-02-10T14:00:00Z",
    sizeLabel: "1.8 MB",
  },
  {
    id: "doc-003",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    folder: "inspection_reports",
    name: "Foundation Inspection Report.pdf",
    uploadedAt: "2026-03-28T11:00:00Z",
    sizeLabel: "890 KB",
  },
  {
    id: "doc-004",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    folder: "inspection_reports",
    name: "Structure Inspection Report.pdf",
    uploadedAt: "2026-06-10T14:00:00Z",
    sizeLabel: "1.1 MB",
  },
  {
    id: "doc-005",
    projectId: "proj-001",
    projectName: "Obi Family Duplex",
    folder: "payment_records",
    name: "Foundation Release Receipt.pdf",
    uploadedAt: "2026-04-02T10:05:00Z",
    sizeLabel: "320 KB",
  },
  {
    id: "doc-006",
    projectId: "proj-002",
    projectName: "Grace Chapel Extension",
    folder: "architect_documents",
    name: "Worship Hall BOQ.xlsx",
    uploadedAt: "2026-05-15T09:00:00Z",
    sizeLabel: "2.4 MB",
  },
  {
    id: "doc-007",
    projectId: "proj-003",
    projectName: "Lagos Rental Plaza",
    folder: "architect_documents",
    name: "Concept Design Package.pdf",
    uploadedAt: "2026-06-05T16:00:00Z",
    sizeLabel: "8.6 MB",
  },
  {
    id: "doc-008",
    projectId: "proj-003",
    projectName: "Lagos Rental Plaza",
    folder: "receipts",
    name: "Architect Retainer Receipt.pdf",
    uploadedAt: "2026-05-02T10:05:00Z",
    sizeLabel: "280 KB",
  },
];

export function buildClientDashboardStats(projects: ClientProject[]) {
  const activeProjects = projects.filter((p) =>
    !["released", "cancelled", "declined", "invitation_expired"].includes(p.status) &&
    p.lifecycleStage !== "completed",
  );

  const vaultProtected = projects
    .filter((p) =>
      ["funds_secured", "in_progress", "proof_submitted", "disputed"].includes(p.status),
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const released = projects
    .filter((p) => p.status === "released" || p.lifecycleStage === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingActions = projects.filter(
    (p) =>
      p.status === "awaiting_funding" ||
      p.status === "proof_submitted" ||
      (p.releaseRequestAmount ?? 0) > 0 ||
      p.lifecycleStage === "contractor_bidding" ||
      p.lifecycleStage === "architect_selection",
  ).length;

  const pendingReleaseTotal = projects.reduce(
    (sum, p) => sum + (p.releaseRequestAmount ?? 0),
    0,
  );

  const pendingFunding = projects
    .filter((p) => p.status === "awaiting_funding")
    .reduce(
      (sum, p) => sum + p.amount + (p.protectionFee ?? Math.round(p.amount * 0.05)),
      0,
    );

  return {
    activeProjectCount: activeProjects.length,
    vaultProtected,
    fundsReleased: released,
    pendingActions,
    pendingReleaseTotal,
    pendingFunding,
    /** legacy */
    secured: vaultProtected,
    pendingApproval: pendingReleaseTotal,
    activeCount: activeProjects.length,
    released,
  };
}

export const BUILDING_OPTIONS = {
  residential: [
    { id: "bungalow", label: "Bungalow" },
    { id: "duplex", label: "Duplex" },
    { id: "mansion", label: "Mansion" },
    { id: "family_compound", label: "Family Compound" },
  ],
  religious: [
    { id: "church", label: "Church" },
    { id: "mosque", label: "Mosque" },
    { id: "worship_center", label: "Worship Center" },
  ],
  commercial: [
    { id: "office", label: "Office" },
    { id: "plaza", label: "Plaza" },
    { id: "rental_property", label: "Rental Property" },
  ],
  community: [
    { id: "school", label: "School" },
    { id: "nonprofit", label: "Nonprofit Building" },
  ],
} as const;

export const LAND_STATUS_OPTIONS = [
  { id: "own", label: "I own land" },
  { id: "family_owns", label: "Family owns land" },
  { id: "purchasing", label: "Purchasing land" },
  { id: "need_assistance", label: "Need assistance" },
] as const;

export const PROJECT_START_OPTIONS = [
  {
    id: "need_architect",
    label: "Need Architect",
    description: "Route to Architect Marketplace",
  },
  {
    id: "have_drawings",
    label: "Already Have Drawings",
    description: "Route to Contractor Bidding",
  },
  {
    id: "have_contractor",
    label: "Already Have Contractor",
    description: "Route to Vault Setup",
  },
] as const;

export const DESIGN_STAGE_LABELS: Record<string, string> = {
  initial_consultation: "Initial Consultation",
  concept_design: "Concept Design",
  client_review: "Client Review",
  final_documents: "Final Documents",
  ready_for_bidding: "Ready For Contractor Bidding",
};

export const LIFECYCLE_STAGE_LABELS: Record<string, string> = {
  vision: "Project Vision",
  architect_selection: "Architect Selection",
  design: "Design In Progress",
  contractor_bidding: "Contractor Bidding",
  vault_setup: "Vault Setup",
  construction: "Construction",
  completed: "Completed",
};

export const MOCK_CLIENT_REVIEWS = [
  {
    id: "crev-1",
    artisanName: "BuildRight Nigeria Ltd",
    jobTitle: "Obi Family Duplex — Foundation",
    jobId: "proj-001",
    rating: 5,
    comment: "Professional execution and clear milestone reporting throughout.",
    createdAt: "2026-04-05T10:00:00Z",
  },
];

export const DOCUMENT_FOLDER_LABELS: Record<string, string> = {
  architect_documents: "Architect Documents",
  contracts: "Contracts",
  receipts: "Receipts",
  inspection_reports: "Inspection Reports",
  payment_records: "Payment Records",
};
