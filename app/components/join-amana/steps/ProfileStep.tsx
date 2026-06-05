import { MIN_ARTISAN_AGE, PASSWORD_MIN_LENGTH } from "../constants";
import {
  getConfirmPasswordError,
  getDateOfBirthError,
  getMaxDateOfBirth,
  getMinDateOfBirth,
  getPasswordError,
} from "../validation";
import type { ProfileStepData } from "../types";

type ProfileStepProps = {
  data: ProfileStepData;
  onChange: (field: keyof ProfileStepData, value: string) => void;
  touched: {
    dateOfBirth: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
  onBlur: (field: keyof ProfileStepProps["touched"]) => void;
};

export default function ProfileStep({
  data,
  onChange,
  touched,
  onBlur,
}: ProfileStepProps) {
  const dateOfBirthError = getDateOfBirthError(data.dateOfBirth);
  const passwordError = getPasswordError(data.password);
  const confirmPasswordError = getConfirmPasswordError(
    data.password,
    data.confirmPassword,
  );
  const showDateOfBirthError = touched.dateOfBirth && dateOfBirthError;
  const showPasswordError = touched.password && passwordError;
  const showConfirmPasswordError = touched.confirmPassword && confirmPasswordError;

  return (
    <>
      <div className="join-field">
        <label className="join-label" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          className="join-input"
          placeholder="e.g. Musa Ibrahim"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          required
        />
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="dateOfBirth">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className={`join-input join-input--date${showDateOfBirthError ? " join-input--error" : ""}`}
          value={data.dateOfBirth}
          min={getMinDateOfBirth()}
          max={getMaxDateOfBirth()}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          onBlur={() => onBlur("dateOfBirth")}
          required
        />
        {showDateOfBirthError ? (
          <p className="join-field-error" role="alert">
            {dateOfBirthError}
          </p>
        ) : (
          <p className="join-field-hint">
            You must be at least {MIN_ARTISAN_AGE} years old
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          className="join-input"
          placeholder="e.g. 0803 000 0000"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          required
        />
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="email">
          Email <span className="join-optional">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          className="join-input"
          placeholder="e.g. musa@email.com"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={`join-input${showPasswordError ? " join-input--error" : ""}`}
          placeholder="At least 8 characters"
          value={data.password}
          minLength={PASSWORD_MIN_LENGTH}
          onChange={(e) => onChange("password", e.target.value)}
          onBlur={() => onBlur("password")}
          required
          autoComplete="new-password"
        />
        {showPasswordError ? (
          <p className="join-field-error" role="alert">
            {passwordError}
          </p>
        ) : (
          <p className="join-field-hint">
            Use at least {PASSWORD_MIN_LENGTH} characters
          </p>
        )}
      </div>

      <div className="join-field">
        <label className="join-label" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={`join-input${showConfirmPasswordError ? " join-input--error" : ""}`}
          placeholder="Re-enter your password"
          value={data.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          onBlur={() => onBlur("confirmPassword")}
          required
          autoComplete="new-password"
        />
        {showConfirmPasswordError && (
          <p className="join-field-error" role="alert">
            {confirmPasswordError}
          </p>
        )}
        {!showConfirmPasswordError &&
          data.confirmPassword &&
          data.password === data.confirmPassword && (
            <p className="join-field-success">Passwords match</p>
          )}
      </div>
    </>
  );
}
