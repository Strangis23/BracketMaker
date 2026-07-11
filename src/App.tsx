import { useMemo } from 'react';
import { BracketOverview } from './components/BracketOverview';
import { HistoryView } from './components/HistoryView';
import { PlayView } from './components/PlayView';
import { RunDetailView } from './components/RunDetailView';
import { SetupView } from './components/SetupView';
import { TemplateDetailView } from './components/TemplateDetailView';
import { useBracket } from './bracket/useBracket';
import { getPlacements, placementsToArray } from './bracket/rankings';
import { buildShareListFromRun } from './share/shareList';
import './App.css';

function App() {
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
    activeRunId,
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

  const activeRun = useMemo(() => {
    if (!activeRunId) return null;
    return runs.find((run) => run.id === activeRunId) ?? null;
  }, [activeRunId, runs]);

  const completeShareData = useMemo(() => {
    if (!activeTemplate || !activeRun) return null;
    return buildShareListFromRun(activeTemplate, activeRun);
  }, [activeTemplate, activeRun]);

  const completedTemplateCount = templates.filter((template) =>
    runs.some((run) => run.templateId === template.id && run.completedAt)
  ).length;

  const isPlaying = view === 'play' || view === 'overview';

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
            shareData={completeShareData}
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
