import type {
  BracketRun,
  BracketSize,
  BracketState,
  BracketTemplate,
  Participant,
  RunPlacement,
} from '../types';

export interface SharedBracketPayload {
  version: 1;
  template: {
    name: string;
    size: BracketSize;
    roster: { id: string; name: string }[];
  };
  runs: Array<{
    runnerName: string;
    completedAt: string;
    championId: string | null;
    placements: RunPlacement[];
    bracket: BracketState;
  }>;
}

function stripParticipant(participant: Participant): Participant {
  return { ...participant, imageUrl: null };
}

function stripBracket(bracket: BracketState): BracketState {
  return {
    ...bracket,
    participants: bracket.participants.map(stripParticipant),
  };
}

export function buildSharePayload(
  template: BracketTemplate,
  runs: BracketRun[]
): SharedBracketPayload | null {
  const completedRuns = runs.filter((run) => run.completedAt);
  if (completedRuns.length === 0) return null;

  return {
    version: 1,
    template: {
      name: template.name,
      size: template.size,
      roster: template.roster.map((entry) => ({
        id: entry.id,
        name: entry.name,
      })),
    },
    runs: completedRuns.map((run) => ({
      runnerName: run.runnerName,
      completedAt: run.completedAt!,
      championId: run.championId,
      placements: run.placements,
      bracket: stripBracket(run.bracket),
    })),
  };
}

export function payloadToTemplate(payload: SharedBracketPayload): BracketTemplate {
  const now = new Date().toISOString();
  return {
    id: 'shared',
    name: payload.template.name,
    size: payload.template.size,
    roster: payload.template.roster.map((entry) => ({
      id: entry.id,
      name: entry.name,
      imageUrl: null,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function payloadToRuns(payload: SharedBracketPayload): BracketRun[] {
  return payload.runs.map((run, index) => ({
    id: `shared-run-${index}`,
    templateId: 'shared',
    runnerName: run.runnerName,
    bracket: run.bracket,
    placements: run.placements,
    championId: run.championId,
    startedAt: run.completedAt,
    completedAt: run.completedAt,
  }));
}
