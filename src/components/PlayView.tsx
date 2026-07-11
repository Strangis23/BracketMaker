import type { Match, Participant, RunPlacement } from '../types';
import { getRoundName } from '../bracket/utils';
import { ParticipantCard } from './ParticipantCard';
import { ShareWithFriendsButton } from './ShareModal';

interface MatchViewProps {
  match: Match;
  participantMap: Map<string, Participant>;
  onPickWinner: (winnerId: string) => void;
  totalRounds: number;
}

export function MatchView({
  match,
  participantMap,
  onPickWinner,
  totalRounds,
}: MatchViewProps) {
  const p1 = match.participant1Id ? participantMap.get(match.participant1Id) : null;
  const p2 = match.participant2Id ? participantMap.get(match.participant2Id) : null;

  if (!p1 || !p2) return null;

  return (
    <div className="match-view">
      <div className="match-header">
        <span className="match-round">{getRoundName(match.round, totalRounds)}</span>
        <span className="match-label">Tap to pick the winner</span>
      </div>
      <div className="matchup">
        <ParticipantCard participant={p1} onClick={() => onPickWinner(p1.id)} />
        <div className="vs-badge">VS</div>
        <ParticipantCard participant={p2} onClick={() => onPickWinner(p2.id)} />
      </div>
    </div>
  );
}

interface PlayViewProps {
  playableMatches: Match[];
  participantMap: Map<string, Participant>;
  onPickWinner: (matchId: string, winnerId: string) => void;
  totalRounds: number;
  complete: boolean;
  champion: Participant | null;
  placements: RunPlacement[];
  onViewHistory: () => void;
  onRerun: () => void;
  templateName: string | null;
  shareUrl: string | null;
}

export function PlayView({
  playableMatches,
  participantMap,
  onPickWinner,
  totalRounds,
  complete,
  champion,
  placements,
  onViewHistory,
  onRerun,
  templateName,
  shareUrl,
}: PlayViewProps) {
  if (complete && champion) {
    const rankedParticipants = placements
      .map((placement) => {
        const participant = participantMap.get(placement.participantId);
        if (!participant || participant.isBye) return null;
        return { participant, rank: placement.rank };
      })
      .filter(
        (item): item is { participant: Participant; rank: number } => item !== null
      );

    return (
      <div className="play-view complete">
        <div className="champion-banner">
          <span className="champion-label">Champion</span>
          <ParticipantCard participant={champion} />
        </div>
        <p className="complete-message">Your bracket is complete and saved!</p>

        {rankedParticipants.length > 1 && (
          <section className="setup-section complete-rankings">
            <h2>Final Rankings</h2>
            <ol className="rankings-list compact-rankings">
              {rankedParticipants.slice(0, 8).map(({ participant, rank }) => (
                <li key={participant.id} className="rankings-item">
                  <span className="rank-badge">#{rank}</span>
                  <ParticipantCard participant={participant} compact />
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="complete-actions">
          <ShareWithFriendsButton shareUrl={shareUrl} />
          {templateName && (
            <button type="button" className="btn-secondary" onClick={onRerun}>
              Run Again
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onViewHistory}>
            View History & Stats
          </button>
        </div>
      </div>
    );
  }

  if (playableMatches.length === 0) {
    return (
      <div className="play-view waiting">
        <p>Waiting for next match…</p>
      </div>
    );
  }

  const current = playableMatches[0];
  const roundName = getRoundName(current.round, totalRounds);

  return (
    <div className="play-view">
      {playableMatches.length > 1 && (
        <p className="queue-info">
          {playableMatches.length} matches remaining in {roundName}
        </p>
      )}
      <MatchView
        match={current}
        participantMap={participantMap}
        onPickWinner={(winnerId) => onPickWinner(current.id, winnerId)}
        totalRounds={totalRounds}
      />
    </div>
  );
}
