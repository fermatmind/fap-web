import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "policies";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function PoliciesPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
