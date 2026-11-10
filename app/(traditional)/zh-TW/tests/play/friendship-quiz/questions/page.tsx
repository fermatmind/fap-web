import { PublicResource, resourceMetadata } from "@/components/friendship/PublicContent";

export function generateMetadata() {
  return resourceMetadata("zh-TW", "questions");
}

export default function Page() {
  return <PublicResource locale="zh-TW" kind="questions" />;
}
