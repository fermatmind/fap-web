import { afterEach, describe, expect, it } from "vitest";
import {
  buildPrivateResultPrintPath,
  installPrivateResultPrintUrlRedaction,
  PRIVATE_RESULT_PRINT_TITLE,
} from "@/lib/result/privatePrintUrlRedaction";

const ORIGINAL_TITLE = "Original result title";
const RAW_ATTEMPT_SEGMENT = "private-attempt-sample";

function setBrowserUrl(path: string): void {
  window.history.replaceState(window.history.state, "", path);
}

afterEach(() => {
  document.title = "";
  setBrowserUrl("/");
});

describe("private result print URL redaction", () => {
  it("builds locale-scoped safe print paths without result identifiers", () => {
    expect(buildPrivateResultPrintPath("zh")).toBe("/zh/result/print");
    expect(buildPrivateResultPrintPath("en")).toBe("/en/result/print");
  });

  it("redacts the private result URL and title during browser print, then restores both", () => {
    document.title = ORIGINAL_TITLE;
    setBrowserUrl(`/zh/result/${RAW_ATTEMPT_SEGMENT}?access_token=private-token`);
    const originalHref = window.location.href;

    const cleanup = installPrivateResultPrintUrlRedaction("zh");

    window.dispatchEvent(new Event("beforeprint"));

    expect(window.location.pathname).toBe("/zh/result/print");
    expect(window.location.href).not.toContain(RAW_ATTEMPT_SEGMENT);
    expect(window.location.href).not.toContain("access_token");
    expect(document.title).toBe(PRIVATE_RESULT_PRINT_TITLE);
    expect(document.title).not.toContain(RAW_ATTEMPT_SEGMENT);

    window.dispatchEvent(new Event("afterprint"));

    expect(window.location.href).toBe(originalHref);
    expect(document.title).toBe(ORIGINAL_TITLE);

    cleanup();
  });

  it("restores the original URL on cleanup if print is cancelled before afterprint", () => {
    document.title = ORIGINAL_TITLE;
    setBrowserUrl(`/en/result/${RAW_ATTEMPT_SEGMENT}`);
    const originalHref = window.location.href;

    const cleanup = installPrivateResultPrintUrlRedaction("en");

    window.dispatchEvent(new Event("beforeprint"));
    expect(window.location.pathname).toBe("/en/result/print");

    cleanup();

    expect(window.location.href).toBe(originalHref);
    expect(document.title).toBe(ORIGINAL_TITLE);
  });
});
