import { useMemo } from 'react';
import type { Participant } from '../types';
import {
  payloadToRuns,
  payloadToTemplate,
  type SharedBracketPayload,
} from '../share/buildSharePayload';
import { BracketStatsPanel } from './BracketStatsPanel';
import { BracketOverview } from './BracketOverview';
import { ParticipantCard } from './ParticipantCard';

interface SharedBracketViewProps {
  payload: SharedBracketPayload;
  onCreateOwn: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function RunSection({
  run,
}: {
  run: ReturnType<typeof payloadToRuns>[number];
}) {
  const participantMap = new Map(
    run.bracket.participants.map((participant) => [participant.id, participant])
  );
  const champion = run.championId
    ? participantMap.get(run.championId) ?? null
    : null;

  const rankedParticipants = run.placements
    .map((placement) => {
      const participant = participantMap.get(placement.participantId);
      if (!participant || participant.isBye) return null;
      return { participant, rank: placement.rank };
    })
    .filter(
      (item): item is { participant: Participant; rank: number } => item !== null
    );

  return (
    <section className="setup-section shared-run-section">
      <h2>{run.runnerName}&apos;s Bracket</h2>
      <p className="hint">
        Completed {formatDate(run.completedAt!)}
        {champion ? ` · Champion: ${champion.name}` : ''}
      </p>

      {champion && (
        <div className="champion-banner run-champion">
          <span className="champion-label">Champion</span>
          <ParticipantCard participant={champion} />
        </div>
      )}

      {rankedParticipants.length > 0 && (
        <>
          <h3 className="subsection-title">Final Rankings</h3>
          <ol className="rankings-list">
            {rankedParticipants.map(({ participant, rank }) => (
              <li key={participant.id} className="rankings-item">
                <span className="rank-badge">#{rank}</span>
                <ParticipantCard participant={participant} compact />
              </li>
            ))}
          </ol>
        </>
      )}

      <h3 className="subsection-title">Bracket</h3>
      <BracketOverview
        matches={run.bracket.matches}
        participants={run.bracket.participants}
        size={run.bracket.size}
        championId={run.bracket.championId}
      />
    </section>
  );
}

export function SharedBracketView({ payload, onCreateOwn }: SharedBracketViewProps) {
  const template = useMemo(() => payloadToTemplate(payload), [payload]);
  const runs = useMemo(() => payloadToRuns(payload), [payload]);

  return (
    <div className="shared-bracket-view">
      <header className="page-header">
        <div className="shared-badge">Shared Bracket</div>
        <h1>{template.name}</h1>
        <p className="subtitle">
          {template.size}-team bracket · {runs.length} completed run
          {runs.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="shared-actions">
        <button type="button" className="btn-primary" onClick={onCreateOwn}>
          Create Your Own Bracket
        </button>
      </div>

      <BracketStatsPanel template={template} runs={runs} />

      {runs.map((run) => (
        <RunSection key={run.id} run={run} />
      ))}
    </div>
  );
}
