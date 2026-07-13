"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function TopicsError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="topics" />;
}
