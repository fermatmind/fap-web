import { notFound } from "next/navigation";
import { ContentPageEditorForm } from "@/components/ops/content-pages/ContentPageEditorForm";
import { getContentPage } from "@/lib/cms/content-pages";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ContentPageOpsDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam) as Locale;
  const page = await getContentPage(slug, locale);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Content CMS</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Edit content page</h1>
        <p className="mt-1 text-sm text-slate-600">
          {page.title} · {page.kind} · {page.template}
        </p>
      </header>

      <ContentPageEditorForm locale={locale} page={page} />
    </main>
  );
}
