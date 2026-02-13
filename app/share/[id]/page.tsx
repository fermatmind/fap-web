import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTestBySlug } from "@/lib/content";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

type ShareParams = {
  id: string;
};

type ShareQuery = Record<string, string | string[] | undefined>;

type SharePayload = {
  testSlug: string;
  score: number;
  redirectTo: string | null;
};

const DEFAULT_SHARE = {
  id: "demo",
  testSlug: "personality-mbti-test",
  score: 88,
} as const;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseScore(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
}

function resolveSharePayload(id: string, query: ShareQuery): SharePayload {
  const queryScore = parseScore(firstValue(query.score), DEFAULT_SHARE.score);
  const queryTestSlug = firstValue(query.testSlug);
  const queryTest = queryTestSlug ? getTestBySlug(queryTestSlug) : null;

  if (id !== DEFAULT_SHARE.id && getTestBySlug(id)) {
    const params = new URLSearchParams({ testSlug: id });
    params.set("score", String(queryScore));
    return {
      testSlug: DEFAULT_SHARE.testSlug,
      score: queryScore,
      redirectTo: `/share/${DEFAULT_SHARE.id}?${params.toString()}`,
    };
  }

  const testSlug = queryTest ? queryTest.slug : DEFAULT_SHARE.testSlug;
  return {
    testSlug,
    score: queryScore,
    redirectTo: null,
  };
}

export async function generateMetadata(props: {
  params: Promise<ShareParams>;
  searchParams: Promise<ShareQuery>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const query = await props.searchParams;
  const payload = resolveSharePayload(id, query);

  const test = getTestBySlug(payload.testSlug);
  const testTitle = test?.title ?? "Personality Test";
  const title = `${testTitle} - Share Preview`;
  const description = `Result preview for ${testTitle}.`;
  const ogImagePath = `/og/${payload.testSlug}?score=${payload.score}`;

  return {
    title,
    description,
    robots: NOINDEX_ROBOTS,
    openGraph: {
      title,
      description,
      type: "website",
      images: [ogImagePath],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath],
    },
  };
}

export default async function SharePage(props: {
  params: Promise<ShareParams>;
  searchParams: Promise<ShareQuery>;
}) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const payload = resolveSharePayload(id, query);

  if (payload.redirectTo) {
    redirect(payload.redirectTo);
  }

  const test = getTestBySlug(payload.testSlug);
  const testTitle = test?.title ?? "Personality Test";

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <p style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
        Share Preview
      </p>
      <h1 style={{ marginTop: 8 }}>{testTitle}</h1>
      <p style={{ marginBottom: 24, color: "#475569" }}>
        Mock result summary card for share id: <code>{id}</code>
      </p>

      <section
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 20,
          display: "grid",
          gap: 14,
          background: "#ffffff",
        }}
      >
        <div
          style={{
            height: 14,
            width: "28%",
            borderRadius: 999,
            background: "#e2e8f0",
          }}
        />
        <div
          style={{
            height: 34,
            width: "66%",
            borderRadius: 8,
            background: "#cbd5e1",
          }}
        />
        <div
          style={{
            height: 12,
            width: "84%",
            borderRadius: 8,
            background: "#e2e8f0",
          }}
        />
        <div
          style={{
            height: 12,
            width: "72%",
            borderRadius: 8,
            background: "#e2e8f0",
          }}
        />

        <div
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignSelf: "flex-start",
            borderRadius: 999,
            border: "1px solid #0f172a",
            padding: "8px 14px",
            fontWeight: 600,
          }}
        >
          Score {payload.score}/100
        </div>
      </section>
    </main>
  );
}
