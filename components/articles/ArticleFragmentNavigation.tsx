"use client";

import { useRef, type PropsWithChildren } from "react";
import { useFragmentNavigation } from "@/hooks/useFragmentNavigation";

/** Restore article fragments after the streamed body has actually mounted. */
export function ArticleFragmentNavigation({ children, className }: PropsWithChildren<{ className?: string }>) {
  const root = useRef<HTMLDivElement>(null);
  useFragmentNavigation(root);
  return <div ref={root} className={className}>{children}</div>;
}
