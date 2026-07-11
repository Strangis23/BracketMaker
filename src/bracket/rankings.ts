import type { BracketSize, Match, Participant } from '../types';

export function getPlacementRank(
  eliminationRound: number,
  totalRounds: number
): number {
  return Math.pow(2, totalRounds - 1 - eliminationRound) + 1;
}

export function getPlacements(
  matches: Match[],
  participants: Participant[],
  size: BracketSize,
  championId: string | null
): Map<string, number> {
  const placements = new Map<string, number>();
  const byId = new Map(participants.map((p) => [p.id, p]));
  const totalRounds = Math.log2(size);

  if (championId) {
    const champion = byId.get(championId);
    if (champion && !champion.isBye) {
      placements.set(championId, 1);
    }
  }

  for (const match of matches) {
    if (!match.loserId) continue;
    const loser = byId.get(match.loserId);
    if (!loser || loser.isBye || placements.has(match.loserId)) continue;
    placements.set(match.loserId, getPlacementRank(match.round, totalRounds));
  }

  return placements;
}

export function placementsToArray(
  placements: Map<string, number>
): { participantId: string; rank: number }[] {
  return [...placements.entries()]
    .map(([participantId, rank]) => ({ participantId, rank }))
    .sort((a, b) => a.rank - b.rank);
}
