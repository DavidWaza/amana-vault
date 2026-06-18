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
  MOCK_ARCHITECT_PROFILE,
  MOCK_ARCHITECT_VAULT,
  MOCK_ARCHITECT_PROJECTS,
  MOCK_ARCHITECT_NOTIFICATIONS,
} from "./mock-data";
import type {
  ArchitectNotification,
  ArchitectProfile,
  ArchitectProject,
  ArchitectVault,
} from "./types";

const PROFILE_KEY = "amana-architect-profile";

type ArchitectProfileContextValue = {
  profile: ArchitectProfile;
  setProfile: React.Dispatch<React.SetStateAction<ArchitectProfile>>;
  vault: ArchitectVault;
  setVault: React.Dispatch<React.SetStateAction<ArchitectVault>>;
  projects: ArchitectProject[];
  setProjects: React.Dispatch<React.SetStateAction<ArchitectProject[]>>;
  notifications: ArchitectNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ArchitectNotification[]>>;
  markNotificationRead: (id: string) => void;
  settingsOpen: boolean;
  openProfileSettings: () => void;
  closeProfileSettings: () => void;
};

const ArchitectProfileContext = createContext<ArchitectProfileContextValue | null>(null);

export function ArchitectProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArchitectProfile>(MOCK_ARCHITECT_PROFILE);
  const [vault, setVault] = useState<ArchitectVault>(MOCK_ARCHITECT_VAULT);
  const [projects, setProjects] = useState<ArchitectProject[]>(MOCK_ARCHITECT_PROJECTS);
  const [notifications, setNotifications] = useState(MOCK_ARCHITECT_NOTIFICATIONS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) setProfile(JSON.parse(saved) as ArchitectProfile);
    } catch {
      /* use default */
    }
    setHydrated(true);
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

  const openProfileSettings = useCallback(() => setSettingsOpen(true), []);
  const closeProfileSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <ArchitectProfileContext.Provider
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
