import HistoryResultPage, { generateMetadata as historyResultMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/results/[portrait]/page";

type Props = {
  params: Promise<{ portrait: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

const localizedParams = (params: Props["params"]) =>
  params.then(({ portrait }) => ({ locale: "zh-TW", portrait }));

export const generateMetadata = ({ params }: Props) => historyResultMetadata({ params: localizedParams(params), searchParams: Promise.resolve({}) });
export default function Page({ params, searchParams }: Props) {
  return <HistoryResultPage params={localizedParams(params)} searchParams={searchParams} />;
}
