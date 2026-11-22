import cox from "./cox-estimates.json";
import { historyPeople, type HistoryPerson } from "./people";
import { historyAxes } from "./questions";
import { batchEditorial, resultCopy, type Editorial, type Text } from "./result-editorial";
import { coxEditorial } from "./result-editorial-cox";
import { existingEditorial01 } from "./result-editorial-existing-01";
import { existingEditorial02 } from "./result-editorial-existing-02";
import { existingEditorial03 } from "./result-editorial-existing-03";
import { existingEditorial04 } from "./result-editorial-existing-04";
import { existingEditorial05 } from "./result-editorial-existing-05";
import { existingEditorial06 } from "./result-editorial-existing-06";
import { existingEditorial07 } from "./result-editorial-existing-07";
import { existingEditorial08 } from "./result-editorial-existing-08";
import { existingEditorial09 } from "./result-editorial-existing-09";

export { resultCopy };

type CoxEstimate = {
  name: string;
  dates: string;
  table: string;
  sheet_row: string;
  childhood_corrected: number;
  youth_corrected: number;
  person_id: string | null;
};

export const coxStudy = "https://gwern.net/doc/iq/high/1926-cox-theearlymentaltraitsof300geniuses.pdf#page=77";
export const coxTranscription = cox.source;
const estimates = new Map<string, Readonly<CoxEstimate>>();
for (const entry of Object.values(cox.entries)) {
  if (entry.person_id) estimates.set(entry.person_id, entry);
}
export const getCoxEstimate = (id: string) => estimates.get(id);

type Benchmark = { has_cox_data: true; estimate: Readonly<CoxEstimate> } | { has_cox_data: false; cognitive_gift_tag: Text };
export const historyBatchEditorial: Readonly<Record<string, Editorial>> = {
  ...batchEditorial,
  ...existingEditorial01,
  ...existingEditorial02,
  ...existingEditorial03,
  ...existingEditorial04,
  ...existingEditorial05,
  ...existingEditorial06,
  ...existingEditorial07,
  ...existingEditorial08,
  ...existingEditorial09,
  ...coxEditorial,
};

const editorial: Readonly<Partial<Record<string, Editorial>>> = {
  ...historyBatchEditorial,
  "isaac-newton": {
    archetype_title: resultCopy("孤岛上的宇宙立法者", "孤島上的宇宙立法者", "The Universe’s Lone Lawmaker"),
    one_line_hook: resultCopy("你不怕没答案，就怕全场点头太快。", "你不怕沒答案，就怕全場點頭太快。", "A room full of nods is your cue to check the math."),
    superpower: resultCopy(
      "你擅长把吵成一团的问题拆成能动手验证的细节。别人看见一束白光，你会让它穿过棱镜，再想办法把颜色合回去。解释再漂亮，也得过你手里那道复验关。",
      "你擅長把吵成一團的問題拆成能動手驗證的細節。別人看見一束白光，你會讓它穿過稜鏡，再想辦法把顏色合回去。解釋再漂亮，也得過你手裡那道複驗關。",
      "You turn a roomful of theories into something you can test. Give you a beam of white light and you’ll split it with a prism, then find a way to put the colors back together. A tidy explanation only earns your trust once the experiment holds up.",
    ),
    quirk_or_blindspot: resultCopy(
      "你一旦想追到答案，容易忘记给自己留条安全线。牛顿在《论颜色》手稿里画下用钝针压迫眼球时看见的彩色圆环。实验做得够细，拿自己当器材的代价也够大。",
      "你一旦想追到答案，容易忘記給自己留條安全線。牛頓在《論顏色》手稿裡畫下用鈍針壓迫眼球時看見的彩色圓環。實驗做得夠細，拿自己當器材的代價也夠大。",
      "Once you’re chasing an answer, you can forget to leave yourself a safety margin. In Of Colours, Newton sketched the colored rings he saw after pressing a blunt instrument against his eye. He kept meticulous notes, even when the equipment was his own body.",
    ),
    tags: resultCopy(["单兵作战", "实锤优先", "复验上瘾"], ["單兵作戰", "證據優先", "複驗上癮"], ["Solo Mode", "Receipts First", "Run It Again"]),
    personality_benchmark: {
      inferred_mbti: "INTJ", title: resultCopy("战略家", "策略家", "Strategist"), tendencies: [88, 92, 95, 84],
      big_five_traits: resultCopy(["高尽责性", "高开放性", "低宜人性"], ["高盡責性", "高開放性", "低親和性"], ["High conscientiousness", "High openness", "Low agreeableness"]),
    },
    era: resultCopy("欧洲 · 17世纪", "歐洲 · 17世紀", "Europe · 17th century"),
    years: [1643, 1727],
    source: "https://www.newtonproject.ox.ac.uk/view/texts/normalized/NATP00004?end=par64&start=par62",
    accent: "#c7ff74",
  },
  "li-bai": {
    cognitive_gift_tag: resultCopy("意象联想与语言创造力", "意象聯想與語言創造力", "Poetic association & invention"),
    fieldPeers: ["du-fu", "su-shi", "rabindranath-tagore"],
    archetype_title: resultCopy("盛唐月光下的浪漫狂客", "盛唐月光下的浪漫狂客", "The Tang Dynasty’s Moonlight Rebel"),
    one_line_hook: resultCopy("别人说「散了吧」，你给月亮留了个座。", "別人說「散了吧」，你給月亮留了個位子。", "Everyone else calls it a night. You pull up a chair for the moon."),
    superpower: resultCopy(
      "你随手一牵，就能把八竿子打不着的东西拉进同一个场景。月亮可以赴约，影子也能举杯。别人眼里冷掉的饭局，到你这儿能变成一首让人记了一千多年的诗。",
      "你隨手一牽，就能把八竿子打不著的東西拉進同一個場景。月亮可以赴約，影子也能舉杯。別人眼裡冷掉的飯局，到你這兒能變成一首讓人記了一千多年的詩。",
      "You have a knack for getting unlikely things into the same room. The moon gets an invitation, the shadow gets a glass. What looked like a dead evening becomes a scene people are still reading about a thousand years later.",
    ),
    quirk_or_blindspot: resultCopy(
      "你很会把缺席写成热闹，也容易忘记真正的邀约要开口。《月下独酌》里，李白请月亮和影子凑成三人局，又写月亮不会喝酒、影子只会跟着他。它们可没法回请。",
      "你很會把缺席寫成熱鬧，也容易忘記真正的邀約要開口。《月下獨酌》裡，李白請月亮和影子湊成三人局，又寫月亮不會喝酒、影子只會跟著他。它們可沒法回請。",
      "You’re so good at turning absence into company that you can forget to call a real friend. In Drinking Alone Under the Moon, Li Bai makes a party of three with the moon and his shadow. The moon can’t drink. The shadow can only follow. Neither can invite him back.",
    ),
    tags: resultCopy(["月亮搭子", "随手组局", "另开一条路"], ["月亮搭檔", "隨手揪團", "另開一條路"], ["Moon for Company", "Instant Party", "Off the Map"]),
    personality_benchmark: {
      inferred_mbti: "ENFP", title: resultCopy("灵感召集人", "靈感召集人", "Spark Starter"), tendencies: [73, 92, 77, 90],
      big_five_traits: resultCopy(["高开放性", "高外倾性", "低尽责性"], ["高開放性", "高外向性", "低盡責性"], ["High openness", "High extraversion", "Low conscientiousness"]),
    },
    era: resultCopy("亚洲 · 盛唐", "亞洲 · 盛唐", "Asia · High Tang"),
    years: [701, 762],
    source: "https://afe.easia.columbia.edu/ps/china/libo_selected.pdf",
    accent: "#f6c766",
  },
};

const neutralLabel = resultCopy("视情况而定", "視情況而定", "Depends on the situation");

const dimensionLabels = {
  Pace: {
    low: resultCopy("开局先算三步", "開局先算三步", "Three Moves Ahead"),
    neutral: resultCopy("看场面决定节奏", "看場面決定節奏", "Read the Room First"),
    high: resultCopy("先走再画地图", "先走再畫地圖", "Map It on the Move"),
  },
  Collaboration: {
    low: resultCopy("单兵作战狂魔", "單兵作戰狂魔", "Solo by Default"),
    neutral: resultCopy("单刷组队都能打", "單刷組隊都能打", "Solo or Squad"),
    high: resultCopy("一开口就组局", "一開口就揪團", "Get the Crew Together"),
  },
  Inquiry: {
    low: resultCopy("没实锤别催我", "沒證據別催我", "Show Me the Evidence"),
    neutral: resultCopy("证据和脑洞都上桌", "證據和點子都上桌", "Ideas and Evidence"),
    high: resultCopy("先抛个大胆假设", "先提個大膽假設", "Lead with a Wild Hypothesis"),
  },
  Scope: {
    low: resultCopy("一个坑挖到底", "一個坑挖到底", "Follow One Thread Deep"),
    neutral: resultCopy("深挖串门随题切换", "深挖串門隨題切換", "Zoom In or Out"),
    high: resultCopy("跨界拼图手", "跨界拼圖手", "Cross-Field Connector"),
  },
  Change: {
    low: resultCopy("旧系统改造派", "舊系統改造派", "System Tinkerer"),
    neutral: resultCopy("修补还是重做，看现场", "修補還是重做，看現場", "Patch or Rebuild"),
    high: resultCopy("没路就另开一条", "沒路就另開一條", "Make a New Route"),
  },
  Influence: {
    low: resultCopy("幕后把事推成", "幕後把事推成", "Make It Happen Offstage"),
    neutral: resultCopy("台前幕后看场合", "臺前幕後看場合", "Onstage or Offstage"),
    high: resultCopy("拿成果上台", "拿成果上臺", "Take the Stage"),
  },
} satisfies Record<(typeof historyAxes)[number]["en"], Record<"low" | "neutral" | "high", Text>>;

export function getHistoryResult(person: HistoryPerson) {
  const sample = editorial[person.id];
  if (!sample) return undefined;
  const estimate = getCoxEstimate(person.id);
  const iq_benchmark: Benchmark | undefined = estimate
    ? { has_cox_data: true, estimate }
    : sample.cognitive_gift_tag && { has_cox_data: false, cognitive_gift_tag: sample.cognitive_gift_tag };
  if (!iq_benchmark) return undefined;
  return {
    ...sample, iq_benchmark,
    number: String(historyPeople.findIndex(({ id }) => id === person.id) + 1).padStart(3, "0"),
    six_dimensions: historyAxes.map((axis, index) => {
      const score = person.vector[index];
      const direction = score < 3 ? "low" : score > 3 ? "high" : "neutral";
      return {
        axis, score, labels: dimensionLabels[axis.en][direction],
        baseline: direction === "neutral" ? neutralLabel : axis[direction],
      };
    }),
  };
}

export function historyVectorDistance(left: readonly number[], right: readonly number[]) {
  return left.reduce((sum, score, i) => sum + (score - right[i]) ** 2, 0);
}

export function historyResultPeers(person: HistoryPerson) {
  const others = historyPeople.filter(({ id }) => id !== person.id);
  const estimate = getCoxEstimate(person.id);
  const fieldPeers = editorial[person.id]?.fieldPeers ?? [];
  const distances = others.map(item => ({ item, distance: historyVectorDistance(person.vector, item.vector) }));
  distances.sort((a, b) => a.distance - b.distance || a.item.id.localeCompare(b.item.id, "en"));
  const diverse = distances.filter(({ item }) => item.region.en !== person.region.en || item.field.en !== person.field.en).slice(0, 2);
  const closest = [...diverse, ...distances.filter(row => !diverse.includes(row))].slice(0, 3)
    .sort((a, b) => a.distance - b.distance).map(({ item }) => item);
  const benchmark = estimate
    ? others.flatMap(item => {
      const peer = getCoxEstimate(item.id);
      return peer ? [{ item, gap: Math.abs(peer.youth_corrected - estimate.youth_corrected) }] : [];
    }).sort((a, b) => a.gap - b.gap || a.item.id.localeCompare(b.item.id, "en")).slice(0, 3).map(({ item }) => item)
    : others.filter(item => item.field.en === person.field.en).sort((a, b) => {
      const rank = (id: string) => fieldPeers.includes(id) ? fieldPeers.indexOf(id) : fieldPeers.length;
      return rank(a.id) - rank(b.id);
    }).slice(0, 3);
  return { benchmark, closest, opposite: distances.slice(-2).reverse().map(({ item }) => item) };
}

export const historyPosterCopy = {
  series: resultCopy("费马测试 / 全球卷", "費馬測試 / 全球卷", "FERMATMIND / WORLD EDITION"),
  cox: resultCopy("Cox 青年 IQ 估值", "Cox 青年 IQ 估值", "COX YOUTH IQ ESTIMATE"),
  gift: resultCopy("核心认知天赋", "核心認知天賦", "COGNITIVE GIFT"),
  personality: resultCopy("传记人格", "傳記人格", "BIOGRAPHICAL TYPE"),
  scan: resultCopy("扫码测你的历史同频人物", "掃碼測你的歷史同頻人物", "Scan to meet your historical match"),
};
