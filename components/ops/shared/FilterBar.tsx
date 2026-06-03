"use client";

import { Search } from "lucide-react";
import { SegmentedControl } from "@/components/ops/shared/SegmentedControl";

type Option<T extends string> = {
  value: T;
  label: string;
};

export function FilterBar<ContentType extends string, IssueFocus extends string>({
  search,
  onSearchChange,
  contentType,
  contentTypeOptions,
  onContentTypeChange,
  issueFocus,
  issueFocusOptions,
  onIssueFocusChange,
  sort,
  onSortChange,
  sortOptions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  contentType: ContentType;
  contentTypeOptions: Array<Option<ContentType>>;
  onContentTypeChange: (value: ContentType) => void;
  issueFocus: IssueFocus;
  issueFocusOptions: Array<Option<IssueFocus>>;
  onIssueFocusChange: (value: IssueFocus) => void;
  sort: string;
  onSortChange: (value: string) => void;
  sortOptions: Array<Option<string>>;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-label="SEO filters">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_auto_auto_180px] xl:items-end">
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium text-slate-500">搜索</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="关键词、URL、页面标题或任务"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </span>
        </label>

        <SegmentedControl label="内容类型" value={contentType} options={contentTypeOptions} onChange={onContentTypeChange} />
        <SegmentedControl label="问题聚焦" value={issueFocus} options={issueFocusOptions} onChange={onIssueFocusChange} />

        <label>
          <span className="mb-1 block text-xs font-medium text-slate-500">排序</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
