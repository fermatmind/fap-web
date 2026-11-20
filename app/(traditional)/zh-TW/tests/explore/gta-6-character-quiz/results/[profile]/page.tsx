import { notFound } from "next/navigation";
import { Gta6Guide, gta6GuideMetadata } from "@/components/questionnaires/Gta6Guide";
import { gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";

type Props = { params: Promise<{ profile: string }> };

async function getProfile(params: Props["params"]) {
  const profile = gta6Profile((await params).profile);
  if (!profile) notFound();
  return profile;
}

export async function generateMetadata({ params }: Props) {
  return gta6GuideMetadata("zh-TW", await getProfile(params));
}

export default async function Page({ params }: Props) {
  return <Gta6Guide locale="zh-TW" profile={await getProfile(params)} />;
}
