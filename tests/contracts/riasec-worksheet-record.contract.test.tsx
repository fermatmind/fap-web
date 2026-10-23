import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { trackCareerToolEvent } from "@/lib/career/toolTracking";
import { RiasecWorksheet } from "@/components/marketing/RiasecWorksheet";
import { copyWorksheet, emptyWorksheet, markdownLiteral, serializeWorksheet, WORKSHEET_FIELDS } from "@/lib/marketing/riasecWorksheetRecord";

vi.mock("@/lib/career/toolTracking", () => ({ trackCareerToolEvent: vi.fn() }));

const original = '  C2-QA-本人 e\u0301 👩🏽‍🔬\n| [x](javascript:alert(1)) <img src=x onerror=alert(1)> & " \' \\ $\n```\n```````\n最后一行  \n';
function field(id: string) { return document.querySelector<HTMLTextAreaElement>(`[data-worksheet-field="${id}"]`)!; }

describe("worksheet output fidelity", () => {
  it.each(["zh", "en"] as const)("retains every optional field including empty values and exact Unicode in %s text", locale => {
    const record = emptyWorksheet();
    for (const [index, [id]] of WORKSHEET_FIELDS.entries()) record[id] = index === 0 ? "" : `${id}-${original}`;
    const text = serializeWorksheet(record, locale, "text");
    for (const [id] of WORKSHEET_FIELDS) if (record[id]) expect(text).toContain(record[id]);
    expect(text).not.toContain("&lt;");
    expect(text).not.toContain("\\|");
    expect(text).not.toContain("é");
    expect(text).toContain(locale === "zh" ? "本人探索记录" : "My exploration record");
    expect(serializeWorksheet(record, locale, "text", true)).toContain(locale === "zh" ? "不是本人记录" : "not my record");
  });
  it("serializes hostile Markdown as one literal block, including fences, HTML, links, blank lines and trailing spaces", () => {
    const block = markdownLiteral(original);
    const lines = block.split("\n");
    expect(lines[0]).toBe("````````");
    expect(lines.at(-1)).toBe(lines[0]);
    expect(lines.slice(1, -1).join("\n")).toBe(original);
    expect(lines.slice(1, -1).some(line => new RegExp(`^ {0,3}${lines[0]}+ *$`).test(line))).toBe(false);
    expect(markdownLiteral("")).toBe("```\n\n```");
    expect(markdownLiteral("`x` ".repeat(150_000))).toContain("`x` `x`");
  });
  it("does not report copy success until writeText resolves", async () => {
    let resolve!: () => void;
    const writeText = vi.fn(() => new Promise<void>(done => { resolve = done; }));
    let done = false;
    const result = copyWorksheet(original, { writeText }).then(value => { done = true; return value; });
    await Promise.resolve(); expect(done).toBe(false);
    expect(writeText).toHaveBeenCalledWith(original);
    resolve(); expect(await result).toBe("success");
  });
  it.each([["NotAllowedError", "denied"], ["SecurityError", "denied"], ["AbortError", "cancelled"], ["UnknownError", "failed"]])("distinguishes clipboard %s", async (name, outcome) => {
    expect(await copyWorksheet(original, { writeText: vi.fn().mockRejectedValue(new DOMException("synthetic failure", name)) })).toBe(outcome);
    expect(await copyWorksheet(original)).toBe("unsupported");
  });
});

describe.each(["zh", "en"] as const)("worksheet state and safety: %s", locale => {
  it("keeps server-rendered inputs and output actions disabled until handlers are ready", () => {
    const server = new DOMParser().parseFromString(renderToStaticMarkup(<RiasecWorksheet locale={locale} />), "text/html");
    expect(server.querySelector("[data-worksheet-ready]")?.getAttribute("data-worksheet-ready")).toBe("false");
    expect(server.querySelectorAll("[data-worksheet-field]")).toHaveLength(25);
    for (const input of server.querySelectorAll("[data-worksheet-field]")) expect(input.closest("fieldset")?.hasAttribute("disabled")).toBe(true);
    for (const control of server.querySelectorAll("button, select")) expect(control.hasAttribute("disabled")).toBe(true);
    expect(server.body.textContent).toContain(locale === "zh" ? "工作表正在加载" : "worksheet is loading");
    render(<RiasecWorksheet locale={locale} />);
    expect(field("experiment")).toBeEnabled();
    expect(screen.getByRole("button", { name: /复制当前记录|Copy current record/ })).toBeEnabled();
  });
  it("preserves my entries across example and label language switches; cancelled clear retains them", () => {
    render(<RiasecWorksheet locale={locale} />);
    expect(document.querySelectorAll("[data-worksheet-field]")).toHaveLength(25);
    fireEvent.change(field("experiment"), { target: { value: original } });
    fireEvent.click(screen.getByRole("button", { name: /查看合成填写示例|View a synthetic example/ }));
    expect(field("experiment").readOnly).toBe(true);
    expect(field("experiment").value).not.toBe(original);
    fireEvent.change(screen.getByRole("combobox", { name: /工作表语言|Worksheet language/ }), { target: { value: locale === "zh" ? "en" : "zh" } });
    fireEvent.click(screen.getByRole("button", { name: /返回本人记录|Return to my record/ }));
    expect(field("experiment").value).toBe(original);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: /清除本人记录|Clear my record/ }));
    expect(field("experiment").value).toBe(original);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: /清除本人记录|Clear my record/ }));
    expect(field("experiment").value).toBe("");
  });
  it("renders user HTML literally and prints complete multiline values without creating elements", () => {
    render(<RiasecWorksheet locale={locale} />);
    fireEvent.change(field("experiment"), { target: { value: original } });
    expect(document.querySelector('[data-print-field="experiment"]')!.textContent).toBe(original);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByRole("textbox", { name: /可手选的完整输出|Complete output/ })).toHaveValue(serializeWorksheet({ ...emptyWorksheet(), experiment: original }, locale, "text"));
    expect(window.location.search).toBe("");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
  it("retains text and offers a focused selectable fallback on rejected clipboard permission", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")) } });
    render(<RiasecWorksheet locale={locale} />);
    fireEvent.change(field("experiment"), { target: { value: original } });
    fireEvent.click(screen.getByRole("button", { name: /复制当前记录|Copy current record/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/权限被拒绝|permission was denied/));
    const fallback = screen.getByRole("textbox", { name: /可手选的完整输出|Complete output/ }) as HTMLTextAreaElement;
    expect(fallback).toHaveFocus();
    expect(fallback.selectionEnd - fallback.selectionStart).toBe(fallback.value.length);
    expect(vi.mocked(trackCareerToolEvent).mock.calls.map(([name]) => name)).not.toContain("career_worksheet_copy_succeeded");
    expect(field("experiment").value).toBe(original);
  });
  it("keeps an edited record when download cannot start and selects the fallback", () => {
    const create = vi.fn(() => { throw new Error("synthetic download failure"); });
    const previous = URL.createObjectURL;
    URL.createObjectURL = create;
    try {
      render(<RiasecWorksheet locale={locale} />);
      fireEvent.change(field("experiment"), { target: { value: original } });
      fireEvent.click(screen.getByRole("button", { name: /下载当前记录|Download current record/ }));
      expect(screen.getByRole("status")).toHaveTextContent(/下载未能启动|Download could not start/);
      expect(vi.mocked(trackCareerToolEvent).mock.calls.map(([name]) => name)).not.toContain("career_worksheet_download_requested");
      expect(field("experiment").value).toBe(original);
      expect(screen.getByRole("textbox", { name: /可手选的完整输出|Complete output/ })).toHaveFocus();
    } finally { URL.createObjectURL = previous; }
  });
  it("does not label new edits as copied when an older clipboard request resolves", async () => {
    let resolve!: () => void;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn(() => new Promise<void>(done => { resolve = done; })) } });
    render(<RiasecWorksheet locale={locale} />);
    fireEvent.change(field("experiment"), { target: { value: original } });
    fireEvent.click(screen.getByRole("button", { name: /复制当前记录|Copy current record/ }));
    fireEvent.change(field("experiment"), { target: { value: "new edit" } });
    expect(screen.getByRole("button", { name: /正在复制|Copying/ })).toBeDisabled();
    resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: /复制当前记录|Copy current record/ })).toBeEnabled());
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(field("experiment").value).toBe("new edit");
  });
  it("keeps tool stages distinct, excludes examples, and sends no entered text", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(<RiasecWorksheet locale={locale} />);
    fireEvent.focus(field("experiment"));
    fireEvent.change(field("experiment"), { target: { value: original } });
    fireEvent.change(field("next"), { target: { value: "private next step" } });
    fireEvent.click(screen.getByRole("button", { name: /复制当前记录|Copy current record/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/已复制|Copied/));
    const calls = vi.mocked(trackCareerToolEvent).mock.calls;
    expect(calls.map(([name]) => name)).toEqual(["career_worksheet_entered", "career_worksheet_started", "career_worksheet_output_requested", "career_worksheet_copy_succeeded"]);
    expect(new Set(calls.map(([, payload]) => payload.toolRunId)).size).toBe(1);
    expect(JSON.stringify(calls)).not.toContain("private next step");
    expect(JSON.stringify(calls)).not.toContain("C2-QA");
    expect(calls[2][1]).toEqual({ locale, toolRunId: expect.any(String), outputFormat: "text" });
    fireEvent.click(screen.getByRole("button", { name: /查看合成填写示例|View a synthetic example/ }));
    fireEvent.click(screen.getByRole("button", { name: /复制当前记录|Copy current record/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/已复制|Copied/));
    expect(trackCareerToolEvent).toHaveBeenCalledTimes(4);
  });
  it("guards refresh and cancelled navigation; print request does not claim saving", () => {
    render(<RiasecWorksheet locale={locale} />);
    fireEvent.change(field("experiment"), { target: { value: original } });
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload); expect(unload.defaultPrevented).toBe(true);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const link = document.createElement("a"); link.href = "/somewhere-else"; document.body.append(link);
    expect(link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(false);
    confirm.mockClear();
    link.addEventListener("click", event => event.preventDefault());
    for (const modifier of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }]) {
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...modifier }));
      expect(confirm).not.toHaveBeenCalled();
    }
    link.remove();
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: /打印当前记录|Print current record/ }));
    expect(print).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent(/取消不会完成保存|Cancelling does not save/);
    expect(field("experiment").value).toBe(original);
  });
});
