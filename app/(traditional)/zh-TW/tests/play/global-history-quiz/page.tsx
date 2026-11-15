import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import HistoryPage, { generateMetadata as historyMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/page";

const props = { params: Promise.resolve({ locale: "zh-TW" }) };
export const generateMetadata = async () =>
  traditionalSearchMetadata("/zh-TW/tests/play/global-history-quiz", await historyMetadata(props));
export default function Page() {
  return <HistoryPage {...props} />;
}
