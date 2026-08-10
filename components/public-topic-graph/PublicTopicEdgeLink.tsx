"use client";

import type { ReactNode } from "react";
import type { PublicTopicEdgeClickPayload } from "@/lib/tracking/publicTopicEdge";
import { trackPublicTopicEdgeClick } from "@/lib/tracking/publicTopicEdge";

export function PublicTopicEdgeLink({
  href,
  payload,
  children,
}: {
  href: string;
  payload: PublicTopicEdgeClickPayload;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="font-medium text-[var(--fm-accent)] underline-offset-4 hover:underline"
      data-public-topic-edge-id={payload.edge_id}
      onClick={() => trackPublicTopicEdgeClick(payload)}
    >
      {children}
    </a>
  );
}
