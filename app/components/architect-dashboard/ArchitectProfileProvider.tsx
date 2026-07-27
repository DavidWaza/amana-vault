"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_ARCHITECT_ACTIVITY,
  MOCK_ARCHITECT_NOTIFICATIONS,
  MOCK_ARCHITECT_PROFILE,
  MOCK_ARCHITECT_PROJECTS,
  MOCK_ARCHITECT_PROPOSALS,
  MOCK_OPPORTUNITIES,
  MOCK_PROJECT_MESSAGES,
  MOCK_TEAM,
} from "./mock-data";
import {
  computeFinancials,
  derivePriorities,
  deriveSummary,
} from "./portal-utils";
import type {
  ArchitectActivity,
  ArchitectFinancials,
  ArchitectNotification,
  ArchitectProfile,
  ArchitectProject,
  ArchitectProposal,
  ArchitectSummary,
  DesignOpportunity,
  PriorityItem,
  ProjectMessage,
  TeamMember,
} from "./types";

const PROFILE_KEY = "amana-architect-profile";

type ArchitectProfileContextValue = {
  profile: ArchitectProfile;
  setProfile: React.Dispatch<React.SetStateAction<ArchitectProfile>>;
  projects: ArchitectProject[];
  setProjects: React.Dispatch<React.SetStateAction<ArchitectProject[]>>;
  opportunities: DesignOpportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<DesignOpportunity[]>>;
  proposals: ArchitectProposal[];
  setProposals: React.Dispatch<React.SetStateAction<ArchitectProposal[]>>;
  messages: ProjectMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ProjectMessage[]>>;
  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  notifications: ArchitectNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ArchitectNotification[]>>;
  activity: ArchitectActivity[];
  pushActivity: (text: string, tone: ArchitectActivity["tone"]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  /* Derived — recomputed whenever the underlying data changes. */
  priorities: PriorityItem[];
  summary: ArchitectSummary;
  financials: ArchitectFinancials;
  settingsOpen: boolean;
  openProfileSettings: () => void;
  closeProfileSettings: () => void;
};

const ArchitectProfileContext = createContext<ArchitectProfileContextValue | null>(null);

export function ArchitectProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArchitectProfile>(MOCK_ARCHITECT_PROFILE);
  const [projects, setProjects] = useState<ArchitectProject[]>(MOCK_ARCHITECT_PROJECTS);
  const [opportunities, setOpportunities] = useState<DesignOpportunity[]>(MOCK_OPPORTUNITIES);
  const [proposals, setProposals] = useState<ArchitectProposal[]>(MOCK_ARCHITECT_PROPOSALS);
  const [messages, setMessages] = useState<ProjectMessage[]>(MOCK_PROJECT_MESSAGES);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [notifications, setNotifications] = useState(MOCK_ARCHITECT_NOTIFICATIONS);
  const [activity, setActivity] = useState<ArchitectActivity[]>(MOCK_ARCHITECT_ACTIVITY);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       Reading localStorage during render would desync the server-rendered markup,
       so the saved profile is applied after hydration. */
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) setProfile(JSON.parse(saved) as ArchitectProfile);
    } catch {
      /* use default */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const pushActivity = useCallback((text: string, tone: ArchitectActivity["tone"]) => {
    setActivity((prev) => [
      { id: `act-${Date.now()}`, text, tone, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const priorities = useMemo(
    () => derivePriorities(projects, opportunities, proposals),
    [projects, opportunities, proposals],
  );

  const summary = useMemo(
    () => deriveSummary(projects, opportunities, proposals, priorities),
    [projects, opportunities, proposals, priorities],
  );

  const financials = useMemo(() => computeFinancials(projects), [projects]);

  const openProfileSettings = useCallback(() => setSettingsOpen(true), []);
  const closeProfileSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <ArchitectProfileContext.Provider
      value={{
        profile,
        setProfile,
        projects,
        setProjects,
        opportunities,
        setOpportunities,
        proposals,
        setProposals,
        messages,
        setMessages,
        team,
        setTeam,
        notifications,
        setNotifications,
        activity,
        pushActivity,
        markNotificationRead,
        markAllNotificationsRead,
        priorities,
        summary,
        financials,
        settingsOpen,
        openProfileSettings,
        closeProfileSettings,
      }}
    >
      <div className="adash-page ap-portal">{children}</div>
    </ArchitectProfileContext.Provider>
  );
}

export function useArchitectProfile() {
  const context = useContext(ArchitectProfileContext);
  if (!context) {
    throw new Error("useArchitectProfile must be used within ArchitectProfileProvider");
  }
  return context;
}
