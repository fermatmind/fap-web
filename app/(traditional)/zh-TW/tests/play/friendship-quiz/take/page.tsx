import FriendshipClient from "@/components/friendship/FriendshipClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { FRIENDSHIP_PATH } from "@/lib/friendship/routes";
import "@/components/friendship/friendship.css";

const landing = `/zh-TW${FRIENDSHIP_PATH}`;
const quiz = { title: { zh: "朋友默契", en: "Friendship Quiz" }, minutes: 0 };

export function generateMetadata() {
  return questionnaireTakeMetadata(quiz.title.zh, landing);
}

export default function Page() {
  return <QuestionnaireTakeDocument autoStart={false} quiz={quiz} locale="zh" landing={landing}>
    <FriendshipClient locale="zh-TW" />
  </QuestionnaireTakeDocument>;
}
