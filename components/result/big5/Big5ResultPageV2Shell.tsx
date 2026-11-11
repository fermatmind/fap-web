"use client";

import { useEffect, useMemo, useState } from "react";
import { projectBig5V2DisplayCopy } from "@/lib/big5/resultPageV2DisplayCopy";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

import { Big5CoreSummary, buildBig5V2CoreSummaryItems } from "@/components/result/big5/Big5CoreSummary";
import {
  Big5ResultPageV2BlockRenderer,
  projectionRecord,
} from "@/components/result/big5/Big5ResultPageV2Blocks";
import type {
  Big5ResultPageV2CoreDomain,
  Big5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";

const MODULE_TITLES: Record<string, Record<DisplayLocale, string>> = {
  module_00_trust_bar: { en: "Trust note", zh: "可信说明", "zh-TW": "解讀說明" },
  module_01_hero: { en: "Quick read", zh: "首屏快读", "zh-TW": "結果速覽" },
  module_02_quick_understanding: { en: "Three-minute view", zh: "三分钟理解", "zh-TW": "三分鐘掌握結果" },
  module_03_trait_deep_dive: { en: "Trait details", zh: "五维分数", "zh-TW": "五大特質分數" },
  module_04_coupling: { en: "Trait coupling", zh: "动力耦合", "zh-TW": "動力耦合" },
  module_05_facet_reframe: { en: "Facet signals", zh: "细分维度信号", "zh-TW": "細分面向訊號" },
  module_06_application_matrix: { en: "Application matrix", zh: "现实应用", "zh-TW": "實際應用" },
  module_07_collaboration_manual: { en: "Collaboration manual", zh: "协作说明", "zh-TW": "協作說明" },
  module_08_share_save: { en: "Share and save", zh: "分享与保存", "zh-TW": "分享與儲存" },
  module_09_feedback_data_flywheel: { en: "Feedback", zh: "模块反馈", "zh-TW": "回饋" },
  module_10_method_privacy: { en: "Method and privacy", zh: "方法与隐私", "zh-TW": "方法與隱私" },
};

export function Big5ResultPageV2Shell({
  locale,
  displayLocale = locale,
  payload,
  mode = "full",
  coreDomains = [],
}: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  payload: Big5ResultPageV2Payload;
  mode?: "full" | "core_only";
  coreDomains?: Big5ResultPageV2CoreDomain[];
}) {
  const taiwanFull = displayLocale === "zh-TW" && mode === "full";
  const [translate, setTranslate] = useState<((source: string) => string) | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    if (!taiwanFull) return;
    let active = true;
    void loadTraditionalAssessmentText().then(
      convert => { if (active) setTranslate(() => convert); },
      () => { if (active) setUnavailable(true); },
    );
    return () => { active = false; };
  }, [taiwanFull]);
  const displayPayload = useMemo(() => taiwanFull && translate
    ? projectBig5V2DisplayCopy(payload, translate)
    : payload, [payload, taiwanFull, translate]);
  if (taiwanFull && !translate) {
    return <p role="status">{unavailable ? "繁體歷史報告暫時無法載入。" : "正在載入繁體歷史報告…"}</p>;
  }
  if (mode === "core_only") {
    return (
      <Big5CoreSummary
        locale={locale}
        displayLocale={displayLocale}
        items={buildBig5V2CoreSummaryItems(coreDomains, locale)}
        source="v2"
      />
    );
  }

  const modules = displayPayload.modules.filter((module) => module.blocks.length > 0);
  const projection = projectionRecord(payload);

  return (
    <div
      data-testid="big5-result-page-v2-shell"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
      className="space-y-6"
    >
      <SelfUnderstandingDomainBadge locale={locale} displayLocale={displayLocale} />
      {modules.map((module) => {
        const title = MODULE_TITLES[module.module_key]?.[displayLocale] ?? module.module_key;
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
                  payload={displayPayload}
                  projection={projection}
                  locale={locale}
                  displayLocale={displayLocale}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
