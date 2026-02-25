import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

export function Container<T extends ElementType = "div">({
  as,
  className,
  children,
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className={cn("mx-auto w-full max-w-6xl px-[var(--fm-container-gutter)]", className)}>
      {children}
    </Component>
  );
}
