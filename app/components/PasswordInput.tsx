"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeSlash } from "phosphor-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput({
  className = "",
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={className}
      />
      <button
        type="button"
        className="password-input-toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeSlash size={18} weight="bold" />
        ) : (
          <Eye size={18} weight="bold" />
        )}
      </button>
    </div>
  );
}
