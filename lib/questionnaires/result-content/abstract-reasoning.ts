import content from "./abstract-reasoning.json";
import type { QuestionnaireProfile, QuestionnaireSection } from "../types";

const originalScope = {"en": "A sequence question asks which operation can connect successive states. In these six items, the permitted operations are stated, so you compare a finite set rather than inventing an unlimited story. Track token order, row length and repeated positions separately. A row can change appearance while preserving the number of each token. Inversion changes bit counts, whereas rotation only changes positions. Those differences let you eliminate an operation before calculating every later step.", "zh": "序列题要找能连接相邻状态的操作。本组六题明示候选规则，因此是在有限集合中比较，不是任意编规律。分别追踪符号顺序、串长和重复位置。外观改变时，各符号数量可能仍不变：位互换可改0、1数量，轮移只改位置。抓住区别可先排除一部分规则。"};
const clarifiedScope = {"en": "A sequence question asks which operation can connect successive states. In these six items, the permitted operations are stated, so you compare a finite set rather than inventing an unlimited story. Track token order, row length and repeated positions separately. A row can change appearance while preserving the number of each token. Bitwise inversion can change bit counts, whereas rotation only changes positions. Those differences let you eliminate an operation before calculating every later step.", "zh": "序列题要找能连接相邻状态的操作。本组六题明示候选规则，因此是在有限集合中比较，不是任意编规律。分别追踪符号顺序、串长和重复位置。外观改变时，各符号数量可能仍不变：逐位取反可能改变0、1各自数量，轮移只改位置。抓住区别可先排除一部分规则。"};

export function abstractReasoningResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const sections = profile.id === "series" ? profile.sections.map(section => section.id !== "1-scope" ? section : {
    ...section, paragraphs: section.paragraphs.map(paragraph => paragraph.en === originalScope.en && paragraph.zh === originalScope.zh ? { ...clarifiedScope } : paragraph),
  }) : profile.sections;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...sections, ...additions] };
}
