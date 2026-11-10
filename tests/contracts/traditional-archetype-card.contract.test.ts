// @vitest-environment node
import { expect, it } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";
import members from "@/lib/i18n/zh-TW/archetype-questionnaire-members.generated.json";

it.each(Object.entries(members))("renders only public Taiwan card data for %s", async (slug, ids) => {
  const context = { params: Promise.resolve({ slug }) };
  const url = `https://fermatmind.com/og/fun/${slug}?locale=zh-TW&portrait=`;
  const result = await GET(new Request(url + ids[0]), context);
  const bytes = Buffer.from(await result.arrayBuffer());
  expect(result.headers.get("X-Robots-Tag")).toBe("noindex");
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect([result.status, bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([200, 1200, 630]);
  expect((await GET(new Request(url + "unknown"), context)).status).toBe(404);
});
