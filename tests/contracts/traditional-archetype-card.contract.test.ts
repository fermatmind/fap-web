// @vitest-environment node
import { expect, it } from "vitest";
import { relationshipQuestionnaireMetadata } from "@/components/i18n/zh-TW/RelationshipQuestionnairePage";
import { loadTraditionalRelationshipQuestionnaire } from "@/lib/i18n/zh-TW/relationshipQuestionnaire";
import { GET } from "@/app/og/fun/[slug]/route";
import members from "@/lib/i18n/zh-TW/archetype-questionnaire-members.generated.json";

it.each(Object.entries(members))("renders only public Taiwan card data for %s", async (slug, ids) => {
  const context = { params: Promise.resolve({ slug }) };
  const url = `https://fermatmind.com/og/fun/${slug}?locale=zh-TW&portrait=`;
  const result = await GET(new Request(url + ids[0]), context);
  if (slug === "jungian-archetype") {
    expect(result.status).toBe(404);
    return;
  }
  const bytes = Buffer.from(await result.arrayBuffer());
  expect(result.headers.get("X-Robots-Tag")).toBe("noindex");
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect([result.status, bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([200, 1200, 630]);
  expect((await GET(new Request(url + "unknown"), context)).status).toBe(404);
});

it.each(["attachment-styles", "communication-style"])("serves the Taiwan preview for %s and its known guide", async slug => {
  const quiz = (await loadTraditionalRelationshipQuestionnaire(slug))!;
  const path = `/zh-TW/tests/explore/${slug}`;
  for (const suffix of ["", `/results/${quiz.profiles[0].id}`]) {
    const images = (await relationshipQuestionnaireMetadata(path + suffix)).openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    const image = (images as string[])[0];
    const response = await GET(new Request(`https://fermatmind.com${image}`), { params: Promise.resolve({ slug }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(Buffer.from(await response.arrayBuffer()).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  }
  const unknown = await GET(new Request(`https://fermatmind.com/og/fun/${slug}?locale=zh-TW&portrait=unknown`), { params: Promise.resolve({ slug }) });
  expect(unknown.status).toBe(404);
});
