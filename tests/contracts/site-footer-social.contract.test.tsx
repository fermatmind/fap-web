import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("site footer social contract", () => {
  it("keeps the QR panel open when activation follows focus", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter />
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
});
