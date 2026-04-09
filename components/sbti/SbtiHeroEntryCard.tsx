"use client";

import { useEffect } from "react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function SbtiHeroEntryCard({ locale }: { locale: Locale }) {
  useEffect(() => {
    trackEvent("ui_card_impression", {
      slug: "sbti-home-hero",
      visual_kind: "hero_entry",
      entrySurface: "home_hero",
      locale,
    });
  }, [locale]);

  const primaryHref = localizedPath("/fun/sbti", locale);
  const mbtiHref = localizedPath("/tests/mbti-personality-test-16-personality-types", locale);

  return (
    <section className="relative rounded-[2rem] border border-white/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 text-white shadow-[0_28px_80px_rgba(4,12,24,0.34)] backdrop-blur-xl sm:p-6">
      <div
        aria-hidden
        className="absolute inset-x-5 top-5 h-32 rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,211,140,0.42),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(112,213,255,0.28),transparent_52%)]"
      />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-white/20 bg-white/12 text-white">娱乐实验</Badge>
          <span className="rounded-full border border-white/16 bg-black/10 px-3 py-1 text-xs font-medium text-white/82">
            31 题 · 3-5 分钟
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="m-0 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-[-0.04em] text-white">
            SBTI 人格测试
          </h2>
          <p className="m-0 max-w-[30rem] text-sm leading-7 text-slate-100/90 sm:text-[0.95rem]">
            一个轻量、好玩、可分享的人格画像实验。适合拿来笑一笑，不适合拿来做诊断、招聘、相亲或重大决定。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/12 bg-black/12 px-4 py-3">
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.16em] text-white/58">今晚可直接上线</p>
            <p className="m-0 mt-2 text-sm text-white/90">纯前端本地算分，不接正式报告、不走后端链路。</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-black/12 px-4 py-3">
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.16em] text-white/58">结果结构</p>
            <p className="m-0 mt-2 text-sm text-white/90">主类型、匹配度、15 维评分、友情提示，一次看完。</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <TrackedEntryCtaLink
            href={primaryHref}
            className={buttonVariants({
              size: "lg",
              className: "justify-center bg-white text-slate-950 hover:bg-slate-100",
            })}
            eventProperties={{
              slug: "sbti-home-hero",
              entry_surface: "home_hero",
              target_action: "open_fun_sbti",
              landing_path: primaryHref,
              locale,
            }}
          >
            开始娱乐版
          </TrackedEntryCtaLink>

          <TrackedEntryCtaLink
            href={mbtiHref}
            eventName="ui_card_interaction"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: cn(
                "justify-center border-white/28 bg-white/6 text-white hover:border-white/45 hover:bg-white/10 hover:text-white"
              ),
            })}
            eventProperties={{
              slug: "sbti-home-hero",
              visual_kind: "hero_entry",
              interaction: "open_formal_mbti",
              locale,
            }}
          >
            先看正式版 MBTI
          </TrackedEntryCtaLink>
        </div>

        <p className="m-0 text-xs leading-6 text-white/68">
          仅供娱乐，不作诊断依据
        </p>
      </div>
    </section>
  );
}
