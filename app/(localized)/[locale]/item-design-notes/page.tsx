import { generateContentPageMetadata, renderContentPage } from "../contentPageRoute";

const SLUG = "item-design-notes";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateContentPageMetadata({ params, slug: SLUG });
}

export default function ItemDesignNotesPage({ params }: { params: Promise<{ locale: string }> }) {
  return renderContentPage({ params, slug: SLUG });
}
