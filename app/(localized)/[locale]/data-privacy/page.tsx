import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "data-privacy";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function DataPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
