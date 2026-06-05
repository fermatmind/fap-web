import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "science";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function SciencePage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
