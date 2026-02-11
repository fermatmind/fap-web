import { permanentRedirect } from "next/navigation";

export default function LegacyTestsPage() {
  permanentRedirect("/tests");
}
