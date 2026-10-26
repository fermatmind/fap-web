import { resolveLocale } from "@/lib/i18n/getDict";
import { PublicResource, resourceMetadata } from "@/components/friendship/PublicContent";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return resourceMetadata(resolveLocale((await params).locale), "scores"); }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { return <PublicResource locale={resolveLocale((await params).locale)} kind="scores" />; }
