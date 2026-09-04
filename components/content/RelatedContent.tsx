"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RelatedContentItem } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import {
  CONTINUE_EXPLORATION_ACTION_CATEGORIES,
  TRACKING_EVENTS,
} from "@/lib/tracking/events";
import { shouldSuppressAnalyticsForUrl } from "@/lib/tracking/privacy";

type RelatedContentProps = {
  title: string;
  items: RelatedContentItem[];
  appearance?: "default" | "career-guide";
};

function isPublicRelatedContentHref(href: string): boolean {
  return href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.includes("?") &&
    !shouldSuppressAnalyticsForUrl(href);
}

export function RelatedContent({ title, items, appearance = "default" }: RelatedContentProps) {
  if (items.length === 0) {
    return null;
  }

  if (appearance === "career-guide") {
    return (
      <section className="group flex min-h-[232px] flex-col rounded-[28px] border border-[#d8e3f3] bg-[#f0f6fd] p-7 transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-1 hover:bg-[#e9f2fb] hover:shadow-[0_18px_42px_rgba(38,42,68,0.08)] motion-reduce:transform-none">
        <div className="flex items-start justify-between gap-6">
          <h2 className="m-0 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.015em] text-[#171c2d]">
            {title}
          </h2>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dfeafa] text-[#315d96] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-2 motion-reduce:transform-none">
            <BookOpenText aria-hidden="true" className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.slug}`}
              href={item.href}
              className="group/link flex min-h-11 items-center justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold leading-6 text-[#263a60] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-2"
              onClick={() => {
                if (!isPublicRelatedContentHref(item.href)) return;
                trackEvent(TRACKING_EVENTS.CONTINUE_EXPLORATION, {
                  action_category:
                    CONTINUE_EXPLORATION_ACTION_CATEGORIES.READ_RELATED_CONTENT,
                  entry_surface: "related_content",
                });
              }}
            >
              <span>{item.title}</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover/link:translate-x-1 motion-reduce:transform-none" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={`${item.href}-${item.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-[var(--fm-text)]">
                <Link
                  href={item.href}
                  className="hover:text-[var(--fm-accent)]"
                  onClick={() => {
                    if (!isPublicRelatedContentHref(item.href)) return;
                    trackEvent(TRACKING_EVENTS.CONTINUE_EXPLORATION, {
                      action_category:
                        CONTINUE_EXPLORATION_ACTION_CATEGORIES.READ_RELATED_CONTENT,
                      entry_surface: "related_content",
                    });
                  }}
                >
                  {item.title}
                </Link>
              </CardTitle>
            </CardHeader>
            {item.summary ? (
              <CardContent className="pt-0 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{item.summary}</p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
