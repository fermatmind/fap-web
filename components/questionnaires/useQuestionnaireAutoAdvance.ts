"use client";
import { useEffect, type RefObject } from "react";

/** Advance through the engine's own validated handler, after selection feedback. */
export function useQuestionnaireAutoAdvance(region: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = region.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: string | null = null;
    let feedbackComplete = false;
    let lockedUntil = 0;
    const radios = () => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(input => !input.closest('[hidden], [aria-hidden="true"]'));
    // Names and prompts identify a question even when React reuses its DOM nodes.
    const identity = () => radios().map(input => `${input.name}:${input.value}`).join("|") + Array.from(root.querySelectorAll("h2, h3, legend")).map(node => node.textContent).join("|");
    function cancel() { clearTimeout(timer); timer = undefined; pending = null; feedbackComplete = false; }
    function advance() {
      if (!pending || pending !== identity()) { cancel(); return; }
      const groups = new Map<string, boolean>();
      for (const input of radios()) groups.set(input.name, Boolean(groups.get(input.name)) || input.checked);
      if (!groups.size || [...groups.values()].some(checked => !checked)) return;
      const next = root?.querySelector<HTMLButtonElement>('button[data-questionnaire-next]:not(:disabled)');
      if (!next) return; // A stimulus or another required field may still be loading.
      pending = null;
      feedbackComplete = false;
      lockedUntil = Date.now() + 280;
      next.click();
    }
    function select(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "radio" || target.disabled) return;
      if (!root?.querySelector("button[data-questionnaire-next]")) return;
      if (event instanceof MouseEvent && event.detail > 1 && Date.now() < lockedUntil) { event.preventDefault(); event.stopPropagation(); return; }
      clearTimeout(timer);
      pending = identity();
      feedbackComplete = false;
      timer = setTimeout(() => { timer = undefined; feedbackComplete = true; advance(); }, 200);
    }
    function click(event: Event) {
      if (event.target instanceof Element && event.target.closest("button, a")) cancel();
      select(event);
    }
    function changed() {
      if (!pending) return;
      if (pending !== identity()) cancel();
      // Retry readiness only after the feedback interval, never on a new question.
      else if (feedbackComplete && !timer) timer = setTimeout(() => { timer = undefined; advance(); }, 0);
    }
    function visibility() { if (document.hidden) cancel(); }
    root.addEventListener("click", click, true);
    root.addEventListener("change", select, true);
    const observer = new MutationObserver(changed);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", cancel);
    return () => {
      cancel(); observer.disconnect();
      root.removeEventListener("click", click, true); root.removeEventListener("change", select, true);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", cancel);
    };
  }, [region]);
}
