import { resultCopy as copy, type Text } from "./result-editorial";
import type { HistoryAxisName } from "./reference";
import type { SourceReference } from "./source-reference";

export type ProfileEvidence = {
  year: number | Text;
  title: Text;
  fact: Text;
  interpretation: Text;
  axes: readonly HistoryAxisName[];
  source: SourceReference;
  pendingLocator?: true;
};

type ProfileExpansion = {
  evidence: readonly ProfileEvidence[];
  question: Text;
  answer: Text;
};

export const historyProfileExpansions: Readonly<Partial<Record<string, ProfileExpansion>>> = {
  "leonardo-da-vinci": {
    evidence: [{
      year: 1481,
      title: copy("接受圣多纳托祭坛画委托", "接受聖多納托祭壇畫委託", "Accept a commission for the San Donato altarpiece"),
      fact: copy(
        "1481 年，佛罗伦萨附近圣多纳托教堂的奥古斯丁会修士委托达·芬奇制作祭坛画。作品以《三博士来朝》为题。达·芬奇离开佛罗伦萨前往米兰，画板没有完成。乌菲齐同时保存了费利皮诺·利皮后来为同一祭坛完成的版本。",
        "1481 年，佛羅倫斯近郊聖多納托教堂的奧古斯丁會修士委託達文西製作祭壇畫，題為《三博士來朝》。達文西離開佛羅倫斯前往米蘭，畫板未完成。烏菲茲也收藏了菲利皮諾·利皮後來為同一座祭壇完成的版本。",
        "In 1481 the Augustinian friars of San Donato in Scopeto, near Florence, commissioned Leonardo to make an altarpiece of the Adoration of the Magi. Leonardo left for Milan before finishing the panel. The Uffizi also holds the version made later for the same altar by Filippino Lippi.",
      ),
      interpretation: copy(
        "这项委托留下了可以对照的工作条件：由教堂确定用途，画家处理同一主题，最后更换了交付者。未完成的画板能用来观察制作中的选择，单凭它无法判断画家平时交付作品的节奏，也不能判断他是否偏好独处。",
        "這項委託留下了可比對的工作條件：用途由教堂決定，畫家處理相同主題，最後由另一位畫家完成委託。未完成的畫板可供觀察製作過程，單憑這件作品無法推定他平日交件的節奏或是否偏好獨處。",
        "The two versions preserve the terms of a useful comparison: one church, one theme, and two artists working at different times. Leonardo’s unfinished panel offers material for studying choices made during production. It cannot tell us how often he delivered work on schedule or whether he preferred to work alone.",
      ),
      axes: ["Pace", "Collaboration"],
      source: {
        url: "https://www.uffizi.it/en/events/leonardo-s-magic-cosmos-the-adoration-of-the-magi-restored",
        label: copy("乌菲齐美术馆（Uffizi Galleries）", "烏菲茲美術館（Uffizi Galleries）", "Uffizi Galleries"),
        locator: copy("《三博士来朝》修复展，1481 年原委托及利皮后续委托", "《三博士來朝》修復展，1481 年原委託及利皮後續委託", "The Adoration of the Magi restored, the 1481 commission and Lippi’s subsequent commission"),
        archiveTier: "museum_academic",
      },
    }],
    question: copy("达·芬奇为什么没有完成《三博士来朝》？", "達文西的《三博士來朝》為什麼沒有畫完？", "Why did Leonardo leave the Adoration of the Magi unfinished?"),
    answer: copy("乌菲齐把中断放在他离开佛罗伦萨前往米兰的经历中。教堂后来另请利皮为同一祭坛作画。这两件馆藏可用来核查委托历史，无法据此判断他的性格。", "烏菲茲把作品中斷放在他離開佛羅倫斯前往米蘭的脈絡中。教堂後來另請利皮為同一座祭壇作畫。兩件館藏可用來查證委託經過，無法據此判定他的性格。", "The Uffizi traces the interruption to Leonardo’s move from Florence to Milan. The church commissioned Lippi to paint for the same altar later. The two objects document the history of the commission without establishing a psychological cause."),
  },
  "ernest-rutherford": {
    evidence: [{
      year: 1908,
      title: copy("用多项检验追查 α 粒子的物质身份", "以多項檢驗追查 α 粒子的物質身分", "Check the chemical identity of alpha particles with several measurements"),
      fact: copy(
        "卢瑟福在诺贝尔演讲中回顾了不同做法。他与盖革合作计数，并用 α 粒子是氦原子的假设推算应出现多少氦。他也讲述与罗伊兹把 α 粒子隔离收集，最后检查容器内气体的光谱。这两种检验指向同一个问题，读出的现象各不相同。",
        "拉塞福在諾貝爾演講中回顧不同做法。他與蓋革合作計數，並以 α 粒子是氦原子的假設推算應產生多少氦。他也敘述與羅伊茲將 α 粒子隔離收集，最後檢查容器內氣體的光譜。兩種檢驗追問同一個問題，讀出的現象各不相同。",
        "In his Nobel lecture, Rutherford reviewed several lines of testing. Work with Hans Geiger counted particles and used the helium hypothesis to calculate an expected volume of gas. In a separate experiment with Thomas Royds, alpha particles were collected in isolation and the accumulated gas was examined by its spectrum. The counts and the spectrum addressed the same hypothesis using different observations.",
      ),
      interpretation: copy(
        "1908 年材料呈现研究者怎样设计相互校验的办法，并与不同同事分工。1911 年散射问题追问的是原子内部怎样分布电荷。并读两项工作，可以看见验证方式怎样随问题改变，也能区分合作实验与提出模型各自涉及的贡献。",
        "1908 年的材料呈現研究者如何安排可相互查核的做法，並與不同同事分工。1911 年的散射問題追問原子內部的電荷分布。兩項工作合讀，可看出檢驗方式如何隨問題改變，也能區分合作實驗和提出模型各自涉及的貢獻。",
        "The 1908 record shows how experiments with different collaborators could be used to check one another. The 1911 scattering paper asked a different question about charge distribution inside the atom. Together they document the difference between selecting measurements for a hypothesis and proposing a model for an unexpected observation.",
      ),
      axes: ["Inquiry", "Collaboration"],
      source: {
        url: "https://www.nobelprize.org/prizes/chemistry/1908/rutherford/lecture/",
        label: copy("诺贝尔奖官网（Nobel Prize）", "諾貝爾獎官網（Nobel Prize）", "Nobel Prize"),
        locator: copy("1908 年 12 月 11 日演讲，计数推算及与罗伊兹的光谱检验", "1908 年 12 月 11 日演講，計數推算及與羅伊茲的光譜檢驗", "Nobel Lecture, 11 December 1908, calculations from particle counts and the spectrum experiment with Royds"),
        archiveTier: "primary",
      },
    }],
    question: copy("1908 年的诺贝尔演讲和 1911 年的散射论文回答的是同一个问题吗？", "1908 年的諾貝爾演講與 1911 年散射論文探討的是同一件事嗎？", "What did Rutherford’s Nobel lecture establish that the 1911 scattering paper did not address?"),
    answer: copy("演讲回顾 α 粒子与氦的关系。散射论文则用少数粒子大角度偏转来约束原子的电荷结构。两个问题涉及同一种粒子，所检验的假设不同。", "演講回顧 α 粒子與氦的關係，散射論文用少數粒子的大角度偏折來約束原子的電荷結構。兩項工作涉及同一種粒子，檢驗的假設不同。", "The lecture reviews evidence identifying alpha particles with helium. The paper uses rare large-angle scattering events to constrain a model of atomic charge. The same particle is used to answer two different questions."),
  },
  "wu-zetian": {
    evidence: [{
      year: 700,
      title: copy("命使臣胡超赴嵩山投送金简", "命使臣胡超赴嵩山投送金簡", "Send the emissary Hu Chao to deposit a gold tablet at Mount Song"),
      fact: copy(
        "河南博物院藏武则天金简，铭文以大周国主武曌记名，并写明命小使臣胡超投简，向道教三官九府祈求除罪。落款是庚子年七月七日，即公元 700 年。藏品 1982 年发现于嵩山峻极峰。",
        "河南博物院收藏的武則天金簡以大周國主武曌記名，並寫明命小使臣胡超投簡，向道教三官九府祈求除罪。落款為庚子年七月七日，即西元 700 年。這件藏品於 1982 年在嵩山峻極峰發現。",
        "The gold tablet held by Henan Museum names Wu Zhao as sovereign of the Great Zhou and records that the envoy Hu Chao was instructed to deposit it. The inscription petitions Daoist officials for remission of transgressions. It is dated to the seventh day of the seventh lunar month in 700. The tablet was found on Mount Song’s Junji Peak in 1982.",
      ),
      interpretation: copy(
        "金简提供另一种运用名号的场景。690 年本纪把朝廷变更连成一组政令，十年后的铭刻则把国号、人名、使臣和仪式请求写在同一物件上。两条证据能用来区分公开改制与经由使者办理的祈请，对武则天内心的宗教信念仍有解释空间。",
        "金簡呈現使用名號的另一個場合。690 年本紀把朝廷變更記成一組政令，十年後的銘刻則把國號、人名、使臣與儀式請求寫在同一件物品上。兩項證據可用來區分公開改制與透過使者辦理的祈請。武則天個人的宗教信念仍有解讀空間。",
        "The tablet preserves the use of a sovereign title in a different setting. The annals group court-wide changes in 690, whereas the inscription ten years later puts a title, an envoy and a ritual request together on one object. That contrast helps distinguish a public institutional transition from a petition performed through an emissary. The inscription leaves room for interpretation about her personal beliefs.",
      ),
      axes: ["Collaboration", "Influence"],
      source: {
        url: "https://www.chnmus.net/ch/collection/treasure/details.html?id=508161850642982087",
        label: copy("河南博物院（Henan Museum）", "河南博物院（Henan Museum）", "Henan Museum"),
        locator: copy("武则天金简，铭文与出土说明", "武則天金簡，銘文與出土說明", "Wu Zetian’s gold tablet: inscription and findspot"),
        archiveTier: "primary",
      },
    }],
    question: copy("武则天金简能核实她使用过哪些称谓吗？", "武則天金簡上可查證哪些名號？", "What does the Mount Song gold tablet call Wu Zetian?"),
    answer: copy("金简把武曌称为大周国主，同时写出受命投简的使臣胡超。它提供了 700 年这一件物品上的直接证据，可与《旧唐书》记载的 690 年改国号对读。", "金簡將武曌稱為大周國主，並記下受命投簡的使臣胡超。這是西元 700 年一件物品上的直接證據，可和《舊唐書》所記 690 年改國號的條目對讀。", "The tablet calls her Wu Zhao, sovereign of the Great Zhou, and names the envoy Hu Chao. The artifact dates to 700 and can be read alongside the Old Book of Tang’s record of the change of dynastic name in 690."),
  },
};
