import type { Locale } from "@/lib/i18n/locales";

const descriptions = {
  q1: { en: "An open patch of snow on paper, with a broad base, an oval face and three loose shapes waiting beside it.", zh: "纸上一片空雪地，旁边有宽底座、椭圆脸和三块待安排的松散形状。" },
  q2: { en: "A leaning tall snow shape stands beside a wide lower form, a small gesturing figure and two shorter pieces.", zh: "倾斜的高雪形旁，画着宽的下部造型、做动作的小角色与两块矮部件。" },
  q3: { en: "A new small snow shape appears between a partly arranged sculpture, two figures and an open path for loose pieces.", zh: "新添的小雪形出现在尚未排好的雪雕、两个角色和可放松散部件的空路之间。" },
  q4: { en: "A snowy arch with paper tokens, three repeated rounded shapes and a face with an unfinished expression offer possible final details.", zh: "有纸棋子的雪拱门、三个重复圆形，以及表情尚未画完的脸，呈现可选的最后细节。" },
  q5: { en: "Part of the imagined sculpture has melted into a drawn puddle. A low arch remains, a figure has an empty speech bubble and several loose pieces sit nearby.", zh: "想象雪雕部分融成画出的水洼，留下低拱门、带空白对白框的角色，以及旁边几块松散部件。" },
  q6: { en: "Three postcard frames show snow figures sharing a moment, fitted sculptural forms and a scene with movable pieces awaiting another arrangement.", zh: "三个明信片画框分别呈现共处瞬间的雪角色、相互配合的雪雕形状，以及留有部件等待重排的场景。" },
} as const;

/** Original static scenes fulfill the illustrated-choice premise without a visual-identification task. */
export function SnowDayPanel({ questionId, locale, displayText = (text) => text }: { questionId: string; locale: Locale; displayText?: (text: string) => string }) {
  if (!(questionId in descriptions)) return null;
  const description = displayText(descriptions[questionId as keyof typeof descriptions][locale]);
  return <figure data-snow-day-panel={questionId} className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <svg viewBox="0 0 600 220" role="img" aria-label={description} className="w-full" focusable="false">
      <rect width="600" height="220" fill="#eef5f5" /><path d="M0 182q150-20 300 0t300 0v38H0Z" fill="#fffdf8" />
      <g stroke="#78a7a2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {questionId === "q1" && <>
          <ellipse cx="238" cy="160" rx="153" ry="27" fill="#fff" strokeDasharray="5 7" />
          <path d="M62 139h102l-15 32H77Z" fill="#fff" /><ellipse cx="421" cy="111" rx="29" ry="36" fill="#fff" />
          <circle cx="412" cy="107" r="2" fill="#123f49" /><circle cx="431" cy="107" r="2" fill="#123f49" /><path d="M415 125q7 5 13 0" fill="none" />
          <circle cx="493" cy="153" r="17" fill="#f4e7c9" /><path d="m526 139 25 34h-43Z" fill="#fff" /><rect x="475" y="66" width="32" height="26" rx="5" fill="#d88770" />
        </>}
        {questionId === "q2" && <>
          <path d="m65 162 32-91 35 11-17 80Z" fill="#fff" /><path d="M145 169h81l-12-28h-57Z" fill="#fff" />
          <ellipse cx="318" cy="140" rx="26" ry="33" fill="#fff" /><circle cx="329" cy="90" r="22" fill="#fff" /><path d="m301 126-29-20m66 20 25-15" />
          <path d="M420 170v-37q0-17 17-17t17 17v37Zm60 0v-27q0-17 17-17t17 17v27Z" fill="#fff" /><path d="m95 59 22-11" stroke="#d88770" />
        </>}
        {questionId === "q3" && <>
          <path d="M58 171h109v-30H58Zm14-30h80v-31H72Zm19-31h41V81H91Z" fill="#fff" />
          <circle cx="251" cy="153" r="17" fill="#f4e7c9" /><path d="m251 117 0 11m-23 2 6 7m38-7-6 7" stroke="#d88770" />
          {[335,388].map(x=><g key={x}><ellipse cx={x} cy="150" rx="19" ry="24" fill="#fff" /><circle cx={x} cy="111" r="15" fill="#fff" /><path d={`m${x-5} 111 1 0m9 0 1 0`} stroke="#123f49" /></g>)}
          <path d="M456 163q35-73 90-75" fill="none" strokeDasharray="5 7" /><circle cx="488" cy="162" r="13" fill="#fff" /><rect x="521" y="133" width="24" height="21" rx="4" fill="#d88770" />
        </>}
        {questionId === "q4" && <>
          <path d="M49 174v-45a52 52 0 0 1 104 0v45h-29v-43a23 23 0 0 0-46 0v43Z" fill="#fff" /><circle cx="92" cy="166" r="7" fill="#d88770" /><circle cx="111" cy="151" r="7" fill="#f4e7c9" />
          {[240,285,330].map(x=><rect key={x} x={x} y="115" width="36" height="59" rx="17" fill="#fff" />)}
          <circle cx="477" cy="122" r="43" fill="#fff" /><path d="M462 114h1m28 0h1m-30 28q16 10 30 0" fill="none" strokeDasharray="4 4" /><path d="m523 150 19-21" stroke="#d88770" />
        </>}
        {questionId === "q5" && <>
          <ellipse cx="258" cy="176" rx="203" ry="22" fill="#d9e9eb" stroke="none" />
          <path d="M74 166v-18a44 44 0 0 1 88 0v18h-23v-18a21 21 0 0 0-42 0v18Z" fill="#fff" /><path d="M84 131q12-17 19-9m46 23 7 8" fill="none" />
          <ellipse cx="300" cy="149" rx="27" ry="24" fill="#fff" /><circle cx="301" cy="112" r="21" fill="#fff" /><path d="M328 60h89v43h-64l-18 12v-12h-7Z" fill="#fffdf8" />
          <circle cx="456" cy="157" r="17" fill="#fff" /><rect x="488" y="141" width="34" height="27" rx="6" fill="#fff" /><path d="m534 169 18-35 18 35Z" fill="#f4e7c9" />
        </>}
        {questionId === "q6" && <>
          {[28,224,420].map(x=><rect key={x} x={x} y="50" width="153" height="130" rx="8" fill="#fffdf8" />)}
          {[76,131].map(x=><g key={x}><ellipse cx={x} cy="138" rx="17" ry="23" fill="#fff" /><circle cx={x} cy="103" r="14" fill="#fff" /></g>)}<path d="m92 133 22-9" stroke="#d88770" />
          <path d="M247 159h107l-17-33h-73Zm19-33h65V99h-65Zm18-27h30V78h-30Z" fill="#fff" />
          <path d="M445 153q30-57 102-39" fill="none" strokeDasharray="4 6" /><circle cx="459" cy="95" r="15" fill="#fff" /><rect x="501" y="138" width="28" height="25" rx="4" fill="#f4e7c9" /><path d="m537 88 18 30h-36Z" fill="#fff" />
        </>}
      </g>
    </svg>
    <figcaption className="px-4 py-3 text-sm leading-6 text-slate-600">{description} {locale === "zh" ? displayText("原创静态插画；雪都在纸上，文字说明同样可用于选择。") : "Original static illustration; all snow is on paper, and the written description also supports your choice."}</figcaption>
  </figure>;
}
