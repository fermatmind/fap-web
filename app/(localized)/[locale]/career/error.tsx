"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function CareerError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="career" />;
}
