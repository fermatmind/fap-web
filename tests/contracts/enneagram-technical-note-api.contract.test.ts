import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchEnneagramTechnicalNote } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_technical_note_contract",
  removePendingAnonLinkAttempts: vi.fn(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  getFmToken: () => null,
}));

vi.mock("@/lib/api-client", () => ({
  ApiError: class ApiError extends Error {
    status = 500;
    errorCode = "MOCK";
  },
  apiClient: {
    get: hoisted.get,
  },
}));

describe("enneagram technical note API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.get.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      technical_note_v1: {
        schema_version: "enneagram.technical_note.v1",
        scale_code: "ENNEAGRAM",
        sections: [],
      },
    });
  });

  it("fetches the PR11A technical note endpoint without requiring frontend-side auth state", async () => {
    await fetchEnneagramTechnicalNote();

    expect(hoisted.get).toHaveBeenCalledWith("/v0.3/scales/ENNEAGRAM/technical-note", {
      skipAuth: true,
    });
  });
});
