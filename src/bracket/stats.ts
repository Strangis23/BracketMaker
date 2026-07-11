import type {
  BracketRun,
  BracketTemplate,
  ParticipantAggregateStats,
  RunnerRankingRow,
} from '../types';

export function computeAggregateStats(
  template: BracketTemplate,
  runs: BracketRun[]
): ParticipantAggregateStats[] {
  const completedRuns = runs.filter(
    (run) => run.templateId === template.id && run.completedAt
  );
  const placementsByParticipant = new Map<string, number[]>();

  for (const run of completedRuns) {
    for (const placement of run.placements) {
      const existing = placementsByParticipant.get(placement.participantId) ?? [];
      existing.push(placement.rank);
      placementsByParticipant.set(placement.participantId, existing);
    }
  }

  return template.roster
    .map((entry) => {
      const placements = placementsByParticipant.get(entry.id);
      if (!placements?.length) return null;

      const sum = placements.reduce((total, rank) => total + rank, 0);
      return {
        participantId: entry.id,
        name: entry.name,
        imageUrl: entry.imageUrl,
        runCount: placements.length,
        avgRank: sum / placements.length,
        bestRank: Math.min(...placements),
        worstRank: Math.max(...placements),
        placements,
      };
    })
    .filter((stat): stat is ParticipantAggregateStats => stat !== null)
    .sort((a, b) => a.avgRank - b.avgRank);
}

export function computeRunnerRankings(
  template: BracketTemplate,
  runs: BracketRun[]
): RunnerRankingRow[] {
  return runs
    .filter((run) => run.templateId === template.id && run.completedAt)
    .map((run) => {
      const ranksByParticipant = Object.fromEntries(
        run.placements.map((placement) => [placement.participantId, placement.rank])
      );
      return {
        runId: run.id,
        runnerName: run.runnerName,
        completedAt: run.completedAt!,
        ranksByParticipant,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
}
