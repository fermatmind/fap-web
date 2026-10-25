"use strict";

const VALID_CODES = ["A", "B"];

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

const round4 = (value) => Math.round((value + Number.EPSILON) * 10000) / 10000;
const canonicalize = (value) => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = canonicalize(value[key]);
    return output;
  }, {});
};
const codedError = (code, details = []) => Object.assign(new Error(code), { code, details });

function create({ testId, directionCodes, questionCount, pairOccurrences, scheduledComparisons, status }) {
  const directionSet = new Set(directionCodes);

  function validateConfiguration(itemBank, scoringSpec) {
    const errors = [];
    const check = (condition, code) => { if (!condition) errors.push(code); };
    if (!plain(itemBank)) return { ok: false, errors: ["ITEM_BANK_NOT_OBJECT"] };
    if (!plain(scoringSpec)) return { ok: false, errors: ["SCORING_SPEC_NOT_OBJECT"] };
    check(itemBank.test_id === testId, "ITEM_BANK_TEST_ID_MISMATCH");
    check(scoringSpec.test_id === testId, "SCORING_SPEC_TEST_ID_MISMATCH");
    check(itemBank.item_bank_version === scoringSpec.compatible_item_bank_version, "ITEM_BANK_VERSION_MISMATCH");
    check(itemBank.construct_version === scoringSpec.compatible_construct_version, "CONSTRUCT_VERSION_MISMATCH");
    check(itemBank.form_code === scoringSpec.compatible_form_code, "FORM_CODE_MISMATCH");
    check(itemBank.renderer === "forced_choice", "RENDERER_INVALID");
    check(itemBank.public_preview === true, "PUBLIC_PREVIEW_REQUIRED");
    check(itemBank.psychometric_validation_completed === false, "VALIDATION_STATUS_INVALID");
    check(scoringSpec.scoring_model?.name === "forced_choice_raw_wins", "SCORING_MODEL_INVALID");
    check(scoringSpec.scoring_model?.thresholds_enabled === false, "THRESHOLDS_MUST_BE_DISABLED");
    check(Array.isArray(itemBank.items), "ITEMS_NOT_ARRAY");
    if (!Array.isArray(itemBank.items)) return { ok: false, errors };
    check(itemBank.items.length === questionCount, "ITEM_COUNT_MISMATCH");
    const ids = new Set();
    const pairs = new Map();
    const exposure = Object.fromEntries(directionCodes.map((code) => [code, { total: 0, A: 0, B: 0 }]));
    for (const item of itemBank.items) {
      const id = String(item?.question_id || "");
      check(plain(item), "ITEM_NOT_OBJECT");
      check(Boolean(id), "QUESTION_ID_MISSING");
      check(!ids.has(id), `DUPLICATE_QUESTION_ID:${id}`);
      ids.add(id);
      check(item?.renderer === "forced_choice", `ITEM_RENDERER_INVALID:${id}`);
      check(item?.copyright_origin === "original", `COPYRIGHT_ORIGIN_INVALID:${id}`);
      check(Array.isArray(item?.options) && item.options.length === 2, `OPTIONS_INVALID:${id}`);
      if (!Array.isArray(item?.options) || item.options.length !== 2) continue;
      check(item.options[0]?.code === "A" && item.options[1]?.code === "B", `OPTION_CODES_INVALID:${id}`);
      const directions = new Set();
      for (const option of item.options) {
        check(plain(option), `OPTION_NOT_OBJECT:${id}`);
        check(directionSet.has(option?.direction_code), `DIRECTION_INVALID:${id}`);
        check(typeof option?.text === "string" && option.text.trim().length > 0, `OPTION_TEXT_INVALID:${id}`);
        if (directionSet.has(option?.direction_code)) {
          directions.add(option.direction_code);
          exposure[option.direction_code].total += 1;
          if (VALID_CODES.includes(option.code)) exposure[option.direction_code][option.code] += 1;
        }
      }
      check(directions.size === 2, `PAIR_DIRECTIONS_INVALID:${id}`);
      if (directions.size === 2) {
        const pair = [...directions].sort().join("|");
        pairs.set(pair, (pairs.get(pair) || 0) + 1);
      }
    }
    check(pairs.size === directionCodes.length * (directionCodes.length - 1) / 2, "PAIR_COUNT_MISMATCH");
    for (const [pair, count] of pairs) check(count === pairOccurrences, `PAIR_OCCURRENCES_INVALID:${pair}`);
    for (const code of directionCodes) {
      check(exposure[code].total === scheduledComparisons, `DIRECTION_EXPOSURE_INVALID:${code}`);
      check(exposure[code].A === scheduledComparisons / 2, `DIRECTION_A_EXPOSURE_INVALID:${code}`);
      check(exposure[code].B === scheduledComparisons / 2, `DIRECTION_B_EXPOSURE_INVALID:${code}`);
    }
    return { ok: errors.length === 0, errors };
  }

  function validateSubmission(submission, itemBank, scoringSpec) {
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

  const submissionError = (errors) => errors.includes("SCORING_VERSION_MISMATCH")
    ? "SCORING_VERSION_MISMATCH"
    : errors.includes("ITEM_BANK_VERSION_MISMATCH") ? "ITEM_BANK_VERSION_MISMATCH" : "SUBMISSION_INVALID";

  function baseResult(submission, itemBank, scoringSpec) {
    return {
      test_id: testId,
      submission_id: typeof submission?.submission_id === "string" ? submission.submission_id : "",
      scoring_version: scoringSpec?.scoring_version || "",
      item_bank_version: itemBank?.item_bank_version || "",
      model_status: status,
      public_preview: true,
      psychometric_validation_completed: false,
      scored_at: null,
    };
  }

  function errorResult({ submission, itemBank, scoringSpec, code, details, configurationError = false }) {
    return {
      ...baseResult(submission, itemBank, scoringSpec),
      error: { code, details: details || [] },
      score_availability: configurationError ? "configuration_error" : "none",
      directions: {},
      ranking: { status: "suppressed", groups: [], top_direction_codes: [] },
      response_quality: { status: "low", flags: [configurationError ? "configuration_error" : "submission_invalid"], interpretation_suppressed: true },
      audit: { submission_id: submission?.submission_id || "", payload_hash: null, invalid_question_ids: [], unknown_question_ids: [], configuration_checks: configurationError ? details || [] : [] },
    };
  }

  function classify(submission, itemBank) {
    const knownIds = itemBank.items.map((item) => item.question_id).sort();
    const known = new Set(knownIds);
    const states = {};
    for (const id of knownIds) {
      const present = Object.prototype.hasOwnProperty.call(submission.answers, id);
      const value = submission.answers[id];
      states[id] = !present || value === null
        ? { state: "missing" }
        : typeof value === "string" && VALID_CODES.includes(value) ? { state: "valid", value } : { state: "invalid", raw_type: typeof value, raw_value: value };
    }
    const unknown = Object.fromEntries(Object.entries(submission.answers).filter(([id]) => !known.has(id)));
    return { states, unknown };
  }

  function rank(directions, complete) {
    if (!complete) return { status: "suppressed_incomplete", groups: [], top_direction_codes: [] };
    const buckets = new Map();
    for (const [code, score] of Object.entries(directions)) buckets.set(score.wins, [...(buckets.get(score.wins) || []), code]);
    let nextRank = 1;
    const groups = [...buckets.entries()].sort((a, b) => b[0] - a[0]).map(([wins, codes]) => {
      const directionCodes = codes.sort();
      const group = { rank: nextRank, wins, direction_codes: directionCodes };
      nextRank += directionCodes.length;
      return group;
    });
    for (const group of groups) for (const code of group.direction_codes) {
      directions[code].rank = group.rank;
      directions[code].tied_with = group.direction_codes.filter((candidate) => candidate !== code);
    }
    return { status: "available_raw_wins", groups, top_direction_codes: groups[0]?.direction_codes || [] };
  }

  function scoreSubmission(submission, itemBank, scoringSpec) {
    const configuration = validateConfiguration(itemBank, scoringSpec);
    if (!configuration.ok) return errorResult({ submission, itemBank, scoringSpec, code: "ITEM_BANK_INVALID", details: configuration.errors, configurationError: true });
    const input = validateSubmission(submission, itemBank, scoringSpec);
    if (!input.ok) return errorResult({ submission, itemBank, scoringSpec, code: submissionError(input.errors), details: input.errors });
    const { states, unknown } = classify(submission, itemBank);
    const directions = Object.fromEntries(directionCodes.map((code) => [code, { wins: 0, answered_comparisons: 0, scheduled_comparisons: scheduledComparisons, selection_rate: null, rank: null, tied_with: [] }]));
    for (const item of itemBank.items) {
      const answer = states[item.question_id];
      if (answer.state !== "valid") continue;
      item.options.forEach((option) => { directions[option.direction_code].answered_comparisons += 1; });
      directions[item.options.find((option) => option.code === answer.value).direction_code].wins += 1;
    }
    Object.values(directions).forEach((score) => { score.selection_rate = score.answered_comparisons ? round4(score.wins / score.answered_comparisons) : null; });
    const validCount = Object.values(states).filter((answer) => answer.state === "valid").length;
    const missingIds = Object.entries(states).filter(([, answer]) => answer.state === "missing").map(([id]) => id);
    const invalidIds = Object.entries(states).filter(([, answer]) => answer.state === "invalid").map(([id]) => id);
    const unknownIds = Object.keys(unknown).sort();
    const availability = validCount === questionCount ? "complete" : validCount > 0 ? "partial" : "none";
    const flags = [];
    if (missingIds.length) flags.push("missing_response");
    if (invalidIds.length) flags.push("invalid_response_value");
    if (unknownIds.length) flags.push("unknown_question_id");
    return {
      ...baseResult(submission, itemBank, scoringSpec),
      error: availability === "none" ? { code: "INSUFFICIENT_DATA", details: ["NO_VALID_RESPONSE"] } : null,
      score_availability: availability,
      directions,
      ranking: rank(directions, availability === "complete"),
      response_quality: { status: availability === "none" ? "low" : flags.length ? "caution" : "ok", flags, evaluated_metrics: { valid_count: validCount, missing_count: missingIds.length, invalid_count: invalidIds.length, unknown_question_id_count: unknownIds.length, completion_rate: round4(validCount / questionCount) }, interpretation_suppressed: availability !== "complete" },
      audit: { submission_id: submission.submission_id, payload_hash: null, invalid_question_ids: invalidIds, unknown_question_ids: unknownIds, configuration_checks: [] },
    };
  }

  function canonicalPayload(submission, itemBank, scoringSpec) {
    const configuration = validateConfiguration(itemBank, scoringSpec);
    if (!configuration.ok) throw codedError("ITEM_BANK_INVALID", configuration.errors);
    const input = validateSubmission(submission, itemBank, scoringSpec);
    if (!input.ok) throw codedError(submissionError(input.errors), input.errors);
    const { states, unknown } = classify(submission, itemBank);
    return JSON.stringify(canonicalize({ test_id: testId, item_bank_version: itemBank.item_bank_version, scoring_version: scoringSpec.scoring_version, duration_ms: submission.duration_ms ?? null, known_answers: Object.keys(states).sort().map((id) => ({ question_id: id, ...canonicalize(states[id]) })), unknown_answers: Object.keys(unknown).sort().map((id) => ({ question_id: id, raw_type: typeof unknown[id], raw_value: canonicalize(unknown[id]) })) }));
  }

  async function finalizeSubmission({ submission, result, itemBank, scoringSpec, store, sha256Hex, now }) {
    if (!result || result.error !== null || result.score_availability !== "complete") throw codedError(result?.error?.code || "INSUFFICIENT_DATA", result?.error?.details || []);
    const authoritative = scoreSubmission(submission, itemBank, scoringSpec);
    if (JSON.stringify(canonicalize(authoritative)) !== JSON.stringify(canonicalize(result))) throw codedError("SCORING_INTERNAL_ERROR", ["RESULT_PAYLOAD_MISMATCH"]);
    const payloadHash = await Promise.resolve(sha256Hex(canonicalPayload(submission, itemBank, scoringSpec)));
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

  return { validateConfiguration, validateSubmission, scoreSubmission, buildCanonicalPayload: canonicalPayload, finalizeSubmission };
}

module.exports = { create };
