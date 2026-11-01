import content from "./response-color.json";
import type { QuestionnaireProfile, QuestionnaireSection, Text } from "../types";

const text = (zh: string, en: string): Text => ({ zh, en });
const section = (id: string, title: Text, ...paragraphs: Text[]): QuestionnaireSection => ({ id: `editorial-${id}`, title, paragraphs });
const colours: Record<string, Text> = {
  RED: text("红·行动回应", "Red · Responding through action"),
  YELLOW: text("黄·开放联想", "Yellow · Exploring connections"),
  BLUE: text("蓝·审慎整理", "Blue · Careful organization"),
  GREEN: text("绿·稳定协调", "Green · Steady coordination"),
};

/** Editorial presentation of this edition, without modifying the source package or scorer. */
export function responseColorResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const editorial = (content as Record<string, { headline: Text; summary: Text; sections: QuestionnaireSection[] }>)[profile.id];
  if (!editorial || !profile.directionIds.every(id => colours[id])) return profile;
  const tied = profile.directionIds.length > 1;
  const labels = profile.directionIds.map(id => colours[id]);
  const sections = [section("counts", text("计数怎样支持这份结果", "How the counts support this reading"),
    text("完整作答24题，每题给所选方向记1次；四项总计24，各方向有12次比较机会。最高次数是本题组内的相对选择，不是百分位、能力或颜色浓度；低次数也不说明你不会或从不采用那种做法。", "Complete all 24 questions; each choice adds 1 to its selected direction. The four counts total 24, with 12 comparison opportunities per direction. The highest count reflects relative choices within this set, rather than percentile, ability or colour concentration. A low count does not establish that you cannot or never use an approach."),
    tied ? text("所有最高并列均保留，不按题号或颜色顺序打破同分。四项并列时每项必为6；两项或三项并列时，也没有由系统指定的主色。计数相同不能证明动机相同、能力相当或你在场景间灵活切换。", "Every highest tie is retained without question or colour order breaking it. In a four-way tie each count must be 6; two- and three-way ties also have no system-assigned primary colour. Equal counts do not establish equal motivation, ability or flexible switching between situations.") : text("哪怕只领先1次，也按原规则显示单项最高；但这1次不构成稳定性或准确率证据。相近计数可以作为回顾具体题目的线索，本版没有“差多少就算混合型”的阈值。", "Even a one-count lead produces a single-highest result under the original rule, but that lead does not establish stability or accuracy. Close counts may prompt review of particular questions; this edition has no threshold for declaring a blended type."))];
  if (tied) sections.push(...profile.sections.filter(s => s.id === "direction-readings"));
  sections.push(...editorial.sections,
    section("reality-check", text("把描述与真实经历对照", "Compare the description with experience"),
      text("上面的场景是示例，不是对你真实生活的推断。选一件愿意回顾的小事，记下当时限制、先做了什么、之后有什么效果，再找一次采用不同做法的经历。符合的部分可以保留，不符合的可以直接舍弃，不需要调整自己来符合颜色。", "The situations above are examples, rather than inferences about your life. Review an event you are comfortable considering: note constraints, your first action and its effect, then find an occasion when you used another approach. Keep what fits and reject what does not, without changing yourself to fit a colour.")),
    section("share", text("与朋友分享的一句话", "A sentence to share with a friend"),
      text(`“我这次性格色彩题组里，${labels.map(t => t.zh).join("、")}${tied ? "并列最高" : "次数最高"}。我想用它聊一聊我们做小决定时的不同入口，而不是用颜色给彼此定性。”你可以自己复制并改写这句话；它不会自动发布，也不要求对方透露答案。`,
        `“In this personality-colour attempt, ${labels.map(t => t.en).join(" / ")} ${tied ? "tied for the highest count" : "had the highest count"}. I would like to use it to discuss how we begin small decisions, rather than label each other.” You may copy and edit this sentence yourself. It does not publish automatically or require anyone to disclose answers.`),
      text("可以问：“同一件事里，你希望我先行动、继续想、理条件，还是先留一点空间？”颜色相同不保证合拍，颜色不同也不代表冲突。公开解读链接只显示通用说明，不携带个人计数或答卷。", "Ask: “In this situation, would you like action, more possibilities, clearer conditions or some space first?” Matching colours do not guarantee rapport, and different colours do not establish conflict. The public reading link shows a general explanation without personal counts or answers.")),
    section("method", text("颜色含义与方法边界", "Colour meanings and method limits"),
      text("四个颜色是费马本版原创选择入口的记忆符号，不是色彩知觉、审美偏好或生理指标。题目并非让你选择喜欢的颜色，不能拿喜欢蓝色、穿红衣服或房间配色来验证结果。", "The four colours are memory aids for this FermatMind edition’s original choice entry points, rather than colour perception, aesthetic preference or physiological indicators. Questions do not ask for favourite colours; liking blue, wearing red or decorating a room cannot validate the result."),
      text("本版尚未建立信度、效度、常模或双语等值。Color Code与Insights Discovery等产品使用各自的颜色、定义与报告体系，即便颜色名称相同也不能互换；下列官方页面仅帮助识别版本差异，不证明本题本有效。不要把本结果换算成DISC、MBTI、职业匹配、关系配对或心理诊断。", "Reliability, validity, population norms and bilingual equivalence have not been established for this edition. Products such as Color Code and Insights Discovery use their own colours, definitions and report systems; even identically named colours are not interchangeable. Their official pages below identify edition differences without validating this questionnaire. This result cannot be converted to DISC, MBTI, career fit, relationship pairing or diagnosis.")));
  return { ...profile, headline: editorial.headline, summary: editorial.summary, sections };
}
