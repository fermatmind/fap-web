import Image from "next/image";

export function HeroHudArtwork() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative hidden min-h-[31rem] overflow-visible lg:block"
    >
      <div
        aria-hidden
        className="absolute -inset-x-8 -inset-y-8 bg-[radial-gradient(circle_at_47%_57%,rgba(190,242,100,0.16),transparent_42%),radial-gradient(circle_at_56%_38%,rgba(103,232,249,0.14),transparent_34%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#071019] via-[#071019]/72 to-transparent"
      />
      <Image
        src="/images/home/hero-assessment-hud.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1280px) 56vw, 52vw"
        className="scale-[1.04] object-contain object-right opacity-95 drop-shadow-[0_0_32px_rgba(103,232,249,0.24)] [mask-image:radial-gradient(ellipse_at_58%_52%,black_0%,black_72%,rgba(0,0,0,0.76)_86%,transparent_100%)]"
      />
    </div>
  );
}
