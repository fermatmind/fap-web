import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FriendshipClient from "@/components/friendship/FriendshipClient";
import { FriendshipNav } from "@/components/friendship/PublicContent";
import { FRIENDSHIP_ID, FRIENDSHIP_PATH } from "@/lib/friendship/routes";
import "@/components/friendship/friendship.css";

export const metadata: Metadata = {
  title: "朋友默契",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  alternates: { canonical: null, languages: {} },
  openGraph: { title: "你有多了解我？ · 費馬測試", description: "打開朋友的邀請，猜猜對方選了什麼。", url: `https://fermatmind.com/zh-TW${FRIENDSHIP_PATH}` },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!FRIENDSHIP_ID.test(id)) notFound();

  return <main className="fq-page">
    <FriendshipNav locale="zh-TW" />
    <div className="fq-body"><h1 className="my-6 text-3xl font-bold">朋友默契</h1>
      <FriendshipClient locale="zh-TW" inviteId={id} />
    </div>
  </main>;
}
