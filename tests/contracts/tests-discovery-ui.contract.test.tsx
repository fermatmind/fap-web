import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreTests } from "@/components/entertainment/MoreTests";
import questionnaires from "@/lib/questionnaires/catalog.json";
import editorial from "@/components/tests/discovery-card-editorial.json";
import { directoryQuizzes } from "@/lib/entertainment/directory";

describe("shared discovery directory", () => {
  it("has an explicit bilingual subtitle and illustration plan for each current identity", () => {
    const expected = [
      "friendship-quiz",
      ...questionnaires.map((q) => q.slug),
      ...directoryQuizzes
        .filter((q) => !questionnaires.some((native) => native.slug === q.slug))
        .map((q) => q.slug),
    ];
    expect(Object.keys(editorial).sort()).toEqual(expected.sort());
    for (const entry of Object.values(editorial)) {
      expect(entry.subtitle.zh.trim().length).toBeGreaterThan(3);
      expect(entry.subtitle.en.trim().length).toBeGreaterThan(3);
    }
  });
  it("retains every catalog identity and real destination, filters and recovers from an empty search", () => {
    const { container } = render(<MoreTests locale="zh" />);
    const count =
      1 +
      questionnaires.length +
      directoryQuizzes.filter(
        (item) => !questionnaires.some((native) => native.slug === item.slug),
      ).length;
    expect(container.querySelectorAll("article")).toHaveLength(count);
    expect(
      container.querySelectorAll(".catalog-discovery-art svg"),
    ).toHaveLength(count);
    expect(container.querySelectorAll(".catalog-item-start")).toHaveLength(
      count,
    );
    expect(container.querySelectorAll(".catalog-item-subtitle")).toHaveLength(
      count,
    );
    expect(container.querySelectorAll(".catalog-item details")).toHaveLength(0);
    const art = Array.from(
      container.querySelectorAll(".catalog-discovery-art"),
    );
    expect(
      new Set(art.map((node) => node.getAttribute("data-art-id"))).size,
    ).toBe(count);
    expect(
      new Set(art.map((node) => node.getAttribute("data-composition"))).size,
    ).toBe(count);
    expect(
      new Set(art.map((node) => node.querySelector("svg")!.innerHTML)).size,
    ).toBe(count);
    for (const card of container.querySelectorAll(".catalog-item")) {
      expect(card.querySelector("h4 a")?.getAttribute("href")).toBe(
        card.querySelector(".catalog-item-start")?.getAttribute("href"),
      );
    }
    expect(
      container.querySelector(
        'a.catalog-item-start[href="/zh/tests/explore/typing-speed"]',
      )?.textContent,
    ).toContain("打开工具");
    expect(
      container.querySelector(
        'a.catalog-item-start[href="/zh/tests/explore/caliper-style-assessment-test"]',
      )?.textContent,
    ).toContain("开始测试");
    for (const quiz of questionnaires) {
      expect(
        container.querySelector(
          `h4 a[href="/zh/tests/${quiz.collection}/${quiz.slug}"]`,
        ),
      ).not.toBeNull();
    }
    const search = screen.getByRole("searchbox", { name: "搜索测试" });
    fireEvent.change(search, { target: { value: "打字速度" } });
    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(
      within(container.querySelector("article")!).getByRole("heading")
        .textContent,
    ).toContain("打字速度");
    expect(container.textContent).toContain("每轮60秒");
    fireEvent.change(search, { target: { value: "四学院的同人选择" } });
    expect(container.querySelectorAll("article")).toHaveLength(1);
    expect(container.querySelector("h4")?.textContent).toContain("霍格沃茨");
    fireEvent.change(search, { target: { value: "unmatched-topic-123456" } });
    expect(container.querySelectorAll("article")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
    expect(container.querySelectorAll("article")).toHaveLength(count);
    fireEvent.click(screen.getByRole("button", { name: /^幻想与故事/ }));
    expect(container.querySelectorAll("article")).toHaveLength(
      questionnaires.filter((quiz) => quiz.category === "fantasy").length +
        directoryQuizzes.filter(
          (quiz) =>
            quiz.category === "fantasy" &&
            !questionnaires.some((native) => native.slug === quiz.slug),
        ).length,
    );
  });
});
