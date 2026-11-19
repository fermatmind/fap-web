import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CareerRefundPanel } from "@/components/commerce/CareerRefundPanel";

vi.mock("@/lib/auth/fmToken", () => ({ getFmToken: () => "owner-token" }));
const paid = { currency: "CNY", amount_cents: 299, amount_refunded: 0, can_request: true, payment_state: "paid", request: null };
const pending = { ...paid, can_request: false, request: { id: "fixture", status: "pending", decision_note: null, reason_code: "other", detail: null } };
const fetchMock = vi.fn();
function reply(body: object, status = 200) { return { ok: status === 200, status, json: async () => body }; }

describe("Career94 customer refund requests", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", fetchMock); });

  it("requires acknowledgement and sends an owner-authenticated request without asking for an email or order number", async () => {
    fetchMock.mockResolvedValueOnce(reply(paid)).mockResolvedValueOnce(reply(pending));
    render(<CareerRefundPanel orderNo="ord_owned" locale="zh" />);
    fireEvent.click(await screen.findByRole("button", { name: "申请退款" }));
    expect(screen.queryByRole("textbox", { name: /邮箱/ })).not.toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "提交退款申请" });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(submit);
    expect(await screen.findByText("待审核")).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/career-assessment/orders/ord_owned/refund");
    expect(options.headers.Authorization).toBe("Bearer owner-token");
    expect(JSON.parse(options.body)).toEqual({ reason_code: "not_as_expected", detail: "", acknowledged: true });
    expect(screen.queryByRole("button", { name: "申请退款" })).not.toBeInTheDocument();
  });

  it("allows withdrawal before approval and shows the result", async () => {
    fetchMock.mockResolvedValueOnce(reply(pending)).mockResolvedValueOnce(reply({ ...pending, can_request: true, request: { ...pending.request, status: "withdrawn" } }));
    render(<CareerRefundPanel orderNo="ord_owned" locale="zh" />);
    fireEvent.click(await screen.findByRole("button", { name: "撤回申请" }));
    expect(await screen.findByText("申请已撤回")).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
  });

  it("shows actual refunded amount and removes premium access through the saved-result callback", async () => {
    fetchMock.mockResolvedValueOnce(reply({ ...pending, payment_state: "refunded", amount_refunded: 297 }));
    const onRefunded = vi.fn();
    render(<CareerRefundPanel orderNo="ord_owned" locale="en" onRefunded={onRefunded} />);
    expect(await screen.findByText("Refunded · CNY 2.97")).toBeInTheDocument();
    await waitFor(() => expect(onRefunded).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "Request a refund" })).not.toBeInTheDocument();
  });

  it("does not expose a refund form for unsupported or unowned orders", async () => {
    fetchMock.mockResolvedValueOnce(reply({}, 404));
    const { container } = render(<CareerRefundPanel orderNo="ord_other" locale="zh" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
