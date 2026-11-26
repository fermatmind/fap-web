import type { DisplayLocale } from "@/lib/i18n/locales";

export const archetypeResultCopy = {
  zh: {
    brand: "费马测试", closest: "你本轮最符合", tied: "同分并列", tieLine: "你同时贴近这几位", guide: "阅读完整公开档案",
    runner: "你身上也有几分", save: "保存高清图卡", open: "打开图片 / 长按保存", share: "一键分享给朋友", retake: "再测一次",
    close: "关闭图片预览", hold: "长按图片即可保存到相册", download: "下载图卡",
    copied: "分享文案已复制，配图就能发。", sent: "已打开系统分享。", manual: "手动复制分享文案", error: "图卡暂时无法生成，请再试一次。",
    scan: (quiz: string) => `扫码测测你的「${quiz}」`,
    scanDetail: "费马测试 · 免费测你的同款性格卡 · FermatMind.com",
    next: "还想多了解自己？",
    targets: {
      MBTI: ["探索 MBTI 偏好", "如果对自己日常收集信息、做判断的偏好更好奇，可以另外做一份 MBTI 测评。"],
      BIG5_OCEAN: ["做大五人格测评 · 90 题", "想把这次趣味观察拉回日常？可以用大五人格从更广的角度探索自己的倾向。"],
      EQ_60: ["做情商测评 · 60 题", "如果想继续了解自己平常怎样觉察和回应情绪，可以独立做一份情商测评。"],
      RIASEC: ["做霍兰德职业兴趣测评 · 60 题", "从故事里的分工想到现实里喜欢的活动？霍兰德可以帮你另做一次兴趣探索。"],
    },
  },
  "zh-TW": {
    brand: "費馬測試", closest: "你本輪最符合", tied: "同分並列", tieLine: "你同時貼近這幾位", guide: "閱讀完整公開檔案",
    runner: "你身上也有幾分", save: "儲存高畫質圖卡", open: "打開圖片 / 長按儲存", share: "一鍵分享給朋友", retake: "再測一次",
    close: "關閉圖片預覽", hold: "長按圖片即可儲存到相簿", download: "下載圖卡",
    copied: "分享文案已複製，配圖就能發。", sent: "已開啟系統分享。", manual: "手動複製分享文案", error: "暫時無法產生圖卡，請再試一次。",
    scan: (quiz: string) => `掃碼測測你的「${quiz}」`,
    scanDetail: "費馬測試 · 免費測你的同款性格卡 · FermatMind.com",
    next: "想再多了解自己？",
    targets: {
      MBTI: ["探索 MBTI 偏好", "如果想看看自己平常怎麼接收資訊、做決定，可以另外做一份 MBTI 測驗。"],
      BIG5_OCEAN: ["做大五人格測驗 · 90 題", "想把這次趣味觀察帶回日常？可以用大五人格從更廣的角度探索自己的傾向。"],
      EQ_60: ["做情緒智力測驗 · 60 題", "如果想繼續了解自己平常怎麼察覺和回應情緒，可以另外做一份情緒智力測驗。"],
      RIASEC: ["做霍蘭德職業興趣測驗 · 60 題", "從故事裡的分工想到現實中喜歡的活動？可以用霍蘭德另外探索你的興趣。"],
    },
  },
  en: {
    brand: "FermatMind", closest: "Your Closest Match", tied: "Tied", tieLine: "You matched multiple equally", guide: "Read Full Character Guide",
    runner: "Also a touch of", save: "Save PNG Card", open: "Open image to save", share: "Share Result", retake: "Retake",
    close: "Close image preview", hold: "Press and hold the image to save it", download: "Download PNG",
    copied: "Caption copied. It’s ready to post with your card.", sent: "Opened system sharing.", manual: "Copy the caption manually", error: "The card couldn’t be generated. Please try again.",
    scan: (quiz: string) => `Scan to find your ${quiz} match`,
    scanDetail: "Free Quiz · Get Your Card · FermatMind.com",
    next: "Curious about your everyday preferences?",
    targets: {
      MBTI: ["Explore MBTI preferences", "If you’re curious how you usually take in information or make decisions, try a separate MBTI assessment."],
      BIG5_OCEAN: ["Take the 90-item Big Five assessment", "Take this curiosity into everyday life and explore your broader traits with a separate assessment."],
      EQ_60: ["Take the 60-item EQ assessment", "To explore how you notice and respond to emotions in everyday life, try the separate EQ assessment."],
      RIASEC: ["Take the 60-item Holland interest assessment", "Curious which activities appeal to you outside the story? Explore your interests with a separate assessment."],
    },
  },
} as const;

export function archetypeSharePayload(locale: DisplayLocale, quiz: string, names: string[], runnerUp: string | undefined, soulVerdict: string | undefined, url: string) {
  const namesText = names.join(" · ");
  const tied = names.length > 1;
  const captions = {
    zh: tied ? `在「${quiz}」测出并列【${namesText}】。这回好几个方向都很像我。你会测出谁？`
      : `刚测了「${quiz}」，我的结果是【${namesText}】${runnerUp ? `，还有几分像 ${runnerUp}` : ""}。好奇你会测到谁。`,
    "zh-TW": tied ? `在「${quiz}」直接並列【${namesText}】。系統沒幫我硬選，來看看你的版本？`
      : `剛測完「${quiz}」，這次是【${namesText}】${runnerUp ? `，也有幾分像 ${runnerUp}` : ""}。換你看看會出現誰。`,
    en: tied ? `Tied between ${namesText} on ${quiz}. I can see a bit of myself in each. Who did you get?`
      : `Got ${namesText} on ${quiz}${runnerUp ? `, with a little ${runnerUp} in the mix` : ""}. Who did you get?`,
  };
  return { title: `${quiz} · ${namesText}`, text: soulVerdict && !tied ? `${captions[locale]}\n${locale === "en" ? `“${soulVerdict}”` : `「${soulVerdict}」`}` : captions[locale], url };
}
