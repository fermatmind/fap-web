import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  title: "EQ Emotional Intelligence History",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EqHistoryPage() {
  return (
    <main data-testid="eq-history-page" className="mx-auto w-full max-w-5xl px-4 py-8">
      <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          EQ History
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your EQ self-report results are private and not search-indexed.
          Re-enter a previous result from your saved reports.
        </p>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
          Private &middot; No Index &middot; No Store
        </p>
      </section>
    </main>
  );
}
