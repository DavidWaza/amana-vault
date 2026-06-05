"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MOCK_ARTISAN, MOCK_NOTIFICATIONS, MOCK_WALLET } from "./mock-data";
import { applyGrowthPurchase } from "./growth-utils";
import ArtisanProfileSettings from "./ArtisanProfileSettings";
import type {
  ArtisanNotification,
  ArtisanProfile,
  ArtisanWallet,
  GrowthFeatureId,
  ProfileSettingsTab,
} from "./types";

const STORAGE_KEY = "amana-artisan-profile";

type ArtisanProfileContextValue = {
  profile: ArtisanProfile;
  setProfile: React.Dispatch<React.SetStateAction<ArtisanProfile>>;
  wallet: ArtisanWallet;
  setWallet: React.Dispatch<React.SetStateAction<ArtisanWallet>>;
  notifications: ArtisanNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ArtisanNotification[]>>;
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  settingsOpen: boolean;
  settingsTab: ProfileSettingsTab;
  openProfileSettings: (tab?: ProfileSettingsTab) => void;
  closeProfileSettings: () => void;
  purchaseGrowthFeature: (featureId: GrowthFeatureId) => Promise<void>;
  handleAccountChange: (data: { phone: string; email: string }) => void;
  handlePayoutChange: (payout: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => void;
};

const ArtisanProfileContext = createContext<ArtisanProfileContextValue | null>(
  null,
);

export function ArtisanProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArtisanProfile>(MOCK_ARTISAN);
  const [wallet, setWallet] = useState<ArtisanWallet>(MOCK_WALLET);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<ProfileSettingsTab>("profile");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved) as ArtisanProfile);
      }
    } catch {
      /* use default mock */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const openProfileSettings = useCallback((tab: ProfileSettingsTab = "profile") => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  }, []);

  const closeProfileSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const purchaseGrowthFeature = useCallback(async (featureId: GrowthFeatureId) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setProfile((prev) => applyGrowthPurchase(prev, featureId));
  }, []);

  const handleAccountChange = useCallback((data: { phone: string; email: string }) => {
    setProfile((prev) => ({ ...prev, phone: data.phone, email: data.email }));
  }, []);

  const handlePayoutChange = useCallback(
    (payout: { bankName: string; accountNumber: string; accountName: string }) => {
      setWallet((prev) => ({
        ...prev,
        bankAccount: {
          bankName: payout.bankName,
          accountNumber: payout.accountNumber,
          accountName: payout.accountName,
        },
      }));
      setProfile((prev) => ({ ...prev, payoutStatus: "pending" }));
    },
    [],
  );

  return (
    <ArtisanProfileContext.Provider
      value={{
        profile,
        setProfile,
        wallet,
        setWallet,
        notifications,
        setNotifications,
        dismissNotification,
        markNotificationRead,
        settingsOpen,
        settingsTab,
        openProfileSettings,
        closeProfileSettings,
        purchaseGrowthFeature,
        handleAccountChange,
        handlePayoutChange,
      }}
    >
      {children}
      <ArtisanProfileSettings
        profile={profile}
        bankAccount={wallet.bankAccount}
        open={settingsOpen}
        initialTab={settingsTab}
        onClose={closeProfileSettings}
        onSaveProfile={(updated) => {
          setProfile(updated);
          closeProfileSettings();
        }}
        onSaveAccount={handleAccountChange}
        onSavePassword={async () => {
          /* API hook */
        }}
        onSavePayout={(payout) => {
          handlePayoutChange(payout);
          closeProfileSettings();
        }}
      />
    </ArtisanProfileContext.Provider>
  );
}

export function useArtisanProfile() {
  const context = useContext(ArtisanProfileContext);
  if (!context) {
    throw new Error("useArtisanProfile must be used within ArtisanProfileProvider");
  }
  return context;
}
