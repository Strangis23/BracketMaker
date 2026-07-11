import { useEffect, useRef, useState } from 'react';
import type { ShareListData } from '../share/shareList';
import { buildShareListText, copyText, getAppUrl } from '../share/shareList';

function rankLabel(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}

function ShareListPreview({ data }: { data: ShareListData }) {
  return (
    <div className="share-list-preview">
      <div className="share-list-header">
        <span className="share-list-title">Bracket Maker Results</span>
      </div>
      <div className="share-list-meta">
        <p>
          <span className="share-list-label">Bracket</span>
          {data.bracketName}
        </p>
        <p>
          <span className="share-list-label">By</span>
          {data.runnerName}
        </p>
      </div>
      <ol className="share-list-rankings">
        {data.rankedEntries.map((entry) => (
          <li
            key={`${entry.rank}-${entry.name}`}
            className={`share-list-item ${entry.rank <= 3 ? 'podium' : ''}`}
          >
            <span className="share-list-rank">{rankLabel(entry.rank)}</span>
            <span className="share-list-name">{entry.name}</span>
          </li>
        ))}
      </ol>
      <div className="share-list-footer">
        <span className="share-list-label">Play at</span>
        <a href={getAppUrl()} className="share-list-link">
          {getAppUrl()}
        </a>
      </div>
    </div>
  );
}

interface ShareModalProps {
  shareData: ShareListData;
  onClose: () => void;
}

export function ShareModal({ shareData, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareListText(shareData);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.select();
  }, []);

  const handleCopy = async () => {
    await copyText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card share-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="share-modal-title"
      >
        <header className="modal-header">
          <h2 id="share-modal-title">Share with Friends</h2>
          <button type="button" className="btn-text modal-close" onClick={onClose}>
            ×
          </button>
        </header>

        <p className="hint">
          Copy and send this list. Friends can paste it into Bracket Maker to import the
          teams and try their own bracket.
        </p>

        <ShareListPreview data={shareData} />

        <textarea
          ref={textareaRef}
          className="share-text-output"
          value={shareText}
          readOnly
          rows={8}
          onFocus={(event) => event.target.select()}
        />

        <div className="share-link-row">
          <button type="button" className="btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShareWithFriendsButtonProps {
  shareData: ShareListData | null;
  disabled?: boolean;
  label?: string;
}

export function ShareWithFriendsButton({
  shareData,
  disabled,
  label = 'Share with Friends',
}: ShareWithFriendsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!shareData) return null;

  return (
    <>
      <button
        type="button"
        className="btn-secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && <ShareModal shareData={shareData} onClose={() => setOpen(false)} />}
    </>
  );
}
