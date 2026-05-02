import Link from "next/link";
import type { CareerDisplayRelatedPage } from "@/lib/career/displaySurface";

type RelatedNextPagesProps = {
  heading: string;
  pages: CareerDisplayRelatedPage[];
};

export function RelatedNextPages({ heading, pages }: RelatedNextPagesProps) {
  if (pages.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid="related-next-pages">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{heading}</h2>
      <ul className="m-0 mt-4 grid gap-3 p-0 sm:grid-cols-3">
        {pages.map((page) => (
          <li key={`${page.routeKind}:${page.label}`} className="list-none rounded-lg border border-slate-200 p-3 text-sm">
            {page.href ? (
              <Link href={page.href} className="font-semibold text-slate-950 hover:text-slate-700">
                {page.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-700">{page.label}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
