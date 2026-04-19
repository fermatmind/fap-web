import Link from "next/link";
import type { ContentPageSummary } from "@/lib/cms/content-pages";
import { buildContentPagePath } from "@/lib/cms/content-pages";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

function formatDate(value: string | null): string {
  return value || "—";
}

export function ContentPagesTable({ locale, pages }: { locale: Locale; pages: ContentPageSummary[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" data-testid="ops-content-pages-table">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Kind</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Effective</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pages.map((page) => (
            <tr key={page.slug}>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{page.title}</div>
                <div className="mt-1 max-w-md truncate text-xs text-slate-500">{page.summary}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{page.slug}</td>
              <td className="px-4 py-3 text-slate-700">{page.kind}</td>
              <td className="px-4 py-3">
                <span className={page.isPublic ? "text-emerald-700" : "text-amber-700"}>
                  {page.isPublic ? "published" : "draft"}
                </span>
                <span className="ml-2 text-xs text-slate-400">{page.isIndexable ? "indexable" : "noindex"}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(page.updatedAt)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(page.effectiveAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={localizedPath(`/ops/content-pages/${page.slug}`, locale)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={buildContentPagePath(page.slug, locale)}
                    className="rounded border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                  >
                    Preview
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
