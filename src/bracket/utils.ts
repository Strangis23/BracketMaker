import type { BracketSize, Match, Participant } from '../types';

export function getSeedOrder(size: number): number[] {
  if (size === 2) return [1, 2];
  const half = getSeedOrder(size / 2);
  const result: number[] = [];
  for (const seed of half) {
    result.push(seed);
    result.push(size + 1 - seed);
  }
  return result;
}

export function createBye(id: string): Participant {
  return { id, name: 'BYE', imageUrl: null, isBye: true };
}

export function buildParticipants(
  entries: { id: string; name: string; imageUrl: string | null }[],
  size: BracketSize
): Participant[] {
  const seedOrder = getSeedOrder(size);
  const slots: (Participant | null)[] = Array(size).fill(null);

  for (let seed = 1; seed <= size; seed++) {
    const slotIndex = seedOrder.indexOf(seed);
    if (seed <= entries.length) {
      const entry = entries[seed - 1];
      slots[slotIndex] = {
        id: entry.id,
        name: entry.name.trim() || `Team ${seed}`,
        imageUrl: entry.imageUrl,
        isBye: false,
      };
    } else {
      slots[slotIndex] = createBye(`bye-${seed}`);
    }
  }

  return slots as Participant[];
}

export function buildMatches(size: BracketSize, participants: Participant[]): Match[] {
  const matches: Match[] = [];
  const numRounds = Math.log2(size);
  let roundSize = size / 2;

  for (let round = 0; round < numRounds; round++) {
    for (let pos = 0; pos < roundSize; pos++) {
      matches.push({
        id: `r${round}-m${pos}`,
        round,
        position: pos,
        participant1Id: null,
        participant2Id: null,
        winnerId: null,
        loserId: null,
      });
    }
    roundSize /= 2;
  }

  // Seed round 0 from initial participants
  const round0 = matches.filter((m) => m.round === 0);
  for (let i = 0; i < round0.length; i++) {
    round0[i].participant1Id = participants[i * 2].id;
    round0[i].participant2Id = participants[i * 2 + 1].id;
  }

  return matches;
}

export function resolveByeMatches(
  matches: Match[],
  participants: Participant[]
): Match[] {
  const byId = new Map(participants.map((p) => [p.id, p]));
  const updated = matches.map((m) => ({ ...m }));

  for (const match of updated) {
    if (match.winnerId) continue;

    const p1 = match.participant1Id ? byId.get(match.participant1Id) : null;
    const p2 = match.participant2Id ? byId.get(match.participant2Id) : null;

    if (p1?.isBye && p2?.isBye) {
      match.winnerId = p1.id;
      match.loserId = p2.id;
    } else if (p1?.isBye && p2 && !p2.isBye) {
      match.winnerId = p2.id;
      match.loserId = p1.id;
    } else if (p2?.isBye && p1 && !p1.isBye) {
      match.winnerId = p1.id;
      match.loserId = p2.id;
    }
  }

  return updated;
}

export function propagateWinners(matches: Match[]): Match[] {
  const updated = matches.map((m) => ({ ...m }));
  const byRound = new Map<number, Match[]>();

  for (const m of updated) {
    if (!byRound.has(m.round)) byRound.set(m.round, []);
    byRound.get(m.round)!.push(m);
  }

  const numRounds = byRound.size;
  for (let round = 0; round < numRounds - 1; round++) {
    const current = byRound.get(round)!.sort((a, b) => a.position - b.position);
    const next = byRound.get(round + 1)!.sort((a, b) => a.position - b.position);

    for (let i = 0; i < next.length; i++) {
      const m1 = current[i * 2];
      const m2 = current[i * 2 + 1];
      next[i].participant1Id = m1.winnerId;
      next[i].participant2Id = m2.winnerId;
    }
  }

  return updated;
}

export function getRoundName(round: number, totalRounds: number): string {
  const fromFinal = totalRounds - 1 - round;
  if (fromFinal === 0) return 'Final';
  if (fromFinal === 1) return 'Semifinals';
  if (fromFinal === 2) return 'Quarterfinals';
  return `Round ${round + 1}`;
}

export function getCurrentRound(matches: Match[]): number {
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  for (const round of rounds) {
    const roundMatches = matches.filter((m) => m.round === round);
    if (!roundMatches.every((m) => m.winnerId)) return round;
  }
  return rounds[rounds.length - 1] ?? 0;
}

export function isRoundComplete(matches: Match[], round: number): boolean {
  return matches.filter((m) => m.round === round).every((m) => m.winnerId);
}

export function getPlayableMatches(
  matches: Match[],
  participants: Participant[]
): Match[] {
  const byId = new Map(participants.map((p) => [p.id, p]));
  const currentRound = getCurrentRound(matches);

  return matches
    .filter((m) => m.round === currentRound)
    .filter((m) => {
      if (m.winnerId) return false;
      if (!m.participant1Id || !m.participant2Id) return false;
      const p1 = byId.get(m.participant1Id);
      const p2 = byId.get(m.participant2Id);
      return p1 && p2 && !p1.isBye && !p2.isBye;
    })
    .sort((a, b) => a.position - b.position);
}

export function getChampionId(matches: Match[], size: BracketSize): string | null {
  const finalRound = Math.log2(size) - 1;
  const final = matches.find((m) => m.round === finalRound);
  return final?.winnerId ?? null;
}

export function isBracketComplete(matches: Match[], size: BracketSize): boolean {
  return getChampionId(matches, size) !== null;
}
