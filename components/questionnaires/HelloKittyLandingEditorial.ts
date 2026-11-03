import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "hello-kitty": {
    "zh": "朋友带新伙伴来做小卡时，留意对方是否有参与空间。比较邀请新人、熟悉活动与逐步加入，让接受或拒绝都自在。",
    "en": "Notice room for someone new when a friend brings a guest to make cards. Compare invitations, familiar activities and gradual joining, with freedom to accept or decline."
  },
  "my-melody": {
    "zh": "选一件双方熟悉的小事，一边做一边相处。比较熟悉的共同活动、欢迎新人和一起玩，不必用准备多少证明关心。",
    "en": "Choose a small familiar activity to share. Compare familiarity, welcoming others and playing together, without measuring care by how much you prepare."
  },
  "keroppi": {
    "zh": "给普通相聚加一个大家愿意参加的小游戏。比较共同玩的过程、新发现与个人趣味，允许旁观和随时停止。",
    "en": "Add an optional small game to ordinary time together. Compare shared play, discovery and personal touches, with room to watch or stop."
  },
  "chococat": {
    "zh": "留意一个新折法或活动中的小变化，再确认对方是否想听。比较新信息、一起玩与个人表达，不把留意消息当知识高低。",
    "en": "Notice a new fold or small change, then check whether others want the update. Compare information, play and expression without ranking knowledge."
  },
  "badtz-maru": {
    "zh": "在自愿共同活动中，保留一个自己喜欢的怪趣细节。比较个人表达、新发现和共同玩法，说明偏好也听取他人意愿。",
    "en": "Keep a quirky detail you enjoy in a voluntary activity. Compare expression, discovery and shared play, stating preferences while hearing others’ wishes."
  },
  "cinnamoroll": {
    "zh": "面对新活动先看一会，再选愿意参与的部分。比较加入方式、熟悉活动与整体节奏，慢慢加入也可以积极参与。",
    "en": "Watch a new activity briefly, then choose a part to join. Compare joining, familiar activities and overall pace; gradual entry can still be active participation."
  },
  "pompompurin": {
    "zh": "让普通相聚少一点催促，留出停顿和随意聊聊的时间。比较活动节奏、逐步加入与一起玩，从容不必等于没有行动。",
    "en": "Leave ordinary time together unhurried, with pauses and casual conversation. Compare pace, gradual joining and play; taking time need not mean doing nothing."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function helloKittyLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
