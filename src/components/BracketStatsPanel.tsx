import type { BracketRun, BracketTemplate } from '../types';
import { computeAggregateStats, computeRunnerRankings } from '../bracket/stats';

function formatRank(rank: number): string {
  if (Number.isInteger(rank)) return String(rank);
  return rank.toFixed(1);
}

interface BracketStatsPanelProps {
  template: BracketTemplate;
  runs: BracketRun[];
}

export function BracketStatsPanel({ template, runs }: BracketStatsPanelProps) {
  const aggregateStats = computeAggregateStats(template, runs);
  const runnerRankings = computeRunnerRankings(template, runs);

  return (
    <>
      {aggregateStats.length > 0 && (
        <section className="setup-section">
          <h2>Aggregate Stats</h2>
          <p className="hint">
            Average finish across all completed runs. Best = highest placement (1 is best).
          </p>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Runs</th>
                  <th>Avg Rank</th>
                  <th>Best</th>
                  <th>Worst</th>
                </tr>
              </thead>
              <tbody>
                {aggregateStats.map((stat) => (
                  <tr key={stat.participantId}>
                    <td>
                      <div className="stats-team">
                        <span className="stats-avatar stats-avatar-placeholder">
                          {stat.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{stat.name}</span>
                      </div>
                    </td>
                    <td>{stat.runCount}</td>
                    <td>{formatRank(stat.avgRank)}</td>
                    <td className="rank-best">{stat.bestRank}</td>
                    <td className="rank-worst">{stat.worstRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {runnerRankings.length > 1 && (
        <section className="setup-section">
          <h2>Rankings by Person</h2>
          <p className="hint">Where each person ranked every team across their run.</p>
          <div className="stats-table-wrap">
            <table className="stats-table comparison-table">
              <thead>
                <tr>
                  <th>Team</th>
                  {runnerRankings.map((row) => (
                    <th key={row.runId}>{row.runnerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {template.roster.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="stats-team">
                        <span className="stats-avatar stats-avatar-placeholder">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{entry.name}</span>
                      </div>
                    </td>
                    {runnerRankings.map((row) => (
                      <td key={row.runId}>
                        {row.ranksByParticipant[entry.id] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
