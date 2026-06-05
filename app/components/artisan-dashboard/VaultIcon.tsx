import AmanaLogo from "../join-amana/AmanaLogo";

type VaultIconProps = {
  size?: number;
  variant?: "green" | "white";
  className?: string;
};

export default function VaultIcon({
  size = 28,
  variant = "green",
  className = "",
}: VaultIconProps) {
  return (
    <span
      className={`adash-vault-icon${variant === "white" ? " adash-vault-icon--light" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      <AmanaLogo size={size} variant={variant} />
    </span>
  );
}
