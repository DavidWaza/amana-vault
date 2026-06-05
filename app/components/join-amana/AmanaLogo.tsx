export type AmanaLogoVariant = "green" | "white";

type AmanaLogoProps = {
  size?: number;
  variant?: AmanaLogoVariant;
  /** @deprecated Use variant="white" instead */
  light?: boolean;
};

const LOGO_SRC: Record<AmanaLogoVariant, string> = {
  green: "/logo-main.png",
  white: "/logo-white.PNG",
};

export default function AmanaLogo({
  size = 48,
  variant,
  light,
}: AmanaLogoProps) {
  const resolvedVariant: AmanaLogoVariant =
    variant ?? (light ? "white" : "green");

  return (
    <img
      src={LOGO_SRC[resolvedVariant]}
      alt="Amana"
      width={size}
      height="auto"
      style={{ display: "block" }}
    />
  );
}
