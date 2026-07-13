"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function SupportError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="support" />;
}
