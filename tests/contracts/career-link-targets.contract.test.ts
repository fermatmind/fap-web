import { describe, expect, it, vi } from "vitest";
const { inventory } = vi.hoisted(() => ({ inventory: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (read: () => unknown) => read }));
vi.mock("@/lib/seo/backendSitemapSource", () => ({ listBackendCareerCanonicalInventory: inventory }));
import { fetchCareerLinkTargets } from "@/lib/career/api/fetchCareerLinkTargets";

describe("career navigation target authority", () => {
  it("uses the existing backend canonical inventory with a bounded request", async () => {
    const paths = ["/en/career/jobs/actors", "/zh/career/jobs/actors"];
    inventory.mockResolvedValue({manifestSha256: "a".repeat(64), paths});
    expect(await fetchCareerLinkTargets()).toEqual(paths);
    expect(inventory).toHaveBeenCalledWith({requestTimeoutMs: 3000});
  });
  it("keeps failed or fallback authority distinct from an empty inventory", async () => {
    inventory.mockRejectedValue(new Error("invalid fallback authority"));
    expect(await fetchCareerLinkTargets()).toBeNull();
  });
});
