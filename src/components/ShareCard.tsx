import { useState } from 'react';
import type { DrawResponse } from '../lib/schema';

export function ShareCard({ reading }: { reading: DrawResponse }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${location.origin}/reading/${reading.publicToken}/`;
  const imageUrl = `/api/v1/share/${reading.publicToken}.svg`;

  const trackShare = (channel: string) =>
    void fetch('/api/v1/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'share_clicked', readingId: reading.readingId, route: location.pathname, meta: { channel } }) });

  const copy = async () => {
    await navigator.clipboard.writeText(`${reading.headline} — ${reading.summary.slice(0, 140)}… ${shareUrl}`);
    setCopied(true);
    trackShare('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: reading.headline, text: reading.summary.slice(0, 140), url: shareUrl }).catch(() => undefined);
      trackShare('native');
    } else {
      await copy();
    }
  };

  return (
    <div className="btn-row" aria-label="Share">
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
