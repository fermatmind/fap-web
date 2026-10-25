import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import samples from "./fixtures/riasec/aspirations-source-v1_7.projection.json";

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
}));
afterEach(cleanup);

type Sample = (typeof samples.cases)[number];
function sample(form = "riasec_60", quality = "normal"): Sample {
  return structuredClone(samples.cases.find((item) => item.form === form && item.quality === quality)!);
}
function show(data: Sample, locale: Locale = "en") {
  const vm = assembleRiasecResultViewModel({
    ok: true,
    scale_code: "RIASEC",
    type_code: "RIA",
    riasec_public_projection_v2: data.projection,
  } as unknown as ReportResponse, locale);
  render(<RiasecResultShell locale={locale} displayMode="interactive" viewModel={vm} />);
  return vm;
}

describe("source1.7 aspirations cards in the real interactive reading branch", () => {
  it.each(samples.cases.filter((item) => item.quality !== "low_quality"))(
    "opens and closes the approved $form $quality cards with their exact boundaries",
    async (data) => {
      const before = structuredClone(data);
      const vm = show(data);
      const user = userEvent.setup();
      expect(vm.authority).toBeNull();
      const group = screen.getByTestId("riasec-aspirations-reading");
      expect(within(group).getAllByTestId("riasec-deep-content-slot")).toHaveLength(3);
      const sources = data.projection.deep_content_slots_v1.slots.filter((slot) => slot.slot_key === "aspirations_calibration_copy");
      expect(within(screen.getByTestId("riasec-disagree-reading")).getAllByTestId("riasec-deep-content-slot")).toHaveLength(3);
      for (const source of sources) {
        const heading = within(group).getByRole("heading", { name: source.content.title });
        const details = heading.closest("details")!;
        const summary = details.querySelector("summary")!;
        const body = within(details).getByText(source.content.summary, { exact: true });
        const boundary = within(details).getByText(source.boundaries.user_visible_boundary, { exact: true });
        expect(details.open).toBe(false);
        expect(heading).toBeVisible();
        expect(body).not.toBeVisible();
        expect(boundary).not.toBeVisible();
        await user.click(summary);
        expect(details.open).toBe(true);
        expect(body).toBeVisible();
        expect(boundary).toBeVisible();
        await user.click(summary);
        expect(details.open).toBe(false);
        expect(body).not.toBeVisible();
      }
      expect(data).toEqual(before);
      expect(group.textContent).not.toMatch(/\p{Script=Han}/u);
    },
  );

  it.each(["riasec_60", "riasec_140"])("omits %s low-quality and retake reading even if old cards remain", (form) => {
    const low = sample(form, "low_quality");
    low.projection.deep_content_slots_v1.slots = sample(form).projection.deep_content_slots_v1.slots;
    show(low);
    expect(screen.queryByTestId("riasec-aspirations-reading")).not.toBeInTheDocument();
    cleanup();
    const retake = sample(form);
    retake.projection.interpretation_state.reading_strength = "retake_recommended";
    show(retake);
    expect(screen.queryByTestId("riasec-aspirations-reading")).not.toBeInTheDocument();
  });

  it("honors hidden and visible slot states from the backend projection", () => {
    const data = sample();
    data.projection.deep_content_slots_v1.slots.filter((slot) => slot.slot_key === "aspirations_calibration_copy").forEach((slot) => { slot.slot_visibility = "hidden"; });
    show(data);
    expect(screen.queryByTestId("riasec-aspirations-reading")).not.toBeInTheDocument();
    cleanup();
    data.projection.deep_content_slots_v1.slots.filter((slot) => slot.slot_key === "aspirations_calibration_copy").forEach((slot) => { slot.slot_visibility = "visible"; });
    show(data);
    const group = screen.getByTestId("riasec-aspirations-reading");
    expect(group.querySelector("details")).toBeNull();
    expect(within(group).getByText(data.projection.deep_content_slots_v1.slots[0].content.summary, { exact: true })).toBeVisible();
  });

  it.each(["missing", "title", "summary", "boundary", "locale", "envelope_locale", "root_locale", "han", "form", "quality_applicability", "profile_applicability", "unknown", "provided_state", "pending", "fallback"])(
    "omits a card or module when its %s source contract is unavailable",
    (variant) => {
      const data = sample();
      const envelope = data.projection.deep_content_slots_v1;
      const slot = envelope.slots.find((item) => item.slot_key === "aspirations_calibration_copy")!;
      switch (variant) {
        case "missing": envelope.slots = envelope.slots.filter((item) => item.slot_key !== "aspirations_calibration_copy"); break;
        case "title": Reflect.deleteProperty(slot.content, "title"); break;
        case "summary": slot.content.summary = ""; break;
        case "boundary": slot.boundaries.user_visible_boundary = " "; break;
        case "locale": slot.locale = "zh-CN"; break;
        case "envelope_locale": envelope.locale = "zh-CN"; break;
        case "root_locale": data.projection.locale = "zh-CN"; break;
        case "han": slot.content.summary = "\u{20000}"; break;
        case "form": slot.applicability.form_codes = ["riasec_140"]; break;
        case "quality_applicability": slot.applicability.quality_states = []; break;
        case "profile_applicability": slot.applicability.profile_shapes = []; break;
        case "unknown": slot.state.slot_name = "unknown"; break;
        case "provided_state": Object.assign(slot.state, { aspirations_state: "provided" }); break;
        case "pending": slot.content_status = "pending"; break;
        case "fallback": envelope.source_policy.frontend_fallback_allowed = true; break;
      }
      show(data);
      const moduleOmitted = ["missing", "envelope_locale", "root_locale", "fallback"].includes(variant);
      if (moduleOmitted) {
        expect(screen.queryByTestId("riasec-aspirations-reading")).not.toBeInTheDocument();
      } else {
        const group = screen.getByTestId("riasec-aspirations-reading");
        expect(within(group).getAllByTestId("riasec-deep-content-slot")).toHaveLength(2);
        expect(within(group).queryByText(samples.cases[0].projection.deep_content_slots_v1.slots[0].content.title, { exact: true })).not.toBeInTheDocument();
      }
      expect(screen.queryByText("Further reading", { exact: true })).not.toBeInTheDocument();
    },
  );

  it("keeps the Chinese page from consuming the selected English source", () => {
    show(sample(), "zh");
    expect(screen.queryByTestId("riasec-aspirations-reading")).not.toBeInTheDocument();
  });
});
