import { DiscoveryCardArt } from "./DiscoveryCardArt";

/** Decorative scene only; the four DISC panels do not depict a user's scores. */
export function ExploreHeroArtwork({ slug, category }: { slug: string; category: string }) {
  return (
    <div className="explore-hero-scene" aria-hidden="true">
      <svg className="explore-hero-landscape" viewBox="0 0 1440 340" fill="none" focusable="false">
        <circle cx="720" cy="168" r="143" fill="#e5eeee" />
        <circle cx="720" cy="168" r="126" stroke="#a9c7c5" strokeOpacity=".5" />
        <path d="M557 168h-30m356 0h30M720 8v-8m0 328v12" stroke="#a9c7c5" strokeWidth="1.5" />
        <circle cx="590" cy="66" r="6" fill="#d88770" />
        <circle cx="853" cy="263" r="5" fill="#d4b775" />
      </svg>
      <div className="explore-hero-symbol">
        {slug === "weather-in-a-bottle" ? (
          <svg data-bottle-weather-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M55 74h45v29q22 15 22 43v87H33v-87q0-28 22-43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M51 64h53v12H51Z" fill="#f4e7c9"/><path d="M43 163h67m-60 16h54m-59 17h63" stroke="#b9d5d1" strokeWidth="6" strokeLinecap="round"/>
            <path d="M158 74h45v29q22 15 22 43v87h-89v-87q0-28 22-43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M154 64h53v12h-53Z" fill="#f4e7c9"/><path d="M145 159q23-17 54-2t19 23m-71 18q26-16 58-1" stroke="#78a7a2" strokeWidth="2"/><path d="m174 162 15-4 12 9-21 3Z" fill="#d88770"/>
            <path d="M261 74h45v29q22 15 22 43v87h-89v-87q0-28 22-43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M257 64h53v12h-53Z" fill="#f4e7c9"/><path d="m265 130 38 17-20 69-33-17Z" fill="#f4e7c9"/><path d="M269 192h24v10h-24Z" fill="#d88770"/>
          </svg>
        ) : slug === "weekend-pace" ? (
          <svg data-weekend-pace-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="44" y="54" width="272" height="182" rx="8" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M44 94h272m-181 0v142m91-142v142M88 43v22m184-22v22" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="61" y="117" width="56" height="40" rx="6" fill="#f4e7c9"/><path d="m75 137 9 9 20-22" stroke="#b29659" strokeWidth="3"/>
            <path d="M155 173q43-1 40-30-3-24-30-10m0 0 12-12m-12 12 15 6" stroke="#d88770" strokeWidth="3" strokeLinecap="round"/>
            <rect x="241" y="115" width="59" height="91" rx="8" stroke="#78a7a2" strokeWidth="2" strokeDasharray="4 6"/>
            <path d="M61 199h52m43 17h47" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "woodland-animal" ? (
          <svg data-woodland-animal-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m43 56-21 47h42Zm254-4-22 52h45Z" fill="#a9c7c5"/><path d="M43 103v136m254-135v135M28 239h302" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m65 148 30-18 27 8-24 17-8 30-7-24-18 5Z" fill="#78a7a2" stroke="#123f49" strokeWidth="2"/><path d="m113 141 13 2m-28 12 14 11" stroke="#123f49" strokeWidth="2"/>
            <ellipse cx="181" cy="185" rx="28" ry="23" fill="#b29659"/><circle cx="195" cy="156" r="16" fill="#b29659"/><circle cx="188" cy="142" r="6" fill="#f4e7c9"/><path d="m158 194-25 15 14 17 22-22" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="m236 203 8-16 5-20 14 6 12-14 12 14 16-2 1 17 13 10-11 12h-61Z" fill="#d88770" stroke="#a96f5f" strokeWidth="2"/><path d="m300 199 21 6-15 9" fill="#f4e7c9"/>
            <path d="M59 217q26 2 43 12m133-112 17-13" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "tiny-kingdom" ? (
          <svg data-tiny-kingdom-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m29 174 148-34 153 34v63l-153 33-148-33Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m29 174 148 36 153-36m-153 36v60" stroke="#b29659" strokeWidth="2"/>
            <path d="M57 161v-50l36-22 36 22v66m-72-66h72" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="80" cy="137" r="8" fill="#d88770"/><circle cx="104" cy="146" r="8" fill="#a9c7c5"/>
            <path d="m144 175 22-31h30l23 31m-75 0h75" stroke="#78a7a2" strokeWidth="3"/><path d="m166 144 15 31 15-31" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M237 173V97h59v76Zm-9-76 38-28 38 28" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M249 118h34m-34 12h34m-34 12h21" stroke="#b29659" strokeWidth="2"/>
            <path d="M263 58h10v15h-10Z" fill="#f4e7c9" stroke="#b29659"/><path d="m253 57 15-10 15 10" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "tiny-superpower" ? (
          <svg data-tiny-superpower-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="41" y="62" width="83" height="143" rx="10" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M57 88h48m-48 13h31m-31 13h48" stroke="#78a7a2" strokeWidth="2"/><rect x="58" y="138" width="47" height="25" rx="3" fill="#f4e7c9"/><path d="M65 151h32" stroke="#b29659" strokeWidth="2"/>
            <rect x="139" y="62" width="83" height="143" rx="10" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M167 109v42m27-42v42" stroke="#d88770" strokeWidth="7" strokeLinecap="round"/><path d="m154 173 22 8 30-8" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="237" y="62" width="83" height="143" rx="10" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M251 106h42v50h-42Z" fill="#e5eeee"/><path d="M267 127h39v46h-39Z" fill="#f4e7c9" stroke="#d88770" strokeWidth="3"/>
            <path d="M66 231h40m54 0h40m54 0h40" stroke="#78a7a2" strokeWidth="2" strokeDasharray="3 4"/>
          </svg>
        ) : slug === "tiny-treat" ? (
          <svg data-tiny-treat-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M47 56h104v103H47Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M99 56v103m-52-52h104" stroke="#a9c7c5"/><circle cx="125" cy="83" r="12" fill="#f4e7c9"/><path d="m55 142 23-17 20 12 18-20 27 25" fill="#a9c7c5"/>
            <path d="m200 88 86-13 13 93-86 12Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m251 108 6 14 16 2-12 11 2 16-14-8-14 7 3-16-11-11 16-1Z" fill="#d88770"/>
            <circle cx="168" cy="218" r="37" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="M168 190v7m29 21h-7m-22 29v-7m-29-22h7" stroke="#b29659" strokeWidth="2"/>
            <path d="M215 232q42 0 79-18" stroke="#78a7a2" strokeWidth="2" strokeDasharray="5 6"/>
          </svg>
        ) : slug === "tide-pool-creature" ? (
          <svg data-tide-pool-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M36 170q-13-85 82-99 61-42 139 3 65 16 63 92-6 62-85 66-109 28-172-15Z" fill="#b9d5d1" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M68 126q-4-36 37-40 48-4 59 35-54 11-96 5Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <ellipse cx="118" cy="164" rx="22" ry="14" fill="#d88770"/><path d="m99 160-13-11m14 22-14 9m49-19 13-12m-14 23 13 9m-37-30-5-10m20 10 5-10" stroke="#d88770" strokeWidth="3"/>
            <path d="M203 141q31-22 43 4-13 24-37 10l-7 9m29-29 14-15m-9 19 21-4" stroke="#123f49" strokeWidth="3"/>
            <path d="M224 207q-9-17-2-30m9 30q-2-27 7-35m1 36q8-27 18-29m-10 30q15-18 23-15" stroke="#b29659" strokeWidth="3"/><ellipse cx="241" cy="210" rx="23" ry="6" fill="#f4e7c9"/>
            <path d="M158 200q16-11 24-7m-8-95 22-3M75 211l15-3" stroke="#fffdf8" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ) : slug === "time-capsule" ? (
          <svg data-time-capsule-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m57 165 122-28 124 28v69l-124 28-122-28Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m57 165 122 29 124-29m-124 29v68" stroke="#b29659" strokeWidth="2"/>
            <path d="m78 143 5-86 67 4-5 86Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m92 125 13-18 13 13 17-24" stroke="#78a7a2" strokeWidth="2"/><circle cx="107" cy="79" r="6" fill="#d88770"/>
            <path d="M159 44h59v96h-59Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M179 76q-1-10 10-10 13 0 10 11-1 5-10 10v8m0 7v3" stroke="#d88770" strokeWidth="3"/>
            <path d="m233 86 56-10 14 78-56 10Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m246 103 8 5 5-10m-11 24 8 5 5-10m-10 24 8 5 5-10" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m92 215 50 11m58-6 36-8" stroke="#d88770" strokeWidth="2"/>
          </svg>
        ) : slug === "storybook-narrator" ? (
          <svg data-storybook-narrator-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M53 78q60-13 127 8 67-21 127-8v142q-65-13-127 9-62-22-127-9Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M180 86v143" stroke="#a9c7c5" />
            <path d="M78 145q34-60 68 0Zm34 0v46q0 15 13 15t13-15" fill="#d88770" stroke="#b29659" strokeWidth="2"/>
            <circle cx="240" cy="124" r="13" fill="#78a7a2"/><path d="M220 154a20 20 0 0 1 40 0v9h-40" fill="#78a7a2"/><path d="M201 184h76m-76 13h48" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M204 46h87v29h-60l-13 11V75h-14Z" fill="#f4e7c9"/><path d="M224 58h1m18 0h1m12 0h12" stroke="#b29659" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ) : slug === "team-name-maker" ? (
          <svg data-team-name-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M69 88h222v115H69Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M180 203v41" stroke="#b29659" strokeWidth="4"/>
            <path d="M91 112h52v30H91Zm64 0h74v30h-74Z" fill="#f4e7c9"/><path d="M239 127h24m-12-12v24" stroke="#d88770" strokeWidth="3"/>
            <path d="m95 166 8 8 13-18m12 11h62m15 0h58" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="110" cy="54" r="12" fill="#d88770"/><circle cx="180" cy="48" r="12" fill="#78a7a2"/><circle cx="250" cy="54" r="12" fill="#b29659"/>
          </svg>
        ) : slug === "thrift-shop-find" ? (
          <svg data-thrift-shop-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M39 204h282v12H39Zm17 12v23m249-23v23" fill="#a9c7c5"/>
            <path d="m52 167 42-12 40 12v37H52Zm0 0 42 12 40-12m-40 12v25" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="m74 162 1-37 30 2-1 35" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="155" y="100" width="68" height="104" rx="2" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><rect x="163" y="108" width="52" height="88" fill="#e5eeee"/>
            <path d="M249 137h55v67h-55Z" fill="#d88770"/><path d="M257 137v67" stroke="#fffdf8" strokeWidth="2"/><rect x="267" y="152" width="26" height="19" fill="#b6c8af"/>
            <path d="M268 159h17m-17 6h11" stroke="#78a7a2" strokeDasharray="3 3"/>
          </svg>
        ) : slug === "spell-school-elective" ? (
          <svg data-spell-school-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M37 53h127v85H37Zm159 0h127v85H196ZM37 168h127v85H37Zm159 0h127v85H196Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M70 103h48v12a13 13 0 0 1-13 13H83a13 13 0 0 1-13-13Zm48 2h6a9 9 0 0 1 0 18h-6" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M68 81q-4-13 12-14 8-13 21 0 18-1 14 14Z" fill="#e5eeee"/>
            <path d="m220 110 37-29 38 29v18h-75Zm29 18v-24h18v24" fill="#f4e7c9" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M62 190h75v42H62Zm0 0 38 24 37-24" stroke="#78a7a2" strokeWidth="2"/><path d="m141 197 8 10-8 10" stroke="#d88770" strokeWidth="2"/>
            <path d="M261 182v13m-40 0h80m-65 0v20m51-20v28" stroke="#78a7a2" strokeWidth="2"/><circle cx="236" cy="228" r="12" fill="#d88770"/><path d="m287 219 15 23h-30Z" fill="#f4e7c9"/>
          </svg>
        ) : slug === "stargazing-role" ? (
          <svg data-stargazing-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="60" y="49" width="242" height="139" rx="8" fill="#123f49"/><path d="m92 151 37-58 48 36 45-39 44 61" stroke="#b9d5d1" strokeWidth="2"/>
            {[ [92,151],[129,93],[177,129],[222,90],[266,151] ].map(([x,y])=><circle key={x} cx={x} cy={y} r="4" fill="#f4e7c9"/>)}
            <path d="M82 213h72v35H82Zm0 0 36 18 36-18" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M204 246v-30h55v30m-55-30v-14m55 14v-14" stroke="#d88770" strokeWidth="4"/>
            <path d="M177 188v16m-13 0h26" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "story-ending" ? (
          <svg data-story-ending-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M47 57q68-13 133 8 65-21 133-8v166q-65-12-133 8-68-20-133-8Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M180 65v166" stroke="#a9c7c5"/>
            <path d="M68 171h87m-78 0v21m69-21v21m-68-38h67" stroke="#b29659" strokeWidth="3"/>
            <path d="M93 113h45v23H93Zm22 23v21" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <circle cx="245" cy="149" r="33" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="4 5"/>
            <path d="m237 125 10-23 10 23Zm-14 47 10-23 10 23Z" fill="#d88770"/>
            <path d="M265 183q24 1 40 25m0 0 25 16" stroke="#78a7a2" strokeWidth="3" strokeDasharray="5 7"/>
          </svg>
        ) : slug === "souvenir-story" ? (
          <svg data-souvenir-story-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M48 153h84v31a32 32 0 0 1-32 32H80a32 32 0 0 1-32-32Zm84 7h11a19 19 0 0 1 0 38h-11" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M175 68h119v91H175Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m184 145 29-36 21 21 19-31 30 46" fill="#e5eeee"/><circle cx="272" cy="87" r="8" fill="#d88770"/>
            <path d="m195 188 94-18 10 46-94 18Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m218 193 5 22m13-26 5 22" stroke="#d88770" strokeWidth="2" strokeDasharray="3 4"/>
            <path d="m80 115 8-21 13 18m-13-18 23-5" stroke="#78a7a2" strokeWidth="2"/><path d="M62 229h84" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "small-apology" ? (
          <svg data-small-apology-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M43 71h115v69H94l-25 19v-19H43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M61 91h78m-78 18h55" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M201 130h92v83h-92Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m218 174 16 16 38-40" stroke="#78a7a2" strokeWidth="4"/>
            <path d="M73 197h73m-10-10 11 10-11 10" stroke="#d88770" strokeWidth="3"/><circle cx="95" cy="236" r="8" fill="#78a7a2"/><circle cx="124" cy="236" r="8" fill="#e5eeee"/>
            <path d="M235 70a27 27 0 1 1 39 25" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 6"/>
          </svg>
        ) : slug === "snow-day" ? (
          <svg data-snow-day-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <ellipse cx="180" cy="226" rx="131" ry="21" fill="#e5eeee"/>
            <path d="M50 218v-26a46 46 0 0 1 92 0v26h-24v-26a22 22 0 0 0-44 0v26Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <ellipse cx="205" cy="195" rx="35" ry="33" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><circle cx="205" cy="140" r="27" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M196 138h1m17 0h1m-19 13q10 8 19 0m-39 37-23-15m82 15 19-13" stroke="#123f49" strokeWidth="2" strokeLinecap="round"/><path d="m202 145 20 3-20 4" fill="#d88770"/>
            <circle cx="283" cy="213" r="15" fill="#f4e7c9"/><path d="m277 162 21 32h-42Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M80 80v18m-9-9h18m178-31v16m-8-8h16" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "shared-hobby" ? (
          <svg data-shared-hobby-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M48 176h264m-245 0v63m226-63v63" stroke="#78a7a2" strokeWidth="4"/>
            <path d="m74 159 43-24 39 25-43 13Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m94 151 20-34 21 35Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <rect x="211" y="121" width="61" height="48" rx="3" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m222 158 12-22 10 13 12-23" stroke="#d88770" strokeWidth="2"/>
            <circle cx="111" cy="75" r="16" fill="#d88770"/><path d="M82 119v-10a29 29 0 0 1 58 0v10" fill="#d88770"/>
            <circle cx="243" cy="75" r="16" fill="#78a7a2"/><path d="M214 119v-10a29 29 0 0 1 58 0v10" fill="#78a7a2"/>
            <path d="M160 81h35m-6-6 7 6-7 6m6 15h-35m6-6-7 6 7 6" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "shared-ritual" ? (
          <svg data-shared-ritual-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="57" y="63" width="126" height="152" rx="8" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M57 99h126m-99-49v26m72-26v26" stroke="#78a7a2" strokeWidth="3"/>
            <circle cx="88" cy="129" r="8" fill="#d88770"/><circle cx="121" cy="129" r="8" fill="#e5eeee"/><circle cx="154" cy="129" r="8" fill="#e5eeee"/><circle cx="88" cy="166" r="8" fill="#e5eeee"/>
            <path d="M111 166h51" stroke="#b29659" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="M217 176h55v26a20 20 0 0 1-20 20h-15a20 20 0 0 1-20-20Zm55 3h10a14 14 0 0 1 0 28h-10" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M231 163c-12-14 11-19 0-32m24 32c-12-14 11-19 0-32M209 232h86" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M229 92c13-26 44-20 48 2m-2-9 3 10-10-1" stroke="#d88770" strokeWidth="2"/>
          </svg>
        ) : slug === "shared-workspace" ? (
          <svg data-shared-workspace-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m44 146 157-38 116 52-157 43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M57 152v82m101-32v48m145-84v67" stroke="#78a7a2" strokeWidth="4"/>
            <path d="m83 146 59-15 42 19-59 16Z" fill="#e5eeee"/><path d="m113 142 17-20 9 14 12-7-15 24Z" fill="#d88770"/>
            <path d="m192 145 66-15 9 5-66 17Z" fill="#f4e7c9" stroke="#b29659"/><path d="m206 139 3 5m9-8 3 5m9-8 3 5m9-8 3 5" stroke="#b29659"/>
            <rect x="63" y="68" width="74" height="39" rx="3" fill="#f4e7c9"/><path d="M74 80h48m-48 12h31" stroke="#b29659" strokeWidth="2"/>
            <path d="M211 55h85v45h-51l-17 14v-14h-17Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M225 70h56m-56 14h36" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "secret-door" ? (
          <svg data-secret-door-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M171 233V47h116v186" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m287 47-63 22v164h63Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="239" cy="151" r="3" fill="#b29659"/>
            <path d="m48 196 76-14 51 26-77 18Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m48 196 1 18 49 23 77-17v-12m-77 18v11" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="88" cy="136" r="16" stroke="#d88770" strokeWidth="6"/><path d="m101 147 38 32m-14-12 7-8m1 15 7-8" stroke="#d88770" strokeWidth="6"/>
            <rect x="58" y="66" width="70" height="39" rx="3" fill="#f4e7c9"/><path d="M70 80h45m-45 10h31m92 154h111" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "secret-garden-gate" ? (
          <svg data-secret-garden-gate-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M92 236V97a88 88 0 0 1 176 0v139" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M108 229V105a72 72 0 0 1 144 0v124" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m109 106 66 17v106h-66Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="M121 133v80m15-76v76m15-72v72" stroke="#b29659"/><circle cx="161" cy="177" r="3" fill="#b29659"/>
            <rect x="195" y="138" width="37" height="46" rx="2" fill="#e5eeee"/><path d="M201 150h24m-24 9h17m-17 9h24" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M234 229v-28m-9 9 9 6 10-13" stroke="#78a7a2" strokeWidth="2"/><circle cx="234" cy="195" r="7" fill="#d88770"/>
            <path d="M47 231h266m-251-7v-34m-1 15-12-11m12 3 11-13m223 40v-44m0 17 12-9" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "saying-goodbye" ? (
          <svg data-saying-goodbye-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M59 231V56h109v175" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m168 56-63 25v152l63-2Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="121" cy="155" r="3" fill="#b29659"/>
            <path d="M52 235h141" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="205" y="128" width="100" height="70" rx="5" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m217 143 12 11-12 12m30-17h44m-44 15h31m-60 19h73" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="254" cy="77" r="23" fill="#d88770"/><path d="M254 62v15l10 7" stroke="#fffdf8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M210 224h52m-6-6 7 6-7 6" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "seasonal-table" ? (
          <svg data-seasonal-table-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m45 134 159-39 111 55-160 43Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M57 139v88m96-36v61m147-96v73" stroke="#78a7a2" strokeWidth="4"/>
            <path d="m72 130 45-12 31 16-45 13Z" fill="#f4e7c9"/>
            <path d="m95 130 16-27m-7 13-10-6m11 4 13-3" stroke="#b29659" strokeWidth="2"/><ellipse cx="111" cy="103" rx="6" ry="9" transform="rotate(31 111 103)" fill="#78a7a2"/>
            <path d="m146 144 46-12 32 16-47 13Z" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="m222 129 32-8 29 14-33 9Z" fill="#d88770"/><path d="m235 125 7-16 7 11 12-5-10 16Z" fill="#f4e7c9"/>
            <path d="M69 70h33m-33 7h23m152 161h29m-29 7h17" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "room-atmosphere" ? (
          <svg data-room-atmosphere-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M42 224V57h271v167Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m70 218 44-131 45 131Z" fill="#f4e7c9" fillOpacity=".6"/>
            <path d="M114 88v125m-19 0h38m-41-124 9-29h26l10 29Z" fill="#d88770" stroke="#b29659" strokeWidth="2"/>
            <path d="M157 178h42v20h-42Zm4 20v24m34-24v24m-34-44v-30h34v30" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M228 101h64m-64 49h64m-58 0v59m52-59v59" stroke="#78a7a2" strokeWidth="3"/>
            <rect x="235" y="74" width="24" height="27" rx="2" fill="#f4e7c9"/><path d="m240 90 6-9 8 9" stroke="#b29659" strokeWidth="2"/>
            <path d="m267 130 8-14 10 14-4 17h-11Z" fill="#d88770"/><path d="M235 136h20v11h-20Z" fill="#a9c7c5"/>
            <path d="M59 224h244m-89-9h51" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 5"/>
          </svg>
        ) : slug === "reunion-style" ? (
          <svg data-reunion-style-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M59 76h105v59H91l-22 18v-18H59Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M76 94h68m-68 17h46" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M202 94h104v61h-15v18l-22-18h-67Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="228" cy="124" r="4" fill="#b29659"/><circle cx="254" cy="124" r="4" fill="#b29659"/><circle cx="280" cy="124" r="4" fill="#b29659"/>
            <circle cx="104" cy="183" r="16" fill="#d88770"/><path d="M74 240v-15a30 30 0 0 1 60 0v15" fill="#d88770"/>
            <circle cx="254" cy="193" r="16" fill="#78a7a2"/><path d="M224 250v-15a30 30 0 0 1 60 0v15" fill="#78a7a2"/>
            <path d="M140 225c35-30 38 30 76 0" stroke="#78a7a2" strokeWidth="2" strokeDasharray="5 5"/>
          </svg>
        ) : slug === "river-crossing" ? (
          <svg data-river-crossing-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m38 66 268-15 14 182-269 18Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M163 67c-40 43 45 58 7 98s14 48 5 76h62c9-30-47-40-10-79s-46-67-9-98Z" fill="#e5eeee"/>
            <path d="M133 126h106v25H133Zm13 0v25m16-25v25m16-25v25m16-25v25m16-25v25m16-25v25" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <circle cx="112" cy="135" r="13" fill="#d88770"/><circle cx="264" cy="136" r="13" fill="#78a7a2"/>
            <path d="M111 193h39m-39 7h39m111-20h28v18h-28Z" stroke="#a9c7c5" strokeWidth="2"/><path d="m94 88 11 0m-6-5v10m183 119h16" stroke="#d88770" strokeWidth="2"/>
          </svg>
        ) : slug === "road-trip-dj" ? (
          <svg data-road-trip-dj-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="56" y="48" width="151" height="190" rx="12" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M76 79h109" stroke="#a9c7c5" strokeWidth="2"/><rect x="76" y="99" width="23" height="23" rx="4" fill="#d88770"/><rect x="76" y="140" width="23" height="23" rx="4" fill="#78a7a2"/><rect x="76" y="181" width="23" height="23" rx="4" fill="#f4e7c9"/><path d="M114 109h61m-61 42h61m-61 42h61" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="263" cy="174" r="40" fill="#f4e7c9"/><path d="M252 158v32m20-32v32" stroke="#b29659" strokeWidth="6" strokeLinecap="round"/>
            <path d="M252 96V69l34-6v28m-34-16 34-6" stroke="#78a7a2" strokeWidth="3"/><ellipse cx="245" cy="98" rx="9" ry="6" fill="#78a7a2"/><ellipse cx="279" cy="93" rx="9" ry="6" fill="#78a7a2"/>
          </svg>
        ) : slug === "rainy-window" ? (
          <svg data-rainy-window-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="59" y="31" width="245" height="193" rx="10" fill="#e5eeee" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M73 177v-42l25-25 25 25v42m2 0v-57l32-27 32 27v57m2 0v-41l37-30 36 30v41m-185 0h215" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M195 59v44m-30 17h58l-14-28h-30Zm30 0v66m-17 0h34" fill="#f4e7c9" fillOpacity=".7" stroke="#d4b775" strokeOpacity=".6" strokeWidth="2"/>
            <path d="m91 51-5 12m36 8-5 12m24-39-5 12m105 16-5 12m42-35-5 12m-162 34-5 12m157 4-5 12m-37 62-5 12" stroke="#78a7a2" strokeWidth="2" strokeLinecap="round"/>
            <path d="M58 224h248v15H58Zm120-193v193" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M77 190h40v33H77Zm40 5c24-4 24 22 0 18" fill="#d88770" stroke="#b29659" strokeWidth="2"/>
            <path d="M246 183h30l-5 39h-20Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="M262 183v-40m0 20c-20 0-28-13-24-21 17-1 24 10 24 21Zm0-8c0-17 9-26 22-23 0 16-11 23-22 23Z" fill="#78a7a2" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "reading-ritual" ? (
          <svg data-reading-ritual-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M41 236h280" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m51 94 63-12 61 16v120l-61-16-63 12Zm63-12v120" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m64 113 36-7m-36 23 36-7m-36 23 28-5m36-14 31 9m-31 9 31 9m-31 9 24 7" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m132 87 16 4v38l-8-8-8 4Z" fill="#d88770"/>
            <rect x="205" y="164" width="87" height="20" rx="3" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><rect x="194" y="187" width="103" height="20" rx="3" fill="#78a7a2"/><rect x="211" y="210" width="76" height="20" rx="3" fill="#d88770"/>
            <path d="M175 149c20-10 14-31 30-36" stroke="#78a7a2" strokeWidth="2" strokeDasharray="4 5"/>
            <circle cx="246" cy="91" r="34" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M246 72v20l14 9m-14-47v5m-37 32h5m69 0h-5" stroke="#78a7a2" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : slug === "quest-reward" ? (
          <svg data-quest-reward-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m33 73 47-15 42 18-3 112-43-15-44 15Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m80 58-4 115m15-68 15 19-17 23" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 5"/><circle cx="59" cy="94" r="8" fill="#d88770"/>
            <circle cx="225" cy="89" r="37" fill="#f4e7c9"/><path d="M155 192h171v16H155Zm15 16v35m140-35v35" fill="#78a7a2" stroke="#123e48" strokeWidth="2"/>
            <path d="M177 158h33v27h-33Zm33 5c22-4 22 20 0 15m-26-30c-10-10 9-12 0-22" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M236 164h53v18h-53Zm9-3c0-20 31-20 35 0" fill="#d88770"/><path d="M230 187h66" stroke="#b29659" strokeWidth="2"/>
            <path d="M91 205c0-21 31-21 31 0v11l7 10H84l7-10Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="106" cy="232" r="5" fill="#b29659"/><path d="M101 186v-7h11v7m-18 31h26" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "potluck-contribution" ? (
          <svg data-potluck-contribution-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M35 204h290v17H35Zm22 17v33m246-33v33" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M61 174h103v20H61Zm9-4c0-26 74-26 84 0" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="111" cy="145" r="5" fill="#b29659"/>
            <rect x="188" y="164" width="84" height="30" rx="8" fill="#d88770"/><path d="M201 164v-13h59v13m-39 0v30m-28-10h13m53 0h9" stroke="#b29659" strokeWidth="2"/>
            <path d="m230 74 65 8-7 64-65-8Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m239 93 39 5m-41 6 35 4m-37 7 24 3" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="61" y="66" width="79" height="58" rx="6" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M77 83h45m-45 12h31m-31 12h36" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "quiet-company" ? (
          <svg data-quiet-company-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="145" y="42" width="153" height="109" rx="8" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="M221 42v109m-76-54h153" stroke="#a9c7c5" strokeWidth="2"/><circle cx="265" cy="71" r="13" fill="#f4e7c9"/>
            <path d="M35 210h288v14H35Zm19 14v27m247-27v27" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="m62 166 43-7 40 10v35l-40-10-43 7Zm43-7v35" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m72 176 24-4m18 0 21 5m-63 10 24-4m18 0 21 5" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m166 180 18-18 19 20-18 18Z" fill="#d88770"/><rect x="218" y="169" width="22" height="22" rx="3" fill="#78a7a2"/><path d="m258 195 13-25 17 27Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "portal-choice" ? (
          <svg data-portal-choice-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M55 229V89a52 52 0 0 1 104 0v140Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="M70 229V91a37 37 0 0 1 74 0v138" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M91 140c-18-17 27-18 11-38m19 59c-18-17 24-23 6-42" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m195 70 97-20 16 174-97 19Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m210 83 68-14 13 143-67 14Z" fill="#fffdf8" stroke="#d4b775" strokeWidth="2"/>
            <path d="m224 178 18-33 18 9 18-27m-42-18 26-6m-24 16 16-3" stroke="#78a7a2" strokeWidth="2" strokeDasharray="4 4"/>
            <circle cx="174" cy="229" r="12" fill="#d88770"/><path d="M37 248h287m-146-8v8m-7-5 7 5 7-5" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "pocket-map" ? (
          <svg data-pocket-map-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m45 66 87-22 94 24 87-22v192l-87 22-94-24-87 22Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M132 44v192m94-168v192" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M61 190c40-35 26-40 75-27s55-54 97-28 38 33 64 7" stroke="#78a7a2" strokeWidth="7" opacity=".45"/>
            <path d="m85 129 4-36 16-7 17 10v33Zm4-36 17 8 16-5m-16 5v28" fill="#d88770" stroke="#b29659" strokeWidth="2"/>
            <path d="M112 135c19 8 24 33 56 34s36 10 51 36" stroke="#b29659" strokeWidth="2" strokeDasharray="5 5"/>
            <circle cx="168" cy="169" r="8" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <rect x="242" y="181" width="45" height="39" rx="3" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2" strokeDasharray="5 4"/>
            <path d="M256 201h17m-8-8v16M255 89l16-6m-16 15 30-7" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "playlist-maker" ? (
          <svg data-playlist-maker-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="82" y="45" width="190" height="202" rx="14" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M105 77h95m-95 10h61" stroke="#a9c7c5" strokeWidth="3"/>
            {[111,146,181].map((y,i)=><g key={y}><rect x="104" y={y} width="23" height="23" rx="5" fill={i===1?'#d88770':'#f4e7c9'}/><path d={`M139 ${y+6}h97m-97 10h64`} stroke="#a9c7c5" strokeWidth="2"/></g>)}
            <path d="m176 216 15 8-15 8Zm-20 1v14m47-14v14" fill="#163b46" stroke="#163b46" strokeWidth="2"/>
            <path d="M37 177v-39l27-7v37m-27-24 27-7" stroke="#78a7a2" strokeWidth="3"/><ellipse cx="29" cy="181" rx="9" ry="6" fill="#78a7a2"/><ellipse cx="56" cy="172" rx="9" ry="6" fill="#78a7a2"/>
            <path d="m293 96 6-12 6 12 13 6-13 6-6 12-6-12-13-6Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "party-arrival" ? (
          <svg data-party-arrival-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M30 235h300M43 235V59h85v176M58 235V75h55v160" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><circle cx="100" cy="155" r="3" fill="#b29659"/>
            <path d="M151 219v-48h46v48m-46-48v-20h46v20m-57 48h68m-55 0v17m43-17v17" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M232 190h88v13h-88Zm10 13v33m68-33v33" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="m246 173 15-12 18 14-15 11Zm33-20 17-11 14 11-17 11Z" fill="#d88770"/>
            <circle cx="177" cy="90" r="14" fill="#78a7a2"/><circle cx="222" cy="90" r="14" fill="#d88770"/><path d="M160 133v-19q17-17 34 0v19m11 0v-19q17-17 34 0v19" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "personal-museum" ? (
          <svg data-personal-museum-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M28 237h304M41 237V99h278v138" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="m36 99 145-65 143 65Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            {[57,150,243].map(x=><g key={x}><rect x={x} y="115" width="66" height="75" rx="5" fill="#e5eeee" stroke="#a9c7c5"/><path d={`M${x} 204h66m-66 10h42`} stroke="#a9c7c5" strokeWidth="2"/></g>)}
            <path d="M69 143h15v27H69Zm20-9h20v36H89Z" fill="#d88770"/><path d="m161 170 10-42 32 11-6 33Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m167 160 26-13m-20-4 18 17" stroke="#b29659"/>
            <circle cx="263" cy="137" r="7" fill="#d88770"/><circle cx="288" cy="137" r="7" fill="#78a7a2"/><path d="M255 168v-15h16v15m9 0v-15h16v15m-25-11h9" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "photo-group-role" ? (
          <svg data-photo-group-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="45" y="49" width="270" height="174" rx="12" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M62 79V65h20m216 14V65h-20M62 192v14h20m216-14v14h-20" stroke="#a9c7c5" strokeWidth="2"/>
            {[116,179,242].map((x,i)=><g key={x}><circle cx={x} cy="117" r="16" fill={i===1?'#d88770':'#78a7a2'}/><path d={`M${x-20} 178v-32q20-20 40 0v32Z`} fill={i===1?'#f4e7c9':'#e5eeee'} stroke="#78a7a2" strokeWidth="2"/></g>)}
            <path d="M121 191h119m-99 45h78" stroke="#a9c7c5" strokeWidth="2"/><circle cx="180" cy="236" r="6" fill="#d4b775"/>
          </svg>
        ) : slug === "paper-creature-language" ? (
          <svg data-paper-creature-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m123 185 18-95 44 28 46-29 17 96-63 45Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m141 90 44 63 46-64m-108 96 62-32 63 32m-63-32v77" stroke="#d4b775" strokeWidth="2"/><circle cx="165" cy="166" r="4" fill="#163b46"/><circle cx="207" cy="166" r="4" fill="#163b46"/>
            <rect x="32" y="71" width="62" height="48" rx="12" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="m46 95 12-12 19 20m10 11 12 10-20-4" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="266" y="101" width="62" height="48" rx="12" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m280 125 12-12 19 20" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M54 225h42m-9-8 9 8-9 8m216-25h-34m9-8-9 8 9 8" stroke="#78a7a2" strokeWidth="2"/><circle cx="73" cy="183" r="13" fill="#d88770"/>
          </svg>
        ) : slug === "paper-world" ? (
          <svg data-paper-world-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m30 215 50-85 244 36-37 90Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="m67 217 49-62 69 11-20 53 72 15 35-57" stroke="#d4b775" strokeWidth="9"/>
            <path d="m228 179 26-90 62 37-18 63Z" fill="#78a7a2"/><path d="M90 164V72h90v108h-23V95h-44v73Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m113 95 25 54 19-54" fill="#e5eeee"/>
            <circle cx="215" cy="172" r="12" fill="#d88770"/><path d="m215 184-15 39h30Zm-12 8-17 14m40-14 15 11" fill="#d88770" stroke="#b66f5c" strokeWidth="2"/>
            <path d="m55 57 28-18 29 18-29 18Z" fill="#fffdf8" stroke="#a9c7c5"/>
          </svg>
        ) : slug === "note-taking-doodles" ? (
          <svg data-note-doodles-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="52" y="33" width="254" height="222" rx="10" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M82 68h127m-127 16h84m-84 17h107" stroke="#a9c7c5" strokeWidth="3"/>
            <path d="m87 141 49-13 32 30-49 14Zm32 31v37m0 0 49-15v-36M87 141v37l32 31" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="215" y="111" width="58" height="28" rx="6" fill="#f4e7c9"/><rect x="191" y="192" width="39" height="28" rx="6" fill="#d88770"/><rect x="261" y="189" width="31" height="28" rx="6" fill="#78a7a2"/>
            <path d="m237 142-24 44m34-44 26 40m-57-13-3 17 14-10" stroke="#b29659" strokeWidth="2"/><path d="m41 232 10-10 13 13-10 10Zm14 8 18 18m-18-18 12-12 18 18-12 12Z" fill="#d4b775"/>
          </svg>
        ) : slug === "night-garden" ? (
          <svg data-night-garden-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="34" y="33" width="292" height="219" rx="22" fill="#163b46"/><circle cx="277" cy="71" r="19" fill="#f4e7c9"/>
            <path d="M68 220V84h92v136M68 135h92m-68 0v85m23-85v85m23-85v85M111 84v19m-13 19q0-23 13-23t13 23Zm13-15 7-8m-47 8-7-8" fill="none" stroke="#91b9b4" strokeWidth="3"/>
            <path d="M219 113v-22m-18 22h36v51h-36Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/><path d="m213 165 69 54h-79Z" fill="#0d2833"/>
            <path d="M249 211q-9-52 51-62 5 50-51 62Zm0 0 38-48" fill="#78a7a2" stroke="#b4d2ca" strokeWidth="2"/><path d="M298 193q-11 13 0 18 11-5 0-18Z" fill="#e5eeee"/>
          </svg>
        ) : slug === "new-club-member" ? (
          <svg data-new-club-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="38" y="55" width="93" height="133" rx="8" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M54 78h59m-59 20h36m-36 25h59m-59 19h42m-42 20h50" stroke="#a9c7c5" strokeWidth="3"/>
            <rect x="165" y="55" width="148" height="68" rx="8" fill="#f4e7c9"/><path d="M183 89h24m-8-8 8 8-8 8m23-8h24m-8-8 8 8-8 8m23-8h24" stroke="#b29659" strokeWidth="2"/>
            <circle cx="205" cy="172" r="17" fill="#d88770"/><circle cx="274" cy="172" r="17" fill="#78a7a2"/><path d="M180 230v-25q25-26 50 0v25m19 0v-25q25-26 50 0v25M142 218h26m-8-8 8 8-8 8M33 247h294" stroke="#78a7a2" strokeWidth="3"/>
            <path d="m59 211 18-11 18 11-18 12Z" fill="#f4e7c9"/>
          </svg>
        ) : slug === "museum-of-tomorrow" ? (
          <svg data-museum-tomorrow-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M33 233h294M50 233v-36h125v36" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M73 127h65v37q0 25-32 25t-33-25Zm65 8h17q17 18 0 34h-17" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M82 113q-8-11 0-23m23 23q-8-11 0-23m23 23q-8-11 0-23" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="204" y="65" width="105" height="142" rx="7" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M220 87h72m-72 15h49m-49 31h18l8-10 9 20 10-10h27m-72 39h72m-72 16h42M174 145h23m-8-7 8 7-8 7" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m55 66 27-20 27 20-27 20Z" fill="#d88770"/><circle cx="277" cy="43" r="6" fill="#d4b775"/>
          </svg>
        ) : slug === "museum-visitor" ? (
          <svg data-museum-visitor-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="37" y="54" width="130" height="140" rx="4" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/><rect x="51" y="68" width="102" height="112" fill="#e5eeee"/><circle cx="82" cy="99" r="17" fill="#f4e7c9"/><path d="m51 157 36-25 25 19 41-36v65H51Z" fill="#78a7a2"/>
            <rect x="206" y="66" width="95" height="89" rx="4" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="m221 134 21-40 19 29 23-16" stroke="#d88770" strokeWidth="4"/>
            <path d="M204 177h67m-67 12h43M52 215h101m-88 0v24m77-24v24" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="234" cy="219" r="13" fill="#d88770"/><circle cx="278" cy="219" r="13" fill="#f4e7c9"/><path d="M216 256v-14q18-19 36 0v14m8 0v-14q18-19 36 0v14M178 103h17m-8-8 8 8-8 8" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "moon-market" ? (
          <svg data-moon-market-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M29 232h302M58 232V115h99v117M203 232V115h99v117" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m45 115 23-38h81l21 38Zm145 0 23-38h81l21 38Z" fill="#d88770"/><path d="M77 144h61v54H77Z" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="m84 178 13-20 14 16 20-21m-24 5 3-8m9 34 6 5" stroke="#78a7a2" strokeWidth="2"/><path d="M223 188h59v13h-59Zm13 0v-27m0 10q-18-2-17-15 17-1 17 15Zm23 17v-35m0 15q20-3 18-18-17 0-18 18Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M196 27a28 28 0 1 0 27 39 29 29 0 0 1-27-39Z" fill="#f4e7c9" stroke="#d4b775"/>
            <path d="M166 205h32v24h-32Zm4 8h24m-12-7v22" fill="#e5eeee" stroke="#78a7a2"/><circle cx="94" cy="46" r="4" fill="#d4b775"/><path d="M284 31v15m-7-7h14" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "mountain-cabin" ? (
          <svg data-mountain-cabin-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M31 235h298M46 235V92l134-61 133 61v143M46 92h267" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M64 114h64v55H64Zm32 0v55m-32-28h64" fill="#e5eeee" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M157 177h67v12h-67Zm10 12v42m47-42v42M241 232v-46h41v46m-41-46v-21h41v21" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M148 121h58m-50 0v30h15v-20h15v20h14v-30m15 31h75m-64-34h19v32h-19m31-17h17v17h-17Z" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M78 231v-44h48v44m-48-44v-13h48v13" fill="#d88770"/><path d="M54 252h252" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "message-tone" ? (
          <svg data-message-tone-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="112" y="29" width="136" height="231" rx="20" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/><path d="M153 44h54m-42 201h31" stroke="#a9c7c5" strokeWidth="3"/>
            <path d="M127 66h105v49h-74l-17 12v-12h-14Z" fill="#e5eeee"/><path d="M143 82h69m-69 16h43" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M144 145h88v46h-13v12l-17-12h-58Z" fill="#f4e7c9"/><path d="M160 160h54m-54 15h31" stroke="#b29659" strokeWidth="2"/>
            <circle cx="62" cy="102" r="27" fill="#e5eeee" stroke="#a9c7c5"/><path d="M54 94q9-11 17 0 5 8-8 12v5m0 5v3" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="267" y="137" width="59" height="46" rx="9" fill="#d88770"/><path d="M288 150v20m13-20v20M64 150v44m-10-27h20m202-66h37m-37 11h23" stroke="#78a7a2" strokeWidth="3"/>
          </svg>
        ) : slug === "magic-shopkeeper" ? (
          <svg data-magic-shop-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M38 228h284M52 228V64h256v164M52 102h256M52 167h256" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M42 64h276l-21-26H63Z" fill="#d88770"/><path d="M77 119h34v36H77Zm5-9h24v9H82Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="M145 151q22-40 44 0m-22-14v24m-7 0h14" stroke="#78a7a2" strokeWidth="2"/><path d="M224 117h45v37h-45Z" fill="#e5eeee" stroke="#a9c7c5"/><path d="M232 130h29m-29 10h20" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="72" y="181" width="68" height="34" rx="4" fill="#e5eeee"/><path d="m82 199 14 7 24-15m-7-1 7 1-2 8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M185 215v-26h20v26m20 0v-34h20v34m20 0v-23h20v23" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m293 102 11-9 15 9v22h-26Z" fill="#fffdf8" stroke="#78a7a2"/><circle cx="306" cy="109" r="3" fill="#d88770"/>
          </svg>
        ) : slug === "lost-letter-adventure" ? (
          <svg data-lost-letter-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M32 221h296M57 220v-89l38-28 39 28v89" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M74 170h43m-43 13h28M160 212h156M181 212v-52m114 52v-52M163 160h151" stroke="#a9c7c5" strokeWidth="3"/>
            <rect x="163" y="69" width="139" height="85" rx="7" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <path d="m167 73 66 47 65-47m-131 77 44-40m87 40-44-40" stroke="#d4b775" strokeWidth="2"/>
            <path d="M48 137h31v37H48Zm7-10h17l7 10H48Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><circle cx="63" cy="154" r="7" fill="#d88770"/>
            <path d="M109 75q33-43 69-30M125 65l-16 10 1-19M211 238h65m-65 10h43" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "kitchen-improviser" ? (
          <svg data-kitchen-improviser-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M29 225h302M45 225v-17h270v17" stroke="#78a7a2" strokeWidth="3"/><path d="M51 133h120v50q0 24-25 24H76q-25 0-25-24Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M43 130h136M87 119q-14-17 0-34m37 34q-14-17 0-34M171 148h19v29h-19" stroke="#a9c7c5" strokeWidth="3"/>
            <path d="M220 172h64q-6 30-32 30t-32-30Z" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m261 164 22-49" stroke="#78a7a2" strokeWidth="4"/>
            <rect x="207" y="57" width="90" height="41" rx="7" fill="#fffdf8" stroke="#a9c7c5"/><path d="M223 72h58m-58 12h39" stroke="#a9c7c5" strokeWidth="2"/><circle cx="84" cy="237" r="9" fill="#d88770"/><circle cx="114" cy="237" r="9" fill="#f4e7c9"/><circle cx="144" cy="237" r="9" fill="#78a7a2"/>
          </svg>
        ) : slug === "long-distance-postcard" ? (
          <svg data-distance-postcard-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M29 61h302v164H29Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M188 77v128M206 145h102m-102 21h102m-102 21h71" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M266 78h43v43h-43Z" fill="#f4e7c9" stroke="#d4b775"/><path d="m279 100 8-11 9 11-9 11Z" fill="#d88770"/>
            <path d="M56 183h106M72 183v-31h40v31m-30-39q-16-5-12-28 19 0 18 20m0 47v-49q21-27 38-10-8 22-38 17" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M48 242h44m20 0h44m20 0h44m20 0h44m20 0h17" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "lost-key-search" ? (
          <svg data-search-approaches-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="32" y="42" width="296" height="196" rx="15" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M130 56v168M228 56v168" stroke="#e5eeee" strokeWidth="2"/>
            <path d="M58 187v-61h47V79" stroke="#78a7a2" strokeWidth="3"/><circle cx="58" cy="187" r="9" fill="#d88770"/><circle cx="58" cy="125" r="7" fill="#f4e7c9"/><circle cx="105" cy="79" r="7" fill="#78a7a2"/>
            <path d="M147 85h63v91h-63Zm0 30h63m-63 30h63m-32-60v91" stroke="#78a7a2" strokeWidth="2"/><path d="m154 101 6 6 11-15" stroke="#d88770" strokeWidth="3"/>
            <path d="M246 91h64v63h-28l-17 18v-18h-19Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M260 110h36m-36 16h23" stroke="#b29659" strokeWidth="2"/>
          </svg>
        ) : slug === "island-day" ? (
          <svg data-postcard-island-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="28" y="42" width="304" height="201" rx="13" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/><path d="M43 210q34-12 68 0t68 0 68 0 68 0M43 225q34-12 68 0t68 0 68 0 68 0" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m48 185 37-35 35 9 46-34 46 31 46-14 55 43" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M67 145h37l-7-14v-14q-12-22-24 0v14ZM83 146v5" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/>
            <rect x="133" y="72" width="61" height="61" rx="5" fill="#f4e7c9"/><path d="m142 112 12-23 13 22 18-15v29h-43Z" fill="#d88770"/><circle cx="180" cy="85" r="6" fill="#78a7a2"/>
            <rect x="223" y="91" width="70" height="83" rx="4" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M236 108h44m-44 16h44m-44 16h22M283 54h30v22h-30Z" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "inside-joke" ? (
          <svg data-inside-joke-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M35 45h174v93H94l-26 22v-22H35Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M59 68h121M59 87h92M59 106h47" stroke="#a9c7c5" strokeWidth="3"/>
            <path d="M219 76h103v87h-23l-17 17v-17h-63Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/><path d="m240 106 12-12 12 12m-18 26q20 14 40-2" stroke="#b29659" strokeWidth="3"/>
            <path d="M73 229h212M95 229v-21m35 21v-21m99 21v-21m35 21v-21" stroke="#78a7a2" strokeWidth="3"/><circle cx="112" cy="182" r="20" fill="#d88770"/><circle cx="246" cy="183" r="20" fill="#78a7a2"/><path d="M151 194h53m-53 14h36" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "house-of-doors" ? (
          <svg data-house-doors-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M25 241h310M35 241V77l48-32 46 32v164M139 241V77l45-32 44 32v164M238 241V77l45-32 42 32v164" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m45 241 66-14V87L45 77Z" fill="#d88770"/><circle cx="99" cy="163" r="4" fill="#f4e7c9"/>
            <path d="M152 225V91h62v134" fill="#e5eeee"/><path d="M166 152q18-35 36 0m-30 15q12-25 24 0m-18 16q6-13 12 0" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M249 225V91h63v134" fill="#f4e7c9"/><path d="M281 212v-58m0 26q-29-4-23-25 23 0 23 25Zm0-13q28-5 22-28-23 2-22 28Z" fill="#78a7a2" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m40 259 58 0 32-10m18 10h66m27 0h69" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "group-project-finale" ? (
          <svg data-project-finale-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M35 222h290M59 222V98l72-42 75 42v124" fill="#e5eeee" stroke="#78a7a2" strokeWidth="3"/>
            <path d="m59 98 72 44 75-44m-75 44v80m0-166v86" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M224 60h92v122h-92Z" fill="#fffdf8" stroke="#d4b775" strokeWidth="2"/><path d="m239 84 7 7 11-14m-18 35 7 7 11-14m-18 35 7 7 11-14M267 84h35m-35 28h35m-35 28h35" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="253" cy="210" r="19" fill="#d88770"/><circle cx="294" cy="210" r="19" fill="#f4e7c9"/><path d="M245 210h16m25 0h16" stroke="#fffdf8" strokeWidth="3"/>
          </svg>
        ) : slug === "group-trip-seatmate" ? (
          <svg data-trip-seatmate-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="41" y="31" width="278" height="110" rx="18" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="M180 31v110M50 103l70-40 58 40 63-51 70 51" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M63 161h74v69H63Zm159 0h74v69h-74Z" fill="#d88770"/><path d="M63 161v-22h74v22m85 0v-22h74v22" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M153 173h54v12h-54Zm27 12v54" fill="#f4e7c9" stroke="#b29659" strokeWidth="2"/><path d="m80 175 20 8 20-8v32l-20 8-20-8Z" fill="#fffdf8" stroke="#a9c7c5"/><path d="M100 183v32" stroke="#a9c7c5"/>
            <path d="M239 174h41v27h-24l-8 8v-8h-9Z" fill="#fffdf8" stroke="#78a7a2"/><path d="M249 185h21" stroke="#78a7a2"/>
          </svg>
        ) : slug === "hosting-a-guest" ? (
          <svg data-guest-welcome-scene="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M65 238V49h142v189" fill="#e5eeee" stroke="#78a7a2" strokeWidth="3"/><path d="m88 238 84-13V70L88 49Z" fill="#78a7a2"/><circle cx="151" cy="151" r="5" fill="#f4e7c9"/>
            <rect x="227" y="75" width="81" height="107" rx="8" fill="#fffdf8" stroke="#d4b775" strokeWidth="2"/><path d="M243 97h48m-48 18h48m-48 18h32m-32 18h38" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="231" y="199" width="64" height="39" rx="4" fill="#d88770"/><path d="M247 199v-12h31v12M215 238h100" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "harbor-light" ? (
          <svg data-harbor-three-designs="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="27" y="26" width="306" height="236" rx="22" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M47 218q24-12 48 0t48 0 48 0 48 0 48 0 28 0m-268 16q24-12 48 0t48 0 48 0 48 0 48 0 28 0" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m99 211 12-108h44l12 108Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="105" y="80" width="57" height="25" rx="3" fill="#f4e7c9" stroke="#b29659"/><path d="m99 80 34-23 35 23" fill="#d88770"/>
            <path d="M106 143h55m-59 35h62m-31-121v-9m-16 55V82m31 21V82" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M194 69h106v54H194Z" fill="#f4e7c9" stroke="#d4b775"/><circle cx="211" cy="89" r="5" fill="#d88770"/><circle cx="230" cy="89" r="5" fill="#d88770"/><path d="M249 89h33m-73 18h73" stroke="#b29659" strokeWidth="2"/>
            <path d="M198 153h48q11 0 11 9v42q-27-10-59 0Zm59 9q0-9 11-9h34v51q-24-10-45 0Z" fill="#e5eeee" stroke="#78a7a2"/>
            <path d="M209 167h34m-34 12h34m27-12h21m-21 12h21" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "group-chat-role" ? (
          <svg data-chat-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="45" y="25" width="270" height="238" rx="21" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M67 58h226" stroke="#a9c7c5"/><circle cx="76" cy="43" r="5" fill="#d4b775"/><circle cx="93" cy="43" r="5" fill="#78a7a2"/>
            <path d="M82 79h148a9 9 0 0 1 9 9v38a9 9 0 0 1-9 9H102l-20 14v-14a9 9 0 0 1-9-9V88a9 9 0 0 1 9-9Z" fill="#e5eeee" stroke="#78a7a2"/>
            <path d="M96 96h113m-113 13h91m-91 13h68" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M152 153h121a9 9 0 0 1 9 9v38a9 9 0 0 1-9 9h-7v14l-20-14h-94a9 9 0 0 1-9-9v-38a9 9 0 0 1 9-9Z" fill="#f4e7c9" stroke="#d4b775"/>
            <path d="m190 165 5 10 11 5-11 5-5 10-5-10-11-5 11-5Z" fill="#d88770"/><circle cx="226" cy="181" r="4" fill="#b29659"/><circle cx="243" cy="181" r="4" fill="#b29659"/>
            <circle cx="83" cy="218" r="15" fill="#d88770"/><circle cx="113" cy="218" r="15" fill="#123e48"/><path d="M78 219h10m20 0h10" stroke="#fffdf8" strokeWidth="2"/>
          </svg>
        ) : slug === "gift-note" ? (
          <svg data-note-three-emphases="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="29" y="30" width="302" height="232" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M62 128h236v105H62Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m62 128 118 70 118-70M62 233l84-57m152 57-84-57" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="83" y="63" width="194" height="117" rx="8" fill="#fffdf8" stroke="#a9c7c5"/>
            <rect x="99" y="81" width="42" height="42" rx="7" fill="#f4e7c9"/><path d="m106 110 10-12 8 7 10-14" stroke="#b29659" strokeWidth="2"/>
            <circle cx="180" cy="102" r="21" fill="#e5eeee"/><path d="m169 103 8 8 15-17" stroke="#78a7a2" strokeWidth="3"/>
            <path d="m237 81 6 14 15 7-15 7-6 14-6-14-15-7 15-7Z" fill="#d88770"/>
            <path d="M103 143h154m-154 15h117" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="49" cy="73" r="5" fill="#d4b775"/><circle cx="309" cy="209" r="5" fill="#d88770"/>
          </svg>
        ) : slug === "garden-season" ? (
          <svg data-garden-three-rhythms="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="25" y="30" width="310" height="232" rx="22" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M49 215h263M49 232h263" stroke="#a9c7c5" strokeWidth="2"/>
            <rect x="49" y="96" width="73" height="119" rx="9" fill="#e5eeee"/>
            <path d="M86 194v-36m0 15q-24 0-24-22 24 0 24 22m0-11q24 0 24-24-24 0-24 24" stroke="#78a7a2" strokeWidth="2" fill="#b9d0bf"/>
            <path d="m65 194 41 0m-20-39v-31" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="86" cy="113" r="9" fill="#d88770"/>
            <rect x="145" y="96" width="73" height="119" rx="9" fill="#f4e7c9"/>
            <path d="M181 195v-37m0 16q-22 0-22-19 22 0 22 19m0 7q24 0 24-20-24 0-24 20" stroke="#78a7a2" strokeWidth="2" fill="#b9d0bf"/>
            <circle cx="181" cy="144" r="14" fill="#d88770"/><circle cx="181" cy="144" r="5" fill="#f4e7c9"/>
            <path d="m157 195 49 0" stroke="#b29659" strokeWidth="2"/>
            <rect x="241" y="96" width="73" height="119" rx="9" fill="#e5eeee"/>
            <path d="M252 187h49m-49 9h49m-49 9h49" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M278 166v-34m-12 17 12-9 12 9m-12-20v-9m-20 47h40" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M58 63h52m45 0h52m45 0h52" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="126" cy="61" r="4" fill="#d4b775"/><circle cx="222" cy="61" r="4" fill="#d4b775"/>
          </svg>
        ) : slug === "game-night-reset" ? (
          <svg data-reset-three-choices="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="28" y="34" width="304" height="226" rx="22" fill="#fffdf8" stroke="#a9c7c5"/>
            <rect x="97" y="88" width="166" height="126" rx="12" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M116 114h128M116 140h128M116 166h128M116 192h128M141 99v105m38-105v105m38-105v105" stroke="#a9c7c5"/>
            <circle cx="140" cy="140" r="12" fill="#d88770"/><circle cx="216" cy="166" r="12" fill="#123e48"/>
            <path d="M55 59h74a9 9 0 0 1 9 9v25a9 9 0 0 1-9 9H87l-18 13v-13H55a9 9 0 0 1-9-9V68a9 9 0 0 1 9-9Z" fill="#fffdf8" stroke="#78a7a2"/>
            <path d="M64 79h51m-51 10h35" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="245" y="59" width="48" height="48" rx="9" fill="#f4e7c9" stroke="#d4b775"/><path d="M256 83h26m-13-13v26" stroke="#b29659" strokeWidth="3"/>
            <rect x="241" y="192" width="61" height="43" rx="11" fill="#fffdf8" stroke="#a9c7c5"/><path d="M263 202v23m15-23v23" stroke="#78a7a2" strokeWidth="5"/>
            <path d="M54 233h154" stroke="#a9c7c5" strokeWidth="2"/><circle cx="62" cy="181" r="8" fill="#d4b775"/>
          </svg>
        ) : slug === "friendship-invitation" ? (
          <svg data-invitation-three-emphases="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="26" y="28" width="308" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M77 121h190v114H77Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m77 121 95 69 95-69M77 235l67-65m123 65-67-65" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="98" y="65" width="148" height="109" rx="8" fill="#fffdf8" stroke="#a9c7c5"/>
            <rect x="111" y="80" width="33" height="31" rx="4" fill="#f4e7c9" stroke="#d4b775"/>
            <path d="M111 89h33m-25-13v9m17-9v9m-17 12h17" stroke="#b29659"/>
            <path d="M157 87h69m-69 13h50M112 129h92m-92 13h114m-114 13h70" stroke="#a9c7c5" strokeWidth="2"/>
            <g transform="translate(264 74)"><path d="M0 5q7-13 15 0 8-13 15 0 3 9-15 23Q-3 14 0 5Z" fill="#d88770"/></g>
            <rect x="208" y="203" width="87" height="32" rx="16" fill="#fffdf8" stroke="#d4b775"/>
            <path d="m219 219 5 5 9-11m13 6h11m12 0h12" stroke="#78a7a2" strokeWidth="2"/>
            <circle cx="61" cy="63" r="7" fill="#d4b775"/><path d="M47 179h18m-9-9v18" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "forest-soundtrack" ? (
          <svg data-forest-three-endings="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="26" y="28" width="308" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M44 232h270" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M74 227 84 125l-18-32 20 9 5-42 16 48 26-13-18 31 9 101Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <ellipse cx="99" cy="171" rx="14" ry="23" fill="#78a7a2"/>
            <path d="M129 164q17 10 0 20m10-28q30 20 0 36" stroke="#a9c7c5" strokeWidth="2"/>
            <g fill="#f4e7c9" stroke="#d4b775"><path d="m169 104 23-13 19 18 19-4-19 16-23-5Z"/><path d="m238 79 20-9 17 15 16-4-15 17-20-4Z"/><path d="m235 135 19-14 22 14 18-3-19 16-23-5Z"/></g>
            <path d="M160 210h143M160 219h143M160 228h143" stroke="#a9c7c5"/>
            <path d="M177 214v-20l11-3v20m-11 3q-10-4-10 3t10-3m11-3q-10-4-10 3t10-3" stroke="#78a7a2" strokeWidth="2"/>
            <rect x="240" y="194" width="24" height="36" rx="4" fill="#fffdf8" stroke="#d88770" strokeDasharray="3 3"/>
            <circle cx="171" cy="62" r="7" fill="#d88770"/><path d="M283 179h18m-9-9v18" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "festival-mask" ? (
          <svg data-mask-three-actions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="26" y="28" width="308" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M51 79q128-33 257 0" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="m99 100 75-20 82 20-11 80-71 39-65-39Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M124 122h39v37h-39Zm64 0h39v37h-39Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M170 179q12 10 24 0" stroke="#78a7a2" strokeWidth="2"/>
            <g transform="translate(52 109)"><path d="M0 29q9-12 9-21 0-10 10-10T29 8q0 9 9 21Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M12 32q7 13 14 0" stroke="#d4b775" strokeWidth="2"/></g>
            <path d="M255 115q56 20 20 48t20 46M247 145q-11 32 17 48t-5 40" stroke="#d88770" strokeWidth="7"/>
            <path d="M51 225h58m-14-9 15 9-15 9M143 243h72" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="271" cy="58" r="7" fill="#d4b775"/><path d="M68 49h16m-8-8v16" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "floating-house" ? (
          <svg data-house-three-connections="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M29 234h303M43 249h77m133 0h54" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M88 128 175 56l91 72" fill="#d88770" stroke="#b46e5c" strokeWidth="2"/>
            <path d="M105 128h142v95H105Z" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M126 146h39v40h-39ZM183 153h38v70h-38Z" fill="#f4e7c9" stroke="#d4b775"/>
            <path d="M145 146v40m-19-20h39M184 222h43v10h-34v9h43v10h-33" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M108 211q-22 35-47 21v-26" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M46 206h30l-5 29H51Z" fill="#d88770"/><path d="M61 204v-20m0 10q-22-2-20-14 17-2 20 14m0-9q18-4 20-16-20 1-20 16" fill="#78a7a2"/>
            <path d="M258 110q54-15 49-58m-8 7 8-10 6 12" stroke="#78a7a2" strokeWidth="2" strokeDasharray="5 4"/>
            <path d="m271 160 39-8 4 30-39 8Z" fill="white" stroke="#a9c7c5"/><path d="m273 163 20 10 17-18" stroke="#a9c7c5"/>
            <circle cx="65" cy="72" r="8" fill="#d4b775"/><path d="M44 106h20m-10-10v20" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "firefly-evening" ? (
          <svg data-firefly-three-endings="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M44 222h270M51 106q78 28 162-9" stroke="#a9c7c5" strokeWidth="2"/>
            <g fill="#f4e7c9" stroke="#d4b775"><path d="m64 118 17 4 9 20-19 8-12-16Z"/><path d="m112 125 18-2 10 17-16 14-17-12Z"/><path d="m164 117 17-4 12 19-14 16-17-12Z"/></g>
            <g transform="translate(245 70)"><path d="m0 15 21-15 21 15-4 42H4Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/><path d="M21 0v57M4 17h34M-10 30h-9m71 0h9" stroke="#b29659" strokeWidth="2"/></g>
            <g transform="translate(67 187)"><path d="M0 0h99v22H0Zm10-21h79V0H10Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M12 22v14m75-14v14" stroke="#78a7a2" strokeWidth="3"/></g>
            <g transform="translate(213 170)"><rect width="83" height="43" rx="4" fill="white" stroke="#a9c7c5"/><path d="M43 0v43M9 31l10-13 10 9 9-7M53 12h21m-21 9h15m-15 9h21" stroke="#78a7a2" strokeWidth="2"/></g>
            <circle cx="203" cy="56" r="7" fill="#d88770"/><path d="M78 60h18m-9-9v18" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "fictional-cafe" ? (
          <svg data-cafe-three-invitations="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M46 220h267M60 220v19m239-19v19" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(53 126)"><ellipse cx="49" cy="73" rx="49" ry="16" fill="#e5eeee" stroke="#78a7a2"/><path d="m17 38 24 5 16-9-9 24H30Z" fill="#d88770"/><path d="M40 43V0l27 34H40Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M0 12V0h12m74 12V0H74" stroke="#a9c7c5" strokeWidth="2"/></g>
            <g transform="translate(163 62)"><rect width="97" height="62" rx="6" fill="#f4e7c9" stroke="#d4b775"/><path d="M13 18h64m-64 14h47m-47 14h60M47 62v30m-13-11 13 12 13-12" stroke="#b29659" strokeWidth="2"/></g>
            <g transform="translate(229 164)"><path d="M0 11q27-24 52-3t4 35q-5 6-15-1t-14 3Q5 57 0 35Z" fill="#e5eeee" stroke="#78a7a2"/><circle cx="16" cy="14" r="7" fill="#d88770"/><circle cx="36" cy="13" r="7" fill="#d4b775"/><circle cx="50" cy="30" r="7" fill="#78a7a2"/><path d="M10 37h16" stroke="#538c88" strokeWidth="2"/></g>
            <path d="M75 68h20m-10-10v20M279 91h24" stroke="#a9c7c5" strokeWidth="2"/><circle cx="174" cy="190" r="7" fill="#d88770"/>
          </svg>
        ) : slug === "festival-companion" ? (
          <svg data-festival-three-arrangements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M42 67q135 45 276-5" stroke="#a9c7c5" strokeWidth="2"/><path d="m66 74 17 5-14 17Zm43 10 18 3-12 18Zm48 6 18 1-10 20Zm48-1 18-2-7 20Zm48-7 18-4-4 21Zm40-13 16-6 1 21Z" fill="#d88770"/>
            <g transform="translate(49 131)"><path d="m0 26 44-26 44 26v65H0Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M8 91V33h72v58M8 36q15 35 30 0m12 0q15 35 30 0" stroke="#78a7a2" strokeWidth="2"/><path d="m44 45 4 9 10 1-8 7 2 10-8-5-9 5 2-10-7-7 10-1Z" fill="#d4b775"/></g>
            <path d="M154 209q27-22 26-59m-11 9 11-11 9 13m-25 48q35 8 59-5m-9-6 12 5-7 12" stroke="#78a7a2" strokeWidth="3" strokeDasharray="5 4"/>
            <g transform="translate(236 126)"><rect width="68" height="61" rx="6" fill="#f4e7c9" stroke="#d4b775"/><path d="M11 45 27 16l17 29Zm24-20 15-9 10 18-16 8Z" stroke="#b29659" strokeWidth="2"/><path d="M10 61v34m47-34v34M4 95h60" stroke="#78a7a2" strokeWidth="3"/></g>
            <circle cx="180" cy="129" r="12" fill="#d88770"/><path d="M170 129h20m-10-10v20" stroke="white" strokeWidth="2"/>
          </svg>
        ) : slug === "fantasy-party-role" ? (
          <svg data-fantasy-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M48 216h263M65 216v-54h55v54m121 0v-75h58v75M75 162v-22h35v22m143-21v-21h32v21" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(46 53)"><path d="m0 12 33-12 34 12 30-12v83l-30 12-34-12L0 95Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M33 0v83m34-71v83M12 65q22-38 46-16t26-23" stroke="#78a7a2" strokeWidth="2" strokeDasharray="4 3"/><circle cx="16" cy="61" r="5" fill="#d88770"/></g>
            <g transform="translate(163 105)"><path d="M0 0h50v62H0Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M8 0q17-29 34 0M12 62l-8 16h42l-8-16" stroke="#b29659" strokeWidth="3"/><path d="m25 15 10 22-10 12-10-12Z" fill="#d4b775"/></g>
            <g transform="translate(259 71)"><path d="m-18 26 36-36 10 10-36 36Z" fill="#d88770"/><path d="m-25-5 10 3 5 10-10 4-9-7Zm48 40 11-4 8 8-3 11-12 1-6-9Z" fill="#78a7a2"/><circle cx="7" cy="9" r="20" stroke="#d4b775" strokeWidth="2" strokeDasharray="4 4"/></g>
            <path d="M141 194q37 16 87-6M156 57h18m-9-9v18" stroke="#a9c7c5" strokeWidth="2"/><circle cx="290" cy="192" r="7" fill="#d4b775"/>
          </svg>
        ) : slug === "escape-room-role" ? (
          <svg data-escape-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <g transform="translate(46 63)"><rect width="70" height="82" rx="6" fill="#e5eeee" stroke="#78a7a2"/><circle cx="22" cy="24" r="8" stroke="#538c88" strokeWidth="2"/><path d="m48 49-10 17h20Z" stroke="#538c88" strokeWidth="2"/><path d="m26 31 18 18" stroke="#78a7a2" strokeWidth="2" strokeDasharray="4 3"/></g>
            <g transform="translate(137 95)"><rect width="83" height="98" rx="6" fill="#f4e7c9" stroke="#d4b775"/><path d="M12 20h45m-45 16h26M19 68h45m-8-7 9 7-9 7" stroke="#b29659" strokeWidth="2"/><circle cx="20" cy="68" r="8" fill="#d88770"/></g>
            <g transform="translate(243 52)"><rect width="62" height="89" rx="6" fill="white" stroke="#a9c7c5"/><path d="m11 20 4 4 9-10m-13 32 4 4 9-10m-13 32 4 4 9-10M33 20h17M33 46h17M33 72h17" stroke="#78a7a2" strokeWidth="2"/></g>
            <g transform="translate(264 193)"><circle r="26" fill="#f5e5dc" stroke="#d88770"/><path d="M0-17V0l12 7M-6-33H6" stroke="#d88770" strokeWidth="3" strokeLinecap="round"/></g>
            <path d="M63 218h137m-55-65-22 30m102-89 13-7" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 4"/><circle cx="72" cy="196" r="8" fill="#d4b775"/>
          </svg>
        ) : slug === "enchanted-library" ? (
          <svg data-library-three-clues="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M45 218h270M55 77h87m-87 62h87M59 77V48h14v29m6 0V42h20v35m6 0V51h16v26" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(52 154)"><path d="M0 0h73v49H0Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M12 12h42m-42 12h29m-29 12h48" stroke="#b29659" strokeWidth="2"/><path d="m57-6 13 15-24 26-10 3 3-10Z" fill="#d88770"/></g>
            <g transform="translate(159 64)"><path d="M0 0q25-12 50 0v99q-25-12-50 0Zm50 0q25-12 50 0v77l-11 4 4 9-18-3-5 10q-10-4-20 2Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="M11 21h26m-26 17h26m26-17h25m-25 17h25M50 0v99" stroke="#a9c7c5" strokeWidth="2"/></g>
            <g transform="translate(228 177)"><path d="M0 0h66v40H38l-12 12V40H0Z" fill="#f5e5dc" stroke="#d88770"/><circle cx="17" cy="20" r="3" fill="#d88770"/><circle cx="33" cy="20" r="3" fill="#d88770"/><circle cx="49" cy="20" r="3" fill="#d88770"/></g>
            <path d="M84 102h42m-9-7 10 7-10 7M171 200h29m-7-7 9 7-9 7" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="4 3"/><circle cx="292" cy="59" r="8" fill="#d4b775"/>
          </svg>
        ) : slug === "dream-train" ? (
          <svg data-train-three-endings="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M50 223h260M62 233h237m-214-10v10m43-10v10m44-10v10m43-10v10m43-10v10" stroke="#78a7a2" strokeWidth="2"/>
            <g transform="translate(52 144)"><rect width="99" height="57" rx="10" fill="#78a7a2" stroke="#538c88"/><rect x="12" y="12" width="30" height="22" rx="3" fill="#e5eeee"/><rect x="53" y="12" width="30" height="22" rx="3" fill="#f4e7c9"/><circle cx="22" cy="64" r="11" fill="#193c4b"/><circle cx="77" cy="64" r="11" fill="#193c4b"/></g>
            <g transform="translate(58 66)"><path d="M0 0h80v39q-10 7 0 14v14H0V53q10-7 0-14Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M13 19h49m-49 14h32m-32 14h43" stroke="#b29659" strokeWidth="2"/></g>
            <g transform="translate(160 74)"><rect width="66" height="45" rx="4" fill="#f5e5dc" stroke="#d88770"/><path d="m0 0 33 25L66 0M0 45l22-24m44 24L44 21" stroke="#d88770"/></g>
            <g transform="translate(242 130)"><path d="M4 0h62v36H4Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M13 13h43m-43 11h29M17 36v55m35-55v55" stroke="#78a7a2" strokeWidth="2"/></g>
            <path d="M149 133q62 10 90-24" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 5"/><circle cx="288" cy="64" r="9" fill="#d4b775"/>
          </svg>
        ) : slug === "dragon-housemate" ? (
          <svg data-dragon-shared-home="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M45 225h270M57 207v-48h88v48m-73 0v18m58-18v18" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M84 160v-34h42v34" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/>
            <g transform="translate(175 73)"><path d="M63 97q33-36 15-58-16-20-32-7L36 18 23 35q-19 0-21 18-2 22 22 22v27q-29 7-33 28h74q41-1 45-27-18 16-47-6Z" fill="#78a7a2" stroke="#538c88" strokeWidth="2"/><path d="m52 69 35-15-8 38-18-9" fill="#a9c7c5" stroke="#538c88"/><path d="m27 33 4-16 9 13M58 26l8-12 2 18" stroke="#d4b775" strokeWidth="3"/><circle cx="17" cy="51" r="3" fill="#193c4b"/><path d="M6 63q10 5 19-2" stroke="#193c4b" strokeWidth="2"/></g>
            <g transform="translate(50 57)"><rect width="81" height="40" rx="5" fill="#e5eeee" stroke="#a9c7c5"/><path d="M13 13h24m-24 13h48M50 0v40" stroke="#78a7a2"/></g>
            <circle cx="158" cy="196" r="7" fill="#d88770"/><circle cx="178" cy="205" r="6" fill="#d4b775"/><circle cx="151" cy="216" r="5" fill="#a9c7c5"/><path d="M290 60h18m-9-9v18" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "dinner-host" ? (
          <svg data-dinner-three-arrangements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M50 218h260M65 218v20m230-20v20" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(46 57)"><rect width="58" height="111" rx="6" fill="#e5eeee" stroke="#78a7a2"/><circle cx="13" cy="23" r="4" fill="#d88770"/><circle cx="13" cy="55" r="4" fill="#d4b775"/><circle cx="13" cy="87" r="4" fill="#78a7a2"/><path d="M24 23h22M24 55h22M24 87h22M13 28v22m0 10v22" stroke="#78a7a2"/></g>
            <g transform="translate(124 100)"><ellipse cx="52" cy="50" rx="49" ry="35" fill="#f4e7c9" stroke="#d4b775"/><circle cx="31" cy="47" r="13" fill="#d88770"/><circle cx="66" cy="35" r="10" fill="#78a7a2"/><path d="M55 59q12-15 25 0-9 15-25 0Z" fill="#a9c7c5"/></g>
            <g transform="translate(247 116)"><path d="M0 34h61v12H0Z" fill="#78a7a2"/><path d="M8 4h45v23H8Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M8 46v36m45-36v36" stroke="#78a7a2" strokeWidth="3"/></g>
            <path d="M133 62h38m-6-5 7 5-7 5" stroke="#a9c7c5" strokeWidth="2"/><circle cx="287" cy="61" r="10" fill="#d4b775"/><path d="M138 193h68" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "desk-reset" ? (
          <svg data-desk-three-arrangements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M43 218h274M55 218v20m251-20v20" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(44 76)"><rect x="0" y="29" width="64" height="85" rx="5" fill="#e5eeee" stroke="#78a7a2"/><path d="M10 0v61m15-48v48m13-55v55m13-35v35" stroke="#78a7a2" strokeWidth="4"/><rect x="0" y="64" width="64" height="50" rx="5" fill="#e5eeee" stroke="#78a7a2"/></g>
            <g transform="translate(123 115)"><path d="M0 0h80v75H0Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M0 18h80M25 0v75m30-75v75" stroke="#d4b775"/><path d="M31-1v-17h18v17" stroke="#d4b775" strokeWidth="3"/><circle cx="13" cy="42" r="5" fill="#d88770"/><path d="M35 33h11v23H35Z" fill="#78a7a2"/></g>
            <g transform="translate(226 85)"><rect width="76" height="106" rx="4" fill="white" stroke="#a9c7c5"/><path d="M12 19h22m-22 13h47" stroke="#a9c7c5"/><path d="m12 79 37-34 7 8-37 34-10 3Z" fill="#d88770" stroke="#d88770"/></g>
            <path d="M53 55h43m149 164h40" stroke="#d4b775" strokeWidth="2"/><circle cx="300" cy="54" r="7" fill="#d4b775"/>
          </svg>
        ) : slug === "desert-oasis" ? (
          <svg data-oasis-three-spaces="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="28" width="312" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M43 230q59-29 114-4t159-6" stroke="#d4b775" strokeWidth="3"/>
            <g transform="translate(45 64)"><path d="M36 18v144" stroke="#78a7a2" strokeWidth="5"/><path d="M0 22h65l15 17-15 17H0Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M15 80h65v34H15L0 97Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M12 39h43m-32 58h41" stroke="#78a7a2" strokeWidth="2"/></g>
            <g transform="translate(147 57)"><rect width="67" height="91" rx="5" fill="#f5e5dc" stroke="#d88770"/><path d="M0 31h67M0 61h67M22 0v91M45 0v91" stroke="#fffdf8" strokeWidth="3"/><circle cx="12" cy="15" r="6" fill="#d4b775"/><path d="m29 48 8-10 7 12m5 25 7-8 8 9" stroke="#78a7a2" strokeWidth="2"/><rect x="27" y="66" width="12" height="16" fill="#d88770"/></g>
            <g transform="translate(225 143)"><path d="M0 28h84v14H0Z" fill="#78a7a2"/><path d="M8 0h68v20H8Z" fill="#f4e7c9" stroke="#d4b775"/><path d="M11 42v33m61-33v33" stroke="#78a7a2" strokeWidth="4"/></g>
            <path d="M239 63q38 0 47 54M239 63q5 36 47 54M286 117v19" stroke="#a9c7c5" strokeWidth="2"/><circle cx="285" cy="66" r="10" fill="#d4b775"/>
          </svg>
        ) : slug === "date-plan-detour" ? (
          <svg data-detour-three-moves="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="25" y="28" width="310" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M55 222h89q32 0 32-32V99q0-26 26-26h82" stroke="#78a7a2" strokeWidth="4" strokeDasharray="7 6"/><path d="m273 62 13 11-13 11" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(48 55)"><rect width="79" height="95" rx="7" fill="#f4e7c9" stroke="#d4b775"/><path d="M0 25h79M18 0v14m43-14v14" stroke="#b29659" strokeWidth="2"/><path d="M39 73 23 58q-10-19 5-19 8 0 11 7 4-7 11-7 16 0 6 19Z" fill="#d88770"/></g>
            <g transform="translate(224 110)"><path d="M0 0h78v62H45L27 82V62H0Z" fill="#f5e5dc" stroke="#d88770"/><path d="M14 18h49M14 33h37m-37 14h28" stroke="#d88770" strokeWidth="2"/></g>
            <circle cx="62" cy="222" r="11" fill="#d88770" stroke="#fffdf8" strokeWidth="3"/><circle cx="176" cy="150" r="12" fill="#f4e7c9" stroke="#d4b775"/><path d="m171 150 4 4 7-9" stroke="#78a7a2" strokeWidth="2"/><rect x="242" y="210" width="64" height="25" rx="12" fill="#e5eeee" stroke="#78a7a2"/><path d="M257 222h33m-7-5 7 5-7 5" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "creative-spark" ? (
          <svg data-creative-three-starts="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="25" y="28" width="310" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <g transform="translate(46 58)"><rect width="73" height="104" rx="7" fill="#f4e7c9" stroke="#d4b775"/><path d="M24 28q1-17 16-13 16 5-2 20v10" stroke="#b29659" strokeWidth="3"/><circle cx="38" cy="55" r="2" fill="#b29659"/><path d="M13 77h47m-47 13h29" stroke="#b29659"/></g>
            <g transform="translate(143 66)"><path d="m0 29 36-23 36 23v64l-36 21L0 93Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="m0 29 36 23 36-23M36 52v62m-7-13 7 13 8-14" stroke="#78a7a2" strokeWidth="2"/><path d="m8 22 9-6m5-3 9-6" stroke="#d88770" strokeWidth="3"/></g>
            <g transform="translate(239 58)"><path d="M0 0h75v76H43L24 99V76H0Z" fill="#f5e5dc" stroke="#d88770"/><path d="M13 20h49M13 35h37M13 50h44" stroke="#d88770" strokeWidth="2"/></g>
            <path d="M46 196h268M64 230h46m139 0h45" stroke="#a9c7c5" strokeWidth="2"/><circle cx="180" cy="230" r="18" fill="#f4e7c9" stroke="#d4b775"/><path d="m171 230 6 6 13-14" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "cozy-object" ? (
          <svg data-cozy-three-objects="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="27" y="28" width="306" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M47 214h267" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(50 57)"><path d="M4 37h59v50q-30 22-59 0Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/><path d="M63 45h11q19 21-11 28M0 106h76" stroke="#d4b775" strokeWidth="2"/><path d="M19 27q-9-8 0-17m22 17q-9-8 0-17" stroke="#d88770" strokeWidth="2"/></g>
            <g transform="translate(144 79)"><path d="M0 14 17 0h52v103H0Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/><path d="M0 14h55V0M11 26h47m-47 15h47m-47 15h47m-47 15h47m-47 15h47M0 103v11m12-11v11m12-11v11m12-11v11m12-11v11m12-11v11" stroke="#78a7a2"/></g>
            <g transform="translate(235 57)"><rect width="72" height="129" rx="6" fill="#f5e5dc" stroke="#d88770"/><path d="M10 0v129m12-107h34m-34 16h24m-24 16h28" stroke="#d88770"/><path d="m24 81 12-12 12 12" stroke="#78a7a2" strokeWidth="2"/><circle cx="55" cy="92" r="7" stroke="#78a7a2"/></g>
            <circle cx="67" cy="238" r="5" fill="#d88770"/><path d="M87 238h48m17 0h47m18 0h72" stroke="#a9c7c5" strokeWidth="2"/>
          </svg>
        ) : slug === "compliment-style" ? (
          <svg data-compliment-three-notices="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="26" y="28" width="308" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <g transform="translate(48 54)"><rect width="77" height="113" rx="9" fill="#e5eeee" stroke="#78a7a2"/><path d="m12 77 29-31 25 31M21 77v24h37V77" stroke="#78a7a2" strokeWidth="2"/><rect x="40" y="81" width="11" height="12" fill="#d88770"/><circle cx="53" cy="86" r="21" stroke="#d4b775" strokeWidth="3"/><path d="m69 102 11 11" stroke="#d4b775" strokeWidth="4"/></g>
            <g transform="translate(148 54)"><rect width="65" height="113" rx="9" fill="#f4e7c9" stroke="#d4b775"/><path d="m13 27 18-11 20 11-20 13Z" fill="#fffdf8" stroke="#b29659"/><path d="M32 47v18m-6-6 6 6 6-6m-25 21 18-11 20 11-20 14Z" stroke="#b29659" strokeWidth="2"/></g>
            <g transform="translate(236 54)"><path d="M0 0h77v88H45l-20 24V88H0Z" fill="#f5e5dc" stroke="#d88770"/><path d="M15 22h47M15 36h35m-24 22 10 10 20-22" stroke="#d88770" strokeWidth="2"/></g>
            <path d="M48 188h265" stroke="#e5eeee" strokeWidth="2"/><path d="M66 222h58m20 0h58m20 0h72" stroke="#78a7a2" strokeWidth="3"/><circle cx="180" cy="222" r="7" fill="#d4b775"/><circle cx="286" cy="222" r="7" fill="#d88770"/>
          </svg>
        ) : slug === "community-fair" ? (
          <svg data-fair-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M35 78 64 38h232l29 40Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/>
            <path d="m103 38-13 40m52-40-5 40m47-40 4 40m45-40 12 40m31-40 23 40" stroke="#d88770" strokeWidth="11"/>
            <path d="M48 78v170m264-170v170" stroke="#78a7a2" strokeWidth="6"/>
            <rect x="35" y="191" width="290" height="57" rx="10" fill="#e5eeee" stroke="#78a7a2"/>
            <g transform="translate(67 108)"><circle cx="30" cy="30" r="28" fill="#fffdf8" stroke="#78a7a2" strokeWidth="2"/><path d="M30 10v21l16 10" stroke="#78a7a2" strokeWidth="3"/></g>
            <g transform="translate(160 109)"><rect width="49" height="63" rx="7" fill="#fffdf8" stroke="#d88770"/><path d="m10 18 6 6 12-13M10 39h29M10 50h22" stroke="#d88770" strokeWidth="2"/></g>
            <g transform="translate(239 110)"><rect width="47" height="52" rx="5" fill="#fffdf8" stroke="#d4b775"/><path d="M9 13h28M9 24h20M9 35h24M2 66h44m-8-7 8 7-8 7" stroke="#b29659" strokeWidth="2"/></g>
            <path d="M67 217h71m21 0h49m22 0h60" stroke="#78a7a2" strokeWidth="3"/>
          </svg>
        ) : slug === "comfort-offer" ? (
          <svg data-comfort-three-offers="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="25" y="28" width="310" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <g transform="translate(45 56)"><rect width="76" height="94" rx="12" fill="#f4e7c9" stroke="#d4b775"/><path d="M15 26h46M15 43h34m-34 17 9 9 22-24" stroke="#b29659" strokeWidth="3"/></g>
            <g transform="translate(142 56)"><path d="M0 0h76v71H44L25 91V71H0Z" fill="#f5e5dc" stroke="#d88770"/><path d="M15 22h46M15 37h36M15 52h25" stroke="#d88770" strokeWidth="2"/></g>
            <g transform="translate(240 56)"><rect width="76" height="94" rx="12" fill="#e5eeee" stroke="#78a7a2"/><path d="M15 24h19v47H15zm26 0h19v47H41zM34 71l4 5 3-5" fill="#fffdf8" stroke="#78a7a2"/></g>
            <path d="M46 180h269" stroke="#e5eeee" strokeWidth="2"/>
            <g fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"><circle cx="145" cy="207" r="13"/><circle cx="214" cy="207" r="13"/><path d="M120 248v-11q25-30 50 0v11m19 0v-11q25-30 50 0v11"/></g>
            <path d="M175 223h10" stroke="#d88770" strokeWidth="2"/><circle cx="309" cy="46" r="5" fill="#d88770"/>
          </svg>
        ) : slug === "coffee-break" ? (
          <svg data-coffee-three-pauses="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="24" y="29" width="312" height="232" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <g transform="translate(46 49)"><rect width="111" height="118" rx="8" fill="#e5eeee" stroke="#78a7a2"/><path d="M55 0v118M0 59h111" stroke="#78a7a2"/><circle cx="81" cy="29" r="13" fill="#f4e7c9"/><path d="m7 109 28-31 22 13 24-19 25 37" fill="#a9c7c5"/></g>
            <g transform="translate(205 65)"><path d="M0 31h52v38q-26 20-52 0Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2"/><path d="M52 38h10q16 18-10 22M-9 82h72" stroke="#d4b775" strokeWidth="2"/><path d="M12 21q-10-8 0-16m17 16q-10-8 0-16m17 16q-10-8 0-16" stroke="#d88770" strokeWidth="2"/></g>
            <path d="M45 184h270" stroke="#e5eeee" strokeWidth="2"/>
            <g transform="translate(111 204)"><path d="M0 0h48v28H30l-10 9V28H0Z" fill="#e5eeee" stroke="#78a7a2"/><path d="M64 0h48v28H94l-10 9V28H64Z" fill="#f5e5dc" stroke="#d88770"/><path d="M10 10h27M10 19h17" stroke="#78a7a2"/><path d="M74 10h27M74 19h17" stroke="#d88770"/></g>
            <circle cx="301" cy="53" r="5" fill="#d88770"/>
          </svg>
        ) : slug === "cloud-drift" ? (
          <svg data-cloud-three-readings="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="28" y="24" width="304" height="242" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M28 171h304" stroke="#a9c7c5"/>
            <path d="M89 131c-24 0-30-30-9-38-1-29 41-43 55-16 20-13 44 0 44 20 29-4 39 33 11 34Z" fill="#e5eeee" stroke="#78a7a2" strokeWidth="2"/>
            <path d="m103 117 9-19 15 5 12-13 5 16 21 11" stroke="#d88770" strokeWidth="3" strokeLinejoin="round"/><path d="m126 115 6-1" stroke="#d88770" strokeWidth="3"/>
            <path d="M225 122c-18 0-22-22-7-29 0-21 29-30 40-11 15-9 32 0 33 15 20-2 27 25 7 25Z" fill="#f4e7c9" stroke="#d4b775" strokeWidth="2" strokeDasharray="5 4"/>
            <g fill="#e5eeee" stroke="#78a7a2"><rect x="47" y="191" width="64" height="53" rx="8"/><rect x="148" y="191" width="64" height="53" rx="8"/><rect x="249" y="191" width="64" height="53" rx="8"/></g>
            <path d="m62 225 17-19 17 19Zm101 2 17-18 18 12M264 223q13-20 32-3" stroke="#78a7a2" strokeWidth="2"/>
            <path d="M118 217h22m-6-6 6 6-6 6m85-6h22m-6-6 6 6-6 6" stroke="#d88770" strokeWidth="2"/>
            <circle cx="291" cy="56" r="5" fill="#d88770"/>
          </svg>
        ) : slug === "city-wanderer" ? (
          <svg data-city-three-threads="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="28" y="28" width="304" height="234" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M49 106h262M49 184h262M124 47v194M230 47v194" stroke="#e5eeee" strokeWidth="15"/>
            <path d="m64 70 60 36 62-33 44 33 65-40M64 220l60-36 63 38 43-38 65 35" stroke="#78a7a2" strokeWidth="3" strokeDasharray="6 5"/>
            <g fill="#78a7a2"><circle cx="64" cy="70" r="7"/><circle cx="186" cy="73" r="7"/><circle cx="295" cy="66" r="7"/></g>
            <rect x="145" y="123" width="64" height="43" rx="10" fill="#f4e7c9"/><path d="M156 147h9l6-12 9 22 6-15h12" stroke="#b29659" strokeWidth="2"/>
            <g transform="translate(248 123)"><rect x="10" y="0" width="43" height="42" rx="5" fill="#f4e7c9" stroke="#d4b775"/><rect x="5" y="5" width="43" height="42" rx="5" fill="#f5e5dc" stroke="#d88770"/><rect y="10" width="43" height="42" rx="5" fill="#fffdf8" stroke="#d88770"/><path d="M8 22h27M8 31h20M8 40h25" stroke="#d88770" strokeWidth="2"/></g>
            <g transform="translate(55 130)" stroke="#78a7a2" strokeWidth="2"><path d="M0 26h47M6 26V8h12v18m6 0V0h16v26M10 14h4m15-7h6m-6 8h6"/></g>
            <circle cx="124" cy="184" r="11" fill="#d88770" stroke="#fffdf8" strokeWidth="4"/><circle cx="230" cy="106" r="11" fill="#d4b775" stroke="#fffdf8" strokeWidth="4"/>
          </svg>
        ) : slug === "choosing-together" ? (
          <svg data-together-four-approaches="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M180 141 96 81m84 60 85-60m-85 60-84 68m84-68 85 68" stroke="#a9c7c5" strokeWidth="2"/>
            <circle cx="180" cy="143" r="26" fill="#fffdf8" stroke="#78a7a2"/><path d="m166 143 9 9 19-20" stroke="#78a7a2" strokeWidth="3"/>
            <g transform="translate(43 32)"><rect width="104" height="84" rx="13" fill="#fffdf8" stroke="#78a7a2"/><path d="m15 25 5 5 9-12m-14 37 5 5 9-12M39 24h45M39 54h35" stroke="#78a7a2" strokeWidth="3"/></g>
            <g transform="translate(213 32)"><rect width="104" height="84" rx="13" fill="#e5eeee" stroke="#78a7a2"/><path d="M23 28h56m-9-8 9 8-9 8M81 56H25m9-8-9 8 9 8" stroke="#78a7a2" strokeWidth="3"/><circle cx="25" cy="28" r="8" fill="#d88770"/><circle cx="79" cy="56" r="8" fill="#d4b775"/></g>
            <g transform="translate(43 178)"><rect width="104" height="84" rx="13" fill="#f4e7c9" stroke="#d4b775"/><path d="M35 16h34M35 68h34m-30-52q-1 16 13 26-14 10-13 26m26-52q1 16-13 26 14 10 13 26" stroke="#b29659" strokeWidth="2"/><path d="m42 61 10-12 10 12" fill="#d88770"/></g>
            <g transform="translate(213 178)"><rect width="104" height="84" rx="13" fill="#f5e5dc" stroke="#d88770"/><path d="M22 17h25v36H22zm35 0h25v36H57z" fill="#fffdf8" stroke="#d88770"/><path d="M35 62h34m-6-5 6 5-6 5" stroke="#d88770" strokeWidth="2"/></g>
          </svg>
        ) : slug === "celebration-planner" ? (
          <svg data-celebration-three-plans="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M38 235h284" stroke="#a9c7c5"/>
            <g transform="translate(36 84) rotate(-5 45 70)"><rect width="92" height="135" rx="8" fill="#fffdf8" stroke="#78a7a2"/><path d="M22 0v-9m48 9v-9" stroke="#78a7a2" strokeWidth="4"/><path d="M0 29h92M16 48h59M16 65h45" stroke="#a9c7c5"/><circle cx="45" cy="99" r="19" fill="#e5eeee"/><path d="m36 99 6 7 13-16" stroke="#78a7a2" strokeWidth="3"/></g>
            <g transform="translate(146 125)"><rect width="78" height="54" rx="7" fill="#f4e7c9" stroke="#d4b775"/><path d="M0 12q10 10 20 0 9 10 19 0 10 10 20 0 9 10 19 0" stroke="#d4b775"/><path d="M25 0v-18m27 18v-18" stroke="#78a7a2" strokeWidth="4"/><path d="M25-23q-7-9 0-15 7 6 0 15m27 0q-7-9 0-15 7 6 0 15" fill="#d88770"/><path d="M-10 59h98m-49 0v25m-27 0h54" stroke="#78a7a2" strokeWidth="2"/></g>
            <g transform="translate(250 93)"><rect width="73" height="115" rx="5" fill="#e5eeee" stroke="#78a7a2"/><path d="M13 21h47M13 40h34M13 59h43" stroke="#78a7a2"/><path d="M26 88h22m-11-11v22" stroke="#d88770" strokeWidth="3"/></g>
            <path d="M129 56q45 17 91 0" stroke="#78a7a2"/><path d="m142 60 8 13 9-10m30 1 8 11 9-15" fill="#d88770"/><path d="M66 52h10m-5-5v10m227 7h10m-5-5v10" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "celebrating-a-friend" ? (
          <svg data-good-news-three-responses="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M44 221h273" stroke="#a9c7c5"/>
            <g transform="translate(32 83)"><path d="M0 9q0-9 9-9h69q9 0 9 9v51q0 9-9 9H40L23 84V69H9q-9 0-9-9z" fill="#fffdf8" stroke="#78a7a2"/><path d="M16 23h54M16 37h42M16 51h28" stroke="#78a7a2" strokeWidth="2"/></g>
            <g transform="translate(137 63) rotate(-5 47 65)"><rect width="94" height="132" rx="6" fill="#f4e7c9" stroke="#d4b775"/><path d="M16 24h62M16 39h51M16 54h60" stroke="#d4b775" strokeWidth="2"/><path d="M47 101 31 85c-13-16 7-29 16-13 9-16 29-3 16 13z" fill="#d88770"/></g>
            <g transform="translate(242 115)"><rect width="35" height="41" rx="5" fill="#e5eeee" stroke="#78a7a2"/><path d="M35 10h5q15 0 15 11T35 32" stroke="#78a7a2" strokeWidth="3"/><path d="M6-11q8-8 0-16m17 16q8-8 0-16" stroke="#a9c7c5" strokeWidth="2"/></g>
            <circle cx="268" cy="192" r="12" fill="#d88770"/><circle cx="306" cy="192" r="12" fill="#78a7a2"/><path d="M255 218q0-15 13-15t13 15m12 0q0-15 13-15t13 15" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M88 51h10m-5-5v10m159 2h10m-5-5v10M111 199h10m-5-5v10" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "campfire-storyteller" ? (
          <svg data-campfire-three-voices="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <ellipse cx="180" cy="216" rx="113" ry="23" stroke="#a9c7c5" strokeDasharray="4 6"/>
            <path d="m148 222 67-20m-68 0 66 20" stroke="#78a7a2" strokeWidth="10" strokeLinecap="round"/>
            <path d="M180 207c-45-14-24-37-19-51 4 14 12 9 19-18 5 23 34 42 16 63z" fill="#d88770"/><path d="M177 205c-12-12-4-24 3-32 1 11 13 20 5 32" fill="#f4e7c9"/>
            <g transform="translate(37 58)"><path d="M0 10Q0 0 10 0h60q10 0 10 10v47q0 10-10 10H40L24 81V67H10Q0 67 0 57z" fill="#fffdf8" stroke="#a9c7c5"/><path d="M28 23q0-13 13-13 19 0 8 16l-9 8v5m0 6v3" stroke="#78a7a2" strokeWidth="3"/></g>
            <g transform="translate(140 35)"><path d="M0 10Q0 0 10 0h60q10 0 10 10v47q0 10-10 10H53L40 81V67H10Q0 67 0 57z" fill="#f4e7c9" stroke="#d4b775"/><path d="M22 37q18 23 36 0" stroke="#d88770" strokeWidth="3"/><circle cx="28" cy="25" r="2" fill="#d88770"/><circle cx="52" cy="25" r="2" fill="#d88770"/></g>
            <g transform="translate(243 58)"><path d="M0 10Q0 0 10 0h60q10 0 10 10v47q0 10-10 10H56l-8 14V67H10Q0 67 0 57z" fill="#e5eeee" stroke="#78a7a2"/><path d="M16 20h48m-48 13h35m-35 13h25" stroke="#78a7a2" strokeWidth="2"/></g>
            <g fill="#78a7a2"><circle cx="66" cy="164" r="11"/><path d="M49 195v-8a17 17 0 0 1 34 0v8z"/><circle cx="294" cy="164" r="11"/><path d="M277 195v-8a17 17 0 0 1 34 0v8z"/></g><path d="M124 92h10m-5-5v10m93 29h10m-5-5v10" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "camera-roll" ? (
          <svg data-camera-roll-three-purposes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M49 225h263" stroke="#a9c7c5"/>
            <g transform="translate(38 65) rotate(-7 50 70)"><rect width="98" height="137" rx="7" fill="#fffdf8" stroke="#a9c7c5"/><rect x="9" y="10" width="80" height="87" rx="3" fill="#e5eeee"/><circle cx="66" cy="34" r="12" fill="#d4b775"/><path d="m9 91 26-40 23 26 14-15 17 29" fill="#78a7a2"/><path d="M15 115h48m-48 9h29" stroke="#a9c7c5" strokeWidth="2"/></g>
            <g transform="translate(130 50)"><rect width="100" height="144" rx="7" fill="#fffdf8" stroke="#a9c7c5"/><rect x="10" y="10" width="80" height="90" rx="3" fill="#f4e7c9"/><path d="M30 68h42l-5 19H36zm6-21 14-9 17 9v21H36z" fill="#d88770"/><path d="m48 112 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#d4b775"/></g>
            <g transform="translate(226 76) rotate(7 47 65)"><rect width="94" height="132" rx="7" fill="#fffdf8" stroke="#a9c7c5"/><rect x="9" y="10" width="76" height="82" rx="3" fill="#f5e5dc"/><ellipse cx="47" cy="57" rx="28" ry="9" fill="#78a7a2"/><path d="M27 62v17m40-17v17" stroke="#78a7a2" strokeWidth="3"/><path d="M15 110h45" stroke="#a9c7c5" strokeWidth="2"/></g>
            <circle cx="67" cy="206" r="20" fill="#fffdf8" stroke="#78a7a2" strokeWidth="3"/><path d="m82 221 17 17" stroke="#78a7a2" strokeWidth="5"/><path d="M132 240h27m-5-5 5 5-5 5m34-5h27m-5-5 5 5-5 5" stroke="#d4b775" strokeWidth="2"/>
          </svg>
        ) : slug === "browser-tabs" ? (
          <svg data-browser-tabs-three-functions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="25" y="59" width="310" height="174" rx="12" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M25 91h310" stroke="#a9c7c5"/><path d="M40 90V74q0-7 7-7h60q7 0 7 7v16m8 0V74q0-7 7-7h60q7 0 7 7v16m8 0V74q0-7 7-7h60q7 0 7 7v16" fill="#e5eeee" stroke="#a9c7c5"/>
            <circle cx="318" cy="76" r="3" fill="#d88770"/>
            <g transform="translate(41 107)"><rect width="80" height="102" rx="9" fill="#f4e7c9"/><path d="M29 28q0-17 15-17 23 0 10 20l-12 11v8m0 7v3" stroke="#b29659" strokeWidth="3"/><path d="M17 79h46m-46 10h30" stroke="#d4b775" strokeWidth="2"/></g>
            <g transform="translate(140 107)"><rect width="80" height="102" rx="9" fill="#e5eeee"/><path d="m19 54 18 12 24-41" stroke="#78a7a2" strokeWidth="4"/><path d="M17 79h46m-46 10h30" stroke="#78a7a2" strokeWidth="2"/></g>
            <g transform="translate(239 107)"><rect width="80" height="102" rx="9" fill="#f5e5dc"/><path d="M17 65h46M22 22h13v43H22zm18 8 12-4 13 35-12 4z" stroke="#d88770" strokeWidth="2"/><path d="M17 79h46m-46 10h30" stroke="#d88770" strokeWidth="2"/></g>
          </svg>
        ) : slug === "borrowed-book" ? (
          <svg data-borrowed-book-three-agreements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="m100 70 77-13 82 14v150l-82-14-77 14z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M177 57v150m-62-113 47-8m-47 23 47-8m30-13 51 9m-51 8 51 9m-51 8 36 6" stroke="#a9c7c5" strokeWidth="2"/>
            <path d="M220 65v57l12-10 12 13V69" fill="#d88770"/>
            <g transform="translate(35 133) rotate(-8)"><rect width="74" height="76" rx="8" fill="#f4e7c9" stroke="#d4b775"/><path d="M0 23h74M19-5v16m35-16v16" stroke="#d4b775" strokeWidth="3"/><path d="m20 48 11 11 22-25" stroke="#78a7a2" strokeWidth="4"/></g>
            <g transform="translate(238 149)"><path d="M0 8q0-8 8-8h64q8 0 8 8v39q0 8-8 8H29L14 68V55H8q-8 0-8-8z" fill="#e5eeee" stroke="#78a7a2"/><path d="M16 18h46m-46 12h37m-37 12h23" stroke="#78a7a2" strokeWidth="2"/></g>
            <path d="M126 241h99" stroke="#a9c7c5"/><circle cx="69" cy="81" r="5" fill="#d88770"/><circle cx="299" cy="112" r="4" fill="#d4b775"/>
          </svg>
        ) : slug === "board-game-table" ? (
          <svg data-board-game-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="29" y="59" width="302" height="167" rx="31" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M49 199h263" stroke="#a9c7c5"/>
            <g transform="translate(46 84)"><path d="m0 5 37-5 37 5v67l-37-5-37 5z" fill="#f4e7c9" stroke="#d4b775"/><path d="M37 0v67M10 20h18m-18 13h18m19-13h18m-18 13h18" stroke="#d88770" strokeWidth="2"/><circle cx="17" cy="52" r="4" fill="#78a7a2"/></g>
            <g transform="translate(143 82)"><rect width="72" height="84" rx="8" fill="#e5eeee" stroke="#78a7a2"/><path d="M12 68h15V47h16V29h16V13m-7 0h7v7" stroke="#78a7a2" strokeWidth="3"/><circle cx="20" cy="22" r="8" fill="#d88770"/></g>
            <g transform="translate(239 85)"><circle cx="34" cy="21" r="10" fill="#d88770"/><circle cx="12" cy="49" r="9" fill="#78a7a2"/><circle cx="56" cy="49" r="9" fill="#d4b775"/><path d="M21 23h-9v13m35-13h9v13M23 59h22" stroke="#a9c7c5" strokeWidth="2"/></g>
            <rect x="143" y="182" width="26" height="26" rx="5" fill="#d88770"/><g fill="#fffdf8"><circle cx="150" cy="189" r="2"/><circle cx="162" cy="201" r="2"/><circle cx="156" cy="195" r="2"/></g><path d="M184 197h25m-6-5 6 5-6 5" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "birdwatching-companion" ? (
          <svg data-birdwatching-three-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="26" y="34" width="308" height="204" rx="18" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M180 34v204M26 155h308" stroke="#a9c7c5"/>
            <path d="M45 140q70-22 145-10t130-17" stroke="#78a7a2" strokeWidth="5"/>
            <path d="M206 117q-3-22 14-21 14-12 23 3l10 5-12 5q-11 25-35 8Z" fill="#d88770"/>
            <circle cx="234" cy="99" r="2" fill="#174650"/><path d="m216 119-3 10m12-10 3 9" stroke="#174650"/>
            <g transform="translate(42 171)"><circle cx="23" cy="21" r="18" stroke="#78a7a2"/><path d="M23 10v12l10 5" stroke="#78a7a2" strokeWidth="2"/><path d="M49 18h25m-25 10h17" stroke="#d4b775"/></g>
            <g transform="translate(140 171)"><rect width="40" height="50" rx="5" fill="#f4e7c9"/><path d="M10 12h20M10 23h20M10 34h12m23-28-9 37" stroke="#d88770" strokeWidth="2"/></g>
            <g transform="translate(214 171)"><circle cx="12" cy="14" r="7" stroke="#78a7a2"/><circle cx="63" cy="14" r="7" stroke="#78a7a2"/><path d="M3 40V31q9-14 18 0v9m33 0v-9q9-14 18 0v9M27 17h19m-6-6 6 6-6 6" stroke="#78a7a2" strokeWidth="2"/></g>
          </svg>
        ) : slug === "beachcomber" ? (
          <svg data-beachcomber-three-views="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M24 158q56-24 110-4t110-2 92-7v91H24z" fill="#f4e7c9"/>
            <path d="M24 145q56-24 110-4t110-2 92-7" stroke="#78a7a2" strokeWidth="3"/>
            <path d="M26 122q54-23 109-3t110-2 89-7" stroke="#78a7a2" strokeOpacity=".4"/>
            <g transform="translate(47 64)"><rect width="84" height="93" rx="11" fill="#fffdf8" stroke="#a9c7c5"/><path d="M16 53q26-59 52 0Z M25 53q17-44 34 0M34 53q8-28 16 0" stroke="#d88770" strokeWidth="2"/><path d="M17 71h50m-43 8h36" stroke="#d4b775"/></g>
            <g transform="translate(147 77) rotate(8 42 45)"><rect width="84" height="93" rx="11" fill="#fffdf8" stroke="#a9c7c5"/><rect x="58" y="12" width="14" height="17" stroke="#d88770"/><path d="M13 43h43m-43 11h56m-56 11h44" stroke="#78a7a2"/><ellipse cx="23" cy="25" rx="11" ry="7" fill="#d4b775" fillOpacity=".4"/></g>
            <g transform="translate(244 65)"><rect width="84" height="93" rx="11" fill="#fffdf8" stroke="#a9c7c5"/><path d="M11 48q18-12 31 0t31-1M12 61q17-10 32 0t28 0" stroke="#78a7a2"/><ellipse cx="43" cy="41" rx="10" ry="6" fill="#d88770" fillOpacity=".7"/><path d="M16 77h52" stroke="#d4b775"/></g>
            <ellipse cx="83" cy="207" rx="24" ry="12" fill="#78a7a2" fillOpacity=".3"/><ellipse cx="250" cy="218" rx="16" ry="8" fill="#d88770" fillOpacity=".3"/><path d="M140 213h34m-17-6 8 12" stroke="#d4b775"/>
          </svg>
        ) : slug === "eq-dashboard" ? (
          <svg data-emotion-eight-families="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="15" y="48" width="330" height="200" rx="20" fill="#fffdf8" stroke="#a9c7c5"/>
            {["#d4b775","#78a7a2","#9a89b2","#d88770","#9bb7cb","#92aa83","#bb847f","#bc9a65"].map((c,i)=><g key={c} transform={`translate(${32+i%4*78} ${65+Math.floor(i/4)*87})`}><rect width="64" height="73" rx="12" fill={c} fillOpacity=".13"/><circle cx="32" cy="28" r="19" stroke={c}/><path d="M24 24v1m16-1v1" stroke={c} strokeWidth="2"/><path d={["M23 32q9 12 18 0","M23 32q9 7 18 0","M25 34q7-9 14 0","M28 31q4-5 8 0v6h-8z","M24 36q8-10 16 0","M24 34h16m-18-13 7 2m6 0 7-2","m22 19 8 4m4 0 8-4M24 35h16","M24 32q8 9 16 0"][i]} stroke={c} strokeWidth="1.5"/><path d="M17 58h30m-23 6h16" stroke={c} strokeOpacity=".5"/></g>)}
          </svg>
        ) : slug === "values-assessment" ? (
          <svg data-work-values-ten-priorities="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="22" y="38" width="316" height="218" rx="18" fill="#fffdf8" stroke="#a9c7c5"/>
            {Array.from({length:10},(_,i)=><g key={i} transform={`translate(${40+i%5*58} ${67+Math.floor(i/5)*84})`}><rect width="48" height="67" rx="9" fill={["#78a7a2","#d88770","#d4b775","#9a89b2","#92aa83"][i%5]} fillOpacity=".12"/><circle cx="24" cy="23" r="14" stroke={["#78a7a2","#d88770","#d4b775","#9a89b2","#92aa83"][i%5]}/><path d={["m17 23 5 6 10-13","M15 23h18m-9-9v18","m24 12 4 8 9 3-9 3-4 8-4-8-9-3 9-3z","M16 17h16v13l-8 5-8-5z","M17 25q7-12 14 0m-14 0q7 12 14 0","M17 17h14v11H17zm7 11v7m-5 0h10","M16 21q0-10 8-2 8-8 8 2 0 7-8 12-8-5-8-12","M14 17l10-4 10 4v15l-10-4-10 4zM24 13v15","M14 23h20m-16-5v10m12-10v10","M14 28h8V17h8v-5m-4 0h5v5"][i]} stroke={["#78a7a2","#d88770","#d4b775","#9a89b2","#92aa83"][i%5]} strokeWidth="1.5"/><path d="M10 50h28m-24 7h20" stroke="#a9c7c5"/></g>)}
          </svg>
        ) : slug === "food-choice" ? (
          <svg data-food-three-presentations="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="20" y="65" width="320" height="165" rx="18" fill="#fffdf8" stroke="#a9c7c5"/>
            {[0,1,2].map(i=><g key={i} transform={`translate(${38+i*104} 86)`}><rect width="88" height="118" rx="12" fill={["#78a7a2","#d4b775","#d88770"][i]} fillOpacity=".13"/><ellipse cx="44" cy="40" rx="29" ry="18" fill="#fff" stroke={["#78a7a2","#d4b775","#d88770"][i]}/>{i===0?<path d="M21 38q23 19 46 0v8q-23 28-46 0z" fill="#78a7a2" fillOpacity=".5"/>:i===1?<g fill="#d4b775">{[0,1,2].map(n=><circle key={n} cx={30+n*14} cy="40" r="5"/>)}</g>:<><path d="M21 38q23 19 46 0v8q-23 28-46 0z" fill="#78a7a2" fillOpacity=".5"/><path d="m44 28 5 8-5 8-5-8z" fill="#d88770"/></>}<path d={i===2?"M15 82h36m7 0h15M15 92h23m9 0h26":"M15 82h58m-58 10h43"} stroke={["#78a7a2","#d4b775","#d88770"][i]} strokeWidth="2"/></g>)}
          </svg>
        ) : slug === "cultural-dimensions" ? (
          <svg data-cultural-six-arrangements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="31" y="31" width="298" height="230" rx="18" fill="#fffdf8" stroke="#a9c7c5"/>
            {["#78a7a2","#d88770","#9bb7cb","#d4b775","#9a89b2","#92aa83"].map((c,i)=><g key={c} transform={`translate(${48+i%3*91} ${51+Math.floor(i/3)*99})`}><rect width="81" height="79" rx="12" fill={c} fillOpacity=".1"/><circle cx="40" cy="29" r="16" stroke={c}/><path d={i===0?"M31 30h18m-9-9v18":i===1?"m30 31 7 6 14-16":i===2?"M30 26h20m-16-5v17m12-17v17":i===3?"M35 24q8-9 12 0 2 4-6 8v3m0 4v1":i===4?"M33 36a13 13 0 1 1 15-17m-8-1h9v9":"M30 29q10 14 20 0M34 24v1m12-1v1"} stroke={c} strokeWidth="2"/><path d="M17 60h47m-40 7h33" stroke={c} strokeOpacity=".5"/></g>)}
          </svg>
        ) : slug === "cognitive-functions-test" ? (
          <svg data-cognitive-eight-directions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["Ni","Ne","Si","Se","Ti","Te","Fi","Fe"].map((label,i)=><g key={label} transform={`translate(${27+(i%4)*79} ${66+Math.floor(i/4)*90})`}><rect width="68" height="70" rx="13" fill="#fffdf8" stroke={i<4?"#78a7a2":"#d88770"}/><text x="34" y="40" textAnchor="middle" fontSize="25" fill="#174650">{label}</text><path d="M20 54h28" stroke={i<4?"#78a7a2":"#d88770"}/></g>)}
          </svg>
        ) : slug === "deep-desire" ? (
          <svg data-deep-desire-six-themes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#78a7a2", "#d88770", "#9bb7cb", "#d4b775", "#9a89b2", "#92aa83"].map((c,i)=><g key={c} transform={`translate(${38+(i%3)*100} ${48+Math.floor(i/3)*108})`}><rect width="84" height="88" rx="15" fill="#fffdf8" stroke={c}/><circle cx="42" cy="32" r="17" fill={c} fillOpacity=".14"/><path d={i===0?"M33 33h18m-9-9v18":i===1?"M32 34q10-21 20 0m-20 0q10 12 20 0":i===2?"m31 37 8-9 7 5 8-12":i===3?"M31 22h22v22H31z":i===4?"m42 20 4 9 10 1-8 7 2 10-8-5-9 5 2-10-8-7 11-1z":"M31 39q3-19 22-18m-12 1 12-1-1 12"} stroke={c} strokeWidth="2"/><path d="M20 63h44m-36 8h28" stroke={c} strokeOpacity=".5"/></g>)}
          </svg>
        ) : slug === "life-path-number" ? (
          <svg data-birth-number-two-rules="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{y:48,c:"#78a7a2",label:"11 + 11 + 11",end:"33"},{y:165,c:"#d88770",label:"15 → 1 + 5",end:"6"}].map(({y,c,label,end})=><g key={end} transform={`translate(30 ${y})`}><rect width="300" height="79" rx="15" fill="#fffdf8" stroke={c}/><text x="18" y="46" fontSize="20" fill={c}>{label}</text><path d="M186 39h30m-6-6 6 6-6 6" stroke={c}/><rect x="230" y="14" width="54" height="51" rx="10" fill={c} fillOpacity=".14"/><text x="257" y="48" textAnchor="middle" fontSize="25" fill={c}>{end}</text></g>)}
            <path d="M72 138h216m-189 9h162" stroke="#a9c7c5" strokeOpacity=".45"/>
          </svg>
        ) : slug === "overthinking-screener" ? (
          <svg data-ptq-three-processes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M83 73h194M83 144h194M83 215h194" stroke="#a9c7c5" strokeDasharray="4 6"/>
            {["#78a7a2", "#d88770", "#9bb7cb"].map((c,i)=><g key={c} transform={`translate(54 ${39+i*71})`}><rect width="252" height="61" rx="15" fill="#fffdf8" stroke={c}/><circle cx="31" cy="30" r="18" stroke={c}/>{i===0?<path d="M21 29a10 10 0 1 1 4 10m-4-10v-8m0 8h8" stroke={c} strokeWidth="2"/>:i===1?<><path d="M26 24q5-8 11 0 2 4-5 8v3m0 5v1" stroke={c} strokeWidth="2"/></>:<><circle cx="31" cy="30" r="7" stroke={c}/><path d="M31 10v6m0 28v6M11 30h6m28 0h6" stroke={c}/></>}<path d="M66 21h157m-157 10h130m-130 10h147" stroke={c} strokeOpacity=".55" strokeWidth="2"/></g>)}
          </svg>
        ) : slug === "skills-audit" ? (
          <svg data-skills-audit-task-records="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="33" y="33" width="294" height="226" rx="16" fill="#fffdf8" stroke="#a9c7c5"/>
            <path d="M54 76h252m-185 0v161M54 119h252M54 162h252M54 205h252" stroke="#a9c7c5" strokeOpacity=".5"/>
            {["#78a7a2","#d4b775","#d88770","#9bb7cb"].map((c,i)=><g key={c}><rect x={139+i*43} y="49" width="28" height="13" rx="4" stroke={c} fill={c} fillOpacity=".15"/>{[0,1,2,3].map(j=><g key={j}><rect x={140+i*43} y={89+j*43} width="25" height="18" rx="4" stroke={c} strokeOpacity=".5"/>{i===j?<path d={`m${146+i*43} ${98+j*43} 4 4 7-8`} stroke={c} strokeWidth="2"/>:null}</g>)}</g>)}
            <path d="M65 92h37m-37 9h24m-24 34h37m-37 9h24m-24 34h37m-37 9h24m-24 34h37m-37 9h24" stroke="#78a7a2" strokeWidth="2"/>
          </svg>
        ) : slug === "culture-fit" ? (
          <svg data-culture-fit-four-arrangements="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="38" y="26" width="284" height="238" rx="18" fill="#fffdf8" stroke="#a9c7c5"/>
            {["#78a7a2","#d88770","#9bb7cb","#d4b775"].map((c,i)=><g key={c} transform={`translate(58 ${44+i*52})`}><rect width="244" height="40" rx="8" fill={c} fillOpacity=".08"/><path d="M65 20h114" stroke={c} strokeWidth="2"/><circle cx="65" cy="20" r="5" fill="#fffdf8" stroke={c}/><circle cx="179" cy="20" r="5" fill="#fffdf8" stroke={c}/><rect x="112" y="11" width="20" height="18" rx="4" stroke={c} fill="#fffdf8"/>{i===0?<><path d="M12 9h25v16H25l-6 6v-6h-7zM207 10h22v22h-22zM211 16h14m-14 6h11" stroke={c}/></>:i===1?<><path d="M14 13h22m-22 7h22m-22 7h16M207 29l9-17 8 7 7-9" stroke={c} strokeWidth="1.5"/></>:i===2?<><rect x="13" y="10" width="25" height="20" rx="3" stroke={c}/><path d="M13 16h25m173-4a12 12 0 1 1-4 15m4-15h9m-9 0v9" stroke={c} strokeWidth="1.5"/></>:<><rect x="12" y="10" width="27" height="22" rx="3" stroke={c}/>{[208,218,228].map(x=><rect key={x} x={x} y="16" width="7" height="10" rx="2" fill={c} fillOpacity=".5"/>)}</>}</g>)}
          </svg>
        ) : slug === "work-ethics" ? (
          <svg data-work-ethics-four-habits="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M112 81h137v136H112" stroke="#a9c7c5" strokeWidth="2" strokeDasharray="5 7"/>
            {[{x:43,y:30,c:"#d88770"},{x:191,y:30,c:"#78a7a2"},{x:43,y:163,c:"#9bb7cb"},{x:191,y:163,c:"#d4b775"}].map(({x,y,c},i)=><g key={c} transform={`translate(${x} ${y})`}><rect width="126" height="99" rx="12" fill="#fffdf8" stroke={c}/><circle cx="25" cy="24" r="10" fill={c} fillOpacity=".18"/><text x="25" y="28" fontSize="12" textAnchor="middle" fill={c}>{i+1}</text>{i===0?<><path d="M46 22h53v53H46zM55 37h33M55 49h24M55 61h15" stroke={c} strokeWidth="2"/><path d="m23 62 7 7 12-15" stroke={c} strokeWidth="3"/></>:i===1?<><path d="M48 30h48M48 49h48M48 68h48m-68-38 5 5 8-10m-13 24 5 5 8-10m-13 24 5 5 8-10" stroke={c} strokeWidth="2"/></>:i===2?<><path d="M44 27h58v39H68L55 78V66H44zM54 39h37M54 51h25" stroke={c} strokeWidth="2"/><circle cx="92" cy="51" r="3" fill={c}/></>:<><path d="M82 26a26 26 0 1 0 16 40M82 26h17v17" stroke={c} strokeWidth="2"/><path d="m56 54 9 9 18-21" stroke={c} strokeWidth="3"/></>}</g>)}
          </svg>
        ) : slug === "number-series" ? (
          <svg data-number-series-five-rules="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="42" y="34" width="276" height="224" rx="18" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5"/>
            {[{label:"+ d",c:"#78a7a2"},{label:"× r",c:"#9bb7cb"},{label:"Δ",c:"#d4b775"},{label:"1 · 3",c:"#c9949e"},{label:"a(n)",c:"#d88770"}].map(({label,c},i)=><g key={label} transform={`translate(60 ${49+i*39})`}><rect width="59" height="29" rx="7" fill={c} fillOpacity=".15"/><text x="29" y="20" textAnchor="middle" fontSize="13" fill={c}>{label}</text>{[0,1,2,3].map(j=><g key={j} transform={`translate(${78+j*38} 3)`}><rect width="26" height="23" rx="5" stroke={c} fill={c} fillOpacity={j===3?'.18':'.04'}/>{i===3?<circle cx="13" cy="11" r="3" fill={j%2?"#c9949e":"#78a7a2"}/>:j===3?<path d="M10 7q8-3 6 3l-4 3v2m0 3v1" stroke={c}/>:<path d={`M6 ${17-j*3}h14`} stroke={c} strokeWidth="2"/>}</g>)}</g>)}
          </svg>
        ) : slug === "superpower-test" ? (
          <svg data-superpower-five-choices="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{x:110,y:60,c:"#c9949e"},{x:250,y:60,c:"#9bb7cb"},{x:73,y:192,c:"#d4b775"},{x:180,y:211,c:"#78a7a2"},{x:287,y:192,c:"#d88770"}].map(({x,y,c},i)=><g key={c} transform={`translate(${x} ${y})`}><circle r="40" fill="#fffdf8" stroke={c} strokeWidth="1.5"/>{i===0?<><path d="M-24-16h37v26H-5l-12 11V10h-7V-16Z" fill={c} fillOpacity=".2" stroke={c}/><path d="M-13-7H3m-16 8H-3m16-7h12v27H8l-8 7v-9" stroke={c}/></>:i===1?<><path d="m-25 16 25-29 25 29-25-7-25 7Z" fill={c} fillOpacity=".2" stroke={c}/><path d="M0-13V9m-25 15h15m20 0h15" stroke={c}/></>:i===2?<><circle r="23" fill={c} fillOpacity=".15" stroke={c}/><path d="M0-15V1l11 6m-29-35h36m-18 0v5" stroke={c} strokeWidth="2" strokeLinecap="round"/></>:i===3?<><path d="M-19 23V-13q19-22 38 0v36" stroke={c} strokeWidth="2" strokeDasharray="4 4"/><path d="M-12 5h24m-24 8h17" stroke={c}/><circle cy="-13" r="7" fill={c} fillOpacity=".2"/></>:<><path d="m-23 17 9-6 10-19 10 3-5 16 13-2 10 8-8 12H-7l-16-12Z" fill={c} fillOpacity=".23" stroke={c}/><path d="m-13 9 8 10H9m-28-39 5 7m25-12-1 8m15-1-7 5" stroke={c}/></>}</g>)}
            <path d="m137 91 20 41m64-41-20 41m-89 62 23-8m89 0 23 8" stroke="#a9c7c5" strokeDasharray="3 5"/>
          </svg>
        ) : slug === "mythical-creature" ? (
          <svg data-mythical-creature-six-themes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#d88770", "#d4b775", "#9bb7cb", "#78a7a2", "#c9949e", "#75939c"].map((c,i)=><g key={c} transform={`translate(${44+i%3*95} ${57+Math.floor(i/3)*99})`}><rect width="82" height="85" rx="15" fill="#fffdf8" stroke={c} strokeWidth="1.4"/>{i===0?<><path d="m17 52 9-27 13 8 16-12 9 24-15-3-10 18-22-8Z" fill={c} fillOpacity=".25" stroke={c}/><path d="m28 27-4-10m30 6 5-10m-29 38h13" stroke={c}/><circle cx="46" cy="35" r="2" fill={c}/></>:i===1?<><path d="M42 64C14 51 16 25 27 18c-2 15 6 18 11 23-1-16 11-22 13-27 2 13 20 26 9 41-4 6-10 9-18 9Z" fill={c} fillOpacity=".22" stroke={c}/><path d="M42 64V42m0 10-11-9m11 15 12-12" stroke={c}/></>:i===2?<><path d="m27 57 4-23 14-10 13 9-7 8 7 16H27Z" fill={c} fillOpacity=".22" stroke={c}/><path d="m42 26 9-17 1 22m-21 5-10-7" stroke={c}/><circle cx="43" cy="36" r="2" fill={c}/></>:i===3?<><path d="m42 18 21 10v17c0 11-11 18-21 23-10-5-21-12-21-23V28l21-10Z" fill={c} fillOpacity=".2" stroke={c}/><path d="m31 46 8 8 15-19" stroke={c} strokeWidth="2"/></>:i===4?<><path d="M41 21c-13 0-18 13-10 22l10 10-10 12 12-4 13 4-10-14 9-12c6-9-2-18-14-18Z" fill={c} fillOpacity=".23" stroke={c}/><path d="M16 48q9-8 17 0m18 0q9-8 17 0" stroke={c}/><circle cx="41" cy="29" r="2" fill={c}/></>:<><path d="M27 37c0-22 29-22 29 0v12H27V37Z" fill={c} fillOpacity=".25" stroke={c}/><path d="M27 47c-18 20-14-8-18 0m25 0c-10 29-13 18-13 11m20-11v18m7-18c9 29 14 16 14 10m-6-10c18 20 14-8 18 0" stroke={c}/><circle cx="36" cy="38" r="2" fill={c}/><circle cx="47" cy="38" r="2" fill={c}/></>}</g>)}
          </svg>
        ) : slug === "what-dog-breed-am-i" ? (
          <svg data-dog-breed-six-preferences="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{x:92,y:66,c:"#d4b775"},{x:179,y:58,c:"#78a7a2"},{x:266,y:66,c:"#9bb7cb"},{x:92,y:184,c:"#d48b72"},{x:179,y:193,c:"#c9949e"},{x:266,y:184,c:"#78a7a2"}].map(({x,y,c},i)=><g key={i} transform={`translate(${x} ${y})`}><rect x="-34" y="-31" width="68" height="78" rx="13" fill="#fffdf8" stroke={c} strokeWidth="1.5"/><g stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {i===0?<><path d="M-17-11q-15 0-11 23 4 11 11-2m34-21q15 0 11 23-4 11-11-2M-17-11q17-9 34 0l-1 22q-16 20-32 0Z"/></>:i===1?<><path d="m-19-11 5-16 11 15h6l11-15 5 16-4 22-15 9-15-9Z"/><path d="M0-12-6 6l6 5 6-5Z"/></>:i===2?<><path d="m-21-9 4-19 14 16h6l14-16 4 19-4 24L0 24-17 15Z"/><path d="m-17-9 11 5-3 10-8 1m34-16-11 5 3 10 8 1"/></>:i===3?<><path d="m-20-8 1-22 15 18h8l15-18 1 22-6 24L0 24-14 16Z"/><path d="m-13-8 8 7m18-7-8 7M-7 7h14l-1 11H-6Z"/></>:i===4?<><circle cy="3" r="23"/><path d="m-20-11 8-8 4 12m28-4-8-8-4 12"/><ellipse cy="11" rx="13" ry="9"/><path d="M-10-1q3-5 6 0m8 0q3-5 6 0m-14-11 4-2 4 2"/></>:<><path d="m-14-10-13-20 3 24 9 6m29-10 13-20-3 24-9 6M-14-10q14-8 28 0l4 19q-18 23-36 0Z"/><path d="m-11 0 5 1m17-1-5 1"/></>}
              {i!==4&&<><circle cx="-8" cy="1" r="1" fill={c}/><circle cx="8" cy="1" r="1" fill={c}/></>}<path d="m-3 10 3 3 3-3m-3 3v4"/>
              <path d="M-12 35h24" strokeWidth="2"/>
            </g></g>)}
          </svg>
        ) : slug === "spirit-animal" ? (
          <svg data-spirit-animal-nine-choices="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{x:89,y:64,c:"#d48b72"},{x:169,y:56,c:"#78a7a2"},{x:249,y:64,c:"#d4b775"},{x:79,y:139,c:"#9bb7cb"},{x:169,y:139,c:"#78a7a2"},{x:259,y:139,c:"#c9949e"},{x:89,y:214,c:"#d4b775"},{x:169,y:222,c:"#9bb7cb"},{x:249,y:214,c:"#d48b72"}].map(({x,y,c},i)=><g key={i} transform={`translate(${x} ${y})`}><rect x="-27" y="-27" width="54" height="54" rx="12" fill="#fffdf8" stroke={c} strokeWidth="1.5"/><g stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {i===0?<><path d="m-17-8 1-13 11 9h10l11-9 1 13-6 19L0 19-11 11Z"/><path d="m-11 0 7 4m15-4-7 4m-8 6 4 3 4-3"/></>:i===1?<><path d="m-18-15 8 5h20l8-5-3 28-15 7-15-7Z"/><circle cx="-8" cy="-1" r="6"/><circle cx="8" cy="-1" r="6"/><path d="m-3 8 3 4 3-4"/></>:i===2?<><path d="m-18-20 3 24 15 16L15 4l3-24L5-9H-5Z"/><path d="m-15 4 10-4m20 4-10-4m-8 12 3 3 3-3"/></>:i===3?<><path d="m-8-12-9-5 2 10-5 8 5 10 7 7H8l7-7 5-10-5-8 2-10-9 5Z"/><ellipse rx="14" ry="16"/><path d="m-7-1 2 1m12-1-2 1m-9 8 4 3 4-3"/></>:i===4?<><path d="M-21 8q2-20 22-21l-4-8 13 11 10 14-11-4 5 16Q-1 4-21 8Z"/><path d="M-6 6q0 10-9 12l4-12"/><circle cx="7" cy="-5" r="1"/></>:i===5?<><path d="m-9-7-2-12-7-5m7 5-6 2m26 10 2-12 7-5m-7 5 6 2M-12-4l-10-5 3 11 8 3m23-9 10-5-3 11-8 3"/><path d="M-11-6h22l-2 19L0 21-9 13Z"/><path d="m-6 2 1 1m11-1-1 1m-8 10 3 2 3-2"/></>:i===6?<><circle cx="-13" cy="-14" r="6"/><circle cx="13" cy="-14" r="6"/><ellipse rx="18" ry="20"/><ellipse cy="9" rx="8" ry="6"/><path d="m-8-1 1 1m15-1-1 1m-9 7 2 2 2-2"/></>:i===7?<><path d="m-18 13 4-22 12-11 16 10 6 11-12-2-2 13-12 6Z"/><path d="m6-10 8 5-8 4m-11-9 4 1"/></>:<><circle cx="-13" cy="-11" r="5"/><circle cx="13" cy="-11" r="5"/><ellipse cy="2" rx="18" ry="17"/><ellipse cy="8" rx="10" ry="6"/><path d="m-8-3 1 1m15-1-1 1m-9 6 2 2 2-2m-8 3-13-2m13 6-13 2m25-6 13-2m-13 6 13 2"/></>}
            </g></g>)}
          </svg>
        ) : slug === "social-battery-test" ? (
          <svg data-social-battery-four-contexts="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="64" y="48" width="104" height="84" rx="12" fill="#fffdf8" stroke="#d48b72" strokeWidth="1.5"/><path d="M90 72h50v26h-20l-12 10v-10H90z" stroke="#d48b72" strokeWidth="1.8"/>
            <rect x="190" y="48" width="104" height="84" rx="12" fill="#fffdf8" stroke="#d4b775" strokeWidth="1.5"/><path d="M212 76h58m-58 15h43m-43 15h50" stroke="#d4b775" strokeWidth="1.8"/><circle cx="216" cy="76" r="3" fill="#d4b775"/>
            <rect x="64" y="154" width="104" height="84" rx="12" fill="#fffdf8" stroke="#78a7a2" strokeWidth="1.5"/><path d="M86 181q15-14 30 0t30 0m-60 18q15-14 30 0t30 0m-60 18q15-14 30 0t30 0" stroke="#78a7a2" strokeWidth="1.8"/>
            <rect x="190" y="154" width="104" height="84" rx="12" fill="#fffdf8" stroke="#9bb7cb" strokeWidth="1.5"/><circle cx="225" cy="183" r="9" stroke="#9bb7cb" strokeWidth="1.8"/><circle cx="260" cy="183" r="9" stroke="#9bb7cb" strokeWidth="1.8"/><path d="M210 219v-10a15 15 0 0 1 30 0v10m5 0v-10a15 15 0 0 1 30 0v10" stroke="#9bb7cb" strokeWidth="1.8"/>
          </svg>
        ) : slug === "perceived-stress-scale-4" ? (
          <svg data-pss4-four-contributions="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{x:66,y:61,c:"#d48b72",label:"1"},{x:193,y:61,c:"#78a7a2",label:"2"},{x:66,y:167,c:"#78a7a2",label:"3"},{x:193,y:167,c:"#d4b775",label:"4"}].map(({x,y,c,label})=><g key={label} transform={`translate(${x} ${y})`}><rect width="96" height="72" rx="12" fill="#fffdf8" stroke={c} strokeWidth="1.5"/><text x="20" y="32" fill="#17454d" fontSize="20">{label}</text><path d="M19 50h56" stroke={c} strokeWidth="2"/>{(label==="2"||label==="3")&&<path d="M58 18h19l-5-5m5 5-5 5" stroke={c} strokeWidth="1.6"/>}</g>)}
            <path d="M164 96h27m-14 39v27m-13 41h27" stroke="#a9c7c5" strokeDasharray="3 4"/>
          </svg>
        ) : slug === "time-of-year-context-reflection" ? (
          <svg data-season-context-unfixed-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {[{x:77,y:72,c:"#78a7a2"},{x:188,y:61,c:"#d4b775"},{x:66,y:160,c:"#9bb7cb"},{x:198,y:151,c:"#c9949e"}].map(({x,y,c})=><g key={c} transform={`translate(${x} ${y})`}><rect width="92" height="76" rx="10" fill="#fffdf8" stroke={c} strokeWidth="1.5"/><path d="M16 24h59m-59 13h38m-38 13h48" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></g>)}
            <path d="M171 109h12m-8 89h17m-54-44v6m99-17v7" stroke="#a9c7c5" strokeDasharray="3 4"/><circle cx="298" cy="46" r="5" fill="#d4b775"/>
          </svg>
        ) : slug === "unfamiliar-experiences-reflection" ? (
          <svg data-unfamiliar-five-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="65" y="52" width="232" height="186" rx="15" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5"/>
            {["#78a7a2", "#9bb7cb", "#c9949e", "#d4b775", "#9bb9a4"].map((c,i)=><g key={c} transform={`translate(86 ${71+i*29})`}><rect width="22" height="17" rx="5" fill={c} fillOpacity=".23"/><path d="M37 5h131m-131 8h89" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></g>)}
            <path d="M40 143h12m258 35h12" stroke="#78a7a2" strokeWidth="1.5"/><circle cx="302" cy="42" r="5" fill="#d4b775"/>
          </svg>
        ) : slug === "after-childbirth-context-reflection" ? (
          <svg data-birth-context-recollection-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="63" y="53" width="235" height="187" rx="15" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5"/>
            <path d="M180 72v149" stroke="#d7e4df"/>
            {[{x:83,y:79,c:"#78a7a2"},{x:199,y:79,c:"#d4b775"},{x:83,y:155,c:"#9bb7cb"},{x:199,y:155,c:"#c9949e"}].map(({x,y,c})=><g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><rect width="78" height="58" rx="9" fill={c} fillOpacity=".13"/><path d="M15 20h47m-47 10h33m-33 10h40" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></g>)}
            <path d="M40 127h11m257 56h12" stroke="#78a7a2" strokeWidth="1.5"/><circle cx="300" cy="42" r="5" fill="#d4b775"/>
          </svg>
        ) : slug === "uncertainty-ease-reflection" ? (
          <svg data-uncertainty-ease-open-arrangement="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="64" y="67" width="232" height="160" rx="16" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5"/>
            <path d="M87 94h74m-74 11h48" stroke="#78a7a2" strokeWidth="2" strokeLinecap="round"/>
            {["#78a7a2", "#d4b775", "#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(${91+i*66} 129)`}><rect width="46" height="61" rx="8" fill={colour} fillOpacity=".16" stroke={colour}/><path d="M12 18h22m-22 11h13" stroke={colour} strokeWidth="1.5"/></g>)}
            <path d="M91 207h64m22 0h28m22 0h39" stroke="#a9c7c5" strokeLinecap="round"/><path d="M198 94h64" stroke="#d4b775" strokeDasharray="4 5"/><circle cx="306" cy="55" r="6" fill="#d4b775"/>
          </svg>
        ) : slug === "disconnection-experiences-reflection" ? (
          <svg data-disconnection-recollection-panels="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#78a7a2", "#d4b775", "#9bb7cb", "#d88770"].map((colour,i)=><g key={colour} transform={`translate(${65+i%2*125} ${48+Math.floor(i/2)*105})`}><rect width="105" height="86" rx="12" fill="#fffdf8" stroke={colour} strokeWidth="1.5" />{i===0?<><circle cx="52" cy="33" r="14" stroke={colour}/><path d="M27 66q25-29 50 0" stroke={colour}/></>:i===1?<><path d="M23 61V30l29-13 29 13v31H23Zm29-44v44m-29-31 29 15 29-15" stroke={colour}/></>:i===2?<><circle cx="52" cy="42" r="24" stroke={colour}/><circle cx="52" cy="42" r="9" fill={colour} fillOpacity=".25"/><path d="M14 42h10m56 0h10" stroke={colour}/></>:<><path d="M24 24h55M24 37h38M24 50h47M24 63h26" stroke={colour} strokeWidth="2" strokeLinecap="round"/></>}</g>)}
            <path d="M180 68v150" stroke="#b9d0ce" strokeDasharray="3 7"/><circle cx="319" cy="236" r="5" fill="#d4b775"/>
          </svg>
        ) : slug === "menstrual-cycle-context-reflection" ? (
          <svg data-cycle-context-recollection-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M53 66q62-17 127 0 64-17 127 0v172q-63-17-127 0-65-17-127 0Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5" />
            <path d="M180 67v170" stroke="#a9c7c5" />
            {["#d88770", "#d4b775", "#78a7a2", "#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(${76+i%2*130} ${88+Math.floor(i/2)*67})`}><rect width="78" height="47" rx="6" fill={colour} fillOpacity=".12" stroke={colour} /><path d="M11 15h47m-47 11h31" stroke={colour} strokeWidth="1.5" strokeLinecap="round" /></g>)}
            <path d="M76 217h70m61 0h70" stroke="#a9c7c5" strokeWidth="1.5" /><circle cx="304" cy="50" r="6" fill="#d4b775" />
          </svg>
        ) : slug === "feedback-self-worth-reflection" ? (
          <svg data-feedback-worth-topic-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="50" y="48" width="260" height="198" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M75 74h112m-112 13h74" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            <path d="M74 112h58v36h-19l-9 9v-9H74Z" fill="#d88770" fillOpacity=".14" stroke="#d88770" />
            <rect x="150" y="110" width="57" height="75" rx="8" fill="#78a7a2" fillOpacity=".13" stroke="#78a7a2" />
            <path d="M163 127h31m-31 12h23m-23 25h31" stroke="#78a7a2" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M230 132q31-26 49 6m-7-2 8 4 1-9M277 172q-27 24-46-3m1 7-3-9 9 1" stroke="#9bb7cb" strokeWidth="2" strokeLinecap="round" />
            <path d="M75 213h172m-172 12h118" stroke="#a9c7c5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : slug === "spatial-thinking-reflection" ? (
          <svg data-spatial-context-arrangement="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="54" y="55" width="252" height="180" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M77 80h106m-106 13h67" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            <rect x="80" y="122" width="66" height="66" rx="7" fill="#78a7a2" fillOpacity=".14" stroke="#78a7a2" />
            <path d="M98 171v-31h29" stroke="#78a7a2" strokeWidth="3" strokeLinecap="round" />
            <rect x="212" y="122" width="66" height="66" rx="7" fill="#d4b775" fillOpacity=".14" stroke="#d4b775" />
            <path d="M228 140h32v31" stroke="#d4b775" strokeWidth="3" strokeLinecap="round" />
            <path d="M162 153q17-22 35 0m-6-1 7 2-2-7" stroke="#9bb7cb" strokeWidth="1.5" />
            <path d="M79 212h146" stroke="#a9c7c5" /><circle cx="304" cy="49" r="6" fill="#d88770" />
          </svg>
        ) : slug === "emotions-connections-reflection" ? (
          <svg data-emotions-connections-topic-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="51" y="49" width="258" height="199" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M75 74h107m-107 13h72" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc", "#d88770", "#78a7a2", "#d4b775"].map((colour,i)=><g key={i} transform={`translate(${75+i%4*56} ${108+Math.floor(i/4)*59})`}><rect width="43" height="45" rx="6" fill={colour} fillOpacity=".13" stroke={colour} /><path d="M9 15h25m-25 11h18" stroke={colour} strokeWidth="1.5" strokeLinecap="round" /></g>)}
            <path d="M75 232h130" stroke="#a9c7c5" /><circle cx="307" cy="43" r="6" fill="#d88770" />
          </svg>
        ) : slug === "feelings-connection-reflection" ? (
          <svg data-feelings-connection-open-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M55 64q62-21 125 0 63-21 125 0v167q-62-21-125 0-63-21-125 0Z" fill="#fffdf8" stroke="#a9c7c5" strokeWidth="1.5" />
            <path d="M180 65v165" stroke="#a9c7c5" />
            <path d="M78 92h69m-69 13h50m-50 72h70m-70 13h52m50-98h69m-69 13h50m-50 72h70m-70 13h52" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            <path d="M82 142q12-12 24 0t24 0t24 0" stroke="#d88770" strokeWidth="2" strokeLinecap="round" />
            <path d="M211 128h62v26h-24l-9 8v-8h-29Z" fill="#78a7a2" fillOpacity=".13" stroke="#78a7a2" />
            <circle cx="308" cy="51" r="6" fill="#d4b775" />
          </svg>
        ) : slug === "mood-activity-changes-reflection" ? (
          <svg data-mood-activity-context-cards="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="48" y="44" width="264" height="205" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M73 70h98m-98 12h64" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#d88770", "#d4b775", "#9bb7cb", "#78a7a2"].map((colour,i)=><g key={colour} transform={`translate(${73+i%2*112} ${100+Math.floor(i/2)*64})`}><rect width="99" height="51" rx="8" fill={colour} fillOpacity=".13" stroke={colour} /><path d="M12 16h39m-39 12h74m-74 10h58" stroke={colour} strokeWidth="1.5" strokeLinecap="round" /></g>)}
            <path d="M73 233h147" stroke="#a9c7c5" /><circle cx="309" cy="42" r="6" fill="#d88770" />
          </svg>
        ) : slug === "gender-experiences-reflection" ? (
          <svg data-gender-experiences-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="51" y="48" width="258" height="198" rx="15" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M76 74h109m-109 13h73" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(${76+i*54} 111)`}><rect width="44" height="105" rx="7" fill={colour} fillOpacity=".13" stroke={colour} /><path d="M10 22h24m-24 13h17m-17 36h24m-24 12h16" stroke={colour} strokeWidth="1.5" strokeLinecap="round" /></g>)}
            <path d="M76 231h121" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" /><circle cx="308" cy="43" r="6" fill="#d88770" />
          </svg>
        ) : slug === "communication-routines-context" ? (
          <svg data-communication-routines-board="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="50" y="48" width="260" height="197" rx="15" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M74 74h94m-94 13h61" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            <path d="M78 113h75v37h-29l-13 11v-11H78Z" fill="#78a7a2" fillOpacity=".16" stroke="#78a7a2" /><path d="M90 125h50m-50 12h32" stroke="#78a7a2" strokeWidth="1.5" />
            <rect x="187" y="112" width="90" height="44" rx="7" fill="#d4b775" fillOpacity=".15" /><path d="M201 126h61m-61 13h42" stroke="#d4b775" strokeWidth="1.5" />
            {[0,1,2].map(i=><g key={i}><rect x={78+i*72} y="185" width="53" height="31" rx="6" fill="#9bb7cb" fillOpacity=".18" stroke="#9bb7cb" /><path d={`M${90+i*72} 201h29`} stroke="#9bb7cb" /></g>)}
            <path d="M155 133h22m-5-4 5 4-5 4" stroke="#a9c7c5" /><circle cx="308" cy="43" r="6" fill="#d88770" />
          </svg>
        ) : slug === "eating-experiences-reflection" ? (
          <svg data-eating-experiences-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="58" y="54" width="244" height="188" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M81 83h104m-104 14h67" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc", "#d88770"].map((colour,i)=><g key={colour} transform={`translate(${82+i*40} 119)`}><path d="M0 0h24l8 8v80H0Z" fill={colour} fillOpacity=".15" stroke={colour} /><path d="M8 23h16m-16 12h16m-16 12h10" stroke={colour} strokeWidth="1.5" strokeLinecap="round" /></g>)}
            <path d="M83 224h125" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" /><circle cx="305" cy="46" r="6" fill="#d88770" />
          </svg>
        ) : slug === "recent-mood-reflection" ? (
          <svg data-recent-mood-windows="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M55 230V92a49 49 0 0 1 98 0v138Z" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M132 230V75a49 49 0 0 1 98 0v155Z" fill="#fffdf8" stroke="#d4b775" />
            <path d="M209 230V92a49 49 0 0 1 98 0v138Z" fill="#fffdf8" stroke="#b9aacc" />
            <circle cx="103" cy="105" r="19" fill="#d88770" fillOpacity=".35" /><path d="M69 175q32-25 70 0m-70 19q32-25 70 0" stroke="#78a7a2" strokeWidth="2" />
            <path d="M183 85a21 21 0 1 0 22 29 23 23 0 0 1-22-29Z" fill="#d4b775" fillOpacity=".55" /><path d="M151 177h59m-59 15h41" stroke="#d4b775" strokeWidth="2" strokeLinecap="round" />
            <path d="M229 108h56v41h-24l-11 9v-9h-21Z" fill="#b9aacc" fillOpacity=".18" stroke="#b9aacc" /><path d="M240 122h33m-33 13h22m-9 55h33m-33 12h23" stroke="#b9aacc" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 241h252" stroke="#a9c7c5" /><circle cx="303" cy="54" r="6" fill="#d88770" />
          </svg>
        ) : slug === "child-focus-activity-observations" ? (
          <svg data-caregiver-context-scenes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="51" y="37" width="258" height="219" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M75 61h105m-105 12h70" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(${75+i%2*112} ${94+Math.floor(i/2)*71})`}><rect width="98" height="59" rx="9" fill={colour} fillOpacity=".13" /><path d="M12 43h72m-72 7h43" stroke={colour} strokeWidth="1.5" /></g>)}
            <path d="M94 111q11-7 22 0 11-7 22 0v19q-11-5-22 0-11-5-22 0Zm22 0v19" stroke="#78a7a2" strokeWidth="2" />
            <path d="M206 118q9-14 18 0t18 0t18 0" stroke="#d4b775" strokeWidth="2" strokeLinecap="round" />
            <circle cx="107" cy="186" r="9" stroke="#9bb7cb" strokeWidth="2" /><circle cx="132" cy="186" r="9" stroke="#9bb7cb" strokeWidth="2" /><path d="M147 186h8m-4-4 4 4-4 4" stroke="#9bb7cb" />
            <path d="M209 175h40v22h-17l-8 7v-7h-15Z" stroke="#b9aacc" strokeWidth="2" /><path d="M218 183h21m-21 7h13" stroke="#b9aacc" />
            <circle cx="306" cy="42" r="6" fill="#d88770" />
          </svg>
        ) : slug === "everyday-worry-reflection" ? (
          <svg data-everyday-worry-recollection="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M57 66q58-24 123 0 65-24 123 0v168q-61-18-123 0-62-18-123 0Z" fill="#fffdf8" stroke="#a9c7c5" /><path d="M180 67v165" stroke="#a9c7c5" />
            <path d="M79 92h75m-75 13h53m51-13h75m-75 13h51" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(${i===2?204:79} ${i===1?176:129})`}><rect width="75" height="32" rx="9" fill={colour} fillOpacity=".16" /><path d="M11 12h51m-51 10h34" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M205 189h67m-67 13h45" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" /><circle cx="302" cy="53" r="6" fill="#d88770" /><path d="M76 258h75" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "drinking-experiences-reflection" ? (
          <svg data-drinking-experiences-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="54" y="39" width="252" height="216" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M79 66h108m-108 12h70" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb","#b9aacc"].map((c,i)=><g key={c} transform={`translate(77 ${98+i*35})`}><rect width="29" height="23" rx="7" fill={c} fillOpacity=".2" /><path d="M41 7h120m-120 10h69" stroke={c} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M287 88v147" stroke="#a9c7c5" strokeOpacity=".4" /><circle cx="302" cy="48" r="6" fill="#d88770" /><path d="M76 267h78" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "care-feelings-reflection" ? (
          <svg data-care-feelings-recollections="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="52" y="51" width="119" height="189" rx="12" fill="#fffdf8" stroke="#a9c7c5" />
            <rect x="189" y="51" width="119" height="189" rx="12" fill="#fffdf8" stroke="#d4b775" />
            <path d="M180 44v201" stroke="#a9c7c5" strokeDasharray="4 7" />
            <path d="M71 77h77m-77 13h51m64-13h77m-77 13h51" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#9bb7cb","#b9aacc"].map((c,i)=><g key={c}><rect x="72" y={116+i*34} width="79" height="23" rx="7" fill={c} fillOpacity=".2" /><path d={`M83 ${127+i*34}h53`} stroke={c} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M246 140c-23-25-47 8 0 40 47-32 23-65 0-40Z" fill="#d88770" fillOpacity=".42" /><path d="M212 205h72" stroke="#d4b775" strokeWidth="2" />
            <circle cx="307" cy="48" r="6" fill="#d4b775" /><path d="M72 263h73" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "social-context-reflection" ? (
          <svg data-social-context-dialogue="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="56" y="41" width="248" height="213" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M82 68h99m-99 13h65" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            <path d="M83 109h104a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12h-70l-18 14v-14H83a12 12 0 0 1-12-12v-30a12 12 0 0 1 12-12Z" fill="#78a7a2" fillOpacity=".16" stroke="#78a7a2" />
            <path d="M185 173h87a12 12 0 0 1 12 12v24a12 12 0 0 1-12 12h-12v14l-18-14h-57a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12Z" fill="#d4b775" fillOpacity=".16" stroke="#d4b775" />
            <path d="M91 129h87m-87 14h64m-4 53h-50m-10 14h60m42-18h72m-72 12h44" stroke="#9bb7cb" strokeWidth="2" strokeLinecap="round" />
            <circle cx="294" cy="59" r="6" fill="#d88770" /><path d="M74 265h75" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "number-context-reflection" ? (
          <svg data-number-context-notebook="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="56" y="42" width="248" height="212" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M79 69h97m-97 12h62M178 101v129" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb","#d88770"].map((colour,i)=><g key={colour} transform={`translate(${i%2?199:80} ${105+Math.floor(i/2)*65})`}><rect width="78" height="48" rx="8" fill={colour} fillOpacity=".12" /><path d="M12 16h53m-53 12h35" stroke={colour} strokeWidth="2" strokeLinecap="round" />{Array.from({length:3},(_,j)=><circle key={j} cx={14+j*14} cy="39" r="2" fill={colour} />)}</g>)}
            <circle cx="304" cy="54" r="6" fill="#d4b775" /><path d="M73 265h75" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "written-language-context-reflection" ? (
          <svg data-written-language-pages="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="58" y="49" width="160" height="186" rx="13" fill="#fffdf8" stroke="#a9c7c5" />
            <rect x="150" y="75" width="149" height="175" rx="13" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M80 76h92m-92 15h67m-67 30h50m-50 15h50m-50 15h50m-50 15h50" stroke="#78a7a2" strokeWidth="2" strokeLinecap="round" />
            <path d="M176 111h94m-94 16h70m-70 33h94m-94 16h66m-66 17h87" stroke="#9bb7cb" strokeWidth="2" strokeLinecap="round" />
            <path d="M176 215h31" stroke="#d88770" strokeWidth="5" strokeLinecap="round" />
            <circle cx="294" cy="47" r="7" fill="#d4b775" /><path d="M78 260h79" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "nakshatra-spica-reference" ? (
          <svg data-nakshatra-sector-wheel="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <circle cx="180" cy="145" r="110" fill="#fffdf8" stroke="#a9c7c5" />
            <circle cx="180" cy="145" r="85" stroke="#a9c7c5" strokeOpacity=".6" />
            {Array.from({length:27},(_,i)=><g key={i} transform={`rotate(${i*360/27} 180 145)`}><path d="M180 35v25" stroke={["#78a7a2","#d4b775","#9bb7cb"][i%3]} strokeWidth="2" /><circle cx="180" cy="72" r="3" fill="#78a7a2" fillOpacity=".5" /></g>)}
            <path d="M189 101a46 46 0 1 0 25 76 48 48 0 0 1-25-76Z" fill="#d4b775" />
            <path d="m244 170 4 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1Z" fill="#d88770" />
            <path d="M72 267h82" stroke="#a9c7c5" strokeWidth="2" />
          </svg>
        ) : slug === "focus-energy-context-reflection" ? (
          <svg data-focus-context-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(${62+i%2*126} ${42+Math.floor(i/2)*111})`}><rect width="108" height="96" rx="13" fill="#fffdf8" stroke={colour} /><circle cx="24" cy="24" r="8" fill={colour} fillOpacity=".35" /><path d="M17 48h72m-72 13h51" stroke={colour} strokeWidth="2" strokeLinecap="round" />{Array.from({length:4},(_,j)=><rect key={j} x={18+j*19} y="76" width="10" height="5" rx="2" fill={colour} fillOpacity=".35" />)}</g>)}
            <path d="M82 262h73" stroke="#a9c7c5" strokeWidth="2" /><circle cx="305" cy="43" r="6" fill="#d88770" />
          </svg>
        ) : slug === "unwanted-thoughts-actions-reflection" ? (
          <svg data-unwanted-actions-notebook="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M57 67q57-22 123 0 66-22 123 0v169q-60-17-123 0-63-17-123 0Z" fill="#fffdf8" stroke="#a9c7c5" /><path d="M180 68v166" stroke="#a9c7c5" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc", "#d88770"].map((colour,i)=><g key={colour} transform={`translate(${i<3?76:200} ${92+(i<3?i:i-3)*42})`}><rect width="12" height="16" rx="3" fill={colour} fillOpacity=".55" /><path d="M25 4h55m-55 8h39" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M78 250h78" stroke="#a9c7c5" strokeWidth="2" /><circle cx="294" cy="47" r="6" fill="#d4b775" />
          </svg>
        ) : slug === "sudden-fear-reflection" ? (
          <svg data-sudden-fear-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#78a7a2", "#d4b775", "#9bb7cb", "#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(${55+i%2*128} ${46+Math.floor(i/2)*104})`}><rect width="115" height="91" rx="12" fill="#fffdf8" stroke={colour} /><path d="M19 24h66m-66 12h45" stroke={colour} strokeWidth="2" strokeLinecap="round" />{Array.from({length:5},(_,j)=><circle key={j} cx={23+j*17} cy="65" r="4" fill={colour} fillOpacity=".4" />)}</g>)}
            <path d="M72 263h71" stroke="#a9c7c5" strokeWidth="2" /><circle cx="306" cy="40" r="6" fill="#d88770" />
          </svg>
        ) : slug === "weton-story-preferences" ? (
          <svg data-weton-story-grid="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="46" y="51" width="268" height="197" rx="14" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M67 73h112m-112 10h76" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {Array.from({length:7},(_,r)=>Array.from({length:5},(_,c)=><rect key={`${r}-${c}`} x={71+c*45} y={101+r*18} width="28" height="11" rx="3" fill={["#78a7a2","#d4b775","#9bb7cb","#d88770","#b9aacc"][c]} fillOpacity={r===3?.65:.24} />))}
            <path d="M63 260h78" stroke="#78a7a2" strokeWidth="2" /><circle cx="307" cy="59" r="6" fill="#d4b775" />
          </svg>
        ) : slug === "health-worries-reflection" ? (
          <svg data-health-reflection-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="54" y="42" width="252" height="211" rx="15" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M79 67h105m-105 11h73" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(79 ${101+i*43})`}><rect width="28" height="28" rx="8" fill={colour} fillOpacity=".2" /><circle cx="14" cy="14" r="6" stroke={colour} /><path d="M43 7h112m-112 13h82" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M285 61v171" stroke="#a9c7c5" strokeOpacity=".35" /><circle cx="310" cy="229" r="5" fill="#d88770" />
          </svg>
        ) : slug === "sleep-experiences-reflection" ? (
          <svg data-sleep-notebook="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="69" y="46" width="224" height="208" rx="13" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M93 46v208" stroke="#a9c7c5" strokeOpacity=".4" />
            {["#78a7a2", "#9bb7cb", "#d4b775", "#d88770", "#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(113 ${84+i*30})`}><circle cx="6" cy="5" r="5" fill={colour} fillOpacity=".6" /><path d="M22 1h119m-119 10h85" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M57 36a24 24 0 1 0 25 34A27 27 0 0 1 57 36Z" fill="#d4b775" /><circle cx="297" cy="45" r="6" fill="#78a7a2" />
          </svg>
        ) : slug === "prakriti-inventory21" ? (
          <svg data-bpi21-columns="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#78a7a2", "#d88770", "#d4b775"].map((colour, i) => <g key={colour} transform={`translate(${55+i*88} 55)`}><rect width="74" height="185" rx="13" fill="#fffdf8" stroke={colour} /><text x="37" y="36" textAnchor="middle" fill={colour} fontSize="20" fontFamily="Georgia,serif">{["V", "P", "K"][i]}</text>{Array.from({length:7},(_,j)=><path key={j} d={`M19 ${56+j*16}h36`} stroke={colour} strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />)}</g>)}
            <path d="M79 254h200" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : slug === "after-bereavement-reflection" ? (
          <svg data-bereavement-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="58" y="37" width="244" height="220" rx="15" fill="#fffdf8" stroke="#a9c7c5" />
            <path d="M87 64h100m-100 12h69" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#b9aacc", "#d4b775", "#9bb7cb", "#d88770"].map((colour, i) => <g key={colour} transform={`translate(88 ${98+i*28})`}><rect width="12" height="15" rx="3" fill={colour} fillOpacity=".45" /><path d="M26 4h132m-132 8h98" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M280 54v176" stroke="#a9c7c5" strokeOpacity=".35" /><circle cx="306" cy="229" r="5" fill="#d4b775" />
          </svg>
        ) : slug === "connection-meaning-reflection" ? (
          <svg data-connection-journal="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="47" y="42" width="266" height="207" rx="14" fill="white" stroke="#a9c7c5" />
            <path d="M67 67h108m-108 12h78" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb","#d88770","#b9aacc"].map((colour,i)=><g key={colour} transform={`translate(68 ${98+i*26})`}><circle cx="8" cy="8" r="7" fill={colour} fillOpacity=".5" /><path d="M27 4h128m-128 9h93" stroke={colour} strokeWidth="2" strokeLinecap="round" /><rect x="178" y="1" width="21" height="14" rx="4" stroke={colour} /></g>)}
            <circle cx="294" cy="64" r="5" fill="#d88770" /><path d="M63 259h79" stroke="#78a7a2" strokeWidth="2" />
          </svg>
        ) : slug === "considering-support-reflection" ? (
          <svg data-support-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M61 81h237M73 224h214" stroke="#a9c7c5" />
            {["#78a7a2", "#d4b775", "#9bb7cb", "#d88770"].map((colour,i)=><g key={colour} transform={`translate(${63+i%2*123} ${51+Math.floor(i/2)*102})`}><rect width="110" height="88" rx="12" fill="white" stroke={colour} /><path d="M17 22h65m-65 12h49" stroke={colour} strokeWidth="2" strokeLinecap="round" /><path d="M18 56h52m-52 10h36" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" /><circle cx="89" cy="64" r="6" fill={colour} fillOpacity=".5" /></g>)}
            <path d="m275 255 9-9m-9 0 9 9" stroke="#78a7a2" strokeWidth="2" /><circle cx="55" cy="46" r="5" fill="#d4b775" />
          </svg>
        ) : slug === "body-frame-observations" ? (
          <svg data-outline-sketches="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="42" y="58" width="276" height="176" rx="12" fill="white" stroke="#a9c7c5" />
            <path d="M65 83h99m-99 11h63" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(${64+i*81} 112)`}><rect width="69" height="94" rx="8" fill={colour} fillOpacity=".15" /><path d={i===0 ? "M13 64C2 28 58 19 56 56C54 82 30 88 13 64Z" : i===1 ? "M12 65Q14 43 31 42T57 20M12 76Q33 74 38 61T57 45" : "M12 67 24 42 43 49 57 22"} stroke={colour} strokeWidth="2" strokeLinecap="round" />{i===2&&<><circle cx="24" cy="42" r="4" fill={colour}/><circle cx="43" cy="49" r="4" fill={colour}/></>}</g>)}
            <circle cx="297" cy="80" r="5" fill="#d88770" /><path d="M56 245h71" stroke="#78a7a2" strokeWidth="2" />
          </svg>
        ) : slug === "connection-belonging-check-in" ? (
          <svg data-belonging-records="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="59" y="43" width="242" height="204" rx="12" fill="white" stroke="#a9c7c5" />
            <path d="M83 66h109m-109 10h68" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2", "#d4b775", "#9bb7cb"].map((colour,i)=><g key={colour} transform={`translate(81 ${98+i*43})`}><rect width="197" height="34" rx="7" fill={colour} fillOpacity=".18" /><circle cx="17" cy="17" r="7" fill={colour} />{[0,1,2,3,4,5].map(j=><rect key={j} x={38+j*24} y="10" width="16" height="14" rx="4" stroke={colour} />)}</g>)}
            <circle cx="291" cy="51" r="5" fill="#d88770" /><path d="M73 258h91" stroke="#78a7a2" strokeWidth="2" />
          </svg>
        ) : slug === "connection-ideals" ? (
          <svg data-connection-cards="true" viewBox="0 0 360 290" fill="none" focusable="false">
            {["#d88770", "#78a7a2", "#d4b775", "#9bb7cb", "#c4b9d9", "#b7c7b1"].map((colour,i)=><g key={colour} transform={`translate(${62+i%3*82} ${66+Math.floor(i/3)*91})`}><rect width="70" height="78" rx="10" fill="white" stroke={colour} /><circle cx="35" cy="27" r="13" fill={colour} fillOpacity=".45" /><path d="M21 52h28m-23 8h18" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M82 52h95m-12 199h110" stroke="#a9c7c5" strokeWidth="2" /><circle cx="288" cy="50" r="5" fill="#d88770" />
          </svg>
        ) : slug === "pressure-response-actions" ? (
          <svg data-pressure-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="69" y="42" width="222" height="207" rx="11" fill="white" stroke="#a9c7c5" />
            <path d="M95 68h112m-112 12h76" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#78a7a2","#d4b775","#9bb7cb","#d88770"].map((colour,i)=><g key={colour} transform={`translate(92 ${101+i*32})`}><rect width="17" height="17" rx="5" fill={colour} fillOpacity=".65" /><path d="M29 4h91m-91 9h67" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" /><circle cx="149" cy="8" r="4" stroke={colour} /></g>)}
            <path d="M56 82V63m0 0h-9m9 0h9M304 218v15h-13" stroke="#78a7a2" strokeWidth="2" /><circle cx="278" cy="49" r="5" fill="#d4b775" />
          </svg>
        ) : slug === "activity-engagement-patterns" ? (
          <svg data-activity-notes="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="47" y="48" width="266" height="195" rx="10" fill="white" stroke="#a9c7c5" />
            <path d="M66 76h98m-98 11h64" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {["#d88770","#78a7a2","#d4b775","#9bb7cb","#c4b9d9"].map((colour,i)=><g key={colour} transform={`translate(${67+i*46} 113)`}><rect width="37" height="94" rx="7" fill={colour} fillOpacity=".22" /><circle cx="18" cy="21" r="11" fill={colour} fillOpacity=".65" /><path d={i===0 ? "M12 21h12m-6-6v12" : i===1 ? "m13 17 6 5-6 5m6-5h7" : i===2 ? "m12 15 12 12m-12 0 12-12" : i===3 ? "m11 18 7 6 8-6m-15-3h15v14H11z" : "M9 21q9-13 18 0-9 13-18 0Z"} stroke="#113f49" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 53h17m-17 9h17m-17 9h12" stroke={colour} strokeWidth="2" strokeLinecap="round" /></g>)}
            <circle cx="285" cy="72" r="5" fill="#d88770" /><path d="M72 225h85" stroke="#78a7a2" strokeWidth="2" />
          </svg>
        ) : slug === "style-impression-preferences" ? (
          <svg data-style-moodboard="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <rect x="39" y="51" width="282" height="188" rx="10" fill="white" stroke="#a9c7c5" />
            {["#d88770","#f4e7ca","#113f49","#78a7a2","#c4b9d9","#d4b775","#9bb7cb","#d4c6b2"].map((colour,i) => <g key={colour} transform={`translate(${57+(i%4)*65} ${70+Math.floor(i/4)*81})`}><rect width="51" height="65" rx="5" fill={colour} fillOpacity=".7" /><path d={i%3===0 ? "M12 15h27v35H12z" : i%3===1 ? "M10 46q25-35 31-21M11 53q20-25 30-19" : "M13 17 38 49M13 49 38 17"} stroke={i===2 ? "#f4e7ca" : "#113f49"} strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M51 42h26m202 206h29" stroke="#78a7a2" strokeWidth="2" /><circle cx="308" cy="42" r="4" fill="#d88770" />
          </svg>
        ) : slug === "trauma-response-reflection" ? (
          <svg data-trauma-reading-art="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M57 212h246M83 229h194" stroke="#a9c7c5" strokeOpacity=".6" />
            <path d="M65 78q56-22 115 2v130q-58-24-115-2V78Z" fill="white" stroke="#78a7a2" strokeWidth="2" />
            <path d="M180 80q59-24 115-2v130q-57-16-115 2V80Z" fill="#f4e7ca" stroke="#78a7a2" strokeWidth="2" />
            <path d="M180 80v130M82 102q40-13 79 0m-79 22q40-13 79 0m-79 22q40-13 79 0m-79 22q40-13 53-4" stroke="#a9c7c5" strokeWidth="2" strokeLinecap="round" />
            {[102,128,154,180].map((y,i) => <g key={y}><rect x="201" y={y-8} width="13" height="13" rx="4" fill={i%2 ? "#78a7a2" : "#d88770"} fillOpacity=".6" /><path d={`M225 ${y-1}h46`} stroke="#78a7a2" strokeWidth="2" strokeLinecap="round" /></g>)}
            <path d="M263 69V47h17v26" fill="#78a7a2" fillOpacity=".6" />
            <circle cx="77" cy="54" r="5" fill="#d4b775" /><path d="M307 134h12m-6-6v12" stroke="#78a7a2" strokeWidth="2" />
          </svg>
        ) : slug === "outfit-line-preferences" ? (
          <svg data-outfit-lines="true" viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M28 62h304M38 225h284" stroke="#78a7a2" strokeOpacity=".35" />
            {[25, 89, 153, 217, 281].map(x => <rect key={x} x={x} y="80" width="54" height="128" rx="8" fill="white" stroke="#a9c7c5" />)}
            <g stroke="#008786" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M44 94v100m16-100v100m-19-88 11-6 11 6m-22 77h22" />
              <path d="m106 103-8 18 4 71h26l4-71-8-18m-18 0q9 10 18 0m-25 38h32" fill="#e5eeee" />
              <path d="M166 108h28v82h-28zm14 0v82m-14-59h10m8 0h10m-28 18h10m8 0h10" />
              <path d="M227 101h34v34h-34zm6 43h22v48h-22m-6-20h34" fill="#f4e7ca" />
              <path d="M295 101q22 3 25 24-20 11-22 29 21 4 21 37h-29q14-23 3-43 18-23 2-47Z" fill="#e5eeee" />
            </g>
            <path d="M105 62v12m64-12v12m64-12v12" stroke="#a9c7c5" />
            <circle cx="52" cy="62" r="4" fill="#d88770" /><circle cx="308" cy="62" r="4" fill="#d4b775" />
          </svg>
        ) : slug === "disc" ? (
          <svg viewBox="0 0 360 290" fill="none" focusable="false">
            {[
              { letter: "D", x: 58, y: 33, color: "#d88770", ink: "#103e48" },
              { letter: "I", x: 184, y: 22, color: "#f4e7ca", ink: "#103e48" },
              { letter: "S", x: 47, y: 154, color: "#103e48", ink: "#f4e7ca" },
              { letter: "C", x: 173, y: 143, color: "#78a7a2", ink: "#103e48" },
            ].map(({ letter, x, y, color, ink }) => (
              <g key={letter} transform={`translate(${x} ${y})`}>
                <rect width="112" height="112" rx="2" fill={color} />
                <text x="56" y="78" textAnchor="middle" fontFamily="Georgia, serif" fontSize="64" fill={ink}>{letter}</text>
              </g>
            ))}
          </svg>
         ) : slug === "big-fish-energy-test" ? (
          <svg viewBox="0 0 360 290" fill="none" focusable="false">
            <path d="M37 217c35-19 63 19 98 0s63 19 98 0 63 19 90 0M52 239c30-16 53 16 83 0s53 16 83 0 53 16 83 0" stroke="#78a7a2" strokeWidth="2" strokeOpacity=".55" />
            <g fill="#103e48">
              <path d="M49 95c18-26 52-35 82-15l19-12-4 29 14 18-27-1c-23 25-57 18-84-3l-20 12 5-20-6-18 21 10Z" />
              <path d="m80 78 11-24 10 23" />
            </g>
            <circle cx="120" cy="92" r="3" fill="#f4e7ca" />
            <path d="M193 111c-10-30 7-54 36-54h25c17 0 25 17 41 12l17-15-2 24 15 9c-14 7-22 7-29 3-2 34-25 51-59 48-20-2-34-11-44-27Z" fill="#78a7a2" />
            <circle cx="219" cy="89" r="3" fill="#103e48" />
            <path d="M238 57V43m-8 5 8-5 8 5" stroke="#78a7a2" strokeWidth="2" />
            <path d="M155 181v-17a25 25 0 0 1 50 0v17m-50-2c-13 23-25 20-23 7m31-9c-10 35-24 34-23 18m32-16c-4 32 3 39 10 20m7-21c7 31 20 33 20 17m-12-18c16 26 29 20 24 7" stroke="#d88770" strokeWidth="8" strokeLinecap="round" />
            <path d="M155 175v-11a25 25 0 0 1 50 0v11" fill="#d88770" />
            <circle cx="171" cy="163" r="3" fill="#103e48" /><circle cx="190" cy="163" r="3" fill="#103e48" />
            <circle cx="63" cy="168" r="5" stroke="#78a7a2" /><circle cx="80" cy="150" r="3" stroke="#78a7a2" /><circle cx="281" cy="171" r="6" stroke="#78a7a2" />
          </svg>
        ) : <DiscoveryCardArt slug={slug} category={category} />}
      </div>
    </div>
  );
}
