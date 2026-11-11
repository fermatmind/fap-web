import Big5CompareContent from "./Big5CompareContent";
import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  title: "BIG5 Compare",
  robots: NOINDEX_ROBOTS,
};

export default function Big5ComparePage() {
  return <Big5CompareContent />;
}
