import CareerGuideDetailPage, {
  generateMetadata as generateCareerGuideMetadata,
} from "../[slug]/page";

export const dynamic = "force-dynamic";

type GuideParams = Promise<{ locale: string }>;

function detailParams(params: GuideParams) {
  return params.then(({ locale }) => ({ locale, slug: "iq-eq-balance-at-work" }));
}

export function generateMetadata({ params }: { params: GuideParams }) {
  return generateCareerGuideMetadata({ params: detailParams(params) });
}

export default function IqEqBalanceGuidePage({ params }: { params: GuideParams }) {
  return CareerGuideDetailPage({ params: detailParams(params) });
}
