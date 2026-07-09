import { cn } from "@/lib/utils";

/**
 * Placeholder ABR monogram in a vibrant gradient badge, echoing the
 * Abrasileirar logo. Swap for the official logo PNG/SVG when available
 * (see referencias/marca.md).
 */
export function BrandLogo({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="abr-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B51E0" />
          <stop offset="35%" stopColor="#0693E3" />
          <stop offset="70%" stopColor="#00D084" />
          <stop offset="100%" stopColor="#FCB900" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#abr-grad)" />
      <text
        x="50%"
        y="53%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.5"
        fill="#ffffff"
        fontFamily="var(--font-sans, sans-serif)"
      >
        ABR
      </text>
    </svg>
  );
}
