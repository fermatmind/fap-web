import type { GeoEditorial } from "./geo-editorial";
import { resultCopy as copy } from "./result-editorial";

export const wave09Editorial = {
  "thomas-jefferson": {
    summary: copy("美国政治家托马斯·杰斐逊起草《独立宣言》，并保留委员会版本的抄本。费马据此作INTJ传记解读。Cox 两期修正值均为160。", "美國政治家湯瑪斯·傑佛遜起草《獨立宣言》，並留下委員會版本的抄本。費馬據此作INTJ傳記解讀。Cox 兩期修正值皆為160。", "American statesman Thomas Jefferson drafted the Declaration of Independence and kept a copy of the committee’s version. FermatMind’s editorial INTJ reading considers the choice to preserve an earlier text alongside the adopted outcome. Cox’s historical corrected estimates for Jefferson were 160 in both developmental periods covered."),
    decision: {
      year: 1776,
      title: copy("留下提交国会前的文本版本", "留下提交國會前的文本版本", "Preserve the text as it stood before congressional revision"),
      fact: copy("普林斯顿大学杰斐逊文献项目指出，宣言通过后，杰斐逊给友人寄送了显示委员会提交版本的抄本。", "普林斯頓大學的傑佛遜文獻計畫指出，宣言通過後，傑佛遜寄給友人的抄本保留了委員會提案的文字。", "The Jefferson Papers project notes that after adoption Jefferson sent friends copies showing the text in the form submitted by the committee."),
      interpretation: copy("抄本使读者可以区分作者初稿、委员会提交文本与国会通过的版本。", "抄本使讀者可以區分作者初稿、委員會提案與國會通過的版本。", "The copies help distinguish the author’s draft, the committee submission and the text adopted by Congress."),
      source: {"url":"https://jeffersonpapers.princeton.edu/declaration-of-independence/original-rough-draught/","label":"Princeton University, The Papers of Thomas Jefferson","locator":"Original Rough Draught, manuscript images and revision stages"},
    },
    question: copy("这些寄给友人的抄本是哪一阶段的版本？", "這些寄給友人的抄本是哪一階段的版本？", "Which stage of the text appears in the copies sent to friends?"),
    answer: copy("它们保存委员会提交国会时的版本。", "它們保留委員會提交國會時的版本。", "They preserve the committee’s version as submitted to Congress."),
  },
  "sebastien-le-prestre-de-vauban": {
    summary: copy("1707 年，法国工程师沃邦在著作中提出以新税方案取代多种旧税。费马从他把替代项目列成方案作INTJ传记解读。Cox 修正值为115和140。", "1707 年，法國工程師沃邦提出用新的稅制方案取代多種舊稅。費馬從他把替代項目寫成方案作INTJ傳記解讀。Cox 修正值為115和140。", "French engineer and marshal Vauban published a tax proposal in 1707 that set out several existing charges it aimed to replace. FermatMind considers how he made a system level alternative concrete by naming the charges it would displace in its editorial INTJ reading. The historical study by Cox gives corrected estimates of 115 for childhood and 140 for youth in the historical tables."),
    decision: {
      year: 1707,
      title: copy("列出新税方案会取代的旧税", "列出新稅制將取代的舊稅", "Specify the existing charges the tax proposal would replace"),
      fact: copy("1707年版《王室什一税方案》的书名列举拟取消的负担，包括各省之间的关税。", "1707年版《王室什一稅方案》的書名列舉擬取消的負擔，包括各省之間的關稅。", "The extended title of the 1707 edition names charges he proposed to abolish, including customs duties between provinces."),
      interpretation: copy("具体列出替代项目，读者就能检查方案涉及哪些现行征收。", "具體列出替代項目，讀者就能檢視方案涉及哪些現行徵收。", "Naming the charges allows readers to see which existing levies the proposal would affect."),
      source: {"url":"https://www.bibliotheque.nat.tn/BNT/doc/SYRACUSE/1255825/projet-d-une-dixme-royale?_lg=fr-FR","label":"National Library of Tunisia","locator":"Projet d’une Dixme Royale, 1707 edition, extended title"},
    },
    question: copy("书名提到要取消哪个层级之间的关税？", "書名提到要取消哪個層級之間的關稅？", "Which boundaries does the book mention in its customs proposal?"),
    answer: copy("书名明确提到法国各省之间的关税。", "書名明確提到法國各省之間的關稅。", "It names customs duties from one French province to another."),
  },
  "jose-de-san-martin": {
    summary: copy("1825 年，南美独立运动领袖圣马丁亲笔为女儿列出教育建议。费马从他把教养原则写成可逐条查阅的文字作ISTJ传记解读。Cox 1926未收录。", "1825 年，南美獨立運動領袖聖馬丁親筆為女兒列出教育建議。費馬從他把教養原則寫成可逐條查閱的文字作ISTJ傳記解讀。Cox 1926未收錄。", "In 1825, South American independence leader José de San Martín wrote down a list of educational advice for his daughter. FermatMind’s editorial ISTJ reading considers his choice to put guidance for everyday conduct in discrete written items. Cox did not include San Martín in the historical biographical study published in 1926."),
    decision: {
      year: 1825,
      title: copy("给女儿写下一份教育建议清单", "給女兒寫下一份教育建議清單", "Put advice for his daughter into a written list"),
      fact: copy("米特雷博物馆记录，圣马丁于1825年在布鲁塞尔写下给女儿的教育建议，原稿现由该馆保存。", "米特雷博物館記載，聖馬丁於1825年在布魯塞爾寫下給女兒的教育建議，原稿現由該館保存。", "Museo Mitre dates the list of advice for his daughter to Brussels in 1825 and holds the original manuscript."),
      interpretation: copy("把建议逐条写下来，使长期教养目标有了可重读的具体表达。", "把建議逐條寫下，使長期教養目標有了可重讀的具體說法。", "The list gave long-term educational aims a form that could be read again item by item."),
      source: {"url":"https://museomitre.cultura.gob.ar/noticia/manuscrito-de-las-maximas-de-san-martin-a-merceditas/","label":"Museo Mitre","locator":"Manuscrito de las máximas de San Martín a Merceditas"},
    },
    question: copy("圣马丁在哪个城市写下这些建议？", "聖馬丁在哪座城市寫下這些建議？", "In which city did San Martín write these maxims?"),
    answer: copy("博物馆资料给出布鲁塞尔。", "博物館資料指出是布魯塞爾。", "The museum gives Brussels."),
  },
  "joseph-fouche": {
    summary: copy("法国政治家富歇在滑铁卢之后主持行政委员会，并与波旁王室谈判。费马从他在政权交接中调整角色作INTJ传记解读。Cox 修正值为150和165。", "法國政治家富歇在滑鐵盧之後主持行政委員會，並與波旁王室談判。費馬從他在政權交接中調整角色作INTJ傳記解讀。Cox 修正值為150和165。", "After Waterloo, French politician Joseph Fouché headed the executive commission and negotiated with the Bourbons. FermatMind considers his choice to act through successive institutional roles in a change of government for its editorial INTJ reading. Cox’s corrected estimates were 150 and 165."),
    decision: {
      year: 1815,
      title: copy("在政权交接中代表行政委员会出面", "在政權交接中代表行政委員會出面", "Take an executive commission role during a change of government"),
      fact: copy("拿破仑基金会记载，富歇在滑铁卢之后主持行政委员会，随后与波旁王室谈判，回任警务大臣。", "拿破崙基金會記載，富歇在滑鐵盧之後主持行政委員會，接著與波旁王室談判，回任警務大臣。", "The foundation records that after Waterloo Fouché chaired the executive commission, negotiated with the Bourbons and returned to the police ministry."),
      interpretation: copy("职务与谈判对象的变化可以核查，是这里用来讨论他如何调整参与方式的依据。", "職務與談判對象的變化可查證，是此處用來討論他如何調整參與方式的依據。", "The documented changes in office and negotiating counterparts provide evidence for how his participation shifted."),
      source: {"url":"https://www.napoleon.org/histoire-des-2-empires/biographies/fouche-joseph-duc-dotrante-1759-1820/","label":"Fondation Napoléon","locator":"Fouché biography, the Hundred Days and second Restoration"},
    },
    question: copy("滑铁卢之后，他在谈判前主持什么机构？", "滑鐵盧之後，他在談判前主持什麼機構？", "Which body did Fouché chair before those negotiations?"),
    answer: copy("基金会的传记列为行政委员会。", "基金會的傳記列為行政委員會。", "The foundation identifies the executive commission."),
  },
  "machado-de-assis": {
    summary: copy("巴西小说家马沙多·德·阿西斯让叙述者从自己的死亡讲起。费马从他改变回忆录的起点作INTP传记解读。Cox 1926未收录。", "巴西小說家馬沙多·德·阿西斯讓敘述者從自己的死亡講起。費馬從他改變回憶錄的起點作INTP傳記解讀。Cox 1926未收錄。", "Brazilian novelist Machado de Assis has his narrator start the story with his own death. FermatMind’s editorial INTP reading considers how the book exposes the construction of its own narrative order as part of the story. The historical study published by Cox in 1926 did not include Machado de Assis."),
    decision: {
      year: copy("19世纪后期", "19世紀後期", "Late nineteenth century"),
      title: copy("让写回忆录的人先讲自己的死亡", "讓寫回憶錄的人先講自己的死亡", "Let the memoirist begin with his own death"),
      fact: copy("《布拉斯·库巴斯死后回忆录》第一章中，叙述者比较从出生或死亡讲起两种写法，最后选择死亡。", "《布拉斯·庫巴斯死後回憶錄》第一章中，敘述者比較從出生或死亡講起兩種寫法，最後選擇死亡。", "Chapter one shows the narrator weighing whether to begin with his birth or death and choosing the latter."),
      interpretation: copy("作者把写作顺序本身放进了故事，可直接看到他怎样打破常见的起笔方式。", "作者把寫作順序本身放進故事，讓人直接看見如何改變常見的開頭。", "The book makes the selection of narrative order visible as part of the fiction."),
      source: {"url":"https://www.cervantesvirtual.com/obra-visor/memorias-postumas-de-bras-cubas--0/html/ffc4d8c0-82b1-11df-acc7-002185ce6064_2.html","label":"Machado de Assis, Biblioteca Virtual Miguel de Cervantes","locator":"Memórias póstumas de Brás Cubas, chapter 1"},
    },
    question: copy("叙述者在第一章比较哪两个起点？", "敘述者在第一章比較哪兩個起點？", "Which two starting points does the narrator compare?"),
    answer: copy("他比较从出生讲起和从死亡讲起。", "他比較從出生講起與從死亡講起。", "He compares starting with his birth and starting with his death."),
  },
  "jons-jacob-berzelius": {
    summary: copy("瑞典化学家贝采利乌斯提议用拉丁名称的字母标记元素。费马从他化繁为可复用的规则作INTJ传记解读。Cox 修正值为135和160。", "瑞典化學家貝采利烏斯提議用拉丁名稱的字母標記元素。費馬從他把複雜標記整理成可重複使用的規則作INTJ傳記解讀。Cox 修正值為135和160。", "Swedish chemist Jöns Jacob Berzelius proposed using letters from Latin names as symbols for elements. FermatMind considers the decision to make a practical notation through a reusable rule in its editorial INTJ reading. Cox’s corrected estimates for Berzelius were 135 for childhood and 160 for youth."),
    decision: {
      year: 1814,
      title: copy("用字母规则替代难以书写的化学图符", "用字母規則替代難以書寫的化學圖符", "Set out a rule for letter-based chemical symbols"),
      fact: copy("贝采利乌斯在论文的化学符号一节建议以拉丁名称首字母为起点，并说明如何区别首字母相同的名称。", "貝采利烏斯在論文的化學符號一節建議以拉丁名稱的首字母為起點，並說明如何區別首字母相同的名稱。", "In the section on chemical signs, Berzelius proposes starting from the Latin initial and supplies rules for distinguishing names that share it."),
      interpretation: copy("规则既解决手写问题，也解释了遇到首字母冲突时应如何处理。", "規則既處理手寫問題，也解釋遇到首字母相同時如何區分。", "The rule makes the signs easier to write and explicitly addresses collisions between initials."),
      source: {"url":"https://archive.org/details/annalsofphilosop03anna/page/51/mode/2up","label":"Annals of Philosophy, Internet Archive scan","locator":"Vol. 3, January 1814, pp. 51–52, section III, On the Chemical Signs"},
    },
    question: copy("论文用哪两个记号区分钴和铜？", "論文用哪兩個記號區分鈷和銅？", "Which signs does the paper give for cobalt and copper?"),
    answer: copy("论文列出 Co 代表钴，Cu 代表铜。", "論文列出 Co 代表鈷，Cu 代表銅。", "It gives Co for cobalt and Cu for copper."),
  },
  "francis-drake": {
    summary: copy("英国航海者弗朗西斯·德雷克返航后向伊丽莎白一世呈交航程地图。费马从他用图汇报亲历作ESTP传记解读。Cox 修正值为120和130。", "英國航海者法蘭西斯·德瑞克返航後向伊莉莎白一世呈交航程地圖。費馬從他以地圖呈現親身經歷作ESTP傳記解讀。Cox 修正值為120和130。", "After returning from his voyage, the English navigator Francis Drake presented Elizabeth I with a map of the journey. FermatMind’s editorial ESTP reading considers the use of a tangible record to convey an undertaking. Cox’s corrected estimates for Drake were 120 for childhood and 130 for youth."),
    decision: {
      year: 1581,
      title: copy("把返航后的航程记录呈交王室", "把返航後的航程紀錄呈交王室", "Present a map of the completed voyage to the queen"),
      fact: copy("福尔杰莎士比亚图书馆的宫廷年表汇录1581年德特福德访问的材料，其中一份记载德雷克向女王献上航程地图。", "福爾傑莎士比亞圖書館的宮廷年表彙錄1581年德特福德訪問的資料，其中一份記載德瑞克向女王獻上航程地圖。", "The Folger chronology compiles materials on the 1581 Deptford visit, including an account of Drake presenting the queen with a map of the voyage."),
      interpretation: copy("航程地图让在场但没有参加远航的人也能看到整段行程。", "航程地圖讓在場而未參與遠航的人也能看見整段行程。", "A map gave people who had stayed ashore a way to see the completed journey."),
      source: {"url":"https://folgerpedia.folger.edu/images/7/74/ECDbD_1581.pdf","label":"Folger Shakespeare Library, Elizabethan Court Day by Day","locator":"April 4, Deptford visit and accounts of gifts"},
    },
    question: copy("德雷克把地图呈交给谁？", "德瑞克把地圖呈交給誰？", "Who received the voyage map according to the account?"),
    answer: copy("资料记载，收件人是女王伊丽莎白一世。", "資料記載，收件人是女王伊莉莎白一世。", "The account names Queen Elizabeth I."),
  },
  "pedro-calderon-de-la-barca": {
    summary: copy("1651 年，西班牙剧作家卡尔德隆在剧院重新开放后仍选择领受圣职。费马从他重新安排职业方向作INFJ传记解读。Cox 修正值为175和170。", "1651 年，西班牙劇作家卡爾德隆在劇院重新開放後仍選擇領受聖職。費馬從他重新安排職業方向作INFJ傳記解讀。Cox 修正值為175和170。", "In 1651, Spanish playwright Pedro Calderón de la Barca chose to enter holy orders after the theatres had reopened. FermatMind considers how changing his formal role could respond to these pressures in its editorial INFJ reading. Cox’s corrected estimates for Calderón were 175 for childhood and 170 for youth."),
    decision: {
      year: 1651,
      title: copy("在剧院重开后选择领受圣职", "在劇院重開後選擇領受聖職", "Take holy orders after the theaters reopened"),
      fact: copy("塞万提斯虚拟图书馆的传记指出，剧院在1649年重新开放，卡尔德隆在1651年成为神父。", "塞萬提斯虛擬圖書館的傳記指出，劇院在1649年重新開放，卡爾德隆在1651年成為神父。", "The biography dates the reopening of the theaters to 1649 and Calderón’s ordination to 1651."),
      interpretation: copy("两个时间点显示，工作条件的恢复和他为自己选择新身份是不同的环节。", "兩個時間點顯示，工作條件恢復與他為自己選擇新身分是不同的環節。", "The dates distinguish the return of a working venue from the professional and religious choice he went on to make."),
      source: {"url":"https://www.cervantesvirtual.com/portales/calderon_de_la_barca/autor_calderon_epoca/","label":"Biblioteca Virtual Miguel de Cervantes","locator":"Calderón y su época, ordination after the reopening of theaters"},
    },
    question: copy("卡尔德隆何时成为神父？", "卡爾德隆何時成為神父？", "When did Calderón become a priest?"),
    answer: copy("传记给出的年份是1651年。", "傳記給出的年份是1651年。", "The biography gives 1651."),
  },
} satisfies Record<string, GeoEditorial>;
