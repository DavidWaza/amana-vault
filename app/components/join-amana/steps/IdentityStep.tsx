"use client";

import { useRef } from "react";
import {
  CheckCircle,
  IdentificationCard,
  Camera,
  UploadSimple,
  Info,
} from "phosphor-react";
import { VERIFICATION_CHECKS } from "../constants";
import { getBvnError, getNinError, formatNumericId } from "../validation";
import type { IdentityFiles, IdentityStepData } from "../types";

type IdentityStepProps = {
  data: IdentityStepData;
  files: IdentityFiles;
  governmentIdPreview: string | null;
  selfiePreview: string | null;
  identityConsent: boolean;
  touched: {
    nin: boolean;
    bvn: boolean;
    governmentId: boolean;
    selfie: boolean;
  };
  onChange: (field: keyof IdentityStepData, value: string) => void;
  onBlur: (field: "nin" | "bvn") => void;
  onGovernmentIdChange: (file: File | null) => void;
  onSelfieChange: (file: File | null) => void;
  onConsentChange: (checked: boolean) => void;
};

export default function IdentityStep({
  data,
  files,
  governmentIdPreview,
  selfiePreview,
  identityConsent,
  touched,
  onChange,
  onBlur,
  onGovernmentIdChange,
  onSelfieChange,
  onConsentChange,
}: IdentityStepProps) {
  const governmentIdInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const ninError = getNinError(data.nin);
  const bvnError = getBvnError(data.bvn);
  const showNinError = touched.nin && ninError;
  const showBvnError = touched.bvn && bvnError;
  const showGovernmentIdError = touched.governmentId && !files.governmentId;
  const showSelfieError = touched.selfie && !files.selfie;

  return (
    <>
      <div className="join-field">
        <label className="join-label" htmlFor="nin">
          National Identification Number (NIN)
        </label>
        <input
          id="nin"
          type="text"
          inputMode="numeric"
          className={`join-input${showNinError ? " join-input--error" : ""}`}
          placeholder="11-digit NIN"
          value={data.nin}
          onChange={(e) => onChange("nin", formatNumericId(e.target.value))}
          onBlur={() => onBlur("nin")}
          maxLength={11}
          required
        />
        {showNinError && (
          <p className="join-field-error" role="alert">
            {ninError}
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="bvn">
          Bank Verification Number (BVN)
        </label>
        <input
          id="bvn"
          type="text"
          inputMode="numeric"
          className={`join-input${showBvnError ? " join-input--error" : ""}`}
          placeholder="11-digit BVN"
          value={data.bvn}
          onChange={(e) => onChange("bvn", formatNumericId(e.target.value))}
          onBlur={() => onBlur("bvn")}
          maxLength={11}
          required
        />
        {showBvnError && (
          <p className="join-field-error" role="alert">
            {bvnError}
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label">Government ID</label>
        <div
          className={`join-upload-zone${showGovernmentIdError ? " join-upload-zone--error" : ""}${governmentIdPreview ? " has-file" : ""}`}
        >
          <input
            ref={governmentIdInputRef}
            type="file"
            accept="image/*,.pdf"
            className="join-upload-input"
            onChange={(e) => onGovernmentIdChange(e.target.files?.[0] ?? null)}
          />
          {governmentIdPreview && files.governmentId?.type.startsWith("image/") ? (
            <img
              src={governmentIdPreview}
              alt="Government ID preview"
              className="join-upload-preview"
            />
          ) : (
            <div className="join-upload-placeholder">
              <IdentificationCard size={28} weight="bold" />
              <p>Upload NIN slip, passport, driver&apos;s licence, or voter&apos;s card</p>
              <span>JPG, PNG, or PDF · Max 10MB</span>
            </div>
          )}
          <button
            type="button"
            className="join-upload-btn"
            onClick={() => governmentIdInputRef.current?.click()}
          >
            <UploadSimple size={16} weight="bold" />
            {files.governmentId ? "Change ID" : "Upload ID"}
          </button>
        </div>
        {showGovernmentIdError && (
          <p className="join-field-error" role="alert">
            Please upload a valid government ID
          </p>
        )}
        {files.governmentId && !files.governmentId.type.startsWith("image/") && (
          <p className="join-field-hint">Uploaded: {files.governmentId.name}</p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label">Selfie Verification</label>
        <div
          className={`join-upload-zone join-upload-zone--selfie${showSelfieError ? " join-upload-zone--error" : ""}${selfiePreview ? " has-file" : ""}`}
        >
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="join-upload-input"
            onChange={(e) => onSelfieChange(e.target.files?.[0] ?? null)}
          />
          {selfiePreview ? (
            <img
              src={selfiePreview}
              alt="Selfie preview"
              className="join-upload-preview join-upload-preview--selfie"
            />
          ) : (
            <div className="join-upload-placeholder">
              <Camera size={28} weight="bold" />
              <p>Take a clear selfie in good lighting</p>
              <span>Face the camera directly · No hats or sunglasses</span>
            </div>
          )}
          <button
            type="button"
            className="join-upload-btn"
            onClick={() => selfieInputRef.current?.click()}
          >
            <Camera size={16} weight="bold" />
            {files.selfie ? "Retake Selfie" : "Take Selfie"}
          </button>
        </div>
        {showSelfieError && (
          <p className="join-field-error" role="alert">
            Please take a selfie to continue
          </p>
        )}
      </div>

      <div className="join-verification-disclaimer">
        <div className="join-verification-disclaimer-header">
          <Info size={18} weight="bold" />
          <strong>What we will verify</strong>
        </div>
        <ul className="join-verification-checklist">
          {VERIFICATION_CHECKS.map((item) => (
            <li key={item}>
              <CheckCircle size={16} weight="fill" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          Your documents are encrypted and reviewed only for identity
          verification. Amana does not store raw BVN or NIN beyond what is
          required by our licensed verification partners.
        </p>
      </div>

      <label className="join-consent">
        <input
          type="checkbox"
          checked={identityConsent}
          onChange={(e) => onConsentChange(e.target.checked)}
        />
        <span>
          I consent to Amana verifying my identity using the details and
          documents provided above.
        </span>
      </label>
    </>
  );
}
