import type { Metadata } from "next";
import { Suspense } from "react";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import Big5CompareClient from "./Big5CompareClient";

export const metadata: Metadata = {
  title: "BIG5 Compare",
  robots: NOINDEX_ROBOTS,
};

export default function Big5ComparePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Suspense fallback={<p className="text-sm text-slate-600">Loading compare data...</p>}>
        <Big5CompareClient />
      </Suspense>
    </main>
  );
}
