import HistoryPage, { generateMetadata as historyMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/page";

const props = { params: Promise.resolve({ locale: "zh-TW" }) };
export const generateMetadata = () => historyMetadata(props);
export default function Page() {
  return <HistoryPage {...props} />;
}
