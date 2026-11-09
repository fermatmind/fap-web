import Link from "next/link";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { getTraditionalPersonalityPublicContentAsset } from "@/lib/cms/personality-public-content-assets";
import { resolveBigFivePublicRouteEntry } from "@/lib/personality/bigFivePublicRoutes";
import { resolveEnneagramPublicRouteEntry } from "@/lib/personality/enneagramPublicRoutes";

export async function TraditionalPersonalityCategoryLinks() {
  const bigFive = resolveBigFivePublicRouteEntry(undefined);
  const enneagram = resolveEnneagramPublicRouteEntry(undefined);
  const [mbti, bigFiveAsset, enneagramAsset] = await Promise.allSettled([
    listPersonalityProfiles({ locale: "zh-TW", perPage: 1 }),
    bigFive && getTraditionalPersonalityPublicContentAsset("big_five", bigFive),
    enneagram && getTraditionalPersonalityPublicContentAsset("enneagram", enneagram),
  ]);
  const links = [
    {
      title: "MBTI 16 型人格",
      path: mbti.status === "fulfilled" && mbti.value.items.length
        ? mbti.value.traditionalLanguageAlternates?.["zh-TW"]
        : undefined,
    },
    {
      title: "大五人格",
      path: bigFiveAsset.status === "fulfilled"
        ? bigFiveAsset.value?.traditionalLanguageAlternates?.["zh-TW"]
        : undefined,
    },
    {
      title: "九型人格",
      path: enneagramAsset.status === "fulfilled"
        ? enneagramAsset.value?.traditionalLanguageAlternates?.["zh-TW"]
        : undefined,
    },
  ].filter(link => link.path !== undefined);

  if (!links.length) return null;

  return (
    <nav aria-label="人格百科" className="mb-8 rounded-2xl border border-[var(--fm-border)] px-5 py-4">
      <p className="m-0 font-semibold">瀏覽人格百科</p>
      <ul className="m-0 flex list-none flex-wrap gap-x-5 p-0">
        {links.map(({ title, path }) => path ? (
          <li key={path}>
            <Link href={path} prefetch={false} className="inline-flex min-h-11 items-center underline">{title}</Link>
          </li>
        ) : null)}
      </ul>
    </nav>
  );
}

export function TraditionalPersonalityCategoryBackLink() {
  return (
    <Link href="/zh-TW/tests/category/personality" className="inline-flex min-h-11 items-center underline">
      返回人格測評分類
    </Link>
  );
}
