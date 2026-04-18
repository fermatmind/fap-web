"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type HomepageSocialProofItem = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function HomepageSocialProofCarousel({ items }: { items: HomepageSocialProofItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedActiveIndex = clamp(activeIndex, 0, Math.max(items.length - 1, 0));

  if (items.length === 0) return null;

  return (
    <div className="mx-auto mt-14 max-w-6xl">
      <div className="px-1 py-4">
        <div className="grid gap-6 md:grid-cols-4">
          {items.map((item, index) => {
            const isActive = index === resolvedActiveIndex;

            return (
              <figure
                key={item.id}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                tabIndex={0}
                className="cursor-pointer outline-none"
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
    </div>
  );
}
