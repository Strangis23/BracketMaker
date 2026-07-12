import { BRACKET_SIZES, type BracketSize } from '../types';
import { parseSharedList, type ParsedSharedList } from '../share/shareList';

export const MAX_TEAMS = 256;

export function parsePlainLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export type { ParsedSharedList };

export function parseImportText(text: string): ParsedSharedList | string[] {
  const shared = parseSharedList(text);
  if (shared?.names.length) {
    return shared;
  }

  return parsePlainLines(text);
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  bracketName?: string;
  runnerName?: string;
  fromSharedList: boolean;
}

export function countImportNames(text: string): {
  names: string[];
  bracketName?: string;
  runnerName?: string;
  fromSharedList: boolean;
} {
  const parsed = parseImportText(text);
  return resolveImportNames(parsed);
}

export function suggestBracketSize(teamCount: number): BracketSize | null {
  if (teamCount <= 0 || teamCount > MAX_TEAMS) return null;
  return BRACKET_SIZES.find((size) => size >= teamCount) ?? MAX_TEAMS;
}

export function resolveImportNames(
  parsed: ParsedSharedList | string[]
): { names: string[]; bracketName?: string; runnerName?: string; fromSharedList: boolean } {
  if (Array.isArray(parsed)) {
    return { names: parsed, fromSharedList: false };
  }

  return {
    names: parsed.names,
    bracketName: parsed.bracketName,
    runnerName: parsed.runnerName,
    fromSharedList: true,
  };
}
