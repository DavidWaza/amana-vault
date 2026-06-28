import type {
  ClientEscrow,
  ClientJob,
  ClientNotification,
  ContractorProposal,
  ClientProfile,
  JobChatMessage,
} from "./types";
import type { ProjectBriefTrail } from "./build-journey/submission-trail";

export const CLIENT_SESSION_STORAGE_KEY = "amana-client-session";

export type ClientSession = {
  profile: ClientProfile;
  escrow: ClientEscrow;
  jobs: ClientJob[];
  jobMessages: Record<string, JobChatMessage[]>;
  notifications: ClientNotification[];
  proposals: ContractorProposal[];
  briefTrails: ProjectBriefTrail[];
};

export const EMPTY_CLIENT_PROFILE: ClientProfile = {
  id: "client-new",
  fullName: "",
  phone: "",
  email: "",
  countryOfResidence: "",
  area: "",
  areaLabel: "",
  avatarUrl: null,
  verificationStatus: "unverified",
  paymentMethodStatus: "not_set",
  profileComplete: false,
  memberSince: "2026-06-22",
  projectsProtected: 0,
  totalVaultProtected: 0,
  jobsProtected: 0,
  totalEscrowed: 0,
};

export const EMPTY_CLIENT_ESCROW: ClientEscrow = {
  securedBalance: 0,
  pendingFunding: 0,
  pendingReleaseApproval: 0,
  releasedTotal: 0,
  minFunding: 500_000,
  paymentMethod: null,
  transactions: [],
};

export const DEFAULT_CLIENT_SESSION: ClientSession = {
  profile: EMPTY_CLIENT_PROFILE,
  escrow: EMPTY_CLIENT_ESCROW,
  jobs: [],
  jobMessages: {},
  notifications: [],
  proposals: [],
  briefTrails: [],
};

export function loadClientSession(): ClientSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CLIENT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClientSession;
  } catch {
    return null;
  }
}

export function saveClientSession(session: ClientSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLIENT_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLIENT_SESSION_STORAGE_KEY);
}
