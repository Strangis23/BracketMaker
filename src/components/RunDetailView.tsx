import { useMemo } from 'react';
import type { BracketRun, BracketTemplate, Participant } from '../types';
import { buildShareListFromRun } from '../share/shareList';
import { BracketOverview } from './BracketOverview';
import { ParticipantCard } from './ParticipantCard';
import { ShareWithFriendsButton } from './ShareModal';

interface RunDetailViewProps {
  template: BracketTemplate;
  run: BracketRun;
  onBack: () => void;
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

export function RunDetailView({ template, run, onBack }: RunDetailViewProps) {
  const { bracket } = run;
  const participantMap = new Map(
    bracket.participants.map((participant) => [participant.id, participant])
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

  const shareData = useMemo(
    () => buildShareListFromRun(template, run),
    [template, run]
  );

  return (
    <div className="run-detail-view">
      <header className="page-header">
        <button type="button" className="btn-text back-link" onClick={onBack}>
          ← {template.name}
        </button>
        <h1>{run.runnerName}&apos;s Bracket</h1>
        <p className="subtitle">
          Completed {run.completedAt ? formatDate(run.completedAt) : 'in progress'}
        </p>
        <div className="header-actions">
          <ShareWithFriendsButton shareData={shareData} label="Share Results" />
        </div>
      </header>

      {champion && (
        <div className="champion-banner run-champion">
          <span className="champion-label">Champion</span>
          <ParticipantCard participant={champion} />
        </div>
      )}

      {rankedParticipants.length > 0 && (
        <section className="setup-section">
          <h2>Final Rankings</h2>
          <ol className="rankings-list">
            {rankedParticipants.map(({ participant, rank }) => (
              <li key={participant.id} className="rankings-item">
                <span className="rank-badge">#{rank}</span>
                <ParticipantCard participant={participant} compact />
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="setup-section">
        <h2>Bracket</h2>
        <BracketOverview
          matches={bracket.matches}
          participants={bracket.participants}
          size={bracket.size}
          championId={bracket.championId}
        />
      </section>
    </div>
  );
}
