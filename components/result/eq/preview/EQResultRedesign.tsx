"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUpRight, BookOpen, Brain, BriefcaseBusiness,
  Check, ChevronDown, Coins, Heart, Lightbulb, MessageCircle,
  Orbit, Sparkles, Target, Waves, Zap,
} from "lucide-react";
import type { EqRedesignCandidate, EqRedesignCopy, EqPreviewQuality } from "@/lib/eq/redesignPreview";
import type { EqResultPresentation } from "@/lib/eq/resultPage";
import styles from "./EQResultRedesign.module.css";

const scorePosition = (score: number) => Math.max(0, Math.min(1, (score - 55) / 90));

const sectionIds = ["traits", "careers", "work", "pressure", "money", "relationships", "people", "plan", "insights", "science"];
const sectionIcons = [Brain, BriefcaseBusiness, Orbit, Zap, Coins, Heart, MessageCircle, Target, Lightbulb, BookOpen];
const sectionColors = ["#8064a8", "#497eaa", "#7b67a1", "#a77b35", "#4e896e", "#a55f7e", "#80689d", "#8064a8", "#a77b35", "#5f759d"];
const colorStyle = (color: string) => ({ "--accent": color }) as CSSProperties;

function Radar({ copy }: { copy: EqRedesignCopy }) {
  const cx = 200, cy = 173, radius = 112;
  // SA top, ER right, EM bottom, RM left. Radius is a score display scale, never a percentile.
  const point = (i: number, value: number) => {
    const angle = i * Math.PI / 2 - Math.PI / 2;
    return [cx + Math.cos(angle) * radius * value, cy + Math.sin(angle) * radius * value];
  };
  const polygon = (value: number) => [0, 1, 2, 3].map(i => point(i, value).join(",")).join(" ");
  const positions = copy.dimensions.map((d, i) => point(i, scorePosition(d.score)));
  return <svg className={styles.radar} viewBox="0 0 400 350" role="img" aria-label={copy.dimensions.map(d => `${d.name}: ${d.score} ${copy.labels.standard}`).join("; ")}>
    <defs><linearGradient id="eq-radar-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f472d0" stopOpacity=".42"/><stop offset="1" stopColor="#9b7cff" stopOpacity=".15"/></linearGradient></defs>
    {[.2,.4,.6,.8,1].map(v => <polygon key={v} points={polygon(v)} fill="none" stroke="#c9d1c7" strokeOpacity=".8" />)}
    {[0,1,2,3].map(i => <line key={i} x1={cx} y1={cy} x2={point(i,1)[0]} y2={point(i,1)[1]} stroke="#c9d1c7" strokeOpacity=".7" />)}
    <polygon className={styles.radarShape} points={positions.map(p => p.join(",")).join(" ")} fill="url(#eq-radar-fill)" stroke="#8c71b2" strokeWidth="2" />
    {copy.dimensions.map((d,i) => {
      const [x,y] = point(i, 1.34);
      const lines = (i === 1 || i === 3) && d.name.includes(" ") ? d.name.split(" ") : [d.name];
      return <g key={d.code}><circle cx={positions[i][0]} cy={positions[i][1]} r="5" fill={d.color} stroke="#ffffff" strokeWidth="2"/><text x={x} y={y-2} textAnchor="middle" fill="#344237" fontSize="12">{lines.map((line, n) => <tspan key={line} x={x} dy={n === 0 ? (lines.length > 1 ? -7 : 0) : 14}>{line}</tspan>)}</text><text x={x} y={y+22} textAnchor="middle" fill={d.color} fontSize="12">{d.score}</text></g>;
    })}
  </svg>;
}

function MiniBars({ copy }: { copy: EqRedesignCopy }) {
  return <div className={styles.miniBars} role="img" aria-label={copy.dimensions.map(d => `${d.name}: ${d.score}`).join("; ")}>
    {copy.dimensions.map(d => <div key={d.code} className={styles.miniBar}><span className={styles.miniTrack}><span style={{ height: `${scorePosition(d.score) * 100}%`, background: d.color }}/></span><span>{d.name}</span><strong style={{color:d.color}}>{d.score}</strong></div>)}
  </div>;
}

function Module({ index, copy, children, open = true }: { index: number; copy: EqRedesignCopy; children: ReactNode; open?: boolean }) {
  const Icon = sectionIcons[index];
  return <details id={sectionIds[index]} className={styles.module} open={open} style={colorStyle(sectionColors[index])} data-eq-module={sectionIds[index]}>
    <summary><span className={styles.moduleIcon}><Icon size={19} strokeWidth={1.7}/></span><h2>{copy.sections[index]}</h2><span className={styles.moduleNumber}>{String(index + 1).padStart(2,"0")}</span><ChevronDown className={styles.chevron} size={17}/></summary>
    <div className={styles.moduleBody}>{children}</div>
  </details>;
}

function TextCard({ item, icon }: { item: {title:string;body:string}; icon?: ReactNode }) {
  return <article className={styles.textCard}><h3>{icon}{item.title}</h3><p>{item.body}</p></article>;
}

export function EQResultRedesign({ candidate, locale, quality, preview = true, sample = false }: { candidate: EqRedesignCandidate | EqResultPresentation; locale: "zh-CN" | "en" | "zh-TW"; quality?: EqPreviewQuality; preview?: boolean; sample?: boolean }) {
  const resultId = "result_id" in candidate ? candidate.result_id : candidate.sample.formulation_id;
  const c = candidate.copy[locale], l = c.labels;
  const resultLabel = candidate.result_labels[resultId][locale];
  const dimensionBandLabel = (code: string) => candidate.dimension_bands.find(band => band.code === code)!.labels[locale];
  const routeLocale = locale === "zh-CN" ? "zh" : locale;
  const [checked, setChecked] = useState<number[]>([]);
  return <div className={styles.root} data-eq-redesign="true">
    <main className={styles.report}>
      {(preview || sample) && <div className={styles.sample}><span className={styles.statusDot}/>{c.sample_notice}{preview && <span>{l.local_preview}</span>}</div>}
      {preview && <form className={styles.previewControls} method="get"><label htmlFor="eq-preview-result">{l.preview_result}</label><select id="eq-preview-result" name="result" defaultValue={resultId}>{Object.entries(candidate.result_labels).map(([id, item]) => <option value={id} key={id}>{item[locale].title}</option>)}</select><button type="submit">{l.view}</button>{!quality && <a href={`/${routeLocale}/dev/mainstream-unlock?form=eq60&result=${resultId}`}>{l.preview_unlock}</a>}<span className={styles.previewLanguages}>{[["zh","简体中文"],["zh-TW","繁體中文"],["en","English"]].map(([lang,name])=><a key={lang} href={`/${lang}/dev/eq-result?result=${resultId}`} hrefLang={lang} aria-current={lang===routeLocale?"page":undefined}>{name}</a>)}</span></form>}
      {quality ? <>
        <section className={styles.hero} id="overview"><h1><span className={styles.heroAccent}>{resultLabel.title}</span></h1><div className={styles.summary}><span className={styles.summaryIcon}><Sparkles size={20}/></span><div><h2>{quality.summary_title}</h2><p>{quality.summary}</p></div></div></section>
        <section className={styles.qualityPanel}><h2>{quality.reasons_title}</h2><ul>{quality.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>{quality.steps.map(item=><TextCard key={item.title} item={item}/>)}</section>
      </> : <>
      <section className={styles.hero} id="overview">
        <h1><span className={styles.heroAccent}>{resultLabel.title}</span></h1>
        <div className={styles.profile}>
          <div className={styles.profileHeading}><div><h2>{c.chart_title}</h2></div><span className={styles.profileLogo}><Orbit size={24}/></span></div>
          <div className={styles.chartGrid}><Radar copy={c}/><div className={styles.scoreLegend}>{c.dimensions.map(d=><a href={`#trait-${d.code}`} key={d.code} style={colorStyle(d.color)}><span className={styles.legendIcon}>{d.code}</span><span><strong>{d.name}</strong><small>{dimensionBandLabel(d.band_code)}</small></span><b>{d.score}</b><ArrowUpRight size={14}/></a>)}<p>{l.standard} · 55–145</p></div></div>
        </div>
        <div className={styles.summary}><span className={styles.summaryIcon}><Sparkles size={20}/></span><div><span className={styles.kicker}>{l.result_label}</span><h2>{c.summary_title}</h2><p>{c.summary}</p></div></div>
      </section>
      <div className={styles.modules}>
        <Module index={0} copy={c}>{c.dimensions.map(d=><article id={`trait-${d.code}`} className={styles.traitCard} key={d.code} style={colorStyle(d.color)}>
          <div className={styles.traitHeading}><span className={styles.traitIcon}>{d.code}</span><div><h3>{d.name}</h3><small>{d.en_name}</small></div><span className={styles.band}>{dimensionBandLabel(d.band_code)}</span><strong>{d.score}<small>{l.standard}</small></strong></div>
          <div className={styles.scoreTrack} role="img" aria-label={`${d.name} ${d.score} ${l.standard}`}><span style={{width:`${scorePosition(d.score)*100}%`}}/><i style={{left:`${scorePosition(d.score)*100}%`}}/></div>
          <h4>{d.lead}</h4>{d.paragraphs.map(p=><p key={p}>{p}</p>)}
          <div className={styles.traitColumns}><div><h5><Check size={14}/>{l.strengths}</h5><ul>{d.strengths.map(s=><li key={s}><Check size={13}/>{s}</li>)}</ul></div><div><h5><ArrowUpRight size={14}/>{l.growth}</h5><ul>{d.growth.map(s=><li key={s}><ArrowUpRight size={13}/>{s}</li>)}</ul></div></div>
          <div className={styles.script}><MessageCircle size={15}/><div><span>{l.try}</span><p>{d.script}</p></div></div>
        </article>)}</Module>
        <Module index={1} copy={c}><p className={styles.intro}>{l.career_note}</p><div className={styles.careerOverview}><h3>{l.overview}</h3><p>{l.career_order}</p>{c.careers.slice(0,6).map((item,i)=><a href={`#career-${i}`} key={item.title}><div><span>{item.title}</span><span>{item.match_label}</span></div><span className={styles.matchTrack}><span style={{width:`${item.match_display}%`}}/></span></a>)}</div><div className={styles.careerList}>{c.careers.map((item,i)=><details id={`career-${i}`} className={styles.career} key={item.title}><summary><span className={styles.careerIndex}>{String(i+1).padStart(2,"0")}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><span className={styles.careerFocus}>{item.match_label}</span><ChevronDown size={15}/></summary><div className={styles.careerDetail}><p><strong>{l.check_example}</strong>{item.question}</p><p><strong>{l.small_experiment}</strong>{item.experiment}</p><span>{item.codes.map(code=>c.dimensions.find(d=>d.code===code)?.name).join(" × ")}</span></div></details>)}</div></Module>
        <Module index={2} copy={c}><MiniBars copy={c}/>{c.work.map((item,i)=><TextCard key={item.title} item={item} icon={i===2?<MessageCircle size={17}/>:<Orbit size={17}/>}/>)}</Module>
        <Module index={3} copy={c}><MiniBars copy={c}/><p className={styles.intro}>{c.stress.intro}</p><TextCard item={c.stress.pattern} icon={<Zap size={17}/>}/><div className={styles.textCard}><h3><Target size={17}/>{l.patterns}</h3><ul className={styles.patternList}>{c.stress.patterns.map((p,i)=><li key={p}><span style={{background:c.dimensions[i].color}}/>{p}</li>)}</ul></div><div className={styles.textCard}><h3><Waves size={17}/>{l.approaches}</h3><ul className={styles.checkList}>{c.stress.methods.map(p=><li key={p}><Check size={14}/>{p}</li>)}</ul></div></Module>
        <Module index={4} copy={c}><MiniBars copy={c}/><p className={styles.intro}>{c.money.intro}</p><div className={styles.threeColumns}>{c.money.cards.map(item=><TextCard item={item} key={item.title} icon={<Coins size={16}/>}/>)}</div><div className={styles.textCard}><h3><Lightbulb size={17}/>{l.suggestions}</h3><ol className={styles.numberList}>{c.money.tips.map((tip,i)=><li key={tip}><span>{i+1}</span>{tip}</li>)}</ol></div></Module>
        <Module index={5} copy={c}><MiniBars copy={c}/>{c.relationships.map(item=><TextCard item={item} key={item.title} icon={<Heart size={17}/>}/>)}</Module>
        <Module index={6} copy={c}><p className={styles.intro}>{l.figure_note}</p><div className={styles.peopleGrid}>{c.people.map((person,i)=>{
          const source=candidate.sources.find(s=>s.id===person.source)!;
          return <article className={styles.person} key={person.name} style={colorStyle(c.dimensions[i%4].color)}><div className={styles.personHeading}><span>{person.initials}</span><div><h3>{person.name}</h3><small>{person.role}</small></div><a href={source.url} target="_blank" rel="noreferrer" aria-label={`${person.name} · ${l.source}`}><ArrowUpRight size={17}/></a></div><p>{person.body}</p><div className={styles.takeaway}>{person.takeaway}</div></article>;
        })}</div></Module>
        <Module index={7} copy={c}><p className={styles.intro}>{c.plan_intro}</p><div className={styles.planProgress}><span>{l.progress}<b>{checked.length} / {c.plan.length}</b></span><div><span style={{width:`${checked.length/c.plan.length*100}%`}}/></div></div><ol className={styles.timeline}>{c.plan.map((step,i)=><li key={step.title} className={checked.includes(i)?styles.stepDone:undefined}><span className={styles.stepNumber}>{checked.includes(i)?<Check size={16}/>:i+1}</span><div className={styles.stepMeta}><span>{step.period}</span><span>{step.time}</span></div><h3>{step.title}</h3><p>{step.body}</p><p className={styles.stepWhy}>{step.why}</p><label className={styles.stepCheck}><input type="checkbox" checked={checked.includes(i)} onChange={e=>setChecked(e.target.checked?[...checked,i]:checked.filter(n=>n!==i))}/>{checked.includes(i)?l.completed:l.complete}</label></li>)}</ol><p className={styles.localNote}>{l.privacy}</p></Module>
        <Module index={8} copy={c}>{c.insights.map(item=><TextCard item={item} key={item.title} icon={<Lightbulb size={17}/>}/>)}</Module>

      </div>
      </>}
      <div className={styles.scienceEnd}>
        <Module index={9} copy={c}>{c.science.map((item,i)=><article className={styles.scienceCard} key={item.title}><span className={styles.scienceIcon}>{i+1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}<ol className={styles.sources}>{candidate.sources.map((source,i)=><li key={source.id}><span>{i+1}</span><div><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={13}/></a><p>{source.scope[locale]}</p></div></li>)}</ol></Module>
      </div>
    </main>

  </div>;
}
