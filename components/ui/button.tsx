import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-transparent bg-[var(--fm-cta-orange)] text-white hover:bg-[var(--fm-cta-orange-strong)]",
  secondary:
    "border border-transparent bg-[var(--fm-trust-blue)] text-white hover:bg-[var(--fm-trust-blue-strong)]",
  outline:
    "border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-trust-blue)] hover:border-[var(--fm-trust-blue)] hover:bg-[var(--fm-surface-muted)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--fm-text-muted)] hover:bg-[var(--fm-surface-muted)] hover:text-[var(--fm-text)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default:
    "h-12 min-h-[48px] px-[var(--fm-pad-btn-md-x)] py-[var(--fm-pad-btn-md-y)] text-sm",
  sm:
    "h-11 min-h-[var(--fm-touch-target-min)] px-[var(--fm-pad-btn-sm-x)] py-[var(--fm-pad-btn-sm-y)] text-xs",
  lg:
    "h-[52px] min-h-[52px] px-[var(--fm-pad-btn-lg-x)] py-[var(--fm-pad-btn-lg-y)] text-base",
  icon: "h-12 w-12 min-h-[48px] min-w-[48px]",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-[var(--fm-shadow-sm)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
