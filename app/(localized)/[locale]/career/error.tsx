"use client";

import { PublicContentError, type PublicContentErrorProps } from "@/components/states/PublicContentError";

function reloadCareerRoute() {
  window.location.reload();
}

export default function CareerError(props: Omit<PublicContentErrorProps, "retryAction" | "surface">) {
  return <PublicContentError {...props} surface="career" retryAction={reloadCareerRoute} />;
}
