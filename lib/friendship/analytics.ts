"use client";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { trackClientEvent } from "@/lib/tracking/client";
// Fixed public path and dimensions only. Never send invite IDs, names, answers, scores or keys.
export function friendshipEvent(event: "start_test" | "complete_test" | "view_result" | "share_result" | "revisit_result" | "invite_link_copied" | "continue_exploration", locale: "en" | "zh", role: "creator" | "friend" | "solo", action = ""): void {
  const activity = event === "start_test" ? "start" : event === "complete_test" ? "complete" : event === "view_result" ? "result_view" : null;
  if (activity) recordEntertainmentActivity("friendship-quiz", "friendship-v1", locale, activity, role);
  if (event === "invite_link_copied" || event === "share_result") {
    const method = event === "invite_link_copied" ? "copy" : action === "share_sheet_completed" ? "system" : action.includes("image_download_started") ? "image" : action === "whatsapp_opened" ? "link_open" : null;
    if (method) recordEntertainmentActivity("friendship-quiz", "friendship-v1", locale, "share", role, method);
  }
  void trackClientEvent({ eventName: event, anonymousId: "", path: `/${locale}/tests/play/friendship-quiz`, payload: { locale, slug: "friendship-quiz", scale_code: "FRIENDSHIP_GAME", form_code: `friendship_v1_${role}${action ? `_${action}` : ""}`, entry_surface: `friendship_${role}${action ? `_${action}` : ""}`, referrer: "", current_path: `/${locale}/tests/play/friendship-quiz`, page_type: "test_detail", action, ...(event === "continue_exploration" ? { action_category: "read_related_content" } : {}) } });
}
