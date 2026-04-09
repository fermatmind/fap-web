/* eslint-disable @next/next/no-img-element */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SbtiResultIllustrationCard } from "@/components/sbti/result/SbtiResultIllustrationCard";
import {
  getSbtiIllustration,
  resolveSbtiIllustrationSrc,
  SBTI_ILLUSTRATION_MAP,
} from "@/components/sbti/result/sbtiIllustrationMap";
import { SBTI_RAW_TYPE_CODES } from "@/lib/sbti/types";

vi.mock("next/image", () => ({
  default: ({
    priority,
    unoptimized,
    alt = "",
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    unoptimized?: boolean;
    src?: string | { src: string };
  }) => {
    void priority;
    void unoptimized;
    return <img alt={alt} src={typeof src === "string" ? src : src?.src} {...props} />;
  },
}));

describe("sbti illustration contract", () => {
  it("maintains explicit mappings for all 25 sbti result types", () => {
    expect(Object.keys(SBTI_ILLUSTRATION_MAP)).toEqual(SBTI_RAW_TYPE_CODES);
    expect(resolveSbtiIllustrationSrc(getSbtiIllustration("MUM")!)).toContain("/components/sbti/result/assets/mum.png");
    expect(resolveSbtiIllustrationSrc(getSbtiIllustration("ATM")!)).toContain("/components/sbti/result/assets/atm-er.png");
    expect(resolveSbtiIllustrationSrc(getSbtiIllustration("WOC")!)).toContain("/components/sbti/result/assets/woc.png");
  });

  it("renders the exact mapped illustration for mum", () => {
    render(<SbtiResultIllustrationCard typeCode="MUM" displayName="妈妈" />);

    const image = screen.getByRole("img", { name: "妈妈 人格插画" });
    expect(image).toHaveAttribute("src", expect.stringContaining("/components/sbti/result/assets/mum.png"));
  });

  it("fails closed when a type is unmapped", () => {
    const { container } = render(<SbtiResultIllustrationCard typeCode="UNKNOWN" displayName="未知" />);

    expect(container.firstChild).toBeNull();
  });
});
