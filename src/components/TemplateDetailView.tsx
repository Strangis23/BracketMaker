import { useMemo, useState } from 'react';
import type { BracketRun, BracketTemplate } from '../types';
import { buildShareListFromRun } from '../share/shareList';
import { BracketStatsPanel } from './BracketStatsPanel';
import { ShareWithFriendsButton } from './ShareModal';

interface TemplateDetailViewProps {
  template: BracketTemplate;
  runs: BracketRun[];
  onBack: () => void;
  onOpenRun: (runId: string) => void;
  onRerun: (templateId: string, runnerName: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDeleteRun: (runId: string) => void;
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

export function TemplateDetailView({
  template,
  runs,
  onBack,
  onOpenRun,
  onRerun,
  onDeleteTemplate,
  onDeleteRun,
}: TemplateDetailViewProps) {
  const [runnerName, setRunnerName] = useState('');
  const completedRuns = runs.filter((run) => run.completedAt);
  const latestRun = completedRuns[0] ?? null;
  const shareData = useMemo(
    () => (latestRun ? buildShareListFromRun(template, latestRun) : null),
    [latestRun, template]
  );

  return (
    <div className="template-detail-view">
      <header className="page-header">
        <button type="button" className="btn-text back-link" onClick={onBack}>
          ← History
        </button>
        <h1>{template.name}</h1>
        <p className="subtitle">
          {template.size}-team bracket · {completedRuns.length} completed run
          {completedRuns.length !== 1 ? 's' : ''}
        </p>
        <div className="header-actions">
          <ShareWithFriendsButton
            shareData={shareData}
            label={latestRun ? `Share ${latestRun.runnerName}'s Results` : 'Share Results'}
          />
        </div>
      </header>

      <section className="setup-section">
        <h2>Run Again</h2>
        <p className="hint">
          Use the same teams and let a friend fill out their own bracket. Each run is saved
          separately so you can compare rankings.
        </p>
        <div className="rerun-form">
          <input
            type="text"
            className="entry-name-input"
            placeholder="Who is filling out this bracket?"
            value={runnerName}
            onChange={(event) => setRunnerName(event.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => onRerun(template.id, runnerName)}
          >
            Start New Run
          </button>
        </div>
      </section>

      <BracketStatsPanel template={template} runs={runs} />

      <section className="setup-section">
        <div className="section-header">
          <h2>Previous Runs</h2>
          <button
            type="button"
            className="btn-text danger"
            onClick={() => {
              if (confirm(`Delete "${template.name}" and all of its runs?`)) {
                onDeleteTemplate(template.id);
              }
            }}
          >
            Delete Bracket
          </button>
        </div>

        {completedRuns.length === 0 ? (
          <p className="hint">No completed runs yet.</p>
        ) : (
          <div className="run-list">
            {completedRuns.map((run) => {
              const champion = template.roster.find(
                (entry) => entry.id === run.championId
              );
              return (
                <div key={run.id} className="run-card">
                  <button
                    type="button"
                    className="run-card-main"
                    onClick={() => onOpenRun(run.id)}
                  >
                    <div>
                      <strong>{run.runnerName}</strong>
                      <p className="history-card-meta">
                        {formatDate(run.completedAt!)}
                        {champion ? ` · Champion: ${champion.name}` : ''}
                      </p>
                    </div>
                    <span className="history-card-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    className="btn-text danger"
                    onClick={() => {
                      if (confirm(`Delete this run by ${run.runnerName}?`)) {
                        onDeleteRun(run.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
