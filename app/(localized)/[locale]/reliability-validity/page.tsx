import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "reliability-validity";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function ReliabilityValidityPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
