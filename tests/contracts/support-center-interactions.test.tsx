import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SupportCenter, type SupportCenterProps } from "@/components/support/SupportCenter";
import { helpQuestionsFromCms, matchesHelpSearch } from "@/lib/support/helpCenter";
import TraditionalSupportPage, { generateMetadata as generateSupportMetadata } from "@/app/(traditional)/zh-TW/support/page";
import { apiClient } from "@/lib/api-client";
import { traditionalEquivalent } from "@/lib/i18n/traditionalRoutes";

vi.mock("@/lib/api-client", async original => ({
  ...await original<typeof import("@/lib/api-client")>(), apiClient: { get: vi.fn() },
}));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));


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

describe("Taiwan Traditional support", () => {
  function gateway(locale = "zh-TW", orderHref = "/zh/orders/lookup") {
    return {
      ok: true, locale,
      landing_surface_v1: {
        entry_surface: "help_hub", primary_content_ref: "help_home", indexability_state: "noindex",
        summary_blocks: [{ key: "help_home", title: "支援與信任中心", body: "找回報告與資料說明。" }],
        discoverability_items: ["faq", "about", "team", "used-and-mentioned", "for-business-and-research", "contact"].map(slug => ({
          key: slug, href: `/zh/help/${slug}`, title: slug === "contact" ? "聯絡支援" : "費馬測試說明", summary: "相關說明。",
        })),
        cta_bundle: [
          { key: "order_lookup", label: "訂單查詢", href: orderHref },
          { key: "email_preferences", label: "電子郵件偏好", href: "/zh/email/preferences" },
          { key: "unsubscribe", label: "取消訂閱電子郵件", href: "/zh/email/unsubscribe" },
          { key: "privacy_data", label: "隱私權與資料說明", href: "/zh/privacy" },
        ],
      },
    };
  }

  it("renders exact gateway and CMS content with safe available destinations", async () => {
    vi.mocked(apiClient.get).mockImplementation(async url => {
      if (url.includes("public-gateways")) return gateway();
      const slug = url.includes("help-faq") ? "help-faq" : "help-contact";
      return { ok: true, page: {
        slug, locale: "zh-TW", status: "published", is_public: true, title: "費馬測試支援",
        content_md: "### 付款完成後如何取得報告？\n\n請進入訂單查詢。",
        support_contact: "support@example.test",
      } };
    });
    const metadata = await generateSupportMetadata();
    expect(metadata).toMatchObject({ title: "支援與信任中心", robots: { index: false }, alternates: { canonical: "/zh-TW/support" } });
    render(await TraditionalSupportPage());
    expect(apiClient.get).toHaveBeenCalledWith("/v0.3/public-gateways/help?locale=zh-TW",
      expect.objectContaining({ headers: { "X-FAP-Locale": "zh-TW" } }));
    expect(screen.getByRole("heading", { name: "支援與信任中心" })).toBeVisible();
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.getAllByRole("link", { name: /找回已儲存的結果/ })[0]).toHaveAttribute("href", "/zh-TW/results/lookup");
    expect(screen.getAllByRole("link", { name: /訂單查詢/ })[0]).toHaveAttribute("href", "/zh-TW/orders/lookup");
    expect(screen.getAllByRole("link", { name: /電子郵件偏好/ })[0]).toHaveAttribute("href", "/zh-TW/email/preferences");
    expect(screen.getByRole("link", { name: "support@example.test" })).toHaveAttribute("href", "mailto:support@example.test");
    expect(traditionalEquivalent("/zh-TW/support")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "結果與報告" }));
    const question = screen.getByRole("button", { name: "付款完成後如何取得報告？" });
    fireEvent.click(question);
    expect(screen.getByText("請進入訂單查詢。")).toBeVisible();
    const search = screen.getByRole("searchbox", { name: "搜尋本頁說明" });
    fireEvent.change(search, { target: { value: "沒有這個關鍵字" } });
    expect(screen.getByTestId("support-search-empty")).toBeVisible();
    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
  });

  it("rejects wrong-locale or out-of-scope gateway responses and preserves outage errors", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(gateway("zh-CN")).mockResolvedValueOnce(gateway("zh-TW", "/zh/account"))
      .mockRejectedValueOnce(new Error("API_UNAVAILABLE"));
    await expect(generateSupportMetadata()).rejects.toThrow("NOT_FOUND");
    await expect(generateSupportMetadata()).rejects.toThrow("NOT_FOUND");
    await expect(generateSupportMetadata()).rejects.toThrow("API_UNAVAILABLE");
  });
});
