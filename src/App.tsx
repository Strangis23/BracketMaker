import { BracketOverview } from './components/BracketOverview';
import { PlayView } from './components/PlayView';
import { SetupView } from './components/SetupView';
import { useBracket } from './bracket/useBracket';
import './App.css';

function App() {
  const {
    view,
    setView,
    bracketSize,
    setBracketSize,
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    startBracket,
    pickWinner,
    resetBracket,
    bracket,
    participantMap,
    playableMatches,
    complete,
  } = useBracket();

  const totalRounds = bracket ? Math.log2(bracket.size) : 0;
  const champion = bracket?.championId
    ? participantMap.get(bracket.championId) ?? null
    : null;

  return (
    <div className="app">
      {view !== 'setup' && bracket && (
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
          <button type="button" className="btn-text" onClick={resetBracket}>
            New Bracket
          </button>
        </nav>
      )}

      <main className="app-main">
        {view === 'setup' && (
          <SetupView
            bracketSize={bracketSize}
            onSizeChange={setBracketSize}
            entries={entries}
            onAddEntry={addEntry}
            onRemoveEntry={removeEntry}
            onUpdateEntry={updateEntry}
            onStart={startBracket}
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
      </main>
    </div>
  );
}

export default App;
