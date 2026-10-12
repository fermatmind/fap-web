import { resolveLocale } from "@/lib/i18n/getDict";
import { ImageResponse } from "next/og";
import { getShareSummary } from "@/lib/api/v0_3";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";
import { renderShareOgImage } from "@/lib/og/mbtiShare";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

async function loadShareSummary(id: string, locale: "en" | "zh") {
  try {
    return await getShareSummary({
      shareId: id,
      locale,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const locale = resolveLocale(new URL(request.url).searchParams.get("locale") ?? "en");
  const params = await context.params;
  const id = typeof params.id === "string" ? params.id.trim() : "";
  const data = id ? await loadShareSummary(id, locale) : null;

  return new ImageResponse(renderShareOgImage(buildSharePageViewModel(data), locale), {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
}
