export const BRACKET_SIZES = [2, 4, 8, 16, 32, 64, 128, 256] as const;
export type BracketSize = (typeof BRACKET_SIZES)[number];

export interface Participant {
  id: string;
  name: string;
  imageUrl: string | null;
  isBye: boolean;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  loserId: string | null;
}

export interface BracketState {
  size: BracketSize;
  participants: Participant[];
  matches: Match[];
  championId: string | null;
}

export interface RosterEntry {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface BracketTemplate {
  id: string;
  name: string;
  size: BracketSize;
  roster: RosterEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RunPlacement {
  participantId: string;
  rank: number;
}

export interface BracketRun {
  id: string;
  templateId: string;
  runnerName: string;
  bracket: BracketState;
  placements: RunPlacement[];
  championId: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface StorageData {
  version: 1;
  templates: BracketTemplate[];
  runs: BracketRun[];
}

export interface ParticipantAggregateStats {
  participantId: string;
  name: string;
  imageUrl: string | null;
  runCount: number;
  avgRank: number;
  bestRank: number;
  worstRank: number;
  placements: number[];
}

export interface RunnerRankingRow {
  runId: string;
  runnerName: string;
  completedAt: string;
  ranksByParticipant: Record<string, number>;
}

export type AppView =
  | 'setup'
  | 'play'
  | 'overview'
  | 'history'
  | 'template-detail'
  | 'run-detail';

export interface TeamEntry {
  id: string;
  name: string;
  imageUrl: string | null;
}
