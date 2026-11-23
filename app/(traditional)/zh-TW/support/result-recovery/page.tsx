import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

// Read live CMS variants; missing or withdrawn content remains unavailable.
export const dynamic = "force-dynamic";
export const generateMetadata = () => generateTraditionalContentPageMetadata("help-result-recovery");
export default function TraditionalContentPage() {
  return renderTraditionalContentPage("help-result-recovery");
}
