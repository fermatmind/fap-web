import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { sevenSinsCardPeaks, type SevenSinsCardRow, type SevenSinsTrack } from "./sevenSinsCard";

export const sevenSinsShareCopy = {
  zh: {
    name: "费马测试 · 光暗双轨档案", time: "近四周自述", shadow: "暗面峰值", light: "光面峰值", tied: "并列",
    legend: ["红：七宗罪", "金：七美德"], pairs: ["认可", "资源", "界限", "比较", "节制", "摩擦", "行动"],
    patterns: {
      same: "同一组里，锋芒和分寸都很鲜明。", cross: "两组不同的反应，都在这四周留下了高分。",
      tied: "不止一个面向冲上高点，同分都留在图上。", light: "这四周，金色一侧的最高分更突出。",
      shadow: "这四周，红色一侧更突出。看看是哪种日常情境让你有共鸣。", even: "光暗两边的最高分接近，看一看各组有哪些反差。",
    },
    buttons: ["保存高清图卡", "打开图片 / 长按保存", "一键分享给朋友", "再测一次"],
    close: "关闭图片预览", hold: "长按图片即可保存到相册", fallback: "无法长按时可改点下方「下载图卡」", download: "下载图卡",
    copied: "分享文案已复制，配图直接发刚好", sent: "已分享", error: "这次操作未完成，请再试一次。", manual: "手动复制分享文案",
    imageAlt: "本次七宗罪与七美德结果图卡", scan: "扫码测测你的七宗罪 × 七美德", scanSub: "28 题免费免注册 · FermatMind.com",
    details: "14 项分数明细", sin: "七宗罪", virtue: "七美德",
    next: "还想多了解自己？", nextLead: "这份图卡记录最近四周的行为切面。想进一步看看日常人格倾向、性格偏好或情绪觉察，可以从这些测评开始。",
    options: ["大五人格测试", "情商测试", "MBTI 性格测试"],
  },
  "zh-TW": {
    name: "費馬測試 · 光暗雙軌檔案", time: "近四週自述", shadow: "暗面峰值", light: "光面峰值", tied: "並列",
    legend: ["紅：七宗罪", "金：七美德"], pairs: ["認可", "資源", "界線", "比較", "節制", "摩擦", "行動"],
    patterns: {
      same: "同一組裡，鋒芒和分寸都很鮮明。", cross: "兩組不同的反應，都在這四週留下了高分。",
      tied: "不只一個面向衝上高點，同分都留在圖上。", light: "這四週，金色這邊的最高分更突出。",
      shadow: "這四週，紅色這邊更突出。看看哪種日常情境讓你有共鳴。", even: "光暗兩邊的最高分接近，看看各組有哪些反差。",
    },
    buttons: ["儲存高畫質圖卡", "打開圖片 / 長按儲存", "一鍵分享給朋友", "再測一次"],
    close: "關閉圖片預覽", hold: "長按圖片即可儲存進相簿", fallback: "無法長按時可改點下方「下載圖卡」", download: "下載圖卡",
    copied: "已複製分享文案，配圖直接發剛剛好", sent: "已分享", error: "這次操作未完成，請再試一次。", manual: "手動複製分享文案",
    imageAlt: "本次七宗罪與七美德結果圖卡", scan: "掃碼測測你的七宗罪 × 七美德", scanSub: "28 題免費免登入 · FermatMind.com",
    details: "14 項分數明細", sin: "七宗罪", virtue: "七美德",
    next: "還想多了解自己？", nextLead: "這份圖卡記錄近四週的行為切面。想多了解日常人格傾向、性格偏好或情緒覺察，可以從這些測驗開始。",
    options: ["大五人格測驗", "情緒智力測驗", "MBTI 性格測驗"],
  },
  en: {
    name: "FermatMind · Light & Shadow", time: "Past 4 Weeks", shadow: "Shadow Peak", light: "Light Peak", tied: "Tied",
    legend: ["Red: seven sins", "Gold: seven virtues"], pairs: ["Recognition", "Resources", "Boundaries", "Comparison", "Moderation", "Friction", "Action"],
    patterns: {
      same: "A sharp edge and a sense of restraint both scored high in the same pair.", cross: "Two different pairs stood out in your past four weeks.",
      tied: "More than one score tied at the top. They’re all here.", light: "The highest score in this snapshot sits on the gold track.",
      shadow: "The red track had the higher peak. See which everyday situations sound familiar.", even: "The peaks are close. Look at the individual pairs to see where they differ.",
    },
    buttons: ["Save PNG card", "Open image to save", "Share with friends", "Retake test"],
    close: "Close image preview", hold: "Press and hold the image to save it", fallback: "Or tap Download PNG below", download: "Download PNG",
    copied: "Share caption copied—ready to post with your card", sent: "Shared", error: "That didn’t work. Please try again.", manual: "Copy the share caption manually",
    imageAlt: "Your seven sins and seven virtues result card", scan: "Scan for your 7 Sins × 7 Virtues chart", scanSub: "28 free questions · No sign-up · FermatMind.com",
    details: "All 14 scores", sin: "Seven sins", virtue: "Seven virtues",
    next: "Want to explore further?", nextLead: "This card reflects your past four weeks. Explore broader personality traits, personality preferences, or emotional awareness with these assessments.",
    options: ["Big Five personality test", "EQ test", "MBTI personality test"],
  },
} as const;

export function sevenSinsTrackLabel(row: SevenSinsCardRow, track: SevenSinsTrack, locale: DisplayLocale) {
  return sevenSinsDisplay(row[track][locale === "en" ? "en" : "zh"], locale);
}

export function sevenSinsShareCaption(peaks: ReturnType<typeof sevenSinsCardPeaks>, locale: DisplayLocale, url: string) {
  const describe = (track: SevenSinsTrack) => {
    const rows = peaks[track];
    return `${rows.map(row => sevenSinsTrackLabel(row, track, locale)).join(" · ")} ${Math.round(rows[0].scores[track])}`;
  };
  const sin = describe("sin");
  const virtue = describe("virtue");
  const text = {
    "zh-TW": peaks.tied ? `笑死直接同分並列：${sin} × ${virtue}，連系統都不硬幫我選一個。測測你的版本`
      : peaks.bothHigh ? `最近四週的真實切片：${sin} × ${virtue}，一邊黑化一邊登神（？）兩邊居然都高分，換你來測看看`
      : `近四週狀態檢討：${sin}、美德靠 ${virtue} 撐場。來對照一下你的紅金雷達圖`,
    zh: peaks.tied ? `这把直接同分并列了：${sin} × ${virtue}，没有硬贴单一标签。你也来跑一张对照`
      : peaks.bothHigh ? `最近四周的真实切面：${sin} × ${virtue}，原来真能一边上头一边克制……你也来测张红金雷达图`
      : `近四周状态出炉：暗面最高 ${sin}，美德最高 ${virtue}。发出来对一下，看看谁的红金反差更大`,
    en: peaks.tied ? `Tied at the top: ${sin} × ${virtue}—no forced single label. Compare your red-vs-gold chart`
      : peaks.bothHigh ? `My past 4 weeks in two numbers: ${sin} × ${virtue}. Somehow scored high on both sides at once`
      : `Past-4-weeks snapshot: ${sin} on the red track, ${virtue} on gold. Curious what your radar looks like`,
  };
  return `${text[locale]} → ${url}`;
}
