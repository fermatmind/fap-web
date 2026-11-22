import { Gta6Landing, gta6LandingMetadata } from "@/components/questionnaires/Gta6Landing";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  return gta6LandingMetadata("zh-TW", Object.keys(await searchParams).length > 0);
}

export default async function Page({ searchParams }: Props) {
  const { with: invite } = await searchParams;
  return <Gta6Landing locale="zh-TW" invite={typeof invite === "string" ? invite : undefined} />;
}
