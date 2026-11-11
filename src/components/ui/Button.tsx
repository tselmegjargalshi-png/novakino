import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 ease-nova disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-violet text-white hover:bg-[#8b61ff] shadow-[0_8px_30px_-10px_rgb(124_77_255/0.8)]",
  secondary: "bg-white/10 text-ink backdrop-blur hover:bg-white/[0.16] border border-white/10",
  ghost: "text-muted hover:text-ink hover:bg-white/5",
};
const sizes: Record<Size, string> = { md: "h-10 px-5 text-sm", lg: "h-12 px-7 text-[15px]" };

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  clsx(base, variants[variant], sizes[size], className);

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
