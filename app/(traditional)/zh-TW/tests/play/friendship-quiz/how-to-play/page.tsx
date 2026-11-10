import { PublicResource, resourceMetadata } from "@/components/friendship/PublicContent";

export function generateMetadata() {
  return resourceMetadata("zh-TW", "how-to-play");
}

export default function Page() {
  return <PublicResource locale="zh-TW" kind="how-to-play" />;
}
