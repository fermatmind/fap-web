"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function PersonalityError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="personality" />;
}
