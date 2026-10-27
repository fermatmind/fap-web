"use strict";

function plain(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function jsonSafe(value, seen = new Set()) {
  if (value === null || ["string", "boolean"].includes(typeof value)) return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  const safe = Array.isArray(value)
    ? value.every((entry) => jsonSafe(entry, seen))
    : plain(value) && Object.values(value).every((entry) => jsonSafe(entry, seen));
  seen.delete(value);
  return safe;
}

function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = canonicalize(value[key]);
    return output;
  }, {});
}

const round4 = (value) => Math.round((value + Number.EPSILON) * 10000) / 10000;
const codedError = (code, details = []) => Object.assign(new Error(code), { code, details });

function validateSubmission(submission, itemBank, scoringSpec, testId) {
  const errors = [];
  if (!plain(submission)) return { ok: false, errors: ["SUBMISSION_NOT_OBJECT"] };
  if (typeof submission.submission_id !== "string" || !submission.submission_id.trim()) errors.push("SUBMISSION_ID_INVALID");
  if (submission.test_id !== testId) errors.push("TEST_ID_MISMATCH");
  if (submission.item_bank_version !== itemBank?.item_bank_version) errors.push("ITEM_BANK_VERSION_MISMATCH");
  if (submission.scoring_version !== scoringSpec?.scoring_version) errors.push("SCORING_VERSION_MISMATCH");
  if (!plain(submission.answers)) errors.push("ANSWERS_NOT_PLAIN_OBJECT");
  else if (!jsonSafe(submission.answers)) errors.push("ANSWERS_NOT_JSON_SAFE");
  if (submission.duration_ms !== undefined && (!Number.isFinite(submission.duration_ms) || submission.duration_ms < 0)) errors.push("DURATION_INVALID");
  return { ok: errors.length === 0, errors };
}

function submissionError(errors) {
  if (errors.includes("SCORING_VERSION_MISMATCH")) return "SCORING_VERSION_MISMATCH";
  if (errors.includes("ITEM_BANK_VERSION_MISMATCH")) return "ITEM_BANK_VERSION_MISMATCH";
  return "SUBMISSION_INVALID";
}

function classify(submission, itemBank, validValue) {
  const knownIds = itemBank.items.map((item) => item.question_id).sort();
  const known = new Set(knownIds);
  const states = {};
  for (const id of knownIds) {
    const present = Object.prototype.hasOwnProperty.call(submission.answers, id);
    const value = submission.answers[id];
    states[id] = !present || value === null
      ? { state: "missing" }
      : validValue(value) ? { state: "valid", value } : { state: "invalid", raw_type: typeof value, raw_value: value };
  }
  const unknown = Object.fromEntries(Object.entries(submission.answers).filter(([id]) => !known.has(id)));
  return { states, unknown };
}

function responseSummary(states, unknown, questionCount) {
  const validCount = Object.values(states).filter((answer) => answer.state === "valid").length;
  const missingIds = Object.entries(states).filter(([, answer]) => answer.state === "missing").map(([id]) => id);
  const invalidIds = Object.entries(states).filter(([, answer]) => answer.state === "invalid").map(([id]) => id);
  const unknownIds = Object.keys(unknown).sort();
  const availability = validCount === questionCount ? "complete" : validCount > 0 ? "partial" : "none";
  const flags = [];
  if (missingIds.length) flags.push("missing_response");
  if (invalidIds.length) flags.push("invalid_response_value");
  if (unknownIds.length) flags.push("unknown_question_id");
  return { validCount, missingIds, invalidIds, unknownIds, availability, flags };
}

function canonicalPayload({ submission, itemBank, scoringSpec, testId, states, unknown }) {
  return JSON.stringify(canonicalize({
    test_id: testId,
    item_bank_version: itemBank.item_bank_version,
    scoring_version: scoringSpec.scoring_version,
    duration_ms: submission.duration_ms ?? null,
    known_answers: Object.keys(states).sort().map((id) => ({ question_id: id, ...canonicalize(states[id]) })),
    unknown_answers: Object.keys(unknown).sort().map((id) => ({ question_id: id, raw_type: typeof unknown[id], raw_value: canonicalize(unknown[id]) })),
  }));
}

async function finalize({ submission, result, canonicalPayloadText, scoreAgain, store, sha256Hex, now }) {
  if (!result || result.error !== null || result.score_availability !== "complete") {
    throw codedError(result?.error?.code || "INSUFFICIENT_DATA", result?.error?.details || []);
  }
  const authoritative = scoreAgain();
  if (JSON.stringify(canonicalize(authoritative)) !== JSON.stringify(canonicalize(result))) {
    throw codedError("SCORING_INTERNAL_ERROR", ["RESULT_PAYLOAD_MISMATCH"]);
  }
  const payloadHash = await Promise.resolve(sha256Hex(canonicalPayloadText));
  if (!/^[a-f0-9]{64}$/iu.test(payloadHash)) throw codedError("SCORING_INTERNAL_ERROR", ["PAYLOAD_HASH_INVALID"]);
  const existing = store.get(submission.submission_id);
  if (existing) {
    if (existing.payload_hash === payloadHash) return existing.result;
    throw codedError("SUBMISSION_CONFLICT");
  }
  const scoredDate = new Date(now());
  if (!Number.isFinite(scoredDate.getTime())) throw codedError("SCORING_INTERNAL_ERROR", ["SCORED_AT_INVALID"]);
  const finalized = { ...result, scored_at: scoredDate.toISOString(), audit: { ...result.audit, payload_hash: payloadHash } };
  store.set(submission.submission_id, { payload_hash: payloadHash, result: finalized });
  return finalized;
}

module.exports = {
  plain,
  jsonSafe,
  canonicalize,
  round4,
  codedError,
  validateSubmission,
  submissionError,
  classify,
  responseSummary,
  canonicalPayload,
  finalize,
};
