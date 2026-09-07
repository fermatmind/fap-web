import type { AssessmentArtwork } from "@/lib/tests/assessmentLandingUi";
import styles from "./assessment-hero-artwork.module.css";

const CORAL = "#d88770";
const CREAM = "#f4e7ca";
const GOLD = "#d4b775";
const INK = "#103e48";

function point(index: number, total: number, radius: number, cx = 200, cy = 160) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function polygon(indices: number[], total: number, radius: number) {
  return indices.map((index) => {
    const p = point(index, total, radius);
    return `${p.x},${p.y}`;
  }).join(" ");
}

function MbtiSymbol() {
  return <g>
    <circle cx="200" cy="160" r="117" stroke={INK} strokeOpacity=".18" />
    <ellipse cx="200" cy="160" rx="68" ry="117" stroke={INK} strokeOpacity=".14" transform="rotate(30 200 160)" />
    <ellipse cx="200" cy="160" rx="68" ry="117" stroke={INK} strokeOpacity=".14" transform="rotate(-30 200 160)" />
    {["E", "I", "S", "N", "T", "F", "J", "P"].map((letter, i) => {
      const x = 88 + (i % 4) * 57;
      const y = 87 + Math.floor(i / 4) * 72 + (i % 2) * 15;
      return <g key={letter} transform={`translate(${x} ${y})`}>
        <rect width="53" height="66" fill={i % 3 === 0 ? CORAL : i % 3 === 1 ? CREAM : INK} stroke={i % 3 === 2 ? CREAM : "none"} strokeWidth="2" />
        <text x="26.5" y="46" textAnchor="middle" fill={i % 3 === 2 ? CREAM : INK} fontSize="37" fontFamily="Georgia, serif">{letter}</text>
      </g>;
    })}
  </g>;
}

function BigFiveSymbol() {
  return <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const p = point(i, 5, 79);
      return <g key={i}>
        <ellipse cx="200" cy="104" rx="39" ry="69" fill={i % 2 ? GOLD : CORAL} fillOpacity=".85" transform={`rotate(${i * 72} 200 160)`} />
        <circle cx={p.x} cy={p.y} r="24" fill={INK} stroke={CREAM} strokeWidth="1.5" />
        <text x={p.x} y={p.y + 8} textAnchor="middle" fill={CREAM} fontSize="24" fontFamily="Georgia, serif">{"OCEAN"[i]}</text>
      </g>;
    })}
    <circle cx="200" cy="160" r="26" fill={CREAM} />
    <polygon points={polygon([0, 1, 2, 3, 4], 5, 17)} fill="none" stroke={INK} strokeWidth="2" />
  </g>;
}

function EnneagramSymbol() {
  return <g>
    <circle cx="200" cy="160" r="111" fill={CORAL} />
    <circle cx="200" cy="160" r="126" stroke={GOLD} strokeWidth="7" strokeDasharray="164 628" transform="rotate(-90 200 160)" />
    <polygon points={polygon([0, 3, 6], 9, 102)} fill="none" stroke={INK} strokeWidth="3" />
    <polygon points={polygon([1, 4, 2, 8, 5, 7], 9, 102)} fill="none" stroke={INK} strokeWidth="3" />
    {Array.from({ length: 9 }, (_, i) => {
      const p = point(i, 9, 126);
      return <circle key={i} cx={p.x} cy={p.y} r="7" fill={INK} />;
    })}
  </g>;
}

function IqSymbol() {
  return <g transform="translate(89 47)">
    {Array.from({ length: 9 }, (_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      return <g key={i} transform={`translate(${col * 76} ${row * 76})`}>
        <rect width="66" height="66" fill={i === 8 ? "none" : INK} fillOpacity=".06" stroke={i === 8 ? GOLD : INK} strokeOpacity={i === 8 ? 1 : .35} strokeDasharray={i === 8 ? "5 5" : undefined} />
        {i === 8 ? <path d="M26 23C26 13 45 13 45 25C45 32 34 32 34 40M34 48V50" stroke={GOLD} strokeWidth="4" strokeLinecap="round" fill="none" /> :
          <g transform={`rotate(${col * 45} 33 33)`}>
            <rect x={16 + row * 4} y={16 + row * 4} width={34 - row * 8} height={34 - row * 8} fill={row === 1 ? GOLD : CORAL} />
            {col > 0 ? <circle cx="33" cy="33" r={col === 1 ? 7 : 11} fill={INK} /> : null}
          </g>}
      </g>;
    })}
  </g>;
}

function EqSymbol() {
  return <g>
    <path d="M76 75H222Q241 75 241 94V169Q241 188 222 188H145L108 219V188H76Q57 188 57 169V94Q57 75 76 75Z" fill={CORAL} />
    <path d="M180 132H316Q335 132 335 151V226Q335 245 316 245H289V272L249 245H180Q161 245 161 226V151Q161 132 180 132Z" fill={CREAM} />
    <path d="M221 175C205 154 181 178 197 195L222 219L247 195C263 178 239 154 221 175Z" fill={CORAL} />
    <path d="M87 133H109L120 115L136 155L151 127L165 139H197" stroke={CREAM} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M286 77Q316 90 317 115M284 94Q297 99 298 114" stroke={GOLD} strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>;
}

function RiasecSymbol() {
  return <g>
    <polygon points={polygon([0, 1, 2, 3, 4, 5], 6, 116)} stroke={INK} strokeOpacity=".35" strokeWidth="2" fill="none" />
    {Array.from({ length: 6 }, (_, i) => {
      const p = point(i, 6, 116);
      return <g key={i}>
        <path d={`M200 160L${p.x} ${p.y}`} stroke={INK} strokeOpacity=".22" />
        <circle cx={p.x} cy={p.y} r="26" fill={i % 2 ? CORAL : CREAM} stroke={INK} strokeOpacity=".15" />
        <text x={p.x} y={p.y + 9} textAnchor="middle" fill={INK} fontSize="26" fontFamily="Georgia, serif">{"RIASEC"[i]}</text>
      </g>;
    })}
    <circle cx="200" cy="160" r="42" fill={INK} stroke={GOLD} strokeWidth="2" />
    <path d="M200 129L211 160L200 191L189 160Z" fill={GOLD} transform="rotate(35 200 160)" />
    <circle cx="200" cy="160" r="6" fill={CREAM} />
  </g>;
}

const SYMBOLS = { mbti: MbtiSymbol, "big-five": BigFiveSymbol, enneagram: EnneagramSymbol, iq: IqSymbol, eq: EqSymbol, riasec: RiasecSymbol };

const LANDSCAPE_TINTS: Record<AssessmentArtwork, string> = {
  mbti: "#dbe8e8", "big-five": "#dfeae3", enneagram: "#dce9eb",
  iq: "#dfe7ef", eq: "#e6e9e2", riasec: "#e0e8e2",
};

/** Decorative artwork only. The centered heading and entry controls live above it. */
export function AssessmentHeroArtwork({ theme }: { theme: AssessmentArtwork }) {
  const Symbol = SYMBOLS[theme];
  return (
    <div className={styles.scene} aria-hidden="true" data-testid="assessment-hero-artwork" data-theme={theme}>
      <svg className={styles.artwork} viewBox="0 0 1440 360" fill="none" focusable="false">
        <path d="M0 232C175 210 227 253 425 238S662 187 852 225 1131 258 1440 199V360H0Z" fill={LANDSCAPE_TINTS[theme]} fillOpacity=".55" />
        <path d="M0 282C231 225 390 294 602 264S914 228 1084 266 1309 284 1440 257V360H0Z" fill="white" fillOpacity=".65" />
        <path d="M0 318C250 272 392 323 614 301S953 269 1145 309 1332 327 1440 310V360H0Z" fill="white" />
        <g stroke={INK} strokeOpacity=".13" strokeWidth="1.3">
          <circle cx="326" cy="198" r="113" />
          <ellipse cx="326" cy="198" rx="60" ry="113" />
          <ellipse cx="326" cy="198" rx="113" ry="45" />
          <path d="M213 198H439M326 85V311M244 122L408 274M244 274L408 122" />
          <polygon points="1110,76 1212,136 1212,252 1110,311 1008,252 1008,136" />
          <polygon points="1110,110 1183,153 1183,235 1110,278 1037,235 1037,153" />
          <path d="M1110 76V311M1008 136L1212 252M1212 136L1008 252" />
          <path d="M438 198H491M949 198H1008" strokeDasharray="4 8" />
        </g>
        <g fill={CORAL}>
          <circle cx="326" cy="85" r="6" /><circle cx="1110" cy="311" r="6" />
          <circle cx="244" cy="274" r="4" /><circle cx="1212" cy="136" r="4" />
        </g>
        <g stroke={GOLD} strokeWidth="1.6">
          <path d="M167 165V179M160 172H174M1276 247V261M1269 254H1283" />
          <path d="M470 102L475 111L470 120L465 111ZM961 274L966 283L961 292L956 283Z" />
        </g>
        <g transform="translate(520 19)">
          <circle cx="200" cy="160" r="151" stroke={INK} strokeOpacity=".08" />
          <Symbol />
        </g>
      </svg>
    </div>
  );
}
