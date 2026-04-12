import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { adaptCareerJobExplainability } from "@/lib/career/adapters/adaptCareerExplainability";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career explainability contract", () => {
  it("renders a bounded machine-safe panel with allowlisted strain radar only", () => {
    const explainability = adaptCareerJobExplainability({
      summary_kind: "career_explainability",
      summary_version: "career.explainability.v1",
      subject_kind: "job",
      subject_identity: {
        occupation_uuid: "occ_software_developer",
        canonical_slug: "software-developer",
        canonical_title_en: "Software Developer",
      },
      score_bundle: {
        fit_score: {
          value: 78,
          integrity_state: "full",
          critical_missing_fields: ["onet_context"],
          confidence_cap: 0.92,
          formula_version: "fit.v1",
          components: {
            demand: 0.41,
            capability: 0.37,
          },
          penalties: [
            {
              code: "partial_data",
              value: -0.05,
              reason: "onet_context",
            },
          ],
          degradation_factor: 0.95,
        },
        strain_score: {
          value: 44,
          integrity_state: "provisional",
          critical_missing_fields: [],
          confidence_cap: 0.84,
          formula_version: "strain.v1",
          components: {
            ambiguity: 0.22,
          },
          penalties: [],
          degradation_factor: 0.88,
        },
      },
      strain_radar: {
        integrity_state: "restricted",
        confidence_cap: 0.72,
        degradation_factor: 0.84,
        formula_version: "career.strain_v1.2",
        axes: {
          people_friction: { value: 0.61 },
          context_switch_load: { value: 0.52 },
          political_load: { value: 0.47 },
          uncertainty_load: { value: 0.58 },
          low_autonomy_trap: { value: 0.41 },
          repetition_mismatch: { value: 0.33 },
          environment_fit: { value: 0.11 },
        },
      },
      warnings: {
        amber_flags: ["ai_role_shift_risk"],
        blocked_claims: ["salary_comparison"],
      },
      claim_permissions: {
        allow_strong_claim: true,
        allow_salary_comparison: false,
        allow_ai_strategy: true,
        allow_transition_recommendation: false,
        allow_cross_market_pay_copy: false,
        reason_codes: ["trust_limited"],
      },
      integrity_summary: {
        integrity_state: "provisional",
        critical_missing_fields: ["onet_context"],
        confidence_cap: 0.92,
        degradation_factor: 0.95,
      },
    });

    expect(explainability).not.toBeNull();

    render(
      <CareerExplainabilityPanel
        locale="en"
        explainability={explainability!}
        testId="career-explainability-panel"
      />
    );

    const panel = screen.getByTestId("career-explainability-panel");

    expect(panel).toHaveTextContent("Structured explainability");
    expect(panel).toHaveTextContent("formula_version: fit.v1");
    expect(panel).toHaveTextContent("degradation_factor: 0.95");
    expect(panel).toHaveTextContent("critical_missing_fields: onet_context");
    expect(panel).toHaveTextContent("partial_data (-0.05): onet_context");
    expect(panel).toHaveTextContent("components");
    expect(panel).toHaveTextContent("blocked_claims: salary_comparison");
    expect(panel).toHaveTextContent("Strain radar");
    expect(panel).toHaveTextContent("People friction");
    expect(panel).toHaveTextContent("formula_version: career.strain_v1.2");
    expect(panel).toHaveTextContent("degradation_factor: 0.84");
    expect(panel).not.toHaveTextContent("environment_fit");
    expect(panel).not.toHaveTextContent("strongest");
    expect(panel).not.toHaveTextContent("why this path");
  });

  it("renders explainability on job detail as a secondary section only", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        usePathname: vi.fn(() => "/en/career/jobs/software-developer"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
        },
        titles: {
          canonical_en: "Software Developer",
        },
        truth_layer: {
          median_pay_usd_annual: 133080,
        },
        score_bundle: {
          fit_score: { value: 78, integrity_state: "full", degradation_factor: 1 },
          strain_score: { value: 44, integrity_state: "provisional", degradation_factor: 0.88 },
          ai_survival_score: { value: 71, integrity_state: "full", degradation_factor: 1 },
          mobility_score: { value: 69, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 82, integrity_state: "full", degradation_factor: 1 },
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        seo_contract: {
          canonical_path: "/career/jobs/software-developer",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => ({
        summary_kind: "career_explainability",
        summary_version: "career.explainability.v1",
        subject_kind: "job",
        subject_identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
          canonical_title_en: "Software Developer",
        },
        score_bundle: {
          fit_score: {
            value: 78,
            integrity_state: "full",
            critical_missing_fields: [],
            confidence_cap: 0.92,
            formula_version: "fit.v1",
            components: { demand: 0.41 },
            penalties: [],
            degradation_factor: 0.95,
          },
        },
        strain_radar: {
          integrity_state: "restricted",
          confidence_cap: 0.72,
          degradation_factor: 0.84,
          formula_version: "career.strain_v1.2",
          axes: {
            people_friction: { value: 0.61 },
            context_switch_load: { value: 0.52 },
            political_load: { value: 0.47 },
            uncertainty_load: { value: 0.58 },
            low_autonomy_trap: { value: 0.41 },
            repetition_mismatch: { value: 0.33 },
          },
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        warnings: {},
        integrity_summary: {
          integrity_state: "full",
          critical_missing_fields: [],
          confidence_cap: 0.92,
          degradation_factor: 0.95,
        },
      })),
    }));

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "software-developer" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-job-explainability-panel");
    expect(html).toContain("Structured explainability");
    expect(html).toContain("career-explainability-strain-radar");
    expect(html).toContain("People friction");
    expect(html).not.toContain("environment_fit");
  });
});
