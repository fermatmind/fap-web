import Image from "next/image";

export function HeroHudArtwork() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[825/554] w-[calc(100%+0.625rem)] max-w-[51.5625rem] self-start overflow-visible lg:block xl:ml-[23.461px] xl:w-[51.5625rem]"
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
