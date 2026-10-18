import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";
import { HOME_HERO_CATEGORIES } from "./home-hero-categories";
import { HomeHeroPanel } from "./HomeHeroPanel";
import styles from "./home-hero-animation.module.css";

export function HomeHeroAnimation({ locale }: { locale: Locale }) {
  return (
    <div aria-hidden="true" className={styles.scene} data-testid="home-hero-animation">
      <HomeHeroPanel locale={locale} />
      {["left", "right"].map((side) => (
        <div key={side} className={`${styles.foreground} ${side === "left" ? styles.foregroundLeft : styles.foregroundRight}`}>
          <Image
            src="/images/home/fermat-standing-seated-foreground.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1360px) 746px, (min-width: 1024px) 56vw, 1px"
            className={styles.artwork}
          />
        </div>
      ))}
      <svg className={styles.categories} viewBox="0 0 600 434" focusable="false">
        <g className={styles.bookStack}>
          {HOME_HERO_CATEGORIES.map((category) => {
            const copy = category.copy[locale];
            const verticalChinese = category.upright && locale === "zh";
            const lines = copy.lines ?? [copy.label];

            return (
              <g key={category.id} transform={`translate(${category.x} ${category.y}) rotate(${category.angle})`}>
                <g data-hero-category={category.id}>
                  <rect width={category.width} height={category.height} fill={category.color} />
                  <text
                    x={category.width / 2}
                    y={category.height / 2}
                    fill={category.ink}
                    fontSize={copy.fontSize}
                    fontWeight="500"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={category.upright && locale === "en" ? `rotate(-90 ${category.width / 2} ${category.height / 2})` : undefined}
                  >
                    {verticalChinese
                      ? Array.from(copy.label).map((character, index, characters) => (
                          <tspan
                            key={index}
                            x={category.width / 2}
                            y={category.height / 2 + (index - (characters.length - 1) / 2) * copy.fontSize * 1.5}
                          >
                            {character}
                          </tspan>
                        ))
                      : lines.map((line, index) => (
                          <tspan key={index} x={category.width / 2} y={category.height / 2 + (index - (lines.length - 1) / 2) * copy.fontSize * 1.3}>
                            {line}
                          </tspan>
                        ))}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
