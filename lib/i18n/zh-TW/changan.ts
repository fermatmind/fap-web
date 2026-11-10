import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import generated from "./changan.generated.json";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const source = `lib/entertainment/data/${CHANGAN_SLUG}.json`;
const units: TextUnits = generated.units;

export const traditionalChanganTitle = units[`${source}/title`].text;

export async function loadTraditionalChangan() {
  const quiz = await loadFunQuiz(CHANGAN_SLUG);
  return quiz ? projectStoryCopy(quiz, source, units) : null;
}
