import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

// Read live CMS variants; missing or withdrawn content remains unavailable.
export const dynamic = "force-dynamic";
export const generateMetadata = () => generateTraditionalContentPageMetadata("item-design-notes");
export default function TraditionalContentPage() {
  return renderTraditionalContentPage("item-design-notes");
}
