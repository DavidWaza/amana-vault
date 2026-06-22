"use client";

import { useEffect, useState } from "react";
import { X, Buildings, IdentificationCard, Bank, CheckCircle } from "phosphor-react";
import { useContractorProfile } from "./ContractorProfileProvider";
import { BANK_OPTIONS } from "../join-amana/constants";
import {
  ctBtn,
  ctBtnGhost,
  ctBtnPrimary,
  ctField,
  ctInput,
  ctLabel,
  ctModal,
  ctModalActions,
  ctModalClose,
  ctModalHeader,
  ctModalOverlay,
} from "./ui";

type Tab = "company" | "account" | "payout";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "company", label: "Company", icon: <Buildings size={16} weight="bold" /> },
  { id: "account", label: "Account", icon: <IdentificationCard size={16} weight="bold" /> },
  { id: "payout", label: "Payout", icon: <Bank size={16} weight="bold" /> },
];

type ContractorSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: (message: string) => void;
};

export default function ContractorSettingsModal({ open, onClose, onSaved }: ContractorSettingsModalProps) {
  const { profile, setProfile } = useContractorProfile();
  const [tab, setTab] = useState<Tab>("company");
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [contactName, setContactName] = useState(profile.contactName);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    if (open) {
      setTab("company");
      setCompanyName(profile.companyName);
      setContactName(profile.contactName);
      setBio(profile.bio);
      setLocation(profile.location);
      setPhone(profile.phone);
      setEmail(profile.email);
      setBankName("");
      setAccountNumber("");
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const saveCompany = () => {
    setProfile((p) => ({ ...p, companyName, contactName, bio, location }));
    onSaved?.("Company profile updated.");
    onClose();
  };

  const saveAccount = () => {
    setProfile((p) => ({ ...p, phone, email }));
    onSaved?.("Account details updated.");
    onClose();
  };

  const savePayout = () => {
    // Changing the payout account re-triggers verification.
    setProfile((p) => ({ ...p, bankStatus: "pending" }));
    onSaved?.("Payout account submitted — verification re-triggered.");
    onClose();
  };

  return (
    <div className={ctModalOverlay} role="presentation" onClick={onClose}>
      <div className={ctModal} role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.stopPropagation()}>
        <div className={ctModalHeader}>
          <h3 id="settings-title" className="m-0 text-[1.2rem] font-black text-green">Settings</h3>
          <button type="button" className={ctModalClose} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.82rem] font-extrabold border border-solid transition-colors ${
                tab === t.id ? "bg-contractor text-white border-contractor" : "bg-white text-muted border-line"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "company" && (
          <div className="grid gap-3">
            <label className={ctField}>
              <span className={ctLabel}>Company Name</span>
              <input className={ctInput} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Primary Contact</span>
              <input className={ctInput} value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Operating Base</span>
              <input className={ctInput} value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Company Bio</span>
              <textarea className={`${ctInput} min-h-[6rem] resize-y`} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </label>
            <div className={ctModalActions}>
              <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>Cancel</button>
              <button type="button" className={`${ctBtn} ${ctBtnPrimary}`} onClick={saveCompany}>Save Changes</button>
            </div>
          </div>
        )}

        {tab === "account" && (
          <div className="grid gap-3">
            <label className={ctField}>
              <span className={ctLabel}>Phone</span>
              <input className={ctInput} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Email</span>
              <input className={ctInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <p className="m-0 text-[0.78rem] text-muted">
              RC Number: <strong className="text-green">{profile.rcNumber}</strong> · Member since{" "}
              {new Date(profile.memberSince).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
            </p>
            <div className={ctModalActions}>
              <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>Cancel</button>
              <button type="button" className={`${ctBtn} ${ctBtnPrimary}`} onClick={saveAccount}>Save Changes</button>
            </div>
          </div>
        )}

        {tab === "payout" && (
          <div className="grid gap-3">
            <p className="m-0 flex items-center gap-2 px-3 py-2.5 rounded-[12px] bg-contractor-soft border border-solid border-contractor-line text-[0.82rem] text-contractor">
              {profile.bankStatus === "verified" ? (
                <>
                  <CheckCircle size={16} weight="fill" className="text-green2" /> Payout account verified.
                </>
              ) : (
                <>Changing your payout account pauses releases until re-verified.</>
              )}
            </p>
            <label className={ctField}>
              <span className={ctLabel}>Bank</span>
              <select className={ctInput} value={bankName} onChange={(e) => setBankName(e.target.value)}>
                <option value="">Select bank...</option>
                {BANK_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className={ctField}>
              <span className={ctLabel}>Account Number</span>
              <input
                className={ctInput}
                inputMode="numeric"
                value={accountNumber}
                maxLength={10}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit NUBAN"
              />
            </label>
            <div className={ctModalActions}>
              <button type="button" className={`${ctBtn} ${ctBtnGhost}`} onClick={onClose}>Cancel</button>
              <button
                type="button"
                className={`${ctBtn} ${ctBtnPrimary}`}
                onClick={savePayout}
                disabled={!bankName || accountNumber.length !== 10}
              >
                Update Payout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
