"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  UserCircle,
  Gear,
  Bank,
  Camera,
  UploadSimple,
  Warning,
} from "phosphor-react";
import type {
  ArtisanProfile,
  ArtisanAccountForm,
  ArtisanPayoutForm,
  ProfileSettingsTab,
} from "./types";
import type { ArtisanBankAccount } from "./types";
import {
  AREA_OPTIONS,
  BANK_OPTIONS,
  EXPERIENCE_OPTIONS,
  SERVICE_CATEGORIES,
  TRAVEL_OPTIONS,
  getAreaLabel,
  getCategoryLabel,
} from "./profile-constants";

const PASSWORD_MIN_LENGTH = 8;

type ArtisanProfileSettingsProps = {
  profile: ArtisanProfile;
  bankAccount: ArtisanBankAccount | null;
  open: boolean;
  onClose: () => void;
  onSaveProfile: (profile: ArtisanProfile) => void;
  onSaveAccount: (account: Pick<ArtisanAccountForm, "phone" | "email">) => void;
  onSavePassword: (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void> | void;
  onSavePayout: (payout: ArtisanPayoutForm) => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ArtisanProfileSettings({
  profile,
  bankAccount,
  open,
  onClose,
  onSaveProfile,
  onSaveAccount,
  onSavePassword,
  onSavePayout,
}: ArtisanProfileSettingsProps) {
  const [tab, setTab] = useState<ProfileSettingsTab>("profile");
  const [profileForm, setProfileForm] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [accountForm, setAccountForm] = useState<ArtisanAccountForm>({
    phone: profile.phone,
    email: profile.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [payoutForm, setPayoutForm] = useState<ArtisanPayoutForm>({
    bankName: bankAccount?.bankName ?? "",
    accountNumber: bankAccount?.accountNumber ?? "",
    accountName: bankAccount?.accountName ?? profile.fullName,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setProfileForm(profile);
    setAvatarPreview(profile.avatarUrl);
    setAccountForm({
      phone: profile.phone,
      email: profile.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPayoutForm({
      bankName: bankAccount?.bankName ?? "",
      accountNumber: bankAccount?.accountNumber ?? "",
      accountName: bankAccount?.accountName ?? profile.fullName,
    });
    setErrors({});
    setSuccess(null);
    setTab("profile");
  }, [open, profile, bankAccount]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== profile.avatarUrl) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, profile.avatarUrl]);

  if (!open) return null;

  const handleAvatarChange = (file: File | null) => {
    if (avatarPreview && avatarPreview !== profile.avatarUrl) {
      URL.revokeObjectURL(avatarPreview);
    }
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setProfileForm((prev) => ({ ...prev, avatarUrl: url }));
  };

  const validateProfile = (): boolean => {
    const next: Record<string, string> = {};
    if (profileForm.fullName.trim().length < 3) {
      next.fullName = "Enter your full name.";
    }
    if (profileForm.category === "other" && profileForm.otherTrade.trim().length < 3) {
      next.otherTrade = "Describe your trade.";
    }
    if (!profileForm.category) next.category = "Select a service category.";
    if (!profileForm.area) next.area = "Select your primary area.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateAccount = (includePassword: boolean): boolean => {
    const next: Record<string, string> = {};
    if (accountForm.phone.trim().length < 6) {
      next.phone = "Enter a valid phone number.";
    }
    if (accountForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
      next.email = "Enter a valid email address.";
    }
    if (includePassword) {
      if (!accountForm.currentPassword) {
        next.currentPassword = "Current password is required.";
      }
      if (accountForm.newPassword.length < PASSWORD_MIN_LENGTH) {
        next.newPassword = `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
      }
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        next.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePayout = (): boolean => {
    const next: Record<string, string> = {};
    if (!payoutForm.bankName) next.bankName = "Select your bank.";
    if (!/^\d{10}$/.test(payoutForm.accountNumber)) {
      next.accountNumber = "Account number must be 10 digits.";
    }
    if (!payoutForm.accountName.trim()) {
      next.accountName = "Account name is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) return;
    setSaving(true);
    onSaveProfile({
      ...profileForm,
      categoryLabel: getCategoryLabel(profileForm.category, profileForm.otherTrade),
      areaLabel: getAreaLabel(profileForm.area),
      profileComplete: true,
    });
    setSuccess("Profile updated successfully.");
    setSaving(false);
  };

  const handleSaveAccount = async () => {
    const changingPassword =
      accountForm.newPassword.length > 0 || accountForm.currentPassword.length > 0;
    if (!validateAccount(changingPassword)) return;

    setSaving(true);
    try {
      onSaveAccount({
        phone: accountForm.phone,
        email: accountForm.email,
      });
      if (changingPassword) {
        await onSavePassword({
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
        });
        setAccountForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
      setSuccess(
        changingPassword
          ? "Account details and password updated."
          : "Account details updated.",
      );
    } catch {
      setErrors({ currentPassword: "Current password is incorrect." });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayout = () => {
    if (!validatePayout()) return;
    setSaving(true);
    onSavePayout(payoutForm);
    setSuccess("Payout details submitted for verification.");
    setSaving(false);
  };

  const tabs: { id: ProfileSettingsTab; label: string; icon: ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <UserCircle size={18} weight="bold" /> },
    { id: "account", label: "Account", icon: <Gear size={18} weight="bold" /> },
    { id: "payout", label: "Payout", icon: <Bank size={18} weight="bold" /> },
  ];

  return (
    <div className="adash-settings-overlay" role="presentation" onClick={onClose}>
      <div
        className="adash-settings-panel"
        role="dialog"
        aria-labelledby="profile-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adash-settings-header">
          <div>
            <p className="adash-eyebrow">Profile Settings</p>
            <h2 id="profile-settings-title">Manage your artisan account</h2>
          </div>
          <button
            type="button"
            className="adash-modal-close"
            onClick={onClose}
            aria-label="Close settings"
          >
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
              onClick={() => {
                setTab(item.id);
                setErrors({});
                setSuccess(null);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {success && (
          <div className="adash-settings-success" role="status">
            {success}
          </div>
        )}

        <div className="adash-settings-body">
          {tab === "profile" && (
            <div className="adash-settings-section">
              <div className="adash-settings-avatar-block">
                <div className="adash-settings-avatar">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" />
                  ) : (
                    <span>{getInitials(profileForm.fullName)}</span>
                  )}
                </div>
                <div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="join-upload-input"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className="adash-btn adash-btn--secondary"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera size={16} weight="bold" />
                    Upload new photo
                  </button>
                  <p className="adash-settings-hint">JPG or PNG · Max 5MB</p>
                </div>
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-fullName">Full Name</label>
                <input
                  id="settings-fullName"
                  className={`adash-input${errors.fullName ? " adash-input--error" : ""}`}
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
                {errors.fullName && <p className="adash-field-error">{errors.fullName}</p>}
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-bio">Bio</label>
                <textarea
                  id="settings-bio"
                  className="adash-input adash-textarea"
                  rows={4}
                  placeholder="Tell clients about your experience and specialties..."
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-category">Service Category</label>
                <select
                  id="settings-category"
                  className={`adash-input adash-select${errors.category ? " adash-input--error" : ""}`}
                  value={profileForm.category}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                      otherTrade: e.target.value === "other" ? prev.otherTrade : "",
                    }))
                  }
                >
                  <option value="" disabled>Select your trade...</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {profileForm.category === "other" && (
                <div className="adash-field">
                  <label className="adash-label" htmlFor="settings-otherTrade">Specify trade</label>
                  <input
                    id="settings-otherTrade"
                    className={`adash-input${errors.otherTrade ? " adash-input--error" : ""}`}
                    value={profileForm.otherTrade}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, otherTrade: e.target.value }))
                    }
                  />
                  {errors.otherTrade && <p className="adash-field-error">{errors.otherTrade}</p>}
                </div>
              )}

              <div className="adash-settings-grid">
                <div className="adash-field">
                  <label className="adash-label" htmlFor="settings-experience">Experience</label>
                  <select
                    id="settings-experience"
                    className="adash-input adash-select"
                    value={profileForm.experience}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, experience: e.target.value }))
                    }
                  >
                    <option value="" disabled>Select...</option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="adash-field">
                  <label className="adash-label" htmlFor="settings-area">Primary Area</label>
                  <select
                    id="settings-area"
                    className={`adash-input adash-select${errors.area ? " adash-input--error" : ""}`}
                    value={profileForm.area}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, area: e.target.value }))
                    }
                  >
                    <option value="" disabled>Select area...</option>
                    {AREA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-travel">Travel range</label>
                <select
                  id="settings-travel"
                  className="adash-input adash-select"
                  value={profileForm.travelRadius}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, travelRadius: e.target.value }))
                  }
                >
                  {TRAVEL_OPTIONS.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                Save profile
              </button>
            </div>
          )}

          {tab === "account" && (
            <div className="adash-settings-section">
              <p className="adash-settings-intro">
                Update how clients and Amana reach you. Phone changes may require OTP
                verification when connected to the API.
              </p>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-phone">Phone Number</label>
                <input
                  id="settings-phone"
                  type="tel"
                  className={`adash-input${errors.phone ? " adash-input--error" : ""}`}
                  value={accountForm.phone}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                {errors.phone && <p className="adash-field-error">{errors.phone}</p>}
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-email">Email</label>
                <input
                  id="settings-email"
                  type="email"
                  className={`adash-input${errors.email ? " adash-input--error" : ""}`}
                  placeholder="e.g. musa@email.com"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                {errors.email && <p className="adash-field-error">{errors.email}</p>}
              </div>

              <div className="adash-settings-divider">
                <h3>Change password</h3>
                <p>Leave blank if you don&apos;t want to update your password.</p>
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-currentPassword">Current password</label>
                <input
                  id="settings-currentPassword"
                  type="password"
                  className={`adash-input${errors.currentPassword ? " adash-input--error" : ""}`}
                  value={accountForm.currentPassword}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  autoComplete="current-password"
                />
                {errors.currentPassword && (
                  <p className="adash-field-error">{errors.currentPassword}</p>
                )}
              </div>

              <div className="adash-settings-grid">
                <div className="adash-field">
                  <label className="adash-label" htmlFor="settings-newPassword">New password</label>
                  <input
                    id="settings-newPassword"
                    type="password"
                    className={`adash-input${errors.newPassword ? " adash-input--error" : ""}`}
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                  {errors.newPassword && <p className="adash-field-error">{errors.newPassword}</p>}
                </div>
                <div className="adash-field">
                  <label className="adash-label" htmlFor="settings-confirmPassword">Confirm password</label>
                  <input
                    id="settings-confirmPassword"
                    type="password"
                    className={`adash-input${errors.confirmPassword ? " adash-input--error" : ""}`}
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="adash-field-error">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSaveAccount}
                disabled={saving}
              >
                Save account details
              </button>
            </div>
          )}

          {tab === "payout" && (
            <div className="adash-settings-section">
              <div className="adash-settings-notice">
                <Warning size={18} weight="bold" />
                <p>
                  Changing payout details triggers a new verification check. Withdrawals
                  are paused until your bank account is re-approved.
                </p>
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-bank">Bank</label>
                <select
                  id="settings-bank"
                  className={`adash-input adash-select${errors.bankName ? " adash-input--error" : ""}`}
                  value={payoutForm.bankName}
                  onChange={(e) =>
                    setPayoutForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                >
                  <option value="" disabled>Select bank...</option>
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors.bankName && <p className="adash-field-error">{errors.bankName}</p>}
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-accountNumber">Account Number</label>
                <input
                  id="settings-accountNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className={`adash-input${errors.accountNumber ? " adash-input--error" : ""}`}
                  placeholder="10-digit NUBAN"
                  value={payoutForm.accountNumber}
                  onChange={(e) =>
                    setPayoutForm((prev) => ({
                      ...prev,
                      accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                />
                {errors.accountNumber && (
                  <p className="adash-field-error">{errors.accountNumber}</p>
                )}
              </div>

              <div className="adash-field">
                <label className="adash-label" htmlFor="settings-accountName">Account Name</label>
                <input
                  id="settings-accountName"
                  className={`adash-input${errors.accountName ? " adash-input--error" : ""}`}
                  value={payoutForm.accountName}
                  onChange={(e) =>
                    setPayoutForm((prev) => ({ ...prev, accountName: e.target.value }))
                  }
                />
                <p className="adash-settings-hint">
                  Must match the name on your NIN or BVN records.
                </p>
                {errors.accountName && <p className="adash-field-error">{errors.accountName}</p>}
              </div>

              <button
                type="button"
                className="adash-btn adash-btn--primary"
                onClick={handleSavePayout}
                disabled={saving}
              >
                <UploadSimple size={16} weight="bold" />
                Update payout account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
