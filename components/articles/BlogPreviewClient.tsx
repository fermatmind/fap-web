"use client";

import { useEffect, useState } from "react";
import { BlogArchiveView } from "@/components/articles/BlogArchiveView";
import { BLOG_PREVIEW_OPS_ORIGIN, BLOG_PREVIEW_READY, loadBlogPreview, readBlogPreviewMessage, type BlogPreviewPayload } from "@/lib/content/blogPreview";
import type { BlogArchiveState } from "@/lib/content/blogArchive";
import type { Locale } from "@/lib/i18n/locales";

export function BlogPreviewClient({ locale }: { locale: Locale }) {
  const [payload, setPayload] = useState<BlogPreviewPayload | null>(null);
  const [selection, setSelection] = useState({ category: "", page: 1 });
  const [state, setState] = useState<BlogArchiveState | null>(null);

  useEffect(() => {
    const opener = window.opener;
    const receive = (event: MessageEvent) => {
      const message = readBlogPreviewMessage(event, opener, locale);
      if (message) { setState(null); setPayload(message); setSelection({ category: "", page: 1 }); }
    };
    window.addEventListener("message", receive);
    opener?.postMessage({ type: BLOG_PREVIEW_READY }, BLOG_PREVIEW_OPS_ORIGIN);
    return () => window.removeEventListener("message", receive);
  }, [locale]);

  useEffect(() => {
    if (!payload) return;
    let active = true;
    loadBlogPreview(payload, locale, selection.category, selection.page)
      .then((value) => { if (active) setState(value); })
      .catch(() => { if (active) setState({ data: null, stale: false, failed: true }); });
    return () => { active = false; };
  }, [payload, locale, selection]);

  if (!payload) return <main className="mx-auto max-w-3xl px-6 py-12"><h1>Blog layout preview</h1><p role="status">Open this view from the authenticated CMS blog preview. Direct access contains no draft content.</p></main>;
  return <>
    <aside className="mx-auto max-w-6xl border-b px-6 py-4 text-sm" data-testid="blog-preview-binding">
      <p>Draft layout preview · Surface {payload.surface_id} · {payload.locale}</p>
      <p className="break-all">Configuration SHA256: {payload.configuration_sha256}</p>
      <p className="break-all">Package SHA256: {payload.binding.package_sha256}</p>
      <p className="break-all">Candidate SHA256: {payload.binding.candidate_sha256}</p>
      <p className="break-all">Surface state SHA256: {payload.binding.surface_state_sha256}</p>
      <p>Configured owner: {payload.binding.owner_admin_user_id}</p>
      <p>Current public article revisions. Preview does not review, approve or publish content.</p>
    </aside>
    {state ? <BlogArchiveView locale={locale} state={state} category={selection.category} page={selection.page} preview
      onNavigate={(category, page) => { setState(null); setSelection({ category, page }); }} /> : <p role="status" className="px-6 py-12">Loading current public articles…</p>}
  </>;
}
