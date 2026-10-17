import { unstable_cache } from "next/cache";
import { listBackendCareerCanonicalInventory } from "@/lib/seo/backendSitemapSource";

// Derived navigation eligibility from the existing backend identity authority.
// Never cache a failed/fallback response as an empty authoritative inventory.
const readInventory = unstable_cache(
  () => listBackendCareerCanonicalInventory({ requestTimeoutMs: 3000 }),
  ["career-canonical-link-targets-v1"],
  { revalidate: 300, tags: ["career-canonical-link-targets"] },
);

export async function fetchCareerLinkTargets(): Promise<string[] | null> {
  try {
    return (await readInventory()).paths;
  } catch {
    return null;
  }
}
