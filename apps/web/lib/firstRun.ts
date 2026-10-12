import { redirect } from "next/navigation";

import { getOnboarding } from "@/features/onboarding/client";

/**
 * Redirect to /onboarding if the user has not completed first-run setup.
 * Call this at the top of any page that should require setup — currently
 * only the dashboard.
 */
export async function requireOnboarded(): Promise<void> {
  try {
    const state = await getOnboarding();
    if (!state.completed) redirect("/onboarding");
  } catch {
    // If the API is unreachable, do not block the user. The dashboard shows
    // its own error states.
  }
}
