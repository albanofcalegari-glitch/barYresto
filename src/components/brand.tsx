import { clsx } from "clsx";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export function BrandIcon({ size = 32, className }: BrandIconProps) {
  const id = `bg-${size}`;
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
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c5cfc" />
          <stop offset="50%" stopColor="#9171fc" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id})`} />
      {/* Stylized B — vertical stroke is a fork tine, counters are plates */}
      <g fill="white">
        {/* B main body */}
        <path d="M13 9h7c2.8 0 5 1.6 5 4.3 0 1.8-1.1 3.1-2.7 3.7v.1c2 .6 3.4 2.2 3.4 4.4 0 3-2.4 4.8-5.5 4.8H13V9zm3.5 6.8h3.2c1.4 0 2.2-.8 2.2-1.8 0-1.1-.8-1.8-2.2-1.8h-3.2v3.6zm0 7.4h3.6c1.6 0 2.5-.9 2.5-2.1s-.9-2.1-2.5-2.1h-3.6v4.2z" />
        {/* Fork — 3 tines above the B */}
        <rect x="14.5" y="5" width="1.2" height="3.5" rx="0.6" opacity="0.9" />
        <rect x="17.5" y="4" width="1.2" height="4.5" rx="0.6" opacity="0.9" />
        <rect x="20.5" y="5" width="1.2" height="3.5" rx="0.6" opacity="0.9" />
        {/* Wine glass — elegant stem + bowl on the right */}
        <path
          d="M29 11.5c0-2.2-1-4-2.2-4.5h4.4c-1.2.5-2.2 2.3-2.2 4.5 0 1.8.7 3.3 1.6 4h-3.2c.9-.7 1.6-2.2 1.6-4z"
          opacity="0.85"
        />
        <rect x="28.4" y="15.5" width="1.2" height="3" rx="0.6" opacity="0.85" />
        <rect x="26.5" y="18" width="5" height="1.2" rx="0.6" opacity="0.85" />
      </g>
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
