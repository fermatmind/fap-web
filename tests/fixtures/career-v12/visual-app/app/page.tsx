import { CareerDisplaySurface } from "../../../../../components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "../../../../../lib/career/displaySurface";

export const dynamic = "force-dynamic";

const DEFAULT_SLUG = "accountants-and-auditors";

export default async function CareerV12VisualPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const requestedSlug = (await searchParams).slug ?? DEFAULT_SLUG;
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(requestedSlug) ? requestedSlug : DEFAULT_SLUG;
  const response = await fetch(
    `https://api.fermatmind.com/api/v0.5/career/jobs/${encodeURIComponent(slug)}?locale=zh-CN`,
    { cache: "no-store" }
  );
  if (!response.ok) throw new Error(`${slug} API returned ${response.status}`);
  const payload: unknown = await response.json();
  const surface = adaptCareerDisplaySurface(payload, "zh", undefined, slug);
  if (!surface?.presentationV1) throw new Error(`${slug} presentation_v1 is unavailable or invalid`);
  const title = surface.presentationV1.hero.titleZh ?? "";

  return (
    <CareerDisplaySurface
      surface={surface}
      rendererRelease="career-v12-phase-b-live-api"
      breadcrumbItems={[
        { label: "首页", href: "/zh" },
        { label: "职业", href: "/zh/career" },
        { label: "职业库", href: "/zh/career/jobs" },
        { label: title },
      ]}
    />
  );
}
