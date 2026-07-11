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

export type AppView = 'setup' | 'play' | 'overview';
