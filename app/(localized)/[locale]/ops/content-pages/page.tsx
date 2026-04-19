import { ContentPagesTable } from "@/components/ops/content-pages/ContentPagesTable";
import { listContentPagesForOps } from "@/lib/cms/content-pages";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContentPagesOpsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam) as Locale;
  const pages = await listContentPagesForOps(locale);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Content CMS</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Content Pages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fixed company and policy pages for the public site. These pages are served through the Content Pages API and rendered by
          the shared OpenAI-style frontend template.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-xs text-slate-500">Total</div>
          <div className="text-lg font-semibold text-slate-900">{pages.length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Company</div>
          <div className="text-lg font-semibold text-slate-900">{pages.filter((page) => page.kind === "company").length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Policy</div>
          <div className="text-lg font-semibold text-slate-900">{pages.filter((page) => page.kind === "policy").length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Published</div>
          <div className="text-lg font-semibold text-slate-900">{pages.filter((page) => page.isPublic).length}</div>
        </div>
      </div>

      <ContentPagesTable locale={locale} pages={pages} />
    </main>
  );
}
