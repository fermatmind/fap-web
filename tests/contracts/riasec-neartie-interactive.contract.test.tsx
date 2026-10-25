import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import samples from "./fixtures/riasec/neartie-source-v1_8.projection.json";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
afterEach(cleanup);
type Sample = (typeof samples.cases)[number];
const active = samples.cases.filter((item) => item.quality !== "low_quality");
function sample(form = "riasec_60"): Sample {
  return structuredClone(active.find((item) => item.form === form)!);
}
function show(data: Sample, locale: Locale = "en") {
  const vm = assembleRiasecResultViewModel({ ok: true, scale_code: "RIASEC", type_code: "RIA", riasec_public_projection_v2: data.projection } as unknown as ReportResponse, locale);
  render(<RiasecResultShell locale={locale} displayMode="interactive" viewModel={vm} />);
  return vm;
}

describe("source1.8 near-tie cards through the actual assembler and interactive reading branch", () => {
  it.each(active)("opens only the selected $form $quality $requested_state and alternate card", async (source) => {
    const data = structuredClone(source);
    const before = structuredClone(data);
    const vm = show(data);
    const user = userEvent.setup();
    expect(vm.authority).toBeNull();
    const group = screen.getByTestId("riasec-neartie-reading");
    expect(within(group).getAllByTestId("riasec-deep-content-slot")).toHaveLength(2);
    for (const adjacent of ["riasec-aspirations-reading", "riasec-disagree-reading"]) {
      expect(within(screen.getByTestId(adjacent)).getAllByTestId("riasec-deep-content-slot")).toHaveLength(3);
    }
    const slots = data.projection.deep_content_slots_v1.slots.filter((slot) => slot.slot_key === "near_tie_alternate_code_copy");
    expect(slots.map((slot) => slot.state.slot_name)).toEqual([data.requested_state, "alternate_code_available"]);
    for (const slot of slots) {
      const approved = samples.approved_source.states.find((row) => row.state === slot.state.slot_name)!;
      expect(slot.content.title).toBe(approved.title);
      for (const field of ["summary", "body", "copy"] as const) expect(slot.content[field]).toBe(approved.copy);
      expect(slot.boundaries.user_visible_boundary).toBe(samples.approved_source.user_visible_boundary);
      const heading = within(group).getByRole("heading", { name: approved.title });
      const details = heading.closest("details")!;
      const toggle = details.querySelector("summary")!;
      const body = within(details).getByText(approved.copy, { exact: true });
      const boundary = within(details).getByText(samples.approved_source.user_visible_boundary, { exact: true });
      expect(details.open).toBe(false);
      expect(body).not.toBeVisible();
      expect(boundary).not.toBeVisible();
      await user.click(toggle);
      expect(details.open).toBe(true);
      expect(body).toBeVisible();
      expect(boundary).toBeVisible();
      await user.click(toggle);
      expect(details.open).toBe(false);
      expect(body).not.toBeVisible();
    }
    const hero = screen.getByTestId("riasec-trusted-result-card");
    expect(within(hero).getByText(data.projection.result_summary_v1.ranking_display, { exact: true })).toBeVisible();
    expect(within(hero).getByText(data.projection.result_summary_v1.tie_note, { exact: true })).toBeVisible();
    expect(within(hero).getByText(/Additional reading order/)).toBeVisible();
    expect(vm.interpretationState?.alternateCode.codes).toEqual(data.projection.interpretation_state.alternate_code.codes);
    expect(group.textContent).not.toMatch(/\p{Script=Han}/u);
    expect(data).toEqual(before);
  });

  it.each(active)("honors alternate.show=false with stale alternate slots for $form $quality $requested_state", (source) => {
    const data = structuredClone(source);
    data.projection.interpretation_state.alternate_code.show = false;
    data.projection.interpretation_state.alternate_code.codes = [];
    data.projection.interpretation_state.tie_display_v1.alternate_codes = [];
    show(data);
    const group = screen.getByTestId("riasec-neartie-reading");
    expect(within(group).getAllByTestId("riasec-deep-content-slot")).toHaveLength(1);
    expect(within(group).queryByRole("heading", { name: samples.approved_source.states[3].title })).not.toBeInTheDocument();
  });

  it.each(samples.cases.filter((item) => item.quality === "low_quality"))("omits $form low-quality $requested_state", (data) => {
    show(data);
    expect(screen.queryByTestId("riasec-neartie-reading")).not.toBeInTheDocument();
  });

  it.each(["riasec_60", "riasec_140"])("omits stale near-tie slots when %s recommends retaking", (form) => {
    const data = sample(form);
    data.projection.interpretation_state.reading_strength = "retake_recommended";
    show(data);
    expect(screen.queryByTestId("riasec-neartie-reading")).not.toBeInTheDocument();
  });

  it.each(["missing", "envelope_locale", "root_locale", "fallback", "none", "unknown_state", "position", "alternate_order", "invalid_tie_order"])("omits the module for %s", (variant) => {
    const data = sample();
    const envelope = data.projection.deep_content_slots_v1;
    const state = data.projection.interpretation_state;
    switch (variant) {
      case "missing": envelope.slots = envelope.slots.filter((slot) => slot.slot_key !== "near_tie_alternate_code_copy"); break;
      case "envelope_locale": envelope.locale = "zh-CN"; break;
      case "root_locale": data.projection.locale = "zh-CN"; break;
      case "fallback": envelope.source_policy.frontend_fallback_allowed = true; break;
      case "none": state.near_tie_state.state = "none"; break;
      case "unknown_state": state.near_tie_state.state = "unknown"; break;
      case "position": state.tie_display_v1.position = "top2_top3_near_tie"; break;
      case "alternate_order": state.alternate_code.codes = ["ARI"]; break;
      case "invalid_tie_order": state.tie_display_v1.alternate_codes = ["ARI"]; break;
    }
    show(data);
    expect(screen.queryByTestId("riasec-neartie-reading")).not.toBeInTheDocument();
  });

  it.each(["title", "summary", "body_alias", "copy_alias", "boundary", "locale", "han", "form", "quality", "profile", "identity", "state_alias", "id", "key", "group", "module", "pending", "duplicate"])("rejects the invalid %s card and preserves the other selected card", (variant) => {
    const data = sample();
    const envelope = data.projection.deep_content_slots_v1;
    const slot = envelope.slots.find((item) => item.slot_key === "near_tie_alternate_code_copy")!;
    switch (variant) {
      case "title": Reflect.deleteProperty(slot.content, "title"); break;
      case "summary": slot.content.summary = ""; break;
      case "body_alias": slot.content.body = "different"; break;
      case "copy_alias": slot.content.copy = "different"; break;
      case "boundary": slot.boundaries.user_visible_boundary = " "; break;
      case "locale": slot.locale = "zh-CN"; break;
      case "han": slot.content.summary = "\u{20000}"; break;
      case "form": slot.applicability.form_codes = ["riasec_140"]; break;
      case "quality": slot.applicability.quality_states = []; break;
      case "profile": slot.applicability.profile_shapes = []; break;
      case "identity": slot.state.slot_name = "unknown"; break;
      case "state_alias": slot.state.near_tie_copy_state = "unknown"; break;
      case "id": slot.slot_id = "wrong"; break;
      case "key": slot.slot_key = "profile_shape_copy"; break;
      case "group": slot.slot_group = "quality_copy"; break;
      case "module": slot.module_key = "quality_copy"; break;
      case "pending": slot.content_status = "pending"; break;
      case "duplicate": envelope.slots = [...envelope.slots, structuredClone(slot)]; break;
    }
    show(data);
    const group = screen.getByTestId("riasec-neartie-reading");
    expect(within(group).getAllByTestId("riasec-deep-content-slot")).toHaveLength(1);
    expect(within(group).queryByRole("heading", { name: samples.approved_source.states[0].title })).not.toBeInTheDocument();
    expect(screen.queryByText("Further reading", { exact: true })).not.toBeInTheDocument();
  });

  it("does not render unselected legitimate near-tie states", () => {
    const data = sample();
    const selected = data.projection.deep_content_slots_v1.slots.find((slot) => slot.slot_key === "near_tie_alternate_code_copy")!;
    for (const state of ["top2_top3_near_tie", "multi_near_tie"]) {
      const extra = structuredClone(selected);
      extra.state.slot_name = state;
      extra.state.near_tie_copy_state = state;
      extra.slot_id = `near_tie_alternate_code_copy:${state}`;
      data.projection.deep_content_slots_v1.slots = [...data.projection.deep_content_slots_v1.slots, extra];
    }
    show(data);
    expect(within(screen.getByTestId("riasec-neartie-reading")).getAllByTestId("riasec-deep-content-slot")).toHaveLength(2);
  });

  it("honors backend hidden and visible states", () => {
    const data = sample();
    const slots = data.projection.deep_content_slots_v1.slots.filter((slot) => slot.slot_key === "near_tie_alternate_code_copy");
    slots.forEach((slot) => { slot.slot_visibility = "hidden"; });
    show(data);
    expect(screen.queryByTestId("riasec-neartie-reading")).not.toBeInTheDocument();
    cleanup();
    slots.forEach((slot) => { slot.slot_visibility = "visible"; });
    show(data);
    const group = screen.getByTestId("riasec-neartie-reading");
    expect(group.querySelector("details")).toBeNull();
    expect(within(group).getByText(slots[0].content.summary, { exact: true })).toBeVisible();
  });

  it("does not admit the new English module on a Chinese page", () => {
    show(sample(), "zh");
    expect(screen.queryByTestId("riasec-neartie-reading")).not.toBeInTheDocument();
  });
});
