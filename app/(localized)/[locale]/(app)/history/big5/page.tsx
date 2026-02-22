import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import Big5HistoryClient from "./Big5HistoryClient";

export const metadata: Metadata = {
  title: "BIG5 History",
  robots: NOINDEX_ROBOTS,
};

export default function Big5HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Big5HistoryClient />
    </main>
  );
}
