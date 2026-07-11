import { BRACKET_SIZES, type BracketSize } from '../types';

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
  entries: { name: string; imageUrl: string | null }[];
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
  onUpdateEntry: (index: number, update: { name?: string; imageUrl?: string | null }) => void;
  onStart: () => void;
}

export function SetupView({
  bracketSize,
  onSizeChange,
  entries,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
  onStart,
}: SetupViewProps) {
  const byeCount = bracketSize - entries.length;
  const filledCount = entries.filter((e) => e.name.trim()).length;

  return (
    <div className="setup-view">
      <header className="page-header">
        <h1>Bracket Maker</h1>
        <p className="subtitle">Build a single-elimination tournament bracket</p>
      </header>

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
            <span className="bye-note"> {byeCount} slot{byeCount !== 1 ? 's' : ''} will be filled with byes.</span>
          )}
        </p>
        <div className="team-entries">
          {entries.map((entry, i) => (
            <TeamEntryRow
              key={i}
              index={i}
              name={entry.name}
              imageUrl={entry.imageUrl}
              onNameChange={(name) => onUpdateEntry(i, { name })}
              onImageChange={(imageUrl) => onUpdateEntry(i, { imageUrl })}
              onRemove={() => onRemoveEntry(i)}
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
