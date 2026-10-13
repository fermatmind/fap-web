import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

export function BrandLogo({ locale, priority = false }: { locale: Locale; priority?: boolean }) {
  return (
    <Image
      src="/brand/mark-20261013.png"
      alt={locale === "zh" ? "费马测试" : "FermatMind"}
      width={40}
      height={40}
      className="block h-10 w-10 shrink-0"
      priority={priority}
      unoptimized
    />
  );
}
