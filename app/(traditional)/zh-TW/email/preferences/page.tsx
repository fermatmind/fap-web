import type { Metadata } from "next";
import { EmailPreferencesClient } from "@/components/email/EmailPreferencesClient";
import { EmailLanguageLinks } from "@/components/email/EmailLanguageLinks";
import { getDictSync } from "@/lib/i18n/getDict";
import { SITE_URL } from "@/lib/site";

const dict = getDictSync("zh-TW");
export const metadata: Metadata = {title:dict.email.preferences.metadataTitle,description:dict.email.preferences.metadataDescription,robots:{index:false,follow:false},referrer:"no-referrer",alternates:{canonical:new URL("/zh-TW/email/preferences",SITE_URL).toString()}};
export default async function TraditionalEmailPreferencesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const query = await searchParams;
  const token = String(Array.isArray(query.token) ? query.token[0] ?? "" : query.token ?? "").trim();
  return <><EmailPreferencesClient locale="zh-TW" token={token} dict={dict} /><EmailLanguageLinks path="/email/preferences" token={token} locale="zh-TW" /></>;
}
