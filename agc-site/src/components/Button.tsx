import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  href?: string;
  /** When using `asChild` with `href`, forwarded to Next.js `Link` (e.g. `_blank` for badge download). */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 shadow-sm",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-border bg-transparent text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  asChild,
  href,
  target,
  rel,
  children,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-none font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const combined = cn(base, variants[variant], sizes[size], className);

  if (asChild && href) {
    return (
      <Link
        href={href}
        className={combined}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={combined} {...props}>
      {children}
    </button>
  );
}
