import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EntertainmentDisplayAd } from "@/components/entertainment/EntertainmentDisplayAd";
import { AD_PLACEMENT_HEADER } from "./adPlacement";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type AdPageProps = {
  params: Promise<{ locale?: string; slug?: string; stage?: string[] }>;
  searchParams: SearchParams;
};
type QuizPageProps = { params: Promise<{ locale: string; slug: string; portrait: string; profile: string }>; searchParams: SearchParams; take: boolean };
type QuizPage = {
  render: (props: QuizPageProps) => ReactNode | Promise<ReactNode>;
  metadata: (props: QuizPageProps) => Metadata | Promise<Metadata>;
};

// Keep each family in its own route module so the browser downloads only that
// family's quiz code when the shared display ad is enabled.
export function createEntertainmentAdPage(options: {
  intro: QuizPage;
  take?: QuizPage;
  result?: QuizPage;
  locale?: string;
  slug?: string;
}) {
  async function select({ params, searchParams }: AdPageProps) {
    const request = await headers();
    const mode = request.get(AD_PLACEMENT_HEADER);
    if (mode !== "enabled" && mode !== "preview") notFound();

    const route = await params;
    const locale = options.locale ?? route.locale;
    const slug = options.slug ?? route.slug;
    const stage = route.stage ?? [];
    if (!locale || !slug) notFound();
    const take = stage.length === 1 && stage[0] === "take";
    const outcome = stage.length === 2 && stage[0] === "results" ? stage[1] : "";
    const page = take ? options.take : outcome ? options.result : stage.length === 0 ? options.intro : undefined;
    if (!page) notFound();

    return {
      nonce: request.get("x-nonce"),
      page,
      props: { params: Promise.resolve({ locale, slug, portrait: outcome, profile: outcome }), searchParams, take },
    };
  }

  return {
    async generateMetadata(props: AdPageProps) {
      const selected = await select(props);
      return selected.page.metadata(selected.props);
    },
    async Page(props: AdPageProps) {
      const selected = await select(props);
      const content = await selected.page.render(selected.props);
      return (
        <>
          {content}
          {selected.nonce && <EntertainmentDisplayAd nonce={selected.nonce} />}
        </>
      );
    },
  };
}
