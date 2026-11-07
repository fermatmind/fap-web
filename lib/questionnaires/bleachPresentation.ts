import type { Locale } from "@/lib/i18n/locales";

/** Frontend fan-reading labels, separate from the accepted question bank and full reports. */
export const bleachPresentations = {
  "ichigo-kurosaki": { accent: "#b45309", name: { zh: "黑崎一护", en: "Ichigo Kurosaki" }, conclusion: { zh: "把帮助的范围说清楚", en: "Make the limits of help clear" }, reason: { zh: "你更常选择先说明帮助的范围、时间与结束点。", en: "You more often chose to clarify the scope, timing or endpoint of help." } },
  "rukia-kuchiki": { accent: "#5751a3", name: { zh: "朽木露琪亚", en: "Rukia Kuchiki" }, conclusion: { zh: "把一件事的做法讲清楚", en: "Make the next step easy to understand" }, reason: { zh: "你更常选择把普通做法拆成步骤，说明顺序并听取反馈。", en: "You more often chose to explain an ordinary procedure in steps, clarify the order and hear feedback." } },
  "sosuke-aizen": { accent: "#855d43", name: { zh: "蓝染惣右介", en: "Sosuke Aizen" }, conclusion: { zh: "先换个角度，重看最初的问题", en: "Step back and question the starting frame" }, reason: { zh: "你更常选择重新检查最初的问题、分类依据与前提。", en: "You more often chose to revisit the original question, grouping or assumptions." } },
  "byakuya-kuchiki": { accent: "#9d477c", name: { zh: "朽木白哉", en: "Byakuya Kuchiki" }, conclusion: { zh: "把愿意守的约定说清楚", en: "Be clear about the commitment you choose" }, reason: { zh: "你更常选择说明自愿接受的约定、期限与可重新商量的部分。", en: "You more often chose to clarify a voluntary commitment, its endpoint and what can be renegotiated." } },
  "orihime-inoue": { accent: "#ae543d", name: { zh: "井上织姬", en: "Orihime Inoue" }, conclusion: { zh: "先问对方愿不愿意，留出选择空间", en: "Leave room for the other person to choose" }, reason: { zh: "你更常选择先问对方想要什么回应，给不同意愿和暂停留空间。", en: "You more often chose to ask what response someone wants, leaving room for different wishes or a pause." } },
  "kisuke-urahara": { accent: "#357268", name: { zh: "浦原喜助", en: "Kisuke Urahara" }, conclusion: { zh: "先做小样，边试边改", en: "Try a small version, then revise" }, reason: { zh: "你更常选择先做一个可修改的小样，再用实际反馈决定下一步。", en: "You more often chose to make a small revisable prototype and use feedback to decide what comes next." } },
  "kenpachi-zaraki": { accent: "#786021", name: { zh: "更木剑八", en: "Kenpachi Zaraki" }, conclusion: { zh: "给自己一个能随时停的小挑战", en: "Choose a challenge you can pause" }, reason: { zh: "你更常选择自定一个低风险小挑战，并保留调整难度与停止的余地。", en: "You more often chose a small low-stakes challenge, with room to adjust the difficulty or stop." } },
} as const;
export type BleachId = keyof typeof bleachPresentations;
export function bleachPresentation(id: string) { return Object.hasOwn(bleachPresentations, id) ? bleachPresentations[id as BleachId] : undefined; }
export function bleachPortraitPath(id: string) { return `/images/quiz-portraits/bleach/${id}.svg`; }
export function bleachSharePath(locale: Locale, id?: string) { return `/og/fun/bleach?locale=${locale}${id ? `&portrait=${encodeURIComponent(id)}` : ""}&v=1.0.0-portraits`; }
