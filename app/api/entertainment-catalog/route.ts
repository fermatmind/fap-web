import { NextResponse } from "next/server";
import { entertainmentActivityCatalog } from "@/lib/entertainment/activityCatalog";

export const dynamic = "force-dynamic";

// Public identities and privacy policy only; this route never loads answer assets.
export function GET() {
  return NextResponse.json({ schema: "entertainment.catalog.v1", items: entertainmentActivityCatalog }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
