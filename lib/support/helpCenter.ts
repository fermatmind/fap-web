import type { AnswerFaqBlockViewModel } from "@/lib/answer/answerSurface";
import type { ContentPage } from "@/lib/cms/content-pages";

export type HelpTopic = "all" | "results" | "orders" | "email" | "assessments" | "privacy" | "business";

export type HelpEntry = {
  key: string;
  title: string;
  summary: string;
  href: string;
  topic: HelpTopic;
  kind: "article" | "guide" | "tool";
};

export type HelpQuestion = {
  key: string;
  question: string;
  answer: string;
  topic: HelpTopic;
};

// Display grouping only: it never changes content, identifiers, links or permissions.
export function helpTopicFor(value: string): HelpTopic {
  if (/privacy|data|隐私|数据|个人信息/i.test(value)) return "privacy";
  if (/email|unsubscribe|邮件|退订/i.test(value)) return "email";
  if (/payment|refund|order|purchase|支付|退款|订单|购买/i.test(value)) return "orders";
  if (/business|research|企业|研究|机构/i.test(value)) return "business";
  if (/result|report|recover|结果|报告|找回/i.test(value)) return "results";
  if (/assessment|interpret|science|method|测评|解读|方法/i.test(value)) return "assessments";
  return "all";
}

// A paid report spans two tasks: delivery belongs to orders, but users also
// need to find it while browsing results. Keep both destinations discoverable.
export function matchesHelpTopic(selected: HelpTopic, primary: HelpTopic, title: string, href = ""): boolean {
  if (selected === "all" || selected === primary) return true;
  return selected === "results" && (/report|报告/i.test(title) || /\/orders\/lookup\/?$/.test(href));
}

export function normalizeHelpSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

export function matchesHelpSearch(query: string, ...fields: string[]): boolean {
  const words = normalizeHelpSearch(query).split(" ").filter(Boolean);
  const text = normalizeHelpSearch(fields.join(" "));
  return words.every((word) => text.includes(word));
}

// Published CMS prose remains the authority. Extract the visible H3 question sections
// when the page does not supply structured FAQs; do not invent fallback answers.
export function helpQuestionsFromCms(
  page: Pick<ContentPage, "contentMd" | "faqItems"> | null,
  gatewayQuestions: AnswerFaqBlockViewModel[] = [],
): HelpQuestion[] {
  const validGatewayQuestions = gatewayQuestions.filter((item) => item.question && item.answer);
  if (validGatewayQuestions.length) {
    return validGatewayQuestions.map((item) => ({
      ...item,
      topic: helpTopicFor(item.question),
    }));
  }

  if (!page) return [];

  const visibleText = normalizeHelpSearch(page.contentMd);
  const visibleStructured = page.faqItems.filter((item) => item.question && item.answer
    && visibleText.includes(normalizeHelpSearch(item.question))
    && visibleText.includes(normalizeHelpSearch(item.answer)));
  if (visibleStructured.length) return visibleStructured.map((item, index) => ({
    ...item, key: `cms-faq-${index}`, topic: helpTopicFor(item.question),
  }));

  const sections = page.contentMd.replace(/\r\n?/g, "\n").split(/^###\s+/m).slice(1);
  return sections.flatMap((section, index) => {
    const [question = "", ...lines] = section.split("\n");
    const answer = lines.join("\n").split(/^##\s+/m)[0].trim();
    if (!question.trim() || !answer) return [];
    return [{ key: `cms-faq-${index}`, question: question.trim(), answer, topic: helpTopicFor(question) }];
  });
}
