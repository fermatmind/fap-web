import { ImageResponse } from "next/og";
import { getMbtiCompareInvite } from "@/lib/api/v0_3";
import { renderCompareOgImage } from "@/lib/og/mbtiCompare";

export const runtime = "edge";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

async function loadCompareInvite(inviteId: string) {
  try {
    return await getMbtiCompareInvite({
      inviteId,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ inviteId: string }> }
) {
  const params = await context.params;
  const inviteId = typeof params.inviteId === "string" ? params.inviteId.trim() : "";
  const data = inviteId ? await loadCompareInvite(inviteId) : null;

  return new ImageResponse(renderCompareOgImage(data), {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
}
