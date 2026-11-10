import HistoryTakePage, { generateMetadata as historyTakeMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/take/page";

const props = { params: Promise.resolve({ locale: "zh-TW" }) };
export const generateMetadata = () => historyTakeMetadata(props);
export default function Page() {
  return <HistoryTakePage {...props} />;
}
