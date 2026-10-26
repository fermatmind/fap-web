"use client";
import { useState } from "react";
import { friendshipEvent } from "@/lib/friendship/analytics";
import type { Locale, Result } from "@/lib/friendship/core";
import { title } from "@/lib/friendship/core";
export function ShareTools({ locale, url, result }: { locale: Locale; url: string; result?: Result }) {
  const zh = locale === "zh";
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(url); setMessage(zh ? "邀请链接已复制。由你选择发给谁。" : "Invite link copied. You choose who receives it."); friendshipEvent("invite_link_copied", locale, result && !result.preview ? "friend" : "creator"); } catch { setFallback(true); setMessage(zh ? "请选中下方链接手动复制。" : "Select the link below to copy it manually."); } }
  async function share() { if (!navigator.share) { await copy(); return; } try { await navigator.share({ title: zh ? "朋友默契 · 费马测试" : "How well do you know me? · FermatMind", text: zh ? "来猜猜我的选择。" : "Take a guess at my choices.", url }); setMessage(zh ? "已交给系统分享。是否发送由你确认。" : "Handed to your share sheet. Sending is your choice."); friendshipEvent("share_result", locale, result && !result.preview ? "friend" : "creator", "share_sheet_completed"); } catch (error) { if ((error as Error).name === "AbortError") setMessage(zh ? "已取消分享。" : "Sharing cancelled."); else { setFallback(true); setMessage(zh ? "分享未完成，可复制链接。" : "Sharing didn't finish. Copy the link instead."); } } }
  async function image(story: boolean) {
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = story ? 1920 : 1080;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error();
      ctx.fillStyle = "#f5f2ff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center"; ctx.fillStyle = "#312e81"; ctx.font = "bold 40px sans-serif"; ctx.fillText(zh ? "费马测试 · 朋友默契" : "FERMATMIND · FRIENDSHIP QUIZ", 540, 150);
      const y = story ? 850 : 520;
      ctx.strokeStyle = "#ddd6fe"; ctx.lineWidth = 24; ctx.beginPath(); ctx.arc(540, y, 220, 0, Math.PI * 2); ctx.stroke();
      if (result) { ctx.strokeStyle = "#7c3aed"; ctx.beginPath(); ctx.arc(540, y, 220, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * result.percent / 100); ctx.stroke(); }
      ctx.fillStyle = "#312e81"; ctx.font = "bold 76px sans-serif"; ctx.fillText(result ? `${result.correct}/${result.total}` : "? / ?", 540, y);
      ctx.font = "bold 54px sans-serif"; ctx.fillText(result ? `${result.percent}%` : (zh ? "你了解我吗？" : "Know me?"), 540, y + 80);
      ctx.font = "bold 46px sans-serif"; ctx.fillText(result ? title(result.percent, locale) : (zh ? "猜猜我的选择" : "Guess my choices"), 540, y + 325);
      if (result?.preview) { ctx.font = "26px sans-serif"; ctx.fillText(zh ? "创建者预演 · 未记录" : "Creator preview · not recorded", 540, y + 380); }
      ctx.font = "28px sans-serif"; ctx.fillText(zh ? "只是猜中选择的小游戏，不给友情打分。" : "A guessing game, not a measure of friendship.", 540, canvas.height - 140);
      ctx.font = "30px sans-serif"; ctx.fillText("fermatmind.com", 540, canvas.height - 85);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error()), "image/png"));
      const href = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = href; link.download = story ? "fermatmind-story.png" : "fermatmind-friendship.png"; link.click(); setTimeout(() => URL.revokeObjectURL(href), 60000);
      setMessage(zh ? "图片已生成并开始下载；Stories 请另贴邀请链接。图片不含其他人的昵称。" : "Image created; download started. Add your invite link separately in Stories. No other players' names are included.");
    } catch { setMessage(zh ? "图片生成失败。可截图此结果或复制邀请链接。" : "Image couldn't be created. Take a screenshot or copy the invite link."); }
  }
  return <section aria-label={zh ? "分享与图片" : "Sharing and images"} className="fq-share"><div className="fq-actions"><button onClick={copy}>{zh ? "复制邀请链接" : "Copy invite link"}</button><button onClick={share}>{zh ? "系统分享" : "Share…"}</button><button onClick={() => image(false)}>{zh ? "保存图片" : "Save image"}</button><button onClick={() => image(true)}>{zh ? "Stories 竖图" : "Stories image"}</button></div>{fallback && <label>{zh ? "邀请链接" : "Invite link"}<input readOnly value={url} onFocus={e => e.target.select()} /></label>}<p role="status">{message}</p></section>;
}
