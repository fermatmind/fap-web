"use client";
import { friendshipCopy, type FriendshipDisplayLocale } from "@/lib/friendship/traditional";
export function PrintButton({ locale }: { locale: FriendshipDisplayLocale }) {
  const copy = friendshipCopy(locale);
 return <button className="fq-print-button" onClick={() => window.print()}>{locale !== "en" ? copy("打印活动单 / 保存 PDF") : "Print activity sheet / Save PDF"}</button>; }
