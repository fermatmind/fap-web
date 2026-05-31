import { describe, expect, it } from "vitest";
import {
  IQ_FORBIDDEN_COMMERCE_TERMS,
  IQ_FORBIDDEN_PUBLIC_FIELDS,
  IQ_LAUNCH_SLUG,
  IQ_LAUNCH_SMOKE_PLAN,
  IQ_OPERATOR_FIXTURE_ENV_KEYS,
  IQ_OPERATOR_FIXTURE_MUTATION_APPROVAL,
  assertNoAnswerKeyLeakage,
  assertNoCommerceLeakage,
  assertSmokePlanComplete,
  buildAuthenticatedFixturePlan,
  collectForbiddenFieldPaths,
  parseOperatorSubmitPayload,
  redactOperatorSecret,
} from "../../scripts/iq/iq-launch-readiness-smoke.mjs";

describe("IQ launch readiness smoke contract", () => {
  it("covers lookup questions take submit result report canonical noindex and leakage checks", () => {
    expect(() => assertSmokePlanComplete()).not.toThrow();
    expect(IQ_LAUNCH_SLUG).toBe("iq-test-intelligence-quotient-assessment");
    expect(IQ_LAUNCH_SMOKE_PLAN.map((item) => item.id)).toEqual([
      "lookup",
      "questions",
      "take_page",
      "submit",
      "result",
      "report",
      "canonical",
      "private_noindex",
      "answer_key_leakage",
      "commerce_leakage",
    ]);
  });

  it("keeps private answer key solution hash and generator fields out of public payloads", () => {
    expect(IQ_FORBIDDEN_PUBLIC_FIELDS).toEqual(expect.arrayContaining([
      "answer_key",
      "correct_answer",
      "solution_rule",
      "asset_hashes",
      "generator_metadata",
    ]));
    expect(collectForbiddenFieldPaths({ result: { items: [{ selected_code: "A" }] } })).toEqual([]);
    expect(collectForbiddenFieldPaths({ result: { items: [{ correct_answer: "A" }] } })).toEqual([
      "$.result.items.0.correct_answer",
    ]);
    expect(() => assertNoAnswerKeyLeakage({ result: { items: [{ selected_code: "A" }] } })).not.toThrow();
    expect(() => assertNoAnswerKeyLeakage({ answer_key: { Q1: "A" } })).toThrow(/private fields/);
  });

  it("keeps commerce checkout payment and unlock terms out of IQ smoke payloads", () => {
    expect(IQ_FORBIDDEN_COMMERCE_TERMS).toEqual(expect.arrayContaining([
      "checkout",
      "payment_intent",
      "stripe",
      "unlock_sku",
    ]));
    expect(() => assertNoCommerceLeakage({ status: "raw_score_only", unlock: null })).not.toThrow();
    expect(() => assertNoCommerceLeakage({ checkout: { price_id: "price_123" } })).toThrow(/commerce terms/);
  });

  it("anchors canonical and noindex read-only checks without requiring live production in CI", () => {
    const canonical = IQ_LAUNCH_SMOKE_PLAN.find((item) => item.id === "canonical");
    const noindex = IQ_LAUNCH_SMOKE_PLAN.find((item) => item.id === "private_noindex");
    const submit = IQ_LAUNCH_SMOKE_PLAN.find((item) => item.id === "submit");

    expect(canonical).toMatchObject({ method: "GET", requiresAuth: false });
    expect(canonical?.path).toBe(`/en/tests/${IQ_LAUNCH_SLUG}`);
    expect(canonical?.validates).toEqual(expect.arrayContaining(["canonical_self_reference", "no_software_application_schema"]));
    expect(noindex?.validates).toEqual(expect.arrayContaining(["x_robots_noindex", "robots_noindex"]));
    expect(submit).toMatchObject({ method: "POST", requiresAuth: true });
  });

  it("adds an env-only authenticated operator fixture gate without committed secrets or answer keys", () => {
    expect(IQ_OPERATOR_FIXTURE_ENV_KEYS).toEqual([
      "IQ_OPERATOR_FIXTURE_BEARER_TOKEN",
      "IQ_OPERATOR_FIXTURE_ATTEMPT_ID",
      "IQ_OPERATOR_FIXTURE_SUBMIT_PAYLOAD_JSON",
    ]);
    expect(IQ_OPERATOR_FIXTURE_MUTATION_APPROVAL).toContain("operator IQ fixture attempt");

    const plan = buildAuthenticatedFixturePlan({ attemptId: "attempt_live_fixture_123456" });
    expect(plan.map((item) => item.id)).toEqual(["submit", "result", "report"]);
    expect(plan.every((item) => item.auth === "bearer_token_from_environment_only")).toBe(true);
    expect(plan.map((item) => item.path).join("\n")).not.toContain("{attempt_id}");
    expect(redactOperatorSecret("attempt_live_fixture_123456")).toBe("atte...3456");
    expect(parseOperatorSubmitPayload(JSON.stringify({ answers: [{ question_id: "q1", option_code: "A" }] }))).toEqual({
      answers: [{ question_id: "q1", option_code: "A" }],
    });
    expect(() => parseOperatorSubmitPayload(JSON.stringify({ answer_key: { q1: "A" } }))).toThrow(/private fields/);
  });
});
