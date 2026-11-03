import type { Locale } from "@/lib/i18n/locales";

/** Authored model diagrams, without individual scores or fabricated reports. */
export function AssessmentStructureArt({
  kind,
  locale,
}: {
  kind: string;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return (
    <div className={`assessment-art assessment-art-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 360 150" fill="none" focusable="false">
        {kind === "mbti" && (
          <>
            {[
              ["E", "I"],
              ["S", "N"],
              ["T", "F"],
              ["J", "P"],
            ].map(([left, right], index) => {
              const x = 22 + index * 82;
              return (
                <g key={left}>
                  <rect
                    x={x}
                    y="26"
                    width="70"
                    height="98"
                    rx="17"
                    fill="white"
                    stroke="currentColor"
                    strokeOpacity=".14"
                  />
                  <rect
                    x={x + 7}
                    y="33"
                    width="56"
                    height="38"
                    rx="11"
                    fill="currentColor"
                    fillOpacity=".11"
                  />
                  <text
                    x={x + 35}
                    y="59"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="23"
                    fontWeight="600"
                  >
                    {left}
                  </text>
                  <path
                    d={`M${x + 18} 78h34`}
                    stroke="currentColor"
                    strokeOpacity=".16"
                  />
                  <text
                    x={x + 35}
                    y="108"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="23"
                    fontWeight="600"
                    opacity=".65"
                  >
                    {right}
                  </text>
                </g>
              );
            })}
          </>
        )}
        {kind === "ocean" && (
          <>
            {[
              ["O", "开放性", "Openness"],
              ["C", "尽责性", "Conscientious"],
              ["E", "外向性", "Extraversion"],
              ["A", "宜人性", "Agreeableness"],
              ["N", "神经质", "Neuroticism"],
            ].map(([letter, name, english], index) => {
              const x = 36 + index * 72;
              return (
                <g key={letter}>
                  <path
                    d={`M${x} 37v61`}
                    stroke="currentColor"
                    strokeOpacity=".16"
                    strokeWidth="32"
                    strokeLinecap="round"
                  />
                  <circle cx={x} cy="51" r="22" fill="white" />
                  <text
                    x={x}
                    y="59"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="22"
                    fontWeight="600"
                  >
                    {letter}
                  </text>
                  <circle
                    cx={x}
                    cy="94"
                    r="5"
                    fill="currentColor"
                    fillOpacity=".55"
                  />
                  <text
                    x={x}
                    y="132"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={zh ? "11" : "7.5"}
                  >
                    {zh ? name : english}
                  </text>
                </g>
              );
            })}
          </>
        )}
        {kind === "riasec" && (
          <>
            <path
              d="m180 22 55 27v52l-55 27-55-27V49z"
              fill="white"
              stroke="currentColor"
              strokeOpacity=".2"
            />
            <path
              d="m180 44 34 16v30l-34 16-34-16V60z"
              stroke="currentColor"
              strokeOpacity=".16"
            />
            <circle
              cx="180"
              cy="75"
              r="17"
              fill="currentColor"
              fillOpacity=".1"
            />
            <path
              d="M174 75h12m-6-6v12"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {[
              ["R", 180, 22],
              ["I", 235, 49],
              ["A", 235, 101],
              ["S", 180, 128],
              ["E", 125, 101],
              ["C", 125, 49],
            ].map(([letter, x, y]) => (
              <g key={letter}>
                <circle
                  cx={x}
                  cy={y}
                  r="17"
                  fill="white"
                  stroke="currentColor"
                  strokeOpacity=".18"
                />
                <text
                  x={x}
                  y={Number(y) + 5}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="15"
                  fontWeight="600"
                >
                  {letter}
                </text>
              </g>
            ))}
            <path
              d="M35 53h40m-20 8h20m210 29h40m-40 8h20"
              stroke="currentColor"
              strokeOpacity=".18"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </>
        )}
        {kind === "enneagram" && (
          <>
            <circle
              cx="180"
              cy="75"
              r="54"
              stroke="currentColor"
              strokeOpacity=".16"
            />
            <circle
              cx="180"
              cy="75"
              r="31"
              stroke="currentColor"
              strokeOpacity=".1"
            />
            <circle
              cx="180"
              cy="75"
              r="9"
              fill="currentColor"
              fillOpacity=".12"
            />
            {[9, 1, 2, 3, 4, 5, 6, 7, 8].map((number, index) => {
              const angle = ((-90 + index * 40) * Math.PI) / 180;
              const x = 180 + 54 * Math.cos(angle),
                y = 75 + 54 * Math.sin(angle);
              return (
                <g key={number}>
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill="white"
                    stroke="currentColor"
                    strokeOpacity=".16"
                  />
                  <text
                    x={x}
                    y={y + 4.5}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="600"
                  >
                    {number}
                  </text>
                </g>
              );
            })}
            <path
              d="M45 63h40m-20 9h20m190 9h40m-40 9h20"
              stroke="currentColor"
              strokeOpacity=".16"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {kind === "iq" && (
          <>
            {[27, 140, 253].map((x) => (
              <rect
                key={x}
                x={x}
                y="33"
                width="80"
                height="84"
                rx="15"
                fill="white"
                stroke="currentColor"
                strokeOpacity=".13"
              />
            ))}
            <path
              d="m67 48 22 13v27L67 101 45 88V61z"
              fill="currentColor"
              fillOpacity=".12"
            />
            <path
              d="m45 61 22 13 22-13M67 74v27"
              stroke="currentColor"
              strokeOpacity=".65"
              strokeWidth="2"
            />
            {[0, 1, 2].flatMap((row) =>
              [0, 1, 2].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={155 + col * 18}
                  y={51 + row * 18}
                  width="13"
                  height="13"
                  rx="3"
                  fill="currentColor"
                  fillOpacity={row === col ? ".7" : ".13"}
                />
              )),
            )}
            <path
              d="m269 88 16-28 16 28z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle
              cx="302"
              cy="61"
              r="6"
              fill="currentColor"
              fillOpacity=".24"
            />
            <path
              d="M278 101h29"
              stroke="currentColor"
              strokeOpacity=".18"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M115 75h16m-6-5 6 5-6 5m103-5h16m-6-5 6 5-6 5"
              stroke="currentColor"
              strokeOpacity=".3"
              strokeWidth="1.5"
            />
          </>
        )}
        {kind === "eq" && (
          <>
            <path
              d="M125 49h110v52H125z"
              stroke="currentColor"
              strokeOpacity=".17"
            />
            <circle cx="180" cy="75" r="31" fill="white" />
            <path
              d="M167 76c1 14 24 14 26 0M169 65h1m20 0h1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {[
              ["觉察", "Awareness", 88, 40],
              ["调节", "Regulation", 272, 40],
              ["共情", "Empathy", 88, 110],
              ["关系", "Relationships", 272, 110],
            ].map(([name, english, x, y]) => (
              <g key={name}>
                <rect
                  x={Number(x) - 47}
                  y={Number(y) - 18}
                  width="94"
                  height="36"
                  rx="18"
                  fill="white"
                  stroke="currentColor"
                  strokeOpacity=".15"
                />
                <text
                  x={x}
                  y={Number(y) + 4}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize={zh ? "12" : "10"}
                  fontWeight="500"
                >
                  {zh ? name : english}
                </text>
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
