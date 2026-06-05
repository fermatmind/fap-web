import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "common-misconceptions";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function CommonMisconceptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
