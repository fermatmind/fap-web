import secondaryReferences from "./secondary-references.json";
import chineseSources from "./source-zh-localization.json";
import { resultCopy, type Text } from "./result-editorial";

export type ArchiveTier = "primary" | "museum_academic" | "reference";
export type SourceReference = { url: string; label: Text; locator: Text; archiveTier: ArchiveTier };

export const historySecondaryReferences: Readonly<Partial<Record<string, SourceReference>>> = secondaryReferences as Record<string, SourceReference>;

type SourceDraft = { url: string; label: string; locator: string };
const institutions: Record<string, [string, string]> = {
  "American Institute of Physics": ["美国物理联合会", "美國物理聯合會"],
  "Biodiversity Heritage Library": ["生物多样性遗产图书馆", "生物多樣性遺產圖書館"],
  "British Library": ["大英图书馆", "大英圖書館"],
  "Bibliothèque nationale de France": ["法国国家图书馆", "法國國家圖書館"],
  "Cambridge University Library": ["剑桥大学图书馆", "劍橋大學圖書館"],
  "Cambridge University Press": ["剑桥大学出版社", "劍橋大學出版社"],
  "Canadian Museum of History": ["加拿大历史博物馆", "加拿大歷史博物館"],
  "Fondation Napoléon": ["拿破仑基金会", "拿破崙基金會"],
  "Library of Congress": ["美国国会图书馆", "美國國會圖書館"],
  "Metropolitan Museum of Art": ["大都会艺术博物馆", "大都會藝術博物館"],
  "NASA Science": ["美国国家航空航天局科学资料库", "美國國家航空暨太空總署科學資料庫"],
  "National Library of Scotland": ["苏格兰国家图书馆", "蘇格蘭國家圖書館"],
  "National Museum of Australia": ["澳大利亚国家博物馆", "澳洲國家博物館"],
  "National Museum of China": ["中国国家博物馆", "中國國家博物館"],
  "National Gallery, London": ["英国国家美术馆", "英國國家美術館"],
  "Project Gutenberg": ["古登堡计划", "古騰堡計畫"],
  "Rijksmuseum": ["荷兰国立博物馆", "荷蘭國家博物館"],
  "Royal Institution": ["英国皇家研究院", "英國皇家研究院"],
  "Royal Museums Greenwich": ["格林尼治皇家博物馆群", "格林威治皇家博物館群"],
  "Science Museum Group": ["英国科学博物馆集团", "英國科學博物館集團"],
  "Smithsonian Institution": ["史密森学会", "史密森學會"],
  "Stanford Encyclopedia of Philosophy": ["斯坦福哲学百科全书", "史丹佛哲學百科全書"],
  "UK Parliament": ["英国议会", "英國國會"],
  "UK Parliament, Historic Hansard": ["英国议会历史辩论记录", "英國國會歷史辯論紀錄"],
  "UNESCO Memory of the World": ["联合国教科文组织世界记忆项目", "聯合國教科文組織世界記憶計畫"],
  "U.S. National Archives": ["美国国家档案馆", "美國國家檔案館"],
  "U.S. National Park Service": ["美国国家公园管理局", "美國國家公園管理局"],
  "Wellcome Collection": ["惠康收藏馆", "威康典藏館"],
  "Wikisource": ["维基文库", "維基文庫"],
  "Assemblée nationale": ["法国国民议会", "法國國民議會"],
  "Sénat": ["法国参议院", "法國參議院"],
};

const localized: Record<string, Partial<SourceReference>> = {
  "alan-turing": {
    label: resultCopy("《心灵》期刊（Mind）", "《心靈》期刊（Mind）", "Mind"),
    locator: resultCopy("〈计算机器与智能〉第 1 节，第 433–434 页", "〈計算機器與智慧〉第 1 節，第 433–434 頁", "Computing Machinery and Intelligence, section 1, pp. 433–434"),
    archiveTier: "primary",
  },
  "frederick-douglass": {
    label: resultCopy("古登堡计划（Project Gutenberg）", "古騰堡計畫（Project Gutenberg）", "Project Gutenberg"),
    locator: resultCopy("《弗雷德里克·道格拉斯自传》第七章，《哥伦比亚演说家》", "《弗雷德里克·道格拉斯自傳》第七章，《哥倫比亞演說家》", "Narrative of the Life of Frederick Douglass, chapter VII, The Columbian Orator"),
    archiveTier: "primary",
  },
  "mary-shelley": {
    label: resultCopy("古登堡计划（Project Gutenberg）", "古騰堡計畫（Project Gutenberg）", "Project Gutenberg"),
    locator: resultCopy("《弗兰肯斯坦》1831 年版作者序，1816 年夏的写作提议", "《科學怪人》1831 年版作者序，1816 年夏的寫作提議", "Frankenstein, author’s introduction to the 1831 edition, summer of 1816 and the story proposal"),
    archiveTier: "primary",
  },
  "marie-curie": {
    label: resultCopy("诺贝尔奖官网（Nobel Prize）", "諾貝爾獎官網（Nobel Prize）", "Nobel Prize"),
    locator: resultCopy("钋与镭的发现，沥青铀矿测量段", "釙與鐳的發現，瀝青鈾礦量測段", "Discovery of polonium and radium, the pitchblende measurements"),
    archiveTier: "museum_academic",
  },
  "xu-xiake": {
    url: "https://zh.wikisource.org/wiki/徐霞客遊記/遊天台山日記",
    label: resultCopy("维基文库（Wikisource）", "維基文庫（Wikisource）", "Wikisource"),
    locator: resultCopy("《徐霞客游记·游天台山日记》，首条癸丑三月晦", "《徐霞客遊記·遊天台山日記》，首條癸丑三月晦", "Travel Diaries of Xu Xiake (Xu Xiake youji), first entry for Mount Tiantai"),
    archiveTier: "primary",
  },
  "du-fu": {
    label: resultCopy("维基文库（Wikisource）", "維基文庫（Wikisource）", "Wikisource"),
    locator: resultCopy("《茅屋为秋风所破歌》，末段", "《茅屋為秋風所破歌》，末段", "Song of My Thatched Cottage Broken by the Autumn Wind (Maowu wei qiufeng suo po ge), final stanza"),
    archiveTier: "primary",
  },
  "william-pitt-1st-earl-of-chatham": {
    url: "https://franklinpapers.org/yale?page=039a&vol=13",
    label: resultCopy("耶鲁大学《富兰克林文集》（The Papers of Benjamin Franklin）", "耶魯大學《富蘭克林文集》（The Papers of Benjamin Franklin）", "The Papers of Benjamin Franklin, Yale University"),
    locator: resultCopy("致威廉·斯特拉恩，1766 年 1 月 14 日下议院演说报道", "致威廉·斯特拉恩，1766 年 1 月 14 日下議院演說報導", "To William Strahan: Report on William Pitt’s Speech in the House of Commons, 14 January 1766"),
    archiveTier: "primary",
  },
  "nicolas-malebranche": {
    url: "https://plato.stanford.edu/archives/spr2020/entries/malebranche/",
    label: resultCopy("斯坦福哲学百科全书（Stanford Encyclopedia of Philosophy）", "史丹佛哲學百科全書（Stanford Encyclopedia of Philosophy）", "Stanford Encyclopedia of Philosophy"),
    locator: resultCopy("〈尼古拉·马勒伯朗士〉，第 1 节《寻求真理》的出版和增补", "〈尼古拉·馬勒伯朗士〉，第 1 節《尋求真理》的出版與增補", "Nicolas Malebranche, section 1, publication and later additions to The Search after Truth"),
    archiveTier: "museum_academic",
  },
  "srinivasa-ramanujan": {
    url: "https://mathshistory.st-andrews.ac.uk/Biographies/Ramanujan/",
    label: resultCopy("圣安德鲁斯大学数学史档案（MacTutor）", "聖安德魯斯大學數學史檔案（MacTutor）", "University of St Andrews, MacTutor History of Mathematics"),
    locator: resultCopy("拉马努金传，1913 年致哈代的第一封信", "拉馬努金傳，1913 年致哈代的第一封信", "Ramanujan biography, first letter to Hardy in 1913"),
    archiveTier: "museum_academic",
  },
  "ulugh-beg": {
    url: "https://doi.org/10.1051/0004-6361/201219596",
    label: resultCopy("《天文学与天体物理学》（Astronomy & Astrophysics）", "《天文學與天體物理學》（Astronomy & Astrophysics）", "Astronomy & Astrophysics"),
    locator: resultCopy("Verbunt 与 van Gent，544 卷 A31，兀鲁伯星表及星座分组", "Verbunt 與 van Gent，544 卷 A31，兀魯伯星表及星座分組", "Verbunt and van Gent, 544, A31, catalogue of Ulugh Beg and constellation counts"),
    archiveTier: "museum_academic",
  },
  "zaha-hadid": {
    url: "https://zhfoundation.com/collections/vitra-fire-station/",
    label: resultCopy("扎哈·哈迪德基金会（Zaha Hadid Foundation）", "札哈·哈蒂基金會（Zaha Hadid Foundation）", "Zaha Hadid Foundation"),
    locator: resultCopy("维特拉消防站，总平面图与沿厂区边界布置说明", "維特拉消防站，基地平面圖與沿廠區邊界配置說明", "Vitra Fire Station, aerial site plan and description of the site's edge"),
    archiveTier: "museum_academic",
  },
  "jons-jacob-berzelius": {
    url: "https://archive.org/details/annalsofphilosop03anna/page/51/mode/2up",
    label: resultCopy("互联网档案馆（Internet Archive），《哲学年鉴》", "網際網路檔案館（Internet Archive），《哲學年鑑》", "Annals of Philosophy, Internet Archive scan"),
    locator: resultCopy("第3卷，1814年1月，第51–52页，第三节〈论化学符号〉", "第3卷，1814年1月，第51–52頁，第三節〈論化學符號〉", "Vol. 3, January 1814, pp. 51–52, section III, On the Chemical Signs"),
    archiveTier: "primary",
  },
  "leonardo-da-vinci": {
    locator: resultCopy("阿伦德尔手稿 Arundel MS 263，反射光线图及凹面镜车床目录条目", "阿倫德爾手稿 Arundel MS 263，反射光線圖及凹面鏡車床目錄條目", "Arundel MS 263, catalogue entries on reflection and the concave mirror lathe"),
    archiveTier: "primary",
  },
  "ernest-rutherford": {
    label: resultCopy("美国物理联合会史料展（AIP）", "美國物理聯合會史料展（AIP）", "American Institute of Physics"),
    locator: resultCopy("α 粒子与原子展区，1911 年论文", "α 粒子與原子展區，1911 年論文", "Alpha Particles and the Atom, Rutherford’s 1911 paper"),
    archiveTier: "museum_academic",
  },
  "wu-zetian": {
    locator: resultCopy("《旧唐书》卷六〈则天皇后〉，九月九日壬午条", "《舊唐書》卷六〈則天皇后〉，九月九日壬午條", "Old Book of Tang (Jiu Tang shu), juan 6, Annals of Empress Zetian, renwu entry of the ninth month"),
    archiveTier: "primary",
  },
  "di-renjie": {
    label: resultCopy("维基文库（Wikisource）", "維基文庫（Wikisource）", "Wikisource"),
    locator: resultCopy("《资治通鉴》卷 206，圣历元年三月，迎还庐陵王段", "《資治通鑑》卷 206，聖曆元年三月，迎還廬陵王段", "Comprehensive Mirror for Aid in Government (Zizhi tongjian), juan 206, third month of Shengli 1, return of the Prince of Luling"),
    archiveTier: "primary",
  },
  "zhuge-liang": {
    url: "https://zh.wikisource.org/wiki/出師表",
    label: resultCopy("维基文库（Wikisource）", "維基文庫（Wikisource）", "Wikisource"),
    locator: resultCopy("《前出师表》，宫中之事与郭攸之、费祎、董允段", "《前出師表》，宮中之事與郭攸之、費禕、董允段", "First Memorial on Dispatching the Troops (Qian chushi biao), passage naming Guo Youzhi, Fei Yi and Dong Yun"),
    archiveTier: "primary",
  },
  "qiu-jin": {
    label: resultCopy("北京市妇女联合会（Beijing Women’s Federation）", "北京市婦女聯合會（Beijing Women’s Federation）", "Beijing Women’s Federation"),
    locator: resultCopy("《中国女报》创刊日期及秋瑾发刊词转载", "《中國女報》創刊日期及秋瑾發刊詞轉載", "China Women’s News (Zhongguo nübao), launch date and reprint of Qiu Jin’s inaugural editorial"),
    archiveTier: "primary",
  },
  "nguyen-trai": {
    label: resultCopy("国立故宫博物院（National Palace Museum）", "國立故宮博物院（National Palace Museum）", "National Palace Museum, Taipei"),
    locator: resultCopy("《故宫文物月刊》第 475 期，第 17 页，《平吴大诰》", "《故宮文物月刊》第 475 期，第 17 頁，《平吳大誥》", "National Palace Museum Monthly, no. 475, p. 17, Great Proclamation on the Pacification of the Wu (Bình Ngô đại cáo)"),
    archiveTier: "museum_academic",
  },
};

export function historySourceReference(personId: string, source: SourceDraft): SourceReference {
  const chinese = (chineseSources as Readonly<Partial<Record<string, { label: readonly string[]; locator: readonly string[] }>>>)[personId];
  const names = chinese?.label ?? institutions[source.label];
  const label = names
    ? resultCopy(`${names[0]}（${source.label}）`, `${names[1]}（${source.label}）`, source.label)
    : resultCopy(source.label, source.label, source.label);
  return {
    url: source.url,
    label,
    locator: chinese
      ? resultCopy(chinese.locator[0], chinese.locator[1], source.locator)
      : resultCopy(source.locator, source.locator, source.locator),
    archiveTier: "reference",
    ...localized[personId],
  };
}
