"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { apiClient } from "@/lib/api-client";

type EmailCaptureFormProps = {
  attemptId: string;
};

type SubmitState = "idle" | "loading" | "success" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function EmailCaptureForm({ attemptId }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const isDisabled = state === "loading" || state === "success";

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (state === "error") {
      setState("idle");
      setMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setState("error");
      setMessage("请输入有效邮箱");
      return;
    }

    setState("loading");
    setMessage("Submitting...");

    try {
      await apiClient.post("/v0.3/leads", { email: normalizedEmail, attemptId });
      setEmail(normalizedEmail);
      setState("success");
      setMessage("提交成功，我们会把结果发送到你的邮箱。");
    } catch {
      setState("error");
      setMessage("提交失败，请稍后重试。");
    }
  };

  return (
    <section
      style={{
        marginTop: 24,
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 20,
        background: "#ffffff",
        display: "grid",
        gap: 12,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>Get your full report</h2>
      <p style={{ margin: 0, color: "#475569" }}>
        输入邮箱后，我们会把完整分析发送给你。
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isDisabled}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            padding: "10px 12px",
            color: "#0f172a",
          }}
        />
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            width: "fit-content",
            border: "1px solid #0f172a",
            borderRadius: 10,
            background: isDisabled ? "#f8fafc" : "#0f172a",
            color: isDisabled ? "#94a3b8" : "#ffffff",
            padding: "10px 14px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {state === "loading" ? "Submitting..." : "Submit"}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          minHeight: 20,
          color: state === "error" ? "#dc2626" : state === "success" ? "#16a34a" : "#475569",
        }}
      >
        {message}
      </p>
    </section>
  );
}
