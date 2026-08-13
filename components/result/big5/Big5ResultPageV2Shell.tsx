"use client";

import { Big5CoreSummary, buildBig5V2CoreSummaryItems } from "@/components/result/big5/Big5CoreSummary";
import {
  Big5ResultPageV2BlockRenderer,
  projectionRecord,
} from "@/components/result/big5/Big5ResultPageV2Blocks";
import type {
  Big5ResultPageV2CoreDomain,
  Big5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import type { Locale } from "@/lib/i18n/locales";
import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";

const MODULE_TITLES: Record<string, { en: string; zh: string }> = {
  module_00_trust_bar: { en: "Trust note", zh: "可信说明" },
  module_01_hero: { en: "Quick read", zh: "首屏快读" },
  module_02_quick_understanding: { en: "Three-minute view", zh: "三分钟理解" },
  module_03_trait_deep_dive: { en: "Trait details", zh: "五维分数" },
  module_04_coupling: { en: "Trait coupling", zh: "动力耦合" },
  module_05_facet_reframe: { en: "Facet signals", zh: "细分维度信号" },
  module_06_application_matrix: { en: "Application matrix", zh: "现实应用" },
  module_07_collaboration_manual: { en: "Collaboration manual", zh: "协作说明" },
  module_08_share_save: { en: "Share and save", zh: "分享与保存" },
  module_09_feedback_data_flywheel: { en: "Feedback", zh: "模块反馈" },
  module_10_method_privacy: { en: "Method and privacy", zh: "方法与隐私" },
};

export function Big5ResultPageV2Shell({
  locale,
  payload,
  mode = "full",
  coreDomains = [],
}: {
  locale: Locale;
  payload: Big5ResultPageV2Payload;
  mode?: "full" | "core_only";
  coreDomains?: Big5ResultPageV2CoreDomain[];
}) {
  if (mode === "core_only") {
    return (
      <Big5CoreSummary
        locale={locale}
        items={buildBig5V2CoreSummaryItems(coreDomains, locale)}
        source="v2"
      />
    );
  }

  const modules = payload.modules.filter((module) => module.blocks.length > 0);
  const projection = projectionRecord(payload);

  return (
    <div
      data-testid="big5-result-page-v2-shell"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
      className="space-y-6"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
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
                <Big5ResultPageV2BlockRenderer
                  key={block.block_key}
                  block={block}
                  payload={payload}
                  projection={projection}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
