import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/en/tests", label: "Tests" },
  { href: "/en/personality", label: "Personality" },
  { href: "/en/career", label: "Career" },
  { href: "/en/articles", label: "Articles" },
  { href: "/en/support", label: "Support" },
];

const zhLinks = [
  { href: "/", label: "首页" },
  { href: "/zh/tests", label: "测试" },
  { href: "/zh/personality", label: "人格库" },
  { href: "/zh/career", label: "职业库" },
  { href: "/zh/articles", label: "文章" },
  { href: "/zh/support", label: "支持" },
];

export default function RootNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-[var(--fm-container-gutter)] py-[var(--fm-space-10)]">
      <p className="m-0 font-mono text-sm uppercase tracking-[0.16em] text-slate-500">404</p>
      <h1 className="m-0 mt-[var(--fm-space-3)] max-w-2xl text-3xl font-semibold tracking-normal text-slate-950 md:text-5xl">
        Page not found
      </h1>
      <p className="mt-[var(--fm-space-4)] max-w-2xl text-base leading-7 text-slate-600">
        This link is no longer available. Choose a public entry point below to continue.
      </p>

      <section aria-label="English links" className="mt-[var(--fm-space-7)]">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">English</h2>
        <div className="mt-[var(--fm-space-3)] grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Chinese links" className="mt-[var(--fm-space-7)]">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">中文</h2>
        <div className="mt-[var(--fm-space-3)] grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zhLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
