import { PublicResource, resourceMetadata } from "@/components/friendship/PublicContent";

export function generateMetadata() {
  return resourceMetadata("zh-TW", "scores");
}

export default function Page() {
  return <PublicResource locale="zh-TW" kind="scores" />;
}
