import { friendshipCopy, type FriendshipDisplayLocale } from "@/lib/friendship/traditional";
import { FRIENDSHIP_ID } from "./routes";
import type { Result } from "./core";

// Share only the public invitation. Management links and URL credentials never travel.
export function publicInvitation(raw: string): string | null {
  try {
    const url = new URL(raw);
    const localPreview = process.env.NODE_ENV === "development" && typeof window !== "undefined" && url.origin === window.location.origin && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const owned = ["https://fermatmind.com", "https://staging.fermatmind.com"].includes(url.origin);
    if ((!owned && !localPreview) || url.username || url.password || url.search || url.hash || !/^\/(en|zh|zh-TW)\/share\/friendship\/[a-z0-9-]+$/.test(url.pathname)) return null;
    if (url.pathname.startsWith("/zh-TW/") && !FRIENDSHIP_ID.test(url.pathname.split("/").at(-1) ?? "")) return null;
    return url.href;
  } catch { return null; }
}

export function invitationMessage(locale: FriendshipDisplayLocale, result?: Result): string {
  const copy = friendshipCopy(locale);

  if (result?.preview) return locale !== "en"
    ? copy("这是我的创建者预演，没有加入榜单。来试试这份朋友默契挑战。")
    : "This is my creator preview, not a ranked result. Try this friendship challenge.";
  if (result) return locale !== "en"
    ? copy`我猜中 ${result.correct}/${result.total} 题。你能在这份挑战里超过我吗？`
    : `I got ${result.correct}/${result.total}. Can you beat my score on this quiz?`;
  return locale !== "en"
    ? copy("你有多了解我？来猜我的选择，看看你能猜中多少题。")
    : "Think you know me? Guess my choices and see how many you get right.";
}
