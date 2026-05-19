export function BrandLogo({
  className = "w-10 h-10",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src="/logo.svg"
      className={className}
      alt="ScelgoSicuro"
      style={invert ? { filter: "invert(1)" } : undefined}
    />
  );
}
