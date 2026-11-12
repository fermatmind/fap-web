"use client";
import { friendshipQuestionText, friendshipCopy, friendshipSourceLocale, type FriendshipDisplayLocale } from "@/lib/friendship/traditional";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { friendshipApi, prepareFriendshipGrant } from "@/lib/friendship/api";
import { friendshipEvent } from "@/lib/friendship/analytics";
import { average, streak, CATEGORIES, forget, LENGTHS, PUBLIC_PATH, readSaved, save, selectQuestions, swapQuestion, validAnswers, type Challenge, type Choice, type Pack, type Question, type Progress, type Result } from "@/lib/friendship/core";
import { ResultView, Ranking, QuestionAccuracy } from "./ResultView";
import { ShareTools } from "./ShareTools";
import { ResultPage } from "@/components/questionnaires/QuestionnaireResultPresentation";
type Stage = "setup" | "creator" | "review" | "friend-name" | "friend" | "manage" | "result" | "solo" | "solo-result";
type Owner = { id: string; key?: string; nickname: string };
type Draft = { id: string; key?: string; version: string; ids: string[]; answers: (Choice | null)[]; seen: string[]; nickname: string; index: number; contribute: boolean; mode: "creator" | "solo" };
const DRAFT_KEY = "fm:friendship:draft:v1";
const OWNERS_KEY = "fm:friendship:owners:v1";
const playerStorage = (id: string) => `fm:friendship:player:${id}`;
export default function FriendshipClient({ locale, inviteId, management = false }: { locale: FriendshipDisplayLocale; inviteId?: string; management?: boolean }) {
  const copy = friendshipCopy(locale);

  const zh = locale !== "en";
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup"); const [pack, setPack] = useState<Pack | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]); const [answers, setAnswers] = useState<(Choice | null)[]>([]);
  const [revealed, setRevealed] = useState<Choice[]>([]);
  const [index, setIndex] = useState(0); const [nickname, setNickname] = useState(""); const [length, setLength] = useState(30);
  const [challenge, setChallenge] = useState<Challenge | null>(null); const [result, setResult] = useState<Result | null>(null);
  const [id, setId] = useState(""); const [seen, setSeen] = useState<string[]>([]);
  const [busy, setBusy] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [missingKey, setMissingKey] = useState(false);
  const [persistent, setPersistent] = useState(true); const [owners, setOwners] = useState<Owner[]>([]); const [draft, setDraft] = useState<Draft | null>(null);
  const [contribute, setContribute] = useState(false); const [deleteReady, setDeleteReady] = useState(false); const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState<Record<string, [number, number]>>({}); const [statsState, setStatsState] = useState<"loading" | "ready" | "failed">("loading");
  const focus = useRef<HTMLHeadingElement>(null);
  const pendingOwnerKey = useRef<string | null>(null);
  const lastViewedSurface = useRef("");
  useEffect(() => {
    const role = stage === "manage" ? "creator" : stage === "solo-result" ? "solo" : stage === "result" && result && !result.preview ? "friend" : null;
    const surface = role ? `${role}:${challenge?.id ?? "solo"}` : "";
    if (role && surface !== lastViewedSurface.current) friendshipEvent("view_result", friendshipSourceLocale(locale), role);
    lastViewedSurface.current = surface;
  }, [stage, result, challenge?.id, locale]);

  const url = typeof window === "undefined" || !challenge ? "" : `${window.location.origin}/${locale}/share/friendship/${challenge.id}`;
  const validName = nickname.trim().length > 0 && nickname.trim().length <= 32 && !/[<>\p{C}]/u.test(nickname);
  const errText = (value: unknown) => { const code = value instanceof Error ? value.message : "network"; return (code === "key_required" ? { zh: copy("缺少有效的管理凭证。请从保存的管理文件打开完整私人管理链接；没有账号，无法凭昵称找回密钥。"), en: "Management access is missing. Open the complete private management link from your saved file. A nickname cannot recover a lost key." } : code === "closed" ? { zh: copy("挑战已关闭或已到期。可以创建自己的挑战。"), en: "This quiz is closed or expired. You can make your own." } : code === "missing" ? { zh: copy("找不到挑战或管理凭证无效。请检查保存的链接。"), en: "Quiz not found, or the management key is missing. Check your saved link." } : code === "conflict" ? { zh: copy("这份挑战已提交过、记录已满或题库版本已变化。重试会保留原记录；需要新一轮时请另建。"), en: "This quiz was already submitted, is full, or the question version changed. Retrying keeps the original record. Make a new round if needed." } : code === "invalid" ? { zh: copy("请检查昵称和完整答案，再试一次。"), en: "Check your nickname and complete answers, then try again." } : code === "limit" ? { zh: copy("操作太频繁，请稍等一分钟再试。"), en: "Too many requests. Wait a minute and try again." } : { zh: copy("网络暂时不可用。答案仍留在此页，请重试。"), en: "The connection failed. Your answers are still here. Please retry." })[friendshipSourceLocale(locale)]; };
  useEffect(() => {
    let live = true;
    async function init() {
      setBusy(true); setError(""); setMissingKey(false);
      const probe = save("fm:friendship:storage-check", true); forget("fm:friendship:storage-check"); setPersistent(probe);
      const savedOwners = readSaved<Owner[]>(OWNERS_KEY); const safeOwners = Array.isArray(savedOwners) ? savedOwners.filter(o => typeof o?.id === "string" && (o.key === undefined || /^[a-f0-9]{64}$/.test(o.key))).slice(0, 20) : [];
      setOwners(safeOwners);
      const fragment = new URLSearchParams(window.location.hash.slice(1)).get("key");
      if (management && /^[a-f0-9]{64}$/.test(fragment ?? "")) pendingOwnerKey.current = fragment;
      try {
        const catalog = await friendshipApi<Pack>("/catalog"); if (!live) return; setPack(catalog);
        if (inviteId) {
          const ownerKey = management && pendingOwnerKey.current ? pendingOwnerKey.current : safeOwners.find(o => o.id === inviteId)?.key;
          if (management || safeOwners.some(o => o.id === inviteId)) {
            if (ownerKey) await prepareFriendshipGrant(inviteId, "owner", { legacy: ownerKey });
            const c = await friendshipApi<Challenge>(`/challenges/${inviteId}/manage`, "GET", undefined);
            if (!live) return;
            setChallenge(c); setId(c.id); setStage("manage");
            const list = [{ id: c.id, nickname: c.nickname }, ...safeOwners.filter(o => o.id !== c.id)].slice(0, 20); setOwners(list); const stored = save(OWNERS_KEY, list); if (!stored) setPersistent(false);
            pendingOwnerKey.current = null;
            if (ownerKey) window.history.replaceState(null, "", window.location.pathname + window.location.search);
            friendshipEvent("revisit_result", friendshipSourceLocale(locale), "creator");
          } else {
            const c = await friendshipApi<Challenge>(`/challenges/${inviteId}`); if (!live) return; setChallenge(c); setQuestions(c.questions); setId(c.id);
            const saved = readSaved<{ key?: string; answers: (Choice | null)[]; index: number; nickname: string }>(playerStorage(inviteId));
            if (saved) {
              await prepareFriendshipGrant(inviteId, "player", saved.key ? { legacy: saved.key } : {});
              if (saved.key && !save(playerStorage(inviteId), { answers: saved.answers, index: saved.index, nickname: saved.nickname })) setPersistent(false);
            }
            const isNoPlayerRecord = (error: unknown) => error instanceof Error && ["missing", "key_required"].includes(error.message);
            try {
              const result = await friendshipApi<Result>(`/challenges/${inviteId}/result`);
              if (!live) return;
              setResult(result); setStage("result"); return;
            } catch (e) { if (!isNoPlayerRecord(e)) throw e; }
            let progress: Progress | null = null;
            try { progress = await friendshipApi<Progress>(`/challenges/${inviteId}/progress`); }
            catch (e) { if (!isNoPlayerRecord(e)) throw e; }
            if (!live) return;
            setRevealed(progress?.answers ?? []);
            if (progress) {
              setAnswers(c.questions.map((_, i) => progress.guesses[i] ?? null)); setNickname(progress.nickname); setIndex(Math.min(progress.guesses.length, c.questions.length - 1)); setStage("friend");
            } else if (saved && validAnswers(saved.answers, c.questions.length)) {
              setAnswers(saved.answers); setNickname(typeof saved.nickname === "string" ? saved.nickname.slice(0, 32) : ""); setIndex(0); setStage("friend");
              setNotice(zh ? copy("已恢复旧版草稿。请从第一题逐个确认原有选择，揭晓后不能改答。") : "Your earlier draft is restored. Confirm its choices from question one; revealed guesses are locked.");
            } else { setAnswers(c.questions.map(() => null)); setStage("friend-name"); }
          }
        } else {
          const saved = readSaved<Draft>(DRAFT_KEY);
          if (saved && saved.version === catalog.version && Array.isArray(saved.ids) && validAnswers(saved.answers, saved.ids.length) && (LENGTHS as readonly number[]).includes(saved.ids.length) && saved.ids.every(qid => catalog.questions.some(q => q.id === qid)) && (saved.key === undefined || /^[a-f0-9]{64}$/.test(saved.key))) setDraft(saved);
          setStage("setup");
        }
      } catch (e) { if (live) { setError(errText(e)); setMissingKey((e as Error).message === "key_required"); } } finally { if (live) setBusy(false); }
    }
    void init(); return () => { live = false; };
    // Locale and link identity define a new flow; retries explicitly re-read authority.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteId, management, locale, refresh]);
  useEffect(() => { focus.current?.focus(); }, [stage, index]);
  useEffect(() => {
    if (!pack || !id || busy) return;
    if (["creator", "review", "solo"].includes(stage) && !challenge) {
      const data: Draft = { id, version: pack.version, ids: questions.map(q => q.id), answers, seen, nickname, index, contribute, mode: stage === "solo" ? "solo" : "creator" };
      if (!save(DRAFT_KEY, data)) setPersistent(false);
    }
    if (stage === "friend" && inviteId) { if (!save(playerStorage(inviteId), { answers, index, nickname })) setPersistent(false); }
  }, [answers, questions, index, stage, pack, id, seen, nickname, contribute, busy, inviteId, challenge]);
  useEffect(() => { if (!pack || !["setup", "solo-result"].includes(stage)) return; let live = true; setStatsState("loading"); friendshipApi<{ questions: Record<string, [number, number]> }>("/stats").then(r => { if (live) { setStats(r.questions ?? {}); setStatsState("ready"); } }).catch(() => { if (live) setStatsState("failed"); }); return () => { live = false; }; }, [pack, stage]);
  function begin(mode: "creator" | "solo" = "creator", exclude: string[] = []) {

    if (!pack || (mode === "creator" && !validName)) return;
    const first = new URLSearchParams(window.location.search).get("category") ?? undefined;
    const qs = selectQuestions(pack, length, exclude, first); setQuestions(qs); setAnswers(qs.map(() => null)); setSeen(qs.map(q => q.id)); setIndex(0); setRevealed([]); setId(crypto.randomUUID()); setResult(null); setError(""); setStage(mode); setDraft(null); friendshipEvent("start_test", friendshipSourceLocale(locale), mode === "solo" ? "solo" : "creator");
  }
  async function resume() {
    if (!pack || !draft || busy) return;
    setBusy(true);
    try {
      if (draft.mode === "creator" && draft.key) await prepareFriendshipGrant(draft.id, "owner", { legacy: draft.key, draft: true });
      setQuestions(draft.ids.map(qid => pack.questions.find(q => q.id === qid)!)); setAnswers(draft.answers); setSeen(Array.isArray(draft.seen) ? draft.seen : draft.ids); setNickname(draft.nickname); setIndex(Math.min(Math.max(0, draft.index), draft.ids.length - 1)); setId(draft.id); setContribute(draft.contribute); setStage(draft.mode === "solo" ? "solo" : "creator");
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  function choose(value: Choice) { setAnswers(current => current.map((a, i) => i === index ? value : a)); setError(""); }
  async function checkGuess(guess: Choice | null = answers[index]) {
    if (!challenge || guess === null || busy || revealed[index] !== undefined) return;
    setBusy(true); setError("");
    try {
      if (challenge.answers) setRevealed(challenge.answers.slice(0, index + 1));
      else {
        await prepareFriendshipGrant(challenge.id, "player");
        const progress = await friendshipApi<Progress>(`/challenges/${challenge.id}/answers`, "POST", { nickname: nickname.trim(), index, guess });
        setRevealed(progress.answers); setAnswers(current => current.map((value, i) => progress.guesses[i] ?? value));
      }
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  function next() {
    if (answers[index] === null || busy) return;
    if (stage === "friend" && revealed[index] === undefined) { void checkGuess(); return; }
    if (index < questions.length - 1) { setIndex(index + 1); setNotice(""); }
    else if (stage === "solo") { setStage("solo-result"); forget(DRAFT_KEY); friendshipEvent("complete_test", friendshipSourceLocale(locale), "solo"); }
    else if (stage === "friend") void submit();
    else setStage("review");
  }
  function swap() { if (!pack) return; const q = swapQuestion(pack, questions, index, seen); if (!q) { setNotice(zh ? copy("本类替换题已用完，可以保留此题或返回改答。") : "No unused replacements left in this category. Keep this question or edit an earlier answer."); return; } setQuestions(current => current.map((old, i) => i === index ? q : old)); setAnswers(current => current.map((a, i) => i === index ? null : a)); setSeen(current => [...current, q.id]); setNotice(""); }
  async function submit() {
    if (!pack || answers.some(a => a === null) || !validName) return;
    setBusy(true); setError("");
    try {
      if (challenge) {
        if (!challenge.answers) await prepareFriendshipGrant(challenge.id, "player");
        const r = await friendshipApi<Result>(`/challenges/${challenge.id}/entries`, "POST", { nickname: nickname.trim(), guesses: answers }, Boolean(challenge.answers)); setResult(r); setStage("result"); if (!r.preview) { friendshipEvent("complete_test", friendshipSourceLocale(locale), "friend"); }
      } else {
        await prepareFriendshipGrant(id, "owner", { draft: true });
        const c = await friendshipApi<Challenge>("/challenges", "POST", { id, nickname: nickname.trim(), locale: friendshipSourceLocale(locale), version: pack.version, question_ids: questions.map(q => q.id), answers, contribute });
        const list = [{ id: c.id, nickname: c.nickname }, ...owners.filter(o => o.id !== c.id)].slice(0, 20); setOwners(list); if (!save(OWNERS_KEY, list)) setPersistent(false); setChallenge(c); setStage("manage"); forget(DRAFT_KEY); setDraft(null); friendshipEvent("complete_test", friendshipSourceLocale(locale), "creator");
      }
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  async function mutate(data: unknown) { if (!challenge) return; setBusy(true); setError(""); try { setChallenge(await friendshipApi<Challenge>(`/challenges/${challenge.id}/manage`, "PATCH", data)); } catch (e) { setError(errText(e)); } finally { setBusy(false); } }
  async function destroy() { if (!challenge) return; if (!deleteReady) { setDeleteReady(true); return; } setBusy(true); try { await friendshipApi(`/challenges/${challenge.id}/manage`, "DELETE"); const list = owners.filter(o => o.id !== challenge.id); save(OWNERS_KEY, list); router.push(`/${locale}${PUBLIC_PATH}`); setChallenge(null); setOwners(list); setStage("setup"); setBusy(false); } catch (e) { setError(errText(e)); setBusy(false); } }
  const soloCategories = stage === "solo-result" ? Object.entries(CATEGORIES).map(([id, label]) => ({
    id, label: copy(label[friendshipSourceLocale(locale)]), items: questions.flatMap((q, i) => q.category === id ? [{ q, i }] : []),
  })) : [];
  const warning = !persistent && <p role="status" className="fq-warning">{zh ? copy("浏览器不允许保存。此页可继续，但刷新或关闭可能丢失进度。创建后立即保存私人管理文件；好友结果仅能在此页保留。") : "Browser storage is unavailable. You can continue, but refreshing or closing may lose progress. Save your private management file after creating. A friend's result may remain on this page only."}</p>;
  return <div className="fq-page fq-app" data-stage={stage === "creator" || stage === "solo" ? "answer" : undefined} aria-busy={busy}>{warning}{error && <div role="alert" className="fq-warning"><p>{error}</p>{!pack && !inviteId && <button onClick={() => setRefresh(r => r + 1)}>{zh ? copy("重新连接") : "Reconnect"}</button>}{inviteId && <>{!missingKey && <button onClick={() => setRefresh(r => r + 1)}>{zh ? copy("重试") : "Retry"}</button>}<Link href={`/${locale}${PUBLIC_PATH}`}>{zh ? copy("创建我的挑战") : "Make my quiz"}</Link></>}</div>}{busy && <p role="status">{zh ? copy("正在连接并确认…") : "Connecting and checking…"}</p>}
    {pack && !inviteId && stage === "setup" && <section><h2 ref={focus} tabIndex={-1}>{zh ? copy("先出一份关于你的题") : "Make a quiz about you"}</h2><p>{zh ? copy("六类二选一，朋友来猜你的选择。免费，无需注册。") : "Two choices, six sides of you. Your friends guess what you picked. Free, no sign-up."}</p>{draft && <div className="fq-saved"><p>{zh ? copy("发现这台浏览器保存的未完成进度。") : "There's an unfinished quiz saved in this browser."}</p><button onClick={resume}>{zh ? copy("恢复进度") : "Resume"}</button><button onClick={() => { forget(DRAFT_KEY); setDraft(null); }}>{zh ? copy("丢弃草稿") : "Discard draft"}</button></div>}<form onSubmit={e => { e.preventDefault(); begin(); }}><label htmlFor="fq-name">{zh ? copy("你的昵称（别用真实姓名）") : "Your nickname (a made-up name is fine)"}</label><input id="fq-name" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={32} autoComplete="off" required /><fieldset><legend>{zh ? copy("选择题数") : "Choose your length"}</legend><div className="fq-lengths">{LENGTHS.map(n => <label key={n}><input type="radio" name="length" value={n} checked={length === n} onChange={() => setLength(n)} />{n}</label>)}</div></fieldset><p className="fq-muted">{zh ? copy("30题适合先玩一轮；150题会更久。每类题数相同，都可以同类换题。") : "Start with 30 for a quick round; 150 takes longer. Every category gets an equal share, with swaps from the same category."}</p><button className="fq-primary" disabled={busy || !validName}>{zh ? copy("开始出题") : "Start my quiz"} →</button></form><p className="fq-muted">{zh ? copy("昵称和成绩会向持有邀请链接的人展示。不要输入隐私信息。创建后90天到期；可提前关闭或删除。") : "Your nickname and scores are visible to anyone with the invite link. Don't include private information. Quizzes expire after 90 days; you can close or delete yours sooner."}</p>{owners.length > 0 && <section className="fq-section"><h3>{zh ? copy("我的挑战 · 仅此浏览器") : "Your quizzes · this browser"}</h3><ul>{owners.map(o => <li key={o.id}><Link href={`/${locale}/share/friendship/${o.id}/manage`}>{o.nickname} → {zh ? copy("查看与管理") : "View & manage"}</Link></li>)}</ul></section>}<section className="fq-section"><h3>{zh ? copy("先自己玩一轮") : "Try a solo round"}</h3><p>{zh ? copy("选自己的偏好，只有真实且自愿汇总的样本足够时才显示对照。它不是好友猜中率。") : "Pick your own preferences. You'll see a comparison only where enough creators opted into aggregate counts. This is not a friend's accuracy score."}</p><button onClick={() => begin("solo")}>{zh ? copy("单人体验") : "Play solo"}</button></section><section className="fq-section"><h3>{zh ? copy("大家怎么选") : "Everyone's choices"}</h3><p>{zh ? copy("只汇总最新200份未关闭、未到期且主动同意的创建记录。每题至少20份才展示，计数是答案，不是独立人数或人口常模。") : "Counts use up to 200 recent, active quizzes whose creators opted in. A question needs at least 20 answers to appear. These are answers, not unique people or population norms."}</p>{statsState === "loading" ? <p>{zh ? copy("正在读取真实统计…") : "Loading real counts…"}</p> : statsState === "failed" ? <p>{zh ? copy("统计暂不可用，请稍后再试。") : "Counts are unavailable right now. Try again later."}</p> : Object.keys(stats).length === 0 ? <p>{zh ? copy("目前没有达到展示条件的题目。") : "No questions have enough eligible answers yet."}</p> : <ul>{pack.questions.filter(q => stats[q.id]).map(q => <li key={q.id}>{friendshipQuestionText(q, locale).options.map((option, i) => `${option}: ${stats[q.id][i]}`).join(" / ")}</li>)}</ul>}</section></section>}
    {stage === "friend-name" && challenge && <section><p className="fq-eyebrow">{zh ? copy("好友邀请") : "You're invited"}</p><h2 ref={focus} tabIndex={-1}>{zh ? copy`你有多了解 ${challenge.nickname}？` : `How well do you know ${challenge.nickname}?`}</h2><p>{zh ? copy`${challenge.questions.length}道二选一。选好立即揭晓正误，连续猜中会累计连击；揭晓后不能改答。` : `${challenge.questions.length} two-choice questions. Pick once, see the answer straight away, and build a correct-answer streak. Revealed guesses cannot be changed.`}</p><label htmlFor="fq-friend-name">{zh ? copy("你的化名") : "Your nickname"}</label><input id="fq-friend-name" autoComplete="off" maxLength={32} value={nickname} onChange={e => setNickname(e.target.value)} /><p>{zh ? copy("你的化名和分数会显示在邀请榜单。每浏览器保留首次完成记录；换设备仍可能重复，请把它当朋友间的小游戏。") : "Your nickname and score appear on the invite's friendboard. We keep the first completed entry per browser; another device may still create another entry. Keep it lighthearted."}</p><button className="fq-primary" disabled={!validName || busy} onClick={() => { setStage("friend"); friendshipEvent("start_test", friendshipSourceLocale(locale), "friend"); }}>{zh ? copy("开始猜") : "Start guessing"}</button></section>}
    {["creator", "friend", "solo"].includes(stage) && questions[index] && <section><p className="fq-eyebrow">{copy(CATEGORIES[questions[index].category][friendshipSourceLocale(locale)])} · {index + 1}/{questions.length}</p><progress max={questions.length} value={answers.filter(a => a !== null).length} aria-label={zh ? copy("作答进度") : "Answer progress"} /><h2 ref={focus} tabIndex={-1}>{stage === "friend" && challenge ? (zh ? copy`${challenge.nickname} 更会选哪一个？` : `Which would ${challenge.nickname} choose?`) : friendshipQuestionText(questions[index], locale).prompt}</h2><fieldset className="fq-options"><legend className="sr-only">{zh ? copy("选择一项") : "Choose one"}</legend>{friendshipQuestionText(questions[index], locale).options.map((option, i) => <label key={`${questions[index].id}-${i}`} className={`${answers[index] === i ? "fq-selected" : ""} ${stage === "friend" && revealed[index] !== undefined ? (revealed[index] === i ? "fq-match" : answers[index] === i ? "fq-miss" : "") : ""}`}><input type="radio" name={`answer-${index}`} checked={answers[index] === i} disabled={busy || (stage === "friend" && revealed[index] !== undefined)} onChange={() => { choose(i as Choice); if (stage === "friend") void checkGuess(i as Choice); }} /><span>{option}</span></label>)}</fieldset><div className="fq-actions"><button disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}>{zh ? copy("上一题") : "Back"}</button>{stage !== "friend" && <button disabled={busy} onClick={swap}>{zh ? copy("同类换题") : "Swap question"}</button>}<button data-questionnaire-next={stage !== "friend" ? true : undefined} className="fq-primary" disabled={answers[index] === null || busy} onClick={next}>{stage === "friend" && revealed[index] === undefined ? (zh ? copy("确认猜测") : "Check guess") : index === questions.length - 1 ? (stage === "friend" ? (zh ? copy("查看结果") : "See my result") : (zh ? copy("检查答案") : "Review answers")) : (zh ? copy("下一题") : "Next")}</button></div><div role="status" aria-live="polite">{stage === "friend" && revealed[index] !== undefined && <p className={`fq-feedback ${answers[index] === revealed[index] ? "fq-match" : "fq-miss"}`}><b>{answers[index] === revealed[index] ? (zh ? "猜中了！" : "You got it!") : (zh ? copy("发现一个新答案！") : "A new discovery!")}</b> {zh ? copy("出题者选的是：") : "Their choice: "}{friendshipQuestionText(questions[index], locale).options[revealed[index]]}{streak(answers.slice(0, index + 1), revealed.slice(0, index + 1)).combo > 1 && <strong> · {streak(answers.slice(0, index + 1), revealed.slice(0, index + 1)).combo} {zh ? copy("连击") : "in a row"}</strong>}</p>}{notice}</div><p className="fq-muted">{stage === "friend" ? (zh ? copy("揭晓后选择会锁定。可以返回查看，重试不会改分或多记一条榜单。") : "Revealed guesses are locked. Go back to review them; retries do not change your score or add a friendboard entry.") : (zh ? copy("可以返回修改；当前进度尽量保存在此浏览器，不会同步到其他设备。") : "Go back to edit any answer. Progress is saved in this browser when storage is available; it doesn't sync across devices.")}</p></section>}
    {stage === "review" && <section><label htmlFor="fq-review-name">{zh ? copy("显示昵称") : "Display nickname"}</label><input id="fq-review-name" maxLength={32} value={nickname} onChange={e => setNickname(e.target.value)} /><h2 ref={focus} tabIndex={-1}>{zh ? copy("最后检查一下") : "One last look"}</h2><p>{zh ? copy("发布后题目和出题者答案会冻结。想改题，请现在返回。好友每次确认猜测后，会立即看到该题答案。") : "Questions and the creator's choices freeze when the invite is made. Edit now if needed. Friends see each answer as soon as they commit that guess."}</p><ol className="fq-review">{questions.map((q, i) => <li key={q.id}><button onClick={() => { setIndex(i); setStage(challenge ? "friend" : "creator"); }}>{i + 1}. {friendshipQuestionText(q, locale).options[answers[i] ?? 0]} <span>{zh ? "修改" : "Edit"}</span></button></li>)}</ol>{!challenge && <label className="fq-check"><input type="checkbox" checked={contribute} onChange={e => setContribute(e.target.checked)} />{zh ? copy("自愿将我的选择用于有最小样本门槛的匿名汇总（可不选；关闭或删除后不再计入）") : "Optionally include my choices in aggregate counts with a minimum sample threshold. Closing or deleting removes them from future counts."}</label>}<button className="fq-primary" onClick={submit} disabled={busy || !validName || answers.some(a => a === null)}>{challenge ? (zh ? copy("提交并看结果") : "Submit & see result") : (zh ? copy("生成好友邀请") : "Make my invite")}</button></section>}
    {stage === "manage" && challenge && <section><p className="fq-eyebrow">{zh ? copy("你的私人管理页") : "Your private dashboard"}</p><h2 ref={focus} tabIndex={-1}>{zh ? `${challenge.nickname} 的朋友默契` : `${challenge.nickname}’s friendship quiz`}</h2><p>{challenge.questions.length} {zh ? copy("题 · ") : "questions · "}{challenge.closed ? (zh ? copy("已关闭") : "Closed") : (zh ? copy("邀请开放中") : "Open for friends")}</p><ShareTools locale={locale} url={url} questionCount={challenge.questions.length} /><section className="fq-section"><h3>{zh ? copy("先保存管理入口") : "Save your management access"}</h3><p>{zh ? copy("仅邀请链接不能管理挑战。本机最多列出最近20个挑战，其他挑战请用管理文件访问；清理浏览器、无痕退出或换设备会失去本机凭证。请下载私人管理文件，可在其他设备打开其中链接。没有账号，遗失密钥无法凭昵称找回。") : "The invite link can't manage this quiz. This browser keeps up to 20 recent quizzes. Save the private file for older quizzes too. Clearing storage, ending private browsing or changing devices loses that local copy. Download your private management file to reopen on another device. There is no account or nickname-based recovery."}</p><form action={`/friendship-browser/challenges/${challenge.id}/backup`} method="post"><input type="hidden" name="locale" value={locale} /><button type="submit" disabled={busy}>{zh ? copy("保存私人管理文件") : "Save private management file"}</button></form><p role="status">{notice}</p></section><section className="fq-section"><h3>{zh ? "哪些方面被朋友猜中了" : "What your friends picked up on"}</h3>{Object.keys(CATEGORIES).map(cat => { const avg = average(challenge.entries, cat); return <p key={cat}><b>{copy(CATEGORIES[cat][friendshipSourceLocale(locale)])}</b> · {avg === null ? (zh ? copy("暂无可见完成记录") : "No visible completed entries") : `${Math.round(avg)}%`}</p>; })}<p className="fq-muted">{zh ? copy("仅同一题组的可见完成记录，不是总体人群数据。") : "Visible completed entries on this quiz only, not population data."}</p></section><Ranking locale={locale} entries={challenge.entries} total={challenge.questions.length} onHide={(entry_id, hidden) => { void mutate({ entry_id, hidden }); }} /><QuestionAccuracy locale={locale} challenge={challenge} stats={challenge.question_stats} /><button disabled={busy} onClick={async () => { setBusy(true); try { setChallenge(await friendshipApi<Challenge>(`/challenges/${challenge.id}/manage`, "GET")); } catch (e) { setError(errText(e)); } finally { setBusy(false); } }}>{zh ? copy("刷新参与记录") : "Refresh entries"}</button><section className="fq-section"><h3>{zh ? copy("下一轮与预演") : "Another round & preview"}</h3><button disabled={busy} onClick={() => { setNickname(challenge.nickname); setQuestions(challenge.questions); setAnswers(challenge.questions.map(() => null)); setIndex(0); setRevealed([]); setStage("friend"); }}>{zh ? copy("自己试猜（不计榜）") : "Try my quiz (not recorded)"}</button><button disabled={busy} onClick={() => { const old = challenge; setChallenge(null); setNickname(old.nickname); setLength(old.questions.length); if (pack) { const qs = selectQuestions(pack, old.questions.length, old.questions.map(q => q.id)); setQuestions(qs); setAnswers(qs.map(() => null)); setSeen(qs.map(q => q.id)); setIndex(0); setId(crypto.randomUUID()); setStage("creator"); setNotice(zh ? copy("优先使用未出过的题；长题组可能复用部分题。") : "Unused questions come first; longer rounds may reuse some questions."); } }}>{zh ? copy("同长度再出一轮") : "Make another round, same length"}</button><details><summary>{zh ? copy("查看冻结题目与我的答案") : "See my frozen questions & answers"}</summary><ol className="fq-answer-list">{challenge.questions.map((q, i) => <li key={q.id}>{friendshipQuestionText(q, locale).options.join(" / ")}<br /><b>{friendshipQuestionText(q, locale).options[challenge.answers?.[i] ?? 0]}</b></li>)}</ol></details></section><section className="fq-section"><h3>{zh ? copy("控制与保留") : "Controls & retention"}</h3><p>{zh ? copy("挑战从创建起保留90天，到期立即停止访问，并由每小时清理任务按批次删除。关闭保留管理访问，可再次开放；删除会永久移除挑战与所有记录。最多保留1000条参与记录，榜单不是身份认证。") : "Quizzes remain for 90 days from creation. Access stops at expiry; hourly cleanup removes expired records in batches. Closing preserves management access and can be reversed. Deleting permanently removes the quiz and all entries. Up to 1,000 entries per quiz; the ranking doesn't verify identities."}</p><p>{zh ? "到期：" : "Expires: "}{new Date(`${challenge.expires_at.replace(" ", "T")}Z`).toLocaleString(locale !== "en" ? "zh-CN" : "en")}</p><button disabled={busy} onClick={() => mutate({ closed: !challenge.closed })}>{challenge.closed ? (zh ? copy("重新开放") : "Reopen quiz") : (zh ? copy("关闭邀请") : "Close quiz")}</button><button className="fq-danger" disabled={busy} onClick={destroy}>{deleteReady ? (zh ? copy("确认永久删除此挑战及全部记录") : "Confirm permanent deletion of quiz & entries") : (zh ? copy("删除挑战") : "Delete quiz")}</button></section></section>}
    {stage === "result" && challenge && result && <ResultView locale={locale} challenge={challenge} result={result} url={url} headingRef={focus} onManage={result.preview ? () => setStage("manage") : undefined} />}
    {stage === "solo-result" && <ResultPage variant="reflection" className="fq-solo-result">
      <header className="fq-solo-overview">
        <p className="fq-eyebrow">{zh ? copy("单人选择手记") : "Your solo choice journal"}</p>
        <h2 ref={focus} tabIndex={-1}>{zh ? copy("这是你的选择") : "These are your choices"}</h2>
        <p>{zh ? copy("这些选择只留在当前浏览器，不上传答案，本轮不评分。") : "These choices stay in this browser. Solo answers are not uploaded or scored."}</p>
        <dl className="fq-solo-facts">
          <div><dt>{zh ? copy("本轮题目") : "Choices in this round"}</dt><dd>{questions.length}</dd></div>
          <div><dt>{zh ? copy("生活侧面") : "Categories"}</dt><dd>{soloCategories.length}</dd></div>
        </dl>
        <nav className="fq-solo-index" aria-label={zh ? copy("跳到一类选择") : "Jump to a choice category"}>
          <ul>{soloCategories.map(({ id, label, items }) => <li key={id}><a href={`#fq-solo-${id}`}>{label} <span>{items.length}</span></a></li>)}</ul>
        </nav>
      </header>
      <section className="fq-section" aria-labelledby="fq-solo-counts-title"><h3 id="fq-solo-counts-title">{zh ? copy("回看你选了什么") : "Look back at your choices"}</h3>
        <div className="fq-solo-readings">{soloCategories.map(({ id, label, items }) => <section key={id} className="fq-solo-reading"><h4 id={`fq-solo-${id}`} className="fq-solo-category">{label}</h4><ol className="fq-answer-list">{items.map(({ q, i }) => { const counts = stats[q.id]; return <li key={q.id} value={i + 1}><b>{friendshipQuestionText(q, locale).options[answers[i] ?? 0]}</b><p>{statsState === "loading" ? (zh ? copy("正在读取真实统计…") : "Loading real counts…") : statsState === "failed" ? (zh ? copy("统计暂不可用。") : "Counts unavailable.") : counts ? (zh ? copy`本题${counts[0] + counts[1]}份合格答案中，${counts[answers[i] ?? 0]}份也选了这一边。` : `${counts[answers[i] ?? 0]} of ${counts[0] + counts[1]} eligible answers chose this option too.`) : (zh ? copy("本题样本不足20份，暂无对照。") : "Fewer than 20 eligible answers; no comparison yet.")}</p></li>; })}</ol></section>)}</div>
      </section>
      <section className="fq-section fq-conversation"><h3>{zh ? copy("有没有哪道题，让你想多说两句？") : "Did a choice leave you with more to say?"}</h3><p>{zh ? copy("可以想想这次为什么选了这一边，或挑一道愿意分享的题问问朋友。不需要用与多数人的相同或不同来评价自己。") : "Think about what drew you to that option, or share a question you want to discuss with a friend. Matching or differing from the available counts does not rate you."}</p></section>
      <details className="fq-section"><summary>{zh ? copy("选择下方的对照数字从哪里来？") : "Where do the comparison counts come from?"}</summary><p>{zh ? copy("对照来自自愿汇总的创建者选择，不是朋友猜测。仅使用最新200份未关闭、未到期且自愿汇总的创建记录，每题至少20份答案才显示。计数是答案，不是独立人数，也不是人群常模。") : "Comparisons use opt-in creator choices, not friends’ guesses: up to 200 recent active quizzes, with at least 20 eligible answers per question. These count answers, not unique people or population norms."}</p></details>
      <div className="fq-actions"><button onClick={async () => { try { await navigator.clipboard.writeText(`https://fermatmind.com/${locale}${PUBLIC_PATH}`); friendshipEvent("invite_link_copied", friendshipSourceLocale(locale), "solo"); setNotice(zh ? copy("已复制测试入口，不包含你的选择。") : "Quiz entry copied without your choices."); } catch { setNotice(zh ? copy("复制未完成，请从地址栏复制公开测试入口。") : "Copy failed. Copy the public quiz entry from the address bar."); } }}>{zh ? copy("复制测试入口") : "Copy quiz entry"}</button><button className="fq-primary" onClick={() => { setStage("setup"); }}>{zh ? copy("现在创建好友挑战") : "Now make a quiz for friends"}</button></div><p role="status">{notice}</p>
    </ResultPage>}

  </div>;
}
