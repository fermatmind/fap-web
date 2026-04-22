import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import RiasecHistoryClient from "./RiasecHistoryClient";

export const metadata: Metadata = {
  title: "RIASEC History",
  robots: NOINDEX_ROBOTS,
};

export default function RiasecHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <RiasecHistoryClient />
    </main>
  );
}
