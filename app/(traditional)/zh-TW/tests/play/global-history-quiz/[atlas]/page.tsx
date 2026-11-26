import Page, { generateMetadata as atlasMetadata } from "@/app/(localized)/[locale]/tests/play/global-history-quiz/[atlas]/page";
import type { AtlasQuery } from "@/lib/entertainment/global-history/atlas";

type Props = { params: Promise<{ atlas: string }>; searchParams: Promise<AtlasQuery> };
const toAtlasProps = ({ params, searchParams }: Props) => ({
  params: params.then(({ atlas }) => ({ atlas, locale: "zh-TW" })),
  searchParams,
});
export const generateMetadata = (props: Props) => atlasMetadata(toAtlasProps(props));
export default function TraditionalHistoryAtlas(props: Props) {
  return <Page {...toAtlasProps(props)} />;
}
