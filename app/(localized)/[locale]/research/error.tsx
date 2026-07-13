"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function ResearchError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="research" />;
}
