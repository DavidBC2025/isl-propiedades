import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

type ButtonISLProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-isl-black text-isl-white hover:bg-isl-black/90",
  gold: "bg-isl-gold text-isl-black hover:bg-isl-champagne",
  outline: "border border-isl-black bg-transparent text-isl-black hover:bg-isl-black hover:text-isl-white",
  ghost: "bg-transparent text-isl-black hover:bg-isl-offwhite",
  inverse: "bg-isl-white text-isl-black hover:bg-isl-champagne",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export function ButtonISL({
  variant = "primary",
  size = "md",
  href,
  type = "button",
  onClick,
  children,
  className,
  "aria-label": ariaLabel,
}: ButtonISLProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-sm font-sans font-medium uppercase tracking-[0.12em] transition duration-300 motion-safe:hover:-translate-y-0.5",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(" ");

  if (href) {
    return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>;
  }

  return <button type={type} className={classes} aria-label={ariaLabel} onClick={onClick}>{children}</button>;
}
