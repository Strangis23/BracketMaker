import type { BracketTemplate, BracketRun } from '../types';

interface HistoryViewProps {
  templates: BracketTemplate[];
  runs: BracketRun[];
  onOpenTemplate: (templateId: string) => void;
  onBack: () => void;
}

export function HistoryView({
  templates,
  runs,
  onOpenTemplate,
  onBack,
}: HistoryViewProps) {
  const runCountByTemplate = new Map<string, number>();
  for (const run of runs) {
    if (!run.completedAt) continue;
    runCountByTemplate.set(
      run.templateId,
      (runCountByTemplate.get(run.templateId) ?? 0) + 1
    );
  }

  return (
    <div className="history-view">
      <header className="page-header">
        <button type="button" className="btn-text back-link" onClick={onBack}>
          ← Back
        </button>
        <h1>Bracket History</h1>
        <p className="subtitle">Previously run brackets and aggregate stats</p>
      </header>

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No saved brackets yet.</p>
          <p className="hint">Complete a bracket and it will appear here automatically.</p>
        </div>
      ) : (
        <div className="history-list">
          {templates.map((template) => {
            const completedRuns = runCountByTemplate.get(template.id) ?? 0;
            return (
              <button
                key={template.id}
                type="button"
                className="history-card"
                onClick={() => onOpenTemplate(template.id)}
              >
                <div className="history-card-main">
                  <h2>{template.name}</h2>
                  <p className="history-card-meta">
                    {template.size}-team bracket · {template.roster.length} teams ·{' '}
                    {completedRuns} completed run{completedRuns !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="history-card-arrow">→</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
