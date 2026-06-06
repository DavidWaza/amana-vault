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
  MOCK_CLIENT,
  MOCK_CLIENT_ESCROW,
  MOCK_CLIENT_JOBS,
  MOCK_CLIENT_JOB_MESSAGES,
  MOCK_CLIENT_NOTIFICATIONS,
} from "./mock-data";
import ClientProfileSettings from "./ClientProfileSettings";
import ClientJobChat from "./ClientJobChat";
import type {
  ClientEscrow,
  ClientJob,
  ClientNotification,
  ClientProfile,
  ClientProfileSettingsTab,
  JobChatMessage,
} from "./types";

const STORAGE_KEY = "amana-client-profile";

type ClientProfileContextValue = {
  profile: ClientProfile;
  setProfile: React.Dispatch<React.SetStateAction<ClientProfile>>;
  escrow: ClientEscrow;
  setEscrow: React.Dispatch<React.SetStateAction<ClientEscrow>>;
  jobs: ClientJob[];
  setJobs: React.Dispatch<React.SetStateAction<ClientJob[]>>;
  jobMessages: Record<string, JobChatMessage[]>;
  setJobMessages: React.Dispatch<
    React.SetStateAction<Record<string, JobChatMessage[]>>
  >;
  chatReadAt: Record<string, string>;
  chatJobId: string | null;
  openChat: (jobId: string) => void;
  closeChat: () => void;
  sendChatMessage: (jobId: string, text: string) => void;
  notifications: ClientNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ClientNotification[]>>;
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  settingsOpen: boolean;
  settingsTab: ClientProfileSettingsTab;
  openProfileSettings: (tab?: ClientProfileSettingsTab) => void;
  closeProfileSettings: () => void;
  handleAccountChange: (data: { phone: string; email: string }) => void;
  handlePaymentMethodChange: (method: {
    type: "card" | "bank_transfer";
    label: string;
    lastFour: string;
  }) => void;
};

const ClientProfileContext = createContext<ClientProfileContextValue | null>(null);

export function ClientProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ClientProfile>(MOCK_CLIENT);
  const [escrow, setEscrow] = useState<ClientEscrow>(MOCK_CLIENT_ESCROW);
  const [jobs, setJobs] = useState<ClientJob[]>(MOCK_CLIENT_JOBS);
  const [jobMessages, setJobMessages] =
    useState<Record<string, JobChatMessage[]>>(MOCK_CLIENT_JOB_MESSAGES);
  const [chatReadAt, setChatReadAt] = useState<Record<string, string>>({});
  const [chatJobId, setChatJobId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(MOCK_CLIENT_NOTIFICATIONS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] =
    useState<ClientProfileSettingsTab>("profile");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved) as ClientProfile);
    } catch {
      /* use default */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  const openProfileSettings = useCallback(
    (tab: ClientProfileSettingsTab = "profile") => {
      setSettingsTab(tab);
      setSettingsOpen(true);
    },
    [],
  );

  const closeProfileSettings = useCallback(() => setSettingsOpen(false), []);

  const openChat = useCallback((jobId: string) => {
    setChatJobId(jobId);
    setChatReadAt((prev) => ({ ...prev, [jobId]: new Date().toISOString() }));
  }, []);

  const closeChat = useCallback(() => setChatJobId(null), []);

  const sendChatMessage = useCallback((jobId: string, text: string) => {
    const message: JobChatMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      sender: "client",
      text,
      createdAt: new Date().toISOString(),
    };

    setJobMessages((prev) => ({
      ...prev,
      [jobId]: [...(prev[jobId] ?? []), message],
    }));

    window.setTimeout(() => {
      setJobMessages((prev) => ({
        ...prev,
        [jobId]: [
          ...(prev[jobId] ?? []),
          {
            id: `msg-${Date.now()}-reply`,
            jobId,
            sender: "artisan",
            text: "Thanks — I'll review this and get back to you shortly.",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    }, 1800);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const handleAccountChange = useCallback((data: { phone: string; email: string }) => {
    setProfile((prev) => ({ ...prev, phone: data.phone, email: data.email }));
  }, []);

  const handlePaymentMethodChange = useCallback(
    (method: { type: "card" | "bank_transfer"; label: string; lastFour: string }) => {
      setEscrow((prev) => ({ ...prev, paymentMethod: method }));
      setProfile((prev) => ({ ...prev, paymentMethodStatus: "pending" }));
    },
    [],
  );

  const chatJob = jobs.find((job) => job.id === chatJobId) ?? null;

  return (
    <ClientProfileContext.Provider
      value={{
        profile,
        setProfile,
        escrow,
        setEscrow,
        jobs,
        setJobs,
        jobMessages,
        setJobMessages,
        chatReadAt,
        chatJobId,
        openChat,
        closeChat,
        sendChatMessage,
        notifications,
        setNotifications,
        dismissNotification,
        markNotificationRead,
        settingsOpen,
        settingsTab,
        openProfileSettings,
        closeProfileSettings,
        handleAccountChange,
        handlePaymentMethodChange,
      }}
    >
      <div className="cdash-page">
        {children}
        <ClientProfileSettings
        profile={profile}
        paymentMethod={escrow.paymentMethod}
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
        onSavePayment={(method) => {
          handlePaymentMethodChange(method);
          closeProfileSettings();
        }}
        />
        <ClientJobChat
        job={chatJob}
        messages={chatJobId ? (jobMessages[chatJobId] ?? []) : []}
        clientName={profile.fullName}
        open={chatJobId !== null}
        onClose={closeChat}
          onSend={sendChatMessage}
        />
      </div>
    </ClientProfileContext.Provider>
  );
}

export function useClientProfile() {
  const context = useContext(ClientProfileContext);
  if (!context) {
    throw new Error("useClientProfile must be used within ClientProfileProvider");
  }
  return context;
}
