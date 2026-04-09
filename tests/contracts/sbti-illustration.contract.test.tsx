/* eslint-disable @next/next/no-img-element */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SbtiResultIllustrationCard } from "@/components/sbti/result/SbtiResultIllustrationCard";
import { getSbtiIllustration, SBTI_ILLUSTRATION_MAP } from "@/components/sbti/result/sbtiIllustrationMap";

vi.mock("next/image", () => ({
  default: ({
    priority,
    alt = "",
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority;
    return <img alt={alt} {...props} />;
  },
}));

describe("sbti illustration contract", () => {
  it("maintains explicit mappings for all 25 sbti result types", () => {
    expect(Object.keys(SBTI_ILLUSTRATION_MAP)).toHaveLength(25);
    expect(getSbtiIllustration("MUM")?.src).toBe("/static/sbti/illustrations/MUM.png");
    expect(getSbtiIllustration("ATM")?.src).toBe("/static/sbti/illustrations/ATM.png");
    expect(getSbtiIllustration("WOC")?.src).toBe("/static/sbti/illustrations/WOC.png");
  });

  it("renders the exact mapped illustration for mum", () => {
    render(<SbtiResultIllustrationCard typeCode="MUM" displayName="妈妈" />);

    const image = screen.getByRole("img", { name: "妈妈 人格插画" });
    expect(image).toHaveAttribute("src", "/static/sbti/illustrations/MUM.png");
  });

  it("fails closed when a type is unmapped", () => {
    const { container } = render(<SbtiResultIllustrationCard typeCode="UNKNOWN" displayName="未知" />);

    expect(container.firstChild).toBeNull();
  });
});
