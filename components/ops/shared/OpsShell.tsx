import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { OpsSidebar } from "@/components/ops/shared/OpsSidebar";

export function OpsShell({
  locale,
  activeHref,
  children,
}: {
  locale: Locale;
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col border-x border-slate-200 bg-slate-100 lg:flex-row">
        <OpsSidebar locale={locale} activeHref={activeHref} />
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}
