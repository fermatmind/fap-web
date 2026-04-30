import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { serializeJsonLd } from "@/lib/seo/jsonLd";

function scriptBody(markup: string): string {
  const start = markup.indexOf(">") + 1;
  const end = markup.lastIndexOf("</script>");

  return markup.slice(start, end);
}

describe("JSON-LD serialization", () => {
  it("escapes a closing script tag sequence inside string values", () => {
    const payload = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "CMS title with </script> marker",
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized.toLowerCase()).not.toContain("</script");
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("escapes HTML-significant characters while preserving parsed JSON values", () => {
    const payload = {
      value: "<span data-label=\"A&B\">A & B</span>",
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("keeps nested object and array values parseable after script-safe escaping", () => {
    const payload = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            name: "Backend label \u2028 with separator",
            description: "CMS copy \u2029 with paragraph separator",
          },
        },
      ],
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized).not.toContain("\u2028");
    expect(serialized).not.toContain("\u2029");
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("renders FAQ JSON-LD without raw script-breaking content in the script body", () => {
    const payload = buildFAQPageJsonLd([
      {
        question: "Can CMS FAQ text include <, >, and &?",
        answer: "The serialized script body must preserve this </script> marker as JSON data.",
      },
    ]);

    const markup = renderToStaticMarkup(<JsonLd id="faq-jsonld" data={payload} />);
    const body = scriptBody(markup);

    expect(markup).toContain('type="application/ld+json"');
    expect(body.toLowerCase()).not.toContain("</script");
    expect(body).not.toContain("<");
    expect(body).not.toContain(">");
    expect(body).not.toContain("&");
    expect(JSON.parse(body)).toEqual(payload);
  });
});
