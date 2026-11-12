import { createFileRoute } from "@tanstack/react-router";
import { MatchesPage } from "@/pages/matches/MatchesPage";

export const Route = createFileRoute("/matches/")({
  component: MatchesPage,
});
