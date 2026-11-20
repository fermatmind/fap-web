import { Gta6Quiz } from "@/components/questionnaires/Gta6Quiz";
import { questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { gta6LandingPath, gta6Name } from "@/lib/questionnaires/gta6CharacterQuiz";

export const metadata = questionnaireTakeMetadata(gta6Name["zh-TW"], gta6LandingPath("zh-TW"));

export default function Page() {
  return <Gta6Quiz locale="zh-TW" />;
}
