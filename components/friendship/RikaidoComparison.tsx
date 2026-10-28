import Link from "next/link";
import { PUBLIC_PATH, type Locale } from "@/lib/friendship/core";

export default function RikaidoComparison({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const rows = zh ? [
    ["基本玩法", "免费、免注册，30–150道二选一题，朋友猜出题者的选择。", "同样免费、免注册，提供30、60、90、120或150题与完整结果。"],
    ["题组选择", "主版本混合六类；另有Love、Real Talk和Food单主题版本。", "当前在线版为六类等量混合题组，发布前可同类换题。"],
    ["同分与重玩", "结果说明称同分按先完成者在前；再次游玩会新增榜单记录。", "同分共享名次；当前浏览器保留首次完成记录，重试不会新增一条。换设备仍可能重复。"],
    ["链接保留", "玩法说明称邀请目前没有到期日。", "挑战90天到期；创建者可提前关闭、重新开放或删除。"],
  ] : [
    ["The core game", "Free, no account, with 30–150 two-choice questions about the creator.", "Also free with no signup: choose 30, 60, 90, 120 or 150 questions and get the full result."],
    ["Question sets", "A six-category main edition, plus single-topic Love, Real Talk and Food editions.", "The current online game balances six categories. Swap a question within its category before publishing."],
    ["Ties and replay", "Its results guide says earlier players rank first on a tie, and another play adds another entry.", "Equal scores share a rank. This browser keeps its first completed entry; retries do not add one. Another device may still repeat."],
    ["Keeping the link", "Its guide says quiz links currently have no expiry date.", "Quizzes expire after 90 days. Creators can close, reopen or delete theirs sooner."],
  ];

  return <section id="rikaido-alternative" className="fq-section scroll-mt-24" aria-labelledby="rikaido-comparison-heading">
    <h2 id="rikaido-comparison-heading" className="text-2xl font-semibold">
      {zh ? "想找 Rikaido 的朋友默契替代玩法？" : "Looking for a Rikaido alternative?"}
    </h2>
    <p>{zh
      ? "如果你想玩“先选自己的答案，再让朋友猜”的小游戏，Rikaido和费马朋友默契都能完成这个任务。两者是独立服务，没有隶属或合作关系。下面由费马测试说明各自的规则，方便你按这一轮的需要选择。"
      : "If you want to make a quiz about yourself and let friends guess your choices, both Rikaido and FermatMind offer that game. They are independent services with no affiliation. This comparison is written by FermatMind to help you choose the rules that suit your group."}</p>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="mb-3 text-left font-semibold">{zh ? "Rikaido 与 FermatMind：先看玩法规则" : "Rikaido vs FermatMind: compare the game rules"}</caption>
        <thead><tr>{[zh ? "你要比较什么" : "What matters to you", "Rikaido", zh ? "费马朋友默契" : "FermatMind Friendship Quiz"].map(label => <th key={label} scope="col" className="border-b p-3">{label}</th>)}</tr></thead>
        <tbody>{rows.map(([label, rikaido, fermat]) => <tr key={label}>
          <th scope="row" className="border-b p-3 align-top">{label}</th>
          <td className="border-b p-3 align-top">{rikaido}</td>
          <td className="border-b p-3 align-top">{fermat}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p>{zh
      ? "想玩单一主题，或希望链接长期保留，可以先看Rikaido的对应版本和说明。想让同分者并列，或为聚会准备纸质玩法，可以试试费马：问题页提供24道原创题、主持说明、答案卡和猜测卡，支持A4与Letter打印；在线题组仍从30题开始。"
      : "For a single-topic edition or a link without a stated expiry, check Rikaido's editions and guide. For shared ranks on ties or a paper game night, try FermatMind. Our questions page has 24 original prompts, host instructions, an answer key and guess sheets in A4 and Letter formats; online rounds still start at 30 questions."}</p>
    <p><Link href={`/${locale}${PUBLIC_PATH}/questions`}>{zh ? "查看朋友二选一问题与可打印活动单" : "Browse this-or-that questions and the printable friendship quiz"} →</Link></p>
    <details><summary>{zh ? "能把原来的 Rikaido 挑战搬过来吗？" : "Can I bring an existing Rikaido quiz here?"}</summary>
      <p>{zh
        ? "不能直接导入Rikaido的邀请、答案或榜单。请用费马自己的题库创建一份新挑战，再把新邀请发给朋友。创建后保存私人管理文件，分享时只发好友邀请；管理文件里的密钥不能发给参与者。"
        : "There is no import for Rikaido invites, answers or rankings. Make a new quiz from FermatMind's own question bank, then send its new invitation to friends. Save your private management file after creating. Share the friend invite, and keep the management key in that file to yourself."}</p>
    </details>
    <p><Link className="fq-primary" href={`/${locale}${PUBLIC_PATH}#create`}>{zh ? "用费马创建一份新挑战" : "Make a new quiz on FermatMind"} →</Link></p>
    <p className="fq-muted">{zh ? "核对日期：2026年10月28日。Rikaido规则来源：" : "Checked October 28, 2026. Rikaido rule sources: "}
      <a href="https://rikaido.me/en/guide.html" target="_blank" rel="noopener noreferrer">{zh ? "官方玩法说明" : "official how-to guide"}</a>{" · "}
      <a href="https://rikaido.me/en/lab/read-results/" target="_blank" rel="noopener noreferrer">{zh ? "官方结果说明" : "official results guide"}</a>{zh ? "。费马规则与当前工具一致，详见" : ". For FermatMind's current rules, see "}
      <Link href={`/${locale}${PUBLIC_PATH}/how-to-play`}>{zh ? "玩法与管理" : "how to play and manage your quiz"}</Link>{" / "}
      <Link href={`/${locale}${PUBLIC_PATH}/scores`}>{zh ? "分数解释" : "scores and ties"}</Link>{zh ? "。" : "."}
    </p>
  </section>;
}
