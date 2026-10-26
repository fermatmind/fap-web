import Link from "next/link";
import { CATEGORIES, PUBLIC_PATH, type Locale } from "@/lib/friendship/core";
import preview from "@/lib/friendship/preview.json";
import { PrintButton } from "./PrintButton";

export function QuestionActivity({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <>
    <p>{zh ? "找一位出题者，其他人猜这位朋友会怎么选。下面24道原创二选一适合聚会、兄弟姐妹或约会时轮流玩；它们是 friendship-v1 的公开选题，不是友情质量或性格评分。" : "Pick one person to be the creator. Everyone else guesses what that person would choose. These 24 original this-or-that questions work for friends, siblings or a date-night round. They are a public selection from friendship-v1, made for conversation rather than rating a relationship."}</p>
    <section className="fq-downloads fq-hide-print" aria-labelledby="printable-heading">
      <h2 id="printable-heading">{zh ? "下载真正能用的打印活动包" : "Download your printable friendship quiz"}</h2>
      <p>{zh ? "免费PDF，共4页：主持说明与计分例子、24道题、独立的保密答案卡、好友猜测卡。黑白打印即可，无需注册。选实际纸张，以100%比例打印；每轮1份题单、1份答案卡，每位好友1份猜测卡。" : "A free four-page PDF: host guide and scoring example, all 24 questions, a separate private answer key and a friend's guess sheet. No signup; black-and-white printing is fine. Choose your paper size and print at 100%. Use one question list and creator key per round, plus one guess sheet per friend."}</p>
      <div className="fq-actions">{["a4", "letter"].map(size => <a className="fq-primary" key={size} href={`/resources/friendship/friendship-quiz-${locale}-${size}.pdf`} download>{zh ? `下载${size === "a4" ? "A4" : "Letter"}活动包（PDF）` : `Download ${size === "a4" ? "A4" : "US Letter"} quiz pack (PDF)`}</a>)}</div>
      <p><Link href={`/${zh ? "en" : "zh"}${PUBLIC_PATH}/questions`}>{zh ? "需要英文版？查看英文活动包" : "Playing in Chinese? Get the Chinese pack"}</Link></p>
      <PrintButton locale={locale} />
    </section>
    <h2>{zh ? "主持人照着这五步就能开一轮" : "Host a round in five steps"}</h2>
    <ol>
      <li>{zh ? "准备纸笔，选一人出题，其他人各拿一张猜测卡。首次可选下方前6题，熟悉后再玩全部24题。用化名，别填联系方式。" : "Bring pens and paper. Choose a creator and give each friend a guess sheet. Start with questions 1–6 for a short first round, or use all 24. Use nicknames, with no contact details."}</li>
      <li>{zh ? "所有人先约定同一组题号。任何人都可提出跳过不适用或不想答的题；这一题对本轮所有人取消，不计分。把未用题划掉。" : "Agree on the same question numbers for everyone. Anyone can ask to skip an uncomfortable or irrelevant prompt. Remove it for the entire round and cross it out on every sheet."}</li>
      <li>{zh ? "出题者独自按自己现在的偏好圈A或B，把答案卡折起。不要提前给线索，作答后不再为配合好友改答案。" : "The creator privately circles A or B for their current preferences, then folds the key. Give no hints and keep that key fixed once guessing starts."}</li>
      <li>{zh ? "读题时说：“猜出题者会选A还是B，不是你自己喜欢哪个。”所有好友独立填写，收齐后再一起揭晓，避免后作答者获得提示。" : "Read aloud: ‘Guess what the creator would pick, not your own favorite.’ Friends answer independently. Collect every sheet before revealing, so later players do not get clues."}</li>
      <li>{zh ? "每猜中一题得1分，猜错或空白得0分。用同一有效题数作分母；同分并列。聊聊最意外的一题，再换另一人出题。" : "Award one point per matching guess; a miss or blank earns zero. Everyone uses the same number of included questions. Ties share a place. Discuss one surprise, then let someone else be the creator."}</li>
    </ol>
    <h2>{zh ? "计分示例：4题猜中2题，就是50%" : "Worked example: 2 matches out of 4 = 50%"}</h2>
    <p>{zh ? "假设本轮只用第1至4题。出题者选A、B、A、B；好友猜A、A、B、B。第1和4题猜中，所以2 ÷ 4 × 100 = 50%。另一位好友也得2分，两人并列；50%不是“友情只有一半”。" : "Suppose this round uses questions 1–4 only. The creator picks A, B, A, B; a friend guesses A, A, B, B. Questions 1 and 4 match: 2 ÷ 4 × 100 = 50%. Another friend with two matches ties. It does not mean ‘half a friendship.’"}</p>
    <table className="fq-example"><caption>{zh ? "同一答案卡的核对过程" : "Checking the same answer key"}</caption><thead><tr>{[zh ? "题号" : "Question", zh ? "出题者" : "Creator", zh ? "好友" : "Guess", zh ? "得分" : "Point"].map(x => <th key={x} scope="col">{x}</th>)}</tr></thead><tbody>{[0,1,2,3].map(i => <tr key={i}><th scope="row">{i+1}</th><td>{["A","B","A","B"][i]}</td><td>{["A","A","B","B"][i]}</td><td>{i === 0 || i === 3 ? 1 : 0}</td></tr>)}</tbody></table>
    <p>{zh ? "若第3题在开局前被取消，所有人都不答它，分母统一变成3。不要用不同题组的百分比排名。线下可自由选题；在线版从30题开始、六类等量、可同类换题，好友每答一题立即揭晓，两种流程有所不同。" : "If question 3 is removed before the round, nobody answers it and everyone's denominator becomes three. Do not rank scores from different sets of questions. Offline you choose the set. The online game starts at 30 balanced questions, allows same-category swaps, and reveals each guess immediately."}</p>
    <section className="fq-sheet" aria-labelledby="question-list-heading"><h2 id="question-list-heading">{zh ? "24道朋友二选一：猜我会选什么" : "24 this-or-that questions: what would I choose?"}</h2>
      <p>{zh ? "先决定猜谁的选择。每题A在前、B在后；题号与四页PDF一致。" : "Decide whose choices you are guessing. A comes first and B second. Numbers match the four-page PDF."}</p>
      {Object.entries(CATEGORIES).map(([category, label]) => <section key={category}>
        <h3>{label[locale]}</h3><ol start={preview.questions.findIndex(q => q.category === category) + 1}>{preview.questions.filter(q => q.category === category).map(q => <li key={q.id} data-question-id={q.id}><strong>A.</strong> {q[locale].options[0]}<br /><strong>B.</strong> {q[locale].options[1]}</li>)}</ol>
        <p className="fq-hide-print"><Link href={`/${locale}${PUBLIC_PATH}?category=${category}#create`}>{zh ? `把${label[locale]}放在在线题组开头` : `Start the online mix with ${label[locale].toLowerCase()}`}</Link></p>
      </section>)}
      <p className="fq-muted">{zh ? "上述分类链接只调整开头类别，在线版仍然包含六类题，不是单类专属版。" : "Category links change which category comes first. The online quiz still includes all six categories; these are not single-topic editions."}</p>
    </section>
    <h2>{zh ? "一轮结束后，怎么继续聊" : "Turn the reveal into a conversation"}</h2>
    <ul><li>{zh ? "朋友局：问“你是凭哪次经历猜到的？”让新朋友也有解释空间。" : "Friends: ask, ‘What made you think I'd pick that?’ Give newer friends room to explain."}</li><li>{zh ? "情侣局：说“我最近变了”，而不是用猜错来证明对方不在乎。" : "Couples: make room for ‘I've changed my mind lately’ rather than treating a miss as evidence someone does not care."}</li><li>{zh ? "大组聚会：每个人用同一张保密答案卡核对，最后再换出题者；不要把不同出题者的分数混成一张榜。" : "Groups: check against one private key, then rotate the creator. Keep different creators' rounds separate."}</li></ul>
    <p>{zh ? "想用自己写的问题？线下可另写并重新编号，所有人使用同一版题单；不要声称那是费马原题。在线版当前不支持添加自定义问题。" : "Want to write your own prompts? Make a separate offline list with new numbers and give everyone the same version. Do not label those as FermatMind's original questions. Custom questions are not currently supported in the online tool."}</p>
  </>;
}
