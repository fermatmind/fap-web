import Link from "next/link";
import { PUBLIC_PATH, type Locale } from "@/lib/friendship/core";

const DEMO_ID = "19321012-afb1-43b9-8ccd-22139abc5ca1";
const clips = [
  { id: "three-misses", en: "Three wrong guesses", zh: "朋友猜错三道题", seconds: 23 },
  { id: "who-knows-best", en: "Who knows me best?", zh: "谁最了解我", seconds: 18 },
  { id: "same-question", en: "Your choice or your friend's choice?", zh: "同一道题，猜谁的选择", seconds: 18 },
] as const;
export function CreatorToolkit({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const demo = `/${locale}/share/friendship/${DEMO_ID}`;
  return <section id="creators" className="fq-section" aria-labelledby="creator-heading">
    <h2 id="creator-heading">{zh ? "创作者与社群：把一轮游戏带给观众" : "Creator & community kit: host a round people can join"}</h2>
    <p>{zh ? "适合朋友聚会、情侣日常、生活方式短视频，或游戏社群的暖场。主持人先出一份关于自己的题，观众猜主持人的选择；不需要给观众安装应用。" : "For a party host, a couple's everyday-life clip, a lifestyle creator or a game community's warm-up: make a quiz about one host, then let people guess that host's choices. Viewers can join in a browser without installing an app."}</p>
    <div className="fq-downloads">
      <h3>{zh ? "先试玩，再创建自己的邀请" : "Try the demo, then make your own invitation"}</h3>
      <p>{zh ? "这是费马官方演示挑战，名字和已展示分数均为演示数据，不是用户见证。30道真实在线题，先前录制的Demo Alex和Demo Cam均为27/30，Demo Bea为24/30；新玩家加入后榜单会变化。" : "This is FermatMind's demonstration quiz, with made-up player names rather than customer testimonials. It has 30 real online questions. In the recorded demo, Alex and Cam each scored 27/30 and Bea scored 24/30; the live board can change as new people join."}</p>
      <p><Link className="fq-primary" href={demo} prefetch={false}>{zh ? "挑战演示出题者" : "Play the demo challenge"} ↗</Link></p>
      <p>{zh ? "演示到期：2027年1月24日13:19 UTC；也可能提前关闭或达到记录上限。正式活动请另建自己的邀请，方便管理、核对和收尾。" : "Demo expiry: 24 January 2027, 13:19 UTC. It may close earlier or reach its entry limit. Make a separate invitation for your own event so you can manage and wrap up your round."} <Link href={`/${locale}${PUBLIC_PATH}#create`}>{zh ? "创建我的挑战" : "Make my own challenge"}</Link></p>
      <p>{zh ? "下载两页创作者包：第1页为使用说明，第2页是可单独打印的直播操作卡。" : "Download the two-page creator pack: page 1 is the usage guide; page 2 is a standalone live-stream cue card."}</p>
      <div className="fq-actions">{["a4", "letter"].map(size => <a key={size} href={`/resources/friendship/friendship-creator-kit-${locale}-${size}.pdf`} download>{zh ? `下载${size === "a4" ? "A4" : "Letter"}创作者包（PDF）` : `${size === "a4" ? "A4" : "US Letter"} creator pack (PDF)`}</a>)}</div>
    </div>
    <h3>{zh ? "开播前完成这四件事" : "Before you record or go live"}</h3>
    <ol>
      <li>{zh ? "主持人先在镜头外完成30题，并保存私人管理文件。生成邀请后答案冻结。打开另一浏览器测试公共邀请，不要在直播画面显示管理文件、管理页或管理密钥。" : "Have the host complete 30 questions off camera and save the private management file. The answer key freezes when the invitation is made. Test the public invitation in another browser. Keep management files, dashboards and keys outside the capture scene."}</li>
      <li>{zh ? "取得同场玩家的拍摄同意，用演示化名；只展示同意公开的分数和反应。主持人可以自己预演，但预演不计榜，不能当观众成绩。" : "Ask featured players before filming and use made-up names. Show only scores and reactions they agree to share. Creator previews are useful for rehearsal but are not recorded on the friendboard."}</li>
      <li>{zh ? "直播观众先独立玩完，再在节目中揭晓答案或展示逐题对照。线上每题立即反馈，过早播出答案会给后来的观众提示；本游戏没有统一倒计时或隐藏到最后揭晓的直播模式。" : "Let the audience finish independently before broadcasting answers or the full comparison. Online answers reveal immediately to each player, so showing them on stream gives later viewers clues. There is no synchronized timer or delayed-reveal live mode."}</li>
      <li>{zh ? "实际点击一次发布后的公开入口，确认手机能进同一邀请。每份挑战最多1000条记录，90天到期；不是不限人数的实时比赛系统。" : "Click the published audience link yourself and verify that a phone opens the same invitation. Each quiz holds up to 1,000 entries and expires after 90 days. It is not an unlimited real-time tournament system."}</li>
    </ol>
    <h3>{zh ? "直播操作卡：准备好后再开一轮" : "Live cue card: one complete round"}</h3>
    <ol>
      <li>{zh ? "开场：展示公共邀请二维码，说“猜我会怎么选，不是选你自己喜欢的。分数只看本轮猜中数。”" : "Open: show the public invitation QR. Say, ‘Guess what I would choose, not your own favorite. The score counts matches in this round.’"}</li>
      <li>{zh ? "参与：让观众独立答完同一30题，暂不播出答案。参与阶段可用第2页操作卡遮住私人窗口。" : "Join: let viewers complete the same 30 questions independently. Keep answers off the broadcast. Use the printed cue card to keep the run-of-show separate from private windows."}</li>
      <li>{zh ? "揭晓：确认参与者完成后，展示已同意公开的结果与榜单。同分并列，榜单按首次完成记录显示；换设备参与无法可靠识别，不要包装成身份认证竞赛。" : "Reveal: after the group finishes, show consenting players' results and the board. Ties share a rank. The first completed record is retained per browser; play from another device cannot be reliably detected. Keep it lighthearted."}</li>
      <li>{zh ? "聊天：选三道最意外的题，问“最近改了偏好，还是我一直没留意？”低分不代表不在乎。" : "Talk: pick three surprises. Ask, ‘Is this a recent change, or something I hadn't noticed?’ A low score does not prove someone does not care."}</li>
      <li>{zh ? "再创建：把“继续挑战这份邀请”和“创建我的挑战”说清。节目回顾完成后再决定是否关闭；关闭会同时阻止参与和结果读取。可在镜头外隐藏不当昵称。" : "Recreate: distinguish ‘play this invitation’ from ‘create my own challenge.’ Decide whether to close after the recap: closing also blocks result access. Moderate inappropriate nicknames off camera."}</li>
    </ol>
    <h3>{zh ? "可直接使用的三支演示" : "Three ready-to-use screen demos"}</h3>
    <p>{zh ? "以下为1080×1920、30fps的中英文实录剪辑，含字幕、片尾演示邀请二维码和原创轻提示音；演示玩家与省略步骤已标明。可下载后剪进自己的介绍，或按同一结构录制自己的真实反应。" : "These 1080×1920, 30fps screen demos include captions, a demo-invitation QR and original quiet cue tones. Demonstration players and omitted steps are labeled. Download a clip for your introduction, or use the structure to record your own real reactions."}</p>
    <div className="fq-videos">{clips.map(clip => <figure key={clip.id}>
      <figcaption><strong>{clip[locale]}</strong> · {clip.seconds}{zh ? "秒" : " seconds"}</figcaption>
      <video controls preload="none" playsInline poster={`/resources/friendship/videos/${clip.id}-${locale}-cover.jpg`} aria-label={clip[locale]}>
        <source src={`/resources/friendship/videos/${clip.id}-${locale}.mp4`} type="video/mp4" />
        <track kind="captions" src={`/resources/friendship/videos/${clip.id}-${locale}.vtt`} srcLang={zh ? "zh-CN" : "en"} label={zh ? "中文" : "English"} />
        <a href={`/resources/friendship/videos/${clip.id}-${locale}.mp4`}>{zh ? "下载视频" : "Download video"}</a>
      </video>
      <p><a download href={`/resources/friendship/videos/${clip.id}-${locale}.mp4`}>{zh ? "下载MP4" : "Download MP4"}</a> · <a download href={`/resources/friendship/videos/${clip.id}-${locale}.srt`}>{zh ? "下载SRT字幕" : "Download SRT captions"}</a></p>
    </figure>)}</div>
    <h3>{zh ? "把视频流量送到真正能点击的入口" : "Give viewers a link they can actually open"}</h3>
    <ul>
      <li>{zh ? "Instagram Stories：在费马下载竖图并复制公共邀请，上传后添加Link贴纸并粘贴；发布后亲自点开验证。Reels可引导到个人资料入口，不要只靠字幕里的网址。" : "Instagram Stories: export the Story image and copy the public invitation, upload it, add the Link sticker and paste. Test the published sticker. For a Reel, point to your profile link rather than relying on an address written into the video."} <a href="https://about.fb.com/ja/news/2021/10/linkaccessstickers/">{zh ? "Meta说明" : "Meta's Link-sticker instructions"}</a></li>
      <li>{zh ? "YouTube Shorts：描述与评论中的网址不可点击。使用频道个人资料链接，或把Shorts关联到你已有的说明视频，再按账号可用权限放置外链；别把“点置顶评论”当默认导流。" : "YouTube Shorts: URLs in descriptions and comments are not clickable. Use a channel profile link, or link the Short to an existing explainer video whose external-link options you have verified. Do not make ‘tap the pinned comment’ your default call to action."} <a href="https://support.google.com/youtube/answer/13748639?hl=en">{zh ? "YouTube链接规则" : "YouTube's link rules"}</a></li>
      <li>{zh ? "TikTok：先核对账号是否有网站入口。官方说明为至少1000粉丝或注册企业账号，功能也受地区影响；没有入口时用画面二维码和清楚域名，不要承诺观众能点个人资料外链。" : "TikTok: check whether your account has a website field. TikTok documents 1,000 followers or a Registered Business Account, with availability varying by location. If the field is missing, use the on-screen QR and clear domain rather than promising a clickable profile link."} <a href="https://support.tiktok.com/en/getting-started/setting-up-your-profile/linking-another-social-media-account">{zh ? "TikTok官方说明" : "TikTok's profile-link instructions"}</a></li>
    </ul>
    <h3>{zh ? "发布文案：让观众知道下一步" : "Caption starters with a clear next step"}</h3>
    <p>{zh ? "出题者：“我已经选好了。你能猜中几题？从个人资料中的邀请进入，再创建一份关于你的题。”好友：“这轮我猜中27/30。来挑战同一份邀请，或者自己出题让我猜。”把27/30替换为真实成绩。" : "Creator: ‘I've made my choices. How many can you guess? Open my quiz from the profile link, then make one about you.’ Friend: ‘I got 27/30 on this round. Try the same invitation, or make your own for me to guess.’ Replace 27/30 with the player's real score."}</p>
    <p>{zh ? "发布前把演示邀请换成自己的公共邀请；别把私人管理链接放进简介、字幕或二维码。以上演示片保留官方演示二维码，若直接使用，请明确是试玩演示。" : "For your own event, replace the demo destination with your own public invitation. Keep the management link out of bios, captions and QR codes. These supplied clips retain the official demo QR; label them as a demo if you use them unchanged."}</p>
    <h3>{zh ? "录制与署名" : "Recording and credit"}</h3>
    <p>{zh ? "可以录制并剪辑自己的费马游玩过程，也可用于已获同意的商业化视频。请保留“费马测试 / FermatMind”和公共邀请或主工具链接；保留演示标注。此说明不授予把题库复制为独立产品的许可，也不代表费马赞助或认可创作者。" : "You may record and edit your own FermatMind play, including monetized videos, with featured players' permission. Keep ‘FermatMind’ and a public invitation or tool link visible, and retain demo labels on supplied clips. This does not license copying the question bank into a separate product or imply FermatMind sponsors the creator."}</p>
    <p className="fq-muted">{zh ? "平台操作说明核对于2026年10月26日；按钮和资格以你的账号实际界面为准。" : "Platform instructions checked 26 October 2026; verify the controls and eligibility available on your account."}</p>
  </section>;
}
