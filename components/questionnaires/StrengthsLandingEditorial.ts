import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "appreciation-of-beauty": {
    "zh": "美的欣赏：探索对自然与美的注意和情感反应。通过公共步道的例子，区分感受到美、鉴赏知识和创作技能，并保留没有停下来看的具体条件。",
    "en": "Appreciation of beauty: explore attention and emotional responses to beauty and nature. A public-path example distinguishes feeling moved, art knowledge and creative skill while considering circumstances that leave little time to notice."
  },
  "love": {
    "zh": "表达与接纳关爱：回看表达感情、接受关心以及对关系中被关心的感受。指南讨论自愿分享与边界，不把自己的回答当成对方感情或关系质量的证明。",
    "en": "Giving and receiving care: revisit expressing feelings, accepting care and feeling cared for in relationships. Read voluntary sharing and boundaries without treating your answers as evidence of another person’s feelings or relationship quality."
  },
  "teamwork": {
    "zh": "团队合作：观察忠诚、支持同伴与独自做事的自述。用共同任务区分贡献、分工和自主空间，并比较协调带领；单独工作不自动表示缺乏合作能力。",
    "en": "Teamwork: examine self-described loyalty, support and working alone. A shared task distinguishes contribution, roles and autonomy, with comparisons to leadership; solitary work does not automatically indicate deficient teamwork ability."
  },
  "curiosity": {
    "zh": "好奇心：探索活动兴趣、对世界的疑问与在情境中发现兴趣的倾向。比较热爱学习和原创思考，结合机会与精力阅读较低认可，不把它解释成低智力。",
    "en": "Curiosity: explore interests in activities, questions about the world and finding interest in situations. Compare learning and originality and consider opportunity and energy when reading lower endorsement, without inferring low intelligence."
  },
  "fairness": {
    "zh": "公平对待：围绕平等权利、个人好恶与如何对待别人阅读自述。通过共同分担的例子区分相同安排、合理差异和善意，不将均分作为司法或道德认证。",
    "en": "Fairness: read self-descriptions of equal rights, personal preferences and treatment of others. Shared-cost examples distinguish identical arrangements, relevant differences and kindness, without turning a mean into legal or moral certification."
  },
  "forgiveness": {
    "zh": "宽恕倾向：探索理解回应、重新开始与怨怼的自述。把宽恕同恢复信任、免除责任和重新接触分开，保留个人选择、安全和边界。",
    "en": "Forgiveness: explore understanding, fresh starts and resentment. Separate forgiving from restoring trust, removing accountability or resuming contact while preserving choice, safety and boundaries."
  },
  "gratitude": {
    "zh": "感恩表达：回看感谢他人和感受到可感谢事物的经历。通过一次具体帮助区分感谢、负债感与乐观；表达感谢可以与指出仍需解决的问题同时存在。",
    "en": "Gratitude: revisit expressing thanks and finding things to appreciate. A concrete exchange distinguishes gratitude, indebtedness and optimism; thanks can coexist with naming an unresolved problem."
  },
  "hope": {
    "zh": "希望与乐观：探索挑战中的期待、积极理解与对负面结果的担心。结合一次申请的情境，区分自报乐观、证据与计划，不预测未来成功。",
    "en": "Hope and optimism: explore expectations amid challenges, positive interpretations and worries about negative outcomes. An application example separates reported optimism, evidence and planning without predicting future success."
  },
  "humor": {
    "zh": "幽默与玩心：回看逗人开心、低落情境中的幽默以及对自己给人印象的判断。以小乌龙讨论轻松表达与分寸，不将自评当作喜剧天赋或受欢迎程度。",
    "en": "Humor and playfulness: revisit brightening others’ days, humor in gloomy situations and perceived impressions. An ordinary mishap illustrates levity and context without certifying comic talent or popularity."
  },
  "perseverance": {
    "zh": "坚持完成：观察遇到阻碍时继续和完成任务的自述。用可撤回的小任务比较坚持、自我调节与必要暂停，保留修改过时目标和求助的余地。",
    "en": "Perseverance: examine continuing and completing tasks despite obstacles. A reversible small task distinguishes persistence, self-regulation and necessary pauses, leaving room to revise outdated goals or seek help."
  },
  "honesty": {
    "zh": "诚实与守诺：探索保密、承诺与面对麻烦时的真实表达。以约定变化说明如何主动澄清；诚实不要求公开私人信息，分数也不是对他人信任的担保。",
    "en": "Honesty and integrity: explore confidences, promises and truthfulness when difficulties arise. A changed agreement illustrates clarification; honesty does not require private disclosure and a score cannot guarantee trustworthiness."
  },
  "judgment": {
    "zh": "审慎判断：回看权衡利弊、考虑不同可能及对自己判断的评价。通过日常方案比较寻找证据和反例，区分仔细思考、智力与必然正确的决定。",
    "en": "Judgment: revisit weighing alternatives, considering possibilities and evaluating your own decisions. An everyday comparison examines evidence and counterexamples, distinguishing deliberation, intelligence and guaranteed correctness."
  },
  "kindness": {
    "zh": "善意与助人：观察帮助、鼓励和听取他人困难时的回应。以一次请求区分关心与无限可用，保留资源、拒绝和协商，不把疲惫等同于缺少善意。",
    "en": "Kindness: examine help, encouragement and responses to others’ difficulties. A request distinguishes care from unlimited availability, preserving resources, refusal and negotiation rather than equating fatigue with unkindness."
  },
  "leadership": {
    "zh": "协调带领：探索帮助大家合作、承担协调与自认给人的带领印象。用日常安排区分角色机会、同伴意愿和实际管理表现，不由四条自述授予领导资格。",
    "en": "Leadership: explore perceived coordination, taking charge and impressions of your leadership. An everyday arrangement separates role opportunities, others’ wishes and actual management performance without granting leadership credentials from four statements."
  },
  "love-of-learning": {
    "zh": "热爱学习：回看学习新事物的愉快、自我认同与阅读非虚构内容的习惯。比较好奇和坚持，结合时间与材料机会，不用喜欢学习推断成绩或知识水平。",
    "en": "Love of learning: revisit enjoyment, learner self-description and nonfiction reading. Compare curiosity and persistence while considering time and access to material; enjoying learning establishes neither grades nor knowledge level."
  },
  "humility": {
    "zh": "谦逊表达：观察谈论成果、站到人群前与对自负印象的自述。通过共同项目区分低调、自信与隐去贡献，不要求自我否定或接受不公平评价。",
    "en": "Humility: examine talking about achievements, visibility and perceived arrogance. A shared project distinguishes modest presentation, confidence and erasing contributions without requiring self-denial or unfair evaluation."
  },
  "creativity": {
    "zh": "原创思考：探索提出新做法、不同想法与原创意愿的自我描述。以普通安排比较新颖、实用与美的欣赏，保留核对方案条件的步骤，不认证创造能力。",
    "en": "Originality: explore self-described new approaches, unusual ideas and desire to create. An ordinary arrangement compares novelty, usefulness and appreciation of beauty while retaining practical checks rather than certifying creative performance."
  },
  "perspective": {
    "zh": "整体视角：回看如何理解重要事项、成熟视角与自己被请教的印象。通过共同安排提出有用的问题，区分经验、情境与专业建议资格。",
    "en": "Perspective: revisit views of what matters, maturity and being consulted. A shared arrangement prompts useful questions while distinguishing experience and context from professional advice credentials."
  },
  "prudence": {
    "zh": "行动前审慎：探索后果考虑、谨慎选择和风险偏好的自述。通过可撤回的日常决定区分计划、担忧与必要行动，不由低风险偏好证明安全能力。",
    "en": "Prudence: explore considering consequences, careful choices and risk preferences. A reversible decision distinguishes planning, worry and necessary action without treating low risk preference as verified safety competence."
  },
  "self-regulation": {
    "zh": "自我调节：回看纪律、长期取舍与冲动的自述。用一次中断讨论可行安排，明确休息、饮食和资源条件，不把控制程度当作健康或个人价值。",
    "en": "Self-regulation: revisit discipline, long-term tradeoffs and urges. An interruption illustrates workable arrangements while preserving rest, eating and resources rather than treating control as a health or personal-worth verdict."
  },
  "social-intelligence": {
    "zh": "社交理解自评：探索对他人感受、回应和陌生场合的自认。以日常邀约核对猜测与实际表达，区分自信、已确认的理解与实测社交能力。",
    "en": "Social understanding: explore perceived feelings, reactions and unfamiliar settings. An invitation checks guesses against actual expression, distinguishing confidence, confirmed understanding and tested social ability."
  },
  "spirituality": {
    "zh": "精神性与宗教性：如实阅读涉及精神认同、意义、目的与信仰的四条内容。保留无信仰、不同意义来源与拒答选择，不按结果排定人品或人生价值。",
    "en": "Spirituality and religiousness: read four items about identity, meaning, purpose and belief accurately. Preserve nonbelief, diverse sources of meaning and voluntary nonresponse without ranking morality or life’s value."
  },
  "bravery": {
    "zh": "表达信念的勇气：回看面对反对和可能后果时表达观点的自述。以安全分歧讨论时机与选择，不把沉默视作缺陷，也不要求承担现实危险。",
    "en": "Expressing convictions: revisit speaking under opposition or possible consequences. A safe disagreement explores timing and choice without labelling silence a deficiency or requiring real danger."
  },
  "zest": {
    "zh": "活力与热忱：观察对一天的期待、自报精力与对自己印象的判断。区分热忱、外向性、健康与环境条件，保留休息空间，不作情绪或生理诊断。",
    "en": "Zest: examine anticipation of the day, reported energy and perceived impressions. Distinguish enthusiasm, extraversion, health and circumstances while allowing rest, without a mood or physiological diagnosis."
  }
};

export function strengthsLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
