import { useEffect, useRef, useState } from 'react';
import { copyShareUrl } from '../share/shareCodec';

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}

export function ShareModal({ shareUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleCopy = async () => {
    await copyShareUrl(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
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
          Anyone with this link can view the bracket results and stats. No account needed.
        </p>

        <div className="share-link-row">
          <input
            ref={inputRef}
            type="text"
            className="entry-name-input share-link-input"
            value={shareUrl}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <button type="button" className="btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShareWithFriendsButtonProps {
  shareUrl: string | null;
  disabled?: boolean;
  label?: string;
}

export function ShareWithFriendsButton({
  shareUrl,
  disabled,
  label = 'Share with Friends',
}: ShareWithFriendsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!shareUrl) return null;

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
      {open && <ShareModal shareUrl={shareUrl} onClose={() => setOpen(false)} />}
    </>
  );
}
