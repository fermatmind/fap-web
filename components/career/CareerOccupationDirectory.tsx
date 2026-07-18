import Link from "next/link";
import type { CareerDatasetMemberAdapter } from "@/lib/career/adapters/types";
import {
  formatCareerFamilyTitle,
  isCareerDatasetMemberDetailReady,
  isCareerDatasetMemberPublic,
} from "@/lib/career/datasetDirectory";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type CareerOccupationDirectoryProps = {
  locale: Locale;
  members: CareerDatasetMemberAdapter[];
  emptyLabel: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function CareerOccupationDirectory({
  locale,
  members,
  emptyLabel,
  emptyActionHref,
  emptyActionLabel,
}: CareerOccupationDirectoryProps) {
  if (members.length === 0) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500"
        data-testid="career-occupation-empty-state"
      >
        <span>{emptyLabel}</span>
        {emptyActionHref && emptyActionLabel ? (
          <Link href={emptyActionHref} prefetch={false} className="font-semibold text-orange-600 underline-offset-4 hover:underline">
            {emptyActionLabel}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" data-testid="career-occupation-directory">
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_140px] border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 max-md:hidden">
        <span>{locale === "zh" ? "职业" : "Occupation"}</span>
        <span>{locale === "zh" ? "行业" : "Industry"}</span>
        <span>{locale === "zh" ? "状态" : "Status"}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {members.map((member) => {
          const detailReady = isCareerDatasetMemberDetailReady(member);
          const publicReady = isCareerDatasetMemberPublic(member);
          const familyTitle = formatCareerFamilyTitle(member.familySlug, locale);
          const familyHref = localizedPath(`/career/industries/${member.familySlug || "__unknown__"}`, locale);
          const jobHref = localizedPath(`/career/jobs/${member.canonicalSlug}`, locale);
          const displayTitle = locale === "zh" && member.canonicalTitleZh ? member.canonicalTitleZh : member.canonicalTitleEn;

          return (
            <article
              key={member.canonicalSlug}
              className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_140px] md:items-center"
              data-testid="career-occupation-row"
              data-career-slug={member.canonicalSlug}
              data-detail-ready={detailReady ? "true" : "false"}
            >
              <div className="min-w-0">
                {detailReady ? (
                  <Link
                    href={jobHref}
                    prefetch={false}
                    className="text-base font-semibold text-slate-950 underline-offset-4 hover:text-orange-600 hover:underline"
                    data-testid="career-occupation-detail-link"
                  >
                    {displayTitle}
                  </Link>
                ) : (
                  <p className="m-0 text-base font-semibold text-slate-950">{displayTitle}</p>
                )}
                <p className="m-0 mt-1 text-xs text-slate-400">
                  {locale === "zh" && member.canonicalTitleZh ? member.canonicalTitleEn : member.canonicalSlug}
                </p>
              </div>
              <div className="min-w-0" data-testid="career-occupation-family">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                  {locale === "zh" ? "行业" : "Industry"}
                </span>
                <Link
                  href={familyHref}
                  prefetch={false}
                  className="break-words text-sm font-medium text-slate-600 underline-offset-4 hover:text-orange-600 hover:underline"
                >
                  {familyTitle}
                </Link>
              </div>
              <div data-testid="career-occupation-status">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:hidden">
                  {locale === "zh" ? "状态" : "Status"}
                </span>
                {detailReady ? (
                  <Link
                    href={jobHref}
                    prefetch={false}
                    className="inline-flex max-w-full rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 underline-offset-4 hover:bg-emerald-100 hover:underline"
                  >
                    {locale === "zh" ? "可看详情" : "Detail ready"}
                  </Link>
                ) : (
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      publicReady ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500",
                    ].join(" ")}
                  >
                    {publicReady
                      ? locale === "zh"
                        ? "数据条目"
                        : "Dataset entry"
                      : locale === "zh"
                        ? "暂不公开详情"
                        : "Directory only"}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
