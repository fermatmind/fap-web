import { ImageResponse } from "next/og";
import { getShareSummary } from "@/lib/api/v0_3";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";
import { renderShareOgImage } from "@/lib/og/mbtiShare";

export const runtime = "edge";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

async function loadShareSummary(id: string) {
  try {
    return await getShareSummary({
      shareId: id,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = typeof params.id === "string" ? params.id.trim() : "";
  const data = id ? await loadShareSummary(id) : null;

  return new ImageResponse(renderShareOgImage(buildSharePageViewModel(data)), {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
}
