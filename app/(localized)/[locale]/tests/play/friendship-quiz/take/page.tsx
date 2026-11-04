import { resolveLocale } from "@/lib/i18n/getDict";
import FriendshipClient from "@/components/friendship/FriendshipClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import "@/components/friendship/friendship.css";

type Props = { params: Promise<{ locale: string }> };
const quiz = { title: { zh: "朋友默契", en: "Friendship Quiz" }, minutes: 0 };
export async function generateMetadata({ params }: Props) { const locale = resolveLocale((await params).locale); return questionnaireTakeMetadata(quiz.title[locale], `/${locale}/tests/play/friendship-quiz`); }
export default async function Page({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  return <QuestionnaireTakeDocument autoStart={false} quiz={quiz} locale={locale} landing={`/${locale}/tests/play/friendship-quiz`}><FriendshipClient locale={locale} /></QuestionnaireTakeDocument>;
}
