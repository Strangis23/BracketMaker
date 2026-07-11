import { useCallback, useMemo, useState } from 'react';
import type { AppView, BracketSize, BracketState, Participant } from '../types';
import {
  buildMatches,
  buildParticipants,
  getChampionId,
  getPlayableMatches,
  isBracketComplete,
  propagateWinners,
  resolveByeMatches,
} from './utils';

interface TeamEntry {
  name: string;
  imageUrl: string | null;
}

export function useBracket() {
  const [view, setView] = useState<AppView>('setup');
  const [bracketSize, setBracketSizeState] = useState<BracketSize>(8);

  const setBracketSize = useCallback((size: BracketSize) => {
    setBracketSizeState(size);
    setEntries((prev) => (prev.length > size ? prev.slice(0, size) : prev));
  }, []);
  const [entries, setEntries] = useState<TeamEntry[]>([{ name: '', imageUrl: null }]);
  const [bracket, setBracket] = useState<BracketState | null>(null);

  const addEntry = useCallback(() => {
    setEntries((prev) => {
      if (prev.length >= bracketSize) return prev;
      return [...prev, { name: '', imageUrl: null }];
    });
  }, [bracketSize]);

  const removeEntry = useCallback((index: number) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateEntry = useCallback((index: number, update: Partial<TeamEntry>) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...update } : e))
    );
  }, []);

  const startBracket = useCallback(() => {
    const participants = buildParticipants(entries, bracketSize);
    let matches = buildMatches(bracketSize, participants);
    matches = resolveByeMatches(matches, participants);
    matches = propagateWinners(matches);
    matches = resolveByeMatches(matches, participants);
    matches = propagateWinners(matches);

    setBracket({
      size: bracketSize,
      participants,
      matches,
      championId: getChampionId(matches, bracketSize),
    });
    setView('play');
  }, [entries, bracketSize]);

  const pickWinner = useCallback((matchId: string, winnerId: string) => {
    setBracket((prev) => {
      if (!prev) return prev;

      const participants = prev.participants;

      let matches = prev.matches.map((m) => {
        if (m.id !== matchId) return m;
        const loserId =
          m.participant1Id === winnerId ? m.participant2Id : m.participant1Id;
        return { ...m, winnerId, loserId };
      });

      matches = propagateWinners(matches);
      matches = resolveByeMatches(matches, participants);

      // Keep propagating until no new bye auto-wins
      let changed = true;
      while (changed) {
        const before = JSON.stringify(matches);
        matches = propagateWinners(matches);
        matches = resolveByeMatches(matches, participants);
        changed = before !== JSON.stringify(matches);
      }

      return {
        ...prev,
        matches,
        championId: getChampionId(matches, prev.size),
      };
    });
  }, []);

  const resetBracket = useCallback(() => {
    setBracket(null);
    setView('setup');
  }, []);

  const participantMap = useMemo(() => {
    if (!bracket) return new Map<string, Participant>();
    return new Map(bracket.participants.map((p) => [p.id, p]));
  }, [bracket]);

  const playableMatches = useMemo(() => {
    if (!bracket) return [];
    return getPlayableMatches(bracket.matches, bracket.participants);
  }, [bracket]);

  const complete = bracket ? isBracketComplete(bracket.matches, bracket.size) : false;

  return {
    view,
    setView,
    bracketSize,
    setBracketSize,
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    startBracket,
    pickWinner,
    resetBracket,
    bracket,
    participantMap,
    playableMatches,
    complete,
  };
}
