export type ClientEmptyIllustrationVariant =
  | "projects-active"
  | "projects-pending"
  | "projects-history"
  | "build-team"
  | "updates"
  | "proposals"
  | "documents"
  | "reviews"
  | "pending-actions"
  | "vault-activity"
  | "artisans";

type Props = {
  variant: ClientEmptyIllustrationVariant;
  className?: string;
};

export default function ClientPanelEmptyIllustration({
  variant,
  className = "",
}: Props) {
  return (
    <svg
      className={`cp-empty-illustration${className ? ` ${className}` : ""}`}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="200" height="160" rx="20" fill="#EEF8F1" />
      {variant === "projects-active" && (
        <>
          <path d="M48 108V72L88 48L128 72V108H48Z" fill="#006B32" opacity="0.15" />
          <path d="M48 108H128V92H48V108Z" fill="#006B32" />
          <rect x="72" y="80" width="16" height="28" rx="2" fill="#fff" />
          <rect x="96" y="76" width="14" height="14" rx="2" fill="#fff" opacity="0.9" />
          <circle cx="148" cy="52" r="18" fill="#0D9488" opacity="0.2" />
          <path
            d="M140 52L146 58L156 46"
            stroke="#0D9488"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {variant === "projects-pending" && (
        <>
          <rect x="52" y="44" width="96" height="72" rx="12" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <circle cx="100" cy="68" r="14" fill="#F4A300" opacity="0.2" />
          <path d="M100 60V68L106 74" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          <rect x="68" y="92" width="64" height="8" rx="4" fill="#D3EADB" />
          <rect x="68" y="104" width="44" height="6" rx="3" fill="#EEF8F1" />
        </>
      )}
      {variant === "projects-history" && (
        <>
          <circle cx="100" cy="80" r="34" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <path
            d="M100 58V80L116 92"
            stroke="#006B32"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M72 118C82 108 118 108 128 118"
            stroke="#0D9488"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </>
      )}
      {variant === "build-team" && (
        <>
          <circle cx="72" cy="72" r="18" fill="#006B32" opacity="0.15" />
          <circle cx="128" cy="72" r="18" fill="#0D9488" opacity="0.15" />
          <circle cx="100" cy="96" r="20" fill="#003D1C" opacity="0.12" />
          <circle cx="72" cy="72" r="8" fill="#006B32" />
          <circle cx="128" cy="72" r="8" fill="#0D9488" />
          <circle cx="100" cy="96" r="9" fill="#003D1C" />
          <path
            d="M80 72H88M112 72H120M90 90L100 84L110 90"
            stroke="#5B6B60"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
        </>
      )}
      {variant === "updates" && (
        <>
          <rect x="56" y="48" width="88" height="64" rx="10" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <circle cx="72" cy="68" r="6" fill="#0D9488" />
          <rect x="84" y="64" width="48" height="6" rx="3" fill="#D3EADB" />
          <rect x="84" y="76" width="36" height="5" rx="2.5" fill="#EEF8F1" />
          <circle cx="72" cy="92" r="6" fill="#006B32" />
          <rect x="84" y="88" width="40" height="6" rx="3" fill="#D3EADB" />
        </>
      )}
      {variant === "proposals" && (
        <>
          <rect x="44" y="56" width="44" height="56" rx="8" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <rect x="78" y="48" width="44" height="56" rx="8" fill="#fff" stroke="#006B32" strokeWidth="2" />
          <rect x="112" y="56" width="44" height="56" rx="8" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <rect x="86" y="64" width="24" height="4" rx="2" fill="#006B32" opacity="0.35" />
          <rect x="86" y="74" width="18" height="4" rx="2" fill="#D3EADB" />
          <path d="M92 98L98 104L110 88" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {variant === "documents" && (
        <>
          <path
            d="M76 44H116L132 60V116C132 120 128 124 124 124H76C72 124 68 120 68 116V52C68 48 72 44 76 44Z"
            fill="#fff"
            stroke="#D3EADB"
            strokeWidth="2"
          />
          <path d="M116 44V60H132" stroke="#D3EADB" strokeWidth="2" />
          <rect x="80" y="76" width="40" height="5" rx="2.5" fill="#D3EADB" />
          <rect x="80" y="88" width="32" height="5" rx="2.5" fill="#EEF8F1" />
          <rect x="80" y="100" width="36" height="5" rx="2.5" fill="#EEF8F1" />
        </>
      )}
      {variant === "reviews" && (
        <>
          <path
            d="M68 72L76 56L84 72L100 74L88 86L92 102L76 94L60 102L64 86L52 74L68 72Z"
            fill="#F4A300"
            opacity="0.25"
          />
          <path
            d="M72 76L78 64L84 76L96 78L86 86L88 98L78 92L68 98L70 86L60 78L72 76Z"
            fill="#F4A300"
          />
        </>
      )}
      {variant === "pending-actions" && (
        <>
          <rect x="60" y="52" width="80" height="56" rx="12" fill="#fff" stroke="#D3EADB" strokeWidth="2" />
          <circle cx="100" cy="72" r="10" fill="#006B32" opacity="0.15" />
          <path d="M100 66V72H106" stroke="#006B32" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="76" y="88" width="48" height="6" rx="3" fill="#D3EADB" />
        </>
      )}
      {variant === "vault-activity" && (
        <>
          <rect x="70" y="48" width="60" height="64" rx="14" fill="#003D1C" />
          <circle cx="100" cy="72" r="14" fill="#F4A300" opacity="0.85" />
          <circle cx="100" cy="72" r="5" fill="#003D1C" />
          <rect x="82" y="96" width="36" height="6" rx="3" fill="#006B32" />
        </>
      )}
      {variant === "artisans" && (
        <>
          <circle cx="76" cy="72" r="16" fill="#006B32" opacity="0.15" />
          <circle cx="124" cy="72" r="16" fill="#0D9488" opacity="0.15" />
          <circle cx="100" cy="96" r="18" fill="#F4A300" opacity="0.2" />
          <path
            d="M68 108H132"
            stroke="#D3EADB"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="88" y="56" width="24" height="8" rx="4" fill="#006B32" opacity="0.35" />
        </>
      )}
    </svg>
  );
}
