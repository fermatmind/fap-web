// Synthetic contract markers only. Reader copy is owned by the backend database.
import { MBTI_TRAIT_AXES, type MbtiTraitEntry } from "@/lib/cms/mbti-trait-explanations";
export function traitCatalogResponse() {
  const entries: MbtiTraitEntry[] = [];
  for (const axis of MBTI_TRAIT_AXES) {
    entries.push({ axis_code: axis, pole: "balanced", min: 50, max: 50, a: `${axis} balanced A`, b: `${axis} balanced B` });
    for (const pole of axis) for (const [min, max] of [[51, 59], [60, 69], [70, 79], [80, 89], [90, 100]]) {
      entries.push({ axis_code: axis, pole, min, max, a: `${axis} ${pole} ${min} A`, b: `${axis} ${pole} ${min} B` });
    }
  }
  const overviews = [];
  for (const ei of "EI") for (const sn of "SN") for (const tf of "TF") for (const jp of "JP") for (const at of "AT") {
    const full_code = `${ei}${sn}${tf}${jp}-${at}`;
    overviews.push({ full_code, paragraphs: [`${full_code} overview first`, `${full_code} overview second`] });
  }
  return { overviews, ok: true, schema: "mbti_trait_explanations.v1", locale: "zh-CN", revision: 1, content_hash: "a".repeat(64), entries };
}
