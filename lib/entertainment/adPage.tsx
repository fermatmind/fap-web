import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EntertainmentDisplayAd } from "@/components/entertainment/EntertainmentDisplayAd";
import { AD_PLACEMENT_HEADER } from "./adPlacement";

type AdPageProps = { params: Promise<{ locale?: string; slug?: string; stage?: string[] }> };
type QuizPageProps = { params: Promise<{ locale: string; slug: string }>; take: boolean };
type QuizPage = {
  render: (props: QuizPageProps) => ReactNode | Promise<ReactNode>;
  metadata: (props: QuizPageProps) => Metadata | Promise<Metadata>;
};

// Keep each family in its own route module so the browser downloads only that
// family's quiz code when the shared display ad is enabled.
export function createEntertainmentAdPage(options: {
  intro: QuizPage;
  take: QuizPage;
  locale?: string;
  slug?: string;
}) {
  async function select({ params }: AdPageProps) {
    const request = await headers();
    const mode = request.get(AD_PLACEMENT_HEADER);
    if (mode !== "enabled" && mode !== "preview") notFound();

    const route = await params;
    const locale = options.locale ?? route.locale;
    const slug = options.slug ?? route.slug;
    const stage = route.stage ?? [];
    if (!locale || !slug || stage.length > 1 || (stage.length === 1 && stage[0] !== "take")) notFound();

    const take = stage.length === 1;
    return {
      locale,
      nonce: request.get("x-nonce"),
      consentPreview: mode === "preview",
      page: take ? options.take : options.intro,
      props: { params: Promise.resolve({ locale, slug }), take },
    };
  }

  return {
    async generateMetadata(props: AdPageProps) {
      const selected = await select(props);
      return selected.page.metadata(selected.props);
    },
    async Page(props: AdPageProps) {
      const selected = await select(props);
      const { locale, nonce, consentPreview } = selected;
      const content = await selected.page.render(selected.props);
      if (!nonce) return content;
      return (
        <EntertainmentDisplayAd
          label={locale === "en" ? "Advertisements" : locale === "zh-TW" ? "廣告" : "广告"}
          nonce={nonce}
          take={selected.props.take}
          consentPreview={consentPreview}
        >
          {content}
        </EntertainmentDisplayAd>
      );
    },
  };
}
