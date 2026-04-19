"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type {
  ContentPage,
  ContentPageAnimationProfile,
  ContentPageKind,
  ContentPageTemplate,
  ContentPageUpdatePayload,
} from "@/lib/cms/content-pages";
import { buildContentPagePath, updateContentPageFromOps } from "@/lib/cms/content-pages";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath, toApiLocale } from "@/lib/i18n/locales";

const KIND_OPTIONS: ContentPageKind[] = ["company", "policy", "help"];
const TEMPLATE_OPTIONS: ContentPageTemplate[] = ["company", "charter", "foundation", "careers", "brand", "policy", "help"];
const ANIMATION_OPTIONS: ContentPageAnimationProfile[] = ["mission", "principles", "editorial", "brand", "policy", "none"];

function toDateInput(value: string | null): string {
  return String(value ?? "").slice(0, 10);
}

function nullableDate(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function nullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

export function ContentPageEditorForm({ locale, page }: { locale: Locale; page: ContentPage }) {
  const [title, setTitle] = useState(page.title);
  const [kicker, setKicker] = useState(page.kicker);
  const [summary, setSummary] = useState(page.summary);
  const [kind, setKind] = useState<ContentPageKind>(page.kind);
  const [template, setTemplate] = useState<ContentPageTemplate>(page.template);
  const [animationProfile, setAnimationProfile] = useState<ContentPageAnimationProfile>(page.animationProfile);
  const [publishedAt, setPublishedAt] = useState(toDateInput(page.publishedAt));
  const [updatedAt, setUpdatedAt] = useState(toDateInput(page.updatedAt));
  const [effectiveAt, setEffectiveAt] = useState(toDateInput(page.effectiveAt));
  const [sourceDoc, setSourceDoc] = useState(page.sourceDoc ?? "");
  const [isPublic, setIsPublic] = useState(page.isPublic);
  const [isIndexable, setIsIndexable] = useState(page.isIndexable);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription ?? "");
  const [contentMd, setContentMd] = useState(page.contentMd);
  const [contentHtml, setContentHtml] = useState(page.contentHtml);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const payload = useMemo<ContentPageUpdatePayload>(
    () => ({
      title,
      kicker,
      summary,
      kind,
      template,
      animation_profile: animationProfile,
      locale: toApiLocale(locale),
      published_at: nullableDate(publishedAt),
      updated_at: nullableDate(updatedAt),
      effective_at: nullableDate(effectiveAt),
      source_doc: nullableText(sourceDoc),
      is_public: isPublic,
      is_indexable: isIndexable,
      content_md: contentMd,
      content_html: contentHtml,
      seo_title: nullableText(seoTitle),
      meta_description: nullableText(metaDescription),
    }),
    [
      animationProfile,
      contentHtml,
      contentMd,
      effectiveAt,
      isIndexable,
      isPublic,
      kicker,
      kind,
      locale,
      metaDescription,
      publishedAt,
      seoTitle,
      sourceDoc,
      summary,
      template,
      title,
      updatedAt,
    ]
  );

  function save() {
    setStatusText(null);
    startTransition(async () => {
      const result = await updateContentPageFromOps(page.slug, locale, payload);
      setStatusText(result ? "Saved to CMS." : "Save failed. Confirm the internal Content Pages API is deployed.");
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" data-testid="ops-content-page-editor">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{page.title}</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{page.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildContentPagePath(page.slug, locale)}
            className="rounded border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Preview
          </Link>
          <Link
            href={localizedPath("/ops/content-pages", locale)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">title</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">kicker</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" value={kicker} onChange={(event) => setKicker(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">summary</span>
          <textarea className="w-full rounded border border-slate-300 px-3 py-2" rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">kind</span>
          <select className="w-full rounded border border-slate-300 px-3 py-2" value={kind} onChange={(event) => setKind(event.target.value as ContentPageKind)}>
            {KIND_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">template</span>
          <select className="w-full rounded border border-slate-300 px-3 py-2" value={template} onChange={(event) => setTemplate(event.target.value as ContentPageTemplate)}>
            {TEMPLATE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">animation_profile</span>
          <select className="w-full rounded border border-slate-300 px-3 py-2" value={animationProfile} onChange={(event) => setAnimationProfile(event.target.value as ContentPageAnimationProfile)}>
            {ANIMATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">source_doc</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" value={sourceDoc} onChange={(event) => setSourceDoc(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">published_at</span>
          <input type="date" className="w-full rounded border border-slate-300 px-3 py-2" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">updated_at</span>
          <input type="date" className="w-full rounded border border-slate-300 px-3 py-2" value={updatedAt} onChange={(event) => setUpdatedAt(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">effective_at</span>
          <input type="date" className="w-full rounded border border-slate-300 px-3 py-2" value={effectiveAt} onChange={(event) => setEffectiveAt(event.target.value)} />
        </label>
        <div className="flex items-center gap-4 pt-5 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
            is_public
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isIndexable} onChange={(event) => setIsIndexable(event.target.checked)} />
            is_indexable
          </label>
        </div>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">seo_title</span>
          <input className="w-full rounded border border-slate-300 px-3 py-2" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">meta_description</span>
          <textarea className="w-full rounded border border-slate-300 px-3 py-2" rows={2} value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">content_md</span>
          <textarea className="min-h-[28rem] w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs leading-6" value={contentMd} onChange={(event) => setContentMd(event.target.value)} />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">content_html optional</span>
          <textarea className="min-h-32 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs leading-6" value={contentHtml} onChange={(event) => setContentHtml(event.target.value)} />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={isPending}
          onClick={save}
        >
          {isPending ? "Saving..." : "Save to CMS"}
        </button>
        {statusText ? <p className="m-0 text-sm text-slate-600">{statusText}</p> : null}
      </div>
    </section>
  );
}
