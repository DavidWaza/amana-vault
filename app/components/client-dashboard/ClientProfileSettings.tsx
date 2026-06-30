"use client";

import { useEffect, useState } from "react";
import { X, UserCircle, Gear, CreditCard, SignOut } from "phosphor-react";
import { Button } from "@/app/components/ui/Button";
import { useAsyncAction } from "@/app/lib/useAsyncAction";
import type { ClientProfile, ClientProfileSettingsTab, ClientPaymentMethod } from "./types";
import PasswordInput from "../PasswordInput";

const DRAWER_ANIMATION_MS = 360;

type ClientProfileSettingsProps = {
  profile: ClientProfile;
  paymentMethod: ClientPaymentMethod | null;
  open: boolean;
  initialTab?: ClientProfileSettingsTab;
  onClose: () => void;
  onSaveProfile: (profile: ClientProfile) => void;
  onSaveAccount: (account: { phone: string; email: string }) => void;
  onSavePassword: (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void> | void;
  onSavePayment: (method: ClientPaymentMethod) => void;
  onLogout: () => void;
};

export default function ClientProfileSettings({
  profile,
  paymentMethod,
  open,
  initialTab = "profile",
  onClose,
  onSaveProfile,
  onSaveAccount,
  onSavePassword,
  onSavePayment,
  onLogout,
}: ClientProfileSettingsProps) {
  const [tab, setTab] = useState<ClientProfileSettingsTab>("profile");
  const [profileForm, setProfileForm] = useState(profile);
  const [accountForm, setAccountForm] = useState({
    phone: profile.phone,
    email: profile.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    type: paymentMethod?.type ?? "card",
    label: paymentMethod?.label ?? "",
    lastFour: paymentMethod?.lastFour ?? "",
  });
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), DRAWER_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setProfileForm(profile);
    setAccountForm({
      phone: profile.phone,
      email: profile.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPaymentForm({
      type: paymentMethod?.type ?? "card",
      label: paymentMethod?.label ?? "",
      lastFour: paymentMethod?.lastFour ?? "",
    });
    setTab(initialTab);
  }, [open, profile, paymentMethod, initialTab]);

  const [handleSaveProfile, profileSaveLoading] = useAsyncAction(() => {
    onSaveProfile({ ...profileForm, profileComplete: true });
  });

  const [handleSaveAccount, accountSaveLoading] = useAsyncAction(async () => {
    onSaveAccount({
      phone: accountForm.phone,
      email: accountForm.email,
    });
    if (accountForm.newPassword) {
      await onSavePassword({
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword,
      });
    }
  });

  const [handleSavePayment, paymentSaveLoading] = useAsyncAction(() => {
    onSavePayment({
      type: paymentForm.type as "card" | "bank_transfer",
      label: paymentForm.label,
      lastFour: paymentForm.lastFour,
    });
  });

  if (!mounted) return null;

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: <UserCircle size={18} weight="bold" /> },
    { id: "account" as const, label: "Account", icon: <Gear size={18} weight="bold" /> },
    { id: "payment" as const, label: "Payment", icon: <CreditCard size={18} weight="bold" /> },
  ];

  return (
    <div
      className={`adash-settings-overlay${visible ? " adash-settings-overlay--open" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`adash-settings-panel${visible ? " adash-settings-panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-settings-header">
          <div>
            <p className="adash-eyebrow">Profile Settings</p>
            <h2>Manage your client account</h2>
          </div>
          <button type="button" className="adash-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="adash-settings-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`adash-settings-tab${tab === item.id ? " adash-settings-tab--active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="adash-settings-body">
          {tab === "profile" && (
            <div className="adash-settings-section">
              <div className="adash-field">
                <label className="adash-label" htmlFor="client-fullName">Full Name</label>
                <input
                  id="client-fullName"
                  className="adash-input"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>
              <div className="adash-field">
                <label className="adash-label" htmlFor="client-area">Primary Area</label>
                <input
                  id="client-area"
                  className="adash-input"
                  value={profileForm.areaLabel}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, areaLabel: e.target.value }))
                  }
                />
              </div>
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSaveProfile}
                loading={profileSaveLoading}
                loadingLabel="Saving…"
              >
                Save profile
              </Button>
            </div>
          )}

          {tab === "account" && (
            <div className="adash-settings-section">
              <div className="adash-field">
                <label className="adash-label" htmlFor="client-phone">Phone</label>
                <input
                  id="client-phone"
                  className="adash-input"
                  value={accountForm.phone}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="adash-field">
                <label className="adash-label" htmlFor="client-email">Email</label>
                <input
                  id="client-email"
                  className="adash-input"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="adash-field">
                <label className="adash-label" htmlFor="client-newPassword">New password</label>
                <PasswordInput
                  id="client-newPassword"
                  className="adash-input"
                  value={accountForm.newPassword}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                />
              </div>
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSaveAccount}
                loading={accountSaveLoading}
                loadingLabel="Saving…"
              >
                Save account
              </Button>
            </div>
          )}

          {tab === "payment" && (
            <div className="adash-settings-section">
              <p className="adash-settings-intro">
                Your payment method is used to fund escrow. Amana never stores full card numbers.
              </p>
              <div className="adash-field">
                <label className="adash-label" htmlFor="pay-type">Method type</label>
                <select
                  id="pay-type"
                  className="adash-input adash-select"
                  value={paymentForm.type}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      type: e.target.value as "card" | "bank_transfer",
                    }))
                  }
                >
                  <option value="card">Debit / Credit card</option>
                  <option value="bank_transfer">Bank transfer</option>
                </select>
              </div>
              <div className="adash-field">
                <label className="adash-label" htmlFor="pay-label">Label</label>
                <input
                  id="pay-label"
                  className="adash-input"
                  placeholder="e.g. Visa, GTBank"
                  value={paymentForm.label}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </div>
              <div className="adash-field">
                <label className="adash-label" htmlFor="pay-last4">Last 4 digits</label>
                <input
                  id="pay-last4"
                  className="adash-input"
                  maxLength={4}
                  value={paymentForm.lastFour}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      lastFour: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                />
              </div>
              <Button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSavePayment}
                loading={paymentSaveLoading}
                loadingLabel="Saving…"
              >
                Save payment method
              </Button>
            </div>
          )}
        </div>

        <div className="adash-settings-footer">
          <button
            type="button"
            className="adash-btn adash-btn--danger adash-btn--block"
            onClick={onLogout}
          >
            <SignOut size={16} weight="bold" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
