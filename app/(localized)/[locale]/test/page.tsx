import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

function appendQuery(path: string, query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== undefined) {
          params.append(k, String(item));
        }
      }
      continue;
    }

    if (v !== undefined) {
      params.append(k, String(v));
    }
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export default async function LegacyTestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  permanentRedirect(appendQuery(localizedPath("/tests", locale), query));
}
