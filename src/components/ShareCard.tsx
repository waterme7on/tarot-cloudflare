import { useState } from 'react';
import type { DrawResponse } from '../lib/schema';

export function ShareCard({ reading }: { reading: DrawResponse }) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const sharePath = `/reading/${reading.publicToken}/`;
  const imageUrl = `/api/v1/share/${reading.publicToken}.svg`;

  const trackShare = (channel: string) =>
    void fetch('/api/v1/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'share_clicked', readingId: reading.readingId, route: location.pathname, meta: { channel } }) });

  const copy = async () => {
    setShareError('');
    try {
      await navigator.clipboard.writeText(new URL(sharePath, location.origin).href);
      setCopied(true);
      trackShare('copy');
    } catch {
      setShareError('Copy is unavailable. Open the reading link below and share it from your browser.');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: reading.headline, text: reading.summary.slice(0, 140), url: new URL(sharePath, location.origin).href });
        trackShare('native');
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) setShareError('Sharing is unavailable. Try copying the link instead.');
      }
    } else {
      await copy();
    }
  };

  return (
    <div className="btn-row share-actions" aria-label="Share">
      {shareError && <p className="flow-error" role="status">{shareError}</p>}
      <button type="button" className="btn btn-ghost" onClick={nativeShare}>
        Share result
      </button>
      <button type="button" className="btn btn-ghost" onClick={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <a className="btn btn-ghost" href={imageUrl} download={`tarot-${reading.publicToken}.svg`} onClick={() => trackShare('image')}>
        Download share image
      </a>
    </div>
  );
}
