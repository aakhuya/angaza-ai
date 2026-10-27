import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileForm } from "@/features/settings/ProfileForm";
import type { ClubOption } from "@/features/settings/client";

// Mock the API client so we don't hit the network.
vi.mock("@/features/settings/client", async () => {
  const actual = await vi.importActual<typeof import("@/features/settings/client")>(
    "@/features/settings/client"
  );
  return {
    ...actual,
    patchProfile: vi.fn(async (body) => ({
      display_name: body.display_name ?? "Test",
      username: body.username ?? null,
      avatar_url: "",
      favorite_team: body.favorite_team ?? "",
      favorite_player: body.favorite_player ?? "",
    })),
    uploadAvatar: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const TEAMS: ClubOption[] = [
  {
    name: "Angaza FC",
    short_name: "ANG",
    nickname: "The Rising Stars",
    identity: "Bold, attacking",
    color: "#E8BC67",
    players: [
      { id: "HOME-p01", name: "Mwangi Achieng", position: "GK", number: 1 },
      { id: "HOME-p06", name: "Ochieng Wanjiku", position: "MF", number: 6 },
    ],
  },
  {
    name: "Mwangaza United",
    short_name: "MWU",
    nickname: "The Luminaries",
    identity: "Patient build-up",
    color: "#3FC4A8",
    players: [
      { id: "AWAY-p09", name: "Kamau Kipkemboi", position: "FW", number: 9 },
    ],
  },
];

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the initial display name and username", () => {
    render(
      <ProfileForm
        initial={{
          display_name: "Ada",
          username: "ada_l",
          avatar_url: "",
          favorite_team: "",
          favorite_player: "",
        }}
        teams={TEAMS}
      />
    );
    expect(screen.getByDisplayValue("Ada")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ada_l")).toBeInTheDocument();
  });

  it("populates the team dropdown with all eight-club options", () => {
    render(
      <ProfileForm
        initial={{
          display_name: "",
          username: null,
          avatar_url: "",
          favorite_team: "",
          favorite_player: "",
        }}
        teams={TEAMS}
      />
    );

    const teamSelect = screen.getByLabelText(/favorite team/i) as HTMLSelectElement;
    const options = Array.from(teamSelect.options).map((o) => o.textContent);
    expect(options).toContain("Angaza FC");
    expect(options).toContain("Mwangaza United");
  });

  it("populates the player dropdown with real names, not IDs", () => {
    render(
      <ProfileForm
        initial={{
          display_name: "",
          username: null,
          avatar_url: "",
          favorite_team: "",
          favorite_player: "",
        }}
        teams={TEAMS}
      />
    );

    const playerSelect = screen.getByLabelText(/favorite player/i) as HTMLSelectElement;
    const options = Array.from(playerSelect.options).map((o) => o.textContent);
    expect(options.some((o) => o?.includes("Mwangi Achieng"))).toBe(true);
    expect(options.some((o) => o?.includes("Kamau Kipkemboi"))).toBe(true);
    expect(options.some((o) => o?.includes("HOME-p01"))).toBe(false);
  });

  it("calls patchProfile when the form is submitted", async () => {
    const { patchProfile } = await import("@/features/settings/client");
    render(
      <ProfileForm
        initial={{
          display_name: "Old Name",
          username: null,
          avatar_url: "",
          favorite_team: "",
          favorite_player: "",
        }}
        teams={TEAMS}
      />
    );

    const input = screen.getByDisplayValue("Old Name");
    fireEvent.change(input, { target: { value: "New Name" } });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(patchProfile).toHaveBeenCalledWith(
        expect.objectContaining({ display_name: "New Name" })
      );
    });
  });

  it("shows 'Saved' after a successful save", async () => {
    render(
      <ProfileForm
        initial={{
          display_name: "Test",
          username: null,
          avatar_url: "",
          favorite_team: "",
          favorite_player: "",
        }}
        teams={TEAMS}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
  });
});
