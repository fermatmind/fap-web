"use client";

import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { shouldDisableLocaleSwitchLinks } from "@/lib/seo/seoHoldlistRoutes";

const LocaleSwitcherMenu = dynamic(() => import("@/components/i18n/LocaleSwitcherMenu"));

export function LocaleSwitcher() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const locale = useLocale();
  const currentCode = locale === "zh" ? "ZH" : "EN";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (shouldDisableLocaleSwitchLinks(pathname)) return null;

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="fm-site-header-locale inline-flex h-9 min-h-[36px] min-w-[58px] shrink-0 items-center justify-center gap-1 rounded-full border border-[var(--fm-border-subtle)] bg-white px-3 text-[13px] font-medium text-[var(--fm-text-main)] transition hover:bg-[var(--fm-lime-soft)] whitespace-nowrap xl:min-w-[60px]"
        aria-label={locale === "zh" ? "语言菜单" : "Language menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="site-language-menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{currentCode}</span>
        <ChevronDown className={open ? "h-3.5 w-3.5 rotate-180 transition" : "h-3.5 w-3.5 transition"} />
      </button>

      {open ? (
        <LocaleSwitcherMenu locale={locale} pathname={pathname} onSelect={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
