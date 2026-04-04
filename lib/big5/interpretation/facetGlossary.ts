import { BIG5_FACETS, type Big5DomainCode } from "@/lib/big5/taxonomy";

type Big5FacetCode = (typeof BIG5_FACETS)[number]["facet_code"];

export type Big5FacetGlossaryEntry = {
  facet_code: Big5FacetCode;
  label: string;
  domain: Big5DomainCode;
  gloss: string;
  why_it_matters: string;
  high_cue: string;
  low_cue: string;
  daily_signal: string;
  hint: string;
};

const FACET_GLOSSARY_COPY: Record<
  Big5FacetCode,
  Omit<Big5FacetGlossaryEntry, "facet_code" | "label" | "domain">
> = {
  O1: {
    gloss: "Imagination reflects how readily you move toward inner pictures, mental simulation, and possible alternatives.",
    why_it_matters: "It shapes how often you generate options before reality forces one answer.",
    high_cue: "A higher position often looks like vivid scenario-building and stronger tolerance for abstraction.",
    low_cue: "A lower position often looks like preferring what is concrete, visible, and already testable.",
    daily_signal: "It often shows up in how quickly you sketch possibilities before acting.",
    hint: "Use it to notice whether you naturally expand a question or anchor it.",
  },
  O2: {
    gloss: "Artistic Interests reflects how much you are drawn to aesthetic variation, form, and expressive detail.",
    why_it_matters: "It affects what kinds of environments feel mentally alive or deadening.",
    high_cue: "A higher position often looks like stronger sensitivity to taste, tone, and design quality.",
    low_cue: "A lower position often looks like caring more about utility than aesthetic nuance.",
    daily_signal: "It shows up in how strongly design, atmosphere, and texture shape your attention.",
    hint: "This is less about talent and more about how much aesthetics matter to you.",
  },
  O3: {
    gloss: "Emotionality reflects how willing you are to notice, name, and stay with inner feeling states.",
    why_it_matters: "It shapes how much emotional information enters your decisions instead of staying in the background.",
    high_cue: "A higher position often looks like richer emotional language and stronger felt nuance.",
    low_cue: "A lower position often looks like keeping emotion quieter while leaning on simpler labels or logic.",
    daily_signal: "It often appears in how specifically you can describe what you are feeling in the moment.",
    hint: "This is about emotional access, not emotional intensity alone.",
  },
  O4: {
    gloss: "Adventurousness reflects how willing you are to test unfamiliar experiences, settings, and approaches.",
    why_it_matters: "It affects whether novelty feels energizing, optional, or unnecessary.",
    high_cue: "A higher position often looks like actively trying new environments or methods.",
    low_cue: "A lower position often looks like preferring known routes unless change is clearly worth it.",
    daily_signal: "It shows up in how quickly you say yes to an unfamiliar plan.",
    hint: "It is about behavioral novelty, not just having open-minded opinions.",
  },
  O5: {
    gloss: "Intellect reflects how much you enjoy working with concepts, patterns, and complex ideas.",
    why_it_matters: "It shapes whether complexity feels draining or intrinsically rewarding.",
    high_cue: "A higher position often looks like stronger appetite for analysis and abstract framing.",
    low_cue: "A lower position often looks like preferring direct usefulness over conceptual depth.",
    daily_signal: "It often shows up in whether difficult ideas feel stimulating or excessive.",
    hint: "This is about cognitive preference, not measured intelligence.",
  },
  O6: {
    gloss: "Liberalism reflects how willing you are to question convention, inherited rules, and default structures.",
    why_it_matters: "It shapes whether rules feel like guidance, friction, or something to revise.",
    high_cue: "A higher position often looks like more comfort challenging default assumptions.",
    low_cue: "A lower position often looks like greater trust in stable rules and established methods.",
    daily_signal: "It shows up when you decide whether to preserve or rethink the current way of doing things.",
    hint: "Read this as openness to revision, not politics.",
  },
  C1: {
    gloss: "Self-Efficacy reflects how strongly you expect yourself to handle tasks effectively once you engage.",
    why_it_matters: "It shapes whether demands feel manageable before progress becomes visible.",
    high_cue: "A higher position often looks like more confidence in getting a task under control.",
    low_cue: "A lower position often looks like more hesitation about whether you can carry a task well.",
    daily_signal: "It often shows up at the moment you decide whether to start or avoid a demanding task.",
    hint: "This is confidence in execution, not inflated self-belief.",
  },
  C2: {
    gloss: "Orderliness reflects how much you prefer structure, clean categories, and visible organization.",
    why_it_matters: "It affects whether order feels calming, unnecessary, or essential for clear thinking.",
    high_cue: "A higher position often looks like stronger preference for tidy systems and neat sequencing.",
    low_cue: "A lower position often looks like more tolerance for mess while work is still alive.",
    daily_signal: "It shows up in how quickly clutter starts to drain your focus.",
    hint: "This is about environmental and procedural order, not moral virtue.",
  },
  C3: {
    gloss: "Dutifulness reflects how strongly you feel responsible for promises, obligations, and doing what is expected.",
    why_it_matters: "It shapes how much weight commitments carry once other people are relying on you.",
    high_cue: "A higher position often looks like taking commitments seriously even when inconvenient.",
    low_cue: "A lower position often looks like treating obligations more flexibly when priorities shift.",
    daily_signal: "It often appears in how hard it is for you to break or renegotiate a promise.",
    hint: "It is about obligation pressure, not simple politeness.",
  },
  C4: {
    gloss: "Achievement-Striving reflects how much you orient toward goals, standards, and visible progress.",
    why_it_matters: "It influences whether achievement feels central to momentum and self-direction.",
    high_cue: "A higher position often looks like stronger push toward targets and measurable progress.",
    low_cue: "A lower position often looks like less identity investment in constant achievement.",
    daily_signal: "It shows up in how quickly a target becomes a personal benchmark.",
    hint: "Read it as drive intensity, not worth.",
  },
  C5: {
    gloss: "Self-Discipline reflects how steadily you can keep acting after the initial motivation spike fades.",
    why_it_matters: "It is one of the clearest links between intention and consistent execution.",
    high_cue: "A higher position often looks like easier follow-through through boredom, delay, or friction.",
    low_cue: "A lower position often looks like stronger dependence on mood, urgency, or external pressure.",
    daily_signal: "It shows up in what happens after the plan is made and the work becomes repetitive.",
    hint: "This is persistence under friction, not just enthusiasm.",
  },
  C6: {
    gloss: "Cautiousness reflects how much you pause to think through risks before acting.",
    why_it_matters: "It shapes whether speed or deliberation drives your first move.",
    high_cue: "A higher position often looks like checking consequences before committing.",
    low_cue: "A lower position often looks like deciding faster and editing later.",
    daily_signal: "It often appears in how long you sit with a decision before making it real.",
    hint: "This is about decision pacing, not fearfulness alone.",
  },
  E1: {
    gloss: "Friendliness reflects how readily you project warmth, welcome, and social ease.",
    why_it_matters: "It influences whether other people experience you as immediately open or more reserved at first contact.",
    high_cue: "A higher position often looks like quick warmth and lower interpersonal distance.",
    low_cue: "A lower position often looks like slower social opening and stronger initial reserve.",
    daily_signal: "It shows up in how approachable you seem before a relationship is established.",
    hint: "It is about social warmth, not whether you care.",
  },
  E2: {
    gloss: "Gregariousness reflects how much you seek company, group presence, and being around other people.",
    why_it_matters: "It affects whether people-rich environments restore energy or spend it.",
    high_cue: "A higher position often looks like stronger pull toward shared spaces and group activity.",
    low_cue: "A lower position often looks like preferring selective contact and more social space.",
    daily_signal: "It often shows up in whether a free evening makes you seek company or protect solitude.",
    hint: "This is about social appetite, not social skill alone.",
  },
  E3: {
    gloss: "Assertiveness reflects how readily you claim space, steer conversation, and influence direction.",
    why_it_matters: "It shapes whether your position becomes visible early or stays implicit unless asked for.",
    high_cue: "A higher position often looks like speaking up early and taking the lead without much prompting.",
    low_cue: "A lower position often looks like waiting longer before claiming space or directing the room.",
    daily_signal: "It shows up in who naturally sets the tone when no one has assigned a leader.",
    hint: "This is about visible social force, not competence.",
  },
  E4: {
    gloss: "Activity Level reflects how naturally you move at a faster internal and external pace.",
    why_it_matters: "It affects whether momentum feels natural or whether slower pacing feels more sustainable.",
    high_cue: "A higher position often looks like faster tempo, quicker transitions, and stronger dislike of stagnation.",
    low_cue: "A lower position often looks like steadier pacing and less pressure to stay in constant motion.",
    daily_signal: "It often appears in how uncomfortable stillness feels when nothing urgent is happening.",
    hint: "This is pacing preference, not productivity alone.",
  },
  E5: {
    gloss: "Excitement-Seeking reflects how much stimulation, intensity, and novelty feel energizing rather than costly.",
    why_it_matters: "It shapes your tolerance for high-arousal environments and fast-changing contexts.",
    high_cue: "A higher position often looks like stronger pull toward energetic, vivid, or intense settings.",
    low_cue: "A lower position often looks like preferring calmer, more predictable levels of stimulation.",
    daily_signal: "It shows up in whether fast, loud, or high-stakes environments feel enlivening or draining.",
    hint: "It is about stimulation appetite, not recklessness.",
  },
  E6: {
    gloss: "Cheerfulness reflects how easily positive affect and visible upbeat energy rise to the surface.",
    why_it_matters: "It influences whether your default tone reads lighter and more visibly positive.",
    high_cue: "A higher position often looks like easier positive expression and lighter outward tone.",
    low_cue: "A lower position often looks like a more serious or neutral baseline even when things are fine.",
    daily_signal: "It often appears in how quickly enthusiasm becomes visible on your face and in your voice.",
    hint: "This is about positive expressiveness, not whether you are happy all the time.",
  },
  A1: {
    gloss: "Trust reflects how readily you assume other people are acting in workable good faith.",
    why_it_matters: "It shapes whether you begin from openness, caution, or active suspicion.",
    high_cue: "A higher position often looks like easier willingness to give others the benefit of the doubt.",
    low_cue: "A lower position often looks like more default skepticism and stronger motive-checking.",
    daily_signal: "It shows up in how much evidence you need before relaxing around someone’s intent.",
    hint: "This is about baseline assumption, not gullibility.",
  },
  A2: {
    gloss: "Morality reflects how strongly you value directness, sincerity, and saying what you actually mean.",
    why_it_matters: "It affects how comfortable you are with strategic ambiguity or image management.",
    high_cue: "A higher position often looks like preferring straight dealing and cleaner motives.",
    low_cue: "A lower position often looks like more comfort with tact, strategic framing, or selective disclosure.",
    daily_signal: "It often appears in how much spin or social maneuvering you can tolerate.",
    hint: "Read this as preference for candor, not moral superiority.",
  },
  A3: {
    gloss: "Altruism reflects how ready you are to notice needs and move toward helping without being forced.",
    why_it_matters: "It shapes how naturally care turns into action when other people are under strain.",
    high_cue: "A higher position often looks like more spontaneous helping and care-taking behavior.",
    low_cue: "A lower position often looks like helping more selectively or with clearer limits.",
    daily_signal: "It shows up in whether you instinctively step in or first ask whether it is your role.",
    hint: "This is about helping readiness, not saintliness.",
  },
  A4: {
    gloss: "Cooperation reflects how willing you are to avoid unnecessary conflict and look for workable middle ground.",
    why_it_matters: "It influences whether friction feels like a problem to soften or a signal to confront directly.",
    high_cue: "A higher position often looks like stronger preference for accommodation and smoother coordination.",
    low_cue: "A lower position often looks like more willingness to contest, push back, and hold a hard line.",
    daily_signal: "It often appears in whether you move first toward compromise or argument.",
    hint: "It is about conflict style, not weakness.",
  },
  A5: {
    gloss: "Modesty reflects how comfortable you are staying low-profile instead of foregrounding yourself.",
    why_it_matters: "It shapes how naturally you occupy the spotlight or step aside from it.",
    high_cue: "A higher position often looks like less desire to self-promote or center yourself.",
    low_cue: "A lower position often looks like more comfort naming your value and taking visible credit.",
    daily_signal: "It shows up in whether praise feels easy to claim or easier to deflect.",
    hint: "This is about self-positioning style, not actual self-worth.",
  },
  A6: {
    gloss: "Sympathy reflects how strongly you register other people’s emotional pain and feel moved by it.",
    why_it_matters: "It affects whether suffering lands mainly as data, pressure, or a felt call to respond.",
    high_cue: "A higher position often looks like more emotional resonance with other people’s distress.",
    low_cue: "A lower position often looks like more distance and steadier boundaries around others’ feelings.",
    daily_signal: "It often appears in how quickly someone else’s distress changes your own internal state.",
    hint: "This is about emotional resonance, not whether you are kind.",
  },
  N1: {
    gloss: "Anxiety reflects how readily threat, uncertainty, and possible downside activate your system.",
    why_it_matters: "It shapes how much mental bandwidth uncertainty claims before anything has gone wrong.",
    high_cue: "A higher position often looks like earlier vigilance and more active anticipation of risk.",
    low_cue: "A lower position often looks like steadier calm while uncertainty is still unresolved.",
    daily_signal: "It shows up in how quickly your mind starts rehearsing what could go wrong.",
    hint: "This is about anticipatory activation, not weakness.",
  },
  N2: {
    gloss: "Anger reflects how readily frustration turns into irritation, sharpness, or felt internal heat.",
    why_it_matters: "It affects how quickly blocked goals become emotionally costly.",
    high_cue: "A higher position often looks like faster frustration and sharper reactivity under obstruction.",
    low_cue: "A lower position often looks like slower irritation and more time before annoyance crosses a threshold.",
    daily_signal: "It often appears in how your tone changes when plans get blocked or people are careless.",
    hint: "This is about frustration sensitivity, not being an angry person.",
  },
  N3: {
    gloss: "Depression reflects how readily discouragement, heaviness, and low affect settle in after difficulty.",
    why_it_matters: "It shapes how much setbacks lower momentum once the emotional drop begins.",
    high_cue: "A higher position often looks like setbacks landing with more weight and longer emotional drag.",
    low_cue: "A lower position often looks like bouncing back more quickly after disappointment.",
    daily_signal: "It shows up in how long a frustrating day keeps coloring the next one.",
    hint: "Read it as sensitivity to discouragement, not a diagnosis.",
  },
  N4: {
    gloss: "Self-Consciousness reflects how strongly you monitor how you are coming across to other people.",
    why_it_matters: "It affects how much social exposure costs while you are being seen or evaluated.",
    high_cue: "A higher position often looks like more self-monitoring and stronger awareness of social exposure.",
    low_cue: "A lower position often looks like less internal friction about being observed or judged.",
    daily_signal: "It often appears in how much energy social evaluation consumes while it is happening.",
    hint: "This is about social self-monitoring, not humility.",
  },
  N5: {
    gloss: "Immoderation reflects how hard it is to resist urges once something immediately rewarding is within reach.",
    why_it_matters: "It shapes whether impulse intensity tends to outrun long-term plans in the moment.",
    high_cue: "A higher position often looks like stronger pull toward immediate relief, reward, or release.",
    low_cue: "A lower position often looks like easier restraint when a short-term urge conflicts with a longer plan.",
    daily_signal: "It shows up in whether the immediate option keeps winning against the intended one.",
    hint: "This is about impulse control under temptation, not character.",
  },
  N6: {
    gloss: "Vulnerability reflects how quickly pressure overwhelms your sense of control when the load gets high.",
    why_it_matters: "It shapes whether stress feels containable or like it is spilling over faster than you can manage.",
    high_cue: "A higher position often looks like feeling overloaded sooner when pressure stacks up.",
    low_cue: "A lower position often looks like stronger composure even when the load is objectively heavy.",
    daily_signal: "It often appears in the moment normal pressure turns into felt overload.",
    hint: "This is about stress capacity under strain, not resilience in the abstract.",
  },
};

const BIG5_FACET_GLOSSARY_MAP: Record<Big5FacetCode, Big5FacetGlossaryEntry> = BIG5_FACETS.reduce<
  Record<Big5FacetCode, Big5FacetGlossaryEntry>
>((acc, facet) => {
  acc[facet.facet_code] = {
      facet_code: facet.facet_code,
      label: facet.display_label.en,
      domain: facet.domain,
      ...FACET_GLOSSARY_COPY[facet.facet_code],
  };
  return acc;
}, {} as Record<Big5FacetCode, Big5FacetGlossaryEntry>);

export const BIG5_FACET_GLOSSARY: Big5FacetGlossaryEntry[] = BIG5_FACETS.map(
  (facet) => BIG5_FACET_GLOSSARY_MAP[facet.facet_code]
);

export function resolveFacetGlossary(facetCode: string | null | undefined): Big5FacetGlossaryEntry | null {
  const normalized = String(facetCode ?? "").trim().toUpperCase() as Big5FacetCode;
  return BIG5_FACET_GLOSSARY_MAP[normalized] ?? null;
}
