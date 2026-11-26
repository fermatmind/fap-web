import evidenceAxes from "./decision-evidence-axes.json";
import { historyAxes } from "./questions";
import { resultCopy, type Text } from "./result-editorial";

export const historyReferenceRevision = "2026-11-25";
export type HistoryAxisName = (typeof historyAxes)[number]["en"];
export const historyDecisionAxes: Readonly<Partial<Record<string, readonly string[]>>> = evidenceAxes;

type Reference = { title: Text; url: string; locator: Text };
export type AlternativeReading = Reference & { rationale: Text };

type ProfileNotes = {
  originalName?: string;
  primaryWork?: Reference;
  synthesis?: Text;
  typeAnswer?: Text;
  alternatives?: readonly AlternativeReading[];
};

export const historyProfileNotes: Readonly<Partial<Record<string, ProfileNotes>>> = {
  "leonardo-da-vinci": {
    primaryWork: {
      title: resultCopy("《阿伦德尔手稿》", "《阿倫德爾手稿》", "The Codex Arundel"),
      url: "https://searcharchives.bl.uk/catalog/040-002039546",
      locator: resultCopy("大英图书馆馆藏 Arundel MS 263", "大英圖書館館藏 Arundel MS 263", "British Library, Arundel MS 263"),
    },
    alternatives: [{
      url: "https://www.wallraf.museum/en/collections/prints-drawings/masterpieces/leonardo-da-vinci-figure-study-for-the-adoration-of-the-magi/the-highlight/",
      title: resultCopy("瓦尔拉夫博物馆：祭坛画人物习作", "瓦爾拉夫博物館：祭壇畫人物習作", "Wallraf-Richartz-Museum: Figure Study for the Adoration of the Magi"),
      locator: resultCopy("馆藏人物习作说明", "館藏人物習作說明", "Collection commentary on the figure study"),
      rationale: resultCopy(
        "大英图书馆手稿支持从光学及机械设计理解达·芬奇。瓦尔拉夫博物馆把人物习作放回祭坛画的构图过程，更适合解释他如何为已确定的委托准备细节。两种材料留下的工作场景不同，对内向或外向都没有直接证据。",
        "大英圖書館手稿支持從光學與機械設計理解達文西。瓦爾拉夫博物館把人物習作放回祭壇畫的構圖過程，更適合解釋他如何為已確定的委託準備細節。兩種材料記下不同工作場合，皆無法直接判定內向或外向。",
        "The British Library notebook provides evidence about optics and mechanical design. The Wallraf study instead places Leonardo within the practical preparation of an altarpiece. These settings document different activities and provide no direct test of introversion or extraversion.",
      ),
    }],
    synthesis: resultCopy(
      "传记解读着重于达·芬奇如何在观察现象与设计工具之间转换问题。手稿为跨领域工作提供了具体例子，对其社交偏好所能说明的很少。",
      "傳記解讀著重達文西如何在觀察現象與設計工具之間轉換問題。手稿為跨領域工作提供具體例子，對社交偏好的解釋力有限。",
      "The reading emphasizes Leonardo’s ability to move between observing a phenomenon and designing a tool. The notebook documents cross-field work and says little about his social preferences.",
    ),
    typeAnswer: resultCopy(
      "费马暂读作 INTP。可核查的依据之一是光学草图与制镜设计；它们支持讨论他怎样组织问题，无法单独判定四个字母。",
      "費馬暫讀為 INTP。可查證的依據之一是光學草圖與製鏡設計；它們可用來討論他如何組織問題，無法單獨判定四個字母。",
      "FermatMind provisionally uses INTP. Optical drawings and mirror-making designs support a reading of how Leonardo organized problems, with limited evidence for the full four-letter type.",
    ),
  },
  "ernest-rutherford": {
    primaryWork: {
      title: resultCopy("《物质对 α 和 β 粒子的散射与原子结构》", "《物質對 α 與 β 粒子的散射與原子結構》", "The Scattering of α and β Particles by Matter and the Structure of the Atom"),
      url: "https://doi.org/10.1080/14786440508637080",
      locator: resultCopy("1911 年，《Philosophical Magazine》21 卷，669–688 页", "1911 年，《Philosophical Magazine》21 卷，669–688 頁", "Philosophical Magazine 21 (1911), 669–688"),
    },
    alternatives: [{
      url: "https://www.nobelprize.org/prizes/chemistry/1908/rutherford/lecture/",
      title: resultCopy("卢瑟福：1908 年诺贝尔演讲", "拉塞福：1908 年諾貝爾演講", "Rutherford’s 1908 Nobel lecture"),
      locator: resultCopy("计数法和光谱检验两段", "計數法與光譜檢驗兩段", "Particle counts and the spectrum experiment"),
      rationale: resultCopy(
        "散射论文很容易让读者只记住他改变原子模型的一刻。1908 年的自述提供另一重点：他花了数年和不同同事交叉检查现象。两种材料合读，才能区分富于假设的探索与严密的重复检验。这份演讲没有提供对其他 MBTI 类型的测量。",
        "散射論文容易讓讀者只記住他改變原子模型的時刻。1908 年自述提供另一個重點：他花了數年與不同同事交叉查核現象。兩項材料合讀，才能區分提出假設與重複檢驗。這份演講沒有提供其他 MBTI 類型的測量。",
        "A reading centered on the scattering paper emphasizes the model change. Rutherford’s own 1908 account instead emphasizes years of checks with different colleagues. Together the records help explain the research process. They provide no independent measurement of a competing MBTI type.",
      ),
    }],
    synthesis: resultCopy(
      "卢瑟福的传记画像把提出可检验的解释放在核心位置。散射论文让这种研究选择可被核对，个人在其他场合的作法仍需另找证据。",
      "拉塞福的傳記畫像以提出可檢驗的解釋為核心。散射論文讓這項研究選擇可以查證，個人在其他場合的做法仍需另找證據。",
      "This reading gives weight to proposing explanations that can be tested. The scattering paper makes that research choice traceable. Other settings would require separate evidence.",
    ),
    typeAnswer: resultCopy(
      "费马暂读作 ENTP。1911 年论文显示卢瑟福怎样用新的原子模型处理散射难题；这条史实主要支持对探索方法的讨论。",
      "費馬暫讀為 ENTP。1911 年論文顯示拉塞福如何用新的原子模型處理散射難題；這項史實主要支持對探索方法的討論。",
      "FermatMind provisionally uses ENTP. Rutherford’s 1911 model addressed a scattering problem, which chiefly informs the inquiry dimension of this reading.",
    ),
  },
  "wu-zetian": {
    originalName: "武曌",
    primaryWork: {
      title: resultCopy("《旧唐书》卷六〈则天皇后〉", "《舊唐書》卷六〈則天皇后〉", "Old Book of Tang, juan 6, Annals of Empress Zetian"),
      url: "https://zh.wikisource.org/zh-hant/%E8%88%8A%E5%94%90%E6%9B%B8_%28%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC%29/%E5%8D%B7006",
      locator: resultCopy("载初元年正月自名条及九月九日壬午条", "載初元年正月自名條及九月九日壬午條", "Zaichu year 1: the first-month name entry and ninth-month renwu entry"),
    },
    alternatives: [{
      url: "https://whc.unesco.org/en/list/1003",
      title: resultCopy("联合国教科文组织：龙门石窟", "聯合國教科文組織：龍門石窟", "UNESCO World Heritage Centre: Longmen Grottoes"),
      locator: resultCopy("遗产说明，奉先寺与唐代皇家造像", "遺產說明，奉先寺與唐代皇家造像", "Statement of Outstanding Universal Value, Fengxiansi and Tang royal cave art"),
      rationale: resultCopy(
        "从《旧唐书》本纪切入，问题是武则天怎样改变朝廷制度。龙门遗产说明把奉先寺置于帝室支持佛教造像的历史中。它描绘的是另一个公共制度场景，和金简呈现的祈请场景不可直接合并成一条个人信仰结论。",
        "從《舊唐書》本紀切入，問題是武則天如何改變朝廷制度。龍門遺產說明把奉先寺置於帝室支持佛教造像的歷史中。它描繪另一個公共制度場合，無法和金簡的祈請直接合併成一條個人信仰結論。",
        "The Old Book of Tang directs attention to institutional change at court. The UNESCO account places Fengxiansi within the history of royal Buddhist art. That institutional setting and the ritual petition on the gold tablet offer distinct perspectives. Combining them does not establish a single account of Wu’s personal beliefs.",
      ),
    }],
    synthesis: resultCopy(
      "武则天的传记画像着眼于制度安排。国号、纪年和政令同时调整，说明她在这一次权力转换中怎样组织变更，不能据此推定她处处采取同一方式。",
      "武則天的傳記畫像著眼於制度安排。國號、紀年和政令同時調整，說明她在這次權力轉換中如何組織變更，不能據此推定她處處採用同一方式。",
      "The reading emphasizes institutional choices. Changes to the dynastic name, dating system and official orders illustrate how Wu structured one political transition. Her approach in other settings remains a separate question.",
    ),
    typeAnswer: resultCopy(
      "费马暂读作 ENTJ。690 年改国号与改元是可核查的例子，主要为她如何推动制度转变提供线索。",
      "費馬暫讀為 ENTJ。690 年改國號與改元是可查證的例子，主要為她如何推動制度轉變提供線索。",
      "FermatMind provisionally uses ENTJ. The changes to the dynastic title and reign name in 690 offer a checkable instance of institutional change.",
    ),
  },
};

export const listedWithoutCoxEstimate = new Set(["william-shakespeare"]);

const historyRegionParents: readonly [RegExp, RegExp][] = [
  [/^(亚洲|亞洲|asia)$/u, /^(?:东亚|東亞|东南亚|東南亞|南亚|南亞|西亚|西亞|中亚|中亞|east asia|southeast asia|south asia|south and southeast asia|west asia|central asia|west and central asia(?:, and north africa)?)$/u],
  [/^(欧洲|歐洲|europe)$/u, /^(?:西欧|西歐|东欧|東歐|南欧|南歐|北欧|北歐|中欧|中歐|(?:western|eastern|southern|northern|central) europe)$/u],
  [/^(美洲|america|americas|the americas)$/u, /^(?:北美(?:洲)?|南美(?:洲)?|中美(?:洲)?|拉丁美洲(?:与加勒比地区|與加勒比地區)?|(?:north|south|central) america|latin america(?: and the caribbean)?)$/u],
  [/^(非洲|africa)$/u, /^(?:北非|东非|東非|西非|中非|南部非洲|(?:north|east|west|central|southern|sub-saharan) africa|west and central asia, and north africa)$/u],
];

export function historyEraAndRegion(era: string, region: string) {
  const parts = `${era} · ${region}`.split(/\s*[·・]\s*/u).map(part => part.trim()).filter(Boolean);
  const unique = new Map<string, string>();
  for (const part of parts) {
    const normalized = part.normalize("NFKC").toLowerCase();
    if (!unique.has(normalized)) unique.set(normalized, part);
  }
  return [...unique].filter(([name]) => !historyRegionParents.some(([parent, child]) =>
    parent.test(name) && [...unique.keys()].some(candidate => child.test(candidate)),
  )).map(([, display]) => display).join(" · ");
}

export function historyReferenceCitation(title: string, url: string, formatLabel: string) {
  const [year] = historyReferenceRevision.split("-");
  return {
    APA: `FermatMind. (${year}). ${title} [${formatLabel}]. ${url}`,
    Chicago: `FermatMind. ${year}. “${title}.” ${formatLabel}. ${url}.`,
    Markdown: `[${title}](${url}) — FermatMind (${year})`,
  };
}
