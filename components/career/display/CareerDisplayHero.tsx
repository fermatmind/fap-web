import Link from "next/link";
import type { CareerDisplayHeroViewModel } from "@/lib/career/displaySurface";

type CareerDisplayHeroProps = {
  hero: CareerDisplayHeroViewModel;
};

export function CareerDisplayHero({ hero }: CareerDisplayHeroProps) {
  return (
    <header className="space-y-5 border-b border-slate-200 pb-8" data-testid="career-display-hero">
      <div className="space-y-2">
        <p className="m-0 text-sm font-medium text-slate-500">{hero.subtitle}</p>
        <h1 className="m-0 text-3xl font-semibold tracking-normal text-slate-950 md:text-5xl">{hero.h1}</h1>
      </div>
      <p className="m-0 max-w-4xl text-base leading-8 text-slate-700 md:text-lg">{hero.quickAnswer}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={hero.primaryCta.href}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {hero.primaryCta.label}
        </Link>
      </div>
    </header>
  );
}
