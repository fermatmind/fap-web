import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "./archetypeHonorCardCopy";

type CopyTable = Readonly<Record<string, Readonly<Record<string, Record<DisplayLocale, ArchetypeHonorCopy>>>>>;

// Take-only copy, keyed by the existing result identity or the existing mental-age band minimum.
export const wave2aHonorCopy: CopyTable = {
  "adult-age-preferences": {
    "older-adult-context": {
      "zh": { personalityTags: ["沉静派", "稳步感", "对话细腻"], soulVerdict: "你偏爱年上情境的从容节拍，一句说到心上的话，就足够加分。" },
      "zh-TW": { personalityTags: ["沉靜派", "步調穩", "對話細膩"], soulVerdict: "你更容易被年上情境的相處步調吸引，一句說到心上的話就很加分。" },
      "en": { personalityTags: ["Measured", "Steady Pace", "Attentive"], soulVerdict: "You leaned toward older-partner scenes where an easy, unhurried exchange felt right." },
    },
    "similar-age-context": {
      "zh": { personalityTags: ["同频感", "并肩派", "自然亲近"], soulVerdict: "你更容易被同阶段的相处打动，有些话还没说完，就知道对方懂了。" },
      "zh-TW": { personalityTags: ["同頻感", "並肩派", "自然親近"], soulVerdict: "你容易被同階段的默契打動，有些話還不用講完，就知道對方懂了。" },
      "en": { personalityTags: ["Easy Rapport", "Peer-Minded", "Reciprocal"], soulVerdict: "You leaned toward sharing a life stage where a small reference lands without explaining." },
    },
    "younger-adult-context": {
      "zh": { personalityTags: ["轻快心", "新鲜感", "开放派"], soulVerdict: "你更常选到年下情境里的相处画面，聊着聊着能冒出新点子就很有趣。" },
      "zh-TW": { personalityTags: ["步調輕快", "新鮮感", "開放派"], soulVerdict: "你比較喜歡年下情境帶來的新鮮感，聊天時往往會冒出新點子。" },
      "en": { personalityTags: ["Open-Minded", "Playful", "Curious"], soulVerdict: "You leaned toward younger-adult scenes where a conversation could take a fresh turn." },
    },
    "older-similar-tie": {
      "zh": { personalityTags: ["从容感", "共鸣心", "并肩感"], soulVerdict: "你在年上和同龄情境里都找到喜欢的节拍，聊得来时两种画面都动人。" },
      "zh-TW": { personalityTags: ["從容感", "共鳴心", "並肩感"], soulVerdict: "你在年上和同齡情境裡都找到喜歡的節拍，聊得來時兩種畫面都動人。" },
      "en": { personalityTags: ["Measured", "Easy Rapport", "Varied Pace"], soulVerdict: "You found both older and same-stage scenes appealing when the conversation clicked." },
    },
    "older-younger-tie": {
      "zh": { personalityTags: ["开阔心", "双节奏", "不拘一格"], soulVerdict: "你对年上和年下两种相处都有兴致，节奏不同也可以有各自的默契。" },
      "zh-TW": { personalityTags: ["開闊心", "多種步調", "不拘一格"], soulVerdict: "你對年上和年下兩種相處都感興趣，步調不同也能有各自的默契。" },
      "en": { personalityTags: ["Open-Minded", "Varied Pace", "Spark-Seeker"], soulVerdict: "You found something to like in older and younger-adult scenes, each at its own pace." },
    },
    "similar-younger-tie": {
      "zh": { personalityTags: ["亲近感", "轻快派", "自然同频"], soulVerdict: "你既选了同阶段的熟悉默契，也喜欢年下情境带来的那点新鲜感。" },
      "zh-TW": { personalityTags: ["親近感", "輕快派", "自然同頻"], soulVerdict: "你既選了同階段的熟悉默契，也喜歡年下情境帶來的那點新鮮感。" },
      "en": { personalityTags: ["Easy Rapport", "Curious", "Lighthearted"], soulVerdict: "You liked the shorthand of a similar stage and the spark of a younger-adult scene." },
    },
    "all-three-tied": {
      "zh": { personalityTags: ["开放心", "多节拍", "情境感"], soulVerdict: "你在三种成年伴侣情境里都看到合拍的时刻，本轮选不出唯一的节奏。" },
      "zh-TW": { personalityTags: ["開放心", "多種步調", "情境感"], soulVerdict: "你在三種成年伴侶情境裡都看到合拍的時刻，本輪選不出唯一的節奏。" },
      "en": { personalityTags: ["Open-Minded", "Varied Pace", "Context-Aware"], soulVerdict: "You found moments of connection in all three adult age contexts this round." },
    },
  },
  "response-color": {
    "red": {
      "zh": { personalityTags: ["明快派", "果断感", "行动气场"], soulVerdict: "你偏爱让事情有个看得见的起点，动起来的那一刻会让你精神一振。" },
      "zh-TW": { personalityTags: ["明快派", "果斷感", "行動氣場"], soulVerdict: "你偏愛讓事情有個看得見的起點，動起來的那一刻會讓你精神一振。" },
      "en": { personalityTags: ["Decisive", "Direct", "Quick Spark"], soulVerdict: "You like the first visible move, the moment a stuck situation starts to breathe." },
    },
    "yellow": {
      "zh": { personalityTags: ["联想派", "好奇心", "跳跃感"], soulVerdict: "你容易在原本无关的东西之间发现有趣的线，想顺着它多绕一小段。" },
      "zh-TW": { personalityTags: ["聯想派", "好奇心", "跳躍感"], soulVerdict: "你容易在原本無關的東西之間發現有趣的線，想順著它多繞一小段。" },
      "en": { personalityTags: ["Curious", "Associative", "Open-Minded"], soulVerdict: "You notice an unexpected connection and want to see where its little detour leads." },
    },
    "blue": {
      "zh": { personalityTags: ["细密感", "条理派", "审慎心"], soulVerdict: "你对模糊之处多看一眼，喜欢让一团散开的东西慢慢有清楚的纹理。" },
      "zh-TW": { personalityTags: ["細密感", "條理派", "審慎心"], soulVerdict: "你對模糊之處多看一眼，喜歡讓一團散開的東西慢慢有清楚的紋理。" },
      "en": { personalityTags: ["Methodical", "Discerning", "Considered"], soulVerdict: "You enjoy the quiet moment when scattered details start fitting into a clear pattern." },
    },
    "green": {
      "zh": { personalityTags: ["稳场感", "协调心", "温厚气质"], soulVerdict: "你比较在意大家能不能一起走得稳，节奏照顾到了，事情就容易继续。" },
      "zh-TW": { personalityTags: ["穩場感", "協調心", "溫厚氣質"], soulVerdict: "你比較在乎大家能不能舒服地一起走，步調抓對了，事情也會順一些。" },
      "en": { personalityTags: ["Steady", "Considerate", "Coordinated"], soulVerdict: "You like finding a pace that lets everyone keep moving without getting left behind." },
    },
    "tied-red-yellow": {
      "zh": { personalityTags: ["灵感火花", "直觉果断", "好奇心"], soulVerdict: "你会顺着新点子的亮光往前试，想象出路径以后也很想看看它能走多远。" },
      "zh-TW": { personalityTags: ["靈感派", "直覺果斷", "好奇心"], soulVerdict: "你會順著新點子的亮光往前試，想像出路徑以後也很想看看它能走多遠。" },
      "en": { personalityTags: ["Quick Spark", "Inventive", "Bold"], soulVerdict: "You like catching an unexpected idea and giving it enough momentum to go somewhere." },
    },
    "tied-red-blue": {
      "zh": { personalityTags: ["果断派", "细致感", "条理清楚"], soulVerdict: "你想让局面往前一点，也会留意脚下站不站得稳，快慢各有用处。" },
      "zh-TW": { personalityTags: ["果斷派", "細緻感", "條理清楚"], soulVerdict: "你想讓局面往前一點，也會留意腳下站不站得穩，快慢各有用處。" },
      "en": { personalityTags: ["Decisive", "Methodical", "Grounded"], soulVerdict: "You like momentum with enough detail underneath it to know where you're stepping." },
    },
    "tied-red-green": {
      "zh": { personalityTags: ["稳场心", "实在果决", "团队感"], soulVerdict: "你愿意让事情先动起来，也会回头看看同行的人有没有舒服的步子。" },
      "zh-TW": { personalityTags: ["穩場心", "實在果決", "團隊感"], soulVerdict: "你願意讓事情先動起來，也會回頭看看同行的人有沒有舒服的步子。" },
      "en": { personalityTags: ["Decisive", "Team-Minded", "Steady"], soulVerdict: "You want things moving and still keep an eye on whether others can come along." },
    },
    "tied-yellow-blue": {
      "zh": { personalityTags: ["联想力", "细节眼", "求真感"], soulVerdict: "你被离奇的联系勾起好奇，也愿意停下来看看哪部分真的对得上。" },
      "zh-TW": { personalityTags: ["聯想力", "細節眼", "求真感"], soulVerdict: "你被離奇的聯絡勾起好奇，也願意停下來看看哪部分真的對得上。" },
      "en": { personalityTags: ["Curious", "Detail-Minded", "Discerning"], soulVerdict: "You enjoy a surprising connection enough to look closely at what makes it hold." },
    },
    "tied-yellow-green": {
      "zh": { personalityTags: ["玩心足", "协调感", "温暖开放"], soulVerdict: "你喜欢新点子带来的热闹，也会留意哪种玩法让大家比较自在。" },
      "zh-TW": { personalityTags: ["玩心足", "協調感", "溫暖開放"], soulVerdict: "你喜歡新點子帶來的熱鬧，也會留意哪種玩法讓大家比較自在。" },
      "en": { personalityTags: ["Playful", "Considerate", "Open-Minded"], soulVerdict: "You like an inventive room best when everyone has a pace that feels comfortable." },
    },
    "tied-blue-green": {
      "zh": { personalityTags: ["安稳感", "细腻条理", "顾及他人"], soulVerdict: "你会把容易让人卡住的细节看清，也喜欢让别人听完心里都踏实了。" },
      "zh-TW": { personalityTags: ["安穩感", "細膩條理", "顧及他人"], soulVerdict: "你會把容易讓人卡住的細節看清，也喜歡讓別人聽完心裡都踏實了。" },
      "en": { personalityTags: ["Methodical", "Steady", "Considerate"], soulVerdict: "You like clear details that make it easier for people to settle into a shared rhythm." },
    },
    "tied-red-yellow-blue": {
      "zh": { personalityTags: ["灵感敏锐", "条理派", "果断心"], soulVerdict: "你既对意外的可能好奇，也想摸清它的纹理，然后挑个能试的地方。" },
      "zh-TW": { personalityTags: ["靈感敏銳", "條理派", "果斷心"], soulVerdict: "你既對意外的可能好奇，也想摸清它的紋理，然後挑個能試的地方。" },
      "en": { personalityTags: ["Inventive", "Exacting", "Decisive"], soulVerdict: "You like spotting an idea, looking closely, and finding a place to give it a go." },
    },
    "tied-red-yellow-green": {
      "zh": { personalityTags: ["明亮亲和", "点子多", "带场感"], soulVerdict: "你容易被好玩的想法点燃，也更喜欢人能一起加入的那种热闹。" },
      "zh-TW": { personalityTags: ["明亮親和", "點子多", "帶場感"], soulVerdict: "你容易被好玩的想法點燃，也更喜歡人能一起加入的那種熱鬧。" },
      "en": { personalityTags: ["Inventive", "Welcoming", "Quick Spark"], soulVerdict: "You like an idea with enough spark to get moving and enough room to bring others." },
    },
    "tied-red-blue-green": {
      "zh": { personalityTags: ["有条理", "稳当果决", "顾全感"], soulVerdict: "你偏爱有起点也有章法的进展，更希望跟你一起的人知道自己站在哪儿。" },
      "zh-TW": { personalityTags: ["有條理", "穩當果決", "顧全感"], soulVerdict: "你偏愛有起點也有章法的進展，更希望跟你一起的人知道自己站在哪裡。" },
      "en": { personalityTags: ["Grounded", "Decisive", "Team-Minded"], soulVerdict: "You like a clear start with enough structure for everyone to know where they fit." },
    },
    "tied-yellow-blue-green": {
      "zh": { personalityTags: ["细密感", "新鲜眼", "温厚协调"], soulVerdict: "你观察得细，也爱意外的联想，最喜欢把它们放进大家都舒服的节奏。" },
      "zh-TW": { personalityTags: ["細密感", "新鮮眼", "溫厚協調"], soulVerdict: "你觀察得細，也愛意外的聯想，最喜歡把它們放進大家都舒服的節奏。" },
      "en": { personalityTags: ["Curious", "Methodical", "Considerate"], soulVerdict: "You like fine details and unusual ideas in a space where people can take their time." },
    },
    "tied-red-yellow-blue-green": {
      "zh": { personalityTags: ["多面感", "节奏弹性", "情境心"], soulVerdict: "你在推动、联想、整理和协调之间都有投入，这轮没有唯一领跑的颜色。" },
      "zh-TW": { personalityTags: ["多面感", "節奏彈性", "情境心"], soulVerdict: "你在推動、聯想、整理和協調之間都有投入，這輪沒有唯一領跑的顏色。" },
      "en": { personalityTags: ["Versatile", "Context-Aware", "Varied Pace"], soulVerdict: "You gave all four response colors equal room, with no one approach leading today." },
    },
  },
  "love-personality": {
    "clear-expression": {
      "zh": { personalityTags: ["直球心", "真诚明朗", "有分寸"], soulVerdict: "你更喜欢把关心说到听得见的地方，一句具体的话胜过来回猜心。" },
      "zh-TW": { personalityTags: ["直球心", "真誠明朗", "有分寸"], soulVerdict: "你更喜歡把關心說到聽得見的地方，一句具體的話勝過來回猜心。" },
      "en": { personalityTags: ["Direct", "Sincere", "Clearspoken"], soulVerdict: "You prefer care people can actually hear, with less guesswork between the lines." },
    },
    "attuned-response": {
      "zh": { personalityTags: ["细腻心", "体贴感", "听得进"], soulVerdict: "你容易听见对方语气里的小变化，更在意那句没说完的话有地方落下。" },
      "zh-TW": { personalityTags: ["細膩心", "體貼感", "聽得進"], soulVerdict: "你容易聽見對方語氣裡的小變化，更在意那句沒說完的話有地方落下。" },
      "en": { personalityTags: ["Attuned", "Considerate", "Gentle"], soulVerdict: "You notice the shift in someone's voice and leave space for the unfinished thought." },
    },
    "space-regulation": {
      "zh": { personalityTags: ["自在感", "有界线", "亲疏有度"], soulVerdict: "你喜欢关系有靠近的温度，也有一段各自喘口气就更舒服的距离。" },
      "zh-TW": { personalityTags: ["自在感", "有界線", "親疏有度"], soulVerdict: "你喜歡靠近時有溫度，各自喘口氣也很自在，這樣相處反而更舒服。" },
      "en": { personalityTags: ["Boundaried", "Unhurried", "Independent"], soulVerdict: "You like closeness with room to breathe, so coming back together feels like a choice." },
    },
    "repair-engagement": {
      "zh": { personalityTags: ["坦然修复", "有耐性", "重关系"], soulVerdict: "你在意争执过后还能坐回同一张桌边，慢慢把卡住的地方讲明白。" },
      "zh-TW": { personalityTags: ["坦然修復", "有耐性", "重情誼"], soulVerdict: "你在意爭執過後還能坐回同一張桌邊，慢慢把卡住的地方講明白。" },
      "en": { personalityTags: ["Patient", "Repair-Minded", "Openhearted"], soulVerdict: "You care about meeting again after friction, with room to hear what got missed." },
    },
    "expression-response-tie": {
      "zh": { personalityTags: ["坦率温和", "体贴心", "双向感"], soulVerdict: "你既想把话讲明白，也在意对方有没有被认真听见，亲近是来回的。" },
      "zh-TW": { personalityTags: ["坦率溫和", "體貼心", "雙向感"], soulVerdict: "你既想把話講明白，也在意對方有沒有被認真聽見，親近是來回的。" },
      "en": { personalityTags: ["Direct", "Attuned", "Reciprocal"], soulVerdict: "You like a conversation where your words are clear and the other voice has room." },
    },
    "expression-space-tie": {
      "zh": { personalityTags: ["明朗自主", "界线感", "爽快心"], soulVerdict: "你更喜欢说得清楚的亲近，想多待一会儿或自己静一静都可以开口。" },
      "zh-TW": { personalityTags: ["明朗自主", "界線感", "爽快心"], soulVerdict: "你喜歡能把心意說清楚的親近，想多待一下或獨處都可以開口。" },
      "en": { personalityTags: ["Clearspoken", "Boundaried", "Independent"], soulVerdict: "You like being able to say you want company or quiet without making either a test." },
    },
    "expression-repair-tie": {
      "zh": { personalityTags: ["坦率心", "重修复", "认真温柔"], soulVerdict: "你宁愿把不舒服的地方讲出来，也希望说完以后还愿意听对方怎么想。" },
      "zh-TW": { personalityTags: ["坦率心", "重和好", "認真溫柔"], soulVerdict: "你寧願把不舒服的地方講出來，也希望說完以後還願意聽對方怎麼想。" },
      "en": { personalityTags: ["Sincere", "Repair-Minded", "Direct"], soulVerdict: "You prefer naming the uncomfortable part while leaving the other person a way back in." },
    },
    "response-space-tie": {
      "zh": { personalityTags: ["温柔有界", "细腻感", "不紧逼"], soulVerdict: "你愿意停一下听人的心情，却不急着靠得太近，舒服的距离也很温柔。" },
      "zh-TW": { personalityTags: ["溫柔有界", "細膩感", "有分寸"], soulVerdict: "你願意停一下聽人的心情，卻不急著靠得太近，舒服的距離也很溫柔。" },
      "en": { personalityTags: ["Attuned", "Boundaried", "Gentle"], soulVerdict: "You like listening closely without rushing the distance that makes care comfortable." },
    },
    "response-repair-tie": {
      "zh": { personalityTags: ["柔韧心", "善倾听", "回温感"], soulVerdict: "你喜欢给争执后的话留一点时间，等彼此真的听进去了，关系也会回暖。" },
      "zh-TW": { personalityTags: ["柔韌心", "善傾聽", "回溫感"], soulVerdict: "你喜歡給爭執後的話留一點時間，等彼此真的聽進去了，關係也會回暖。" },
      "en": { personalityTags: ["Attuned", "Patient", "Repair-Minded"], soulVerdict: "You like giving the words after an argument enough time to be heard properly." },
    },
    "space-repair-tie": {
      "zh": { personalityTags: ["沉着感", "重界线", "柔韧心"], soulVerdict: "你会给摩擦留个缓冲，也在意休息过后还能好好回来谈同一件事。" },
      "zh-TW": { personalityTags: ["沉著感", "重界線", "柔韌心"], soulVerdict: "你會給摩擦留個緩衝，也在意休息過後還能好好回來談同一件事。" },
      "en": { personalityTags: ["Boundaried", "Patient", "Repair-Minded"], soulVerdict: "You like a pause after friction and a clear way to return when you feel ready." },
    },
    "expression-response-space-tie": {
      "zh": { personalityTags: ["坦然亲近", "体贴心", "边界清楚"], soulVerdict: "你愿意把心意说出口，留心对方怎么接，也容得下彼此有自己的安静。" },
      "zh-TW": { personalityTags: ["坦然親近", "體貼心", "邊界清楚"], soulVerdict: "你願意把心意說出口，留心對方怎麼接，也容得下彼此有自己的安靜。" },
      "en": { personalityTags: ["Sincere", "Attuned", "Boundaried"], soulVerdict: "You like clear affection, a listening ear, and a little quiet all in the same bond." },
    },
    "expression-response-repair-tie": {
      "zh": { personalityTags: ["真诚心", "回温感", "会共鸣"], soulVerdict: "你更欣赏摩擦过后还能互相听懂的关系，话说开比沉默更让你安心。" },
      "zh-TW": { personalityTags: ["真誠心", "回溫感", "會共鳴"], soulVerdict: "你更欣賞摩擦過後還能互相聽懂的關係，話說開比沉默更讓你安心。" },
      "en": { personalityTags: ["Direct", "Attuned", "Repair-Minded"], soulVerdict: "You like talking things through after friction, with both voices still in the room." },
    },
    "expression-space-repair-tie": {
      "zh": { personalityTags: ["直率有界", "沉着派", "重修复"], soulVerdict: "你可以把话说明白，也会为彼此留时间，再回来谈未说完的部分。" },
      "zh-TW": { personalityTags: ["直率有界", "沉著派", "重和好"], soulVerdict: "你可以把話說明白，也會為彼此留時間，再回來談未說完的部分。" },
      "en": { personalityTags: ["Direct", "Boundaried", "Repair-Minded"], soulVerdict: "You like honesty with enough breathing room to return to what was left unsaid." },
    },
    "response-space-repair-tie": {
      "zh": { personalityTags: ["细腻稳重", "有分寸", "愿理解"], soulVerdict: "你重视听懂彼此，也享受留白带来的缓冲，等节奏对了再好好聊。" },
      "zh-TW": { personalityTags: ["細膩穩重", "有分寸", "願理解"], soulVerdict: "你重視聽懂彼此，也享受留白帶來的緩衝，等節奏對了再好好聊。" },
      "en": { personalityTags: ["Attuned", "Boundaried", "Patient"], soulVerdict: "You like understanding to grow through listening, a little space, and a patient return." },
    },
    "four-directions-tied": {
      "zh": { personalityTags: ["多面感", "相处弹性", "情境心"], soulVerdict: "你在表达、回应、留空间和修复上都投了同样多的选择，本轮没有主线。" },
      "zh-TW": { personalityTags: ["多面感", "相處彈性", "情境心"], soulVerdict: "你在表達、回應、留空間和修復上都投了同樣多的選擇，本輪沒有主線。" },
      "en": { personalityTags: ["Versatile", "Context-Aware", "Flexible"], soulVerdict: "You gave expression, listening, space, and repair equal weight in your choices today." },
    },
  },
  "relationship-values": {
    "romantic-expression": {
      "zh": { personalityTags: ["浪漫感", "细节心", "仪式派"], soulVerdict: "你更在意普通日子被认真点亮的感觉，一件小事也足够让人想记住。" },
      "zh-TW": { personalityTags: ["浪漫感", "細節心", "儀式派"], soulVerdict: "你更在意普通日子被認真點亮的感覺，一件小事也足夠讓人想記住。" },
      "en": { personalityTags: ["Romantic", "Intentional", "Detail-Minded"], soulVerdict: "You like an ordinary day made memorable by one detail that says someone thought of you." },
    },
    "practical-partnership": {
      "zh": { personalityTags: ["务实心", "靠谱感", "并肩派"], soulVerdict: "你更容易被日常里能搭把手的默契打动，两个人一起做到的事很有份量。" },
      "zh-TW": { personalityTags: ["實在心", "可靠感", "並肩派"], soulVerdict: "你容易被日常能互相搭把手的默契打動，兩個人一起做到的事很有分量。" },
      "en": { personalityTags: ["Practical", "Dependable", "Team-Minded"], soulVerdict: "You like the quiet trust that builds when two people can count on each other in real life." },
    },
    "emotional-companionship": {
      "zh": { personalityTags: ["温厚感", "共鸣心", "细腻陪伴"], soulVerdict: "你在意有人认真待在那些难开口的时刻，懂不懂有时比热闹更重要。" },
      "zh-TW": { personalityTags: ["溫厚感", "共鳴心", "細膩陪伴"], soulVerdict: "你在意有人認真待在那些難開口的時刻，懂不懂有時比熱鬧更重要。" },
      "en": { personalityTags: ["Attuned", "Gentle", "Companion-Minded"], soulVerdict: "You value being heard in a hard-to-name moment more than keeping the room cheerful." },
    },
    "growth-autonomy": {
      "zh": { personalityTags: ["自在感", "独立心", "共同向前"], soulVerdict: "你喜欢两个人可以各自长出新东西，也愿意回来交换这一程看见了什么。" },
      "zh-TW": { personalityTags: ["自在感", "獨立心", "共同向前"], soulVerdict: "你喜歡兩個人可以各自長出新東西，也願意回來交換這一程看見了什麼。" },
      "en": { personalityTags: ["Independent", "Growth-Minded", "Openhearted"], soulVerdict: "You like growing in your own direction and coming back to share what you found." },
    },
    "rituals-cooperation-tie": {
      "zh": { personalityTags: ["浪漫务实", "重细节", "同伴感"], soulVerdict: "你喜欢惊喜有可以落脚的日常，一起把小事做好，本身就很浪漫。" },
      "zh-TW": { personalityTags: ["浪漫務實", "重細節", "同伴感"], soulVerdict: "你喜歡驚喜有可以落腳的日常，一起把小事做好，本身就很浪漫。" },
      "en": { personalityTags: ["Romantic", "Grounded", "Team-Minded"], soulVerdict: "You like romance that has somewhere to land, like a small thing you both make work." },
    },
    "rituals-companionship-tie": {
      "zh": { personalityTags: ["深情感", "仪式心", "温柔共鸣"], soulVerdict: "你在意被记住的细节，也在意那个能安心说出感受的时刻，少一样都可惜。" },
      "zh-TW": { personalityTags: ["深情感", "儀式心", "溫柔共鳴"], soulVerdict: "你在意被記住的細節，也在意那個能安心說出感受的時刻，少一樣都可惜。" },
      "en": { personalityTags: ["Romantic", "Attuned", "Thoughtful"], soulVerdict: "You like a small gesture that remembers the detail and a conversation that hears the feeling." },
    },
    "rituals-autonomy-tie": {
      "zh": { personalityTags: ["自由浪漫", "好奇心", "有主见"], soulVerdict: "你喜欢有设计感的亲密，也愿意让彼此带着自己的兴趣来赴约。" },
      "zh-TW": { personalityTags: ["自由浪漫", "好奇心", "有主見"], soulVerdict: "你喜歡有設計感的親密，也願意讓彼此帶著自己的興趣來赴約。" },
      "en": { personalityTags: ["Romantic", "Independent", "Curious"], soulVerdict: "You love a thoughtful occasion with room for both people to turn up as themselves." },
    },
    "cooperation-companionship-tie": {
      "zh": { personalityTags: ["稳当温和", "有担当", "共情心"], soulVerdict: "你看重日常有人一起扛，也喜欢累的时候还可以讲一句我今天不太行。" },
      "zh-TW": { personalityTags: ["穩當溫和", "有擔當", "共情心"], soulVerdict: "你看重日常有人一起扛，也喜歡累的時候還可以講一句我今天不太行。" },
      "en": { personalityTags: ["Dependable", "Attuned", "Warm"], soulVerdict: "You like doing life together with room for one person to have an off day." },
    },
    "cooperation-autonomy-tie": {
      "zh": { personalityTags: ["务实自主", "并肩感", "灵活派"], soulVerdict: "你偏爱商量得来的分工，也会为各自的目标留下一块不必让渡的地方。" },
      "zh-TW": { personalityTags: ["務實自主", "並肩感", "靈活派"], soulVerdict: "你偏愛商量得來的分工，也會為各自的目標留下一塊不必讓渡的地方。" },
      "en": { personalityTags: ["Practical", "Independent", "Flexible"], soulVerdict: "You like sharing the work without giving up the space for goals of your own." },
    },
    "companionship-autonomy-tie": {
      "zh": { personalityTags: ["温柔有界", "同频感", "独立心"], soulVerdict: "你喜欢可以互相靠近也愿意各自出发的关系，回来的故事更有意思。" },
      "zh-TW": { personalityTags: ["溫柔有界", "同頻感", "獨立心"], soulVerdict: "你喜歡可以互相靠近也願意各自出發的關係，回來的故事更有意思。" },
      "en": { personalityTags: ["Attuned", "Independent", "Openhearted"], soulVerdict: "You like feeling close enough to set out separately and curious to hear the story afterward." },
    },
    "rituals-cooperation-companionship-tie": {
      "zh": { personalityTags: ["暖意感", "讲究细节", "并肩心"], soulVerdict: "你喜欢能庆祝小事的人，也希望普通的日子有默契、有话可说。" },
      "zh-TW": { personalityTags: ["暖意感", "講究細節", "並肩心"], soulVerdict: "你喜歡能慶祝小事的人，也希望普通的日子有默契、有話可說。" },
      "en": { personalityTags: ["Romantic", "Dependable", "Attuned"], soulVerdict: "You like small celebrations beside ordinary days filled with teamwork and real conversation." },
    },
    "rituals-cooperation-autonomy-tie": {
      "zh": { personalityTags: ["浪漫自主", "务实心", "不拘一格"], soulVerdict: "你偏爱把日子过得有滋味，重要的事一起扛，各自喜欢的事也留得住。" },
      "zh-TW": { personalityTags: ["浪漫自主", "務實心", "不拘一格"], soulVerdict: "你偏愛把日子過得有滋味，重要的事一起扛，各自喜歡的事也留得住。" },
      "en": { personalityTags: ["Romantic", "Practical", "Independent"], soulVerdict: "You want a little romance, work you can share, and tastes that stay yours." },
    },
    "rituals-companionship-autonomy-tie": {
      "zh": { personalityTags: ["细腻浪漫", "自在心", "会共鸣"], soulVerdict: "你喜欢亲近时有心意、有话可说，独处时也可以舒舒服服做自己。" },
      "zh-TW": { personalityTags: ["細膩浪漫", "自在心", "會共鳴"], soulVerdict: "你喜歡親近時有心意、有話可說，獨處時也可以舒舒服服做自己。" },
      "en": { personalityTags: ["Romantic", "Attuned", "Independent"], soulVerdict: "You like closeness with a thoughtful spark and enough space to feel like yourself." },
    },
    "cooperation-companionship-autonomy-tie": {
      "zh": { personalityTags: ["稳稳的", "理解力", "空间感"], soulVerdict: "你看重日常搭得上手，心事听得进，也给彼此留一段自己的路。" },
      "zh-TW": { personalityTags: ["穩穩的", "理解力", "空間感"], soulVerdict: "你看重日常搭得起來手，心事聽得進，也給彼此留一段自己的路。" },
      "en": { personalityTags: ["Practical", "Attuned", "Independent"], soulVerdict: "You like being useful together, heard in the hard bits, and free to pursue your own path." },
    },
    "four-values-tied": {
      "zh": { personalityTags: ["多面感", "相处弹性", "同伴心"], soulVerdict: "你对浪漫、协作、陪伴和自主给了同样的份量，本轮没有偏重一边。" },
      "zh-TW": { personalityTags: ["多面感", "相處彈性", "同伴心"], soulVerdict: "你對浪漫、協作、陪伴和自主給了同樣的分量，本輪沒有偏重一邊。" },
      "en": { personalityTags: ["Versatile", "Flexible", "Relational"], soulVerdict: "You gave romance, partnership, companionship, and autonomy equal weight this round." },
    },
  },
  "likable-person-test": {
    "warmth": {
      "zh": { personalityTags: ["柔软心", "会体贴", "温和气质"], soulVerdict: "你容易留意没被接住的小情绪，一点刚刚好的关心，比热闹更贴心。" },
      "zh-TW": { personalityTags: ["柔軟心", "會體貼", "溫和氣質"], soulVerdict: "你容易留意還沒被接住的小情緒，剛剛好的關心，比熱鬧更貼心。" },
      "en": { personalityTags: ["Warm", "Attuned", "Gentle"], soulVerdict: "You notice the feeling almost missed and like care that fits the moment quietly." },
    },
    "follow-through": {
      "zh": { personalityTags: ["稳当派", "守信心", "实在可靠"], soulVerdict: "你比较在意答应过的事有没有落到日常，实实在在出现比说得好听重要。" },
      "zh-TW": { personalityTags: ["穩當派", "守信心", "實在可靠"], soulVerdict: "你比較在意答應過的事有沒有落到日常，實實在在出現比說得好聽重要。" },
      "en": { personalityTags: ["Steady", "Dependable", "Plainspoken"], soulVerdict: "You value the ordinary moment someone shows up for something they said they would do." },
    },
    "lightness": {
      "zh": { personalityTags: ["松弛感", "好玩心", "自然幽默"], soulVerdict: "你喜欢让气氛松一点，一句刚好的玩笑，能让卡住的大家重新说话。" },
      "zh-TW": { personalityTags: ["自在感", "好玩心", "自然幽默"], soulVerdict: "你喜歡讓氣氛松一點，一句剛好的玩笑，能讓卡住的大家重新說話。" },
      "en": { personalityTags: ["Lighthearted", "Playful", "Easygoing"], soulVerdict: "You like the little joke that gives a stiff conversation room to move again." },
    },
    "curiosity": {
      "zh": { personalityTags: ["好奇心", "会接话", "交流感"], soulVerdict: "你常被别人讲到一半的事勾起好奇，真想知道后来怎样，而不是客气一下。" },
      "zh-TW": { personalityTags: ["好奇心", "會接話", "交流感"], soulVerdict: "你常被別人講到一半的事勾起好奇，真想知道後來怎樣，而不是客氣一下。" },
      "en": { personalityTags: ["Curious", "Engaged", "Attentive"], soulVerdict: "You want to know what happened next because the half-told story really caught you." },
    },
    "boundaries": {
      "zh": { personalityTags: ["真诚感", "有界线", "坦然自持"], soulVerdict: "你喜欢先坦白自己怎么想，也愿意让别人有不同的答案，舒服比讨好重要。" },
      "zh-TW": { personalityTags: ["真誠感", "有界線", "坦然自持"], soulVerdict: "你喜歡先坦白自己怎麼想，也願意讓別人有不同的答案，舒服比討好重要。" },
      "en": { personalityTags: ["Candid", "Boundaried", "Respectful"], soulVerdict: "You like being honest about your view while leaving room for another person's answer." },
    },
    "warmth-follow-through": {
      "zh": { personalityTags: ["温厚可靠", "细腻心", "稳当派"], soulVerdict: "你看重先让人觉得被听见，也希望答应下来的那点关心真的能够落地。" },
      "zh-TW": { personalityTags: ["溫厚可靠", "細膩心", "穩當派"], soulVerdict: "你看重先讓人覺得被聽見，也希望答應下來的那點關心真的能夠落地。" },
      "en": { personalityTags: ["Warm", "Attuned", "Dependable"], soulVerdict: "You like care that listens first and still shows up after the conversation ends." },
    },
    "warmth-lightness": {
      "zh": { personalityTags: ["暖意感", "松弛派", "亲切幽默"], soulVerdict: "你喜欢用一点轻松把人接住，笑的时候，也能照顾到对方的心情。" },
      "zh-TW": { personalityTags: ["暖意感", "自在派", "親切幽默"], soulVerdict: "你喜歡用一點輕鬆把人接住，笑的時候，也能照顧到對方的心情。" },
      "en": { personalityTags: ["Warm", "Lighthearted", "Attuned"], soulVerdict: "You like a laugh that catches the mood without leaving anyone out of the warmth." },
    },
    "warmth-curiosity": {
      "zh": { personalityTags: ["细腻感", "好奇心", "善倾听"], soulVerdict: "你想多知道一点别人当时怎么想，也希望那个问题问得刚好够温柔。" },
      "zh-TW": { personalityTags: ["細膩感", "好奇心", "善傾聽"], soulVerdict: "你想多知道一點別人當時怎麼想，也希望那個問題問得剛好夠溫柔。" },
      "en": { personalityTags: ["Attuned", "Curious Listener", "Gentle"], soulVerdict: "You like a question that is genuinely curious and gentle enough to make answering easy." },
    },
    "warmth-boundaries": {
      "zh": { personalityTags: ["温柔有界", "坦诚心", "细腻感"], soulVerdict: "你愿意关心一个人，也会给对方留出说不的余地，亲近才让人自在。" },
      "zh-TW": { personalityTags: ["溫柔有界", "坦誠心", "細膩感"], soulVerdict: "你願意關心一個人，也會給對方留出說不的餘地，親近才讓人自在。" },
      "en": { personalityTags: ["Warm", "Boundaried", "Respectful"], soulVerdict: "You like care with enough room for another person to say no and still feel welcome." },
    },
    "follow-through-lightness": {
      "zh": { personalityTags: ["实在派", "松弛感", "守信心"], soulVerdict: "你偏爱能笑着说话、说完也真会出现的相处，轻松和可靠刚好搭得上。" },
      "zh-TW": { personalityTags: ["實在派", "自在感", "守信心"], soulVerdict: "你偏愛能笑著說話、說完也真會出現的相處，輕鬆和可靠剛好搭得起來。" },
      "en": { personalityTags: ["Dependable", "Easygoing", "Playful"], soulVerdict: "You like the kind of company that can make you laugh and also show up when promised." },
    },
    "follow-through-curiosity": {
      "zh": { personalityTags: ["守信心", "认真好奇", "稳步派"], soulVerdict: "你会认真听还有哪些自己没弄懂，也在意听完以后，有没有照约定出现。" },
      "zh-TW": { personalityTags: ["守信心", "認真好奇", "穩步派"], soulVerdict: "你會認真聽還有哪些自己沒弄懂，也在意聽完以後，有沒有照約定出現。" },
      "en": { personalityTags: ["Dependable", "Curious", "Engaged"], soulVerdict: "You like finding out what someone really meant and following up in a way they'll recognize." },
    },
    "follow-through-boundaries": {
      "zh": { personalityTags: ["可靠有界", "真诚感", "稳当派"], soulVerdict: "你比较看重说明白自己能给多少，答应下来的部分才更让人安心。" },
      "zh-TW": { personalityTags: ["可靠有界", "真誠感", "穩當派"], soulVerdict: "你比較看重說明白自己能給多少，答應下來的部分才更讓人安心。" },
      "en": { personalityTags: ["Dependable", "Boundaried", "Candid"], soulVerdict: "You like a clear limit up front so the part you do promise can be counted on." },
    },
    "lightness-curiosity": {
      "zh": { personalityTags: ["机灵心", "好奇感", "好聊派"], soulVerdict: "你很享受拐个弯就有新话题的聊天，问得真一点，笑点也会自然一点。" },
      "zh-TW": { personalityTags: ["機靈心", "好奇感", "好聊派"], soulVerdict: "你很享受拐個彎就有新話題的聊天，問得真一點，笑點也會自然一點。" },
      "en": { personalityTags: ["Curious", "Quick-Witted", "Easygoing"], soulVerdict: "You like when a genuine question takes the conversation somewhere unexpectedly fun." },
    },
    "lightness-boundaries": {
      "zh": { personalityTags: ["松弛有度", "好玩心", "直率感"], soulVerdict: "你喜欢谁都能笑着参与的玩笑，也知道有些地方留点距离会更自在。" },
      "zh-TW": { personalityTags: ["自在有度", "好玩心", "直率感"], soulVerdict: "你喜歡誰都能笑著參與的玩笑，也知道有些地方留點距離會更自在。" },
      "en": { personalityTags: ["Lighthearted", "Boundaried", "Candid"], soulVerdict: "You like a joke people can join freely, with enough space to sit it out too." },
    },
    "curiosity-boundaries": {
      "zh": { personalityTags: ["好奇有界", "坦然心", "会倾听"], soulVerdict: "你喜欢问得真诚，也不急着得到答案，给人的空间是好奇的一部分。" },
      "zh-TW": { personalityTags: ["好奇有界", "坦然心", "會傾聽"], soulVerdict: "你喜歡問得真誠，也不急著得到答案，給人的空間是好奇的一部分。" },
      "en": { personalityTags: ["Curious", "Boundaried", "Respectful"], soulVerdict: "You like asking out of real interest and leaving others free to decide what to share." },
    },
    "warmth-follow-through-lightness": {
      "zh": { personalityTags: ["温暖可靠", "松弛感", "亲切气质"], soulVerdict: "你喜欢好相处的人也靠得住，笑过之后还记得答应对方的那点小事。" },
      "zh-TW": { personalityTags: ["溫暖可靠", "自在感", "親切氣質"], soulVerdict: "你喜歡好相處的人也靠得住，笑過之後還記得答應對方的那點小事。" },
      "en": { personalityTags: ["Warm", "Dependable", "Easygoing"], soulVerdict: "You like warmth that keeps the mood light and remembers the promise after the laugh." },
    },
    "warmth-follow-through-curiosity": {
      "zh": { personalityTags: ["体贴心", "守信感", "会接话"], soulVerdict: "你愿意多听一点别人没说完的事，也更珍惜说过之后真能兑现的关心。" },
      "zh-TW": { personalityTags: ["體貼心", "守信感", "會接話"], soulVerdict: "你願意多聽一點別人沒說完的事，也更珍惜說過之後真的做得到的關心。" },
      "en": { personalityTags: ["Attuned", "Dependable", "Curious"], soulVerdict: "You like care that asks a little more and remembers to come back when it matters." },
    },
    "warmth-follow-through-boundaries": {
      "zh": { personalityTags: ["暖心有界", "可靠感", "坦诚派"], soulVerdict: "你习惯先想对方需要多少，再说明自己给得起多少，这样彼此都踏实。" },
      "zh-TW": { personalityTags: ["暖心有界", "可靠感", "坦誠派"], soulVerdict: "你習慣先想對方需要多少，再說明自己給得起多少，這樣彼此都踏實。" },
      "en": { personalityTags: ["Warm", "Dependable", "Boundaried"], soulVerdict: "You like care that hears the need, names a limit, and follows through on the part offered." },
    },
    "warmth-lightness-curiosity": {
      "zh": { personalityTags: ["开朗体贴", "好奇心", "松弛感"], soulVerdict: "你喜欢边听边笑的聊天，也愿意等那个还没说出口的人找到话头。" },
      "zh-TW": { personalityTags: ["開朗體貼", "好奇心", "自在感"], soulVerdict: "你喜歡邊聽邊笑的聊天，也願意等那個還沒說出口的人找到話頭。" },
      "en": { personalityTags: ["Warm", "Playful", "Curious"], soulVerdict: "You like a conversation with room to laugh and still hear the quieter person out." },
    },
    "warmth-lightness-boundaries": {
      "zh": { personalityTags: ["温柔松弛", "有分寸", "坦然心"], soulVerdict: "你愿意用轻松的方式让人放下拘束，也允许对方不必回应同一种热闹。" },
      "zh-TW": { personalityTags: ["溫柔自在", "有分寸", "坦然心"], soulVerdict: "你願意用輕鬆的方式讓人放下拘束，也允許對方不必回應同一種熱鬧。" },
      "en": { personalityTags: ["Warm", "Easygoing", "Boundaried"], soulVerdict: "You like easing the room without making anyone join in before they feel ready." },
    },
    "warmth-curiosity-boundaries": {
      "zh": { personalityTags: ["细腻好奇", "有界线", "真诚感"], soulVerdict: "你想了解别人，也会先留意那些不必问到底的地方，关心可以轻一点。" },
      "zh-TW": { personalityTags: ["細膩好奇", "有界線", "真誠感"], soulVerdict: "你想了解別人，也會先留意那些不必問到底的地方，關心可以輕一點。" },
      "en": { personalityTags: ["Attuned", "Curious", "Boundaried"], soulVerdict: "You like knowing more about people and knowing when a question can be left open." },
    },
    "follow-through-lightness-curiosity": {
      "zh": { personalityTags: ["松弛可靠", "好奇心", "互动感"], soulVerdict: "你喜欢有点新鲜又能接得住的来往，聊天有趣，等到了约好的时候也实在。" },
      "zh-TW": { personalityTags: ["自在可靠", "好奇心", "交流感"], soulVerdict: "你喜歡有點新鮮又能接得住的來往，聊天有趣，等到了約好的時候也實在。" },
      "en": { personalityTags: ["Dependable", "Playful", "Curious"], soulVerdict: "You like an interesting exchange with enough follow-through to meet up again." },
    },
    "follow-through-lightness-boundaries": {
      "zh": { personalityTags: ["踏实自在", "守信感", "有分寸"], soulVerdict: "你在意好相处也讲分寸，能给的就大方给，答应过的就记在心上。" },
      "zh-TW": { personalityTags: ["踏實自在", "守信感", "有分寸"], soulVerdict: "你在意好相處也講分寸，能給的就大方給，答應過的就記在心上。" },
      "en": { personalityTags: ["Dependable", "Easygoing", "Boundaried"], soulVerdict: "You like an easy pace with clear limits and promises solid enough to stand on." },
    },
    "follow-through-curiosity-boundaries": {
      "zh": { personalityTags: ["认真有界", "好奇心", "稳当派"], soulVerdict: "你会多问一点对方真的需要什么，也会说明能帮多少，心里因此更踏实。" },
      "zh-TW": { personalityTags: ["認真有界", "好奇心", "穩當派"], soulVerdict: "你會多問一點對方真的需要什麼，也會說明能幫多少，心裡因此更踏實。" },
      "en": { personalityTags: ["Curious", "Dependable", "Boundaried"], soulVerdict: "You like finding out what would help, then offering the part you can really keep." },
    },
    "lightness-curiosity-boundaries": {
      "zh": { personalityTags: ["轻松好奇", "有分寸", "坦然心"], soulVerdict: "你爱聊得轻快的新话题，也希望听的人可以笑着说这段我先跳过。" },
      "zh-TW": { personalityTags: ["輕鬆好奇", "有分寸", "坦然心"], soulVerdict: "你愛聊得輕快的新話題，也希望聽的人可以笑著說這段我先跳過。" },
      "en": { personalityTags: ["Lighthearted", "Curious", "Boundaried"], soulVerdict: "You like a fresh topic with enough freedom for someone to laugh and pass on it." },
    },
    "follow-through-lightness-curiosity-boundaries": {
      "zh": { personalityTags: ["稳当开朗", "有界线", "好奇心"], soulVerdict: "你喜欢实在又好玩的来往，既有想继续聊的兴致，也有能说清的分寸。" },
      "zh-TW": { personalityTags: ["穩當開朗", "有界線", "好奇心"], soulVerdict: "你喜歡實在又好玩的來往，既有想繼續聊的興致，也有能說清的分寸。" },
      "en": { personalityTags: ["Dependable", "Playful", "Boundaried"], soulVerdict: "You like company with real follow-through, lively curiosity, and space to set a limit." },
    },
    "warmth-lightness-curiosity-boundaries": {
      "zh": { personalityTags: ["温暖开朗", "好奇心", "有分寸"], soulVerdict: "你能在热闹里留意别人的情绪，也会把问题问得轻一点，让人自在回答。" },
      "zh-TW": { personalityTags: ["溫暖開朗", "好奇心", "有分寸"], soulVerdict: "你能在熱鬧裡留意別人的情緒，也會把問題問得輕一點，讓人自在回答。" },
      "en": { personalityTags: ["Warm", "Curious", "Boundaried"], soulVerdict: "You like warm, lively questions that still let the other person choose how to answer." },
    },
    "warmth-follow-through-curiosity-boundaries": {
      "zh": { personalityTags: ["温柔可靠", "好奇心", "坦然有界"], soulVerdict: "你愿意听人慢慢说，也珍惜答应过的实在帮助，彼此能说不才安心。" },
      "zh-TW": { personalityTags: ["溫柔可靠", "好奇心", "坦然有界"], soulVerdict: "你願意聽人慢慢說，也珍惜答應過的實在幫助，彼此能說不才安心。" },
      "en": { personalityTags: ["Attuned", "Dependable", "Boundaried"], soulVerdict: "You like listening closely and offering reliable help that someone can still turn down." },
    },
    "warmth-follow-through-lightness-boundaries": {
      "zh": { personalityTags: ["亲切稳当", "自在感", "边界清楚"], soulVerdict: "你喜欢把关系处得温暖轻松，答应的事有交代，各自的界线也能讲明白。" },
      "zh-TW": { personalityTags: ["親切穩當", "自在感", "邊界清楚"], soulVerdict: "你喜歡把關係處得溫暖輕鬆，答應的事有交代，各自的界線也能講明白。" },
      "en": { personalityTags: ["Warm", "Dependable", "Boundaried"], soulVerdict: "You like a warm, easy bond with promises that hold and limits both people understand." },
    },
    "warmth-follow-through-lightness-curiosity": {
      "zh": { personalityTags: ["开朗体贴", "可靠感", "会接话"], soulVerdict: "你喜欢聊天有来有回，也看重散场以后，还能记住别人真正说过的话。" },
      "zh-TW": { personalityTags: ["開朗體貼", "可靠感", "會接話"], soulVerdict: "你喜歡聊天有來有回，也看重散場以後，還能記住別人真正說過的話。" },
      "en": { personalityTags: ["Warm", "Dependable", "Curious"], soulVerdict: "You like an exchange that is easy to join and remembered after the room goes quiet." },
    },
    "all-five-tied": {
      "zh": { personalityTags: ["多面感", "相处弹性", "情境心"], soulVerdict: "你把温暖、可靠、轻松、好奇和界线都看得一样重要，本轮没有单一主调。" },
      "zh-TW": { personalityTags: ["多面感", "相處彈性", "情境心"], soulVerdict: "你把溫暖、可靠、輕鬆、好奇和界線都看得一樣重要，本輪沒有單一主調。" },
      "en": { personalityTags: ["Versatile", "Context-Aware", "Relational"], soulVerdict: "You gave warmth, reliability, ease, curiosity, and boundaries equal room this time." },
    },
  },
  "philosopher-personality-test": {
    "socrates": {
      "zh": { personalityTags: ["追问派", "求证心", "不拘成见"], soulVerdict: "你喜欢把众人都说知道的事再问一次，答案开裂的地方可能最有意思。" },
      "zh-TW": { personalityTags: ["追問派", "求證心", "不拘成見"], soulVerdict: "你喜歡把大家都說知道的事再問一次，答案有裂縫的地方最有意思。" },
      "en": { personalityTags: ["Questioning", "Evidence-Minded", "Curious"], soulVerdict: "You like asking one more question when everyone seems sure they already know." },
    },
    "aristotle": {
      "zh": { personalityTags: ["细察派", "务实理性", "审慎心"], soulVerdict: "你喜欢把判断放回具体处境再看，同一句原则换个场合未必落在同一处。" },
      "zh-TW": { personalityTags: ["細察派", "務實理性", "審慎心"], soulVerdict: "你喜歡把判斷放回具體處境再看，同一句原則換個場合未必落在同一處。" },
      "en": { personalityTags: ["Practical", "Discerning", "Considered"], soulVerdict: "You like seeing how a judgment changes when it has to meet the particulars." },
    },
    "confucius": {
      "zh": { personalityTags: ["温厚反思", "同伴感", "好学心"], soulVerdict: "你常从彼此怎样相处开始想，别人做得好的地方也是你学习的一扇窗。" },
      "zh-TW": { personalityTags: ["溫厚反思", "同伴感", "好學心"], soulVerdict: "你常從彼此怎樣相處開始想，別人做得好的地方也是你學習的另一扇窗。" },
      "en": { personalityTags: ["Reflective", "Learning-Minded", "Relational"], soulVerdict: "You like learning from how people treat each other in ordinary moments together." },
    },
    "laozi": {
      "zh": { personalityTags: ["留白感", "从容派", "顺势心"], soulVerdict: "你更愿意看看有没有用力过头的地方，松开一点，局面也许自己就变了。" },
      "zh-TW": { personalityTags: ["留白感", "從容派", "順勢心"], soulVerdict: "你更願意看看有沒有用力過頭的地方，鬆開一點，局面也許自己就變了。" },
      "en": { personalityTags: ["Unhurried", "Observant", "Light Touch"], soulVerdict: "You like noticing where less force might let a situation take a better shape." },
    },
    "epicurus": {
      "zh": { personalityTags: ["知足心", "清醒取舍", "朴素派"], soulVerdict: "你更在意愿望要付出什么，有时一件简单的快乐，能让你舒服更久。" },
      "zh-TW": { personalityTags: ["知足心", "清醒取捨", "樸素派"], soulVerdict: "你更在意願望要付出什麼，有時一件簡單的快樂，能讓你舒服更久。" },
      "en": { personalityTags: ["Contented", "Discerning", "Down-to-Earth"], soulVerdict: "You like asking what a desire costs and keeping the simple joys that feel worth it." },
    },
    "epictetus": {
      "zh": { personalityTags: ["清醒感", "有分寸", "内省派"], soulVerdict: "你更愿意分清眼前能选什么，再把那些并不由自己说了算的结果放一放。" },
      "zh-TW": { personalityTags: ["清醒感", "有分寸", "內省派"], soulVerdict: "你更願意分清眼前能選什麼，再把那些並不由自己說了算的結果放一放。" },
      "en": { personalityTags: ["Clear-Eyed", "Reflective", "Boundaried"], soulVerdict: "You like sorting what you can choose from what the outcome may do on its own." },
    },
    "nietzsche": {
      "zh": { personalityTags: ["独立锋芒", "求真心", "重估派"], soulVerdict: "你会多问一句手里这把尺子从哪儿来，连自己最习惯的标准也能再想想。" },
      "zh-TW": { personalityTags: ["獨立鋒芒", "求真心", "重估派"], soulVerdict: "你會多問一句手裡這把尺子從哪裡來，連自己最習慣的標準也能再想想。" },
      "en": { personalityTags: ["Questioning", "Independent", "Clear-Eyed"], soulVerdict: "You like asking who made the measuring stick, even when it's the one you reach for." },
    },
    "simone-de-beauvoir": {
      "zh": { personalityTags: ["自由感", "共处意识", "有主见"], soulVerdict: "你喜欢保有自己的方向，也会问那个方向有没有给别人的自由留出路。" },
      "zh-TW": { personalityTags: ["自由感", "共處意識", "有主見"], soulVerdict: "你喜歡保有自己的方向，也會問那個方向有沒有給別人的自由留出路。" },
      "en": { personalityTags: ["Independent", "Reciprocal", "Reflective"], soulVerdict: "You value choosing your own direction and keeping other people's choices in view." },
    },
    "marcus-aurelius": {
      "zh": { personalityTags: ["沉着内省", "当下感", "温厚自持"], soulVerdict: "你更愿意先看看此刻的判断，再决定自己的回应，安静也能很有分量。" },
      "zh-TW": { personalityTags: ["沉著內省", "當下感", "溫厚自持"], soulVerdict: "你更願意先看看此刻的判斷，再決定自己的回應，安靜也能很有分量。" },
      "en": { personalityTags: ["Composed", "Present-Minded", "Reflective"], soulVerdict: "You like checking your own judgment in the moment before choosing how to respond." },
    },
  },
  "gta-6-character-quiz": {
    "lucia-caminos": {
      "zh": { personalityTags: ["果断开局", "目标清楚", "有胆识"], soulVerdict: "你容易看见混乱里还走得通的那一步，能出手时更愿意让事情活起来。" },
      "zh-TW": { personalityTags: ["果斷開局", "目標清楚", "有膽識"], soulVerdict: "你容易看見混亂裡還走得通的那一步，能出手時更願意讓事情活起來。" },
      "en": { personalityTags: ["Decisive", "Bold Starter", "Purposeful"], soulVerdict: "You spot the move the crew can make now and like giving the night a direction." },
    },
    "jason-duval": {
      "zh": { personalityTags: ["可靠担当", "稳场心", "重诺感"], soulVerdict: "你比较看重散场时还愿意留下的人，承诺能做到最后才让你心里踏实。" },
      "zh-TW": { personalityTags: ["可靠擔當", "穩場心", "重諾感"], soulVerdict: "你比較看重散場時還願意留下的人，承諾能做到最後才讓你心裡踏實。" },
      "en": { personalityTags: ["Steady Anchor", "Dependable", "Loyal"], soulVerdict: "You like keeping your word when the music gets loud and staying for the wrap." },
    },
    "cal-hampton": {
      "zh": { personalityTags: ["眼尖心细", "求证派", "冷静感"], soulVerdict: "你听见群里传得很快的消息时，反而更想知道最初是谁看见了什么。" },
      "zh-TW": { personalityTags: ["眼尖心細", "求證派", "沉著感"], soulVerdict: "你聽到群組裡的消息傳得很快，反而想先問清楚到底是誰看見了什麼。" },
      "en": { personalityTags: ["Sharp-Eyed", "Skeptical", "Composed"], soulVerdict: "You hear a rumor move through the chat and want to know what anyone actually saw." },
    },
    "brian-heder": {
      "zh": { personalityTags: ["幕后气场", "布局脑", "沉着派"], soulVerdict: "你常先想到灯熄以后谁能接手，有个能接得住的后招，比出风头更舒服。" },
      "zh-TW": { personalityTags: ["幕後氣場", "佈局腦", "沉著派"], soulVerdict: "你常先想到燈熄以後誰能接手，有個能接得住的後招，比出風頭更舒服。" },
      "en": { personalityTags: ["Strategic", "Steady Backup", "Prepared"], soulVerdict: "You like knowing who's got the handoff covered long before the room needs it." },
    },
    "raul-bautista": {
      "zh": { personalityTags: ["敢冒险", "机会眼", "果决劲"], soulVerdict: "你会被最后十分钟仍有机会的感觉吸引，喜欢看看能不能再开一扇门。" },
      "zh-TW": { personalityTags: ["敢冒險", "機會眼", "果決勁"], soulVerdict: "你會被最後十分鐘仍有機會的感覺吸引，喜歡看看能不能再開一扇門。" },
      "en": { personalityTags: ["Bold", "Opportunity-Minded", "Quick Spark"], soulVerdict: "You see the last ten minutes as a window and like finding one more move worth trying." },
    },
    "boobie-ike": {
      "zh": { personalityTags: ["谈判脑", "务实派", "有远虑"], soulVerdict: "你更喜欢把成本和条件摊开来说，能让这场事还有下一回才够痛快。" },
      "zh-TW": { personalityTags: ["談判腦", "務實派", "有遠慮"], soulVerdict: "你更喜歡把成本和條件攤開來說，能讓這場事還有下一回才夠痛快。" },
      "en": { personalityTags: ["Pragmatic", "Terms-Minded", "Strategic"], soulVerdict: "You like the venue and terms on the table so a good night has a shot at a sequel." },
    },
    "drequan-priest": {
      "zh": { personalityTags: ["审美耳朵", "创作心", "主场感"], soulVerdict: "你希望再小的场地也有独特的调子，一只音箱也值得把声音做对。" },
      "zh-TW": { personalityTags: ["聲音品味", "創作心", "主場感"], soulVerdict: "你希望場地再小也能有自己的聲音，就算只剩一顆喇叭也一樣。" },
      "en": { personalityTags: ["Sound-Minded", "Creative", "Distinctive"], soulVerdict: "You want tonight to sound like itself, even when the crew only has one speaker." },
    },
    "real-dimez": {
      "zh": { personalityTags: ["聚光感", "舞台心", "会带气氛"], soulVerdict: "你偏爱把台上热度传到台下的瞬间，能让人一起接上拍子就够过瘾。" },
      "zh-TW": { personalityTags: ["聚光感", "舞台感", "帶氣氛"], soulVerdict: "你偏愛把台上的熱度傳到台下的瞬間，能讓人一起接上節拍就夠有意思。" },
      "en": { personalityTags: ["Magnetic", "Stage-Minded", "Spirited"], soulVerdict: "You like the moment a room catches the rhythm and the crowd becomes part of the show." },
    },
  },
  "love-type-16": {
    "lcro": {
      "zh": { personalityTags: ["主动感", "自在心", "务实松弛"], soulVerdict: "你愿意先抛个轻松实际的邀约，也喜欢有人回应你，细节可以边走边定。" },
      "zh-TW": { personalityTags: ["主動感", "自在心", "務實自在"], soulVerdict: "你願意先丟個輕鬆實在的邀約，也喜歡有人回應，細節可以邊走邊聊。" },
      "en": { personalityTags: ["Initiating", "Practical", "Easygoing"], soulVerdict: "You like floating a practical plan, feeling cared for, and leaving the details flexible." },
    },
    "lcre": {
      "zh": { personalityTags: ["主动坦然", "踏实派", "重明确"], soulVerdict: "你喜欢先发出一个做得到的邀请，也希望关心接得住，彼此的意图讲得清楚。" },
      "zh-TW": { personalityTags: ["主動坦然", "踏實派", "重明確"], soulVerdict: "你喜歡先發出一個做得到的邀請，也希望關心接得住，彼此的意圖講得清楚。" },
      "en": { personalityTags: ["Initiating", "Practical", "Intentional"], soulVerdict: "You like making the first practical offer and finding clear intent and care in reply." },
    },
    "lcpo": {
      "zh": { personalityTags: ["浪漫主动", "松弛感", "易被打动"], soulVerdict: "你乐意先为见面添点浪漫，也享受被关心的感觉，临时小变化同样好玩。" },
      "zh-TW": { personalityTags: ["浪漫主動", "自在感", "易被打動"], soulVerdict: "你樂意先為見面添點浪漫，也享受被關心的感覺，臨時小變化同樣好玩。" },
      "en": { personalityTags: ["Romantic", "Initiating", "Easygoing"], soulVerdict: "You like offering the spark, receiving some care back, and leaving room for a surprise." },
    },
    "lcpe": {
      "zh": { personalityTags: ["浪漫主动", "重心意", "有方向"], soulVerdict: "你愿意先把约会提出来，既喜欢对方的体贴，也在意这一刻想表达什么。" },
      "zh-TW": { personalityTags: ["浪漫主動", "重心意", "有方向"], soulVerdict: "你願意先把約會提出來，既喜歡對方的體貼，也在意這一刻想表達什麼。" },
      "en": { personalityTags: ["Romantic", "Intentional", "Initiating"], soulVerdict: "You like setting a romantic moment in motion and knowing what its care is meant to say." },
    },
    "laro": {
      "zh": { personalityTags: ["暖心主动", "务实心", "有弹性"], soulVerdict: "你愿意先想个做得到的约法，也更爱伸手照顾对方，细节可以留点余地。" },
      "zh-TW": { personalityTags: ["暖心主動", "務實心", "有彈性"], soulVerdict: "你願意先想個做得到的約法，也更愛伸手照顧對方，細節可以留點餘地。" },
      "en": { personalityTags: ["Practical", "Nurturing", "Flexible"], soulVerdict: "You like offering the plan and the care, with room for the details to shift." },
    },
    "lare": {
      "zh": { personalityTags: ["踏实担当", "主动感", "计划清楚"], soulVerdict: "你愿意先把能做的事提明白，也乐意照顾人的需要，心里偏爱有个共识。" },
      "zh-TW": { personalityTags: ["踏實擔當", "主動感", "計畫清楚"], soulVerdict: "你願意先把能做的事提明白，也樂意照顧人的需要，心裡偏愛有個共識。" },
      "en": { personalityTags: ["Practical", "Nurturing", "Intentional"], soulVerdict: "You like stepping in with a workable offer, some care, and a plan you can explain." },
    },
    "lapo": {
      "zh": { personalityTags: ["浪漫照应", "主动心", "灵活派"], soulVerdict: "你愿意先为见面点亮一处，照顾人在意的细节，也容得下即兴转弯。" },
      "zh-TW": { personalityTags: ["浪漫照應", "主動心", "靈活派"], soulVerdict: "你願意先為見面點亮一處，照顧人在意的細節，也容得下即興轉彎。" },
      "en": { personalityTags: ["Romantic", "Nurturing", "Flexible"], soulVerdict: "You like making the first warm gesture and giving a romantic plan room to improvise." },
    },
    "lape": {
      "zh": { personalityTags: ["热心郑重", "浪漫派", "有方向"], soulVerdict: "你愿意把浪漫邀约和体贴一起做好，也希望对方知道这份心意从哪来。" },
      "zh-TW": { personalityTags: ["熱心鄭重", "浪漫派", "有方向"], soulVerdict: "你願意把浪漫邀約和體貼一起做好，也希望對方知道這份心意從哪來。" },
      "en": { personalityTags: ["Romantic", "Nurturing", "Intentional"], soulVerdict: "You like initiating a romantic plan and making the intent behind its care clear." },
    },
    "fcro": {
      "zh": { personalityTags: ["随和感", "踏实心", "回应派"], soulVerdict: "你更喜欢有人先抛来实在的邀请，照顾收到就开心，行程可以留点弹性。" },
      "zh-TW": { personalityTags: ["隨和感", "踏實心", "回應派"], soulVerdict: "你更喜歡有人先拋來實在的邀請，照顧收到就開心，行程可以留點彈性。" },
      "en": { personalityTags: ["Receptive", "Practical", "Easygoing"], soulVerdict: "You like a practical invitation you can respond to, with some care and flexible plans." },
    },
    "fcre": {
      "zh": { personalityTags: ["温和回应", "务实心", "喜清楚"], soulVerdict: "你更容易接住明确又实际的邀约，从对方做得到的体贴感到踏实。" },
      "zh-TW": { personalityTags: ["溫和回應", "務實心", "喜清楚"], soulVerdict: "你更容易接住明確又實際的邀約，從對方做得到的體貼感到踏實。" },
      "en": { personalityTags: ["Receptive", "Practical", "Clarity-Minded"], soulVerdict: "You like responding to an offer whose practical details and intentions feel clear." },
    },
    "fcpo": {
      "zh": { personalityTags: ["浪漫感", "随和心", "慢慢回应"], soulVerdict: "你喜欢接住一个带点浪漫的邀请，临时改变方向，也能很舒服地一起玩。" },
      "zh-TW": { personalityTags: ["浪漫感", "隨和心", "慢慢回應"], soulVerdict: "你喜歡接住一個帶點浪漫的邀請，臨時改變方向，也能很舒服地一起玩。" },
      "en": { personalityTags: ["Receptive", "Romantic", "Easygoing"], soulVerdict: "You like receiving a little romance and seeing where an unplanned turn might lead." },
    },
    "fcpe": {
      "zh": { personalityTags: ["含蓄浪漫", "回应派", "意图清楚"], soulVerdict: "你喜欢在意图明白的浪漫邀约里慢慢回应，知道对方的用心才更愿意靠近。" },
      "zh-TW": { personalityTags: ["含蓄浪漫", "回應派", "意圖清楚"], soulVerdict: "你喜歡在意圖明白的浪漫邀約裡慢慢回應，知道對方的用心才更願意靠近。" },
      "en": { personalityTags: ["Receptive", "Romantic", "Intentional"], soulVerdict: "You like a romantic invitation you can respond to once its intention feels clear." },
    },
    "faro": {
      "zh": { personalityTags: ["温厚照应", "务实松弛", "回应派"], soulVerdict: "你更自在地回应别人先提的安排，也愿意搭把手，细节不妨边走边调。" },
      "zh-TW": { personalityTags: ["溫厚照應", "務實自在", "回應派"], soulVerdict: "你更自在地回應別人先提的安排，也願意搭把手，細節不妨邊走邊調。" },
      "en": { personalityTags: ["Receptive", "Nurturing", "Flexible"], soulVerdict: "You like responding to a practical plan and making it easier for the other person." },
    },
    "fare": {
      "zh": { personalityTags: ["务实体贴", "稳当派", "回应心"], soulVerdict: "你喜欢回应讲得清楚的计划，也乐意把照顾放到一件真的能帮到的事上。" },
      "zh-TW": { personalityTags: ["務實體貼", "穩當派", "回應心"], soulVerdict: "你喜歡回應講得清楚的計畫，也樂意把照顧放到一件真的能幫到的事上。" },
      "en": { personalityTags: ["Receptive", "Practical", "Nurturing"], soulVerdict: "You like a clear plan you can respond to and a concrete way to show your care." },
    },
    "fapo": {
      "zh": { personalityTags: ["温柔浪漫", "自在感", "回应派"], soulVerdict: "你愿意接住有人先提的浪漫想法，再顺手添一点体贴，偶尔变个花样也好。" },
      "zh-TW": { personalityTags: ["溫柔浪漫", "自在感", "回應派"], soulVerdict: "你願意接住有人先提的浪漫想法，再順手添一點體貼，偶爾變個花樣也好。" },
      "en": { personalityTags: ["Romantic", "Nurturing", "Responsive"], soulVerdict: "You like taking up a romantic suggestion and giving it your own warm, flexible touch." },
    },
    "fape": {
      "zh": { personalityTags: ["细腻郑重", "浪漫心", "回应感"], soulVerdict: "你偏爱心意说得明白的浪漫邀约，更愿意用照顾对方的细节来回应。" },
      "zh-TW": { personalityTags: ["細膩鄭重", "浪漫心", "回應感"], soulVerdict: "你偏愛心意說得明白的浪漫邀約，更願意用照顧對方的細節來回應。" },
      "en": { personalityTags: ["Romantic", "Intentional", "Responsive"], soulVerdict: "You like responding to a clear romantic gesture with a thoughtful one of your own." },
    },
  },
  "mental-age": {
    "10": {
      "zh": { personalityTags: ["新鲜感", "玩心足", "明亮探索"], soulVerdict: "你更容易被没试过的体验点亮，今天有一点意外，就已经值得期待。" },
      "zh-TW": { personalityTags: ["新鮮感", "玩心足", "明亮探索"], soulVerdict: "你更容易被沒試過的體驗點亮，今天有一點意外，就已經值得期待。" },
      "en": { personalityTags: ["Novelty-Loving", "Playful", "Curious"], soulVerdict: "You leaned toward a fresh spark and liked leaving room for an unexpected little turn." },
    },
    "19": {
      "zh": { personalityTags: ["轻快派", "好奇心", "即兴感"], soulVerdict: "你愿意让熟悉的一天突然多一条岔路，看看有什么小惊喜会自己跑出来。" },
      "zh-TW": { personalityTags: ["輕快派", "好奇心", "即興感"], soulVerdict: "你喜歡讓熟悉的一天突然繞點遠路，看看有什麼驚喜自己跑出來。" },
      "en": { personalityTags: ["Playful", "Spontaneous", "Curious"], soulVerdict: "You leaned toward a light detour and the small discovery that comes with it." },
    },
    "28": {
      "zh": { personalityTags: ["混搭感", "自在心", "好奇温和"], soulVerdict: "你喜欢熟悉的日子不太满，余下那一点地方，正好放一个没试过的点子。" },
      "zh-TW": { personalityTags: ["混搭感", "自在心", "好奇溫和"], soulVerdict: "你喜歡熟悉的日子不太滿，餘下那一點地方，正好放一個沒試過的點子。" },
      "en": { personalityTags: ["Curious", "Varied Pace", "Open-Minded"], soulVerdict: "You enjoyed familiar comforts with a little spare room for something new." },
    },
    "37": {
      "zh": { personalityTags: ["弹性感", "随心派", "节奏多样"], soulVerdict: "你这次选到了热闹和安静的两边，有些时候你很想试，有些只想坐坐。" },
      "zh-TW": { personalityTags: ["彈性感", "隨心派", "步調多樣"], soulVerdict: "你這次的選擇有熱鬧也有安靜，有時想玩點新的，有時只想坐坐。" },
      "en": { personalityTags: ["Flexible", "Varied Pace", "Context-Aware"], soulVerdict: "You made room for both familiar and unusual choices, depending on the moment." },
    },
    "44": {
      "zh": { personalityTags: ["踏实感", "有准备", "舒服节拍"], soulVerdict: "你更喜欢从熟悉的地方开始，心里稍微有点准备，走出去也就容易一些。" },
      "zh-TW": { personalityTags: ["踏實感", "有準備", "舒服節拍"], soulVerdict: "你更喜歡從熟悉的地方開始，心裡稍微有點準備，走出去也就容易一些。" },
      "en": { personalityTags: ["Grounded", "Prepared", "Comfort-Minded"], soulVerdict: "You leaned toward a familiar setting and a little preparation before making your move." },
    },
    "53": {
      "zh": { personalityTags: ["从容派", "安静节拍", "熟悉感"], soulVerdict: "你偏爱让日子慢一点，熟悉的做法会让你腾出心思，舒服地享受当下。" },
      "zh-TW": { personalityTags: ["從容派", "安靜節拍", "熟悉感"], soulVerdict: "你偏愛讓日子慢一點，熟悉的做法會讓你騰出心思，舒服地享受當下。" },
      "en": { personalityTags: ["Unhurried", "Steady Pace", "Quiet Ease"], soulVerdict: "You leaned toward a slower rhythm and the comfort of a routine you already enjoy." },
    },
    "62": {
      "zh": { personalityTags: ["稳稳的", "仪式感", "有章法"], soulVerdict: "你更喜欢先知道事情会怎样展开，那些重复的小仪式能让一天安稳下来。" },
      "zh-TW": { personalityTags: ["穩穩的", "儀式感", "有章法"], soulVerdict: "你更喜歡先知道事情會怎樣展開，那些重複的小儀式能讓一天安穩下來。" },
      "en": { personalityTags: ["Steady", "Ritual-Minded", "Comfort-Minded"], soulVerdict: "You leaned toward familiar forms and enjoyed the steadiness a small ritual can bring." },
    },
  },
};

export function getWave2aHonorCopy(slug: string, id: string, locale: DisplayLocale): ArchetypeHonorCopy {
  const copy = wave2aHonorCopy[slug]?.[id]?.[locale];
  if (!copy) throw new Error(`Missing wave 2A honor copy for ${slug}/${id}/${locale}`);
  return copy;
}
