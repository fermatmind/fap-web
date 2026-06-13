import type { Locale } from "@/lib/i18n/locales";

export const PRIVATE_RESULT_PRINT_TITLE = "FermatMind Result";

type PrintUrlSnapshot = {
  href: string;
  title: string;
};

export function buildPrivateResultPrintPath(locale: Locale): string {
  return `/${locale}/result/print`;
}

export function installPrivateResultPrintUrlRedaction(locale: Locale): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let snapshot: PrintUrlSnapshot | null = null;
  const redactedPath = buildPrivateResultPrintPath(locale);

  const redactForPrint = () => {
    if (snapshot) {
      return;
    }

    snapshot = {
      href: window.location.href,
      title: document.title,
    };
    window.history.replaceState(window.history.state, "", redactedPath);
    document.title = PRIVATE_RESULT_PRINT_TITLE;
  };

  const restoreAfterPrint = () => {
    if (!snapshot) {
      return;
    }

    const previous = snapshot;
    snapshot = null;
    window.history.replaceState(window.history.state, "", previous.href);
    document.title = previous.title;
  };

  window.addEventListener("beforeprint", redactForPrint);
  window.addEventListener("afterprint", restoreAfterPrint);

  return () => {
    window.removeEventListener("beforeprint", redactForPrint);
    window.removeEventListener("afterprint", restoreAfterPrint);
    restoreAfterPrint();
  };
}
