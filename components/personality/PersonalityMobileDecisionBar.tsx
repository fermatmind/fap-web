"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { buttonVariants } from "@/components/ui/button";

export function PersonalityMobileDecisionBar({
  locale,
  primaryHref,
  primaryTrackingProps,
  quickLocateHref,
}: {
  locale: "en" | "zh";
  primaryHref: string;
  primaryTrackingProps: Record<string, unknown>;
  quickLocateHref: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-4 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0px)] md:hidden"
      data-testid="personality-mobile-decision-bar"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-sticky-bg)] p-3 shadow-[var(--fm-shadow-md)] backdrop-blur">
        <TrackedEntryCtaLink
          href={primaryHref}
          eventProperties={primaryTrackingProps}
          className={`${buttonVariants({ size: "sm" })} flex-1 justify-center`}
        >
          {locale === "zh" ? "开始测试" : "Start test"}
        </TrackedEntryCtaLink>
        <Link
          href={quickLocateHref}
          className={`${buttonVariants({ variant: "outline", size: "sm" })} shrink-0`}
        >
          {locale === "zh" ? "快速定位" : "Quick locate"}
        </Link>
      </div>
    </div>
  );
}
