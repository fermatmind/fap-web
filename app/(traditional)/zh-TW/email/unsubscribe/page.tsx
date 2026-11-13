import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";
import { EmailUnsubscribeClient } from "@/components/email/EmailUnsubscribeClient";
import { EmailLanguageLinks } from "@/components/email/EmailLanguageLinks";
import { getDictSync } from "@/lib/i18n/getDict";
import { SITE_URL } from "@/lib/site";

const dict = getDictSync("zh-TW");
export const metadata: Metadata = {title:dict.email.unsubscribe.metadataTitle,description:dict.email.unsubscribe.metadataDescription,robots:{index:false,follow:false},referrer:"no-referrer",alternates:{canonical:new URL("/zh-TW/email/unsubscribe",SITE_URL).toString()}};
export default async function TraditionalEmailUnsubscribePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const query = await searchParams;
  const token = String(Array.isArray(query.token) ? query.token[0] ?? "" : query.token ?? "").trim();
  return <Container as="main" className="max-w-3xl py-10"><EmailUnsubscribeClient locale="zh-TW" token={token} dict={dict} /><EmailLanguageLinks path="/email/unsubscribe" token={token} locale="zh-TW" /></Container>;
}
