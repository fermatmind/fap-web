import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-transparent bg-[var(--fm-accent)] text-white hover:bg-[var(--fm-accent-strong)]",
  secondary:
    "border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] text-[var(--fm-text)] hover:border-[var(--fm-border-strong)]",
  outline:
    "border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-text)] hover:border-[var(--fm-border-strong)] hover:bg-[var(--fm-surface-muted)]",
  ghost: "border border-transparent bg-transparent text-[var(--fm-text-muted)] hover:bg-[var(--fm-surface-muted)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 min-h-[44px] px-4 py-2 text-sm",
  sm: "h-10 min-h-[40px] px-3 text-xs",
  lg: "h-12 min-h-[48px] px-6 text-sm",
  icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-[var(--fm-shadow-sm)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] disabled:pointer-events-none disabled:opacity-50",
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
