"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/observability/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, {
      route: "global-error",
      digest: error.digest,
      stage: "global_boundary",
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10">
          <div className="w-full rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
            <h1 className="m-0 text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mb-4 mt-2 text-sm text-slate-600">
              We could not complete this request. Please try again.
            </p>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
