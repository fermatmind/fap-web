"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { hollandDimensions, hollandPoint } from "@/lib/tests/hollandLanding";
import styles from "./holland-landing.module.css";

const taskCombinations = [
  "修好一台设备，再测量它的运行表现（R + I）。",
  "分析用户需求，再把发现转成设计方案（I + A）。",
  "设计一套图文材料，再用它带领一场工作坊（A + S）。",
  "讲解一个主题，同时组织志愿者分工（S + E）。",
  "推进一个项目，同时维护预算和进度台账（E + C）。",
  "巡检设备，同时记录故障与复核结果（C + R）。",
] as const;

const oppositeTasks = [
  "R 和 S 都高，可以试试技术培训：一边操作设备，一边教新人。",
  "I 和 E 都高，可以考察技术产品或投资研究：先做分析，再用证据推动决策。",
  "A 和 C 都高，可以考察设计制作与规范管理：在统一的设计系统内做创作。",
] as const;

const points = hollandDimensions.map((_, index) => hollandPoint(index, 83));

export function HollandHexagon() {
  const [selected, setSelected] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? selected;
  const neighbors = [(active + 5) % 6, (active + 1) % 6];
  const opposite = (active + 3) % 6;
  const [x, y] = points[active];
  const caption = (index: number) => hollandDimensions[index].slice(0, 2).join(" ");

  return <figure className={styles.hexFigure} aria-label="交互式 RIASEC 兴趣六边形">
    <div className={styles.hexPlot}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        <polygon points={points.map((point) => point.join(",")).join(" ")} />
        {neighbors.map((index) => <line key={index} x1={x} y1={y} x2={points[index][0]} y2={points[index][1]} className={styles.hexNeighbor} />)}
        <line x1={x} y1={y} x2={points[opposite][0]} y2={points[opposite][1]} className={styles.hexOpposite} />
      </svg>
      {hollandDimensions.map(([code, label], index) => <button
        key={code}
        type="button"
        className={styles.letter}
        data-dimension={code}
        data-active={index === active}
        aria-label={`${code} ${label}`}
        aria-pressed={index === selected}
        style={{ left: `${points[index][0] / 2.2}%`, top: `${points[index][1] / 2.2}%` }}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHover(index); }}
        onPointerLeave={() => setHover(null)}
        onClick={() => { setSelected(index); setHover(null); }}
      >{code}</button>)}
    </div>
    <figcaption className={styles.hexCaption} aria-live="polite">
      <strong>{caption(active)}</strong>
      <p><span>相邻</span> {neighbors.map(caption).join("、")} <span>对角</span> {caption(opposite)}</p>
      <p>{taskCombinations[active]}</p>
      <p className={styles.oppositeAdvice}><strong>对角维度都高？</strong> {oppositeTasks[active % 3]}</p>
    </figcaption>
  </figure>;
}

export function HollandStickyAction({ href, eventProperties, title = "霍兰德职业兴趣测试（60题）", description = "免费查看完整六维与三字代码" }: {
  href: string; eventProperties: Record<string, string>; title?: string; description?: string;
}) {
  const [bar, setBar] = useState({ visible: false, top: 0 });

  useEffect(() => {
    const header = document.querySelector("[data-site-header]");
    const update = () => {
      const currentHeader = document.querySelector("[data-site-header]");
      const top = Math.max(0, Math.round(currentHeader?.getBoundingClientRect().bottom ?? 0));
      const visible = window.scrollY >= 650;
      setBar((current) => current.visible === visible && current.top === top ? current : { visible, top });
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
    if (header) observer?.observe(header);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!bar.visible) return null;
  return <div className={styles.stickyAction} style={{ top: bar.top }} aria-label={`快速开始${title}`}>
    <div className={`${styles.shell} ${styles.stickyInner}`}>
      <p><strong>{title}</strong><span> · {description}</span></p>
      <TrackedEntryCtaLink className={styles.primary} href={href} eventProperties={eventProperties}>
        立即开始测试 <ArrowRight size={16} aria-hidden="true" />
      </TrackedEntryCtaLink>
    </div>
  </div>;
}

export function HollandCodeLetters({ code }: { code: string }): ReactNode {
  return [...code].map((letter) => <span key={letter} className={styles.letter} data-dimension={letter}>{letter}</span>);
}
