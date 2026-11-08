import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

// Read live CMS variants at request time, including missing/withdrawn content.
export const dynamic = "force-dynamic";
export const generateMetadata = () => generateTraditionalContentPageMetadata("privacy");
export default function TraditionalContentPage() {
  return renderTraditionalContentPage("privacy");
}
