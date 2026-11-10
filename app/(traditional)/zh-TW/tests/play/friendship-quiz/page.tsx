import FriendshipLanding, { generateMetadata as landingMetadata } from "@/app/(localized)/[locale]/tests/play/friendship-quiz/page";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return landingMetadata({ params });
}

export default function Page() {
  return <FriendshipLanding params={params} />;
}
