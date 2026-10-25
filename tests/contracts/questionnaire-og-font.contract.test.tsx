import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ readFile: vi.fn(), loadQuestionnaire: vi.fn(), loadFunQuiz: vi.fn(), images: vi.fn() }));
vi.mock("node:fs/promises", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, default: { ...actual, readFile: mocks.readFile }, readFile: mocks.readFile };
});
vi.mock("@/lib/questionnaires/loaders", () => ({ loadQuestionnaire: mocks.loadQuestionnaire }));
vi.mock("@/lib/entertainment/loaders", () => ({ loadFunQuiz: mocks.loadFunQuiz }));
vi.mock("next/og", () => ({ ImageResponse: class extends Response {
  constructor(_element: unknown, options: { fonts: { data: ArrayBuffer }[] }) { super("synthetic image"); mocks.images(options.fonts[0].data); }
} }));

async function setup(slug = "naruto-character") {
  vi.resetModules(); mocks.readFile.mockReset(); mocks.images.mockReset(); mocks.loadQuestionnaire.mockReset(); mocks.loadFunQuiz.mockReset();
  mocks.loadQuestionnaire.mockResolvedValue({ slug, title: { en: "Naruto Character Test", zh: "《火影忍者》角色测试" }, kind: "archetype", category: "metaphor", profiles: [] });
  mocks.loadFunQuiz.mockResolvedValue(null);
  return (await import("@/app/og/fun/[slug]/route")).GET;
}
const request = (slug: string) => new Request(`https://fermatmind.com/og/fun/${slug}?locale=en`);

describe("bounded local fonts for public quiz images", () => {
  it("loads and caches the selected quiz font using its resolved public identity", async () => {
    const get = await setup(); mocks.readFile.mockResolvedValue(Buffer.from([1, 2, 3]));
    // A loader alias must never become a filesystem path.
    const params = { params: Promise.resolve({ slug: "untrusted-route-alias" }) };
    expect((await get(request("untrusted-route-alias"), params)).status).toBe(200);
    await get(request("untrusted-route-alias"), params);
    expect(mocks.readFile).toHaveBeenCalledTimes(1);
    expect(mocks.readFile.mock.calls[0][0]).toBe(`${process.cwd()}/public/fonts/noto-sans-sc/naruto-character-700.ttf`);
    expect([...new Uint8Array(mocks.images.mock.calls[0][0])]).toEqual([1, 2, 3]);
  });

  it("retains the accepted shared font when an existing quiz has no dedicated file", async () => {
    const get = await setup("disney-princess");
    mocks.readFile.mockRejectedValueOnce(Object.assign(new Error("no dedicated font"), { code: "ENOENT" })).mockResolvedValueOnce(Buffer.from([4, 5]));
    const params = { params: Promise.resolve({ slug: "disney-princess" }) };
    expect((await get(request("disney-princess"), params)).status).toBe(200);
    await get(request("disney-princess"), params);
    expect(mocks.readFile).toHaveBeenCalledTimes(2);
    expect(mocks.readFile.mock.calls[1][0]).toBe(`${process.cwd()}/public/fonts/noto-sans-sc/fun-700.ttf`);
    expect([...new Uint8Array(mocks.images.mock.calls[0][0])]).toEqual([4, 5]);
  });

  it("propagates real font access failures rather than concealing them", async () => {
    const get = await setup(); const error = Object.assign(new Error("synthetic access failure"), { code: "EACCES" });
    mocks.readFile.mockRejectedValue(error);
    await expect(get(request("naruto-character"), { params: Promise.resolve({ slug: "naruto-character" }) })).rejects.toBe(error);
    expect(mocks.readFile).toHaveBeenCalledTimes(1); expect(mocks.images).not.toHaveBeenCalled();
  });

  it("rejects unknown identities and private-looking portraits before reading any font", async () => {
    const get = await setup(); mocks.loadQuestionnaire.mockResolvedValue(null);
    expect((await get(request("unknown"), { params: Promise.resolve({ slug: "unknown" }) })).status).toBe(404);
    mocks.loadQuestionnaire.mockResolvedValue({ slug: "naruto-character", profiles: [] });
    expect((await get(new Request("https://fermatmind.com/og/fun/naruto-character?portrait=NARUTO_01"), { params: Promise.resolve({ slug: "naruto-character" }) })).status).toBe(404);
    expect(mocks.readFile).not.toHaveBeenCalled(); expect(mocks.images).not.toHaveBeenCalled();
  });

  it("keeps both font files local and within the existing individual image-font budget", () => {
    for (const file of ["fun-700.ttf", "naruto-character-700.ttf"]) expect(readFileSync(`public/fonts/noto-sans-sc/${file}`).byteLength).toBeLessThan(300000);
    expect(readFileSync("app/og/fun/[slug]/route.tsx", "utf8")).not.toMatch(/fetch\(/);
  });
});
