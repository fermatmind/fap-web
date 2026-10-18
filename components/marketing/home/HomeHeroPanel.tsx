import type { Locale } from "@/lib/i18n/locales";
import styles from "./home-hero-animation.module.css";

// All scene geometry uses the reference illustration's 600 × 434 coordinate system.
export function HomeHeroPanel({ locale }: { locale: Locale }) {
  return (
    <svg className={styles.panel} viewBox="0 0 600 434" focusable="false" data-testid="home-hero-panel">
      <g className={styles.panelWindow}>
        <rect x="184" y="14" width="400" height="270" fill="#f8fcfd" />
        <path d="M184 14h400v22H184z" fill="#79c1d2" />
        {[195, 208, 221].map((x) => <circle key={x} cx={x} cy="25" r="3.1" fill="#f6fcfe" />)}
        <image href="/brand/mark-20261013.png" x="204" y="53" width="21" height="21" />
        <text x="231" y="68" fontSize="13" fontWeight="600" fill="#4b93aa">{locale === "zh" ? "费马测试" : "fermatmind"}</text>
        <rect x="204" y="94" width="154" height="8" fill="#d1ebf2" />
        <rect x="204" y="109" width="94" height="7" fill="#d1ebf2" />
        {[86, 77, 69, 91].map((width, index) => (
          <g key={index}>
            <circle className={styles.chartDot} cx="224" cy={151 + index * 16} r="3.6" fill="#b8dfe9" style={{ animationDelay: `${index * -0.8}s` }} />
            <rect className={styles.panelLine} x="238" y={148 + index * 16} width={width} height="5" fill="#e1f1f5" style={{ animationDelay: `${index * -1.1}s` }} />
          </g>
        ))}
        <g className={styles.pieChart}>
          <circle cx="443" cy="152" r="49" fill="#edf7fa" />
          <path d="M443 152V103a49 49 0 0 1 42.4 24.5Z" fill="#c5e7f0" />
          <path className={styles.chartDot} d="M443 152 400.6 127.5A49 49 0 0 1 443 103Z" fill="#e8d4af" />
          <path d="m443 152 42.4-24.5a49 49 0 0 1 2.6 43.8Z" fill="#d7edf4" />
        </g>
        {[87, 73, 58].map((width, index) => (
          <rect key={index} className={styles.progressFill} x="210" y={232 + index * 11} width={width} height="5" fill="#e3f2f6" style={{ animationDelay: `${index * -1.4}s` }} />
        ))}
      </g>
    </svg>
  );
}
