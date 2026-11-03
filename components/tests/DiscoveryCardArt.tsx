import editorial from "./discovery-card-editorial.json";

type CardEditorial = {
  subtitle: { zh: string; en: string };
  art: { primary: string; secondary: string; layout: string };
};

/** Explicit per-test editorial choices, with no keyword, color or random fallback. */
export function discoveryCardEditorial(
  slug: string,
): CardEditorial | undefined {
  return (editorial as Partial<Record<string, CardEditorial>>)[slug];
}

function DiscoveryGlyph({
  motif,
  discLabels = false,
}: {
  motif: string;
  discLabels?: boolean;
}) {
  return (
    <g
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {motif === "python-blocks" && (
        <g data-python-blocks="true">
          <rect x="83" y="28" width="119" height="98" rx="9" fill="white" strokeOpacity=".5" />
          <path d="M99 46h70m-70 18h18m0 0v42m0-25h58m-58 18h40" strokeOpacity=".7" />
          <path d="M143 64h31m-24 43h24" strokeOpacity=".3" />
          <rect x="225" y="56" width="57" height="43" rx="8" fill="currentColor" fillOpacity=".12" />
          <path d="M202 77h21m-7-6 7 6-7 6m19 1 8 8 15-18" />
        </g>
      )}
      {motif === "alias-links" && (
        <g data-python-aliases="true">
          <rect x="88" y="32" width="62" height="31" rx="6" fill="white" />
          <rect x="88" y="95" width="62" height="31" rx="6" fill="white" />
          <path d="M150 47h33l32 30m-65 33h33l32-33m-4-7 4 7-8 2" strokeOpacity=".6" />
          <rect x="220" y="51" width="65" height="54" rx="9" fill="currentColor" fillOpacity=".12" />
          <path d="M234 64v28h8m28-28v28h-8M100 47h26m-26 63h26" />
        </g>
      )}
      {motif === "js-bindings" && (
        <g data-javascript-bindings="true">
          <rect x="84" y="31" width="89" height="92" rx="9" fill="white" strokeOpacity=".55" />
          <path d="M101 50h54m-54 17h24m-24 17h39m-39 17h20m52-25h29m-7-6 7 6-7 6" strokeOpacity=".65" />
          <rect x="215" y="44" width="72" height="69" rx="10" fill="currentColor" fillOpacity=".1" />
          <path d="M236 60q-7 0-7 8v4q0 5-5 6 5 1 5 6v4q0 8 7 8m30-36q7 0 7 8v4q0 5 5 6-5 1-5 6v4q0 8-7 8" />
          <circle cx="250" cy="78" r="5" fill="currentColor" fillOpacity=".3" />
        </g>
      )}
      {motif === "promise-jobs" && (
        <g data-javascript-jobs="true">
          <path d="M91 50h186m-186 54h186" strokeOpacity=".3" />
          {[105,159,213].map((x,i)=><g key={x}><rect x={x} y={i===0?35:89} width="36" height="29" rx="6" fill="white" /><path d={`M${x+10} ${i===0?49:103}h16`} /></g>)}
          <path d="M141 49h16v54m20 0h35m-7-6 7 6-7 6" strokeOpacity=".7" />
        </g>
      )}
      {motif === "critical-branches" && (
        <g data-critical-branches="true">
          <rect x="84" y="54" width="59" height="46" rx="8" fill="white" />
          <path d="M98 68h30m-30 12h20m15-3h45m0-32v64m0-64h35m-35 64h35" strokeOpacity=".6" />
          <rect x="216" y="28" width="65" height="35" rx="7" fill="currentColor" fillOpacity=".12" />
          <rect x="216" y="92" width="65" height="35" rx="7" fill="white" />
          <path d="m235 45 8 7 15-17m-21 67 16 16m0-16-16 16" />
        </g>
      )}
      {motif === "critical-evidence" && (
        <g data-critical-evidence="true">
          <rect x="87" y="31" width="103" height="94" rx="9" fill="white" strokeOpacity=".5" />
          <path d="M102 49h70m-70 19h43m-43 19h57m-57 19h31" strokeOpacity=".4" />
          <circle cx="228" cy="74" r="28" fill="currentColor" fillOpacity=".1" />
          <path d="m249 95 24 25m-58-43 9 9 19-22" />
        </g>
      )}
      {motif === "word-outline" && (
        <g data-word-outline="true">
          <rect x="82" y="29" width="69" height="99" rx="7" fill="white" strokeOpacity=".5" />
          <rect x="181" y="29" width="107" height="99" rx="7" fill="white" strokeOpacity=".5" />
          <path d="M94 47h42m-35 20h35m-35 17h35m-42 23h42m63-60h72m-72 17h53m-43 17h43m-53 17h72" strokeOpacity=".5" />
          <path d="M151 65h28m-7-6 7 6-7 6" />
          <rect x="195" y="108" width="74" height="8" rx="3" fill="currentColor" fillOpacity=".18" stroke="none" />
        </g>
      )}
      {motif === "word-revision-layers" && (
        <g data-word-revision-layers="true">
          <rect x="93" y="30" width="94" height="91" rx="7" fill="white" strokeOpacity=".35" />
          <rect x="107" y="43" width="94" height="91" rx="7" fill="white" />
          <path d="M121 61h64m-64 19h45m-45 19h64m-64 18h36m-41-41h58" strokeOpacity=".5" />
          <rect x="225" y="49" width="60" height="39" rx="7" fill="currentColor" fillOpacity=".1" />
          <path d="m240 66 7 7 17-16m-39 41h45m-22-5 0 10" />
        </g>
      )}
      {motif === "project-network" && (
        <g data-project-network="true">
          <path d="M110 77h24l16-32h47l20 32h29m-112 0 16 35h47l20-35" strokeOpacity=".6" />
          <rect x="79" y="64" width="32" height="26" rx="6" fill="white" />
          <rect x="153" y="31" width="41" height="27" rx="6" fill="white" />
          <rect x="153" y="99" width="41" height="27" rx="6" fill="currentColor" fillOpacity=".13" />
          <rect x="246" y="64" width="32" height="26" rx="6" fill="white" />
          <path d="M88 77h14m60-32h23m-23 67h23m61-35h14" strokeOpacity=".5" />
        </g>
      )}
      {motif === "project-response-record" && (
        <g data-project-response-record="true">
          <rect x="99" y="28" width="165" height="104" rx="8" fill="white" />
          <path d="M99 54h165m-165 25h165m-165 25h165m-116-50v78m66-78v78" strokeOpacity=".25" />
          <circle cx="122" cy="67" r="5" fill="currentColor" fillOpacity=".4" stroke="none" />
          <circle cx="122" cy="92" r="5" fill="currentColor" fillOpacity=".15" stroke="none" />
          <path d="M161 67h38m-38 25h27m-27 24h35m31-50 5 5 12-12m-17 30h17m-17 25h17" />
        </g>
      )}
      {motif === "rizz-dialogue-thread" && (
        <g data-rizz-dialogue-thread="true">
          <path d="M93 30h106a9 9 0 0 1 9 9v30a9 9 0 0 1-9 9h-66l-15 14V78H93a9 9 0 0 1-9-9V39a9 9 0 0 1 9-9Z" fill="white" />
          <path d="M177 88h94a9 9 0 0 1 9 9v23a9 9 0 0 1-9 9h-11v12l-14-12h-69a9 9 0 0 1-9-9V97a9 9 0 0 1 9-9Z" fill="currentColor" fillOpacity=".12" />
          <path d="M101 47h73m-73 15h46m38 41h69m-69 12h44M148 78l19 10" strokeOpacity=".5" />
        </g>
      )}
      {motif === "rizz-invitation-choice" && (
        <g data-rizz-invitation-choice="true">
          <rect x="95" y="30" width="73" height="95" rx="7" fill="white" />
          <path d="M95 53h73m-59-29v13m31-13v13m-28 31h12m10 0h12m-34 18h12m10 0h12m22-9h22m-8-7 8 7-8 7" strokeOpacity=".5" />
          <rect x="214" y="39" width="65" height="25" rx="12" fill="currentColor" fillOpacity=".1" />
          <rect x="214" y="77" width="65" height="25" rx="12" fill="white" />
          <path d="m238 49 5 5 9-10m-14 45h14" />
        </g>
      )}
      {motif === "finance-cash-ledger" && (
        <g data-finance-cash-ledger="true">
          <rect x="82" y="26" width="111" height="113" rx="8" fill="white" />
          <path d="M99 48h77m-77 22h24m25 0h28m-77 20h24m25 0h28m-77 20h77m-26-52v63" strokeOpacity=".45" />
          <circle cx="117" cy="124" r="5" fill="currentColor" fillOpacity=".16" />
          <path d="M151 124h25" />
        </g>
      )}
      {motif === "finance-compound-steps" && (
        <g data-finance-compound-steps="true">
          <path d="M214 129h88m-80-6V98h20v25m10 0V77h20v46m10 0V53h20v70" fill="currentColor" fillOpacity=".12" />
          <path d="m219 81 32-25 34-18m-10-2 10 2-3 10" strokeOpacity=".6" />
          <circle cx="228" cy="143" r="6" fill="white" /><circle cx="244" cy="143" r="6" fill="white" />
        </g>
      )}
      {motif === "ai-evidence-flow" && (
        <g data-ai-evidence-flow="true">
          <rect x="63" y="38" width="67" height="90" rx="8" fill="white" />
          <path d="M78 59h37M78 77h28m-28 18h37m15-12h31m-9-7 9 7-9 7" strokeOpacity=".55" />
          <rect x="167" y="53" width="53" height="63" rx="9" fill="currentColor" fillOpacity=".14" />
          <circle cx="184" cy="76" r="4" fill="white" /><circle cx="204" cy="91" r="4" fill="white" />
          <path d="m187 79 13 9m-10 11 11-19m19 3h24m-8-7 8 7-8 7" strokeOpacity=".55" />
        </g>
      )}
      {motif === "ai-schema-check" && (
        <g data-ai-schema-check="true">
          <rect x="250" y="38" width="62" height="90" rx="8" fill="white" />
          <path d="m266 60-7 8 7 8m29-16 7 8-7 8m-18-20-5 24m-5 22 8 8 17-20" />
          <circle cx="303" cy="126" r="14" fill="white" /><path d="m297 126 4 4 8-9" />
        </g>
      )}
      {motif === "zodiac-twelve-seals" && (
        <g data-zodiac-twelve-seals="true">
          <circle cx="143" cy="83" r="52" fill="none" strokeOpacity=".22" />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = index * Math.PI / 6 - Math.PI / 2;
            const x = 143 + Math.cos(angle) * 52, y = 83 + Math.sin(angle) * 52;
            return <g key={index}><rect x={x - 9} y={y - 10} width="18" height="20" rx="4" fill="white" /><path d={`M${x - 3} ${y - 4}h6m-6 4h6m-6 4h4`} strokeOpacity=".65" /></g>;
          })}
          <path d="m127 79 5-14 9 10 10-7 7 11-6 17h-19zm7 2h1m12 0h1m-11 7h8" fill="white" />
        </g>
      )}
      {motif === "zodiac-story-pages" && (
        <g data-zodiac-story-pages="true">
          <path d="M223 43q25-8 48 4v76q-23-12-48-4zm48 4q23-12 48-4v76q-25-8-48 4z" fill="white" />
          <path d="M236 60h20m-20 13h20m-20 13h13m37-29h18m-18 13h18m-18 13h12" strokeOpacity=".5" />
          <circle cx="299" cy="103" r="9" fill="currentColor" fillOpacity=".15" /><path d="m295 103 3 3 6-7" />
        </g>
      )}
      {motif === "service-listening-desk" && (
        <g data-service-listening-desk="true">
          <path d="M77 77v-8a30 30 0 0 1 60 0v8" fill="none" strokeWidth="4" />
          <rect x="71" y="72" width="13" height="28" rx="6" fill="white" />
          <rect x="130" y="72" width="13" height="28" rx="6" fill="white" />
          <path d="M137 100q0 17-25 17" fill="none" /><rect x="102" y="113" width="12" height="7" rx="3" fill="white" />
          <path d="M158 42h48a7 7 0 0 1 7 7v26h-24l-11 10V75h-20z" fill="white" />
          <path d="M169 54h29m-29 10h20" strokeOpacity=".5" />
        </g>
      )}
      {motif === "service-ticket-states" && (
        <g data-service-ticket-states="true">
          <rect x="237" y="33" width="77" height="102" rx="9" fill="white" />
          <path d="M252 52h47m-47 10h28m-16 18h35m-35 18h35m-35 18h35" strokeOpacity=".5" />
          <circle cx="253" cy="80" r="4" fill="currentColor" fillOpacity=".4" />
          <circle cx="253" cy="98" r="4" fill="white" /><path d="m250 98 2 2 4-5" />
          <circle cx="253" cy="116" r="4" fill="none" strokeDasharray="2 2" />
        </g>
      )}
      {motif === "german-case-tabs" && (
        <g data-german-case-tabs="true">
          {["der", "den", "dem"].map((label, index) => <g key={label}>
            <rect x={62 + index * 49} y={49 + index * 8} width="44" height="51" rx="7" fill="white" />
            <text x={84 + index * 49} y={78 + index * 8} fill="currentColor" stroke="none" textAnchor="middle" fontSize="12" fontWeight="600">{label}</text>
          </g>)}
          <path d="M72 121h125" strokeOpacity=".35" />
        </g>
      )}
      {motif === "german-clause-brackets" && (
        <g data-german-clause-brackets="true">
          <rect x="231" y="34" width="87" height="101" rx="8" fill="white" />
          <path d="M245 51h58m-58 10h41m-39 17h-5v29h5m52-29h5v29h-5" strokeOpacity=".5" />
          <rect x="251" y="81" width="13" height="11" rx="2" fill="currentColor" fillOpacity=".15" />
          <path d="M269 87h22m-38 12h36m-39 22h45" strokeOpacity=".5" />
        </g>
      )}
      {motif === "star-story-panels" && (
        <g data-star-story-panels="true">
          <path d="M76 46q32-8 64 4v74q-32-12-64-4zm64 4q32-12 64-4v74q-32-8-64 4z" fill="white" />
          <path d="M88 61h36m-36 10h26m-26 11h33m-33 11h19m50-29 11-9 12 15 10-8" strokeOpacity=".6" />
          <circle cx="157" cy="64" r="3" fill="currentColor" /><circle cx="168" cy="55" r="3" fill="currentColor" /><circle cx="180" cy="70" r="3" fill="currentColor" />
          <path d="M153 88h36m-36 10h25m-25 10h18" strokeOpacity=".45" />
        </g>
      )}
      {motif === "star-open-ending" && (
        <g data-star-open-ending="true">
          <rect x="224" y="53" width="48" height="61" rx="5" fill="white" />
          <rect x="281" y="62" width="43" height="52" rx="5" fill="white" />
          <path d="m239 77 4-8 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6z" fill="currentColor" fillOpacity=".15" />
          <path d="M291 76h23m-23 11h18m-18 11h12m-63 30h59" strokeOpacity=".5" />
          <path d="m254 125 5 3-5 3m47-6 5 3-5 3" />
        </g>
      )}
      {motif === "love-four-entries" && (
        <g data-love-four-entries="true">
          <rect x="86" y="27" width="56" height="45" rx="9" fill="white" />
          <rect x="158" y="27" width="56" height="45" rx="9" fill="white" />
          <rect x="86" y="88" width="56" height="45" rx="9" fill="white" />
          <rect x="158" y="88" width="56" height="45" rx="9" fill="white" />
          <path d="M99 40h29v15h-17l-8 7v-7h-4zm6 7h17m51-7h25v16h-9l-7 6v-6h-9m6-9 4 4 8-8" strokeOpacity=".75" />
          <path d="M106 100v20m12-20v20m54 1v-8q14-20 28 0v8m-28-8h28" />
          <path d="M146 49h8m-8 62h8m-40-35v8m72-8v8" strokeOpacity=".25" />
        </g>
      )}
      {motif === "love-dialogue-check" && (
        <g data-love-dialogue-check="true">
          <path d="M237 46h57q8 0 8 8v23q0 8-8 8h-24l-15 12V85h-18q-8 0-8-8V54q0-8 8-8z" fill="white" />
          <path d="M244 59h43m-43 12h27m15 35 6 6 13-16" strokeOpacity=".7" />
          <circle cx="266" cy="118" r="9" fill="currentColor" fillOpacity=".12" />
        </g>
      )}
      {motif === "scenario-rule-cards" && (
        <g data-scenario-rule-cards="true">
          <rect x="62" y="36" width="129" height="98" rx="9" fill="white" />
          <path d="M78 55h91m-91 13h64" strokeOpacity=".35" />
          {[0, 1, 2].map(index => <g key={index}>
            <circle cx="82" cy={85 + index * 16} r="3" fill="currentColor" fillOpacity=".45" />
            <path d={`M94 ${85 + index * 16}h${64 - index * 12}`} strokeOpacity=".45" />
          </g>)}
        </g>
      )}
      {motif === "scenario-option-check" && (
        <g data-scenario-option-check="true">
          <path d="M199 85h19m-7-5 7 5-7 5" strokeOpacity=".45" />
          {[0, 1, 2].map(index => <g key={index}>
            <rect x="232" y={39 + index * 34} width="83" height="26" rx="6" fill="white" />
            <path d={`M246 ${52 + index * 34}h32`} strokeOpacity=".4" />
            {index === 1 ? <path d="m287 85 4 4 8-10" /> : <circle cx="293" cy={52 + index * 34} r="4" strokeOpacity=".25" />}
          </g>)}
        </g>
      )}
      {motif === "values-paired-rails" && (
        <g data-values-paired-rails="true">
          {[0, 1, 2, 3].map(index => <g key={index}>
            <path d={`M65 ${48 + index * 24}h133`} strokeOpacity=".35" />
            <circle cx="65" cy={48 + index * 24} r="5" fill="white" />
            <circle cx="198" cy={48 + index * 24} r="5" fill="white" />
            <rect x={105 + (index % 2) * 30} y={42 + index * 24} width="10" height="12" rx="3" fill="currentColor" fillOpacity=".55" />
          </g>)}
        </g>
      )}
      {motif === "values-linked-statements" && (
        <g data-values-linked-statements="true">
          <rect x="247" y="42" width="64" height="91" rx="8" fill="white" />
          <path d="M260 59h37m-37 12h25m-25 17h36m-36 12h24m-24 16h35M239 72l-19-12m19 31-19 12" strokeOpacity=".4" />
          <circle cx="220" cy="60" r="3" fill="currentColor" fillOpacity=".35" />
          <circle cx="220" cy="103" r="3" fill="currentColor" fillOpacity=".35" />
        </g>
      )}
      {motif === "relationship-shared-table" && (
        <g data-relationship-shared-table="true">
          <rect x="69" y="49" width="117" height="82" rx="15" fill="white" />
          <path d="M91 113V67h24v46l-12-9zm43-42h35m-35 14h25m-25 14h35" strokeOpacity=".55" />
          <circle cx="128" cy="38" r="8" fill="currentColor" fillOpacity=".25" />
          <path d="M96 142h62" strokeOpacity=".3" />
        </g>
      )}
      {motif === "relationship-personal-paths" && (
        <g data-relationship-personal-paths="true">
          <path d="M236 133V90q0-20 20-20h38M236 90q0-36 20-36h38M284 45l10 9-10 9m0-2 10 9-10 9" strokeOpacity=".5" />
          <circle cx="236" cy="137" r="7" fill="white" />
          <path d="M261 111h38m-38 11h25" strokeOpacity=".3" />
        </g>
      )}
      {motif === "typing-final-buffer" && (
        <g data-typing-final-buffer="true">
          <rect x="64" y="37" width="139" height="94" rx="8" fill="white" />
          <path d="M79 56h107m-107 13h78m-78 15h48m7 0h23m-78 17h80" strokeOpacity=".4" />
          <path d="M163 76v17" strokeWidth="3" />
          <rect x="80" y="111" width="90" height="9" rx="3" fill="currentColor" fillOpacity=".13" />
        </g>
      )}
      {motif === "typing-minute-dial" && (
        <g data-typing-minute-dial="true">
          <circle cx="270" cy="84" r="33" fill="white" />
          <path d="M270 57v27l16 8m-25-48h18m-9-6v6" strokeOpacity=".6" />
          <text x="270" y="136" fill="currentColor" stroke="none" textAnchor="middle" fontSize="11">60 s</text>
        </g>
      )}
      {motif === "hexaco-six-lenses" && (
        <g data-hexaco-six-lenses="true">
          {["H", "E", "X", "A", "C", "O"].map((letter, i) => <g key={letter} transform={`translate(${79 + (i % 3) * 44} ${35 + Math.floor(i / 3) * 49})`}>
            <rect width="36" height="41" rx="8" fill="white" strokeOpacity=".5" />
            <text x="18" y="26" textAnchor="middle" fill="currentColor" stroke="none" fontSize="17" fontWeight="600">{letter}</text>
          </g>)}
        </g>
      )}
      {motif === "hexaco-facet-folds" && (
        <g data-hexaco-facet-folds="true">
          <rect x="236" y="38" width="59" height="84" rx="8" fill="white" strokeOpacity=".5" />
          {[54, 72, 90, 108].map(y => <g key={y}><circle cx="248" cy={y} r="2" fill="currentColor" /><path d={`M257 ${y}h25`} strokeOpacity=".45" /></g>)}
          <path d="M217 57h12m-12 42h12" strokeOpacity=".3" />
        </g>
      )}
      {motif === "arrangements-shared-calendar" && (
        <g data-arrangements-shared-calendar="true">
          <rect x="78" y="33" width="123" height="95" rx="10" fill="white" strokeOpacity=".55" />
          <path d="M78 58h123m-96-32v14m69-14v14m-77 34h86m-86 16h86m-86 16h86" strokeOpacity=".35" />
          <rect x="96" y="67" width="35" height="13" rx="4" fill="currentColor" fillOpacity=".18" />
          <rect x="146" y="83" width="36" height="13" rx="4" fill="currentColor" fillOpacity=".08" />
          <path d="M129 107h22" strokeWidth="4" strokeOpacity=".55" />
        </g>
      )}
      {motif === "arrangements-open-window" && (
        <g data-arrangements-open-window="true">
          <rect x="231" y="43" width="63" height="75" rx="8" fill="white" strokeOpacity=".4" />
          <path d="M244 61h36m-36 14h22" strokeOpacity=".6" />
          <path d="M244 94h36m-8-7 8 7-8 7" strokeDasharray="3 5" />
          <path d="M210 78h14" strokeOpacity=".3" />
        </g>
      )}
      {motif === "abstract-position-map" && (
        <g data-abstract-position-map="true">
          <rect x="60" y="32" width="145" height="95" rx="10" fill="white" strokeOpacity=".45" />
          <path d="M78 78h108" strokeOpacity=".2" />
          {[0, 1, 2, 3].map(i => <g key={i}><rect x={77 + i * 29} y="44" width="22" height="22" rx="4" fill="currentColor" fillOpacity={.12 + i * .06} /><circle cx={88 + i * 29} cy="105" r="8" fill="currentColor" fillOpacity={.30 - i * .06} /></g>)}
          <path d="M88 69q0 17 87 25M175 69q0 17-87 25M117 69l29 25m0-25-29 25" strokeOpacity=".55" />
        </g>
      )}
      {motif === "abstract-counterexample" && (
        <g data-abstract-counterexample="true">
          <rect x="228" y="45" width="66" height="28" rx="7" fill="white" strokeOpacity=".35" />
          <rect x="228" y="88" width="66" height="28" rx="7" fill="white" strokeOpacity=".35" />
          <path d="m238 59 4 4 8-9m-11 43 9 9m0-9-9 9m18-43h25m-25 43h25" strokeOpacity=".65" />
        </g>
      )}
      {motif === "secs-two-thermometers" && (
        <g data-secs-two-thermometers="true">
          {[100,155].map((x,i)=><g key={x}><rect x={x} y="27" width="20" height="84" rx="10" fill="white" strokeOpacity=".55" /><circle cx={x+10} cy="117" r="14" fill="white" /><path d={`M${x+10} 115v-${i===0?54:36}`} strokeWidth="7" strokeOpacity=".55" /><path d={`M${x+27} 38h8m-8 19h8m-8 19h8m-8 19h8`} strokeOpacity=".35" /></g>)}
          <path d="M88 141h103" strokeOpacity=".2" />
        </g>
      )}
      {motif === "secs-historical-page" && (
        <g data-secs-historical-page="true">
          <rect x="227" y="39" width="63" height="83" rx="8" fill="white" strokeOpacity=".4" />
          <path d="M240 58h36m-36 14h36m-36 14h22m-22 14h30m-65-20h15" strokeOpacity=".5" />
          <circle cx="279" cy="112" r="10" fill="white" /><path d="M279 106v6h5" strokeOpacity=".6" />
        </g>
      )}
      {motif === "numerical-weighted-table" && (
        <g data-numerical-weighted-table="true">
          <rect x="64" y="33" width="142" height="94" rx="9" fill="white" strokeOpacity=".4" />
          <path d="M64 57h142M109 33v94m48-94v94M64 81h142m-142 23h142" strokeOpacity=".2" />
          {[0, 1, 2].map(i => <g key={i}><rect x="75" y={64 + i * 23} width={16 + i * 8} height="8" rx="2" fill="currentColor" fillOpacity=".45" /><rect x="120" y={64 + i * 23} width={25 - i * 5} height="8" rx="2" fill="currentColor" fillOpacity=".24" /><circle cx="180" cy={68 + i * 23} r="4" fill="currentColor" fillOpacity=".5" /></g>)}
        </g>
      )}
      {motif === "numerical-denominator" && (
        <g data-numerical-denominator="true">
          <rect x="227" y="45" width="68" height="72" rx="9" fill="white" strokeOpacity=".3" />
          <path d="M239 81h44m-42 20h40" strokeOpacity=".55" />
          <rect x="247" y="59" width="28" height="10" rx="3" fill="currentColor" fillOpacity=".4" />
          <rect x="240" y="88" width="42" height="7" rx="2" fill="currentColor" fillOpacity=".2" />
        </g>
      )}
      {motif === "digital-audience-boundary" && (
        <g data-digital-audience-boundary="true">
          <rect x="57" y="32" width="151" height="97" rx="12" fill="white" strokeOpacity=".4" />
          <path d="M72 54h52m-52 10h35" strokeOpacity=".3" />
          <rect x="73" y="76" width="85" height="37" rx="8" fill="currentColor" fillOpacity=".06" strokeDasharray="3 4" />
          {[87, 113, 139].map(x => <g key={x}><circle cx={x} cy="87" r="4" fill="currentColor" fillOpacity=".3" /><path d={`M${x - 6} 103v-4a6 6 0 0 1 12 0v4`} strokeOpacity=".5" /></g>)}
          <rect x="167" y="67" width="26" height="32" rx="5" fill="white" strokeOpacity=".45" />
          <path d="M173 77h14m-14 7h9m-9 7h14" strokeOpacity=".5" />
        </g>
      )}
      {motif === "digital-source-path" && (
        <g data-digital-source-path="true">
          <path d="M231 49h46v21h-46zm0 54h46v21h-46zM254 70v31" fill="white" strokeOpacity=".35" />
          <circle cx="254" cy="87" r="8" fill="white" strokeOpacity=".5" />
          <path d="m250 87 3 3 5-6m-19-26h28m-28 55h28" strokeOpacity=".6" />
        </g>
      )}
      {motif === "age-context-paths" && (
        <g data-age-context-paths="true">
          {[48, 82, 116].map((y, i) => <g key={y}>
            <rect x="52" y={y - 13} width="142" height="26" rx="13" fill="white" strokeOpacity=".3" />
            <circle cx="69" cy={y} r="5" fill="currentColor" fillOpacity={.2 + i * .12} />
            <path d={`M86 ${y}h86`} strokeOpacity=".35" />
            <circle cx={112 + i * 20} cy={y} r="5" fill="white" strokeOpacity=".55" />
          </g>)}
        </g>
      )}
      {motif === "age-shared-decision" && (
        <g data-age-shared-decision="true">
          <rect x="219" y="53" width="57" height="57" rx="12" fill="white" strokeOpacity=".35" />
          <path d="M233 66v10m28-10v10m-28 10h28m-14-7v24" strokeOpacity=".45" />
          <circle cx="239" cy="94" r="3" fill="currentColor" fillOpacity=".3" />
          <circle cx="255" cy="94" r="3" fill="currentColor" fillOpacity=".3" />
        </g>
      )}
      {motif === "entry-source-fields" && (
        <g data-entry-source-fields="true">
          <rect x="50" y="34" width="91" height="100" rx="9" fill="white" strokeOpacity=".35" />
          <path d="M64 50h48" strokeOpacity=".5" />
          {[65, 83, 101, 119].map(y => <g key={y}><path d={`M64 ${y}h62`} strokeOpacity=".25" /><rect x="163" y={y - 8} width="75" height="15" rx="4" fill="white" strokeOpacity=".4" /><path d={`M174 ${y}h40`} strokeOpacity=".45" /></g>)}
          <path d="M145 83h13m-4-4 4 4-4 4" strokeOpacity=".6" />
        </g>
      )}
      {motif === "entry-match-clock" && (
        <g data-entry-match-clock="true">
          <circle cx="263" cy="54" r="14" fill="white" strokeOpacity=".4" />
          <path d="M263 45v10l6 4m-9-23h6" strokeOpacity=".6" />
          <path d="m253 101 7 7 13-16" strokeOpacity=".7" />
        </g>
      )}
      {motif === "cbi-six-seven-modules" && (
        <g data-cbi-six-seven-modules="true"><rect x="50" y="35" width="69" height="101" rx="8" fill="white" strokeOpacity=".4" /><rect x="133" y="35" width="69" height="101" rx="8" fill="white" strokeOpacity=".4" />{[0,1,2,3,4,5].map(i=><path key={`p${i}`} d={`M61 ${53+i*12}h44`} strokeOpacity=".35" />)}{[0,1,2,3,4,5,6].map(i=><g key={`w${i}`}><path d={`M144 ${50+i*11}h44`} strokeOpacity=".35" />{i===6&&<path d="M151 113l-3 3 3 3m-3-3h10" />}</g>)}</g>
      )}
      {motif === "cbi-independent-readings" && (
        <g data-cbi-independent-readings="true"><rect x="231" y="47" width="64" height="34" rx="6" fill="white" strokeOpacity=".4" /><rect x="231" y="98" width="64" height="34" rx="6" fill="white" strokeOpacity=".4" /><path d="M243 59h39m-39 9h25m-25 42h39m-39 9h25" strokeOpacity=".4" /></g>
      )}
      {motif === "positive-room-for-feelings" && (
        <g data-positive-room-for-feelings="true"><rect x="48" y="43" width="112" height="88" rx="16" fill="white" strokeOpacity=".35" /><path d="M70 131v14l18-14M66 66h64M66 81h47" strokeOpacity=".4" /><circle cx="80" cy="108" r="7" fill="currentColor" fillOpacity=".18" /><circle cx="109" cy="108" r="7" fill="currentColor" fillOpacity=".35" /><path d="M126 108h17" strokeOpacity=".4" /></g>
      )}
      {motif === "positive-hope-facts" && (
        <g data-positive-hope-facts="true"><path d="M176 56v78" strokeDasharray="4 5" strokeOpacity=".3" /><rect x="194" y="48" width="85" height="93" rx="9" fill="white" strokeOpacity=".35" /><path d="M211 68h49M211 82h30M211 115h49" strokeOpacity=".4" /><circle cx="218" cy="100" r="5" fill="currentColor" fillOpacity=".3" /><path d="M233 100h27" strokeDasharray="3 4" strokeOpacity=".4" /></g>
      )}
      {motif === "friendfit-two-invitations" && (
        <g data-friendfit-two-invitations="true"><rect x="44" y="42" width="64" height="82" rx="9" fill="white" strokeOpacity=".35" /><rect x="115" y="54" width="64" height="82" rx="9" fill="white" strokeOpacity=".35" /><path d="M59 64h32M59 78h22M130 76h32M130 90h22" strokeOpacity=".4" /><circle cx="77" cy="101" r="7" fill="currentColor" fillOpacity=".2" /><circle cx="148" cy="113" r="7" fill="currentColor" fillOpacity=".35" /></g>
      )}
      {motif === "friendfit-shared-plan" && (
        <g data-friendfit-shared-plan="true"><path d="M190 88h18m-5-5 5 5-5 5" strokeOpacity=".4" /><rect x="223" y="44" width="70" height="92" rx="9" fill="white" strokeOpacity=".35" /><path d="M239 66h37M239 85h37M239 104h37" strokeOpacity=".35" /><path d="m237 120 5 5 10-11" strokeOpacity=".5" /></g>
      )}
      {motif === "saps-required-refined" && (
        <g data-saps-required-refined="true"><rect x="46" y="39" width="92" height="104" rx="10" fill="white" strokeOpacity=".35" /><path d="M63 61h57M63 81h40M63 103h57" strokeOpacity=".35" /><path d="m66 121 5 5 10-12M99 119h21" strokeOpacity=".5" /></g>
      )}
      {motif === "saps-observed-reviewed" && (
        <g data-saps-observed-reviewed="true"><path d="M167 40v105" strokeDasharray="4 5" strokeOpacity=".3" /><rect x="193" y="52" width="90" height="80" rx="10" fill="white" strokeOpacity=".35" /><path d="M209 72h57M209 86h32M209 108h57" strokeOpacity=".35" /><circle cx="265" cy="111" r="19" fill="white" strokeOpacity=".45" /><path d="m279 125 13 13" strokeOpacity=".5" /></g>
      )}
      {motif === "jealousy-thought-loop" && (
        <g data-jealousy-thought-loop="true"><path d="M75 51a34 34 0 1 0 54 28m-10-26a34 34 0 0 0-24-9" strokeOpacity=".4"/><path d="m71 43 5 9-10 4m62 11 3 13 11-5" strokeOpacity=".5"/><rect x="72" y="66" width="37" height="29" rx="8" fill="white" strokeOpacity=".3"/><path d="M81 77h18m-18 8h12" strokeOpacity=".5"/></g>
      )}
      {motif === "jealousy-three-records" && (
        <g data-jealousy-three-records="true"><rect x="179" y="44" width="33" height="89" rx="8" fill="white" strokeOpacity=".3"/><rect x="220" y="44" width="33" height="89" rx="8" fill="white" strokeOpacity=".3"/><rect x="261" y="44" width="33" height="89" rx="8" fill="white" strokeOpacity=".3"/><path d="M189 69h13m-13 12h13m-13 12h13M271 74h13m-13 12h13m-13 12h13" strokeOpacity=".4"/><path d="M229 111V74m8 37V64m8 47V84" strokeOpacity=".45"/></g>
      )}
      {motif === "mote-four-dialogues" && (
        <g data-mote-four-dialogues="true"><rect x="43" y="43" width="61" height="34" rx="13" fill="white" strokeOpacity=".35"/><path d="M57 60h34m-25 9-7 10" strokeOpacity=".45"/><rect x="119" y="58" width="61" height="34" rx="13" fill="white" strokeOpacity=".35"/><path d="M132 75h34m-14 9 7 10" strokeOpacity=".45"/><path d="M48 111h57m-6-5 6 5-6 5M124 126h57m-6-5 6 5-6 5" strokeOpacity=".4"/></g>
      )}
      {motif === "mote-disclosure-window" && (
        <g data-mote-disclosure-window="true"><rect x="220" y="43" width="79" height="92" rx="9" fill="white" strokeOpacity=".35"/><path d="M236 63h46M236 78h31" strokeOpacity=".4"/><rect x="234" y="94" width="21" height="25" rx="5" fill="currentColor" fillOpacity=".12" strokeOpacity=".3"/><path d="M267 98h17m-17 10h11" strokeOpacity=".4"/><circle cx="209" cy="93" r="3" fill="currentColor" fillOpacity=".4"/></g>
      )}
      {motif === "apology-impact-note" && (
        <g data-apology-impact-note="true"><path d="M48 42h109a12 12 0 0 1 12 12v54a12 12 0 0 1-12 12h-51l-22 18v-18H48a12 12 0 0 1-12-12V54a12 12 0 0 1 12-12Z" fill="white" strokeOpacity=".35" /><path d="M55 65h94M55 82h64M55 99h81" strokeOpacity=".4" /><circle cx="148" cy="98" r="6" fill="currentColor" fillOpacity=".3" /></g>
      )}
      {motif === "apology-repair-plan" && (
        <g data-apology-repair-plan="true"><path d="M185 89h22m-6-6 6 6-6 6" strokeOpacity=".4" /><rect x="222" y="39" width="75" height="101" rx="8" fill="white" strokeOpacity=".35" /><path d="M235 61h49M235 113h49M235 126h32" strokeOpacity=".35" /><path d="m239 84 7 7 15-16M273 77v17M265 85h16" strokeOpacity=".6" /></g>
      )}
      {motif === "triangle-three-components" && (
        <g data-triangle-three-components="true"><path d="M54 120 104 42 154 120Z" strokeOpacity=".25" strokeDasharray="4 5" /><circle cx="104" cy="42" r="17" fill="white" strokeOpacity=".3" /><circle cx="54" cy="120" r="17" fill="white" strokeOpacity=".3" /><circle cx="154" cy="120" r="17" fill="white" strokeOpacity=".3" /><path d="M98 42h12M54 114v12M148 114l12 12m0-12-12 12" /></g>
      )}
      {motif === "triangle-separate-records" && (
        <g data-triangle-separate-records="true">{[0,1,2].map(i=><g key={i}><rect x={205+i*28} y="55" width="22" height="76" rx="7" fill="white" strokeOpacity=".25" />{[0,1,2,3,4].map(j=><circle key={j} cx={216+i*28} cy={67+j*12} r="2" fill="currentColor" fillOpacity=".3" stroke="none" />)}</g>)}</g>
      )}
      {motif === "friction-context-cards" && (
        <g data-friction-context-cards="true"><rect x="42" y="48" width="60" height="70" rx="9" fill="white" strokeOpacity=".3" /><path d="M55 66h29M55 78h20M55 90h25" strokeOpacity=".4" /><path d="M111 82h16m-5-5 5 5-5 5" strokeOpacity=".35" /><rect x="138" y="58" width="57" height="60" rx="9" fill="white" strokeOpacity=".3" /><path d="M151 76h29M151 88h20" strokeOpacity=".4" /></g>
      )}
      {motif === "friction-personal-boundary" && (
        <g data-friction-personal-boundary="true"><path d="M221 45v91" strokeDasharray="4 5" strokeOpacity=".4" /><circle cx="267" cy="65" r="12" fill="white" strokeOpacity=".35" /><path d="M246 118v-15a21 21 0 0 1 42 0v15" /><path d="M240 133h55" strokeOpacity=".35" /></g>
      )}
      {motif === "lovefight-pause-choice" && (
        <g data-lovefight-pause-choice="true"><rect x="42" y="38" width="140" height="98" rx="16" fill="white" strokeOpacity=".3" /><path d="M60 65h29m-29 12h20m-20 12h25M127 65h35m-35 12h24m-24 12h29" strokeOpacity=".45" /><rect x="99" y="59" width="7" height="34" rx="2" fill="currentColor" stroke="none" /><rect x="113" y="59" width="7" height="34" rx="2" fill="currentColor" stroke="none" /><path d="M63 118h35m29 0h35" strokeDasharray="3 5" strokeOpacity=".4" /><circle cx="111" cy="118" r="6" fill="currentColor" fillOpacity=".15" /></g>
      )}
      {motif === "lovefight-repair-record" && (
        <g data-lovefight-repair-record="true"><rect x="50" y="36" width="124" height="105" rx="12" fill="white" strokeOpacity=".3" />{[60,87,114].map((y,i)=><g key={y}><circle cx="70" cy={y} r="5" fill="currentColor" fillOpacity={i===2?'.12':'.3'} /><path d={`M86 ${y}h65`} strokeOpacity=".3" /></g>)}<path d="M40 76v29m-6-6 6 6 6-6M185 105V76m-6 6 6-6 6 6" strokeOpacity=".5" /></g>
      )}
      {motif === "ctl-six-source-cards" && (
        <g data-ctl-six-source-cards="true">{[7,9,7,8,2,8].map((n,i)=><g key={i} transform={`translate(${47+(i%3)*47} ${36+Math.floor(i/3)*59})`}><rect width="37" height="47" rx="7" fill="white" strokeOpacity=".35" /><path d="M8 12h20m-20 7h14" strokeOpacity=".3" /><text x="18.5" y="37" textAnchor="middle" fontSize="13" fill="currentColor" stroke="none">{n}</text></g>)}</g>
      )}
      {motif === "ctl-reverse-key" && (
        <g data-ctl-reverse-key="true"><rect x="48" y="48" width="128" height="78" rx="13" fill="white" strokeOpacity=".3" /><text x="112" y="81" textAnchor="middle" fontSize="20" fill="currentColor" stroke="none">5 − x</text><path d="M70 101h84m-6-5 6 5-6 5" strokeOpacity=".5" /><circle cx="69" cy="101" r="3" fill="currentColor" /></g>
      )}
      {motif === "adexi-two-keyed-records" && (
        <g data-adexi-two-keyed-records="true">{[9,5].map((n,i)=><g key={n} transform={`translate(${44+i*76} 39)`}><rect width="64" height="101" rx="10" fill="white" strokeOpacity=".3" /><text x="32" y="24" textAnchor="middle" fontSize="16" fill="currentColor" stroke="none">{n}</text>{Array.from({length:n},(_,j)=><circle key={j} cx={17+(j%3)*15} cy={43+Math.floor(j/3)*16} r="3" fill="currentColor" fillOpacity=".35" stroke="none" />)}<path d="M15 90h34" strokeOpacity=".3" /></g>)}</g>
      )}
      {motif === "adexi-action-cue" && (
        <g data-adexi-action-cue="true"><rect x="58" y="48" width="114" height="80" rx="12" fill="white" strokeOpacity=".3" /><path d="M74 67h48m-48 14h36m-36 14h43" strokeOpacity=".4" /><circle cx="149" cy="94" r="11" fill="currentColor" fillOpacity=".1" /><path d="M146 89v10m6-10v10M78 143h70" strokeOpacity=".5" /></g>
      )}
      {motif === "stress-five-observation-notes" && (
        <g data-stress-five-observation-notes="true">{[0,1,2,3,4].map(i=><g key={i}><rect x={54+i*43} y={42+(i%2)*12} width="36" height="74" rx="8" fill="white" strokeOpacity=".3" /><path d={`M${62+i*43} ${58+(i%2)*12}h20m-20 12h14m-14 12h17`} strokeOpacity=".4" /><circle cx={72+i*43} cy={103+(i%2)*12} r="3" fill="currentColor" fillOpacity=".25" /></g>)}</g>
      )}
      {motif === "stress-context-sequence" && (
        <g data-stress-context-sequence="true"><rect x="87" y="35" width="147" height="103" rx="11" fill="white" strokeOpacity=".3" /><path d="M105 52h80M106 74h108m-108 20h108m-108 20h108" strokeOpacity=".25" /><circle cx="122" cy="74" r="5" fill="white" /><circle cx="157" cy="94" r="5" fill="white" /><circle cx="197" cy="114" r="5" fill="white" /><path d="m128 77 23 13m12 7 27 13" strokeOpacity=".5" /></g>
      )}
      {motif === "remote-shared-handover" && (
        <g data-remote-shared-handover="true"><rect x="58" y="49" width="79" height="61" rx="8" fill="white" strokeOpacity=".35" /><path d="M69 65h42m-42 12h29M77 121h43m-22-10v10" strokeOpacity=".45" /><rect x="193" y="49" width="73" height="61" rx="8" fill="white" strokeOpacity=".35" /><path d="M206 65h37m-37 12h27M204 121h50m-24-10v10M144 79h40m-7-6 7 6-7 6" strokeOpacity=".5" /><circle cx="162" cy="51" r="9" fill="white" strokeOpacity=".35" /><path d="M158 51h8m-4-4v8" strokeOpacity=".5" /></g>
      )}
      {motif === "remote-contact-window" && (
        <g data-remote-contact-window="true"><rect x="88" y="40" width="144" height="95" rx="11" fill="white" strokeOpacity=".3" /><path d="M107 59h57M108 83h104m-104 20h104" strokeOpacity=".35" /><rect x="127" y="75" width="55" height="16" rx="6" fill="currentColor" fillOpacity=".15" strokeOpacity=".4" /><path d="M194 96v14m-4-14v14" strokeOpacity=".5" /><circle cx="243" cy="43" r="16" fill="white" strokeOpacity=".4" /><path d="M243 33v10l7 4" strokeOpacity=".55" /></g>
      )}
      {motif === "freelance-scope-deliverable" && (
        <g data-freelance-scope-deliverable="true"><rect x="66" y="30" width="114" height="112" rx="10" fill="white" strokeOpacity=".3" /><path d="M82 50h65m-65 16h48m-48 20h59m-59 17h42m-42 17h55" strokeOpacity=".45" /><rect x="200" y="65" width="58" height="55" rx="7" fill="white" strokeOpacity=".4" /><path d="M211 79h35m-35 12h25M181 91h18m-6-5 6 5-6 5" strokeOpacity=".55" /><circle cx="230" cy="109" r="3" fill="currentColor" fillOpacity=".3" /></g>
      )}
      {motif === "freelance-trial-review" && (
        <g data-freelance-trial-review="true"><rect x="94" y="31" width="133" height="111" rx="11" fill="white" strokeOpacity=".3" /><path d="M114 50h77m-77 16h44M119 88h14v14h-14zm32 0h14v14h-14zm32 0h14v14h-14zM118 122h62m20-7 7 7-7 7" strokeOpacity=".5" /><path d="M77 68c-18 5-19 30-3 39m-1-10 1 10-10-1" strokeOpacity=".45" /></g>
      )}
      {motif === "coping-four-paired-routes" && (
        <g data-coping-four-paired-routes="true">{[0,1,2,3].map(i=><g key={i}><rect x="66" y={29+i*30} width="190" height="23" rx="10" fill="white" strokeOpacity=".25" /><circle cx="78" cy={40.5+i*30} r="4" fill="currentColor" fillOpacity=".22" /><circle cx="244" cy={40.5+i*30} r="4" fill="currentColor" fillOpacity=".4" />{[0,1,2,3,4,5].map(j=><circle key={j} cx={109+j*20} cy={40.5+i*30} r="3" fill="currentColor" fillOpacity=".12" strokeOpacity=".3" />)}</g>)}</g>
      )}
      {motif === "coping-scene-review" && (
        <g data-coping-scene-review="true"><rect x="95" y="31" width="133" height="108" rx="12" fill="white" strokeOpacity=".3" /><path d="M114 50h74m-74 14h45M160 76v15m0 0-27 16m27-16 27 16m-54 0v13m54-13v13" strokeOpacity=".5" /><circle cx="133" cy="124" r="5" fill="currentColor" fillOpacity=".2" /><circle cx="187" cy="124" r="5" fill="currentColor" fillOpacity=".2" /><path d="M76 84H55m7-6-7 6 7 6M244 84h21m-7-6 7 6-7 6" strokeOpacity=".45" /></g>
      )}
      {motif === "habit-five-observation-cards" && (
        <g data-habit-five-observation-cards="true">{[0,1,2,3,4].map(i=><g key={i}><rect x={47+i*45} y={40+(i%2)*13} width="35" height="80" rx="8" fill="white" strokeOpacity=".32" /><circle cx={64.5+i*45} cy={58+(i%2)*13} r="5" fill="currentColor" fillOpacity=".18" /><path d={`M${57+i*45} ${77+(i%2)*13}h15m-15 11h15m-15 11h9`} strokeOpacity=".4" /></g>)}</g>
      )}
      {motif === "habit-cue-notebook" && (
        <g data-habit-cue-notebook="true"><rect x="114" y="36" width="108" height="101" rx="11" fill="white" strokeOpacity=".35" /><path d="M133 56h68m-68 20h32m-32 19h53m-53 19h42M126 30v13m15-13v13m15-13v13m15-13v13m15-13v13m15-13v13" strokeOpacity=".45" /><circle cx="72" cy="82" r="21" fill="currentColor" fillOpacity=".08" /><path d="M69 73v11h10m15-2h17m-5-5 5 5-5 5" strokeOpacity=".6" /></g>
      )}
      {motif === "intimacy-four-windows" && (
        <g data-intimacy-four-windows="true">{[[81,34],[151,34],[81,96],[151,96]].map(([x,y],i)=><rect key={i} x={x} y={y} width="57" height="47" rx="9" fill={i===1?"currentColor":"white"} fillOpacity={i===1?".12":"1"} strokeOpacity=".3" />)}<path d="M94 47h29v17h-18l-7 7v-7h-4V47Z" strokeOpacity=".65" /><circle cx="173" cy="55" r="7" strokeOpacity=".65" /><circle cx="188" cy="60" r="7" strokeOpacity=".4" /><path d="M96 109v20m10-20v20m-17-13h35m-11-7v20M169 108h25v22h-25zM176 108v-4a6 6 0 0 1 12 0v4" strokeOpacity=".65" /></g>
      )}
      {motif === "intimacy-open-boundary" && (
        <g data-intimacy-open-boundary="true"><path d="M66 118a34 34 0 1 1 50-44m73-30a39 39 0 1 1-35 56" strokeOpacity=".35" /><circle cx="88" cy="89" r="8" fill="white" /><circle cx="186" cy="87" r="8" fill="currentColor" fillOpacity=".16" /><path d="M119 87h36m-8-5 8 5-8 5M137 65v9m0 26v9" strokeOpacity=".6" /><rect x="223" y="64" width="48" height="43" rx="9" fill="white" strokeOpacity=".3" /><path d="m236 87 7 7 14-16" strokeOpacity=".5" /></g>
      )}
      {motif === "natal-position-wheel" && (
        <g data-natal-position-wheel="true"><circle cx="147" cy="87" r="57" fill="white" strokeOpacity=".4" /><circle cx="147" cy="87" r="39" strokeOpacity=".3" />{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <path key={i} d={`M${147+Math.cos(a)*39} ${87+Math.sin(a)*39}L${147+Math.cos(a)*57} ${87+Math.sin(a)*57}`} strokeOpacity=".45" />;})}<path d="m98 62 87 58-15-69-72 11" strokeOpacity=".3" />{[[98,62],[185,120],[170,51]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="6" fill="currentColor" fillOpacity={.25+i*.2} stroke="white" />)}<circle cx="147" cy="87" r="7" fill="currentColor" fillOpacity=".12" /><path d="M213 87h30m-7-5 7 5-7 5" strokeOpacity=".5" /></g>
      )}
      {motif === "natal-time-location-card" && (
        <g data-natal-time-location-card="true"><rect x="52" y="46" width="102" height="84" rx="11" fill="white" strokeOpacity=".3" /><circle cx="102" cy="86" r="23" strokeOpacity=".5" /><path d="M102 71v15l12 8m-38-54v10m51-10v10M199 47v80m-32-40h64m-51-26 38 52m-38 0 38-52" strokeOpacity=".5" /><ellipse cx="199" cy="87" rx="31" ry="40" strokeOpacity=".25" /><circle cx="199" cy="87" r="6" fill="currentColor" fillOpacity=".3" /></g>
      )}
      {motif === "nine-star-calendar-cycle" && (
        <g data-nine-star-calendar-cycle="true"><circle cx="139" cy="87" r="47" fill="white" strokeOpacity=".25" />{Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9-Math.PI/2;return <g key={i}><circle cx={139+Math.cos(a)*47} cy={87+Math.sin(a)*47} r="10" fill="white" strokeOpacity=".4" /><text x={139+Math.cos(a)*47} y={91+Math.sin(a)*47} textAnchor="middle" fill="currentColor" stroke="none" fontSize="11">{i+1}</text></g>;})}<path d="M127 84h24m-24 8h17" strokeOpacity=".35" /></g>
      )}
      {motif === "nine-star-boundary-notes" && (
        <g data-nine-star-boundary-notes="true"><rect x="49" y="47" width="111" height="84" rx="10" fill="white" strokeOpacity=".3" /><path d="M49 68h111m-86-27v13m60-13v13M104 81v37M65 96h26m-6-5 6 5-6 5m32-5h26m-6-5 6 5-6 5" strokeOpacity=".45" /><circle cx="104" cy="96" r="4" fill="currentColor" stroke="none" /></g>
      )}
      {motif === "breakup-four-review-notes" && (
        <g data-breakup-four-review-notes="true">{[0,1,2,3].map(i=><g key={i} transform={`translate(${82+(i%2)*74} ${37+Math.floor(i/2)*59})`}><rect width="61" height="48" rx="7" fill="white" strokeOpacity=".35" /><circle cx="13" cy="13" r="4" fill="currentColor" fillOpacity=".25" stroke="none" /><path d="M24 13h24M12 26h36m-36 9h27" strokeOpacity=".35" /></g>)}</g>
      )}
      {motif === "breakup-private-notebook" && (
        <g data-breakup-private-notebook="true"><rect x="41" y="42" width="131" height="93" rx="10" fill="white" strokeOpacity=".3" /><path d="M57 42v93m14-69h80m-80 16h65m-65 16h76m-76 16h48" strokeOpacity=".35" /><circle cx="46" cy="64" r="2" /><circle cx="46" cy="85" r="2" /><circle cx="46" cy="106" r="2" /></g>
      )}
      {motif === "holding-seven-checkins" && (
        <g data-holding-seven-checkins="true">{Array.from({length:7},(_,i)=><g key={i} transform={`translate(${82+(i%4)*34+(i>3?17:0)} ${43+Math.floor(i/4)*52})`}><rect width="27" height="42" rx="6" fill="white" strokeOpacity=".35" /><path d="M7 11h13m-13 7h9" strokeOpacity=".3" />{[0,1,2,3,4].map(j=><circle key={j} cx={7+(j%3)*6} cy={28+Math.floor(j/3)*6} r="1.5" fill="currentColor" stroke="none" fillOpacity=".4" />)}</g>)}</g>
      )}
      {motif === "holding-next-action" && (
        <g data-holding-next-action="true"><rect x="44" y="43" width="129" height="93" rx="12" fill="white" strokeOpacity=".3" /><path d="M60 62h78m-78 14h52m-52 14h65M72 114h72m-7-6 7 6-7 6" strokeOpacity=".4" /><circle cx="61" cy="114" r="5" fill="currentColor" fillOpacity=".2" stroke="none" /></g>
      )}
      {motif === "fscrs-three-response-notes" && (
        <g data-fscrs-three-response-notes="true">{[9,5,8].map((n,i)=><g key={n} transform={`translate(${81+i*48} ${38+(i%2)*10})`}><rect width="41" height="98" rx="8" fill="white" strokeOpacity=".3" /><text x="20.5" y="28" textAnchor="middle" fontSize="17" fill="currentColor" stroke="none">{n}</text>{[0,1,2].map(j=><path key={j} d={`M10 ${47+j*12}h${j===2?14:21}`} strokeOpacity=".3" />)}</g>)}</g>
      )}
      {motif === "fscrs-support-message" && (
        <g data-fscrs-support-message="true"><path d="M54 46h109a10 10 0 0 1 10 10v57a10 10 0 0 1-10 10h-56l-21 16v-16H54a10 10 0 0 1-10-10V56a10 10 0 0 1 10-10Z" fill="white" strokeOpacity=".3" /><path d="M63 66h65m-65 14h88m-88 14h57" strokeOpacity=".4" /><circle cx="149" cy="107" r="14" fill="white" strokeOpacity=".3" /><path d="M143 107h12m-6-6v12" strokeOpacity=".5" /></g>
      )}
      {motif === "parenting-listening-pair" && (
        <g data-parenting-listening-pair="true"><circle cx="111" cy="80" r="14" fill="white" strokeOpacity=".4" /><path d="M88 138v-21a23 23 0 0 1 46 0v21" fill="white" strokeOpacity=".4" /><circle cx="190" cy="101" r="11" fill="white" strokeOpacity=".4" /><path d="M172 138v-9a18 18 0 0 1 36 0v9" fill="white" strokeOpacity=".4" /><path d="M145 43h59a8 8 0 0 1 8 8v19a8 8 0 0 1-8 8h-35l-13 10V78h-11a8 8 0 0 1-8-8V51a8 8 0 0 1 8-8Z" fill="white" strokeOpacity=".3" /><path d="M150 55h48m-48 11h30M135 112l23 12 13-8" strokeOpacity=".45" /></g>
      )}
      {motif === "parenting-routine-steps" && (
        <g data-parenting-routine-steps="true"><path d="M58 61v58h93" strokeOpacity=".25" strokeDasharray="3 5" />{[0,1,2].map(i=><g key={i} transform={`translate(${47+i*34} ${43+i*28})`}><rect width="38" height="32" rx="7" fill="white" strokeOpacity=".35" /><path d="M9 11h20m-20 9h13" strokeOpacity=".4" /></g>)}<circle cx="147" cy="45" r="14" fill="white" strokeOpacity=".35" /><path d="M147 36v10l7 4" strokeOpacity=".45" /></g>
      )}
      {motif === "spq-perception-record" && (
        <g data-spq-perception-record="true"><rect x="81" y="31" width="142" height="119" rx="12" fill="white" strokeOpacity=".3" /><path d="M96 47h76m-76 13h48" strokeOpacity=".4" />{[0,1,2,3,4].map(i=><g key={i} transform={`translate(96 ${78+i*12})`}><circle r="2.5" fill="currentColor" stroke="none" fillOpacity=".4" /><path d={`M11 0h${38+i*7}`} strokeOpacity=".3" />{[0,1,2,3].map(j=><rect key={j} x={77+j*10} y="-3" width="6" height="6" rx="2" fill={j===i%4?"currentColor":"white"} fillOpacity={j===i%4?".5":"1"} strokeOpacity=".2" />)}</g>)}</g>
      )}
      {motif === "spq-response-key" && (
        <g data-spq-response-key="true"><rect x="44" y="42" width="118" height="95" rx="11" fill="white" strokeOpacity=".3" />{[0,1,2,3].map(i=><g key={i}><circle cx={64+i*25} cy="66" r="7" fill="currentColor" fillOpacity={.15+i*.12} strokeOpacity=".2" /><circle cx={64+i*25} cy="113" r="7" fill="currentColor" fillOpacity={.51-i*.12} strokeOpacity=".2" /><path d={`M${64+i*25} 80v17m-3-3 3 3 3-3`} strokeOpacity=".35" /></g>)}</g>
      )}
      {motif === "competency-six-work-records" && (
        <g data-competency-six-work-records="true">{[0,1,2,3,4,5].map(i=><g key={i} transform={`translate(${81+(i%3)*55} ${38+Math.floor(i/3)*65})`}><rect width="45" height="53" rx="7" fill="white" strokeOpacity=".3" /><circle cx="13" cy="13" r="4" fill="currentColor" fillOpacity=".25" stroke="none" /><path d="M23 13h11M11 26h23m-23 9h17" strokeOpacity=".4" /><path d="m12 43 4 3 7-7" strokeOpacity=".55" /></g>)}</g>
      )}
      {motif === "competency-shared-output" && (
        <g data-competency-shared-output="true"><path d="M47 58h37m42 0h37M69 116h72" strokeOpacity=".35" strokeDasharray="4 5" /><rect x="82" y="40" width="46" height="37" rx="7" fill="white" strokeOpacity=".4" /><path d="M93 53h24m-24 10h17" strokeOpacity=".45" /><circle cx="52" cy="117" r="18" fill="white" strokeOpacity=".4" /><circle cx="158" cy="117" r="18" fill="white" strokeOpacity=".4" /><path d="m82 77-20 24m66-24 20 24M46 117l4 4 8-9m94 5 4 4 8-9" strokeOpacity=".55" /></g>
      )}
      {motif === "hsp-four-context-notes" && (
        <g data-hsp-four-context-notes="true">{[0,1,2,3].map(i=><g key={i} transform={`translate(${44+(i%2)*67} ${34+Math.floor(i/2)*65})`}><rect width="56" height="55" rx="9" fill="white" strokeOpacity=".3" /><path d="M12 14h31" strokeOpacity=".35" />{[0,1,2,3,4,5].map(j=><circle key={j} cx={15+(j%3)*13} cy={29+Math.floor(j/3)*12} r="2.5" fill="currentColor" fillOpacity=".35" stroke="none" />)}</g>)}</g>
      )}
      {motif === "hsp-open-interpretation" && (
        <g data-hsp-open-interpretation="true"><path d="M55 49h103a10 10 0 0 1 10 10v46a10 10 0 0 1-10 10h-45l-19 18v-18H55a10 10 0 0 1-10-10V59a10 10 0 0 1 10-10Z" fill="white" strokeOpacity=".3" /><path d="M63 68h67m-67 14h43" strokeOpacity=".4" /><circle cx="140" cy="88" r="16" fill="white" strokeOpacity=".4" /><path d="m152 101 15 15M137 84c0-6 8-6 8-1 0 4-5 3-5 7m0 5v1" strokeOpacity=".6" /></g>
      )}
      {motif === "conflict-two-proposals" && (
        <g data-conflict-two-proposals="true"><rect x="48" y="40" width="62" height="83" rx="9" fill="white" strokeOpacity=".35" /><rect x="117" y="52" width="62" height="83" rx="9" fill="white" strokeOpacity=".35" /><path d="M61 59h35M61 72h25M61 85h30M130 71h35M130 84h25M130 97h30" strokeOpacity=".4" /><circle cx="79" cy="143" r="5" fill="currentColor" fillOpacity=".2" /><circle cx="148" cy="151" r="5" fill="currentColor" fillOpacity=".2" /></g>
      )}
      {motif === "conflict-open-option" && (
        <g data-conflict-open-option="true"><path d="M191 86h19m-5-5 5 5-5 5" strokeOpacity=".4" /><rect x="225" y="47" width="64" height="83" rx="9" fill="white" strokeOpacity=".35" /><path d="M239 65h35M239 78h22M239 91h30M251 104v14m-7-7h14" strokeOpacity=".4" /></g>
      )}
      {motif === "comm-audience-message" && (
        <g data-comm-audience-message="true"><rect x="53" y="34" width="101" height="74" rx="10" fill="white" strokeOpacity=".35" /><path d="m74 108-8 15 28-15M68 53h68M68 66h48M68 80h60" strokeOpacity=".4" /><circle cx="72" cy="143" r="8" fill="currentColor" fillOpacity=".2" /><circle cx="101" cy="143" r="8" fill="currentColor" fillOpacity=".12" /><circle cx="130" cy="143" r="8" fill="currentColor" fillOpacity=".2" /></g>
      )}
      {motif === "comm-channel-record" && (
        <g data-comm-channel-record="true"><path d="M166 84h24m-5-5 5 5-5 5" strokeOpacity=".4" /><rect x="205" y="39" width="82" height="98" rx="10" fill="white" strokeOpacity=".35" /><path d="M219 56h45M219 70h51M219 84h30M221 110l7 7 17-19M253 111h19" strokeOpacity=".45" /></g>
      )}
      {motif === "scs-six-balanced-parts" && (
        <g data-scs-six-balanced-parts="true"><circle cx="111" cy="85" r="48" fill="white" strokeOpacity=".3" /><path d="M111 37v96M69 61l84 48M69 109l84-48" strokeOpacity=".25" />{[0,1,2,3,4,5].map(i=><circle key={i} cx={111+Math.cos(i*Math.PI/3)*31} cy={85+Math.sin(i*Math.PI/3)*31} r="9" fill="currentColor" fillOpacity={i%2===0?'.2':'.07'} strokeOpacity=".3" />)}<circle cx="111" cy="85" r="11" fill="white" strokeOpacity=".4" /></g>
      )}
      {motif === "scs-reflection-note" && (
        <g data-scs-reflection-note="true"><path d="M171 85h23m-5-5 5 5-5 5" strokeOpacity=".4" /><rect x="209" y="40" width="74" height="92" rx="9" fill="white" strokeOpacity=".35" /><path d="M223 58h45m-45 13h34m-34 15h45m-45 13h27" strokeOpacity=".3" /><path d="M232 116q14-11 28 0" fill="none" strokeOpacity=".5" /></g>
      )}
      {motif === "partner-shared-arrangement" && (
        <g data-partner-shared-arrangement="true"><rect x="54" y="35" width="100" height="99" rx="10" fill="white" strokeOpacity=".4" /><path d="M69 55h67m-67 22h67m-67 22h43" strokeOpacity=".3" /><circle cx="76" cy="118" r="5" fill="currentColor" fillOpacity=".2" stroke="none" /><path d="M90 118h44" strokeOpacity=".4" /><path d="M161 83h31m-6-5 6 5-6 5" strokeOpacity=".5" /></g>
      )}
      {motif === "partner-open-response" && (
        <g data-partner-open-response="true"><path d="M205 39h70a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10h-45l-17 13V99h-8a10 10 0 0 1-10-10V49a10 10 0 0 1 10-10Z" fill="white" strokeOpacity=".4" /><path d="M210 57h55m-55 13h41m-41 13h29" strokeOpacity=".35" /><circle cx="268" cy="123" r="13" fill="currentColor" fillOpacity=".1" strokeOpacity=".3" /><path d="m263 123 4 4 7-9" strokeOpacity=".65" /></g>
      )}
      {motif === "time-capacity-blocks" && (
        <g data-time-capacity-blocks="true"><rect x="58" y="34" width="119" height="102" rx="8" fill="white" strokeOpacity=".4" /><path d="M70 51h95m-95 22h95m-95 22h95m-95 22h95" strokeOpacity=".2" /><rect x="72" y="58" width="54" height="12" rx="3" fill="currentColor" fillOpacity=".16" stroke="none" /><rect x="91" y="80" width="68" height="12" rx="3" fill="currentColor" fillOpacity=".24" stroke="none" /><rect x="72" y="102" width="43" height="12" rx="3" fill="currentColor" fillOpacity=".12" stroke="none" /></g>
      )}
      {motif === "time-return-cue" && (
        <g data-time-return-cue="true"><path d="M191 67h32v18m-5-5 5 5 5-5" strokeOpacity=".5" /><rect x="210" y="93" width="84" height="38" rx="6" fill="white" strokeOpacity=".4" /><path d="M222 105h57m-57 9h38m-38 8h24" strokeOpacity=".4" /><path d="M284 77V50h-49m5-5-5 5 5 5" strokeOpacity=".45" /></g>
      )}
      {motif === "rses-ten-contributions" && (
        <g data-rses-ten-contributions="true">
          {[0, 1].map(row => [0, 1, 2, 3, 4].map(col => <g key={`${row}-${col}`}><rect x={52+col*28} y={43+row*44} width="22" height="32" rx="5" fill="white" strokeOpacity=".45" /><path d={`M${58+col*28} ${54+row*44}h10m-10 7h6`} strokeOpacity=".4" />{row===1 && <path d={`M${60+col*28} 110l-3-3 3-3m-3 3h9`} strokeOpacity=".6" />}</g>))}
        </g>
      )}
      {motif === "rses-one-total" && (
        <g data-rses-one-total="true"><path d="M211 83h16m-6-5 6 5-6 5" strokeOpacity=".5" /><rect x="237" y="42" width="61" height="86" rx="8" fill="white" strokeOpacity=".4" /><path d="M249 60h34m-34 8h22m-22 40h34" strokeOpacity=".35" /><circle cx="258" cy="90" r="5" fill="currentColor" fillOpacity=".15" /><path d="M272 85v10m-5-5h10" strokeOpacity=".6" /></g>
      )}
      {motif === "mfq2-six-readings" && (
        <g data-mfq2-six-readings="true">
          {[60, 108, 156].map(x => [34, 87].map(y => <g key={`${x}-${y}`}><rect x={x} y={y} width="37" height="43" rx="6" fill="white" strokeOpacity=".5" /><circle cx={x+12} cy={y+13} r="4" fill="currentColor" fillOpacity=".14" stroke="none" /><path d={`M${x+9} ${y+25}h19m-19 7h13`} strokeOpacity=".4" /></g>))}
        </g>
      )}
      {motif === "mfq2-two-distributions" && (
        <g data-mfq2-two-distributions="true">
          <rect x="216" y="39" width="81" height="89" rx="9" fill="white" strokeOpacity=".4" />
          {[234, 256, 278].map(x => <g key={x}><path d={`M${x-7} 73h14m-14 37h14`} strokeOpacity=".3" /><circle cx={x} cy="62" r="4" fill="currentColor" fillOpacity=".18" /></g>)}
          <circle cx="234" cy="99" r="4" fill="currentColor" fillOpacity=".18" /><circle cx="256" cy="99" r="4" fill="currentColor" fillOpacity=".18" /><circle cx="256" cy="88" r="4" fill="currentColor" fillOpacity=".18" /><circle cx="278" cy="99" r="4" fill="currentColor" fillOpacity=".18" /><circle cx="278" cy="88" r="4" fill="currentColor" fillOpacity=".18" /><circle cx="278" cy="77" r="4" fill="currentColor" fillOpacity=".18" />
        </g>
      )}
      {motif === "trust-bounded-opening" && (
        <g data-trust-bounded-opening="true">
          <rect x="58" y="34" width="134" height="100" rx="12" fill="white" strokeOpacity=".4" />
          <path d="M79 59h44m-44 12h61m-61 12h32" strokeOpacity=".4" />
          <rect x="133" y="94" width="42" height="23" rx="5" fill="currentColor" fillOpacity=".1" strokeDasharray="3 3" />
          <path d="M109 106h42m-7-6 7 6-7 6" strokeOpacity=".65" />
        </g>
      )}
      {motif === "trust-agreed-review" && (
        <g data-trust-agreed-review="true">
          <rect x="214" y="40" width="79" height="91" rx="9" fill="white" strokeOpacity=".4" />
          <path d="M232 63h43m-43 16h24m-24 16h35" strokeOpacity=".4" />
          <circle cx="232" cy="113" r="5" fill="currentColor" fillOpacity=".15" />
          <path d="M244 113h20m-5-5 5 5-5 5" strokeOpacity=".6" />
        </g>
      )}
      {motif === "liberty-four-pages" && (
        <g data-liberty-four-pages="true">
          {[56, 131].map(x => [35, 92].map(y => <g key={`${x}-${y}`}><rect x={x} y={y} width="60" height="43" rx="6" fill="white" strokeOpacity=".5" /><path d={`M${x + 12} ${y + 13}h27m-27 8h35m-35 8h19`} strokeOpacity=".4" /></g>))}
          <path d="M123 42v85" strokeDasharray="3 5" strokeOpacity=".2" />
        </g>
      )}
      {motif === "liberty-reverse-codes" && (
        <g data-liberty-reverse-codes="true">
          <rect x="221" y="43" width="73" height="77" rx="9" fill="white" strokeOpacity=".4" />
          <circle cx="243" cy="64" r="9" fill="currentColor" fillOpacity=".1" /><circle cx="274" cy="98" r="9" fill="currentColor" fillOpacity=".1" />
          <path d="M240 64h6m-3-3v6M270 98h8m-36-16v16h16m-6-5 6 5-6 5M274 82V64h-17m6-5-6 5 6 5" strokeOpacity=".6" />
        </g>
      )}
      {motif === "spatial-turn-frame" && (
        <g data-spatial-turn-frame="true">
          <path d="M51 118h148m-8-5 8 5-8 5M102 138V25m-5 8 5-8 5 8" strokeOpacity=".35" />
          <path d="M118 98V57h20v22h20v19z" fill="white" strokeOpacity=".7" />
          <path d="M82 102H41V82H63V62H82z" fill="currentColor" fillOpacity=".12" strokeOpacity=".45" />
          <path d="M144 40q-32-17-56 7m0-8v8h8" strokeOpacity=".6" />
        </g>
      )}
      {motif === "spatial-fold-partners" && (
        <g data-spatial-fold-partners="true">
          <rect x="225" y="47" width="76" height="76" rx="3" fill="white" strokeOpacity=".4" />
          <path d="M263 47v76m-38-38h76" strokeDasharray="3 4" strokeOpacity=".35" />
          {[247, 279].map(x => [69, 101].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor" fillOpacity=".35" stroke="none" />))}
        </g>
      )}
      {motif === "mechanics-balance-ratio" && (
        <g data-mechanics-balance-ratio="true">
          <path d="M57 109h130M112 82l-15 27h30z" fill="white" strokeOpacity=".5" />
          <path d="M56 79h132m-107-26v26m-5-6 5 6 5-6m80-20v20m-5-6 5 6 5-6" strokeOpacity=".65" />
          <circle cx="80" cy="39" r="11" fill="white" /><circle cx="165" cy="45" r="7" fill="white" />
          <path d="M72 122h40m0 0h66m-106-4v8m40-8v8m66-8v8" strokeOpacity=".35" />
        </g>
      )}
      {motif === "mechanics-spring-pressure" && (
        <g data-mechanics-spring-pressure="true">
          <path d="M236 32h32m-16 0v9l-9 6 18 9-18 9 18 9-18 9 9 5v12" strokeOpacity=".6" />
          <rect x="243" y="100" width="18" height="18" rx="3" fill="white" strokeOpacity=".4" />
          <path d="M280 112V63m-8 0h16m-8-8v8m-9 0v57h25V83m-8 0h16" strokeOpacity=".35" />
        </g>
      )}
      {motif === "policy-two-axes" && (
        <g data-policy-two-axes="true">
          <rect x="70" y="27" width="128" height="108" rx="7" fill="white" strokeOpacity=".35" />
          {[96, 122, 148, 174].map(x => <path key={x} d={`M${x} 28v106`} strokeOpacity=".12" />)}
          {[54, 81, 108].map(y => <path key={y} d={`M71 ${y}h126`} strokeOpacity=".12" />)}
          <path d="M80 81h108m-6-5 6 5-6 5M134 125V37m-5 6 5-6 5 6" strokeOpacity=".6" />
        </g>
      )}
      {motif === "policy-proposal-pair" && (
        <g data-policy-proposal-pair="true">
          {[55, 86].map(y => <g key={y}><rect x="250" y={y} width="43" height="23" rx="4" fill="white" strokeOpacity=".4" /><path d={`M258 ${y+8}h25m-25 7h16`} strokeOpacity=".4" /></g>)}
        </g>
      )}
      {motif === "commitment-four-notes" && (
        <g data-commitment-four-notes="true">
          {[80, 146].map(x => [34, 86].map(y => <g key={`${x}-${y}`}><rect x={x} y={y} width="54" height="43" rx="7" fill="white" strokeOpacity=".45" /><path d={`M${x+10} ${y+14}h32m-32 10h23`} strokeOpacity=".4" /><circle cx={x+43} cy={y+32} r="3" fill="currentColor" fillOpacity=".25" /></g>))}
        </g>
      )}
      {motif === "commitment-own-choice" && (
        <g data-commitment-own-choice="true">
          <path d="M252 48v60m0-30h31m-7-7 7 7-7 7" strokeOpacity=".5" />
          <circle cx="252" cy="42" r="7" fill="white" /><circle cx="252" cy="115" r="7" fill="white" />
        </g>
      )}
      {motif === "freud-theme-notes" && (
        <g data-freud-theme-notes="true">
          <path d="M58 39h76q12 0 12 10v83q-8-8-20-8H58zm176 0h-76q-12 0-12 10v83q8-8 20-8h68z" fill="white" strokeOpacity=".4" />
          {[58, 76, 94, 112].map(y => <g key={y}><circle cx="74" cy={y} r="3" fill="currentColor" fillOpacity=".3" /><path d={`M85 ${y}h40m41 0h45`} strokeOpacity=".35" /><circle cx="221" cy={y} r="3" fill="currentColor" fillOpacity=".3" /></g>)}
        </g>
      )}
      {motif === "freud-context-window" && (
        <g data-freud-context-window="true">
          <rect x="252" y="70" width="31" height="41" rx="5" fill="white" strokeOpacity=".35" />
          <path d="M259 80h17m-17 9h17m-17 9h11" strokeOpacity=".45" />
          <path d="M247 55h40m-20-7v14" strokeOpacity=".25" />
        </g>
      )}
      {motif === "sql-row-join" && (
        <g data-sql-row-join="true">
          {[88,226].map(x=><g key={x}><rect x={x} y="33" width="62" height="88" rx="7" fill="white" strokeOpacity=".45" /><path d={`M${x} 54h62m-62 23h62m-62 22h62M${x+24} 34v86`} strokeOpacity=".3" /></g>)}
          <path d="M151 66h24l28 22h22m-74 0h24l28-22h22" strokeOpacity=".7" />
          <circle cx="103" cy="66" r="4" fill="currentColor" /><circle cx="241" cy="88" r="4" fill="currentColor" />
        </g>
      )}
      {motif === "sql-window-rows" && (
        <g data-sql-window-rows="true">
          <rect x="92" y="33" width="78" height="88" rx="7" fill="white" strokeOpacity=".45" />
          {[50,72,94].map((y,i)=><g key={y}><path d={`M103 ${y}h52`} strokeOpacity=".3" /><circle cx="113" cy={y+7} r="3" fill="currentColor" fillOpacity={.3+i*.2} /></g>)}
          <path d="M186 44v62m-5-6 5 6 5-6" />
          <rect x="218" y="37" width="63" height="24" rx="5" fill="currentColor" fillOpacity=".12" />
          <rect x="218" y="65" width="63" height="24" rx="5" fill="currentColor" fillOpacity=".24" />
          <rect x="218" y="93" width="63" height="24" rx="5" fill="currentColor" fillOpacity=".36" />
        </g>
      )}
      {motif === "season-swatches" && (
        <g data-season-swatches="true">
          {["#F08C78", "#C390A6", "#AC6346", "#21334E"].map((c,i)=><g key={c} transform={`translate(${88+i*50} 34)`}>
            <rect width="39" height="86" rx="8" fill="white" strokeOpacity=".35" />
            <rect x="5" y="7" width="29" height="47" rx="4" fill={c} stroke="none" />
            <path d="M11 64h17m-17 9h12" strokeOpacity=".5" />
          </g>)}
        </g>
      )}
      {motif === "palette-layout" && (
        <g data-palette-layout="true">
          <rect x="100" y="34" width="76" height="87" rx="8" fill="#F4E9CF" strokeOpacity=".4" />
          <rect x="112" y="48" width="13" height="58" rx="3" fill="#F08C78" stroke="none" />
          <rect x="131" y="48" width="13" height="58" rx="3" fill="#A7C878" stroke="none" />
          <path d="M190 77h16m-6-6 6 6-6 6" strokeOpacity=".5" />
          <rect x="220" y="34" width="60" height="87" rx="8" fill="#F4E9CF" strokeOpacity=".4" />
          <path d="M230 48v59" stroke="#F08C78" strokeWidth="4" />
          <circle cx="255" cy="66" r="9" fill="#A7C878" stroke="none" />
        </g>
      )}
      {motif === "sales-evidence" && (
        <g data-sales-evidence="true">
          <rect x="88" y="28" width="76" height="98" rx="9" fill="white" strokeOpacity=".45" />
          <path d="M103 46h45m-45 21h18m-18 20h18m-18 20h18" strokeOpacity=".5" />
          {[64,84,104].map(y=><path key={y} d={`M133 ${y}l4 4 9-10`} />)}
          <path d="M177 77h24m-6-6 6 6-6 6" strokeOpacity=".6" />
          <rect x="215" y="39" width="65" height="76" rx="9" fill="currentColor" fillOpacity=".12" />
          <path d="M230 57h35m-35 18h35m-35 18h21" />
        </g>
      )}
      {motif === "sales-denominator" && (
        <g data-sales-denominator="true">
          <rect x="91" y="34" width="98" height="88" rx="9" fill="white" strokeOpacity=".45" />
          {[0,1,2].map(row=>[0,1,2,3].map(col=><circle key={`${row}-${col}`} cx={108+col*21} cy={52+row*25} r="5" fill="currentColor" fillOpacity={row===0?'.6':'.12'} />))}
          <path d="M205 77h18m-6-6 6 6-6 6M242 76h31" />
          <text x="257" y="64" textAnchor="middle" fontSize="17" fill="currentColor" stroke="none">3</text>
          <text x="257" y="100" textAnchor="middle" fontSize="17" fill="currentColor" stroke="none">12</text>
        </g>
      )}
      {motif === "premise-network" && (
        <g data-logical-premises="true">
          <rect x="87" y="30" width="52" height="30" rx="8" fill="white" />
          <rect x="87" y="94" width="52" height="30" rx="8" fill="white" />
          <path d="M139 45h34l20 32-20 32h-34m54-32h37m-8-6 8 6-8 6" strokeOpacity=".65" />
          <rect x="231" y="57" width="54" height="40" rx="9" fill="currentColor" fillOpacity=".12" />
          <path d="M100 44h26m-26 65h26m116-33 9 9 18-18" />
        </g>
      )}
      {motif === "countermodel" && (
        <g data-logical-countermodel="true">
          {[94,203].map(x=><g key={x}><rect x={x} y="39" width="79" height="78" rx="9" fill="white" strokeOpacity=".45" /><path d={`M${x+16} 57h45m-45 15h45m-45 15h45`} strokeOpacity=".35" /></g>)}
          <circle cx="133" cy="102" r="5" fill="currentColor" fillOpacity=".3" />
          <path d="M237 98l9 9m0-9-9 9M184 65v25" />
        </g>
      )}
      {motif === "chapter-tabs" && (
        <g data-era-chapters="true">
          <path d="M105 35h68a8 8 0 0 1 8 8v83h-76z" fill="white" strokeOpacity=".45" />
          <path d="M105 35q-18-6-26 3v84q12-5 26 4M105 36v89" strokeOpacity=".4" />
          <path d="M176 48h15v15h-15m0 12h15v15h-15m0 12h15v15h-15" fill="currentColor" fillOpacity=".13" />
          <path d="M119 56h40m-40 17h31m-31 17h40m-40 17h25" strokeOpacity=".6" />
          <circle cx="226" cy="49" r="6" fill="currentColor" fillOpacity=".2" />
          <path d="M221 79h52m-52 20h35m-35 20h45" strokeOpacity=".35" />
        </g>
      )}
      {motif === "parallel-threads" && (
        <g data-era-threads="true">
          {[40,55,70,85,100,115].map((y,i)=><g key={y} opacity={.3+i*.1}><path d={`M96 ${y}h167`} /><circle cx={126+i*21} cy={y} r="4" fill="white" /></g>)}
        </g>
      )}
      {motif === "journal-ledger" && (
        <g data-accounting-ledger="true">
          <rect x="94" y="24" width="94" height="105" rx="8" fill="white" strokeOpacity=".5" />
          <path d="M108 43h64m-32 12v59m-32-49h64m-64 16h64m-64 16h64m-64 16h64" strokeOpacity=".4" />
          <path d="M114 57h12m25 16h13m-50 16h12m25 16h13M200 77h20m-6-6 6 6-6 6" />
          <rect x="230" y="39" width="47" height="76" rx="7" fill="currentColor" fillOpacity=".1" strokeOpacity=".4" />
          <path d="M240 54h27m-27 15h27m-27 15h17m-17 15h27" strokeOpacity=".6" />
        </g>
      )}
      {motif === "accounting-equation" && (
        <g data-accounting-equation="true">
          <rect x="91" y="53" width="62" height="50" rx="7" fill="white" strokeOpacity=".5" />
          <path d="M107 88l15-25 15 25m-24-9h18M164 74h16m-16 9h16M232 78h14m-7-7v14" />
          <rect x="191" y="62" width="30" height="32" rx="5" fill="currentColor" fillOpacity=".1" />
          <rect x="256" y="62" width="30" height="32" rx="5" fill="currentColor" fillOpacity=".2" />
          <path d="M198 72v13h14m51-13v13h14m-14-13h14m-14 6h10" strokeOpacity=".7" />
        </g>
      )}
      {motif === "java-trace" && (
        <g data-java-trace="true">
          <rect x="88" y="25" width="101" height="101" rx="10" fill="white" strokeOpacity=".5" />
          <path d="M115 48q-9 0-9 10v9q0 8-7 8 7 0 7 8v9q0 10 9 10m47-54q9 0 9 10v9q0 8 7 8-7 0-7 8v9q0 10-9 10M124 61h26m-26 15h19m-19 15h26" strokeOpacity=".65" />
          <path d="M199 76h20m-6-6 6 6-6 6" />
          <rect x="229" y="40" width="53" height="72" rx="9" fill="currentColor" fillOpacity=".1" strokeOpacity=".4" />
          <path d="M241 58h28m-28 16h18m-18 16h28" strokeOpacity=".7" />
        </g>
      )}
      {motif === "object-reference" && (
        <g data-java-reference="true">
          <rect x="93" y="37" width="62" height="30" rx="7" fill="white" strokeOpacity=".5" />
          <rect x="93" y="91" width="62" height="30" rx="7" fill="white" strokeOpacity=".5" />
          <path d="M155 52h26l26 27m-52 27h26l26-27m-8-1 9 1-1-9" strokeOpacity=".6" />
          <rect x="214" y="51" width="65" height="56" rx="9" fill="currentColor" fillOpacity=".1" strokeOpacity=".5" />
          <path d="M235 52v54m22-54v54m-42-27h64" strokeOpacity=".35" />
        </g>
      )}
      {motif === "gathering-table" && (
        <g data-gathering-table="true">
          <ellipse cx="180" cy="77" rx="48" ry="27" fill="white" strokeOpacity=".6" />
          <path d="M153 99v17m54-17v17m-47-45h17m12 10h13" strokeOpacity=".45" />
          {[[117, 53], [180, 22], [243, 53], [243, 108], [180, 136], [117, 108]].map(([x,y]) => (
            <g key={`${x}-${y}`}><circle cx={x} cy={y} r="9" fill="currentColor" fillOpacity=".14" /><path d={`M${x-13} ${y+15}q13-8 26 0`} strokeOpacity=".45" /></g>
          ))}
        </g>
      )}
      {motif === "notebook" && (
        <>
          <rect
            x="119"
            y="23"
            width="123"
            height="105"
            rx="11"
            fill="white"
            strokeOpacity=".55"
          />
          <path
            d="M143 24v103m17-79h60m-60 18h45m-45 18h60m-60 18h33"
            strokeOpacity=".55"
          />
          {[40, 64, 88, 112].map((y) => (
            <path key={y} d={`M111 ${y}h16`} />
          ))}
        </>
      )}
      {motif === "orbit" && (
        <>
          <ellipse
            cx="180"
            cy="76"
            rx="77"
            ry="29"
            transform="rotate(-25 180 76)"
            strokeOpacity=".45"
          />
          <circle cx="180" cy="76" r="38" fill="white" />
          <path
            d="m182 42-20 35h17l-5 32 28-44h-19l7-23Z"
            fill="currentColor"
            fillOpacity=".16"
          />
          <circle cx="245" cy="42" r="7" fill="currentColor" fillOpacity=".2" />
        </>
      )}
      {motif === "quadrants" && (
        <>
          {["D", "I", "S", "C"].map((letter, i) => (
            <g key={letter}>
              <rect
                x={112 + (i % 2) * 73}
                y={18 + Math.floor(i / 2) * 59}
                width="63"
                height="51"
                rx="12"
                fill="white"
                strokeOpacity=".3"
              />
              <text
                x={143.5 + (i % 2) * 73}
                y={51 + Math.floor(i / 2) * 59}
                textAnchor="middle"
                stroke="none"
                fill="currentColor"
                fontSize="19"
                fontWeight="600"
              >
                {discLabels ? letter : ""}
              </text>
            </g>
          ))}
        </>
      )}
      {motif === "swatches" && (
        <>
          {["#d38b93", "#d5b46b", "#819ec9", "#80ad99"].map((color, i) => (
            <rect
              key={color}
              x={103 + i * 38}
              y={40 + (i % 2) * 8}
              width="48"
              height="70"
              rx="13"
              fill={color}
              fillOpacity=".55"
              stroke="white"
              strokeWidth="3"
            />
          ))}
        </>
      )}
      {motif === "focus" && (
        <>
          <circle cx="133" cy="75" r="38" fill="white" strokeOpacity=".35" />
          <circle cx="133" cy="65" r="10" />
          <path d="M115 95a18 18 0 0 1 36 0" />
          <circle cx="233" cy="75" r="38" fill="white" strokeOpacity=".35" />
          {[217, 233, 249].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={i === 1 ? 59 : 70} r="7" />
              <path
                d={`M${x - 10} 94v-2a10 10 0 0 1 20 0v2`}
                strokeOpacity=".6"
              />
            </g>
          ))}
        </>
      )}
      {motif === "dimensions" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${81 + i * 53} 0)`}>
              <rect
                y="29"
                width="39"
                height="92"
                rx="13"
                fill="white"
                strokeOpacity=".22"
              />
              <circle
                cx="19.5"
                cy={49 + (i % 3) * 21}
                r="11"
                fill="currentColor"
                fillOpacity=".18"
                strokeOpacity=".35"
              />
            </g>
          ))}
        </>
      )}
      {motif === "connection" && (
        <>
          <path
            d="M130 97c-70-36-29-91 9-56 38-35 79 20 9 56l-9 5Z"
            fill="white"
            strokeOpacity=".7"
          />
          <path
            d="M212 110c-61-32-26-80 8-49 33-31 68 17 8 49l-8 5Z"
            fill="currentColor"
            fillOpacity=".12"
          />
          <path d="m160 77 36 10" strokeDasharray="4 6" />
          <circle cx="90" cy="114" r="5" strokeOpacity=".3" />
        </>
      )}
      {motif === "dialogue" && (
        <>
          <path
            d="M81 35h99a14 14 0 0 1 14 14v38a14 14 0 0 1-14 14h-59l-26 17v-17a14 14 0 0 1-14-14V49a14 14 0 0 1 14-14Z"
            fill="white"
            strokeOpacity=".55"
          />
          <path
            d="M200 51h55a14 14 0 0 1 14 14v34l-2 12 14 11-37-9h-44a14 14 0 0 1-14-14V65a14 14 0 0 1 14-14Z"
            fill="currentColor"
            fillOpacity=".1"
          />
          <path d="M107 59h57m-57 18h35m64 0h42m-42 18h24" strokeOpacity=".6" />
        </>
      )}
      {motif === "team" && (
        <>
          {[122, 180, 238].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={i === 1 ? 43 : 58} r="17" fill="white" />
              <path
                d={`M${x - 24} 116v-18a24 24 0 0 1 48 0v18`}
                fill="currentColor"
                fillOpacity={i === 1 ? ".18" : ".07"}
              />
            </g>
          ))}
        </>
      )}
      {motif === "flower" && (
        <>
          <path
            d="M180 82v44m0-13q-48 0-45-31 36 1 45 31m0-7q43 0 44-28-32-1-44 28"
            fill="currentColor"
            fillOpacity=".14"
          />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="180"
              cy="36"
              rx="13"
              ry="22"
              transform={`rotate(${a} 180 58)`}
              fill="white"
              strokeOpacity=".6"
            />
          ))}
          <circle
            cx="180"
            cy="58"
            r="13"
            fill="currentColor"
            fillOpacity=".25"
          />
        </>
      )}
      {motif === "animal" && (
        <>
          <path
            d="m130 55-5-30 33 20q22-11 44 0l33-20-5 30q20 17 13 43-15 32-63 30-48 2-63-30-7-26 13-43Z"
            fill="white"
            strokeOpacity=".65"
          />
          <path d="m145 83 12 2m46-2 12-2m-43 14 8 6 8-6-8-3Z" />
          <path d="m180 101-12 10m12-10 12 10" strokeOpacity=".6" />
        </>
      )}
      {motif === "dragon" && (
        <>
          <path
            d="M157 111q-60-20-23-75l18 18 13-30 21 29q32-11 49 10l-13 12 22 8-18 17h-34l-8 19h-38l11-8Z"
            fill="white"
          />
          <path
            d="m147 78-41-20 6 32 35 15m47-44 5-30 15 23m-35 39 31-3"
            fill="currentColor"
            fillOpacity=".16"
          />
          <circle cx="213" cy="66" r="3" fill="currentColor" />
        </>
      )}
      {motif === "music" && (
        <>
          <rect
            x="102"
            y="34"
            width="92"
            height="82"
            rx="14"
            fill="white"
            strokeOpacity=".4"
          />
          <circle
            cx="148"
            cy="75"
            r="28"
            fill="currentColor"
            fillOpacity=".1"
          />
          <circle cx="148" cy="75" r="6" />
          <path d="M227 94V43l38-8v49m-38-28 38-8" />
          <ellipse
            cx="217"
            cy="97"
            rx="11"
            ry="8"
            fill="currentColor"
            fillOpacity=".2"
          />
          <ellipse
            cx="255"
            cy="87"
            rx="11"
            ry="8"
            fill="currentColor"
            fillOpacity=".2"
          />
        </>
      )}
      {motif === "moon" && (
        <>
          <path
            d="M201 25a52 52 0 1 0 35 83c-52 8-79-45-35-83Z"
            fill="white"
            strokeOpacity=".6"
          />
          <path
            d="m249 36 3 8 9 3-9 3-3 9-3-9-9-3 9-3Zm-137 67 3 6 7 2-7 3-3 7-2-7-7-3 7-2Z"
            fill="currentColor"
            fillOpacity=".2"
          />
        </>
      )}
      {motif === "cosmos" ? (
        <>
          <ellipse
            cx="180"
            cy="75"
            rx="88"
            ry="30"
            transform="rotate(-22 180 75)"
            strokeOpacity=".4"
          />
          <circle cx="180" cy="75" r="41" fill="white" />
          <path
            d="M180 34v82m-40-41h81m-70-27q60 27 0 54m58-54q-60 27 0 54"
            strokeOpacity=".2"
          />
          <circle cx="253" cy="40" r="7" fill="currentColor" fillOpacity=".3" />
          <path
            d="m106 31 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"
            fill="currentColor"
            fillOpacity=".2"
          />
        </>
      ) : null}
      {motif === "cards" && (
        <>
          <rect
            x="118"
            y="29"
            width="72"
            height="98"
            rx="9"
            transform="rotate(-13 118 29)"
            fill="white"
            strokeOpacity=".4"
          />
          <rect
            x="177"
            y="24"
            width="72"
            height="98"
            rx="9"
            transform="rotate(9 177 24)"
            fill="white"
          />
          <path
            d="m209 51 8 15 17 3-13 12 2 17-15-8-15 8 3-17-13-13 18-2Z"
            fill="currentColor"
            fillOpacity=".15"
          />
        </>
      )}
      {motif === "palette" && (
        <>
          <rect
            x="107"
            y="30"
            width="68"
            height="95"
            rx="9"
            transform="rotate(-14 107 30)"
            fill="white"
            strokeOpacity=".4"
          />
          <rect
            x="146"
            y="25"
            width="68"
            height="100"
            rx="9"
            fill="white"
            strokeOpacity=".6"
          />
          <rect
            x="190"
            y="25"
            width="68"
            height="100"
            rx="9"
            transform="rotate(13 190 25)"
            fill="white"
          />
          {[44, 68, 92].map((y, i) => (
            <rect
              key={y}
              x="157"
              y={y}
              width="46"
              height="17"
              rx="4"
              fill="currentColor"
              fillOpacity={(i + 1) * 0.13}
              stroke="none"
            />
          ))}
          <circle cx="180" cy="115" r="3" />
        </>
      )}
      {motif === "keyboard" && (
        <>
          <rect
            x="84"
            y="41"
            width="192"
            height="78"
            rx="12"
            fill="white"
            strokeOpacity=".55"
          />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={98 + col * 21}
                y={54 + row * 18}
                width="13"
                height="10"
                rx="2"
                fill="currentColor"
                fillOpacity={row === 1 && col === 3 ? ".45" : ".08"}
                strokeOpacity=".2"
              />
            )),
          )}
          <path d="M142 109h76" />
        </>
      )}
      {motif === "spreadsheet" && (
        <g data-excel-sheet="true">
          <rect x="83" y="22" width="194" height="108" rx="9" fill="white" strokeOpacity=".6" />
          <path d="M83 49h194M114 49v81m54-81v81m54-81v81M83 76h194M83 103h194" strokeOpacity=".3" />
          <rect x="168" y="76" width="54" height="27" fill="currentColor" fillOpacity=".16" />
          <rect x="114" y="49" width="54" height="27" fill="currentColor" fillOpacity=".08" />
          <text x="97" y="40" fontSize="12" fontFamily="Georgia, serif" fill="currentColor" stroke="none">fx</text>
          <path d="M124 35h119m-55 53h14m-7-7v14M129 61h22m83 54h24" strokeOpacity=".65" />
        </g>
      )}
      {motif === "column-chart" && (
        <g data-excel-chart="true">
          <path d="M102 28v95h163" strokeOpacity=".5" />
          <path d="M103 51h160m-160 28h160m-160 27h160" strokeOpacity=".15" />
          <rect x="121" y="78" width="27" height="45" rx="3" fill="currentColor" fillOpacity=".14" />
          <rect x="166" y="45" width="27" height="78" rx="3" fill="currentColor" fillOpacity=".3" />
          <rect x="211" y="62" width="27" height="61" rx="3" fill="currentColor" fillOpacity=".2" />
        </g>
      )}
      {motif === "computer" && (
        <>
          <rect
            x="100"
            y="25"
            width="160"
            height="91"
            rx="10"
            fill="white"
            strokeOpacity=".55"
          />
          <path d="M180 116v12m-33 0h66m-72-73-13 13 13 13m78-26 13 13-13 13m-27-32-15 39" />
          <path d="M100 101h160" strokeOpacity=".2" />
        </>
      )}
      {motif === "gear" && (
        <>
          <path
            d="m168 27 24 0 4 15 13 8 16-4 12 21-11 12v15l11 12-12 20-16-4-13 8-4 14h-24l-4-14-13-8-16 4-12-20 11-12V79l-11-12 12-21 16 4 13-8Z"
            transform="translate(0 -10)"
            fill="white"
            strokeOpacity=".6"
          />
          <circle
            cx="180"
            cy="75"
            r="23"
            fill="currentColor"
            fillOpacity=".15"
          />
        </>
      )}
      {motif === "puzzle" && (
        <>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={126 + col * 38}
                y={23 + row * 37}
                width="31"
                height="30"
                rx="7"
                fill={row === col ? "currentColor" : "white"}
                fillOpacity={row === col ? ".2" : "1"}
                strokeOpacity=".3"
              />
            )),
          )}
          <path d="m252 68 8 8-8 8m-145-8H94" strokeOpacity=".4" />
        </>
      )}
      {motif === "book" ? (
        <>
          <path
            d="M180 45q-35-23-78-9v83q44-11 78 9 34-20 78-9V36q-43-14-78 9Z"
            fill="white"
            strokeOpacity=".6"
          />
          <path
            d="M180 45v83m-61-72 42 9m-42 9 42 9m-42 9 28 6m51-29 42-9m-42 27 42-9m-42 27 28-6"
            strokeOpacity=".45"
          />
        </>
      ) : null}
      {motif === "coins" && (
        <>
          <ellipse cx="146" cy="100" rx="36" ry="12" fill="white" />
          <path
            d="M110 80v20c0 16 72 16 72 0V80m-72-20v20c0 16 72 16 72 0V60"
            fill="white"
          />
          <ellipse cx="146" cy="60" rx="36" ry="12" fill="white" />
          <circle cx="224" cy="70" r="33" fill="white" />
          <path d="M213 58h21m-21 12h21m-11-22v45" strokeOpacity=".6" />
        </>
      )}
      {motif === "balance" && (
        <>
          <path d="M180 30v89m-30 8h60M120 52h120m-120 0-22 41h44l-22-41m120 0-22 41h44l-22-41" />
          <path d="M98 93q22 28 44 0m76 0q22 28 44 0" fill="white" />
          <circle cx="180" cy="42" r="9" fill="white" />
        </>
      )}
      {motif === "compass" && (
        <>
          <circle cx="180" cy="75" r="52" fill="white" strokeOpacity=".6" />
          <circle
            cx="180"
            cy="75"
            r="42"
            strokeDasharray="2 12"
            strokeOpacity=".3"
          />
          <path
            d="m199 46-10 38-28 20 10-38Z"
            fill="currentColor"
            fillOpacity=".2"
          />
          <path d="m171 66 18 18m-9-70v8m0 106v8m-61-61h8m106 0h8" />
        </>
      )}
      {motif === "clock" && (
        <>
          <circle cx="180" cy="78" r="47" fill="white" strokeOpacity=".6" />
          <path d="M180 50v29l23 15m-38-77h30m-15 0v12m-36 12-8-8m80 8 8-8" />
          <path d="M180 40v3m0 70v3m-38-38h3m70 0h3" strokeOpacity=".4" />
        </>
      )}
      {motif === "cup" && (
        <>
          <path
            d="M128 48h93v42a37 37 0 0 1-37 37h-19a37 37 0 0 1-37-37Z"
            fill="white"
          />
          <path
            d="M221 59h13a20 20 0 0 1 0 40h-14m-105 31h123M153 22q-10 10 0 19m29-19q-10 10 0 19"
            strokeOpacity=".6"
          />
        </>
      )}
      {motif === "battery" && (
        <>
          <rect
            x="97"
            y="47"
            width="155"
            height="63"
            rx="13"
            fill="white"
            strokeOpacity=".6"
          />
          <path d="M253 66h11v25h-11" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={109 + i * 33}
              y="59"
              width="24"
              height="39"
              rx="5"
              fill="currentColor"
              fillOpacity={0.1 + i * 0.05}
              stroke="none"
            />
          ))}
        </>
      )}
      {motif === "castle" && (
        <>
          <path
            d="M112 122V60l19-18 19 18v22h60V60l19-18 19 18v62Z"
            fill="white"
            strokeOpacity=".6"
          />
          <path
            d="M158 122V78l22-28 22 28v44m-31 0v-22a9 9 0 0 1 18 0v22m-64-57h12m86 0h12m-55-40v23m0-23 24 8-24 6"
            fill="currentColor"
            fillOpacity=".12"
          />
        </>
      )}
      {motif === "stage" && (
        <>
          <rect
            x="104"
            y="28"
            width="152"
            height="94"
            rx="10"
            fill="white"
            strokeOpacity=".5"
          />
          <path
            d="M104 29q42 26 0 84m152-84q-42 26 0 84M115 123h130"
            fill="currentColor"
            fillOpacity=".12"
          />
          <path
            d="m180 48 7 16 18 2-14 12 4 19-15-10-16 10 4-19-14-12 19-2Z"
            fill="currentColor"
            fillOpacity=".2"
          />
        </>
      )}
      {motif === "growth" && (
        <>
          <path
            d="M180 121V52m0 40q-50 2-50-37 42-1 50 37m0-16q48 1 48-38-42-1-48 38"
            fill="white"
            strokeOpacity=".6"
          />
          <path d="M134 124h92m-68 8h44" strokeOpacity=".3" />
        </>
      )}
      {motif === "mirror" && (
        <>
          <rect
            x="141"
            y="24"
            width="78"
            height="97"
            rx="38"
            fill="white"
            strokeOpacity=".6"
          />
          <path
            d="M169 122v9m22-9v9m-38 0h54m-45-81 21-13m-24 28 35-23"
            strokeOpacity=".35"
          />
          <circle cx="180" cy="80" r="17" strokeOpacity=".3" />
        </>
      )}
      {motif === "waves" && (
        <>
          <circle cx="180" cy="70" r="43" fill="white" strokeOpacity=".25" />
          {[55, 78, 101].map((y, i) => (
            <path
              key={y}
              d={`M100 ${y}q20 -20 40 0t40 0 40 0 40 0`}
              strokeOpacity={0.35 + i * 0.2}
            />
          ))}
        </>
      )}
    </g>
  );
}

const COMPOSITIONS: Record<string, { main: string; support: string }> = {
  paired: {
    main: "translate(-36 12) scale(.84)",
    support: "translate(164 38) scale(.5)",
  },
  workspace: {
    main: "translate(-23 6) scale(.8)",
    support: "translate(158 47) scale(.52)",
  },
  portrait: {
    main: "translate(4 14) scale(.9)",
    support: "translate(198 4) scale(.36)",
  },
  story: {
    main: "translate(-25 23) scale(.81)",
    support: "translate(151 17) scale(.57)",
  },
  fan: {
    main: "translate(-6 -1) scale(.86)",
    support: "translate(125 63) scale(.55)",
  },
  grid: {
    main: "translate(-34 17) scale(.79)",
    support: "translate(133 17) scale(.79)",
  },
  sequence: {
    main: "translate(-38 24) scale(.71)",
    support: "translate(154 24) scale(.71)",
  },
  orbit: {
    main: "translate(-16 8) scale(.86)",
    support: "translate(174 54) scale(.45)",
  },
};

/** An individually authored pair of subjects and layout for each catalog identity. */
export function DiscoveryCardArt({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  const entry = discoveryCardEditorial(slug);
  if (!entry) return null;
  const { primary, secondary, layout } = entry.art;
  const composition = COMPOSITIONS[layout];
  if (!composition) return null;
  return (
    <div
      className={`catalog-discovery-art catalog-art-${category}`}
      data-art-id={slug}
      data-composition={`${primary}:${secondary}:${layout}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 360 150" fill="none" focusable="false">
        <g
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity=".17"
        >
          {layout === "workspace" && (
            <>
              <path d="M61 133h238m-212 6h187" />
              <path d="M75 23h38m167 0h12" />
            </>
          )}
          {layout === "paired" && <path d="M169 75h42m-8-5 8 5-8 5" />}
          {layout === "portrait" && (
            <>
              <path d="M90 126V73a77 77 0 0 1 154-12" />
              <path d="M82 134h164" />
            </>
          )}
          {layout === "story" && (
            <>
              <path d="M64 126q57-20 109-3t123-15" />
              <path d="M63 22h40m-40 0v38m234 53v21h-26" />
            </>
          )}
          {layout === "fan" && (
            <>
              <rect
                x="79"
                y="20"
                width="187"
                height="109"
                rx="16"
                transform="rotate(-6 172 75)"
                fill="white"
              />
              <path d="m91 126 179 8" />
            </>
          )}
          {layout === "grid" && (
            <>
              <path d="M180 27v97m-121-2V30h19m204 0h19v92h-19M78 122H59" />
              <path d="M169 135h22" />
            </>
          )}
          {layout === "sequence" && (
            <>
              <path d="M163 77h36m-8-7 8 7-8 7" />
              <path d="M61 123h64m113 0h63" />
            </>
          )}
          {layout === "orbit" && (
            <ellipse
              cx="180"
              cy="78"
              rx="125"
              ry="49"
              transform="rotate(-15 180 78)"
            />
          )}
        </g>
        <g transform={composition.main}>
          <DiscoveryGlyph motif={primary} discLabels={slug === "disc"} />
        </g>
        <g transform={composition.support}>
          <DiscoveryGlyph motif={secondary} />
        </g>
      </svg>
    </div>
  );
}
