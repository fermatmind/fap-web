import type { ReactNode } from "react";

type ClaimGuardProps = {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function ClaimGuard({ allowed, children, fallback = null }: ClaimGuardProps) {
  if (allowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
