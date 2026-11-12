import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FriendshipClient from "@/components/friendship/FriendshipClient";
import { ResultView } from "@/components/friendship/ResultView";
import { CATEGORIES, streak, type Challenge, type Pack, type Progress, type Result } from "@/lib/friendship/core";

const mocks = vi.hoisted(() => ({ api: vi.fn(), grant: vi.fn() }));
vi.mock("@/lib/friendship/api", () => ({ friendshipApi: mocks.api, prepareFriendshipGrant: mocks.grant }));
vi.mock("@/lib/tracking/client", () => ({ trackClientEvent: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const questions = Object.keys(CATEGORIES).flatMap(category => Array.from({ length: 5 }, (_, i) => ({ id: `${category}-${i}`, category, en: { prompt: "Which would I pick?", options: ["First choice", "Second choice"] as [string, string] }, zh: { prompt: "我会选择？", options: ["第一项", "第二项"] as [string, string] } })));
const pack: Pack = { version: "test", categories: CATEGORIES, questions };
const challenge: Challenge = { id: "synthetic", nickname: "Creator", locale: "en", version: "test", questions, entries: [], closed: false, expires_at: "2027-01-01 00:00:00" };
let progress: Progress | null;
beforeEach(() => {
  localStorage.clear(); mocks.api.mockReset(); mocks.grant.mockReset(); progress = null;
  mocks.api.mockImplementation(async (path: string, method: string, data?: { nickname: string; index: number; guess: 0 | 1 }) => {
    if (path === "/catalog") return pack;
    if (path.endsWith("/result")) throw new Error("missing");
    if (path.endsWith("/progress")) { if (!progress) throw new Error("missing"); return progress; }
    if (path.endsWith("/answers") && method === "POST" && data) {
      const guesses = [...(progress?.guesses ?? []), data.guess];
      progress = { nickname: data.nickname, guesses, answers: guesses.map(() => 0), combo: 1, best_combo: 1 };
      return progress;
    }
    return challenge;
  });
});
afterEach(cleanup);

describe("friendship immediate feedback and result comparison", () => {
  it("commits a picked option before revealing it and locks it before the next question", async () => {
    render(<FriendshipClient locale="en" inviteId="synthetic" />);
    fireEvent.change(await screen.findByLabelText("Your nickname"), { target: { value: "Friend" } });
    fireEvent.click(screen.getByRole("button", { name: "Start guessing" }));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    await screen.findByText("You got it!");
    expect(mocks.api).toHaveBeenCalledWith("/challenges/synthetic/answers", "POST", { nickname: "Friend", index: 0, guess: 0 });
    expect(mocks.grant).toHaveBeenCalledWith("synthetic", "player");
    expect(screen.getAllByRole("radio").every(input => (input as HTMLInputElement).disabled)).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("radio").every(input => !(input as HTMLInputElement).disabled)).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getAllByRole("radio")[1]).toBeDisabled();
  });

  it("preserves a guess on transport failure and permits its exact retry without advancing", async () => {
    render(<FriendshipClient locale="en" inviteId="synthetic" />);
    fireEvent.change(await screen.findByLabelText("Your nickname"), { target: { value: "Friend" } });
    fireEvent.click(screen.getByRole("button", { name: "Start guessing" }));
    mocks.api.mockRejectedValueOnce(new Error("network"));
    fireEvent.click(screen.getAllByRole("radio")[1]);
    await screen.findByText("The connection failed. Your answers are still here. Please retry.");
    expect(screen.getAllByRole("radio")[1]).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Check guess" }));
    await screen.findByText("A new discovery!");
    expect(screen.getByText("FOOD · 1/30", { exact: false })).toBeTruthy();
  });

  it("restores server-committed progress for the same browser key", async () => {
    progress = { nickname: "Returning friend", guesses: [0, 1], answers: [0, 0], combo: 0, best_combo: 1 };
    localStorage.setItem("fm:friendship:player:synthetic", JSON.stringify({ key: "a".repeat(64), answers: Array(30).fill(null), index: 0, nickname: "Stale" }));
    render(<FriendshipClient locale="en" inviteId="synthetic" />);
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(2));
    expect(screen.queryByLabelText("Your nickname")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("radio")[0]);
    await screen.findByText("You got it!");
    expect(mocks.api).toHaveBeenCalledWith("/challenges/synthetic/answers", "POST", { nickname: "Returning friend", index: 2, guess: 0 });
    expect(mocks.grant).toHaveBeenCalledWith("synthetic", "player", { legacy: "a".repeat(64) });
    expect(JSON.parse(localStorage.getItem("fm:friendship:player:synthetic")!)).not.toHaveProperty("key");
  });

  it("keeps an old creator draft on migration failure and retries creation with the same identity", async () => {
    const key = "a".repeat(64);
    const ids = questions.map(question => question.id);
    const answers = questions.map(() => 0);
    const storage = "fm:friendship:draft:v1";
    const draft = { id: challenge.id, key, version: pack.version, ids, answers, seen: ids, nickname: "Creator", index: 29, contribute: false, mode: "creator" };
    localStorage.setItem(storage, JSON.stringify(draft));
    mocks.grant.mockRejectedValueOnce(new Error("network"));
    render(<FriendshipClient locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Resume" }));
    await screen.findByText("The connection failed. Your answers are still here. Please retry.");
    expect(JSON.parse(localStorage.getItem(storage)!)).toEqual(draft);

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    fireEvent.click(await screen.findByRole("button", { name: "Review answers" }));
    expect(mocks.grant).toHaveBeenNthCalledWith(2, challenge.id, "owner", { legacy: key, draft: true });
    expect(JSON.parse(localStorage.getItem(storage)!)).toMatchObject({ id: challenge.id, ids, answers });
    expect(JSON.parse(localStorage.getItem(storage)!)).not.toHaveProperty("key");

    const api = mocks.api.getMockImplementation()!;
    let firstCreate = true;
    mocks.api.mockImplementation((...args) => {
      if (args[0] === "/challenges" && args[1] === "POST" && firstCreate) {
        firstCreate = false;
        return Promise.reject(new DOMException("Timed out", "TimeoutError"));
      }
      return api(...args);
    });
    const create = screen.getByRole("button", { name: "Make my invite" });
    fireEvent.click(create);
    await screen.findByText("The connection failed. Your answers are still here. Please retry.");
    fireEvent.click(create);
    await screen.findByRole("heading", { name: "Creator’s friendship quiz" });
    const attempts = mocks.api.mock.calls.filter(call => call[0] === "/challenges" && call[1] === "POST");
    expect(attempts).toHaveLength(2);
    expect(attempts[0][2]).toMatchObject({ id: challenge.id, question_ids: ids, answers });
    expect(attempts[1][2]).toEqual(attempts[0][2]);
    expect(localStorage.getItem(storage)).toBeNull();
  });

  it("counts consecutive matches and keeps the best run after a miss", () => {
    expect(streak([0, 0, 1, 0], [0, 0, 0, 0])).toEqual({ combo: 1, best: 2 });
    expect(streak([], [])).toEqual({ combo: 0, best: 0 });
  });

  it.each(["en", "zh"] as const)("keeps a zero-match %s round honest and opens a real conversation without invented highlights", locale => {
    const result: Result = {
      id: "own", nickname: "Friend", correct: 0, total: questions.length, percent: 0,
      categories: Object.fromEntries(Object.keys(CATEGORIES).map(category => [category, { correct: 0, total: 5 }])),
      guesses: questions.map(() => 0), answers: questions.map(() => 1), preview: false, entries: [],
    };
    const { container } = render(<ResultView locale={locale} challenge={challenge} result={result} url="https://example.com/invite" />);
    expect(screen.getByRole("img", { name: locale === "zh" ? "猜中 0/30 题，0%" : "0/30 matches, 0%" })).toBeVisible();
    expect(screen.getByText(locale === "zh" ? "这次各类都还没猜中，可以从一个意外的答案聊起。" : "No category had a match this time. Start with one surprising answer.", { exact: true })).toBeVisible();
    expect(container.querySelector(".fq-result-head")).not.toHaveTextContent(/本次亮点|猜中率最高|Your highlights|Highest match rate|\(tied\)|（并列）/);
    const conversation = container.querySelector(".fq-conversation-example")!;
    expect(conversation).toBeVisible();
    expect(conversation.closest("details")).toBeNull();
    expect(conversation).toHaveTextContent(locale === "zh" ? "你猜的是：第一项" : "Your guess: First choice");
    expect(conversation).toHaveTextContent(locale === "zh" ? "朋友选的是：第二项" : "Their choice: Second choice");
    expect(conversation).toHaveTextContent(locale === "zh" ? "这是一道你们选择不同的题" : "one of the choices you did not guess");
  });

  it("shows a radar without inventing a comparison and adds one only for other visible entries", () => {
    const categories = Object.fromEntries(Object.keys(CATEGORIES).map(key => [key, { correct: 3, total: 5 }]));
    const result: Result = { id: "own", nickname: "Friend", correct: 18, total: 30, percent: 60, categories, answers: Array(30).fill(0), guesses: Array(30).fill(0), preview: false, entries: [], question_stats: questions.map(() => ({ correct: 0, total: 0 })) };
    const view = render(<ResultView locale="en" challenge={challenge} result={result} url="https://example.com/invite" />);
    expect(screen.getByRole("img", { name: /Six-category accuracy radar/ })).toBeInTheDocument();
    expect(screen.queryByText("Other visible entries’ average")).not.toBeInTheDocument();
    expect(screen.getAllByText("No other entries yet; no average to compare with.")).toHaveLength(6);
    view.rerender(<ResultView locale="en" challenge={challenge} result={{ ...result, entries: [{ id: "own", nickname: "Friend", correct: 18, categories, hidden: false }, { id: "other", nickname: "Other", correct: 18, categories, hidden: false }] }} url="https://example.com/invite" />);
    expect(screen.getByText("Other visible entries’ average")).toBeInTheDocument();
    expect(screen.getByText("Question-by-question accuracy · hardest first")).toBeInTheDocument();
    expect(screen.getAllByText("No visible completed entries yet")).toHaveLength(30);
  });
});
