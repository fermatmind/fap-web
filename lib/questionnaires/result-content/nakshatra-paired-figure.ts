import type { QuestionnaireProfile } from "../types";

/** IGNOU Block 2, printed p.133 says yamala-purusha: a paired human figure, not two faces. */
export function correctPairedFigure(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (profile.id !== "uttara-bhadrapada") return profile;
  const summary = {
    zh: "所引教材的符号是成对人形（yamala-purusha）；本篇以双视角作原创反思，比较事实、需要与未解决差异，不把人标成欺骗或分裂。",
    en: "The cited teaching-source figure is a human pair (yamala-purusha). This original two-perspective reflection compares facts, needs and unresolved differences without labeling anyone deceptive or divided.",
  };
  return { ...profile, headline: { zh: "Uttara Bhadrapada · 成对人形 · Manushya gana · 土星（Vimshottari）", en: "Uttara Bhadrapada · human pair · Manushya gana · Saturn (Vimshottari)" }, summary,
    ...(profile.seo ? { seo: { ...profile.seo, description: summary } } : {}),
    sections: profile.sections.map(section => ({ ...section, paragraphs: section.paragraphs.map(text => ({
      zh: text.zh.replace("所选教材符号为双面", "所选教材符号为成对人形（yamala-purusha）").replace("传统形象中的双面可以邀请比较视角，本篇不把它变成", "本篇借成对人形作双视角的原创比喻，不把它变成").replace("双面应让实际视角更清楚", "本篇双视角比喻应让实际视角更清楚"),
      en: text.en.replace("symbol is a two faces", "symbol is a human pair (yamala-purusha)").replace("Two faces in a traditional figure can invite a comparison between viewpoints.", "This original reading uses the paired human figure as a metaphor for comparing viewpoints.").replace("The two-faces image is useful", "This two-perspective metaphor is useful"),
    })) })),
  };
}
