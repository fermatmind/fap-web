import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { getEnneagramTechnicalNoteStatusLabel } from "@/lib/enneagram/technicalNote";
import { getPublicEnneagramTechnicalNote } from "@/lib/enneagram/technicalNote.server";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const testPath = "/zh-TW/tests/enneagram-personality-test-nine-types";
const canonical = testPath + "/technical-note";
const title = "九型人格測驗技術說明";
const description = "了解九型人格測驗的方法、分數解讀、證據現況與使用範圍。";

export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = { title, description, alternates: { canonical }, robots: { index: false, follow: true } };
  return await getPublicEnneagramTechnicalNote("zh") ? traditionalSearchMetadata(canonical, base) : base;
}

export default async function TraditionalEnneagramTechnicalNotePage() {
  const note = await getPublicEnneagramTechnicalNote("zh");
  if (!note) notFound();

  const toTraditional = await loadTraditionalAssessmentText();
  const status = (value?: string) => toTraditional(getEnneagramTechnicalNoteStatusLabel(value, "zh"));
  const boundaries = Object.entries(note.method_boundaries ?? {}).filter(([, value]) => typeof value.copy === "string" && value.copy);
  const disclaimers = (note.disclaimers ?? []).flatMap(entry => {
    if (typeof entry === "string") return [entry];
    return entry.copy ? [entry.copy] : [];
  });

  return (
    <Container as="main" className="space-y-8 py-10">
      <Link className="text-sky-700 underline" href={testPath}>返回九型人格測驗</Link>
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p>{description}</p>
        <p className="text-sm text-slate-600">技術說明版本 {note.technical_note_version} · 登錄版本 {note.registry_version}</p>
      </header>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">測驗方法與證據</h2>
        {note.sections.map(section => (
          <article key={section.section_key} className="space-y-2 border-t pt-4">
            <h3 className="text-xl font-semibold">{toTraditional(section.title ?? "")}</h3>
            <p className="text-sm text-slate-600">{status(section.data_status)}</p>
            <p className="leading-8">{toTraditional(section.body ?? "")}</p>
          </article>
        ))}
      </section>
      {boundaries.length ? (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">方法與解讀限制</h2>
          {boundaries.map(([key, entry]) => (
            <article key={key} className="space-y-2">
              <h3 className="text-xl font-semibold">{toTraditional(typeof entry.label === "string" ? entry.label : key)}</h3>
              <p className="leading-8">{toTraditional(String(entry.copy))}</p>
            </article>
          ))}
        </section>
      ) : null}
      {note.metric_definitions?.length ? (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">指標定義</h2>
          {note.metric_definitions.map(metric => (
            <article key={metric.metric_key} className="space-y-2">
              <h3 className="text-xl font-semibold">{toTraditional(metric.label ?? metric.metric_key)}</h3>
              <p className="text-sm text-slate-600">{status(metric.data_status)}</p>
              {metric.description ? <p>{toTraditional(metric.description)}</p> : null}
              {metric.minimum_sample_guidance ? <p>樣本要求：{toTraditional(metric.minimum_sample_guidance)}</p> : null}
              {metric.privacy_notes ? <p>隱私說明：{toTraditional(metric.privacy_notes)}</p> : null}
            </article>
          ))}
        </section>
      ) : null}
      {disclaimers.length ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">使用範圍</h2>
          <ul className="list-disc space-y-2 pl-6">
            {disclaimers.map(copy => <li key={copy}>{toTraditional(copy)}</li>)}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
