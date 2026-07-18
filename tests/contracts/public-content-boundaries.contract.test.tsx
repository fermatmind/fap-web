import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { PublicContentError } from "@/components/states/PublicContentError";
import { PublicContentLoading } from "@/components/states/PublicContentLoading";

const captureError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/sentry", () => ({ captureError }));

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

const families = ["personality", "articles", "topics", "career", "tests", "support", "research"] as const;

describe("public content route boundaries", () => {
  beforeEach(() => {
    captureError.mockReset();
  });

  it("renders a localized accessible loading shell without editorial fallback", () => {
    render(
      <LocaleProvider locale="zh">
        <PublicContentLoading />
      </LocaleProvider>
    );

    expect(screen.getByRole("status", { name: "正在加载页面内容" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveAttribute("data-public-content-loading", "true");
  });

  it("captures a bounded public error and exposes retry", () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("temporary"), { digest: "digest-1" });

    render(
      <LocaleProvider locale="en">
        <PublicContentError error={error} reset={reset} surface="topics" />
      </LocaleProvider>
    );

    expect(screen.getByRole("alert")).toHaveAttribute("data-public-content-error", "topics");
    expect(captureError).toHaveBeenCalledWith(error, expect.objectContaining({
      route: "public-content-boundary",
      surface: "topics",
      digest: "digest-1",
    }));
    const retryButton = screen.getByRole("button", { name: "Retry" });
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    expect(reset).toHaveBeenCalledTimes(2);
    expect(retryButton).toBeEnabled();
  });

  it("locks a Career detail retry while its real route reload is in progress", () => {
    const reset = vi.fn();
    const retryAction = vi.fn();
    const error = new Error("temporary");

    render(
      <LocaleProvider locale="en">
        <PublicContentError
          error={error}
          reset={reset}
          retryAction={retryAction}
          surface="career"
        />
      </LocaleProvider>
    );

    const retryButton = screen.getByRole("button", { name: "Retry" });
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    expect(retryAction).toHaveBeenCalledOnce();
    expect(reset).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Retrying…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Retrying…" })).toHaveAttribute("aria-busy", "true");
  });

  it("makes Career errors start a new route request without frontend content fallback", () => {
    const source = read("app/(localized)/[locale]/career/error.tsx");

    expect(source).toContain("window.location.reload()");
    expect(source).toContain('surface="career" retryAction={reloadCareerRoute}');
    expect(source).not.toContain("fallback");
  });

  it("wires every declared public content family to shared loading and error shells", () => {
    for (const family of families) {
      const root = `app/(localized)/[locale]/${family}`;
      const loading = read(`${root}/loading.tsx`);
      const error = read(`${root}/error.tsx`);

      expect(loading).toContain("<PublicContentLoading />");
      expect(error).toContain('"use client"');
      if (family === "career") {
        expect(error).toContain('<PublicContentError {...props} surface="career" retryAction={reloadCareerRoute} />');
      } else {
        expect(error).toContain(`<PublicContentError {...props} surface="${family}" />`);
      }
    }
  });
});
