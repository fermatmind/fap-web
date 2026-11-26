import content from "./flagship-profiles-content.json";
import type { ProfileEvidence } from "./profile-evidence";
import type { AlternativeReading, HistoryAxisName } from "./reference";
import type { Text } from "./result-editorial";

export type HistoryFlagship = {
  episodes: readonly {
    axes: readonly HistoryAxisName[];
    paragraphs: Text;
  }[];
  evidence: readonly ProfileEvidence[];
  alternative: AlternativeReading;
  typeAnswer: Text;
  followup: { question: Text; answer: Text };
};

export const historyFlagships = content as Readonly<Partial<Record<string, HistoryFlagship>>>;
