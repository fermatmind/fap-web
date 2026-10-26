"use client";
import { trackClientEvent } from "@/lib/tracking/client";
// Fixed public path and dimensions only. Never send invite IDs, names, answers, scores or keys.
export function friendshipEvent(event: "start_test" | "complete_test" | "view_result" | "share_result" | "revisit_result" | "invite_link_copied" | "continue_exploration", locale: "en" | "zh", role: "creator" | "friend" | "solo", action = ""): void {
  void trackClientEvent({ eventName: event, anonymousId: "", path: `/${locale}/tests/friendship-quiz`, payload: { locale, slug: "friendship-quiz", scale_code: "FRIENDSHIP_GAME", form_code: `friendship_v1_${role}${action ? `_${action}` : ""}`, entry_surface: `friendship_${role}${action ? `_${action}` : ""}`, referrer: "", current_path: `/${locale}/tests/friendship-quiz`, page_type: "test_detail", action, ...(event === "continue_exploration" ? { action_category: "read_related_content" } : {}) } });
}
