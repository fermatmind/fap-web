import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  BookOpenText,
  ClipboardCheck,
  Database,
  FileSearch,
  Globe2,
  Layers3,
  Library,
  LineChart,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

type OpsNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type OpsNavGroup = {
  label: string;
  items: OpsNavItem[];
};

const navGroups: OpsNavGroup[] = [
  {
    label: "内容",
    items: [
      { label: "内容页面", href: "/ops/content-pages", icon: BookOpenText },
      { label: "文章", href: "/ops/articles", icon: Library },
      { label: "落地页模块", href: "/ops/landing-surfaces", icon: Layers3 },
      { label: "媒体库", href: "/ops/media-assets", icon: Database },
    ],
  },
  {
    label: "SEO 与增长",
    items: [
      { label: "内容总览", href: "/ops/content-overview", icon: BarChart3 },
      { label: "内容搜索", href: "/ops/content-search", icon: Search },
      { label: "内容指标", href: "/ops/content-metrics", icon: Activity },
      { label: "SEO运营", href: "/ops/seo-operations", icon: FileSearch },
      { label: "增长归因", href: "/ops/content-growth-attribution", icon: LineChart },
      { label: "SEO智能", href: "/ops/seo", icon: Globe2 },
    ],
  },
  {
    label: "发布运营",
    items: [
      { label: "文章发布运营", href: "/ops/article-publishing-ops", icon: ClipboardCheck },
      { label: "发布后可观测性", href: "/ops/content-observability", icon: ShieldCheck },
    ],
  },
];

export function OpsSidebar({
  locale,
  activeHref,
}: {
  locale: Locale;
  activeHref: string;
}) {
  return (
    <aside className="border-r border-slate-200 bg-white lg:w-64 lg:shrink-0">
      <div className="sticky top-0 p-4 lg:min-h-[calc(100vh-80px)]">
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fermat Ops</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">production</p>
        </div>
        <nav className="flex gap-3 overflow-x-auto pb-2 lg:block lg:space-y-5 lg:overflow-visible lg:pb-0" aria-label="Ops navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="min-w-48 lg:min-w-0">
              <p className="mb-2 px-2 text-xs font-semibold text-slate-400">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={localizedPath(item.href, locale)}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium transition",
                        active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
