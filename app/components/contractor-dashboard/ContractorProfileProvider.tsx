"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_CONTRACTOR_PROFILE,
  MOCK_CONTRACTOR_VAULT,
  MOCK_CONTRACTOR_PROJECTS,
  MOCK_CONTRACTOR_NOTIFICATIONS,
} from "./mock-data";
import { PROFILE_STORAGE_KEY } from "./onboarding-constants";
import type {
  ContractorNotification,
  ContractorProfile,
  ContractorProject,
  ContractorVault,
} from "./types";

type ContractorProfileContextValue = {
  profile: ContractorProfile;
  setProfile: React.Dispatch<React.SetStateAction<ContractorProfile>>;
  vault: ContractorVault;
  setVault: React.Dispatch<React.SetStateAction<ContractorVault>>;
  projects: ContractorProject[];
  setProjects: React.Dispatch<React.SetStateAction<ContractorProject[]>>;
  notifications: ContractorNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ContractorNotification[]>>;
  markNotificationRead: (id: string) => void;
  settingsOpen: boolean;
  openProfileSettings: () => void;
  closeProfileSettings: () => void;
};

const ContractorProfileContext = createContext<ContractorProfileContextValue | null>(null);

export function ContractorProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ContractorProfile>(MOCK_CONTRACTOR_PROFILE);
  const [vault, setVault] = useState<ContractorVault>(MOCK_CONTRACTOR_VAULT);
  const [projects, setProjects] = useState<ContractorProject[]>(MOCK_CONTRACTOR_PROJECTS);
  const [notifications, setNotifications] = useState(MOCK_CONTRACTOR_NOTIFICATIONS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved) as ContractorProfile);
    } catch {
      /* use default */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const openProfileSettings = useCallback(() => setSettingsOpen(true), []);
  const closeProfileSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <ContractorProfileContext.Provider
      value={{
        profile,
        setProfile,
        vault,
        setVault,
        projects,
        setProjects,
        notifications,
        setNotifications,
        markNotificationRead,
        settingsOpen,
        openProfileSettings,
        closeProfileSettings,
      }}
    >
      <div className="min-h-screen bg-[#f4f6f5] text-text">{children}</div>
    </ContractorProfileContext.Provider>
  );
}

export function useContractorProfile() {
  const context = useContext(ContractorProfileContext);
  if (!context) {
    throw new Error("useContractorProfile must be used within ContractorProfileProvider");
  }
  return context;
}
