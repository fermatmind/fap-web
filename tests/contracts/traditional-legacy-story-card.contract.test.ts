// @vitest-environment node
import { expect, it } from "vitest";
import { GET } from "@/app/og/fun/[slug]/route";

it("renders a local Taiwan story PNG and rejects a non-public portrait", async () => {
  const params = Promise.resolve({ slug: "woodland-animal" });
  const image = (id: string) => new Request(`https://fermatmind.com/og/fun/woodland-animal?locale=zh-TW&portrait=${id}`);
  const response = await GET(image("jay"), { params });
  expect(response.status).toBe(200);
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
  expect((await GET(image("not-real"), { params })).status).toBe(404);
}, 30000);

it("renders a Taiwan nature card through the shared public image route", async () => {
  const response = await GET(new Request("https://fermatmind.com/og/fun/beachcomber?locale=zh-TW"), {
    params: Promise.resolve({ slug: "beachcomber" }),
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
}, 30000);
