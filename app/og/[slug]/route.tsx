import { ImageResponse } from "next/og";
import { getTestBySlug } from "@/lib/content";
import { getSiteHost } from "@/lib/site";

export const runtime = "edge";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const SITE_HOST = getSiteHost();

function parseScore(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.min(100, parsed));
}

function resolveScore(request: Request): number | null {
  try {
    return parseScore(new URL(request.url).searchParams.get("score"));
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = typeof params.slug === "string" ? params.slug.trim() : "";
  if (!slug) {
    return new Response("Test not found", { status: 404 });
  }

  const test = getTestBySlug(slug);
  if (!test) {
    return new Response("Test not found", { status: 404 });
  }

  const score = resolveScore(request);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "#f8fafc",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #0ea5e9 100%)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(248, 250, 252, 0.45)",
            fontSize: 28,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          FermatMind
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.08 }}>
            {test.title}
          </div>
          <div style={{ fontSize: 34, opacity: 0.92 }}>
            Discover your pattern. Grow with intent.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
            opacity: 0.95,
          }}
        >
          <div>{SITE_HOST}</div>
          <div>{score !== null ? `Score ${score}/100` : "Take the test"}</div>
        </div>
      </div>
    ),
    {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }
  );
}
