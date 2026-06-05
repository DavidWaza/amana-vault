type AmanaLogoProps = {
  size?: number;
  light?: boolean;
};

export default function AmanaLogo({ size = 48, light = false }: AmanaLogoProps) {
  const scale = size / 48;
  const borderColor = light ? "#fff" : "var(--green2)";

  return (
    <div
      className="logo"
      style={{
        width: size,
        height: size,
        borderWidth: 4 * scale,
        borderColor,
        background: light ? "rgba(255,255,255,0.12)" : "white",
      }}
    >
      <div
        className="logo-mark"
        style={{
          width: 24 * scale,
          height: 24 * scale,
          borderWidth: 4 * scale,
          borderColor,
        }}
      >
        <div
          className="logo-cross logo-cross-first"
          style={light ? { background: "#fff" } : undefined}
        />
        <div
          className="logo-cross logo-cross-second"
          style={light ? { background: "#fff" } : undefined}
        />
        <div
          className="logo-dot"
          style={{
            width: 6 * scale,
            height: 6 * scale,
            background: light ? "#fff" : undefined,
          }}
        />
      </div>
    </div>
  );
}
