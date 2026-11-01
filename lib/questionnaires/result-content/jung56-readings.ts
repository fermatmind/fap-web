import content from "./jung56-readings.json";
import type { Jung56Direction } from "../jung56";
import type { Jung56ResultReading } from "./jung56-reading-types";
export function getJung56ResultReading(id: string): Jung56ResultReading | undefined {
  if (!Object.hasOwn(content, id)) return undefined;
  return { quizSlug: "cognitive-functions-test", edition: "fm_jung56_eight_public_cards_working_en_v1", profileId: id as Jung56Direction, sections: content[id as keyof typeof content] };
}
