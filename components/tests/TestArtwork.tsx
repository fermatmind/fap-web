import { useId } from "react";

/** Original editorial scenes: large silhouettes and familiar objects, never fake result charts. */
export function testArtworkTheme(slug: string, category: string) {
  if (
    /natal|zodiac|moon|star|nakshatra|birth|life-path|nine-star|tarot|chakra/.test(
      slug,
    )
  )
    return "cosmos";
  if (/music|playlist|soundtrack|dj|nana/.test(slug)) return "music";
  if (/color|aesthetic|outfit|style-impression|fashion/.test(slug))
    return "color";
  if (
    /reasoning|iq-test|logic|number-series|aptitude|critical-thinking|spatial/.test(
      slug,
    )
  )
    return "reasoning";
  if (
    /typing|key-test|entry|java|python|sql|excel|computer|word-skill|time-management|project-management/.test(
      slug,
    )
  )
    return "everyday";
  if (/animal|flower|dog|creature|fish|garden|forest/.test(slug))
    return "metaphor";
  if (/character|hogwarts|superpower|dungeons|story|portal|quest/.test(slug))
    return "fantasy";
  if (/communication|friend|team|social|group|leadership|conflict/.test(slug))
    return "social";
  return category;
}

export function TestArtwork({
  theme = "framework",
  className = "",
}: {
  theme?: string;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const scene = [
    "fantasy",
    "social",
    "everyday",
    "relationships",
    "metaphor",
    "nature",
    "reasoning",
    "cosmos",
    "music",
    "color",
  ].includes(theme)
    ? theme
    : "framework";
  const colors: Record<string, [string, string, string]> = {
    reasoning: ["#e2e7e6", "#385960", "#c7996d"],
    cosmos: ["#e2e1eb", "#3f425e", "#d4b47e"],
    music: ["#ebdfd2", "#664b43", "#ce8c56"],
    color: ["#e9e2d4", "#4e655a", "#cd8b6a"],
    framework: ["#e5e9de", "#2d5144", "#e3a776"],
    fantasy: ["#e5def0", "#53426a", "#e2ae79"],
    social: ["#eee0d1", "#845042", "#d6a054"],
    everyday: ["#e5e9dc", "#4d6554", "#d6a769"],
    relationships: ["#f0dfd9", "#8d4e50", "#cc956e"],
    metaphor: ["#dce8e6", "#345b63", "#daa76a"],
    nature: ["#dce8e6", "#345b63", "#daa76a"],
  };
  const [bg, ink, accent] = colors[scene];
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={`grain-${id}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".65" fill={ink} opacity=".09" />
        </pattern>
        <clipPath id={`clip-${id}`}>
          <rect width="600" height="400" rx="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <path fill={bg} d="M0 0h600v400H0z" />
        <circle cx="480" cy="80" r="95" fill="#fff" opacity=".24" />
        {scene === "framework" && (
          <>
            <path
              d="M128 400V188c0-82 49-140 129-140s132 58 132 140v212"
              fill="#f7f2e7"
            />
            <path
              d="M169 400V218c0-60 39-103 89-103 61 0 95 42 95 103v182"
              fill={accent}
            />
            <path d="M213 289v61l-49 50h198l-48-50v-70" fill="#bf7757" />
            <path
              d="M202 172c-14 32-7 91 18 118 21 23 63 21 88-3 24-24 34-66 26-106-8-36-30-54-64-54-31 0-57 16-68 45Z"
              fill="#e7b88f"
            />
            <path
              d="M196 225c-33-45-15-115 38-128 69-17 123 35 106 108-13-3-30-23-37-58-25 33-63 45-98 40l-9 38Z"
              fill={ink}
            />
            <path
              d="m263 210-8 28h17M226 205h9m53 0h9m-47 55c10 5 21 5 30-1"
              stroke={ink}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path d="m169 400 38-66 53 35 54-35 48 66" fill={ink} />
            <path
              d="M414 335V215m0 60c-42 0-54-25-54-39 36-1 54 12 54 39Zm0-31c41 0 55-26 55-46-36 0-55 17-55 46Zm0 69c43 0 68-25 68-45-42-2-68 18-68 45Z"
              stroke={ink}
              strokeWidth="4"
              fill={ink}
            />
            <path d="M399 334h33l-5 46h-22z" fill={accent} />
            <circle cx="100" cy="100" r="22" fill={accent} />
            <path d="m82 314 23-21 23 21-23 21z" stroke={ink} strokeWidth="2" />
          </>
        )}
        {scene === "fantasy" && (
          <>
            <path d="M130 400V177a170 170 0 0 1 340 0v223" fill={ink} />
            <path d="M160 400V180a140 140 0 0 1 280 0v220" fill="#302b46" />
            <circle cx="354" cy="112" r="49" fill="#efd5a6" />
            <circle cx="375" cy="93" r="43" fill="#302b46" />
            <path
              d="m163 296 88-99 65 74 57-57 67 83v103H160z"
              fill="#8c85a1"
            />
            <path d="m160 344 115-87 164 92v51H160z" fill="#bcacae" />
            <path
              d="M277 400c-14-47 64-54 31-85-26-24-20-38 8-44"
              stroke="#edd6ad"
              strokeWidth="25"
            />
            <path
              d="M72 400V222m0 73-40-40m40 3 34-39m403 181V188m0 75-27-34m27-10 34-31"
              stroke={ink}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M220 100v14m-7-7h14m154 71v14m-7-7h14m-100-38v8m-4-4h8"
              stroke="#f6e6c9"
              strokeWidth="3"
            />
            <path
              d="M82 352c73-29 132-14 217 18 71-33 130-41 217-18l-19 48H98z"
              fill="#f6eee0"
            />
            <path d="M300 370v30" stroke={accent} strokeWidth="3" />
          </>
        )}
        {scene === "social" && (
          <>
            <path d="M190 52h220v171H190z" fill="#faf2e4" />
            <path d="M300 52v171m-110-85h220" stroke={bg} strokeWidth="9" />
            <circle cx="128" cy="170" r="39" fill={accent} />
            <path d="M88 167c-7-71 85-77 83-6l-35-15-48 21Z" fill={ink} />
            <path
              d="M59 362v-73c0-46 25-69 69-69 50 0 71 38 71 69v73"
              fill={ink}
            />
            <path
              d="m144 269 80 32"
              stroke={accent}
              strokeWidth="25"
              strokeLinecap="round"
            />
            <circle cx="464" cy="174" r="39" fill="#dba885" />
            <path
              d="M422 178c-9-66 62-85 83-28l-11 58-22-18 8-40-58 28Z"
              fill="#403d35"
            />
            <path
              d="M401 363v-74c0-44 22-69 64-69 53 0 76 33 76 69v74"
              fill="#ba785f"
            />
            <path
              d="m451 270-72 30"
              stroke="#dba885"
              strokeWidth="25"
              strokeLinecap="round"
            />
            <ellipse cx="300" cy="327" rx="176" ry="53" fill="#f8f0df" />
            <path d="M180 365v35m237-35v35" stroke={ink} strokeWidth="12" />
            <path d="M260 282h31v34h-31zm70 0h31v34h-31z" fill={ink} />
            <path d="m299 157 20 9v-16h46v-43h-66z" fill={accent} />
            <path d="M310 122h24m-24 10h36" stroke="#fff5e5" strokeWidth="3" />
          </>
        )}
        {scene === "everyday" && (
          <>
            <path d="M120 58h310v230H120z" fill="#f8f4e8" />
            <path
              d="M275 58v230M120 182h310"
              stroke="#bbc7b3"
              strokeWidth="8"
            />
            <path d="m124 245 71-45 85 38 75-70 72 58v61H124z" fill="#aec0a8" />
            <path d="M66 313h470v18H66z" fill={ink} />
            <path d="M100 331v69m400-69v69" stroke={ink} strokeWidth="15" />
            <path d="M164 296h127v17H164z" fill={accent} />
            <path d="M179 279h124v17H179z" fill="#f7efdf" />
            <path d="m280 179 117 12-10 95-116-12z" fill={ink} />
            <path d="m292 193 91 9-8 68-90-9z" fill="#d7e0cd" />
            <path d="m270 274 118 12 27 27H235z" fill="#78917c" />
            <path
              d="M457 260v-95m0 55c-39-2-52-34-48-58 32 4 50 29 48 58Zm0-30c29-11 45-39 38-62-32 6-42 30-38 62Z"
              fill={ink}
            />
            <path d="M433 260h48l-7 53h-34z" fill={accent} />
            <circle cx="164" cy="99" r="19" fill={accent} />
          </>
        )}
        {scene === "relationships" && (
          <>
            <path d="M139 400V185a161 161 0 1 1 322 0v215" fill="#faf0df" />
            <path
              d="M205 164c-11-42 28-75 63-46l32 29 32-29c35-29 74 4 63 46-8 29-52 64-95 95-43-31-87-66-95-95Z"
              fill={ink}
            />
            <path
              d="m48 355 122-114c22-20 43-1 29 20l-32 45 89-39c19-8 31 7 19 19l-72 73-93 41H48z"
              fill={accent}
            />
            <path
              d="m552 355-122-114c-22-20-43-1-29 20l32 45-89-39c-19-8-31 7-19 19l72 73 93 41h62z"
              fill="#c88473"
            />
            <path d="M34 371 90 318l77 82H34z" fill={ink} />
            <path d="m566 371-56-53-77 82h133z" fill={ink} />
            <path
              d="M300 58V38m-61 33-12-19m134 19 12-19"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        )}
        {(scene === "metaphor" || scene === "nature") && (
          <>
            <circle cx="307" cy="158" r="102" fill="#f7edce" />
            <path
              d="M0 312 131 187l85 92 77-58 105 91 101-120 101 120v88H0z"
              fill="#8ca9a1"
            />
            <path d="M0 363 146 277l155 98 172-99 127 66v58H0z" fill={ink} />
            <path
              d="m298 319-54-67 8-72 43 28 28-5 40-32-4 83-38 65z"
              fill={accent}
            />
            <path d="m254 187 22 39-28-4m105-31-27 36 29-8" fill="#72513c" />
            <path d="m263 248 35 27 48-29-27 56h-24z" fill="#f3e2be" />
            <path d="m298 273 10 9 10-10" fill={ink} />
            <path
              d="m273 240 9 5m41-1 9-5"
              stroke={ink}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M85 323V94m0 74-39 40m39-4 50 47m392 105V87m0 62-31 41m31 22 34 28"
              stroke={ink}
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path d="M70 100 88 63l17 39m405 1 18-39 18 39" fill={ink} />
          </>
        )}
        {scene === "reasoning" && (
          <>
            <path d="M86 326 294 207l220 119-208 120z" fill="#becbc8" />
            <path d="m151 176 70-40 70 40-70 42z" fill="#fbf0d7" />
            <path d="m151 176 70 42v86l-70-41z" fill={accent} />
            <path d="m221 218 70-42v87l-70 41z" fill={ink} />
            <path d="m291 263 70-41 70 41-70 41z" fill="#fbf0d7" />
            <path d="m291 263 70 41v86l-70-41z" fill={accent} />
            <path d="m361 304 70-41v86l-70 41z" fill={ink} />
            <path d="m291 93 70-40 70 40-70 42z" fill="#fbf0d7" />
            <path d="m291 93 70 42v86l-70-41z" fill={accent} />
            <path d="m361 135 70-42v87l-70 41z" fill={ink} />
            <path
              d="m221 122 70-40m-1 154 68-40m-94 153 28 16"
              stroke={ink}
              strokeWidth="3"
              strokeDasharray="5 7"
            />
            <circle cx="112" cy="95" r="21" fill={accent} />
          </>
        )}
        {scene === "cosmos" && (
          <>
            <path d="M125 400V167a175 175 0 0 1 350 0v233" fill={ink} />
            <circle
              cx="300"
              cy="204"
              r="129"
              stroke="#f4e7c3"
              strokeWidth="1"
              opacity=".5"
            />
            <circle
              cx="300"
              cy="204"
              r="94"
              stroke="#f4e7c3"
              strokeWidth="1"
              opacity=".5"
            />
            <ellipse
              cx="300"
              cy="204"
              rx="168"
              ry="49"
              transform="rotate(-29 300 204)"
              stroke="#d3b985"
              strokeWidth="2"
            />
            <circle cx="300" cy="204" r="53" fill="#efdab0" />
            <circle cx="318" cy="188" r="47" fill="#77788d" />
            <circle cx="161" cy="239" r="13" fill={accent} />
            <circle cx="420" cy="111" r="8" fill="#f7e6bb" />
            <path
              d="m224 98 4 12 12 4-12 4-4 12-4-12-12-4 12-4Zm170 191 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z"
              fill="#efe2c2"
            />
            <path d="M250 352h100v48H250z" fill={accent} />
            <path d="M300 257v94" stroke={accent} strokeWidth="8" />
          </>
        )}
        {scene === "music" && (
          <>
            <path d="M121 116h358v242H121z" fill={ink} />
            <path d="M106 358h388v18H106z" fill="#a97858" />
            <circle cx="281" cy="238" r="103" fill="#2c332d" />
            <circle cx="281" cy="238" r="85" stroke="#5b6354" strokeWidth="2" />
            <circle cx="281" cy="238" r="70" stroke="#5b6354" strokeWidth="2" />
            <circle cx="281" cy="238" r="39" fill={accent} />
            <circle cx="281" cy="238" r="8" fill="#f2e5c9" />
            <path
              d="m429 155-11 123-40 26"
              stroke="#d3c4a5"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path d="M110 116V67h371v49" fill="#d1b999" />
            <path
              d="m162 81 21-14m39 14 21-14m39 14 21-14"
              stroke="#ac8964"
              strokeWidth="2"
            />
            <path
              d="M94 183v-39m0 20-17 7m431-72V61l30-8v37m-30-14 30-8"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="88" cy="185" r="8" fill={accent} />
            <circle cx="502" cy="101" r="8" fill={accent} />
            <circle cx="532" cy="92" r="8" fill={accent} />
          </>
        )}
        {scene === "color" && (
          <>
            <path d="M131 318 218 74l77 27-87 244z" fill="#b37860" />
            <path d="m173 333 45-259 83 14-45 259z" fill="#dfaf67" />
            <path d="M217 343V80h86v263z" fill="#567263" />
            <path d="m259 342-41-260 85-14 41 261z" fill="#91a5ae" />
            <path d="m299 331-81-251 82-26 81 251z" fill="#8b7796" />
            <path d="M155 287h244v82H155z" fill="#f8f1df" />
            <circle cx="280" cy="329" r="7" fill={ink} />
            <path
              d="M429 168v131m0-81c-31-5-43-29-41-48 30 3 44 18 41 48Zm0 36c37-3 49-28 47-47-29 0-49 23-47 47Z"
              fill={ink}
            />
            <path d="M409 297h42l-6 56h-30z" fill={accent} />
          </>
        )}
        <path fill={`url(#grain-${id})`} d="M0 0h600v400H0z" />
      </g>
    </svg>
  );
}
