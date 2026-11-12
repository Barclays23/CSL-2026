import { createFileRoute } from "@tanstack/react-router";
import { MatchDetailsPage } from "@/pages/matches/MatchDetailsPage";

export const Route = createFileRoute("/matches/$matchId")({
  component: function MatchRoute() {
    const { matchId } = Route.useParams();
    return <MatchDetailsPage matchId={matchId} />;
  },
});
