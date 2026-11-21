import Image from "next/image";
import { AudioLines, ChevronDown, HeartHandshake, MessageCircle, ScanLine } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import styles from "@/components/career/unlock-report-experience.module.css";

type Localized = [string, string, string];
type ProfileRow = { code: string; label: string; score: number; center?: string };
export type TraitProfilePreview = {
  kind: "enneagram" | "eq";
  title: string;
  label: string;
  description: string;
  art: string;
  lead: string;
  rows: ProfileRow[];
};

const eqAxes = [
  { code: "SA", icon: ScanLine, label: ["自我觉察", "自我覺察", "Self-awareness"], copy: ["留意自己正在经历什么情绪，以及什么触发了它。", "留意自己正在經歷什麼情緒，以及什麼觸發了它。", "Notice what you feel and what prompted it."] },
  { code: "ER", icon: AudioLines, label: ["情绪调节", "情緒調節", "Emotion regulation"], copy: ["面对强烈情绪时，观察自己怎样调整反应。", "面對強烈情緒時，觀察自己怎樣調整反應。", "Notice how you adjust your response when emotions run high."] },
  { code: "EM", icon: HeartHandshake, label: ["共情理解", "共情理解", "Empathic understanding"], copy: ["从对方的表达和情境中理解其感受，并向对方核实。", "從對方的表達和情境中理解其感受，並向對方核實。", "Listen for what the other person feels and check your interpretation."] },
  { code: "RM", icon: MessageCircle, label: ["关系管理", "關係管理", "Relationship management"], copy: ["在意见不同时表达自己的需要，并和对方商量下一步。", "在意見不同時表達自己的需要，並和對方商量下一步。", "Express your needs during disagreements and agree on a next step together."] },
] satisfies { code: string; icon: typeof ScanLine; label: Localized; copy: Localized }[];

const centers: { id: string; title: Localized }[] = [
  { id: "head", title: ["思考中心", "思考中心", "Head center"] },
  { id: "heart", title: ["情感中心", "情感中心", "Heart center"] },
  { id: "body", title: ["本能中心", "本能中心", "Body center"] },
];

const eqMin = 55;
const eqMax = 145;
const localized = (locale: DisplayLocale, copy: Localized) => copy[locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0];

export function buildEqProfile(dimensions: { code: string; standard_score: number }[], locale: DisplayLocale): TraitProfilePreview | undefined {
  const rows = eqAxes.flatMap(({ code, label }) => {
    const score = dimensions.find(row => row.code === code)?.standard_score;
    return typeof score === "number" && Number.isFinite(score) ? [{ code, label: localized(locale, label), score }] : [];
  });
  if (rows.length !== eqAxes.length) return;
  const lead = [...rows].sort((a, b) => b.score - a.score)[0];
  return {
    kind: "eq",
    title: lead.label,
    label: localized(locale, ["本次情商自评最高维度", "本次情商自評最高維度", "Highest dimension in this self-assessment"]),
    description: localized(locale, eqAxes.find(axis => axis.code === lead.code)!.copy),
    lead: lead.code,
    art: "/images/eq/preview-relationship-management.webp",
    rows,
  };
}

function EqRadar({ rows }: { rows: ProfileRow[] }) {
  const point = (index: number, fraction: number) => [
    120 + [0, 1, 0, -1][index] * 76 * fraction,
    120 + [-1, 0, 1, 0][index] * 76 * fraction,
  ];
  const polygon = (fractions: number[]) => fractions.map((fraction, index) => point(index, fraction).join(",")).join(" ");
  const fractions = rows.map(row => Math.min(1, Math.max(0, (row.score - eqMin) / (eqMax - eqMin))));
  return <svg className={styles.eqProfileRadar} viewBox="0 0 240 240" aria-hidden="true">
    {[.25, .5, .75, 1].map(level => <polygon key={level} points={polygon(rows.map(() => level))} className={styles.radarGrid} />)}
    {rows.map(({ code }, index) => {
      const [x, y] = point(index, 1);
      const [lx, ly] = point(index, 1.25);
      return <g key={code}>
        <line x1="120" y1="120" x2={x} y2={y} className={styles.radarGrid} />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central">{code}</text>
      </g>;
    })}
    <polygon points={polygon(fractions)} className={styles.radarProfile} />
    {fractions.map((fraction, index) => {
      const [x, y] = point(index, fraction);
      return <circle key={rows[index].code} cx={x} cy={y} r="4" className={styles.radarPoint} />;
    })}
  </svg>;
}

export function TraitProfileUnlockPreview({ profile, locale }: { profile: TraitProfilePreview; locale: DisplayLocale }) {
  const t = (...copy: Localized) => localized(locale, copy);
  return <>
    <header className={styles.profileHero} data-profile={profile.kind}>
      <div>
        <p className={styles.profileTag}>{profile.label}</p>
        <h1>{profile.title}</h1>
        <p>{profile.description}</p>
      </div>
      <Image priority src={profile.art} width={380} height={380} sizes="(max-width: 580px) 55vw, 280px" alt="" />
    </header>
    {profile.kind === "enneagram" ? <section className={styles.profileBreakdownPanel} aria-labelledby="enneagram-preview-heading">
      <h2 id="enneagram-preview-heading">{t("九型动机分布", "九型動機分布", "Nine motivation scores")}</h2>
      <p>{t("以下为 0–100 的作答轮廓分。", "以下為 0–100 的作答輪廓分。", "Profile scores shown on a 0–100 scale.")}</p>
      <div className={styles.motivationCenters}>
        {centers.map(({ id, title }) => <section key={id} data-center={id}>
          <h3>{localized(locale, title)}</h3>
          <ul>{profile.rows.filter(row => row.center === id).map(row => <li key={row.code} data-leading={row.code === profile.lead || undefined}>
            <div><span>{row.label}</span><strong>{row.score.toLocaleString(locale)}</strong></div>
            <span className={styles.track} aria-hidden="true"><i style={{ width: `${row.score}%` }} /></span>
          </li>)}</ul>
        </section>)}
      </div>
    </section> : <section className={styles.profileBreakdownPanel} aria-labelledby="eq-preview-heading">
      <h2 id="eq-preview-heading">{t("四维情商档案", "四維情商檔案", "Your four EQ dimensions")}</h2>
      <p>{t("标准分 55–145", "標準分 55–145", "Standard scores · 55–145")}</p>
      <div className={styles.eqProfileGrid}>
        <EqRadar rows={profile.rows} />
        <div>{profile.rows.map((row, index) => {
          const { icon: Icon, copy } = eqAxes[index];
          return <details key={row.code} open={row.code === profile.lead}>
            <summary><Icon size={16} aria-hidden="true" /><span>{row.label}<small>{row.code}</small></span><strong>{row.score.toLocaleString(locale)}</strong><ChevronDown size={16} aria-hidden="true" /></summary>
            <p>{localized(locale, copy)}</p>
          </details>;
        })}</div>
      </div>
    </section>}
  </>;
}
