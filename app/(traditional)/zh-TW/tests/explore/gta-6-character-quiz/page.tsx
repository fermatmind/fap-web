import { Gta6Landing, gta6LandingMetadata } from "@/components/questionnaires/Gta6Landing";

export const metadata = gta6LandingMetadata("zh-TW");

export default function Page() {
  return <Gta6Landing locale="zh-TW" />;
}
