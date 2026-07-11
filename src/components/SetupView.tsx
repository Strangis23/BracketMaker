import { useState } from 'react';
import { BRACKET_SIZES, type BracketSize, type TeamEntry } from '../types';
import type { BulkImportResult } from '../bracket/bulkImport';

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
          <label className="image-upload-label">
            <span>📷</span>
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
  onBulkImport: (text: string) => BulkImportResult;
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
  const [bulkText, setBulkText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const byeCount = bracketSize - entries.length;
  const filledCount = entries.filter((entry) => entry.name.trim()).length;

  const handleBulkImport = () => {
    const result = onBulkImport(bulkText);
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

    if (result.skipped > 0) {
      message += ` ${result.skipped} skipped (bracket size is ${bracketSize}).`;
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

      <section className="setup-section">
        <div className="section-header">
          <h2>Teams ({entries.length} / {bracketSize})</h2>
          {entries.length < bracketSize && (
            <button type="button" className="btn-secondary" onClick={onAddEntry}>
              + Add Team
            </button>
          )}
        </div>
        <p className="hint">
          Add a name and optional image for each team.
          {byeCount > 0 && (
            <span className="bye-note">
              {' '}
              {byeCount} slot{byeCount !== 1 ? 's' : ''} will be filled with byes.
            </span>
          )}
        </p>

        <div className="bulk-import">
          <label className="bulk-import-label" htmlFor="bulk-import-text">
            Bulk import
          </label>
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

      <button
        type="button"
        className="btn-primary btn-large"
        onClick={onStart}
        disabled={filledCount < 2}
      >
        Start Bracket
      </button>
    </div>
  );
}
