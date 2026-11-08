import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "我的帳戶", template: "%s | 費馬測試" },
  robots: { index: false, follow: false },
  referrer: "strict-origin-when-cross-origin",
};
export default function TraditionalAccountLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-TW"><body className="min-h-screen antialiased">{children}</body></html>;
}
