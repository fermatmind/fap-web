export const pages = {
  home: { en: ["Friendship Quiz: How Well Do You Know Me?", "Create a free friendship quiz with 30–150 questions. Let your best friends guess how well they know you, compare scores and share the friendboard. No signup."], zh: ["友谊挑战：朋友默契测试，你有多了解我？", "你有多了解我？免费创建 30 至 150 题的朋友默契测试。发一条邀请让好友猜你的选择，逐题揭晓，答完看分数和榜单。无需注册。"] },
  questions: { en: ["24 Best Friend Quiz Questions + Printable Game", "Try six this-or-that questions for a quick offline round or use all 24. Get a free printable friendship quiz with a private answer key and guess sheet."], zh: ["朋友默契测试题目：24道二选一与可打印活动单", "24道原创朋友二选一，提供A4与Letter四页PDF：主持说明、题单、保密答案卡和好友猜测卡，附计分例子，也可在线出题。"] },
  "how-to-play": { en: ["How to Make, Share and Manage a Friendship Quiz", "Learn how to create a friendship quiz, share the invite, or join a friend’s quiz. Keep your private management key separate from the link you share."], zh: ["朋友默契怎么玩：出题、邀请、找回与管理", "了解如何出题、发邀请或参加好友的挑战，以及怎样分别保存好友链接和私人管理密钥。"] },
  scores: { en: ["Friendship Quiz Scores: Matches, Categories and Ties", "See a sample score for a 30-question friendship quiz. Learn how matches, incomplete rounds, the category radar and tied ranks work."], zh: ["朋友默契分数怎么看：猜中率、类别与并列榜单", "看 30 题的虚构分数示例，了解每题怎么算、缺答能否提交、六类雷达和榜单同分并列。"] },
} as const;
export type PageKind = keyof typeof pages;
