import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentPageTemplate } from "@/components/content-pages/ContentPageTemplate";
import type { ContentPage } from "@/lib/cms/content-pages";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function makeHelpPage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "help-payment-refund",
    path: "/help/payment-refund",
    kind: "help",
    title: "Payment and refund",
    kicker: "Help",
    summary: "Payment support.",
    template: "help",
    animationProfile: "none",
    locale: "en",
    publishedAt: "2026-06-08",
    updatedAt: "2026-06-08",
    effectiveAt: null,
    sourceDoc: "HELP-SERVICE-CONTENT-DRAFTS-01",
    isPublic: true,
    isIndexable: false,
    headings: [],
    contentMd: "## Support\nUse the support contact for service questions.",
    contentHtml: "",
    seoTitle: null,
    metaDescription: null,
    faqItems: [],
    schemaEnabled: true,
    supportContact: "support@fermatmind.com",
    ...overrides,
  };
}

describe("HELP-SUPPORT-CONTACT-RUNTIME-01", () => {
  it("maps ContentPage support_contact from the public CMS API contract", () => {
    const source = readSource("lib/cms/content-pages.ts");

    expect(source).toContain("supportContact: string | null");
    expect(source).toContain("support_contact?: string | null");
    expect(source).toContain("supportContact: normalizeText(record.support_contact ?? record.supportContact) || null");
  });

  it("renders the CMS support contact as a visible mailto link on Help ContentPages", () => {
    const html = renderToStaticMarkup(<ContentPageTemplate page={makeHelpPage()} locale="en" />);

    expect(html).toContain('data-testid="help-support-contact"');
    expect(html).toContain('href="mailto:support@fermatmind.com"');
    expect(html).toContain("support@fermatmind.com");
    expect(html).not.toMatch(/href="[^"]*\/(?:orders|result|share|pay|payment|history)\//i);
    expect(html).not.toMatch(/(?:orderNo|order_no|payment_id|transaction_id|token)=/i);
  });

  it("keeps the Support hub contact runtime CMS-backed instead of hardcoding the address", () => {
    const source = readSource("app/(localized)/[locale]/support/page.tsx");

    expect(source).toContain("getContentPage");
    expect(source).toContain("getSupportContact");
    expect(source).toContain("page?.supportContact");
    expect(source).toContain("mailto:${supportContact}");
    expect(source).not.toContain("support@fermatmind.com");
    expect(source).not.toMatch(new RegExp("href=\\{?['\\\"`]\\\\?/(?:orders|result|share|pay|payment|history)/", "i"));
  });

  it("registers this runtime PR in the current scope helper", () => {
    const allowedFiles = [
      "app/(localized)/[locale]/support/page.tsx",
      "components/content-pages/ContentPageTemplate.tsx",
      "lib/cms/content-pages.ts",
      "tests/contracts/help-support-contact-runtime-01.contract.test.tsx",
      "tests/contracts/helpers/currentPrScope.ts",
    ];

    for (const file of allowedFiles) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
