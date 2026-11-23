import { CAREER_ASSESSMENT_LANDING_PATH } from "@/lib/career/assessmentEntry";
const en = {
  headline: "Vice City · One night on the waterfront",
  sample: "Preview three character matches",
  quizSample: "Try the opening choice",
  benefitsTitle: "What will your result show?",
  facts: "FermatMind’s free GTA 6 Character Quiz uses 12 decisions at a fictional Vice City waterfront party to match players with one of eight Grand Theft Auto VI character entries. Each choice gives one character one vote. The result explains the match and can show a secondary style. Players can also invite a friend to compare crew roles. The quiz takes about two minutes and requires no account or payment.",
  benefits: [
    ["Your main match", "See which decisions earned your character votes and when a runner-up appears."],
    ["A card for your crew", "Save a character card or send a friend your public guide to compare crew roles."],
    ["Eight public guides", "Meet the cast and see what each of them does when the night takes a turn."],
  ],
  scene: "When it shows up", friction: "What to watch for",
  explainVote: (role: string) => `This choice gives ${role} one vote. The sample stays separate from your quiz.`,
  formula: "12 choices → one vote per choice → highest total; ties: midnight votes, then latest matched answer.",
  boundary: "Sources, privacy and interpretation",
  exploreTitle: "Which part of the job would you want to try?",
  explore: [
    ["Notice your everyday preferences", "Explore how you usually take in information, make decisions and work with other people.", "Explore the MBTI test"],
    ["Find work activities you enjoy", "Use the 60-item Holland test to compare six kinds of career interests.", "Explore the Holland test"],
    ["Narrow your career shortlist", "Consider your interests, work style and preferred setting with the 94-item assessment.", "Explore the FermatMind Career Assessment"],
  ],
  compareTitle: "Which assessment fits what you want to explore?",
  columns: ["Assessment", "Focus", "Format", "Result"],
  compare: [
    ["GTA 6 Character Quiz", "Crew decisions in Vice City", "12 scenarios · about 2 min", "A character match and optional co-op roles"],
    ["MBTI test", "Everyday personality preferences", "93 or 144 items", "Four preference pairs"],
    ["Holland Career Interest Test", "Work activities", "60 items", "Six interest areas and a three-letter code"],
    ["FermatMind Career Assessment", "Interests, work style and setting", "94 items", "A career exploration report"],
  ],
} as const;

const zh = {
  headline: "罪恶都市 · 海岸派对的一晚",
  sample: "切换三份角色结果样张",
  quizSample: "试做开场第一题",
  benefitsTitle: "答完会看到什么？",
  facts: "费马测试的 GTA 6 角色测试用 12 道虚构派对题，在八组《侠盗猎车手6》人物中匹配一组。约两分钟，免费免注册。结果可保存分享卡，也可邀请好友查看双人分工。",
  benefits: [
    ["一个主角色", "查看哪些选择给这组角色投了票，接近时还会显示次要行事风格。"],
    ["一张组队邀请", "保存角色分享卡，或把公开指南发给朋友，一起查看你们的分工。"],
    ["八份公开角色指南", "直接看看每组角色怎么救场，以及合作时容易卡在哪里。"],
  ],
  scene: "什么时候会这样做", friction: "搭档提醒",
  explainVote: (role: string) => `这个选择给 ${role} 加 1 票。样题选择独立于正式作答。`,
  formula: "12 次选择，每题一票。总票数相同，先比午夜票数，再看谁较晚被选中。",
  boundary: "创作来源、作答隐私与解释边界",
  exploreTitle: "派对结束后，你想了解哪种现实分工？",
  explore: [
    ["了解日常人格偏好", "看看你平时怎么收集信息、做决定和与人协作。", "查看 MBTI 测试"],
    ["找出愿意尝试的工作活动", "用 60 题霍兰德测试对照六类职业兴趣。", "查看霍兰德职业兴趣测试"],
    ["缩小职业探索范围", "通过 94 题费马职业测试，了解兴趣、工作方式和环境偏好。", "查看费马职业测试"],
  ],
  compareTitle: "哪项测评适合现在的你？",
  columns: ["测评", "关注什么", "作答方式", "你会看到"],
  compare: [
    ["GTA 6 角色测试", "罪恶都市里的临场分工", "12 道情境题 · 约 2 分钟", "角色匹配，可邀请好友组队"],
    ["MBTI 测试", "日常人格偏好", "93 / 144 题", "四组人格偏好"],
    ["霍兰德职业兴趣测试", "喜欢做哪些工作活动", "60 题", "六类兴趣及三字代码"],
    ["费马职业测试", "兴趣、工作方式与环境偏好", "94 题", "职业探索报告"],
  ],
} as const;

const tw = {
  headline: "罪惡城市 · 海岸派對的這一晚",
  sample: "切換三張角色結果圖卡",
  quizSample: "試做開場第一題",
  benefitsTitle: "做完會看到哪些結果？",
  facts: "費馬測試的 GTA 6 角色測驗用 12 道虛構派對題，從八組《俠盜獵車手6》人物中配對一組。約兩分鐘，免費免註冊。結果可儲存分享圖卡，也能揪朋友看分工。",
  benefits: [
    ["一組主要配對", "看看哪些做法投給這組角色；票數接近時，還能看到另一種行事風格。"],
    ["一張揪團圖卡", "儲存角色圖卡，或把公開指南傳給朋友，看看兩人怎麼分工。"],
    ["八組公開人物指南", "先認識每組角色怎麼救場、搭檔時有哪些地方要講清楚。"],
  ],
  scene: "什麼時候派得上用場", friction: "搭檔提醒",
  explainVote: (role: string) => `這個選擇給 ${role} 1 票。試做的答案不會帶進正式測驗。`,
  formula: "12 次選擇，每題一票。總票數相同，先比午夜那一幕的票數，再看最後選到誰。",
  boundary: "創作來源、作答隱私與解讀範圍",
  exploreTitle: "派對散場後，你想了解哪種工作方式？",
  explore: [
    ["認識平常的人格偏好", "回想自己通常怎麼整理資訊、下決定，或和別人合作。", "看看 MBTI 測驗"],
    ["找出想試試看的工作活動", "用 60 題霍蘭德測驗比較六類職涯興趣。", "看看霍蘭德職涯興趣測驗"],
    ["整理你的職涯探索清單", "用 94 題一起梳理興趣、工作風格和環境偏好。", "看看費馬職涯測驗"],
  ],
  compareTitle: "哪項測驗適合現在的你？",
  columns: ["測驗", "想了解的事", "作答方式", "你會看到"],
  compare: [
    ["GTA 6 角色測驗", "罪惡城市的臨場分工", "12 道情境題 · 約 2 分鐘", "角色配對，可以揪朋友組隊"],
    ["MBTI 測驗", "平常的人格偏好", "93 / 144 題", "四組人格偏好"],
    ["霍蘭德職涯興趣測驗", "喜歡哪些工作活動", "60 題", "六類興趣與三碼代號"],
    ["費馬職涯測驗", "興趣、工作方式與環境偏好", "94 題", "職涯探索報告"],
  ],
} as const;

export const gta6LandingContent = { en, zh, "zh-TW": tw } as const;
export const gta6AssessmentPaths = [
  "/tests/mbti-personality-test-16-personality-types",
  "/tests/holland-career-interest-test-riasec",
  CAREER_ASSESSMENT_LANDING_PATH,
] as const;

export const gta6AssessmentByRole = {
  "lucia-caminos": 2, "jason-duval": 1, "cal-hampton": 1, "brian-heder": 2,
  "raul-bautista": 2, "boobie-ike": 2, "drequan-priest": 1, "real-dimez": 0,
} as const;

export const gta6SceneByRole = {
  "lucia-caminos": {
    en: "Half the space is gone. You check what still fits and get the first workable setup moving.",
    zh: "场地突然少了一半，你先到现场确认哪块还能用，让第一组人开始布置。",
    "zh-TW": "場地突然少了一半，你先去現場看看哪一塊還能用，讓第一組人先布置。",
  },
  "jason-duval": {
    en: "Plans change just before doors open. You find the teammate still waiting for the original instructions.",
    zh: "入场前临时改了方案，你先找到那个还在按原计划等消息的队友。",
    "zh-TW": "開放入場前臨時改了安排，你先去找還在照原計畫等消息的夥伴。",
  },
  "cal-hampton": {
    en: "The group chat says the party is off. You ask who actually heard it from the venue.",
    zh: "群里传来派对取消的消息，你先问谁亲耳听到了场地方的通知。",
    "zh-TW": "群組都在傳派對取消，你先問有誰直接收到場地方的通知。",
  },
  "brian-heder": {
    en: "A substitute is on the way. You give them the time, the next handoff and one person to call.",
    zh: "临时补位的人已经在路上，你把时间、交接事项和联系人一次说清。",
    "zh-TW": "臨時來幫忙的人已經在路上，你一次講清楚幾點到、要接手什麼、找誰。",
  },
  "raul-bautista": {
    en: "Ten minutes open up between sets. You weigh whether one more song is worth using the spare speaker.",
    zh: "两场演出之间空出十分钟，你掂量一下值不值得用备用音箱再唱一首。",
    "zh-TW": "兩場演出中間多出十分鐘，你衡量要不要接上備用喇叭，再唱一首。",
  },
  "boobie-ike": {
    en: "The venue next door is available. You establish what it costs and what's included before booking.",
    zh: "隔壁说还有地方能租，你先问清多少钱、包含什么，再答应签单。",
    "zh-TW": "隔壁剛好有場地，你先問費用和包含哪些設備，再決定要不要租。",
  },
  "drequan-priest": {
    en: "Only one speaker works. You shorten the set to keep the song the audience came to hear.",
    zh: "只剩一个音箱能用，你缩短节目单，把观众最想听的一首留下。",
    "zh-TW": "只剩一顆喇叭能用，你縮短歌單，把觀眾最想聽的那首留下。",
  },
  "real-dimez": {
    en: "The line is getting restless. You give the crowd a call-and-response they can join right away.",
    zh: "排队的人开始焦躁，你抛出一句大家接得上的口号，让等待的人也能开口。",
    "zh-TW": "排隊的人有點不耐煩，你帶一句大家馬上能接的口號，先讓現場熱起來。",
  },
} as const;
