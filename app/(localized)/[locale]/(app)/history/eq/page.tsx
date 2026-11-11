import EqHistoryContent from "./EqHistoryContent";
import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  title: "EQ Emotional Intelligence History",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EqHistoryPage() {
  return <EqHistoryContent />;
}
