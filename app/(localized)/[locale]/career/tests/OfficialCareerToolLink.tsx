"use client";

import type { ReactNode } from "react";
import { trackCareerOfficialResourceClick } from "@/lib/career/toolTracking";

type OfficialCareerToolLinkProps = {
  href: string;
  resourceKey: Parameters<typeof trackCareerOfficialResourceClick>[1];
  className?: string;
  children: ReactNode;
};

export function OfficialCareerToolLink({ href, resourceKey, className, children }: OfficialCareerToolLinkProps) {
  return (
    <a href={href} className={className} onClick={() => trackCareerOfficialResourceClick("en", resourceKey)}>
      {children}
    </a>
  );
}
