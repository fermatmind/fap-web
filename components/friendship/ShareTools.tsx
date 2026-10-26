"use client";
import { useState } from "react";
import { friendshipEvent } from "@/lib/friendship/analytics";
import type { Locale, Result } from "@/lib/friendship/core";
import { title } from "@/lib/friendship/core";
import { invitationMessage, publicInvitation } from "@/lib/friendship/sharing";

export function ShareTools({ locale, url, result, questionCount }: { locale: Locale; url: string; result?: Result; questionCount?: number }) {
  const zh = locale === "zh";
  const invitation = publicInvitation(url);
  const friend = !!result && !result.preview;
  const role = friend ? "friend" : "creator";
  const caption = invitationMessage(locale, result);
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  async function clipboard(value: string): Promise<boolean> {
    try { await navigator.clipboard.writeText(value); return true; }
    catch { setFallback(true); return false; }
  }
  async function copy(withMessage = false) {
    if (!invitation) return;
    if (await clipboard(withMessage ? `${caption}\n${invitation}` : invitation)) {
      setMessage(zh ? "已复制。由你选择发给谁。" : "Copied. You choose who receives it.");
      friendshipEvent("invite_link_copied", locale, role, withMessage ? "with_message" : "");
    } else setMessage(zh ? "复制未完成，请选中下方内容手动复制。" : "Copy didn't finish. Select the text below to copy it manually.");
  }
  async function share() {
    if (!invitation) return;
    if (!navigator.share) { await copy(true); return; }
    try {
      await navigator.share({ title: zh ? "朋友默契 · 费马测试" : "Friendship quiz · FermatMind", text: caption, url: invitation });
      setMessage(zh ? "已交给系统分享。是否发送由你确认。" : "Handed to your share sheet. Sending is your choice.");
      friendshipEvent("share_result", locale, role, "share_sheet_completed");
    } catch (error) {
      if ((error as Error).name === "AbortError") setMessage(zh ? "已取消分享。" : "Sharing cancelled.");
      else { setFallback(true); setMessage(zh ? "分享未完成，可复制下方内容。" : "Sharing didn't finish. Copy the text below instead."); }
    }
  }
  async function image(story: boolean) {
    if (!invitation || busy) return;
    setBusy(true);
    // Start clipboard access inside the click gesture, before fonts/QR generation await.
    const copied = story ? clipboard(invitation) : Promise.resolve(false);
    try {
      await document.fonts.ready;
      const { default: QRCode } = await import("qrcode");
      const qr = document.createElement("canvas");
      await QRCode.toCanvas(qr, invitation, { width: story ? 280 : 210, margin: 4, errorCorrectionLevel: "M", color: { dark: "#312e81", light: "#ffffff" } });
      const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = story ? 1920 : 1080;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error();
      ctx.fillStyle = "#f5f2ff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center"; ctx.fillStyle = "#312e81";
      ctx.font = "bold 34px sans-serif"; ctx.fillText(zh ? "费马测试 · 朋友默契" : "FERMATMIND · FRIENDSHIP QUIZ", 540, story ? 220 : 80);
      ctx.font = "bold 54px sans-serif"; ctx.fillText(friend ? (zh ? "你能超过我吗？" : "Can you beat my score?") : (zh ? "你有多了解我？" : "How well do you know me?"), 540, story ? 350 : 165);
      const y = story ? 760 : 425; const radius = story ? 230 : 190;
      ctx.strokeStyle = "#ddd6fe"; ctx.lineWidth = 24; ctx.beginPath(); ctx.arc(540, y, radius, 0, Math.PI * 2); ctx.stroke();
      if (result) { ctx.strokeStyle = "#7c3aed"; ctx.beginPath(); ctx.arc(540, y, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * result.percent / 100); ctx.stroke(); }
      ctx.fillStyle = "#312e81"; ctx.font = "bold 76px sans-serif"; ctx.fillText(result ? `${result.correct}/${result.total}` : `? / ${questionCount ?? "?"}`, 540, y - 15);
      ctx.font = "bold 48px sans-serif"; ctx.fillText(result ? `${result.percent}%` : (zh ? "来猜猜" : "Your turn"), 540, y + 65);
      ctx.font = "bold 42px sans-serif"; ctx.fillText(result ? title(result.percent, locale) : (zh ? "我的选择，等你来猜" : "My choices. Your guesses."), 540, story ? 1090 : 685);
      if (result?.preview) { ctx.font = "26px sans-serif"; ctx.fillText(zh ? "创建者预演 · 未计榜" : "Creator preview · not recorded", 540, story ? 1140 : 725); }
      const qrY = story ? 1220 : 750;
      ctx.drawImage(qr, (1080 - qr.width) / 2, qrY);
      ctx.font = "30px sans-serif"; ctx.fillText(zh ? "扫码挑战 · 看看谁更了解" : "Scan to play · make your own next", 540, story ? 1580 : 1000);
      ctx.font = "26px sans-serif"; ctx.fillText(zh ? "猜中选择的小游戏，不给友情打分。" : "A guessing game, not a friendship rating.", 540, story ? 1650 : 1040);
      if (story) { ctx.font = "30px sans-serif"; ctx.fillText("fermatmind.com", 540, 1750); }
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error()), "image/png"));
      const href = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = href; link.download = story ? "fermatmind-story.png" : "fermatmind-friendship.png"; link.click(); setTimeout(() => URL.revokeObjectURL(href), 60000);
      const linkCopied = await copied;
      if (story) {
        setMessage(linkCopied ? (zh ? "竖图已开始下载，邀请链接已复制。打开 Stories 上传图片，添加“链接”贴纸并粘贴；二维码也能进入这份挑战。" : "Story image download started and invite link copied. Upload the image to your Story, add a Link sticker and paste. The QR also opens this quiz.") : (zh ? "竖图已开始下载，链接未能自动复制。请复制下方邀请链接，再贴到 Stories 的“链接”贴纸；图片二维码也可使用。" : "Story image download started, but the link couldn't be copied. Copy it below for your Story's Link sticker; the image's QR still works."));
        setFallback(true);
      } else setMessage(zh ? "图片已开始下载，二维码可进入这份挑战。图片不含其他参与者昵称。" : "Image download started. Its QR opens this quiz. No other players' names are included.");
      friendshipEvent("share_result", locale, role, story ? "story_image_download_started" : "square_image_download_started");
    } catch {
      await copied;
      setFallback(true); setMessage(zh ? "图片生成失败。可复制下方邀请内容，或重试。" : "Image couldn't be created. Copy the invitation below, or try again.");
    } finally { setBusy(false); }
  }
  return <section aria-label={zh ? "分享与图片" : "Sharing and images"} className="fq-share">
    <h3>{friend ? (zh ? "邀请别人挑战这位朋友" : "Challenge this friend") : (zh ? "邀请朋友来猜你的选择" : "Invite friends to guess your choices")}</h3>
    <p>{caption}</p>
    <div className="fq-actions">
      <button disabled={!invitation} onClick={() => copy()}>{zh ? "复制邀请链接" : "Copy invite link"}</button>
      <button disabled={!invitation} onClick={() => copy(true)}>{zh ? "复制文案和链接" : "Copy message + link"}</button>
      <button disabled={!invitation} onClick={share}>{friend ? (zh ? "分享成绩与这份挑战" : "Share score & this quiz") : (zh ? "分享我的挑战" : "Share my challenge")}</button>
      {invitation && <a className="fq-primary" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${caption}\n${invitation}`)}`} onClick={() => friendshipEvent("share_result", locale, role, "whatsapp_opened")}>WhatsApp ↗</a>}
      <button disabled={!invitation || busy} onClick={() => image(false)}>{zh ? "保存图片" : "Save image"}</button>
      <button disabled={!invitation || busy} onClick={() => image(true)}>{zh ? "Stories：竖图和链接" : "Stories: image + link"}</button>
    </div>
    {fallback && <div><label>{zh ? "邀请链接（贴到 Stories 的链接贴纸）" : "Invite link (for your Story's Link sticker)"}<input readOnly value={invitation ?? ""} onFocus={e => e.target.select()} /></label><label>{zh ? "分享文案和链接" : "Message and invite link"}<textarea readOnly rows={4} value={invitation ? `${caption}\n${invitation}` : ""} onFocus={e => e.target.select()} /></label></div>}
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
