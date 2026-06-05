import AmanaLogo from "../join-amana/AmanaLogo";

type VaultIconProps = {
  size?: number;
  light?: boolean;
  className?: string;
};

export default function VaultIcon({
  size = 28,
  light = false,
  className = "",
}: VaultIconProps) {
  return (
    <span
      className={`adash-vault-icon${light ? " adash-vault-icon--light" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      <AmanaLogo size={size} light={light} />
    </span>
  );
}
