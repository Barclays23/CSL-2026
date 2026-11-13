import { STAGE_LABEL, STATUS_LABEL } from "@/constants/football.constants";
import type { Match } from "@/types/match.types";
import { getMatchScore } from "@/utils/getMatchScore";
import { refId, isPopulated } from "@/utils/refs";

export function teamName(ref: Match["team1Ref"]) {
  return isPopulated(ref) ? ref.name : "Team";
}

export function teamLogo(ref: Match["team1Ref"]) {
  return isPopulated(ref) ? ref.logo : null;
}

export function ScoreDisplay({ match, prominent = false }: { match: Match; prominent?: boolean }) {
  const score = getMatchScore(match);
  const showScore = match.status === "live" || match.status === "completed" || match.goals.length > 0;
  const shootout = match.penaltyShootout;
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {match.matchNo} · {STAGE_LABEL[match.stage]}
        {match.groupName ? ` · ${match.groupName}` : ""}
      </p>
      <div className={`mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${prominent ? "text-fg" : ""}`}>
        <p className="truncate text-right font-semibold text-fg">{teamName(match.team1Ref)}</p>
        <p className={`font-display tabular text-fg ${prominent ? "text-5xl" : "text-3xl"}`}>
          {showScore ? `${score.team1} – ${score.team2}` : "vs"}
        </p>
        <p className="truncate text-left font-semibold text-fg">{teamName(match.team2Ref)}</p>
      </div>
      {shootout ? (
        <p className="mt-1 text-sm text-gold">
          Penalties {shootout.team1Score} – {shootout.team2Score}
          {shootout.team1Score !== shootout.team2Score
            ? ` · ${shootout.team1Score > shootout.team2Score ? teamName(match.team1Ref) : teamName(match.team2Ref)} win`
            : ""}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted">{STATUS_LABEL[match.status]}</p>
      <span className="sr-only">{refId(match.team1Ref)}</span>
    </div>
  );
}
