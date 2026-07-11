import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AppView,
  BracketRun,
  BracketSize,
  BracketState,
  BracketTemplate,
  Participant,
  RosterEntry,
  TeamEntry,
} from '../types';
import { getPlacements, placementsToArray } from './rankings';
import {
  buildMatches,
  buildParticipants,
  getChampionId,
  getPlayableMatches,
  isBracketComplete,
  propagateWinners,
  resolveByeMatches,
} from './utils';
import { parseBulkImport, type BulkImportResult } from './bulkImport';
import {
  createId,
  deleteRun,
  deleteTemplate,
  getRun,
  getRunsForTemplate,
  getTemplate,
  loadStorage,
  saveRun,
  upsertTemplate,
} from '../storage/bracketStorage';

function createEmptyEntry(): TeamEntry {
  return { id: createId(), name: '', imageUrl: null };
}

function rosterToEntries(roster: RosterEntry[]): TeamEntry[] {
  return roster.map((entry) => ({
    id: entry.id,
    name: entry.name,
    imageUrl: entry.imageUrl,
  }));
}

function entriesToRoster(entries: TeamEntry[]): RosterEntry[] {
  return entries
    .filter((entry) => entry.name.trim())
    .map((entry) => ({
      id: entry.id,
      name: entry.name.trim(),
      imageUrl: entry.imageUrl,
    }));
}

function buildInitialBracket(
  entries: TeamEntry[],
  bracketSize: BracketSize
): BracketState {
  const participants = buildParticipants(entries, bracketSize);
  let matches = buildMatches(bracketSize, participants);
  matches = resolveByeMatches(matches, participants);
  matches = propagateWinners(matches);
  matches = resolveByeMatches(matches, participants);
  matches = propagateWinners(matches);

  return {
    size: bracketSize,
    participants,
    matches,
    championId: getChampionId(matches, bracketSize),
  };
}

export function useBracket() {
  const [view, setView] = useState<AppView>('setup');
  const [bracketSize, setBracketSizeState] = useState<BracketSize>(8);
  const [templateName, setTemplateName] = useState('Untitled Bracket');
  const [runnerName, setRunnerName] = useState('');
  const [entries, setEntries] = useState<TeamEntry[]>([createEmptyEntry()]);
  const [bracket, setBracket] = useState<BracketState | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [returnView, setReturnView] = useState<AppView>('setup');
  const [storageVersion, setStorageVersion] = useState(0);

  const refreshStorage = useCallback(() => {
    setStorageVersion((version) => version + 1);
  }, []);

  const storage = useMemo(() => loadStorage(), [storageVersion]);

  const setBracketSize = useCallback((size: BracketSize) => {
    setBracketSizeState(size);
    setEntries((prev) => (prev.length > size ? prev.slice(0, size) : prev));
  }, []);

  const addEntry = useCallback(() => {
    setEntries((prev) => {
      if (prev.length >= bracketSize) return prev;
      return [...prev, createEmptyEntry()];
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
      prev.map((entry, i) => (i === index ? { ...entry, ...update } : entry))
    );
  }, []);

  const bulkImportTeams = useCallback(
    (text: string): BulkImportResult => {
      const names = parseBulkImport(text);
      if (names.length === 0) {
        return { imported: 0, skipped: 0 };
      }

      const limited = names.slice(0, bracketSize);
      setEntries(
        limited.map((name) => ({
          id: createId(),
          name,
          imageUrl: null,
        }))
      );

      return {
        imported: limited.length,
        skipped: Math.max(0, names.length - bracketSize),
      };
    },
    [bracketSize]
  );

  const startBracket = useCallback(() => {
    const roster = entriesToRoster(entries);
    if (roster.length < 2) return;

    const now = new Date().toISOString();
    const template: BracketTemplate = {
      id: activeTemplateId ?? createId(),
      name: templateName.trim() || 'Untitled Bracket',
      size: bracketSize,
      roster,
      createdAt: activeTemplateId
        ? getTemplate(activeTemplateId)?.createdAt ?? now
        : now,
      updatedAt: now,
    };

    upsertTemplate(template);
    setActiveTemplateId(template.id);

    const run: BracketRun = {
      id: createId(),
      templateId: template.id,
      runnerName: runnerName.trim() || 'Anonymous',
      bracket: buildInitialBracket(entries, bracketSize),
      placements: [],
      championId: null,
      startedAt: now,
      completedAt: null,
    };

    saveRun(run);
    setActiveRunId(run.id);
    setBracket(run.bracket);
    refreshStorage();
    setView('play');
  }, [
    activeTemplateId,
    bracketSize,
    entries,
    refreshStorage,
    runnerName,
    templateName,
  ]);

  const pickWinner = useCallback((matchId: string, winnerId: string) => {
    setBracket((prev) => {
      if (!prev) return prev;

      const participants = prev.participants;

      let matches = prev.matches.map((match) => {
        if (match.id !== matchId) return match;
        const loserId =
          match.participant1Id === winnerId
            ? match.participant2Id
            : match.participant1Id;
        return { ...match, winnerId, loserId };
      });

      matches = propagateWinners(matches);
      matches = resolveByeMatches(matches, participants);

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

  const complete = bracket ? isBracketComplete(bracket.matches, bracket.size) : false;

  useEffect(() => {
    if (!complete || !bracket || !activeRunId || !activeTemplateId) return;

    const existingRun = getRun(activeRunId);
    if (existingRun?.completedAt) return;

    const placementMap = getPlacements(
      bracket.matches,
      bracket.participants,
      bracket.size,
      bracket.championId
    );
    const championParticipant = bracket.championId
      ? bracket.participants.find((participant) => participant.id === bracket.championId)
      : null;

    const completedRun: BracketRun = {
      id: activeRunId,
      templateId: activeTemplateId,
      runnerName: runnerName.trim() || existingRun?.runnerName || 'Anonymous',
      bracket,
      placements: placementsToArray(placementMap),
      championId: championParticipant && !championParticipant.isBye
        ? championParticipant.id
        : null,
      startedAt: existingRun?.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    saveRun(completedRun);
    refreshStorage();
  }, [
    activeRunId,
    activeTemplateId,
    bracket,
    complete,
    refreshStorage,
    runnerName,
  ]);

  const resetBracket = useCallback(() => {
    setBracket(null);
    setActiveTemplateId(null);
    setActiveRunId(null);
    setView('setup');
  }, []);

  const rerunTemplate = useCallback(
    (templateId: string, nextRunnerName: string) => {
      const template = getTemplate(templateId);
      if (!template) return;

      setTemplateName(template.name);
      setRunnerName(nextRunnerName.trim());
      setBracketSizeState(template.size);
      setEntries(rosterToEntries(template.roster));
      setActiveTemplateId(template.id);

      const now = new Date().toISOString();
      const run: BracketRun = {
        id: createId(),
        templateId: template.id,
        runnerName: nextRunnerName.trim() || 'Anonymous',
        bracket: buildInitialBracket(rosterToEntries(template.roster), template.size),
        placements: [],
        championId: null,
        startedAt: now,
        completedAt: null,
      };

      saveRun(run);
      setActiveRunId(run.id);
      setBracket(run.bracket);
      refreshStorage();
      setView('play');
    },
    [refreshStorage]
  );

  const openHistory = useCallback(() => {
    setReturnView(view === 'play' || view === 'overview' ? view : 'setup');
    setSelectedTemplateId(null);
    setSelectedRunId(null);
    setView('history');
  }, [view]);

  const openTemplateDetail = useCallback((templateId: string) => {
    setReturnView(view === 'play' || view === 'overview' ? view : 'history');
    setSelectedTemplateId(templateId);
    setSelectedRunId(null);
    setView('template-detail');
  }, [view]);

  const openRunDetail = useCallback((runId: string) => {
    const run = getRun(runId);
    if (!run) return;
    setSelectedTemplateId(run.templateId);
    setSelectedRunId(runId);
    setView('run-detail');
  }, []);

  const removeTemplate = useCallback(
    (templateId: string) => {
      deleteTemplate(templateId);
      refreshStorage();
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
        setSelectedRunId(null);
        setView('history');
      }
    },
    [refreshStorage, selectedTemplateId]
  );

  const removeRun = useCallback(
    (runId: string) => {
      deleteRun(runId);
      refreshStorage();
      if (selectedRunId === runId) {
        setSelectedRunId(null);
        setView(selectedTemplateId ? 'template-detail' : 'history');
      }
    },
    [refreshStorage, selectedRunId, selectedTemplateId]
  );

  const participantMap = useMemo(() => {
    if (!bracket) return new Map<string, Participant>();
    return new Map(bracket.participants.map((participant) => [participant.id, participant]));
  }, [bracket]);

  const playableMatches = useMemo(() => {
    if (!bracket) return [];
    return getPlayableMatches(bracket.matches, bracket.participants);
  }, [bracket]);

  const selectedTemplate = selectedTemplateId
    ? storage.templates.find((template) => template.id === selectedTemplateId) ?? null
    : null;

  const selectedRun = selectedRunId
    ? storage.runs.find((run) => run.id === selectedRunId) ?? null
    : null;

  const templateRuns = selectedTemplateId
    ? getRunsForTemplate(selectedTemplateId)
    : [];

  return {
    view,
    setView,
    bracketSize,
    setBracketSize,
    templateName,
    setTemplateName,
    runnerName,
    setRunnerName,
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    bulkImportTeams,
    startBracket,
    pickWinner,
    resetBracket,
    rerunTemplate,
    openHistory,
    openTemplateDetail,
    openRunDetail,
    removeTemplate,
    removeRun,
    bracket,
    participantMap,
    playableMatches,
    complete,
    templates: storage.templates,
    runs: storage.runs,
    selectedTemplate,
    selectedRun,
    templateRuns,
    activeTemplateId,
    returnView,
  };
}
