import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import EnneagramHistoryClient from "./EnneagramHistoryClient";

export const metadata: Metadata = {
  title: "Enneagram History",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EnneagramHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <EnneagramHistoryClient />
    </main>
  );
}
