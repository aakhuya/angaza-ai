import { api } from "@/lib/api";

export type OnboardingState = {
  completed: boolean;
  favorite_teams: string[];
  favorite_players: string[];
  viewer_mode: "casual" | "analyst" | "player_focus";
};

export function getOnboarding() {
  return api.get<OnboardingState>("/onboarding");
}

export function completeOnboarding(body: {
  favorite_teams: string[];
  favorite_players: string[];
  viewer_mode: "casual" | "analyst" | "player_focus";
  language?: string;
  explanation_detail?: "brief" | "standard" | "deep";
}) {
  return api.post<OnboardingState>("/onboarding", {
    language: "en",
    explanation_detail: "standard",
    ...body,
  });
}
