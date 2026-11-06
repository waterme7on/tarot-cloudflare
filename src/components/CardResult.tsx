import { useState } from 'react';
import type { DrawResponse, DrawnCard } from '../lib/schema';
import { hasArt } from '../lib/artwork';
import HoloCard from './HoloCard';
import { ShareCard } from './ShareCard';

function initials(name: string): string {
  return name
    .split(' ')
    .filter((w) => !['of', 'the'].includes(w.toLowerCase()))
    .map((w) => w[0])
    .join('')
    .slice(0, 3);
}

export function TarotCardFace({ card, index = 0, reveal = true }: { card: DrawnCard; index?: number; reveal?: boolean }) {
  return (
    <div>
      {hasArt(card.slug) ? (
        <HoloCard slug={card.slug} name={card.name} orientation={card.orientation} reveal={reveal} revealDelayMs={350 + index * 650} width={180} />
      ) : (
        <div className={`tarot-card ${card.orientation}`} aria-hidden="true">
          <div className="glyph">{initials(card.name)}</div>
          <div className="name">{card.name}</div>
        </div>
      )}
      <p className="result-meta" style={{ marginTop: '.5rem' }}>
        {card.positionLabel} · {card.orientation}
      </p>
    </div>
  );
}

export function CardResult({ reading, question, onReset, reveal = true }: { reading: DrawResponse; question?: string; onReset?: () => void; reveal?: boolean }) {
  const [checkout, setCheckout] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [consent, setConsent] = useState(false);
  const product = reading.spread === 'one-card' ? 'single' : 'three';
  const price = product === 'single' ? '$4.99' : '$9.99';

  const startCheckout = async () => {
    setCheckout({ loading: true, error: null });
    try {
      const turnstileToken = window.turnstile?.getResponse();
      const res = await fetch('/api/v1/report/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: reading.publicToken, product, turnstileToken, userSummary: consent ? question : undefined, consent }),
      });
      const data = (await res.json()) as { checkoutUrl?: string; error?: { message: string } };
      if (!res.ok || !data.checkoutUrl) {
        setCheckout({ loading: false, error: data.error?.message ?? 'Checkout unavailable right now.' });
        return;
      }
      location.href = data.checkoutUrl;
    } catch {
      setCheckout({ loading: false, error: 'Network error.' });
    }
  };

  return (
    <section className="card" aria-live="polite">
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>{reading.headline}</h2>
      {reading.yesNo && (
        <p style={{ textAlign: 'center', fontSize: '1.4rem', fontFamily: 'var(--font)', color: 'var(--gold2)' }}>
          Lean: <strong>{reading.yesNo.toUpperCase()}</strong>
        </p>
      )}
      <div className="result-cards">
        {reading.cards.map((c, i) => (
          <TarotCardFace key={c.position} card={c} index={i} reveal={reveal} />
        ))}
      </div>
      {reading.cards.map((c) => (
        <p key={c.position}>
          <strong>
            <a href={`/cards/${c.slug}/`}>{c.name}</a> ({c.orientation})
          </strong>
          : {c.summary} <span className="muted small">Keywords: {c.keywords.join(', ')}</span>
        </p>
      ))}
      <div className="callout">
        <p>
          <strong>Reading:</strong> {reading.summary}
        </p>
        <p>
          <strong>Next action:</strong> {reading.nextAction}
        </p>
        <p className="muted small" style={{ margin: 0 }}>
          {reading.limitation}
        </p>
      </div>

      <ShareCard reading={reading} />

      <div className="card" style={{ marginTop: '1.5rem', borderColor: 'var(--gold)' }}>
        <h3 style={{ marginTop: 0 }}>Get the full reading — {price}</h3>
        <p className="muted small">
          A private, AI-assisted deep report: each card interpreted for your question type, a synthesis, three concrete next steps and a journaling prompt. Delivered in minutes to a private link. If it fails to generate within 10 minutes you are refunded automatically. Entertainment only.
        </p>
        {question && (
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 'auto', marginTop: '.3rem' }} />
            <span>Include my question ("{question.slice(0, 80)}") in the report. It will be sent to Cloudflare Workers AI and stored with the order.</span>
          </label>
        )}
        {checkout.error && <p className="error">{checkout.error}</p>}
        <div className="btn-row">
          <button type="button" className="btn" onClick={startCheckout} disabled={checkout.loading}>
            {checkout.loading ? 'Opening checkout…' : 'Get the full reading'}
          </button>
          {onReset && (
            <button type="button" className="btn btn-ghost" onClick={onReset}>
              Draw again
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
