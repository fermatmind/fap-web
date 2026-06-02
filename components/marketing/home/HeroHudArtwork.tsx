import Image from "next/image";

export function HeroHudArtwork() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative ml-6 mt-[7px] hidden aspect-[887/520] w-[calc(100%+0.625rem)] self-start overflow-visible [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_4%,black_10%,black_88%,rgba(0,0,0,0.5)_96%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_4%,black_10%,black_88%,rgba(0,0,0,0.5)_96%,transparent_100%)] lg:block xl:-ml-[39px] xl:mt-[calc(4.842vw-65px)] xl:w-[59.65vw]"
    >
      <Image
        src="/images/home/hero-assessment-hud.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 56vw, 52vw"
        className="object-contain object-right opacity-100 mix-blend-screen brightness-110 contrast-110 [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.1)_8%,rgba(0,0,0,0.72)_21%,black_32%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.1)_8%,rgba(0,0,0,0.72)_21%,black_32%,black_100%)]"
      />
    </div>
  );
}
