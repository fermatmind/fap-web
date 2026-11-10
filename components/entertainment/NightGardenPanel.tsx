import type { Locale } from "@/lib/i18n/locales";

const descriptions = {
  q1: { en: "A garden gate with a chime and drawn sound marks; a lantern casts a shadow across the path; a water bead rests on a leaf.", zh: "花园门边有风铃与声音短线，灯笼在小路上投下影子，叶缘停着一颗水珠。" },
  q2: { en: "Two stones with offset shadow lines; overlapping curved sound marks; a leaf tip beside a still branch. Dashed lines suggest a breeze without animation.", zh: "两块石头上有错开的影线，弯曲声音线相互叠合，静止枝条旁有一片叶尖。虚线暗示风的变化，画面不会动。" },
  q3: { en: "A curled petal, three taps separated by gaps, and a bright window reflected in a dark puddle.", zh: "卷起的花瓣、间隔排列的三次敲击符号，以及暗水洼里的明亮窗形倒影。" },
  q4: { en: "A trellis casts a grid of light beside two paths; a small seed cluster sits by a blank label; separated sound marks leave quiet spaces.", zh: "棚架在两条小路旁投下格状光影，空白标签边有一簇种子，分开的声音符号之间留着空隙。" },
  q5: { en: "Three close-up frames show a bell with sound marks, a leaf silhouette against light, and a leaf surface with fine veins.", zh: "三个特写画框分别画铃与声音短线、亮背景前的叶片剪影，以及带细叶脉的叶面。" },
  q6: { en: "An open garden notebook records a small leaf detail, two positions of a lantern shadow and an imagined sound marked by lines.", zh: "打开的花园笔记里，记录小叶片细节、灯影的两个位置，以及用线条表示的想象声音。" },
} as const;

/** Original static scenes. Equivalent descriptions preserve access without visual or audio identification tasks. */
export function NightGardenPanel({ questionId, locale, displayText = (text) => text }: { questionId: string; locale: Locale; displayText?: (text: string) => string }) {
  if (!(questionId in descriptions)) return null;
  const description = displayText(descriptions[questionId as keyof typeof descriptions][locale]);
  return <figure data-night-garden-panel={questionId} className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <svg viewBox="0 0 600 220" role="img" aria-label={description} className="w-full" focusable="false">
      <rect width="600" height="220" fill="#163b46" /><circle cx="547" cy="35" r="16" fill="#f4e7c9" />
      <path d="M0 193q145-25 300 0t300 0v27H0Z" fill="#29535a" />
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
        {questionId === "q1" && <>
          <path d="M56 186V49h115v137M56 97h115m-88 0v89m32-89v89m30-89v89" fill="none" stroke="#91b9b4" />
          <path d="M111 49v15m-13 18q0-23 13-23t13 23Zm-7 2v9m-28-26-8-7m51 7 8-7" fill="#f4e7c9" stroke="#d4b775" />
          <path d="M304 53v-21m-24 21h48v56h-48Z" fill="#f4e7c9" stroke="#d4b775" /><path d="m288 111 114 76h-92l-15-76Z" fill="#0d2833" />
          <path d="M444 177q-18-59 53-78 18 59-53 78Zm0 0 42-60" fill="#78a7a2" stroke="#b4d2ca" /><path d="M502 151q-13 17-1 22 13-5 1-22Z" fill="#e4eef1" />
        </>}
        {questionId === "q2" && <>
          <ellipse cx="111" cy="156" rx="46" ry="24" fill="#9eb9b7" /><ellipse cx="205" cy="163" rx="41" ry="22" fill="#78a7a2" />
          <path d="m75 144 60 19m33-13 62 21" stroke="#0d2833" /><path d="m78 135 58 19m32-13 60 20" stroke="#f4e7c9" strokeDasharray="7 8" />
          <path d="M288 97q41-37 66 0m-57 16q41-37 66 0m-52 15q34-29 60-5" fill="none" stroke="#d4b775" />
          <path d="M431 177 523 93m-53 50q-39-11-29-43 39 0 29 43Z" fill="#78a7a2" stroke="#b4d2ca" /><path d="m463 93 11-10m-6 66 13 6" stroke="#f4e7c9" strokeDasharray="3 7" />
        </>}
        {questionId === "q3" && <>
          <path d="M77 162q-43-60 19-93 57 22 25 75-15 20-30 4-13-18 12-23" fill="#d88770" stroke="#edb6a4" />
          <path d="M229 115v13m26-13v13m86-13v13" stroke="#d4b775" /><circle cx="233" cy="158" r="3" fill="#d4b775" /><circle cx="255" cy="158" r="3" fill="#d4b775" /><circle cx="342" cy="158" r="3" fill="#d4b775" />
          <rect x="434" y="42" width="48" height="48" fill="#f4e7c9" /><path d="M458 42v48m-24-24h48" stroke="#163b46" /><ellipse cx="458" cy="160" rx="70" ry="25" fill="#0d2833" /><path d="M434 145h48v24h-48Zm24 0v24m-24-12h48" fill="#d4b775" stroke="#163b46" />
        </>}
        {questionId === "q4" && <>
          <path d="m77 186 52-60 62 60m-38 0 74-60 49 60" fill="none" stroke="#78a7a2" /><path d="M50 115V51h218v64M70 51v50m42-50v50m42-50v50m42-50v50m42-50v50M50 76h218" stroke="#91b9b4" />
          <path d="m94 135 70 33m-47-48 72 32m-30-37 64 29" stroke="#d4b775" />
          <rect x="326" y="82" width="60" height="33" rx="4" fill="#f4e7c9" /><path d="M356 115v43" stroke="#91b9b4" />{[319,339,359,379].map((x,i)=><ellipse key={x} cx={x} cy={170+i%2*8} rx="5" ry="8" fill="#d88770" />)}
          <path d="M433 103q15-17 30 0m54 13q15-17 30 0" fill="none" stroke="#d4b775" />
        </>}
        {questionId === "q5" && <>
          {[29,223,417].map(x=><rect key={x} x={x} y="52" width="154" height="132" rx="10" fill="#e5eeee" />)}
          <path d="M104 83v12m-23 45q0-50 23-50t23 50Zm23 1v12m-36-43-8-8m80 8 8-8" fill="#d4b775" stroke="#b29659" />
          <circle cx="300" cy="118" r="49" fill="#f4e7c9" /><path d="M274 153q-8-65 53-75 8 60-53 75Z" fill="#163b46" />
          <path d="M448 159q-12-63 93-79-2 75-93 79Zm0 0 78-65m-54 45-5-30m25 15 27 3m-13-15-3-18" fill="#78a7a2" stroke="#29535a" />
        </>}
        {questionId === "q6" && <>
          <path d="M95 51q102-13 205 12 103-25 205-12v139q-100-15-205 10-105-25-205-10Z" fill="#fffdf8" stroke="#91b9b4" /><path d="M300 64v136" stroke="#91b9b4" />
          <path d="M140 137q-4-47 65-52-5 51-65 52Zm0 0 50-39m-26 24-4-16m19 3 15 1" fill="#78a7a2" stroke="#29535a" />
          <path d="M225 91v42m-11-42h22v27h-22Zm-2 42-26 34h26Zm29 0 25 34h-25Z" fill="#d4b775" stroke="#b29659" /><path d="M340 99q23-25 46 0m-46 14q23-25 46 0m41 22v13m19-13v13m38-13v13" fill="none" stroke="#78a7a2" />
        </>}
      </g>
    </svg>
    <figcaption className="px-4 py-3 text-sm leading-6 text-slate-600">{description} {locale === "zh" ? displayText("静态原创插画；声音仅以符号暗示，没有音频。") : "Original static illustration; sounds are suggested by marks, with no audio."}</figcaption>
  </figure>;
}
