import Image from "next/image";

export function HeroHudArtwork() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[847/558] w-[calc(100%+0.625rem)] self-start overflow-visible lg:block xl:ml-[6.632px] xl:mt-[calc(4.842vw-65px)] xl:w-[56.96vw]"
    >
      <Image
        src="/images/home/hero-assessment-hud.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 56vw, 52vw"
        className="object-contain object-right opacity-100"
      />
    </div>
  );
}
