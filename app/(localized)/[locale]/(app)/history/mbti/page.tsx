import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import MbtiHistoryClient from "./MbtiHistoryClient";

export const metadata: Metadata = {
  title: "MBTI History",
  robots: NOINDEX_ROBOTS,
};

export default function MbtiHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <MbtiHistoryClient />
    </main>
  );
}
