import { Bank, Info } from "phosphor-react";
import { BANK_OPTIONS } from "../constants";
import {
  formatAccountNumber,
  getAccountNameError,
  getAccountNumberError,
  getBankNameError,
} from "../validation";
import type { BankStepData } from "../types";

type BankStepProps = {
  data: BankStepData;
  touched: {
    bankName: boolean;
    accountNumber: boolean;
    accountName: boolean;
  };
  onChange: (field: keyof BankStepData, value: string) => void;
  onBlur: (field: keyof BankStepProps["touched"]) => void;
};

export default function BankStep({
  data,
  touched,
  onChange,
  onBlur,
}: BankStepProps) {
  const bankNameError = getBankNameError(data.bankName);
  const accountNumberError = getAccountNumberError(data.accountNumber);
  const accountNameError = getAccountNameError(data.accountName);

  const showBankNameError = touched.bankName && bankNameError;
  const showAccountNumberError = touched.accountNumber && accountNumberError;
  const showAccountNameError = touched.accountName && accountNameError;

  return (
    <>
      <div className="join-verify-banner">
        <Bank size={20} weight="bold" />
        <p>
          Add the bank account where you want to receive payments. This must
          match the name on your government ID.
        </p>
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="bankName">
          Bank
        </label>
        <select
          id="bankName"
          className={`join-input join-select${showBankNameError ? " join-input--error" : ""}`}
          value={data.bankName}
          onChange={(e) => onChange("bankName", e.target.value)}
          onBlur={() => onBlur("bankName")}
          required
        >
          <option value="" disabled>
            Select your bank...
          </option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        {showBankNameError && (
          <p className="join-field-error" role="alert">
            {bankNameError}
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="accountNumber">
          Account Number
        </label>
        <input
          id="accountNumber"
          type="text"
          inputMode="numeric"
          className={`join-input${showAccountNumberError ? " join-input--error" : ""}`}
          placeholder="10-digit account number"
          value={data.accountNumber}
          onChange={(e) => onChange("accountNumber", formatAccountNumber(e.target.value))}
          onBlur={() => onBlur("accountNumber")}
          maxLength={10}
          required
        />
        {showAccountNumberError && (
          <p className="join-field-error" role="alert">
            {accountNumberError}
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="accountName">
          Account Name
        </label>
        <input
          id="accountName"
          type="text"
          className={`join-input${showAccountNameError ? " join-input--error" : ""}`}
          placeholder="Name as it appears on your bank account"
          value={data.accountName}
          onChange={(e) => onChange("accountName", e.target.value)}
          onBlur={() => onBlur("accountName")}
          required
        />
        {showAccountNameError ? (
          <p className="join-field-error" role="alert">
            {accountNameError}
          </p>
        ) : (
          <p className="join-field-hint">
            Must match the name on your government ID
          </p>
        )}
      </div>

      <div className="join-verification-disclaimer">
        <div className="join-verification-disclaimer-header">
          <Info size={18} weight="bold" />
          <strong>Payout account</strong>
        </div>
        <p>
          Job payments are sent to this account after a client approves your
          work. You can update it later from your artisan dashboard.
        </p>
      </div>
    </>
  );
}
