import { useState } from 'react';
import { BRACKET_SIZES, type BracketSize, type TeamEntry } from '../types';
import {
  countImportNames,
  MAX_TEAMS,
  suggestBracketSize,
  type BulkImportResult,
} from '../bracket/bulkImport';

interface TeamEntryRowProps {
  index: number;
  name: string;
  imageUrl: string | null;
  onNameChange: (name: string) => void;
  onImageChange: (imageUrl: string | null) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function TeamEntryRow({
  index,
  name,
  imageUrl,
  onNameChange,
  onImageChange,
  onRemove,
  canRemove,
}: TeamEntryRowProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="team-entry-row">
      <span className="entry-number">{index + 1}</span>
      <div className="entry-image">
        {imageUrl ? (
          <div className="entry-image-preview">
            <img src={imageUrl} alt="" />
            <button
              type="button"
              className="remove-image"
              onClick={() => onImageChange(null)}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="image-upload-label" aria-label="Add team image">
            <svg
              className="upload-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 16V8m0 0-2.5 2.5M12 8l2.5 2.5M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        )}
      </div>
      <input
        type="text"
        className="entry-name-input"
        placeholder={`Team ${index + 1}`}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      {canRemove && (
        <button type="button" className="remove-entry" onClick={onRemove} aria-label="Remove">
          ×
        </button>
      )}
    </div>
  );
}

interface SetupViewProps {
  bracketSize: BracketSize;
  onSizeChange: (size: BracketSize) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  runnerName: string;
  onRunnerNameChange: (name: string) => void;
  entries: TeamEntry[];
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (index: number, update: Partial<TeamEntry>) => void;
  onBulkImport: (text: string, targetBracketSize?: BracketSize) => BulkImportResult;
  onStart: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function SetupView({
  bracketSize,
  onSizeChange,
  templateName,
  onTemplateNameChange,
  runnerName,
  onRunnerNameChange,
  entries,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
  onBulkImport,
  onStart,
  onOpenHistory,
  historyCount,
}: SetupViewProps) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const byeCount = bracketSize - entries.length;
  const filledCount = entries.filter((entry) => entry.name.trim()).length;

  const handleBulkImport = () => {
    const { names } = countImportNames(bulkText);

    if (names.length === 0) {
      setImportMessage(
        'No team names found. Paste one name per line, or a shared Bracket Maker results list.'
      );
      return;
    }

    if (names.length > MAX_TEAMS) {
      setImportMessage(
        `Too many teams (${names.length}). The maximum bracket size is ${MAX_TEAMS} teams.`
      );
      return;
    }

    let targetBracketSize = bracketSize;
    const previousBracketSize = bracketSize;

    if (names.length > bracketSize) {
      const suggestedSize = suggestBracketSize(names.length);
      if (!suggestedSize) {
        setImportMessage(
          `Too many teams (${names.length}). The maximum bracket size is ${MAX_TEAMS} teams.`
        );
        return;
      }

      const increaseSize = window.confirm(
        `You pasted ${names.length} teams, but the bracket size is ${bracketSize}. Change bracket size to ${suggestedSize} and import all teams?`
      );

      if (increaseSize) {
        targetBracketSize = suggestedSize;
        onSizeChange(suggestedSize);
      }
    }

    const result = onBulkImport(bulkText, targetBracketSize);

    if (result.imported === 0) {
      setImportMessage(
        'No team names found. Paste one name per line, or a shared Bracket Maker results list.'
      );
      return;
    }

    if (result.bracketName) onTemplateNameChange(result.bracketName);
    if (result.runnerName) onRunnerNameChange(result.runnerName);

    let message = result.fromSharedList
      ? `Imported shared results: ${result.imported} teams in ranking order.`
      : `Imported ${result.imported} team${result.imported !== 1 ? 's' : ''}.`;

    if (targetBracketSize > previousBracketSize) {
      message += ` Bracket size updated to ${targetBracketSize}.`;
    }

    if (result.skipped > 0) {
      message += ` ${result.skipped} skipped (bracket size is ${targetBracketSize}).`;
    }

    setImportMessage(message);
    setBulkText('');
  };

  return (
    <div className="setup-view">
      <header className="page-header">
        <div className="setup-header-row">
          <div>
            <h1>Bracket Maker</h1>
            <p className="subtitle">Build a single-elimination tournament bracket</p>
          </div>
          <button type="button" className="btn-secondary" onClick={onOpenHistory}>
            History{historyCount > 0 ? ` (${historyCount})` : ''}
          </button>
        </div>
      </header>

      <section className="setup-section">
        <h2>Bracket Name</h2>
        <p className="hint">Saved brackets can be rerun later to compare rankings.</p>
        <input
          type="text"
          className="entry-name-input full-width"
          placeholder="Untitled Bracket"
          value={templateName}
          onChange={(event) => onTemplateNameChange(event.target.value)}
        />
      </section>

      <section className="setup-section">
        <h2>Your Name</h2>
        <p className="hint">Who is filling out this bracket? Used when comparing runs.</p>
        <input
          type="text"
          className="entry-name-input full-width"
          placeholder="Your name"
          value={runnerName}
          onChange={(event) => onRunnerNameChange(event.target.value)}
        />
      </section>

      <section className="setup-section">
        <h2>Bracket Size</h2>
        <p className="hint">Choose the tournament size. Empty slots become byes.</p>
        <div className="size-grid">
          {BRACKET_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`size-btn ${bracketSize === size ? 'active' : ''}`}
              onClick={() => onSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="setup-section setup-section-teams">
        <div className="section-header">
          <div>
            <h2>Teams</h2>
            <p className="section-meta">
              {entries.length} of {bracketSize} slots filled
              {byeCount > 0 && (
                <span className="bye-note">
                  {' · '}
                  {byeCount} bye{byeCount !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          {entries.length < bracketSize && (
            <button type="button" className="btn-secondary" onClick={onAddEntry}>
              + Add Team
            </button>
          )}
        </div>
        <p className="hint">Add a name and optional image for each team.</p>

        <div className="bulk-import-section">
          <button
            type="button"
            className="bulk-import-toggle"
            onClick={() => setBulkOpen((open) => !open)}
            aria-expanded={bulkOpen}
          >
            <span>Bulk import</span>
            <span className="bulk-import-chevron" aria-hidden="true">
              {bulkOpen ? '▾' : '▸'}
            </span>
          </button>

          {bulkOpen && (
            <div className="bulk-import">
              <p className="hint">
                Paste team names (one per line) or a shared Bracket Maker results list from a
                friend.
              </p>
              <textarea
                id="bulk-import-text"
                className="bulk-import-textarea"
                placeholder={'Team Alpha\nTeam Beta\nTeam Gamma'}
                value={bulkText}
                rows={5}
                onChange={(event) => {
                  setBulkText(event.target.value);
                  if (importMessage) setImportMessage(null);
                }}
              />
              <div className="bulk-import-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                >
                  Import Teams
                </button>
                {importMessage && <p className="import-message">{importMessage}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="team-entries">
          {entries.map((entry, index) => (
            <TeamEntryRow
              key={entry.id}
              index={index}
              name={entry.name}
              imageUrl={entry.imageUrl}
              onNameChange={(name) => onUpdateEntry(index, { name })}
              onImageChange={(imageUrl) => onUpdateEntry(index, { imageUrl })}
              onRemove={() => onRemoveEntry(index)}
              canRemove={entries.length > 1}
            />
          ))}
        </div>
      </section>

      <div className="setup-actions">
        <button
          type="button"
          className="btn-primary btn-large"
          onClick={onStart}
          disabled={filledCount < 2}
        >
          Start Bracket
        </button>
        {filledCount < 2 && (
          <p className="setup-actions-hint">Add at least 2 teams to begin.</p>
        )}
      </div>
    </div>
  );
}
