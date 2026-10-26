import Link from "next/link";
import { resolveLocale } from "@/lib/i18n/getDict";
import { JsonLd } from "@/components/seo/JsonLd";
import FriendshipClient from "@/components/friendship/FriendshipClient";
import { FriendshipNav, resourceMetadata } from "@/components/friendship/PublicContent";
import "@/components/friendship/friendship.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return resourceMetadata(resolveLocale((await params).locale), "home");
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale); const zh = locale === "zh";
  const faqs = zh ? [
    ["我应该选自己的偏好，还是猜出题者？", "出题时选你自己的偏好；接受朋友邀请时，猜对方当时选了什么。好友猜对一题得1分，自己的偏好与对方是否相同不参与计分。"],
    ["可以让一群朋友一起玩吗？", "可以把同一份邀请发给多位朋友。每人用化名参与，猜的是同一组冻结题目和答案；完成后按猜中数看榜单，同分并列。每个挑战最多保留1000条记录，换设备仍可能重复参与。"],
    ["能自己写题，或者选题数吗？", "可选30、60、90、120或150题，六类题数相同。发布前可以把不适用的题换成同类另一道题；当前不支持自行添加问题。想自由写题或缩短线下活动，可以使用问题与打印页的主持方法。"],
    ["测试和完整结果都免费吗？", "出题、好友作答、完整分数、雷达图、逐题对照、榜单和分享图都免费，无需注册、邮箱或下载App。请自行保存创建后的私人管理文件。"],
    ["谁能看见我的挑战和成绩？", "持有邀请链接的人可参与并查看可见榜单里的化名和成绩；公开发布链接也会让陌生人进入。私人管理文件另含管理凭证，不要转发。挑战90天到期，也可以提前关闭或删除。"],
  ] : [
    ["Do I answer for myself or guess the creator?", "When making a quiz, pick your own preferences. When opening a friend's invite, guess the choices they already made. Each match earns one point; sharing the same personal preference isn't required."],
    ["Can my whole group play the same friendship quiz?", "Share one invite with several friends. Each uses a nickname and guesses the same frozen questions and choices. Finished entries appear on the friendboard, with equal scores sharing a rank. A quiz holds up to 1,000 entries; another device may still create a repeat entry."],
    ["Can I write questions or choose the quiz length?", "Choose 30, 60, 90, 120 or 150 questions, balanced across six categories. Before publishing, swap a question for another from its category. You can't add custom questions in the online game. For a flexible offline round, use the questions and printable hosting guide."],
    ["Are the quiz and full results free?", "Creating, guessing, scores, the radar, answer comparisons, the friendboard and share images are free. No signup, email address or app download is required. Save the private management file after making your invite."],
    ["Who can see the quiz and the scores?", "Anyone with the invitation can play and see visible nicknames and scores. Posting it publicly lets strangers join too. Keep the separate management file private. Quizzes expire after 90 days, or you can close or delete yours earlier."],
  ];
  return <main className="fq-page">
    <section className="fq-hero"><div>
      <p className="fq-eyebrow">{zh ? "费马测试 · 免费朋友默契测试" : "FERMATMIND · FREE FRIENDSHIP QUIZ"}</p>
      <h1>{zh ? "你有多了解我？" : "How well do you know me?"}</h1>
      <p>{zh ? "先选自己的日常偏好，发给朋友来猜。谁更了解你，用同一份挑战看看。" : "Make a free friendship quiz about yourself. Send your link, let friends guess, and see who knows you best."}</p>
      <a className="fq-primary" href="#create">{zh ? "免费创建我的挑战" : "Make my friendship quiz"} ↗</a>
      <p className="fq-muted">{zh ? "免注册 · 30–150题 · 六种生活侧面" : "No signup · 30–150 questions · Full results free"}</p>
    </div><svg className="fq-art" viewBox="0 0 400 350" role="img" aria-label={zh ? "合成示例：猜中22/30，73%" : "Illustrative example: 22 of 30 matches, 73%"}><rect x="35" y="15" width="330" height="320" rx="30" fill="white" /><circle cx="200" cy="156" r="92" fill="none" stroke="#ede6fa" strokeWidth="14" /><circle cx="200" cy="156" r="92" fill="none" stroke="#7c3aed" strokeWidth="14" strokeDasharray="422 578" transform="rotate(-90 200 156)" strokeLinecap="round" /><text x="200" y="155" textAnchor="middle" fill="#312e81" fontWeight="750" fontSize="48">22/30</text><text x="200" y="195" textAnchor="middle" fill="#7c3aed" fontWeight="650" fontSize="30">73%</text><text x="200" y="285" textAnchor="middle" fill="#554666" fontSize="18">{zh ? "示例 · 每个答案都是个话题" : "Example · Every answer has a story"}</text></svg></section>
    <FriendshipNav locale={locale} />
    <div className="fq-body">
      <section id="create" className="scroll-mt-24"><FriendshipClient locale={locale} /></section>
      <section className="fq-section"><h2 className="text-3xl font-semibold">{zh ? "一份你来出题的朋友默契挑战" : "A friendship quiz you make, and your friends take"}</h2>
        <ol className="fq-answer-list">
          <li><b>{zh ? "先选出关于你的答案" : "Answer as yourself"}</b><p>{zh ? "从美食、相处、玩乐与运动、真心话、个人风格和日常里出题。可选30、60、90、120或150题，每类题数相同；发布前可同类换题和修改答案。" : "Pick 30, 60, 90, 120 or 150 two-choice questions across food, connection, fun & movement, real talk, personal style and daily life. Every category gets an equal share. Swap a question or edit a choice before making the invite."}</p></li>
          <li><b>{zh ? "把同一份邀请发给朋友" : "Share one link with your friends"}</b><p>{zh ? "题目和答案在创建时冻结。朋友用化名进入，猜的是你的选择。分享由你确认，不读取通讯录，也不代你发消息。" : "Making the invite freezes your questions and choices. Friends open your link, enter a nickname and guess what you picked. You choose who gets it; we don't read contacts or send messages for you."}</p></li>
          <li><b>{zh ? "逐题揭晓，再看完整结果" : "Reveal each guess, then see the full result"}</b><p>{zh ? "每次选择立即揭晓正误，连续猜中会累计连击。完成后查看猜中数、百分比、六类雷达、好友榜单和逐题对照；回头看题不会改掉已揭晓的猜测。" : "Each guess gets an immediate reveal; consecutive matches build a streak. Finish for your score, percentage, six-category radar, friendboard and question-by-question comparison. Going back lets you review a revealed guess, not rewrite it."}</p></li>
        </ol>
        <p>{zh ? "示例：出题者选“熟悉的早餐”，你猜中便得1分。即使你自己更喜欢每天换早餐，也不影响这题得分。" : "For example, the creator picks a familiar breakfast. Guess that choice and you earn a point, even if you'd rather try something different yourself. Knowing their choice and sharing their preference are different things."}</p>
      </section>
      <section className="fq-section"><h2 className="text-2xl font-semibold">{zh ? "谁更了解我？在同一份题里比较" : "Who knows me best? Compare the same quiz"}</h2>
        <p>{zh ? "把同一份链接给几位朋友，完成者会进入该挑战的榜单。大家面对同一组冻结选择，按猜中数排列，同分共享名次。类别雷达还能提示哪些侧面更容易猜中；没有其他可见记录时，不显示虚构的平均线。" : "Send the same link to several friends and their completed entries join that quiz's friendboard. Everyone guesses the same frozen choices; matches set the order, and equal scores share a rank. The radar adds category detail. A comparison line appears only when other visible entries provide an average."}</p>
        <p>{zh ? "猜错可能只是没聊过、偏好改变了，或者题目不贴切。可以挑一道双方都想聊的题交换想法；下一轮换朋友出题，让你来猜。" : "A surprise can mean a preference changed, a question didn't fit, or the detail never came up. Pick a question you both want to talk about, then swap roles: your friend makes a quiz and you guess."}</p>
        <Link href={`/${locale}/tests/play/friendship-quiz/scores`}>{zh ? "看看分数、并列和雷达怎么读" : "Understand scores, ties and the radar"} →</Link>
      </section>
      <section className="fq-section"><h2 className="text-2xl font-semibold">{zh ? "朋友、家人、伴侣，或一整个群聊" : "Best friends, siblings, partners or your group chat"}</h2>
        <ul className="fq-answer-list">
          <li>{zh ? "老朋友：按你现在的偏好出题，聊聊哪些选择和以前不一样。" : "Best friends: answer as you are now and discover which little details have changed."}</li>
          <li>{zh ? "兄弟姐妹：从吃什么、怎么玩、怎么安排一天，看谁记得更多小细节。" : "Siblings: compare the everyday food, activities and routines you think you remember."}</li>
          <li>{zh ? "伴侣：用双方愿意讨论的小偏好开场。当前在线版仍是六类混合题组。" : "Partners: start with everyday choices you're both happy to discuss. The online game still uses a six-category mix."}</li>
          <li>{zh ? "群聊或聚会：先由一人出题，让其他人猜同一份，再轮换出题者。" : "Group chats or game nights: choose one creator, let everyone guess that person's choices, then rotate the creator."}</li>
        </ul>
        <p>{zh ? "想叫它闺蜜测试、BFF测试或“你有多了解我”小游戏都可以。分数只记录猜中了多少选择，不评定谁才是真朋友，也不测忠诚或关系好坏。" : "Call it a best friend quiz, a BFF test or a how well do you know me game. The score counts matching guesses, not who is a real friend, who is loyal or how good a relationship is."}</p>
      </section>
      <section className="fq-section"><h2 className="text-2xl font-semibold">{zh ? "先看问题，或带去线下玩" : "Browse the questions or play offline"}</h2>
        <p>{zh ? "现有问题页提供24道原创二选一问题、答案卡和打印玩法。在线出题仍从30题开始；线下可以先约定一组大家都愿意回答的问题。" : "Find 24 original this-or-that questions, an answer sheet and printable game rules on the questions page. Online rounds start at 30 questions; offline, agree on the questions your group wants to use before you begin."}</p>
        <p><Link href={`/${locale}/tests/play/friendship-quiz/questions`}>{zh ? "朋友二选一问题与打印活动" : "This or that questions for friends + printable quiz"} →</Link></p>
        <p><Link href={`/${locale}/tests/play/friendship-quiz/how-to-play`}>{zh ? "出题、分享与私人管理说明" : "How to create, share and manage your quiz"} →</Link></p>
      </section>
      <section className="fq-section"><h2 className="text-2xl font-semibold">{zh ? "开始之前，你可能还想知道" : "Your friendship quiz questions, answered"}</h2>
        {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      </section>
      <section className="fq-section"><h2 className="text-2xl font-semibold">{zh ? "现在，让朋友来猜猜你的选择" : "Make your quiz. Give friends something to guess."}</h2><a className="fq-primary" href="#create">{zh ? "免费开始出题" : "Create my free friendship quiz"} →</a></section>
    </div>
    <JsonLd id={`friendship-game-${locale}`} data={{ "@context": "https://schema.org", "@type": "WebApplication", name: zh ? "费马朋友默契" : "FermatMind Friendship Quiz", url: `https://fermatmind.com/${locale}/tests/play/friendship-quiz`, applicationCategory: "GameApplication", operatingSystem: "Web browser", inLanguage: zh ? "zh-CN" : "en", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: zh ? "免费创建二选一朋友默契挑战，邀请朋友猜自己的选择，比较分数和榜单。" : "Make a free friendship quiz about yourself, share your link and see who knows your choices best." }} />
  </main>;
}
