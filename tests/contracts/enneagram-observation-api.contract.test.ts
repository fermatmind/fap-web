import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assignEnneagramObservation,
  fetchEnneagramObservation,
  submitEnneagramObservationDay3,
  submitEnneagramObservationDay7,
} from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_observation_contract",
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
    post: hoisted.post,
  },
}));

describe("enneagram observation API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.get.mockResolvedValue({
      ok: true,
      observation_state_v1: {
        version: "enneagram_observation_state.v1",
        attempt_id: "attempt-obs-1",
        scale_code: "ENNEAGRAM",
        status: "initial_result",
        tasks: [],
      },
    });
    hoisted.post.mockResolvedValue({
      ok: true,
      observation_state_v1: {
        version: "enneagram_observation_state.v1",
        attempt_id: "attempt-obs-1",
        scale_code: "ENNEAGRAM",
        status: "observation_assigned",
        tasks: [],
      },
    });
  });

  it("builds the GET observation request against the PR9A endpoint", async () => {
    await fetchEnneagramObservation({ attemptId: "attempt-obs-1" });

    expect(hoisted.get).toHaveBeenCalledWith("/v0.3/attempts/attempt-obs-1/enneagram/observation", {
      headers: {
        "X-Anon-Id": "anon_observation_contract",
      },
    });
  });

  it("builds the assign request against the PR9A endpoint", async () => {
    await assignEnneagramObservation({ attemptId: "attempt-obs-1" });

    expect(hoisted.post).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-obs-1/enneagram/observation/assign",
      {},
      {
        headers: {
          "X-Anon-Id": "anon_observation_contract",
        },
      }
    );
  });

  it("submits Day3 payload without recalculating state in the frontend", async () => {
    await submitEnneagramObservationDay3({
      attemptId: "attempt-obs-1",
      payload: {
        more_like: "top1",
        evidence_sentence: "I noticed the same motive under work pressure.",
        confidence_self_rating: 4,
        scene_type: "work",
      },
    });

    expect(hoisted.post).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-obs-1/enneagram/observation/day3",
      {
        more_like: "top1",
        evidence_sentence: "I noticed the same motive under work pressure.",
        confidence_self_rating: 4,
        scene_type: "work",
      },
      {
        headers: {
          "X-Anon-Id": "anon_observation_contract",
        },
      }
    );
  });

  it("submits Day7 payload with self-observation fields intact", async () => {
    await submitEnneagramObservationDay7({
      attemptId: "attempt-obs-1",
      payload: {
        final_resonance: "top2",
        user_confirmed_type: "6",
        wants_fc144: true,
        wants_retake_same_form: false,
        user_disagreed_reason: "Top 2 kept fitting my motive better.",
      },
    });

    expect(hoisted.post).toHaveBeenCalledWith(
      "/v0.3/attempts/attempt-obs-1/enneagram/observation/day7",
      {
        final_resonance: "top2",
        user_confirmed_type: "6",
        wants_fc144: true,
        wants_retake_same_form: false,
        user_disagreed_reason: "Top 2 kept fitting my motive better.",
      },
      {
        headers: {
          "X-Anon-Id": "anon_observation_contract",
        },
      }
    );
  });
});
