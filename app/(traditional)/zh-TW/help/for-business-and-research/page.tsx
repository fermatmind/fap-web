import { generateTraditionalContentPageMetadata, renderTraditionalContentPage } from "@/lib/cms/traditional-content-page-route";

// Read live CMS variants; missing or withdrawn content remains unavailable.
export const dynamic = "force-dynamic";
export const generateMetadata = () => generateTraditionalContentPageMetadata("help-for-business-and-research");
export default function TraditionalContentPage() {
  return renderTraditionalContentPage("help-for-business-and-research");
}
