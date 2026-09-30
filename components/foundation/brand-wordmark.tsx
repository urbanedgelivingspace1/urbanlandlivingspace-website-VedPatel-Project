import Image from "next/image";

export function BrandWordmark({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <span className={compact ? "brand-logo brand-logo-compact" : "brand-logo"}>
      <Image
        alt="UrbanEdge Land Space"
        height={1254}
        preload={compact}
        sizes={compact ? "64px" : "144px"}
        src="/brand/urbanedge-land-space-logo.png"
        width={1254}
      />
    </span>
  );
}
