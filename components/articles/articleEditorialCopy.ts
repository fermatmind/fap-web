import type { DisplayLocale } from "@/lib/i18n/locales";

export const articleEditorialCopy = {
  zh: {
    takeaways: "本文速览", callout: "先看这里", timeline: "时间线", verdict: "判断条件", checklist: "核查清单",
    bad: "容易谈崩的说法", good: "可直接改写的说法", copyScript: "复制话术", copyList: "复制纯文本清单",
    copied: "已复制", failed: "无法自动复制，请手动复制。", progress: "已完成 {done} / {total} 项",
    toc: "本文目录", scroll: "左右滑动查看完整对比 →", references: "参考文献与法源", methodology: "方法论与适用边界",
    cite: "引用本文", copyCitation: "复制引用", sourceChecked: "编辑部依据一手来源核对", updated: "实质更新", revised: "更新", read: "{minutes} 分钟阅读",
  },
  en: {
    takeaways: "Key takeaways", callout: "Start here", timeline: "Timeline", verdict: "Decision guide", checklist: "Checklist",
    bad: "What to avoid", good: "A script you can adapt", copyScript: "Copy script", copyList: "Copy plain-text checklist",
    copied: "Copied", failed: "Automatic copying failed. Copy the text manually.", progress: "{done} of {total} complete",
    toc: "On this page", scroll: "Scroll horizontally to see all columns →", references: "References & Primary Sources", methodology: "Methodology & Scope",
    cite: "Cite this article", copyCitation: "Copy citation", sourceChecked: "Source-checked by Editorial Team", updated: "Substantive update", revised: "Updated", read: "{minutes} min read",
  },
  "zh-TW": {
    takeaways: "本文速覽", callout: "先看這裡", timeline: "時間軸", verdict: "判斷條件", checklist: "核對清單",
    bad: "容易談崩的說法", good: "可直接改寫的說法", copyScript: "複製話術", copyList: "複製純文字清單",
    copied: "已複製", failed: "無法自動複製，請手動複製。", progress: "已完成 {done} / {total} 項",
    toc: "本文目錄", scroll: "左右滑動查看完整對照 →", references: "參考文獻與法源", methodology: "方法與適用範圍",
    cite: "引用本文", copyCitation: "複製引用", sourceChecked: "編輯部依一手來源核對", updated: "實質更新", revised: "更新", read: "閱讀約 {minutes} 分鐘",
  },
} satisfies Record<DisplayLocale, Record<string, string>>;
