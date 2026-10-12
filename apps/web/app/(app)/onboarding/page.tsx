import { redirect } from "next/navigation";

import { getOnboarding } from "@/features/onboarding/client";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const state = await getOnboarding().catch(() => null);
  if (!state) redirect("/login");
  if (state.completed) redirect("/dashboard");

  return <OnboardingWizard initial={state} />;
}
