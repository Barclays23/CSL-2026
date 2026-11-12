import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MatchForm } from "@/components/forms/MatchForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { GoalForm } from "@/components/matches/GoalForm";
import { GoalScorerList } from "@/components/matches/GoalScorerList";
import { ScoreDisplay } from "@/components/matches/ScoreDisplay";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ErrorState } from "@/components/ui/ErrorState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import type { GoalFormValues, MatchFormValues } from "@/schemas/match.schema";
import { addGoal, deleteGoal, deleteMatch, getMatchById, updateGoal, updateMatch } from "@/services/matchService";
import { getPlayers } from "@/services/playerService";
import { getTeams } from "@/services/teamService";
import type { Goal } from "@/types/match.types";
import { fromDateTimeInput, formatDate, formatTime } from "@/utils/formatDate";
import { errorMessage } from "@/utils/errorHandler";

export function MatchDetailsPage({ matchId }: { matchId: string }) {
  const { isAuthenticated } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const match = useServiceQuery(() => getMatchById(matchId), [matchId]);
  const teams = useServiceQuery(() => getTeams(), []);
  const players = useServiceQuery(() => getPlayers({ limit: 60 }), [match.data?.data.updatedAt]);
  const [editingMatch, setEditingMatch] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const record = match.data?.data;

  const saveMatch = async (values: MatchFormValues) => {
    setSaving(true);
    try {
      await updateMatch(matchId, {
        matchNo: values.matchNo,
        stage: values.stage,
        groupName: values.groupName,
        kickoffAt: fromDateTimeInput(values.kickoffAt),
        venue: values.venue,
        team1Ref: values.team1Ref,
        team2Ref: values.team2Ref,
        status: values.status,
        notes: values.notes,
        penaltyShootout:
          values.team1Shootout !== null && values.team2Shootout !== null
            ? { team1Score: values.team1Shootout, team2Score: values.team2Shootout }
            : null,
      });
      toast.success("Fixture updated");
      setEditingMatch(false);
      match.reload();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveGoal = async (values: GoalFormValues) => {
    setSaving(true);
    try {
      const payload = {
        scoringTeamRef: values.scoringTeamRef,
        goalType: values.goalType,
        scorerRef: values.goalType === "normal" ? values.scorerRef || null : null,
        ownGoalPlayerRef: values.goalType === "own_goal" ? values.ownGoalPlayerRef || null : null,
      };
      if (editingGoal) await updateGoal(matchId, editingGoal._id, payload);
      else await addGoal(matchId, payload);
      toast.success(editingGoal ? "Goal updated" : "Goal added");
      setEditingGoal(undefined);
      match.reload();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (match.loading) return <PageContainer><Skeleton className="h-64" /></PageContainer>;
  if (match.error || !record) {
    return <PageContainer><ErrorState message={match.error || "Match not found"} onRetry={match.reload} /></PageContainer>;
  }

  return (
    <PageContainer>
      <Link to="/matches" className="text-sm font-semibold text-accent">Back to fixtures</Link>
      <GlassCard className="mt-4 p-5">
        <ScoreDisplay match={record} prominent />
        <p className="mt-4 text-center text-sm text-muted">
          {formatDate(record.kickoffAt)} · {formatTime(record.kickoffAt)}
          {record.venue ? ` · ${record.venue}` : ""}
        </p>
        {record.notes ? <p className="mt-3 text-center text-sm text-muted">{record.notes}</p> : null}
        {isAuthenticated ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => setEditingMatch(true)}>Edit fixture</Button>
            <Button variant="surface" onClick={() => setEditingGoal(null)}>Add goal</Button>
            <Button
              variant="danger"
              onClick={async () => {
                const yes = await confirm({
                  title: `Delete ${record.matchNo}?`,
                  description: "The fixture and every goal inside it will be removed. Standings update immediately.",
                  confirmLabel: "Delete fixture",
                  danger: true,
                });
                if (!yes) return;
                try {
                  await deleteMatch(matchId);
                  toast.success("Fixture deleted");
                  void navigate({ to: "/matches" });
                } catch (error) {
                  toast.error(errorMessage(error));
                }
              }}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </GlassCard>
      <section className="mt-6">
        <h2 className="mb-3 font-display text-3xl text-fg">Goals</h2>
        <GoalScorerList match={record} />
        {isAuthenticated ? (
          <div className="mt-3 flex flex-col gap-2">
            {record.goals.map((goal) => (
              <div key={goal._id} className="flex gap-2">
                <Button size="sm" variant="surface" onClick={() => setEditingGoal(goal)}>Edit</Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    const yes = await confirm({
                      title: "Remove this goal?",
                      description: "The score, table and top scorers will be recalculated.",
                      confirmLabel: "Remove goal",
                      danger: true,
                    });
                    if (!yes) return;
                    try {
                      await deleteGoal(matchId, goal._id);
                      toast.success("Goal removed");
                      match.reload();
                    } catch (error) {
                      toast.error(errorMessage(error));
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
      <Drawer open={editingMatch} title="Edit fixture" onClose={() => setEditingMatch(false)}>
        <MatchForm match={record} teams={teams.data?.data ?? []} submitting={saving} onSubmit={saveMatch} />
      </Drawer>
      <Drawer open={editingGoal !== undefined} title={editingGoal ? "Edit goal" : "Add goal"} onClose={() => setEditingGoal(undefined)}>
        <GoalForm match={record} goal={editingGoal} players={players.data?.data ?? []} submitting={saving} onSubmit={saveGoal} />
      </Drawer>
    </PageContainer>
  );
}
