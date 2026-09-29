import { generateBigFivePolicyMetadata, renderBigFivePolicyPage } from "../../../bigFivePolicyContentPageRoute";

const SLUG = "source-review-policy";
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateBigFivePolicyMetadata({ params, slug: SLUG });
}

export default function SourceReviewPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderBigFivePolicyPage({ params, slug: SLUG });
}
