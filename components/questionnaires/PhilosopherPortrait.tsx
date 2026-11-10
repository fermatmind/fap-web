import Image from "next/image";
import { philosopherPresentations } from "@/lib/questionnaires/philosopherPresentation";
import type { Locale } from "@/lib/i18n/locales";

export function PhilosopherPortrait({ id, locale, className = "h-auto w-full rounded-xl", eager = false, copy = value => value }: { id: string; locale: Locale; className?: string; eager?: boolean; copy?: (text: string) => string }) {
  if (!Object.hasOwn(philosopherPresentations, id)) return null;
  const person = philosopherPresentations[id];
  return <Image unoptimized loading={eager ? "eager" : "lazy"} width={300} height={360} src={`/images/quiz-portraits/philosopher-personality-test/${id}.svg`} alt={locale === "zh" ? copy(`${person.name.zh}：原创人物意象插画`) : `${person.name.en}: original imagined editorial illustration`} className={className} data-philosopher-portrait={id} />;
}
