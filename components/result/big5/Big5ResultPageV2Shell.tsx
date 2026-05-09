"use client";

import type { Big5ResultPageV2Block, Big5ResultPageV2Payload } from "@/lib/big5/resultPageV2";
import type { Locale } from "@/lib/i18n/locales";

const MODULE_TITLES: Record<string, { en: string; zh: string }> = {
  module_00_trust_bar: { en: "Trust note", zh: "可信说明" },
  module_01_hero: { en: "Quick read", zh: "首屏快读" },
  module_02_quick_understanding: { en: "Three-minute view", zh: "三分钟理解" },
  module_03_trait_deep_dive: { en: "Trait details", zh: "五维分数" },
  module_04_coupling: { en: "Trait coupling", zh: "动力耦合" },
  module_05_facet_reframe: { en: "Facet signals", zh: "Facet 信号" },
  module_06_application_matrix: { en: "Application matrix", zh: "现实应用" },
  module_07_collaboration_manual: { en: "Collaboration manual", zh: "协作说明" },
  module_08_share_save: { en: "Share and save", zh: "分享与保存" },
  module_09_feedback_data_flywheel: { en: "Feedback", zh: "模块反馈" },
  module_10_method_privacy: { en: "Method and privacy", zh: "方法与隐私" },
};

function pickLocalizedText(content: Record<string, unknown> | undefined, locale: Locale, keys: string[]): string {
  if (!content) {
    return "";
  }

  const suffix = locale === "zh" ? "_zh" : "_en";
  for (const key of keys) {
    const localized = content[`${key}${suffix}`];
    if (typeof localized === "string" && localized.trim()) {
      return localized.trim();
    }
  }

  for (const key of keys) {
    const value = content[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function pickStringList(content: Record<string, unknown> | undefined, locale: Locale, keys: string[]): string[] {
  if (!content) {
    return [];
  }

  const suffix = locale === "zh" ? "_zh" : "_en";
  for (const key of keys) {
    const value = content[`${key}${suffix}`] ?? content[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  }

  return [];
}

function isDeferred(block: Big5ResultPageV2Block): boolean {
  const fallbackPolicy = String(block.fallback_policy ?? "").toLowerCase();
  return fallbackPolicy === "omit_block" || fallbackPolicy === "backend_required" || fallbackPolicy === "share_safe_summary_only";
}

function Big5ResultPageV2BlockRenderer({ block, locale }: { block: Big5ResultPageV2Block; locale: Locale }) {
  const content = block.content && typeof block.content === "object" && !Array.isArray(block.content)
    ? block.content as Record<string, unknown>
    : undefined;
  const title = pickLocalizedText(content, locale, ["title", "heading", "label"]);
  const summary = pickLocalizedText(content, locale, ["summary", "body", "description", "action"]);
  const bullets = pickStringList(content, locale, ["bullets", "items", "actions"]);
  const showDeferred = isDeferred(block) && !summary && bullets.length === 0;

  if (!title && !summary && bullets.length === 0 && !showDeferred) {
    return null;
  }

  return (
    <div
      data-testid={`big5-v2-block-${block.block_kind}`}
      data-block-kind={block.block_kind}
      data-block-key={block.block_key}
      data-content-source={block.content_source || undefined}
      data-fallback-policy={block.fallback_policy || undefined}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        {title ? <h4 className="m-0 text-base font-semibold text-slate-950">{title}</h4> : null}
      </div>
      {summary ? <p className="m-0 mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{summary}</p> : null}
      {bullets.length > 0 ? (
        <ul className="m-0 mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-700">
          {bullets.map((item, index) => (
            <li key={`${block.block_key}-item-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {showDeferred ? (
        <p data-testid="big5-v2-deferred" className="m-0 mt-3 text-sm text-slate-500">
          {locale === "zh" ? "此模块暂未启用" : "This module is not available yet"}
        </p>
      ) : null}
    </div>
  );
}

export function Big5ResultPageV2Shell({
  locale,
  payload,
}: {
  locale: Locale;
  payload: Big5ResultPageV2Payload;
}) {
  const modules = payload.modules.filter((module) => module.blocks.length > 0);

  return (
    <div
      data-testid="big5-result-page-v2-shell"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
      className="space-y-6"
    >
      {modules.map((module) => {
        const title = MODULE_TITLES[module.module_key]?.[locale] ?? module.module_key;
        return (
          <section
            key={module.module_key}
            data-testid={`big5-v2-module-${module.module_key}`}
            data-module-key={module.module_key}
            className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div>
              <h3 className="m-0 mt-1 text-xl font-semibold text-slate-950">{title}</h3>
            </div>
            <div className="space-y-3">
              {module.blocks.map((block) => (
                <Big5ResultPageV2BlockRenderer key={block.block_key} block={block} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
