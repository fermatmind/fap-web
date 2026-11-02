"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

/** Restore article fragments after the streamed body has actually mounted. */
export function ArticleFragmentNavigation({ children, className }: PropsWithChildren<{ className?: string }>) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (cancelled || !window.location.hash) return;
        let id: string;
        try {
          id = decodeURIComponent(window.location.hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        if (target && root.current?.contains(target) && target.getClientRects().length > 0) {
          target.scrollIntoView({ block: "start", behavior: "instant" });
        }
      });
    };
    const cancel = () => { cancelled = true; cancelAnimationFrame(frame); };
    const cancelForKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) cancel();
    };
    const change = () => { cancelled = false; align(); };
    align();
    window.addEventListener("hashchange", change);
    window.addEventListener("load", align, { once: true });
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancelForKey);
    // Font loading can move headings after hydration; never override user scrolling.
    void document.fonts?.ready.then(() => { if (!cancelled) align(); });
    return () => {
      cancel();
      window.removeEventListener("hashchange", change);
      window.removeEventListener("load", align);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancelForKey);
    };
  }, []);

  return <div ref={root} className={className}>{children}</div>;
}
