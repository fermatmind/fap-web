import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("site footer routing contract", () => {
  it("keeps english footer structure aligned while exposing only authority-backed company links", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter />
      </LocaleProvider>
    );

    expect(screen.getByTestId("site-footer-group-tests")).toHaveTextContent("Top tests");
    expect(screen.getByTestId("site-footer-group-articles")).toHaveTextContent("Articles & Insights");
    expect(screen.getByTestId("site-footer-group-methods")).toHaveTextContent("Research & Methods");
    expect(screen.getByTestId("site-footer-group-company")).toHaveTextContent("Company");
    expect(screen.getByTestId("site-footer-group-policies")).toHaveTextContent("Terms & policies");
    expect(screen.getByRole("link", { name: "Assessment science" })).toHaveAttribute("href", "/en/science");
    expect(screen.getByRole("link", { name: "Method boundaries" })).toHaveAttribute("href", "/en/method-boundaries");
    expect(screen.getByRole("link", { name: "Item design notes" })).toHaveAttribute("href", "/en/item-design-notes");
    expect(screen.getByRole("link", { name: "Reliability & validity" })).toHaveAttribute("href", "/en/reliability-validity");
    expect(screen.getByRole("link", { name: "Data notes" })).toHaveAttribute("href", "/en/data-privacy");
    expect(screen.getByRole("link", { name: "Common misconceptions" })).toHaveAttribute("href", "/en/common-misconceptions");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/en/about");
    expect(screen.getByRole("link", { name: "Careers" })).toHaveAttribute("href", "/en/careers");
    expect(screen.queryByRole("link", { name: "Terms of use" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Privacy policy" })).not.toBeInTheDocument();
  });

  it("keeps chinese footer structure aligned while suppressing known missing policy links", () => {
    render(
      <LocaleProvider locale="zh">
        <SiteFooter />
      </LocaleProvider>
    );

    expect(screen.getByTestId("site-footer-group-tests")).toHaveTextContent("热门测评");
    expect(screen.getByTestId("site-footer-group-articles")).toHaveTextContent("文章与洞察");
    expect(screen.getByTestId("site-footer-group-methods")).toHaveTextContent("研究与方法");
    expect(screen.getByTestId("site-footer-group-company")).toHaveTextContent("公司");
    expect(screen.getByTestId("site-footer-group-policies")).toHaveTextContent("条款与政策");
    expect(screen.getByRole("link", { name: "测评科学" })).toHaveAttribute("href", "/zh/science");
    expect(screen.getByRole("link", { name: "方法边界" })).toHaveAttribute("href", "/zh/method-boundaries");
    expect(screen.getByRole("link", { name: "题目设计说明" })).toHaveAttribute("href", "/zh/item-design-notes");
    expect(screen.getByRole("link", { name: "信度效度" })).toHaveAttribute("href", "/zh/reliability-validity");
    expect(screen.getByRole("link", { name: "数据说明" })).toHaveAttribute("href", "/zh/data-privacy");
    expect(screen.getByRole("link", { name: "常见误区" })).toHaveAttribute("href", "/zh/common-misconceptions");
    expect(screen.getByRole("link", { name: "关于我们" })).toHaveAttribute("href", "/zh/about");
    expect(screen.getByRole("link", { name: "品牌" })).toHaveAttribute("href", "/zh/brand");
    expect(screen.getByRole("link", { name: "宪章" })).toHaveAttribute("href", "/zh/charter");
    expect(screen.getByRole("link", { name: "公共利益" })).toHaveAttribute("href", "/zh/foundation");
    expect(screen.getByRole("link", { name: "工作机会" })).toHaveAttribute("href", "/zh/careers");
    expect(screen.getByRole("link", { name: "政策概览" })).toHaveAttribute("href", "/zh/policies");
    expect(screen.queryByRole("link", { name: "使用条款" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "隐私政策" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "其他政策" })).not.toBeInTheDocument();
  });
});
