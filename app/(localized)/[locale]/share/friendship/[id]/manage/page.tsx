import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import FriendshipClient from "@/components/friendship/FriendshipClient";
import { FriendshipNav } from "@/components/friendship/PublicContent";
import "@/components/friendship/friendship.css";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const locale = resolveLocale((await params).locale); return { title: locale === "zh" ? "朋友默契" : "Friendship Quiz", robots: { index: false, follow: false, noarchive: true }, referrer: "no-referrer", openGraph: { title: "How well do you know me? · FermatMind", description: "A two-choice game between friends. Open your invite to play.", url: "https://fermatmind.com/en/tests/friendship-quiz" }, alternates: { canonical: null, languages: {} } }; }
export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) { const { locale: raw, id } = await params; if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) notFound(); const locale = resolveLocale(raw); return <main className="fq-page"><FriendshipNav locale={locale} /><div className="fq-body"><h1 className="my-6 text-3xl font-bold">{locale === "zh" ? "朋友默契" : "Friendship Quiz"}</h1><FriendshipClient locale={locale} inviteId={id} management /></div></main>; }
