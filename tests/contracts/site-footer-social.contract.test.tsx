import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";

describe("site footer social contract", () => {
  it("keeps the QR panel open when activation follows focus", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter locale="en" />
      </LocaleProvider>
    );

    const qrButton = screen.getByRole("button", { name: "WeChat" });

    fireEvent.focus(qrButton);
    expect(qrButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByAltText("WeChat QR code").closest(".fm-social-qr-panel")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    fireEvent.click(qrButton);
    expect(qrButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByAltText("WeChat QR code").closest(".fm-social-qr-panel")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    fireEvent.blur(qrButton);
    expect(qrButton).toHaveAttribute("aria-expanded", "false");
  });

  it("uses governed UTM params for every footer social link", () => {
    const linkedItems = FOOTER_SOCIAL_ITEMS.filter((item) => item.kind !== "qr");
    expect(linkedItems.length).toBeGreaterThan(0);

    for (const item of linkedItems) {
      const href = item.href ?? "";
      const parsed = new URL(href);
      expect(parsed.searchParams.get("utm_source")).toBeTruthy();
      expect(parsed.searchParams.get("utm_medium")).toBeTruthy();
      expect(parsed.searchParams.get("utm_campaign")).toBeTruthy();
      expect(parsed.searchParams.get("utm_source")).not.toBe("qr");
      expect(parsed.searchParams.get("utm_source")).not.toBe("chatgpt.com");
    }
  });
});
