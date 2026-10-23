import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackCareerToolEvent } from "@/lib/career/toolTracking";
import { filterTrackingPayload, isCareerAttributionEvent } from "@/lib/tracking/events";
import { POST } from "@/app/api/track/route";

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent }));
afterEach(() => { window.localStorage.clear(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

const run = "a608db30-e4e1-4ec0-90bc-40539f7c9e50";
describe("Career tools use consent and independent task units", () => {
  it.each(["unknown", "denied"])("does not send with %s consent", analytics => {
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics }));
    trackCareerToolEvent("career_compare_entered", { locale: "en", toolRunId: run });
    expect(trackEvent).not.toHaveBeenCalled();
  });
  it("emits only task metadata, and keeps requests distinct from confirmed copy", () => {
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    trackCareerToolEvent("career_worksheet_copy_succeeded", { locale: "zh", toolRunId: run, outputFormat: "text" });
    expect(trackEvent).toHaveBeenCalledWith("career_worksheet_copy_succeeded", {
      locale: "zh", entry_surface: "career_worksheet", source_page_type: "career_worksheet",
      target_action: "worksheet_copy_succeeded", landing_path: "/zh/holland-test/pdf-download",
      route_family: "worksheet", subject_kind: "none", query_mode: "non_query", tool_run_id: run, output_format: "text",
    });
    expect(isCareerAttributionEvent("career_compare_succeeded")).toBe(true);
    expect(filterTrackingPayload("career_worksheet_copy_succeeded", {tool_run_id: run, output_format: "text", private_notes: "private", answers: "private"}))
      .toEqual({tool_run_id: run, output_format: "text"});
  });
  it("preserves a retry identity through the native Career adapter and drops unrelated fields", async () => {
    vi.stubEnv("TRACK_INGEST_TOKEN", "test_token_abcdefghijklmnopqrstuvwxyz");
    vi.stubEnv("TRACK_INGEST_API_ORIGIN", "https://api.fermatmind.com");
    vi.stubEnv("CAREER_ATTRIBUTION_INGEST_ENDPOINT", "https://api.fermatmind.com/api/v0.5/career/attribution/events");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", {status: 202}));
    vi.stubGlobal("fetch", fetchMock);
    const requestId = "7293ed91-a27a-4197-bc45-415198b730c0";
    const body = {eventName:"career_compare_entered", requestId, anonymousId:"codex_probe_tool_contract", path:"/en/career/compare", payload:{
      locale:"en", entry_surface:"career_compare", source_page_type:"career_compare", target_action:"compare_entered",
      landing_path:"/en/career/compare", route_family:"compare", subject_kind:"none", query_mode:"non_query", tool_run_id:run,
      private_notes:"secret", utm_source:"fermatmind_qa", utm_medium:"internal", utm_campaign:"b3_link_qa_20261023",
    }};
    for (let i=0;i<2;i++) expect((await POST(new NextRequest("https://fermatmind.com/api/track", {method:"POST",body:JSON.stringify(body)}))).status).toBe(200);
    const envelope=JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(envelope.requestId).toBe(requestId);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).requestId).toBe(requestId);
    expect(envelope.payload.tool_run_id).toBe(run);
    expect(envelope.payload.utm_source).toBe("fermatmind_qa");
    expect(envelope.payload).not.toHaveProperty("private_notes");
    expect(envelope.payload).not.toHaveProperty("is_internal");
    const unknownCampaign = { ...body, payload: { ...body.payload, utm_campaign: "campaign with spaces", utm_medium: "x".repeat(33) } };
    expect((await POST(new NextRequest("https://fermatmind.com/api/track", {method:"POST",body:JSON.stringify(unknownCampaign)}))).status).toBe(200);
    const retainedEvent = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(retainedEvent.payload.target_action).toBe("compare_entered");
    expect(retainedEvent.payload.utm_source).toBe("fermatmind_qa");
    expect(retainedEvent.payload).not.toHaveProperty("utm_campaign");
    expect(retainedEvent.payload).not.toHaveProperty("utm_medium");
    const invalid=await POST(new NextRequest("https://fermatmind.com/api/track", {method:"POST",body:JSON.stringify({...body,requestId:"bad id"})}));
    expect(invalid.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
