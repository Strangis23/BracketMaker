import type { BracketRun, BracketTemplate } from '../types';

export interface RankedEntry {
  rank: number;
  name: string;
}

export interface ShareListData {
  bracketName: string;
  runnerName: string;
  rankedEntries: RankedEntry[];
}

export interface ParsedSharedList {
  bracketName?: string;
  runnerName?: string;
  names: string[];
}

export const SHARE_BLOCK_START = '--- Bracket Maker ---';
export const SHARE_BLOCK_END = '--- End ---';

export function getAppUrl(): string {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!basePath) return `${window.location.origin}/`;
  return `${window.location.origin}${basePath}/`;
}

function rankLabel(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}.`.padStart(3, ' ');
}

export function buildShareListFromRun(
  template: BracketTemplate,
  run: BracketRun
): ShareListData | null {
  if (!run.completedAt) return null;

  const participantMap = new Map(
    run.bracket.participants.map((participant) => [participant.id, participant])
  );

  const rankedEntries = run.placements
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((placement) => {
      const participant = participantMap.get(placement.participantId);
      if (!participant || participant.isBye) return null;
      return { rank: placement.rank, name: participant.name };
    })
    .filter((entry): entry is RankedEntry => entry !== null);

  if (rankedEntries.length === 0) return null;

  return {
    bracketName: template.name,
    runnerName: run.runnerName,
    rankedEntries,
  };
}

export function buildShareListText(data: ShareListData): string {
  const lines = [
    '══════════════════════════════════',
    '       BRACKET MAKER RESULTS',
    '══════════════════════════════════',
    '',
    `  Bracket: ${data.bracketName}`,
    `  By:      ${data.runnerName}`,
    '',
    ...data.rankedEntries.map(
      (entry) => `  ${rankLabel(entry.rank)}  ${entry.name}`
    ),
    '',
    '  Make your own bracket:',
    `  ${getAppUrl()}`,
    '',
    SHARE_BLOCK_START,
    data.bracketName,
    data.runnerName,
    ...data.rankedEntries.map((entry) => entry.name),
    SHARE_BLOCK_END,
  ];

  return lines.join('\n');
}

function parseRankedLine(line: string): RankedEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('🥇')) {
    return { rank: 1, name: trimmed.replace(/^🥇\s*/, '').trim() };
  }
  if (trimmed.startsWith('🥈')) {
    return { rank: 2, name: trimmed.replace(/^🥈\s*/, '').trim() };
  }
  if (trimmed.startsWith('🥉')) {
    return { rank: 3, name: trimmed.replace(/^🥉\s*/, '').trim() };
  }

  const numbered = trimmed.match(/^#?(\d+)\.?\s+(.+)$/);
  if (numbered) {
    return { rank: Number(numbered[1]), name: numbered[2].trim() };
  }

  return null;
}

function parseShareBlock(text: string): ParsedSharedList | null {
  const start = text.indexOf(SHARE_BLOCK_START);
  const end = text.indexOf(SHARE_BLOCK_END);
  if (start === -1 || end === -1 || end <= start) return null;

  const blockLines = text
    .slice(start + SHARE_BLOCK_START.length, end)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (blockLines.length === 0) return null;

  const bracketName = blockLines[0];
  const hasRunner = blockLines.length >= 2;
  const runnerName = hasRunner ? blockLines[1] : undefined;
  const names = blockLines.slice(hasRunner ? 2 : 1);

  if (names.length === 0) return null;

  return { bracketName, runnerName, names };
}

function parsePrettyRankedLines(text: string): ParsedSharedList | null {
  const rankedEntries: RankedEntry[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('═') ||
      trimmed.startsWith('---') ||
      trimmed.toLowerCase().includes('bracket maker') ||
      trimmed.toLowerCase().startsWith('bracket:') ||
      trimmed.toLowerCase().startsWith('by:') ||
      trimmed.toLowerCase().includes('make your own') ||
      trimmed.startsWith('http')
    ) {
      continue;
    }

    const entry = parseRankedLine(trimmed);
    if (entry?.name) rankedEntries.push(entry);
  }

  if (rankedEntries.length === 0) return null;

  rankedEntries.sort((a, b) => a.rank - b.rank);

  return {
    names: rankedEntries.map((entry) => entry.name),
  };
}

export function parseSharedList(text: string): ParsedSharedList | null {
  const fromBlock = parseShareBlock(text);
  if (fromBlock) return fromBlock;

  return parsePrettyRankedLines(text);
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
