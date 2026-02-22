import type { TestListItem } from "@/lib/content";
import { resolveRegistrySpec } from "@/lib/design/card-registry";
import { type AssessmentCardSpec } from "@/lib/design/card-spec";

export function resolveCardSpec(test: Pick<TestListItem, "slug" | "scale_code" | "card_visual" | "card_tone" | "card_density" | "card_seed">): AssessmentCardSpec {
  return resolveRegistrySpec(test);
}
