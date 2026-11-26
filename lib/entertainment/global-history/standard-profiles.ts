import content from "./standard-profiles-content.json";
import type { Text } from "./result-editorial";

export type HistoryStandard = {
  narrative: Text;
  personalityQuestion: Text;
  personalityAnswer: Text;
};

export const historyStandards = content as Readonly<Partial<Record<string, HistoryStandard>>>;

export function historyStandardNarrative(text: string) {
  return text.split("\n\n").filter(Boolean);
}
