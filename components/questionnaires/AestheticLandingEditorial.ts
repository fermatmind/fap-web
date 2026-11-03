import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "cottagecore": {
    "zh": "田园风：比较暖浅色、细花、织纹与柔和轮廓。通过两张保留相同暖色、改变图案密度的小卡，辨别真正喜欢的是配色、植物意象还是手作质感；不需要购买或乡居。",
    "en": "Cottagecore: compare pale warmth, small flowers, weave and soft outlines. Use two cards with the same warm colours but different pattern density to distinguish palette, plant motifs and handmade texture, without shopping or rural living."
  },
  "dark-academia": {
    "zh": "暗色学院风：拆解深色、纸页、书本意象与正式构图。尝试保留纸张层次，同时改变边框和留白，看看喜欢的是明暗、旧纸质感还是秩序；视觉兴趣不要求特定学历或阅读身份。",
    "en": "Dark Academia: separate deep colours, paper, book motifs and formal composition. Keep paper layers while changing borders and open space to explore whether contrast, aged-paper texture or order appeals, without requiring an academic identity."
  },
  "clean-girl": {
    "zh": "清爽极简风：比较较少元素、浅中性色和几何留白。用相同形状调整间隔与颜色数量，寻找自己喜欢的简洁程度，同时保留有用或有意义的物品；不把画面整洁当作人的价值。",
    "en": "Clean Girl: compare reduced elements, pale neutrals and geometric open space. Adjust spacing and colour count using the same shapes while keeping useful or meaningful objects; a clear composition is not a judgment of personal worth."
  },
  "coastal-grandmother": {
    "zh": "海岸休闲风：观察浅蓝米白、条纹、轻柔织纹与开阔间隔。比较同样浅色在疏朗条纹和规整几何中的效果，提取喜欢的线索；不需要年龄、家庭角色或海边住所。",
    "en": "Coastal Grandmother: explore pale blue and cream, stripes, light weave and open intervals. Compare the same pale colours in relaxed stripes and orderly geometry, without requirements for age, family role or a coastal home."
  },
  "goblincore": {
    "zh": "林野奇趣风：比较苔土色、斑点、叶脉与不规则细节。将同一张自有物品照片转成斑驳与均匀重复的两种草图，辨别对颜色、细节或节奏的偏好，无需收集自然物或增加杂物。",
    "en": "Goblincore: compare moss and earth tones, speckles, veins and irregular details. Turn one photo of your own object into mottled and evenly repeated sketches, exploring colour, detail and rhythm without collecting natural objects or accumulating possessions."
  },
  "cyberpunk": {
    "zh": "赛博朋克风：比较暗底亮线、技术网格、接口形状与层次。用纸面图形试试密集亮线和单一交点，再改变留白；可以保留视觉反差，不必购买设备或接受某种技术身份。",
    "en": "Cyberpunk: compare bright lines on dark, technical grids, connector forms and layers. Contrast dense lines with a single intersection on paper, then change the open space, without buying devices or adopting a technical identity."
  }
};

export function aestheticLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
