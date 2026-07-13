"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

export default function TestsError(props: Omit<PublicContentErrorProps, "surface">) {
  return <PublicContentError {...props} surface="tests" />;
}
