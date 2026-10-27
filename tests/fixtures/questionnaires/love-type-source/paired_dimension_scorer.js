"use strict";

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Frozen original CommonJS scorer fixture.
const helpers = require("./scorer_helpers");

function create({ testId, dimensions, questionCount, itemsPerDimension, status }) {
  const dimensionMap = Object.fromEntries(dimensions.map((dimension) => [dimension.dimension_code, dimension]));
  const allPoles = new Set(dimensions.flatMap((dimension) => dimension.pole_codes));

  function validateConfiguration(itemBank, scoringSpec) {
    const errors = [];
    const check = (condition, code) => { if (!condition) errors.push(code); };
    if (!helpers.plain(itemBank)) return { ok: false, errors: ["ITEM_BANK_NOT_OBJECT"] };
    if (!helpers.plain(scoringSpec)) return { ok: false, errors: ["SCORING_SPEC_NOT_OBJECT"] };
    check(itemBank.test_id === testId, "ITEM_BANK_TEST_ID_MISMATCH");
    check(scoringSpec.test_id === testId, "SCORING_SPEC_TEST_ID_MISMATCH");
    check(itemBank.item_bank_version === scoringSpec.compatible_item_bank_version, "ITEM_BANK_VERSION_MISMATCH");
    check(itemBank.construct_version === scoringSpec.compatible_construct_version, "CONSTRUCT_VERSION_MISMATCH");
    check(itemBank.form_code === scoringSpec.compatible_form_code, "FORM_CODE_MISMATCH");
    check(itemBank.renderer === "forced_choice", "RENDERER_INVALID");
    check(itemBank.public_preview === true && itemBank.psychometric_validation_completed === false, "PREVIEW_STATUS_INVALID");
    check(scoringSpec.scoring_model?.name === "paired_dimension_raw_wins", "SCORING_MODEL_INVALID");
    check(scoringSpec.scoring_model?.combined_type_enabled === false, "COMBINED_TYPE_MUST_BE_DISABLED");
    check(scoringSpec.scoring_model?.thresholds_enabled === false && scoringSpec.scoring_model?.norming_enabled === false, "UNVALIDATED_INTERPRETATION_ENABLED");
    check(Array.isArray(itemBank.items) && itemBank.items.length === questionCount, "ITEM_COUNT_MISMATCH");
    if (!Array.isArray(itemBank.items)) return { ok: false, errors };
    const ids = new Set();
    const counts = Object.fromEntries(dimensions.map((dimension) => [dimension.dimension_code, { items: 0, poles: Object.fromEntries(dimension.pole_codes.map((pole) => [pole, { total: 0, A: 0, B: 0 }])) }]));
    for (const item of itemBank.items) {
      const id = String(item?.question_id || "");
      check(id && !ids.has(id), `QUESTION_ID_INVALID:${id}`); ids.add(id);
      check(item?.renderer === "forced_choice" && item?.copyright_origin === "original", `ITEM_METADATA_INVALID:${id}`);
      const dimension = dimensionMap[item?.dimension_code];
      check(Boolean(dimension), `DIMENSION_INVALID:${id}`);
      check(Array.isArray(item?.options) && item.options.length === 2, `OPTIONS_INVALID:${id}`);
      if (!dimension || !Array.isArray(item.options) || item.options.length !== 2) continue;
      counts[item.dimension_code].items += 1;
      const seen = new Set();
      item.options.forEach((option, index) => {
        const expectedCode = index === 0 ? "A" : "B";
        check(option?.code === expectedCode, `OPTION_CODES_INVALID:${id}`);
        check(allPoles.has(option?.pole_code) && dimension.pole_codes.includes(option.pole_code), `POLE_INVALID:${id}`);
        check(typeof option?.text === "string" && option.text.trim(), `OPTION_TEXT_INVALID:${id}`);
        if (dimension.pole_codes.includes(option?.pole_code)) {
          seen.add(option.pole_code);
          counts[item.dimension_code].poles[option.pole_code].total += 1;
          counts[item.dimension_code].poles[option.pole_code][expectedCode] += 1;
        }
      });
      check(seen.size === 2, `POLE_PAIR_INVALID:${id}`);
    }
    for (const dimension of dimensions) {
      const count = counts[dimension.dimension_code];
      check(count.items === itemsPerDimension, `DIMENSION_ITEM_COUNT_INVALID:${dimension.dimension_code}`);
      for (const pole of dimension.pole_codes) {
        check(count.poles[pole].total === itemsPerDimension, `POLE_EXPOSURE_INVALID:${pole}`);
        check(count.poles[pole].A === itemsPerDimension / 2 && count.poles[pole].B === itemsPerDimension / 2, `POLE_SIDE_BALANCE_INVALID:${pole}`);
      }
    }
    return { ok: errors.length === 0, errors };
  }

  function baseResult(submission, itemBank, scoringSpec) {
    return { test_id: testId, submission_id: typeof submission?.submission_id === "string" ? submission.submission_id : "", scoring_version: scoringSpec?.scoring_version || "", item_bank_version: itemBank?.item_bank_version || "", model_status: status, public_preview: true, psychometric_validation_completed: false, scored_at: null };
  }

  function errorResult(submission, itemBank, scoringSpec, code, details, configurationError = false) {
    return { ...baseResult(submission, itemBank, scoringSpec), error: { code, details }, score_availability: configurationError ? "configuration_error" : "none", dimensions: {}, response_quality: { status: "low", flags: [configurationError ? "configuration_error" : "submission_invalid"], interpretation_suppressed: true }, audit: { submission_id: submission?.submission_id || "", payload_hash: null, invalid_question_ids: [], unknown_question_ids: [], configuration_checks: configurationError ? details : [] } };
  }

  function classified(submission, itemBank, scoringSpec) {
    const configuration = validateConfiguration(itemBank, scoringSpec);
    if (!configuration.ok) throw helpers.codedError("ITEM_BANK_INVALID", configuration.errors);
    const input = helpers.validateSubmission(submission, itemBank, scoringSpec, testId);
    if (!input.ok) throw helpers.codedError(helpers.submissionError(input.errors), input.errors);
    const classification = helpers.classify(submission, itemBank, (value) => typeof value === "string" && ["A", "B"].includes(value));
    return { configuration, input, ...classification };
  }

  function scoreSubmission(submission, itemBank, scoringSpec) {
    let data;
    try { data = classified(submission, itemBank, scoringSpec); }
    catch (error) { return errorResult(submission, itemBank, scoringSpec, error.code, error.details || [], error.code === "ITEM_BANK_INVALID"); }
    const dimensionsResult = Object.fromEntries(dimensions.map((dimension) => [dimension.dimension_code, {
      status: "incomplete",
      top_pole_codes: [],
      poles: Object.fromEntries(dimension.pole_codes.map((pole) => [pole, { wins: 0, answered_comparisons: 0, scheduled_comparisons: itemsPerDimension, selection_rate: null }]))
    }]));
    for (const item of itemBank.items) {
      const answer = data.states[item.question_id];
      if (answer.state !== "valid") continue;
      const dimension = dimensionsResult[item.dimension_code];
      item.options.forEach((option) => { dimension.poles[option.pole_code].answered_comparisons += 1; });
      dimension.poles[item.options.find((option) => option.code === answer.value).pole_code].wins += 1;
    }
    const summary = helpers.responseSummary(data.states, data.unknown, questionCount);
    for (const dimension of dimensions) {
      const output = dimensionsResult[dimension.dimension_code];
      Object.values(output.poles).forEach((pole) => { pole.selection_rate = pole.answered_comparisons ? helpers.round4(pole.wins / pole.answered_comparisons) : null; });
      if (summary.availability === "complete") {
        const max = Math.max(...Object.values(output.poles).map((pole) => pole.wins));
        output.top_pole_codes = Object.entries(output.poles).filter(([, pole]) => pole.wins === max).map(([code]) => code).sort();
        output.status = output.top_pole_codes.length > 1 ? "tied_raw_wins" : "available_raw_wins";
      }
    }
    return { ...baseResult(submission, itemBank, scoringSpec), error: summary.availability === "none" ? { code: "INSUFFICIENT_DATA", details: ["NO_VALID_RESPONSE"] } : null, score_availability: summary.availability, dimensions: dimensionsResult, response_quality: { status: summary.availability === "none" ? "low" : summary.flags.length ? "caution" : "ok", flags: summary.flags, evaluated_metrics: { valid_count: summary.validCount, missing_count: summary.missingIds.length, invalid_count: summary.invalidIds.length, unknown_question_id_count: summary.unknownIds.length, completion_rate: helpers.round4(summary.validCount / questionCount) }, interpretation_suppressed: summary.availability !== "complete" }, audit: { submission_id: submission.submission_id, payload_hash: null, invalid_question_ids: summary.invalidIds, unknown_question_ids: summary.unknownIds, configuration_checks: [] } };
  }

  function buildCanonicalPayload(submission, itemBank, scoringSpec) {
    const data = classified(submission, itemBank, scoringSpec);
    return helpers.canonicalPayload({ submission, itemBank, scoringSpec, testId, states: data.states, unknown: data.unknown });
  }

  function finalizeSubmission(args) {
    return helpers.finalize({ ...args, canonicalPayloadText: buildCanonicalPayload(args.submission, args.itemBank, args.scoringSpec), scoreAgain: () => scoreSubmission(args.submission, args.itemBank, args.scoringSpec) });
  }

  return { validateConfiguration, scoreSubmission, buildCanonicalPayload, finalizeSubmission };
}

module.exports = { create };
