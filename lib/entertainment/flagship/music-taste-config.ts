import { standardFacetConfig } from "./standard-facet-config";

export const musicTasteConfig = standardFacetConfig(24, 6, 2, {
  en: { headline: "Original music preference reflection · Full results free", stylesTitle: "Eight sound families you might want to hear more of", focus: "How much you like listening to different sounds", output: "Eight separate liking averages and guide pages" },
  zh: { headline: "原创音乐喜好回顾 · 完整结果免费", stylesTitle: "八类声音，哪一种想再听一会", focus: "你有多喜欢不同类型的声音", output: "八项独立喜爱均分与听感指南" },
  "zh-TW": { headline: "原創音樂喜好回顧 · 完整結果免費", stylesTitle: "八類聲音，哪一種會讓你想再聽一首？", focus: "你喜歡哪些聲音，以及喜歡到什麼程度", output: "八項各自的喜愛均分和聆聽指南" },
}, ["3".repeat(24), "54321432".repeat(3), "N3333333N333333333333333"]);
