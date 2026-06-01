import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RiasecLandingSurfaceSections } from "@/components/tests/RiasecLandingSurfaceSections";
import { normalizeLandingSurface } from "@/lib/landing/landingSurface";

const PAGE_PATH = path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx");
const COMPONENT_PATH = path.join(process.cwd(), "components/tests/RiasecLandingSurfaceSections.tsx");

describe("ANALYTICS-SEO-P1-07 Holland RIASEC landing structure contract", () => {
  it("renders RIASEC landing modules only from backend landing_surface_v1 blocks and career links", () => {
    const surface = normalizeLandingSurface({
      version: "landing.surface.v1",
      entry_surface: "test_detail",
      entry_type: "riasec",
      summary_blocks: [
        {
          key: "riasec_six_type_explanation",
          kind: "six_type_explanation",
          title: "Backend six type explanation",
          body: "Backend-owned RIASEC six type body.",
        },
        {
          key: "riasec_career_direction",
          kind: "career_direction",
          title: "Backend career directions",
          body: "Backend-owned career direction body.",
        },
        {
          key: "riasec_major_selection",
          kind: "major_selection",
          title: "Backend major selection",
          body: "Backend-owned major selection body.",
        },
        {
          key: "riasec_transition_scenarios",
          kind: "career_transition",
          title: "Backend transition scenarios",
          body: "Backend-owned transition scenario body.",
        },
      ],
      discoverability_items: [
        {
          key: "career_occupation_library",
          kind: "career_internal_link",
          title: "Backend occupation library",
          summary: "Backend-owned career link summary.",
          href: "/zh/career/jobs",
          badge_label: "RIASEC",
        },
      ],
    });

    const html = renderToStaticMarkup(<RiasecLandingSurfaceSections surface={surface} />);

    expect(html).toContain('data-authority-source="landing_surface_v1"');
    expect(html).toContain('data-testid="riasec-landing-six-types"');
    expect(html).toContain("Backend six type explanation");
    expect(html).toContain('data-testid="riasec-landing-career-direction"');
    expect(html).toContain("Backend career directions");
    expect(html).toContain('data-testid="riasec-landing-major-selection"');
    expect(html).toContain("Backend major selection");
    expect(html).toContain('data-testid="riasec-landing-transition-scenarios"');
    expect(html).toContain("Backend transition scenarios");
    expect(html).toContain('data-testid="riasec-landing-career-internal-links"');
    expect(html).toContain("/zh/career/jobs");
    expect(html).toContain("Backend occupation library");
  });

  it("does not create a local editorial fallback or parallel RIASEC surface when backend content is absent", () => {
    const html = renderToStaticMarkup(<RiasecLandingSurfaceSections surface={null} />);
    const componentSource = fs.readFileSync(COMPONENT_PATH, "utf8");

    expect(html).toBe("");
    expect(componentSource).toContain("return null");
    expect(componentSource).not.toContain("RIASEC 六型");
    expect(componentSource).not.toContain("选专业");
    expect(componentSource).not.toContain("转行");
  });

  it("wires the Holland/RIASEC test detail page without creating another RIASEC stack", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('import { RiasecLandingSurfaceSections } from "@/components/tests/RiasecLandingSurfaceSections";');
    expect(source).toContain("{showsRiasecActions ? <RiasecLandingSurfaceSections surface={landingSurface} /> : null}");
    expect(source).toContain("const showsRiasecActions = isRiasecScaleCode(test.scale_code)");
    expect(source).toContain("listRiasecFormMetas(lookup?.forms)");
    expect(source).toContain("withAttribution(buildRiasecTakeHref(test.slug, locale, form.formCode))");
    expect(source).not.toContain('import RiasecTakeClient from "./RiasecTakeClient"');
  });
});
