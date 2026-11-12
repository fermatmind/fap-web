import type { DisplayLocale } from "@/lib/i18n/locales";

export const brandVisionCopy = {
  zh: {
    vision: "让世界各地的年轻人，都有机会认识自己、看清职业选择，并有能力决定自己的下一步。",
    homeSubtitle: "用 MBTI 了解性格偏好，用霍兰德测试发现职业兴趣。再从千余种职业档案中，比较真实的工作任务、技能要求和入行条件，找到值得亲自尝试的方向。",
    careerLabel: "浏览职业库",
    introduction: "费马测试（FermatMind）从中文世界出发，面向全球青年。无论是选择专业、初入职场，还是考虑转行，我们希望每一位年轻人都能获得可靠的信息，并有机会亲自探索。费马以 MBTI 和霍兰德职业兴趣测试为双引擎，结合千余种结构化职业档案，帮助你了解自己的偏好和兴趣，比较不同职业的真实工作任务、技能要求和入行条件。你可以从测评开始，也可以直接查阅感兴趣的职业，选一个值得尝试的方向，在实践中做出自己的选择。",
    articleIntroduction: "费马测试（FermatMind）从中文世界出发，帮助全球青年认识自己、探索职业方向。用 MBTI 了解性格偏好，用霍兰德测试发现职业兴趣，再查阅千余种职业档案，比较工作任务、技能和入行条件，找到值得亲自尝试的下一步。",
  },
  "zh-TW": {
    vision: "讓世界各地的年輕人，都有機會認識自己、看清職涯選擇，並有能力決定自己的下一步。",
    homeSubtitle: "用 MBTI 了解性格偏好，用霍蘭德測驗探索職涯興趣。再從千餘種職業檔案中，比較實際工作內容、所需技能與入行條件，找出值得親自嘗試的方向。",
    careerLabel: "瀏覽職業資料庫",
    introduction: "費馬測試（FermatMind）從華語世界出發，面向全球青年。無論是選科系、初入職場，還是考慮轉職，我們希望每一位年輕人都能取得可靠的資訊，並有機會親自探索。費馬以 MBTI 和霍蘭德職涯興趣測驗為雙引擎，結合千餘種結構化職業檔案，幫助你了解自己的偏好與興趣，比較不同職業的實際工作內容、所需技能與入行條件。你可以先做測驗，也可以直接查閱感興趣的職業，選一個值得嘗試的方向，在實際體驗中做出自己的選擇。",
    articleIntroduction: "費馬測試（FermatMind）從華語世界出發，幫助全球青年認識自己、探索職涯方向。用 MBTI 了解性格偏好，用霍蘭德測驗探索職涯興趣，再查閱千餘種職業檔案，比較工作內容、所需技能與入行條件，找到值得親自嘗試的下一步。",
  },
  en: {
    vision: "A world where young people everywhere can understand themselves, see their career options clearly, and decide what to do next.",
    homeSubtitle: "Explore your personality preferences with MBTI and your career interests with the Holland assessment. Compare what people do, what skills they need, and how they get started across more than 1,000 occupations to find a direction worth trying.",
    careerLabel: "Browse careers",
    introduction: "FermatMind grew out of the Chinese-speaking world and is built for young people everywhere. Whether you’re choosing a field of study, starting work, or considering a career change, we want you to have reliable information and room to explore. Our two starting points are MBTI for personality preferences and the Holland assessment for career interests. More than 1,000 structured occupation profiles bring those insights into the world of work, where you can compare day-to-day tasks, skills, and routes into a role. Start with an assessment or look up a career you’re curious about, then choose a direction to try for yourself.",
    articleIntroduction: "FermatMind helps young people everywhere understand themselves and explore careers. We started in the Chinese-speaking world. Explore your preferences with MBTI and your interests with the Holland assessment, then use more than 1,000 occupation profiles to compare tasks, skills, and entry paths and find a next step worth trying.",
  },
} satisfies Record<DisplayLocale, {
  vision: string;
  homeSubtitle: string;
  careerLabel: string;
  introduction: string;
  articleIntroduction: string;
}>;
