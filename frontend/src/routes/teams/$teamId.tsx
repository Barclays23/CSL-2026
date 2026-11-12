import { createFileRoute } from "@tanstack/react-router";
import { TeamDetailsPage } from "@/pages/teams/TeamDetailsPage";

export const Route = createFileRoute("/teams/$teamId")({
  component: function TeamRoute() {
    const { teamId } = Route.useParams();
    return <TeamDetailsPage teamId={teamId} />;
  },
});
