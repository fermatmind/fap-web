import styles from "./mbti-hero-scene.module.css";

function Tree({ x, y, scale = 1, light = false }: { x: number; y: number; scale?: number; light?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 2-108" stroke="#628c7e" strokeWidth="6" strokeLinecap="round" />
      <g>
        <path d="M0-165C-68-132-65-61 0-40 65-61 68-132 0-165Z" fill={light ? "#afd3b1" : "#4a9d88"} />
        <path d="M0-165V-40C65-61 68-132 0-165Z" fill={light ? "#88bda4" : "#328573"} />
        <path d="M0-65 0-135M0-87-24-108M0-105 24-125" stroke="#d5e7c7" strokeWidth="2" opacity=".6" fill="none" />
      </g>
    </g>
  );
}

/** Original decorative vector scene: a shared garden with different ways to explore. */
export function MbtiHeroScene() {
  return (
    <div className={styles.scene} data-testid="mbti-hero-scene">
      <svg className={styles.artwork} viewBox="0 0 1440 360" fill="none" aria-hidden="true" focusable="false">
        <circle cx="1058" cy="75" r="49" fill="#efddab" opacity=".65" />
        <g fill="#fff" opacity=".75">
          <path d="M199 66c0-15 12-26 26-26 10-21 44-20 51 3 20-3 32 8 32 23Z" />
          <path d="M785 46c0-11 10-20 22-20 12-25 44-22 52 3 17-2 26 5 27 17Z" />
          <path d="M1159 107c2-10 10-16 20-16 9-18 35-17 41 1 14-1 22 5 23 15Z" />
        </g>
        <path d="M0 211C151 186 215 108 367 134S609 245 761 163 1026 102 1160 159 1338 193 1440 162V360H0Z" fill="#d8e7dc" />
        <path d="M0 250C187 152 339 174 492 220S774 177 950 195 1229 250 1440 202V360H0Z" fill="#e8eee1" />
        <path d="M0 286C209 248 405 277 582 237S969 206 1123 258 1352 273 1440 253V360H0Z" fill="#f9faf5" />
        <path d="M861 198C763 219 600 234 551 272S673 327 714 360H938C867 309 691 294 678 274S804 225 895 209Z" fill="#e4d4b6" />
        <path d="M865 204C803 222 649 246 622 271" stroke="#f7edda" strokeWidth="3" strokeLinecap="round" />
        <Tree x={142} y={260} scale={1.14} />
        <Tree x={227} y={233} scale={0.74} light />
        <Tree x={1208} y={248} scale={1.16} />
        <Tree x={1304} y={273} scale={0.84} light />
        <Tree x={1002} y={207} scale={0.6} light />
        <Tree x={413} y={204} scale={0.48} light />
        {/* A quiet reader, seated under the tree. */}
        <ellipse cx="333" cy="303" rx="72" ry="12" fill="#dce7de" />
        <path d="M278 267H380V281H278Z" fill="#adba9b" />
        <path d="M286 279 282 300M367 279 375 301" stroke="#748776" strokeWidth="7" strokeLinecap="round" />
        <path d="M316 257 346 266 355 294H341L327 277 301 274" fill="#344f64" />
        <path d="m349 293 15 3 2 7h-27l1-10" fill="#273f53" />
        <path d="M301 215c-17 8-22 24-18 48l41 2 7-43Z" fill="#579d9a" />
        <path d="m316 225 17 20 20-5" stroke="#d59f78" strokeWidth="10" strokeLinecap="round" />
        <path d="m327 226 24 4 18-5-6 26-18 5-20-5Z" fill="#eee0b7" />
        <path d="m351 230-6 26" stroke="#b7a881" strokeWidth="2" />
        <path d="M306 206v14" stroke="#d59f78" strokeWidth="12" />
        <ellipse cx="307" cy="195" rx="17" ry="21" fill="#e0af89" transform="rotate(-8 307 195)" />
        <path d="M289 200c-13-34 29-40 37-17l-23 1-3 21Z" fill="#334e51" />
        <circle cx="318" cy="196" r="1.5" fill="#334e51" />
        {/* Two friends exchanging ideas around an outdoor table. */}
        <ellipse cx="700" cy="237" rx="103" ry="12" fill="#cfddcd" />
        <path d="m622 188 1 44m18-42 11 41" stroke="#395c64" strokeWidth="12" strokeLinecap="round" />
        <path d="M610 151c0-13 34-17 37 2l4 42h-44Z" fill="#ccac65" />
        <path d="M626 130v14" stroke="#b98468" strokeWidth="10" />
        <ellipse cx="626" cy="120" rx="15" ry="19" fill="#c99170" />
        <path d="M610 120c-7-27 29-31 33-7l-14-7-17 18Z" fill="#465349" />
        <g>
          <path d="m643 154 18 17 20-19" stroke="#c99170" strokeWidth="9" strokeLinecap="round" />
          <path d="m681 152 1-9m-1 8 7-5" stroke="#c99170" strokeWidth="5" strokeLinecap="round" />
        </g>
        <path d="m737 185-8 44m23-43 10 43" stroke="#415c61" strokeWidth="12" strokeLinecap="round" />
        <path d="M727 145c8-9 29-7 33 5l9 44h-45Z" fill="#7a9d7c" />
        <path d="M744 127v14" stroke="#e1b592" strokeWidth="10" />
        <ellipse cx="744" cy="116" rx="15" ry="19" fill="#e1b592" />
        <path d="M729 112c-1-20 31-22 32 0l-4 20-8-4 1-22-21 13Z" fill="#7b624a" />
        <path d="m731 151-14 18-19-5" stroke="#e1b592" strokeWidth="9" strokeLinecap="round" />
        <path d="M666 182h60v8h-60Z" fill="#9cac92" />
        <path d="m679 190-4 38m38-38 6 38" stroke="#83957d" strokeWidth="5" />
        <path d="M685 171h15v11h-15Z" fill="#f5f6e9" />
        <path d="M701 174h4v5h-4" stroke="#f5f6e9" strokeWidth="2" />
        {/* An observer with a telescope, looking toward the open sky. */}
        <ellipse cx="1067" cy="300" rx="78" ry="12" fill="#dce7de" />
        <path d="m1024 220-21 72m23-71 28 71m-29-70 3 67" stroke="#899c91" strokeWidth="5" strokeLinecap="round" />
        <path d="m1008 207 42-20 8 17-42 20Z" fill="#759b9c" />
        <path d="m1045 185 12-6 12 26-12 6Z" fill="#38676d" />
        <path d="m1004 212 7-3 4 9-8 3Z" fill="#365361" />
        <path d="m1085 248-5 43m20-43 13 42" stroke="#425466" strokeWidth="13" strokeLinecap="round" />
        <path d="M1075 204c9-12 30-10 35 6l8 43h-47Z" fill="#928ba8" />
        <path d="m1079 213-23 3-11-12" stroke="#d7a184" strokeWidth="10" strokeLinecap="round" />
        <path d="M1088 191v13" stroke="#d7a184" strokeWidth="11" />
        <ellipse cx="1087" cy="178" rx="16" ry="20" fill="#d7a184" />
        <path d="M1069 173c3-24 34-22 37 2l-9 9-2-17-25 13Z" fill="#444e59" />
        <path d="m1073 291 13 0 1 8h-22Zm36-1 11 0 8 9h-21Z" fill="#2f4856" />
        {/* Foreground botanical details keep the scene grounded. */}
        <g stroke="#91b396" strokeWidth="3" strokeLinecap="round">
          <path d="M469 305v-27m0 16-11-9m11 15 13-14M910 304v-31m0 19-12-11m12 20 12-13M191 320v-18m0 11-9-7M1256 326v-24m0 15 11-9" />
        </g>
        <g fill="#d3b879"><circle cx="469" cy="275" r="5" /><circle cx="910" cy="270" r="5" /><circle cx="1256" cy="299" r="4" /></g>
        <g fill="#b4c7b2"><ellipse cx="508" cy="327" rx="14" ry="5" /><ellipse cx="943" cy="330" rx="17" ry="6" /><ellipse cx="86" cy="290" rx="20" ry="6" /><ellipse cx="1365" cy="311" rx="18" ry="6" /></g>
        <g stroke="#7d9c9b" strokeWidth="2.5" strokeLinecap="round">
          <path d="m521 69 7 4 7-4m24 19 5 3 5-3" />
        </g>
      </svg>
    </div>
  );
}
