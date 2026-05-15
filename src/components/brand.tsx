import { clsx } from "clsx";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export function BrandIcon({ size = 32, className }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#brand-grad)" />
      {/* B letter with wine glass negative space in upper counter */}
      <path
        d="M12 8h8.5c3.5 0 6 1.8 6 5 0 2-1 3.5-2.8 4.2 2.2.7 3.8 2.5 3.8 5.3 0 3.5-2.8 5.5-6.5 5.5H12V8zm4.5 7.5h3.8c1.5 0 2.2-.9 2.2-2s-.7-2-2.2-2h-3.8v4zm0 9h4.3c1.7 0 2.7-1 2.7-2.2 0-1.3-1-2.3-2.7-2.3h-4.3v4.5z"
        fill="white"
      />
      {/* Small wine glass accent on top-right */}
      <path
        d="M28 6l1.5 4h-3L28 6zm0 4v2"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  const textClass = clsx(
    "font-heading font-semibold tracking-tight",
    size === "sm" && "text-base",
    size === "md" && "text-lg",
    size === "lg" && "text-2xl",
  );

  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <BrandIcon size={iconSize} />
      <span className={textClass}>
        bary<span className="text-brand-400">resto</span>
      </span>
    </span>
  );
}
