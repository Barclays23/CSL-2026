import { createFileRoute } from "@tanstack/react-router";
import { StandingsPage } from "@/pages/standings/StandingsPage";

export const Route = createFileRoute("/standings/")({
  component: StandingsPage,
});
