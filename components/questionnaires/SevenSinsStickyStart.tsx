"use client";

import { useEffect, useState } from "react";
import { StartTestButton } from "@/components/tests/StartTestButton";
import styles from "./SevenSinsOverview.module.css";

export function SevenSinsStickyStart({ title, label, href }: { title: string; label: string; href: string }) {
  const [top, setTop] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => {
      const header = document.querySelector("[data-site-header]");
      const footer = document.querySelector("[data-site-footer]");
      const menu = header?.querySelector('[aria-expanded="true"]');
      setTop(window.scrollY > 650 && !menu && (!footer || footer.getBoundingClientRect().top > window.innerHeight)
        ? Math.max(0, header?.getBoundingClientRect().bottom ?? 0) : null);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    document.addEventListener("focusin", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.removeEventListener("focusin", sync);
    };
  }, []);
  if (top === null) return null;
  return <aside className={styles.stickyStart} style={{ insetBlockStart: top }} data-seven-sins-sticky>
    <span>{title}</span><StartTestButton href={href} className={styles.stickyButton}>{label} →</StartTestButton>
  </aside>;
}
