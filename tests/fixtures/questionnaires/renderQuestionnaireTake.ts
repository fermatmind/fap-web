import { renderToStaticMarkup } from "react-dom/server";
import TakePage from "@/app/(localized)/[locale]/tests/explore/[slug]/take/page";

/** Render the real private route when asserting controls that moved off the landing. */
export async function renderQuestionnaireTakeDom(locale: string, slug: string) {
  const dom = document.createElement("div");
  dom.innerHTML = renderToStaticMarkup(await TakePage({ params: Promise.resolve({ locale, slug }) }));
  return dom;
}
