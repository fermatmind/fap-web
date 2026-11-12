import type { Metadata } from "next";
import { MbtiPricingPageContent, mbtiPricingCopy } from "@/components/commerce/MbtiPricing";

const copy = mbtiPricingCopy("zh-TW");
export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/zh-TW/pricing" },
};

export default function TraditionalPricingPage() {
  return <MbtiPricingPageContent locale="zh-TW" />;
}
