import DiscLanding, { generateMetadata as discMetadata } from "@/app/(localized)/[locale]/tests/disc-behavioral-style-test/page";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return discMetadata({ params });
}

export default function TraditionalDiscLanding() {
  return <DiscLanding params={params} />;
}
