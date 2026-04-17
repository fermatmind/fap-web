"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type HomepageSocialProofItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

type CarouselStyle = CSSProperties & {
  "--mobile-shift": string;
  "--desktop-shift": string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function HomepageSocialProofCarousel({ items }: { items: HomepageSocialProofItem[] }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const resolvedActiveIndex = clamp(activeIndex, 0, Math.max(items.length - 1, 0));
  const maxDesktopStart = Math.max(items.length - 3, 0);
  const mobileStart = resolvedActiveIndex;
  const desktopStart = clamp(resolvedActiveIndex - 1, 0, maxDesktopStart);
  const trackStyle = useMemo<CarouselStyle>(
    () => ({
      "--mobile-shift": `-${mobileStart * 100}%`,
      "--desktop-shift": `-${(desktopStart * 100) / 3}%`,
    }),
    [desktopStart, mobileStart]
  );

  if (items.length === 0) return null;

  return (
    <div className="mx-auto mt-14 max-w-6xl">
      <div className="overflow-hidden px-1 py-4">
        <div
          className="flex translate-x-[var(--mobile-shift)] transition-transform duration-500 ease-out will-change-transform md:translate-x-[var(--desktop-shift)]"
          style={trackStyle}
        >
          {items.map((item, index) => {
            const isActive = index === resolvedActiveIndex;

            return (
              <figure
                key={item.id}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                tabIndex={0}
                className="basis-full px-3 outline-none md:basis-1/3"
              >
                <div
                  className={cn(
                    "flex min-h-[16rem] flex-col justify-center rounded-xl border border-slate-100 bg-white px-7 py-8 text-center shadow-sm transition duration-300 md:min-h-[15rem]",
                    isActive
                      ? "scale-100 opacity-100 shadow-xl shadow-slate-900/10"
                      : "scale-[0.94] opacity-35 hover:opacity-70"
                  )}
                >
                  <blockquote
                    className={cn(
                      "m-0 text-base font-semibold leading-8 tracking-[-0.02em] transition-colors",
                      isActive ? "text-slate-800" : "text-slate-500"
                    )}
                  >
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-7 text-sm leading-6 text-slate-500">
                    <span className={cn("block font-semibold", isActive ? "text-slate-800" : "text-slate-500")}>
                      {item.author}
                    </span>
                    <span>{item.role}</span>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-2" aria-label="选择引用">
        {items.map((item, index) => (
          <button
            key={`${item.id}-dot`}
            type="button"
            aria-label={`显示第 ${index + 1} 条引用`}
            aria-current={index === resolvedActiveIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2.5 rounded-full transition-all",
              index === resolvedActiveIndex ? "w-6 bg-slate-500" : "w-2.5 bg-slate-200 hover:bg-slate-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}
