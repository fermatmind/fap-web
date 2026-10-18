import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SupportCenter, type SupportCenterProps } from "@/components/support/SupportCenter";
import { helpQuestionsFromCms, matchesHelpSearch } from "@/lib/support/helpCenter";

function props(locale: "zh" | "en" = "en"): SupportCenterProps {
  return {
    locale,
    title: "Support & Trust Center",
    tools: [
      { key: "order_lookup", label: "Order lookup", href: `/${locale}/orders/lookup`, kind: "formal_entry" },
      { key: "email_preferences", label: "Email preferences", href: `/${locale}/email/preferences`, kind: "formal_entry" },
    ],
    entries: [
      { key: "saved", title: "Saved results", summary: "Use your saved email", href: `/${locale}/results/lookup`, topic: "results", kind: "tool" },
      { key: "order_lookup", title: "Order lookup", summary: "订单查询", href: `/${locale}/orders/lookup`, topic: "orders", kind: "tool" },
      { key: "faq", title: "Common questions", summary: "Published help", href: `/${locale}/help/faq`, topic: "all", kind: "article" },
      { key: "business", title: "Business & research", summary: "Voluntary use", href: `/${locale}/help/for-business-and-research`, topic: "business", kind: "article" },
      { key: "team", title: "Team information", summary: "People behind the service", href: `/${locale}/help/team`, topic: "all", kind: "article" },
    ],
    questions: [
      { key: "delivery", question: "Where is my paid report?", answer: "Use order lookup to check delivery.", topic: "orders" },
      { key: "email", question: "How do email links work?", answer: "Use the personal link in your email.", topic: "email" },
    ],
    contactHref: `/${locale}/help/contact`,
    contactLabel: "Contact support",
    contactLink: <a href="mailto:fixture@example.test">fixture@example.test</a>,
  };
}

describe("support center local interactions", () => {
  it("matches casing, width-normalized text, whitespace and Chinese without network search", () => {
    expect(matchesHelpSearch("  ＲＥＰＯＲＴ  ", "Your report is ready")).toBe(true);
    expect(matchesHelpSearch("订单", "订单查询")).toBe(true);
    expect(matchesHelpSearch("report delivery", "Report", "Check delivery")).toBe(true);
    expect(matchesHelpSearch("report missing", "Report delivery")).toBe(false);
    expect(matchesHelpSearch("  ", "anything")).toBe(true);
  });

  it("extracts only visible CMS question prose and has no authored fallback FAQ", () => {
    const questions = helpQuestionsFromCms({
      contentMd: "## Common questions\n\n### Where is my report?\n\nCheck your order.\n\n## Another section\nDo not append this.",
      faqItems: [],
    });
    expect(questions).toEqual([{ key: "cms-faq-0", question: "Where is my report?", answer: "Check your order.", topic: "results" }]);
    expect(helpQuestionsFromCms(null)).toEqual([]);
    expect(helpQuestionsFromCms({ contentMd: "No questions published", faqItems: [{ question: "Unpublished?", answer: "Unpublished answer" }] })).toEqual([]);
  });

  it("searches CMS answers, opens them and restores the list when cleared", () => {
    render(<SupportCenter {...props()} />);
    const search = screen.getByRole("searchbox", { name: "Search this help center" });
    fireEvent.change(search, { target: { value: " DELIVERY " } });
    expect(screen.getByRole("status")).toHaveTextContent("1 relevant help item");
    expect(screen.queryByRole("button", { name: /How do email links work/ })).not.toBeInTheDocument();
    const question = screen.getByRole("button", { name: /Where is my paid report/ });
    expect(question).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Use order lookup to check delivery.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(search).toHaveValue("");
    expect(screen.getByRole("button", { name: /How do email links work/ })).toBeVisible();
    fireEvent.change(search, { target: { value: "team" } });
    expect(screen.getByRole("link", { name: /Team information/ })).toHaveAttribute("href", "/en/help/team");
  });

  it("filters topics and retains distinct saved-result and order destinations", () => {
    render(<SupportCenter {...props()} />);
    fireEvent.click(screen.getByRole("button", { name: "Results & reports" }));
    const content = screen.getByTestId("support-topic-groups");
    expect(within(content).getByRole("link", { name: "Saved results" })).toHaveAttribute("href", "/en/results/lookup");
    expect(within(content).getByRole("link", { name: "Order lookup" })).toHaveAttribute("href", "/en/orders/lookup");
    expect(within(content).getByRole("button", { name: /Where is my paid report/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "All help" }));
    expect(within(content).getByRole("link", { name: "Order lookup" })).toHaveAttribute("href", "/en/orders/lookup");
    expect(screen.getByRole("link", { name: "fixture@example.test" })).toHaveAttribute("href", "mailto:fixture@example.test");
  });

  it.each([
    ["zh", "结果与报告", "支付完成后如何获取报告？"],
    ["en", "Results & reports", "How do I get my report after payment?"],
  ] as const)("keeps the published %s paid-report answer in results and orders", (locale, label, question) => {
    const candidate = props(locale);
    candidate.questions = helpQuestionsFromCms({ contentMd: `### ${question}\n\nUse order lookup.`, faqItems: [] });
    expect(candidate.questions[0].topic).toBe("orders");
    render(<SupportCenter {...candidate} />);
    const content = screen.getByTestId("support-topic-groups");
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(within(content).getByRole("button", { name: question })).toBeVisible();
    expect(within(content).getByRole("link", { name: "Order lookup" })).toHaveAttribute("href", `/${locale}/orders/lookup`);
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "订单与支付" : "Orders & payments" }));
    expect(within(content).getByRole("button", { name: question })).toBeVisible();
    expect(within(content).queryByRole("link", { name: "Saved results" })).not.toBeInTheDocument();
  });

  it("announces no matches and lets a user recover without leaving the page", () => {
    render(<SupportCenter {...props()} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "no-such-help-84921" } });
    expect(screen.getByRole("status")).toHaveTextContent("0 relevant help items");
    expect(screen.getByTestId("support-search-empty")).toBeVisible();
    expect(screen.getByRole("link", { name: "Contact details" })).toHaveAttribute("href", "/en/help/contact");
    fireEvent.click(screen.getByRole("button", { name: "View all help" }));
    expect(screen.queryByTestId("support-search-empty")).not.toBeInTheDocument();
    expect(search).toHaveValue("");
  });

  it("supports Chinese search across text and topic labels, then resets with Escape", () => {
    render(<SupportCenter {...props("zh")} />);
    const search = screen.getByRole("searchbox", { name: "搜索本页帮助" });
    fireEvent.change(search, { target: { value: "订单" } });
    expect(screen.getByRole("status")).toHaveTextContent("2 条相关帮助");
    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
    expect(screen.getByRole("link", { name: /找回已保存的结果/ })).toHaveAttribute("href", "/zh/results/lookup");
  });
});
