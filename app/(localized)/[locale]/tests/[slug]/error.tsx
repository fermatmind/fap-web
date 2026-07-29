"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

export default function TestLandingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/zh/") ? "zh" : "en";
  const copy = locale === "zh"
    ? {
        title: "服务暂时不可用",
        body: "暂时无法加载此页面，请稍后重试。",
        retry: "重试",
        back: "返回测试中心",
      }
    : {
        title: "Service temporarily unavailable",
        body: "This page could not be loaded. Please try again shortly.",
        retry: "Retry",
        back: "Back to tests",
      };

  return (
    <main
      className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-[var(--fm-container-gutter)] py-16"
      data-testid="test-landing-error-shell"
    >
      <section
        className="w-full rounded-2xl border border-[var(--fm-border)] bg-white p-8 shadow-[var(--fm-shadow-md)]"
        role="alert"
      >
        <h1 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {copy.title}
        </h1>
        <p className="mt-3 text-[var(--fm-text-muted)]">{copy.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonVariants({})}
            onClick={() => reset()}
          >
            {copy.retry}
          </button>
          <Link
            href={`/${locale}/tests`}
            className={buttonVariants({ variant: "outline" })}
          >
            {copy.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
