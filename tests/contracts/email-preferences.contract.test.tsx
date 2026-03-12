import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmailPreferencesPage from "@/app/(localized)/[locale]/email/preferences/page";
import EmailUnsubscribePage from "@/app/(localized)/[locale]/email/unsubscribe/page";
import { EmailPreferencesClient } from "@/components/email/EmailPreferencesClient";
import { EmailUnsubscribeClient } from "@/components/email/EmailUnsubscribeClient";
import { ApiError } from "@/lib/api-client";
import { getDictSync } from "@/lib/i18n/getDict";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const hoisted = vi.hoisted(() => ({
  getEmailPreferences: vi.fn(),
  updateEmailPreferences: vi.fn(),
  unsubscribeEmail: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getEmailPreferences: hoisted.getEmailPreferences,
    updateEmailPreferences: hoisted.updateEmailPreferences,
    unsubscribeEmail: hoisted.unsubscribeEmail,
  };
});

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

describe("Email preferences and unsubscribe contract", () => {
  const dict = getDictSync("en");

  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.getEmailPreferences.mockResolvedValue({
      ok: true,
      email_masked: "b***@example.com",
      preferences: {
        marketing_updates: true,
        report_recovery: true,
        product_updates: false,
      },
    });
    hoisted.updateEmailPreferences.mockResolvedValue({
      ok: true,
      preferences: {
        marketing_updates: false,
        report_recovery: true,
        product_updates: false,
      },
    });
    hoisted.unsubscribeEmail.mockResolvedValue({
      ok: true,
      status: "unsubscribed",
    });
  });

  it("renders the preferences explanation state without a token", async () => {
    render(
      await EmailPreferencesPage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId("email-preferences-missing")).toHaveTextContent("Manage email preferences");
    expect(screen.getByText(/Open this page from the link inside your email/i)).toBeInTheDocument();
    expect(hoisted.getEmailPreferences).not.toHaveBeenCalled();
  });

  it("requests email preferences when a token is present", async () => {
    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(hoisted.getEmailPreferences).toHaveBeenCalledWith("pref_token_123");
    });
  });

  it("shows a loading state while preferences are loading", () => {
    const pending = deferred<{
      ok: boolean;
      email_masked: string;
      preferences: {
        marketing_updates: boolean;
        report_recovery: boolean;
        product_updates: boolean;
      };
    }>();
    hoisted.getEmailPreferences.mockReturnValueOnce(pending.promise);

    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    expect(screen.getByTestId("email-preferences-loading")).toHaveTextContent("Loading your email preferences...");
  });

  it("shows the masked email after preferences load", async () => {
    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("email-preferences-email")).toHaveTextContent("b***@example.com");
    });
  });

  it("shows the three email preference fields", async () => {
    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Marketing updates/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Report recovery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product updates/i)).toBeInTheDocument();
  });

  it("calls updateEmailPreferences when saving", async () => {
    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("email-preferences-save")).toBeEnabled();
    });

    fireEvent.click(screen.getByTestId("email-preferences-marketing-updates"));
    fireEvent.click(screen.getByTestId("email-preferences-save"));

    await waitFor(() => {
      expect(hoisted.updateEmailPreferences).toHaveBeenCalledWith({
        token: "pref_token_123",
        marketing_updates: false,
        report_recovery: true,
        product_updates: false,
      });
    });
  });

  it("shows a success message after saving preferences", async () => {
    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("email-preferences-save")).toBeEnabled();
    });

    fireEvent.click(screen.getByTestId("email-preferences-save"));

    await waitFor(() => {
      expect(screen.getByTestId("email-preferences-feedback")).toHaveTextContent(
        "Your email preferences have been saved."
      );
    });
  });

  it("shows the invalid or expired state when the preferences token fails", async () => {
    hoisted.getEmailPreferences.mockRejectedValueOnce(
      new ApiError({
        status: 410,
        errorCode: "TOKEN_EXPIRED",
        message: "Token expired.",
      })
    );

    render(<EmailPreferencesClient locale="en" token="pref_token_123" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("email-preferences-invalid")).toHaveTextContent(
        "This link is invalid or has expired."
      );
    });
  });

  it("renders the unsubscribe explanation state without a token", async () => {
    render(
      await EmailUnsubscribePage({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId("email-unsubscribe-missing")).toHaveTextContent("Unsubscribe from emails");
    expect(screen.getByText("Open this page from the unsubscribe link inside your email.")).toBeInTheDocument();
    expect(hoisted.unsubscribeEmail).not.toHaveBeenCalled();
  });

  it("shows the unsubscribe confirmation state when a token is present", () => {
    render(<EmailUnsubscribeClient locale="en" token="unsub_token_123" dict={dict} />);

    expect(screen.getByTestId("email-unsubscribe-confirm")).toHaveTextContent("Confirm unsubscribe");
  });

  it("calls unsubscribeEmail only after the confirm click", async () => {
    render(<EmailUnsubscribeClient locale="en" token="unsub_token_123" dict={dict} />);

    expect(hoisted.unsubscribeEmail).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("email-unsubscribe-confirm-button"));

    await waitFor(() => {
      expect(hoisted.unsubscribeEmail).toHaveBeenCalledWith({
        token: "unsub_token_123",
        reason: "user_request",
      });
    });
  });

  it("moves into the unsubscribed success state after confirming", async () => {
    render(<EmailUnsubscribeClient locale="en" token="unsub_token_123" dict={dict} />);

    fireEvent.click(screen.getByTestId("email-unsubscribe-confirm-button"));

    await waitFor(() => {
      expect(screen.getByTestId("email-unsubscribe-success")).toHaveTextContent("You’re unsubscribed");
    });
  });
});
