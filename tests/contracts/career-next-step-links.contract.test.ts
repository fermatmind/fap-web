import { createElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CareerNextStepLinks } from "@/components/career/CareerNextStepLinks";
import { adaptCareerFirstWaveNextStepLinks } from "@/lib/career/adapters/adaptCareerFirstWaveNextStepLinks";
import { fetchCareerFirstWaveNextStepLinks } from "@/lib/career/api/fetchCareerFirstWaveNextStepLinks";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/link");
});

describe("career next-step links contract", () => {
  it("requests the backend B36 next-step links endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/first-wave/jobs/software-developer/next-step-links?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          summary_kind: "career_first_wave_next_step_links",
          summary_version: "career.next_step.first_wave.v1",
          scope: "career_first_wave_10",
          subject_kind: "occupation",
          next_step_links: [],
        });
      })
    );

    const payload = await fetchCareerFirstWaveNextStepLinks({ locale: "zh", slug: "software-developer" });

    expect(payload).not.toBeNull();
  });

  it("adapts backend B36 rows into a narrow inventory without leaking unsupported route kinds", () => {
    const summary = adaptCareerFirstWaveNextStepLinks({
      payload: {
        summary_kind: "career_first_wave_next_step_links",
        summary_version: "career.next_step.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "occupation",
        subject_identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
          canonical_title_en: "Software Developer",
        },
        counts: {
          total: 2,
          job_detail: 1,
          family_hub: 1,
        },
        next_step_links: [
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            canonical_slug: "backend-architect",
            link_reason_code: "same_family_sibling_discoverable",
            occupation_uuid: "occ_backend_architect",
            canonical_title_en: "Backend Architect",
          },
          {
            route_kind: "career_search",
            canonical_path: "/career/jobs?q=backend",
            canonical_slug: "backend",
            link_reason_code: "search",
          },
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/software-engineering",
            canonical_slug: "software-engineering",
            link_reason_code: "family_hub_discoverable",
            family_uuid: "fam_software_engineering",
            title_en: "Software Engineering",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();
    expect(summary?.nextStepLinks).toHaveLength(2);
    expect(summary?.nextStepLinks.map((link) => link.routeKind)).toEqual(["career_job_detail", "career_family_hub"]);
    expect(summary?.jobDetailLinks).toHaveLength(1);
    expect(summary?.familyHubLinks).toHaveLength(1);
  });

  it("renders a compact non-narrative section with backend-provided family and job links only", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        createElement("a", { href, ...props }, children)
      ),
    }));

    const summary = adaptCareerFirstWaveNextStepLinks({
      payload: {
        summary_kind: "career_first_wave_next_step_links",
        summary_version: "career.next_step.first_wave.v1",
        scope: "career_first_wave_10",
        subject_kind: "occupation",
        subject_identity: {
          occupation_uuid: "occ_software_developer",
          canonical_slug: "software-developer",
          canonical_title_en: "Software Developer",
        },
        counts: {
          total: 2,
          job_detail: 1,
          family_hub: 1,
        },
        next_step_links: [
          {
            route_kind: "career_family_hub",
            canonical_path: "/career/family/software-engineering",
            canonical_slug: "software-engineering",
            link_reason_code: "family_hub_discoverable",
            family_uuid: "fam_software_engineering",
            title_en: "Software Engineering",
          },
          {
            route_kind: "career_job_detail",
            canonical_path: "/career/jobs/backend-architect",
            canonical_slug: "backend-architect",
            link_reason_code: "same_family_sibling_discoverable",
            occupation_uuid: "occ_backend_architect",
            canonical_title_en: "Backend Architect",
          },
        ],
      },
    });

    expect(summary).not.toBeNull();

    const { container } = render(
      createElement(CareerNextStepLinks, { locale: "en", summary: summary!, testId: "career-next-step-links" })
    );

    const section = screen.getByTestId("career-next-step-links");

    expect(section).toHaveTextContent("Next-step links");
    expect(section).toHaveTextContent("Family hub");
    expect(section).toHaveTextContent("Related job pages");
    expect(section).toHaveTextContent("Software Engineering");
    expect(section).toHaveTextContent("Backend Architect");
    expect(section).not.toHaveTextContent("best next move");
    expect(section).not.toHaveTextContent("recommended");
    expect(section).not.toHaveTextContent("strategy");
    expect(section).not.toHaveTextContent("family_hub_discoverable");
    expect(section).not.toHaveTextContent("same_family_sibling_discoverable");
    expect(container.querySelectorAll('[data-testid="career-next-step-family-link"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="career-next-step-job-link"]')).toHaveLength(1);
  });
});
