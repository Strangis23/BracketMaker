import type { Match, Participant } from '../types';
import { getRoundName } from '../bracket/utils';
import { ParticipantCard } from './ParticipantCard';

interface BracketOverviewProps {
  matches: Match[];
  participants: Participant[];
  size: number;
  championId: string | null;
}

export function BracketOverview({
  matches,
  participants,
  size,
  championId,
}: BracketOverviewProps) {
  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const totalRounds = Math.log2(size);
  const rounds: Match[][] = [];

  for (let r = 0; r < totalRounds; r++) {
    rounds.push(
      matches
        .filter((m) => m.round === r)
        .sort((a, b) => a.position - b.position)
    );
  }

  const eliminatedIds = new Set<string>();
  for (const m of matches) {
    if (m.loserId && !participantMap.get(m.loserId)?.isBye) {
      eliminatedIds.add(m.loserId);
    }
  }

  return (
    <div className="bracket-overview">
      <div className="bracket-scroll">
        <div className="bracket-tree">
          {rounds.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="bracket-round">
              <h3 className="round-title">{getRoundName(roundIndex, totalRounds)}</h3>
              <div className="round-matches">
                {roundMatches.map((match) => (
                  <OverviewMatch
                    key={match.id}
                    match={match}
                    participantMap={participantMap}
                    eliminatedIds={eliminatedIds}
                    championId={championId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface OverviewMatchProps {
  match: Match;
  participantMap: Map<string, Participant>;
  eliminatedIds: Set<string>;
  championId: string | null;
}

function OverviewMatch({
  match,
  participantMap,
  eliminatedIds,
  championId,
}: OverviewMatchProps) {
  const p1 = match.participant1Id ? participantMap.get(match.participant1Id) : null;
  const p2 = match.participant2Id ? participantMap.get(match.participant2Id) : null;

  if (!p1 || !p2) {
    return <div className="overview-match empty" />;
  }

  const renderSlot = (p: Participant) => {
    const isWinner = match.winnerId === p.id;
    const isLoser = match.loserId === p.id && !p.isBye;
    const isChampion = championId === p.id;

    return (
      <div
        key={p.id}
        className={[
          'overview-slot',
          isWinner ? 'winner' : '',
          isLoser ? 'loser' : '',
          isChampion ? 'champion' : '',
          p.isBye ? 'bye' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <ParticipantCard
          participant={p}
          compact
          eliminated={eliminatedIds.has(p.id) && !isChampion}
          selected={isWinner}
        />
      </div>
    );
  };

  return (
    <div className="overview-match">
      {renderSlot(p1)}
      <div className="overview-vs">vs</div>
      {renderSlot(p2)}
    </div>
  );
}
