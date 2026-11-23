import TraditionalPage, { generateMetadata as traditionalMetadata } from "@/app/(traditional)/zh-TW/[...path]/page";
import { createEntertainmentAdPage } from "@/lib/entertainment/adPage";

function traditionalProps({ params, take }: { params: Promise<{ slug: string; profile: string }>; take: boolean }) {
  return {
    params: params.then(({ slug, profile }) => ({ path: ["tests", "explore", slug, ...(take ? ["take"] : profile ? ["results", profile] : [])] })),
  };
}

const route = {
  render: (props: Parameters<typeof traditionalProps>[0]) => TraditionalPage(traditionalProps(props)),
  metadata: (props: Parameters<typeof traditionalProps>[0]) => traditionalMetadata(traditionalProps(props)),
};
const ad = createEntertainmentAdPage({ locale: "zh-TW", intro: route, take: route, result: route });

export const generateMetadata = ad.generateMetadata;
export default ad.Page;
