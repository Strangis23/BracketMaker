import { useEffect, useMemo, useState } from 'react';
import { BracketOverview } from './components/BracketOverview';
import { HistoryView } from './components/HistoryView';
import { PlayView } from './components/PlayView';
import { RunDetailView } from './components/RunDetailView';
import { SetupView } from './components/SetupView';
import { SharedBracketView } from './components/SharedBracketView';
import { TemplateDetailView } from './components/TemplateDetailView';
import { useBracket } from './bracket/useBracket';
import { getPlacements, placementsToArray } from './bracket/rankings';
import { buildSharePayload } from './share/buildSharePayload';
import {
  buildShareUrl,
  clearShareFromLocation,
  readSharePayloadFromLocation,
} from './share/shareCodec';
import type { SharedBracketPayload } from './share/buildSharePayload';
import './App.css';

function App() {
  const [sharedPayload, setSharedPayload] = useState<SharedBracketPayload | null>(() =>
    readSharePayloadFromLocation()
  );
  const [shareError, setShareError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=') && !sharedPayload) {
      setShareError(true);
    }
  }, [sharedPayload]);

  const {
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
    templates,
    runs,
    selectedTemplate,
    selectedRun,
    templateRuns,
    activeTemplateId,
    returnView,
  } = useBracket();

  const totalRounds = bracket ? Math.log2(bracket.size) : 0;
  const champion = bracket?.championId
    ? participantMap.get(bracket.championId) ?? null
    : null;

  const currentPlacements = useMemo(() => {
    if (!bracket || !complete) return [];
    return placementsToArray(
      getPlacements(
        bracket.matches,
        bracket.participants,
        bracket.size,
        bracket.championId
      )
    );
  }, [bracket, complete]);

  const activeTemplate = activeTemplateId
    ? templates.find((template) => template.id === activeTemplateId) ?? null
    : null;

  const activeTemplateRuns = useMemo(() => {
    if (!activeTemplateId) return [];
    return runs.filter((run) => run.templateId === activeTemplateId);
  }, [activeTemplateId, runs]);

  const completeShareUrl = useMemo(() => {
    if (!activeTemplate || !complete) return null;
    const payload = buildSharePayload(activeTemplate, activeTemplateRuns);
    return payload ? buildShareUrl(payload) : null;
  }, [activeTemplate, activeTemplateRuns, complete]);

  const completedTemplateCount = templates.filter((template) =>
    runs.some((run) => run.templateId === template.id && run.completedAt)
  ).length;

  const isPlaying = view === 'play' || view === 'overview';

  const handleCreateOwn = () => {
    clearShareFromLocation();
    setSharedPayload(null);
    setShareError(false);
  };

  if (shareError && !sharedPayload) {
    return (
      <div className="app">
        <main className="app-main">
          <div className="empty-state">
            <h1>Invalid Share Link</h1>
            <p className="hint">This link may be broken or incomplete.</p>
            <button type="button" className="btn-primary" onClick={handleCreateOwn}>
              Create Your Own Bracket
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (sharedPayload) {
    return (
      <div className="app">
        <main className="app-main">
          <SharedBracketView payload={sharedPayload} onCreateOwn={handleCreateOwn} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {isPlaying && bracket && (
        <nav className="app-nav">
          <div className="nav-tabs">
            <button
              type="button"
              className={view === 'play' ? 'active' : ''}
              onClick={() => setView('play')}
            >
              Play
            </button>
            <button
              type="button"
              className={view === 'overview' ? 'active' : ''}
              onClick={() => setView('overview')}
            >
              Bracket
            </button>
          </div>
          <div className="nav-actions">
            <button type="button" className="btn-text" onClick={openHistory}>
              History
            </button>
            <button type="button" className="btn-text" onClick={resetBracket}>
              New Bracket
            </button>
          </div>
        </nav>
      )}

      <main className="app-main">
        {view === 'setup' && (
          <SetupView
            bracketSize={bracketSize}
            onSizeChange={setBracketSize}
            templateName={templateName}
            onTemplateNameChange={setTemplateName}
            runnerName={runnerName}
            onRunnerNameChange={setRunnerName}
            entries={entries}
            onAddEntry={addEntry}
            onRemoveEntry={removeEntry}
            onUpdateEntry={updateEntry}
            onBulkImport={bulkImportTeams}
            onStart={startBracket}
            onOpenHistory={openHistory}
            historyCount={completedTemplateCount}
          />
        )}

        {view === 'play' && bracket && (
          <PlayView
            playableMatches={playableMatches}
            participantMap={participantMap}
            onPickWinner={pickWinner}
            totalRounds={totalRounds}
            complete={complete}
            champion={champion}
            placements={currentPlacements}
            onViewHistory={() => {
              if (activeTemplateId) {
                openTemplateDetail(activeTemplateId);
              } else {
                openHistory();
              }
            }}
            onRerun={() => {
              if (activeTemplateId) {
                openTemplateDetail(activeTemplateId);
              }
            }}
            templateName={activeTemplate?.name ?? null}
            shareUrl={completeShareUrl}
          />
        )}

        {view === 'overview' && bracket && (
          <BracketOverview
            matches={bracket.matches}
            participants={bracket.participants}
            size={bracket.size}
            championId={bracket.championId}
          />
        )}

        {view === 'history' && (
          <HistoryView
            templates={templates}
            runs={runs}
            onOpenTemplate={openTemplateDetail}
            onBack={() => setView(returnView)}
          />
        )}

        {view === 'template-detail' && selectedTemplate && (
          <TemplateDetailView
            template={selectedTemplate}
            runs={templateRuns}
            onBack={() => setView(returnView === 'setup' ? 'history' : returnView)}
            onOpenRun={openRunDetail}
            onRerun={rerunTemplate}
            onDeleteTemplate={removeTemplate}
            onDeleteRun={removeRun}
          />
        )}

        {view === 'run-detail' && selectedTemplate && selectedRun && (
          <RunDetailView
            template={selectedTemplate}
            run={selectedRun}
            onBack={() => openTemplateDetail(selectedTemplate.id)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
