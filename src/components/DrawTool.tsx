import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrawResponse, QuestionType, Spread } from '../lib/schema';
import { CardResult } from './CardResult';

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void; getResponse: (id?: string) => string | undefined };
  }
}

const QUESTION_LABELS: Record<QuestionType, string> = { general: 'General', love: 'Love', career: 'Career', money: 'Money', decision: 'Yes / No decision' };
const SPREAD_LABELS: Record<Spread, string> = { 'one-card': 'One card', 'three-card': 'Three cards', 'celtic-cross': 'Celtic Cross (10)' };

interface Props {
  defaultSpread?: Spread;
  defaultQuestionType?: QuestionType;
  lockSpread?: boolean;
  heading?: string;
}

function uuid(): string {
  return crypto.randomUUID();
}

export default function DrawTool({ defaultSpread = 'one-card', defaultQuestionType = 'general', lockSpread = false, heading }: Props) {
  const [spread, setSpread] = useState<Spread>(defaultSpread);
  const [questionType, setQuestionType] = useState<QuestionType>(defaultQuestionType);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrawResponse | null>(null);
  const idemRef = useRef<string>(uuid());
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const siteKey = typeof document !== 'undefined' ? document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content : undefined;

  useEffect(() => {
    if (!siteKey || !turnstileRef.current) return;
    const tryRender = () => {
      if (window.turnstile && turnstileRef.current && !widgetId.current) {
        widgetId.current = window.turnstile.render(turnstileRef.current, { sitekey: siteKey, size: 'flexible', theme: 'dark' });
        return true;
      }
      return false;
    };
    if (!tryRender()) {
      const t = setInterval(() => tryRender() && clearInterval(t), 300);
      return () => clearInterval(t);
    }
  }, [siteKey]);

  const draw = useCallback(async () => {
    setLoading(true);
    setError(null);
    const turnstileToken = siteKey ? window.turnstile?.getResponse(widgetId.current ?? undefined) : undefined;
    if (siteKey && !turnstileToken) {
      setError('Please complete the human check first.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/v1/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spread, questionType, locale: 'en', idempotencyKey: idemRef.current, turnstileToken, questionLength: question.trim().length }),
      });
      const data = (await res.json()) as DrawResponse & { error?: { message: string; retryAfterSeconds?: number } };
      if (!res.ok || data.error) {
        setError(data.error?.message ?? 'Something went wrong. Please try again.');
        if (siteKey) window.turnstile?.reset(widgetId.current ?? undefined);
        return;
      }
      setResult(data);
      history.replaceState(null, '', `/reading/${data.publicToken}/`);
      void fetch('/api/v1/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'report_cta_viewed', readingId: data.readingId, route: location.pathname }) });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [spread, questionType, question, siteKey]);

  const reset = () => {
    setResult(null);
    idemRef.current = uuid();
    if (siteKey) window.turnstile?.reset(widgetId.current ?? undefined);
    history.replaceState(null, '', location.pathname.startsWith('/reading/') ? '/' : location.pathname);
  };

  if (result) {
    return <CardResult reading={result} question={question} onReset={reset} />;
  }

  return (
    <section className="card" aria-labelledby="draw-heading">
      <h2 id="draw-heading" style={{ marginTop: 0 }}>
        {heading ?? 'Draw a card'}
      </h2>
      {!lockSpread && (
        <>
          <label htmlFor="spread">Spread</label>
          <div className="chips" role="group" aria-label="Spread">
            {(Object.keys(SPREAD_LABELS) as Spread[]).map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={spread === s} onClick={() => setSpread(s)}>
                {SPREAD_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
      <label>Question type</label>
      <div className="chips" role="group" aria-label="Question type">
        {(Object.keys(QUESTION_LABELS) as QuestionType[]).map((q) => (
          <button key={q} type="button" className="chip" aria-pressed={questionType === q} onClick={() => setQuestionType(q)}>
            {QUESTION_LABELS[q]}
          </button>
        ))}
      </div>
      <label htmlFor="question">Your question (optional, stays on your device)</label>
      <input id="question" type="text" maxLength={200} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Should I take the new job?" autoComplete="off" />
      {siteKey && <div ref={turnstileRef} style={{ marginTop: '1rem' }} />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={draw} disabled={loading}>
          {loading ? 'Shuffling…' : 'Draw a Card'}
        </button>
      </div>
      <p className="muted small" style={{ marginTop: '1rem' }}>
        Cards are drawn on Cloudflare's edge with cryptographically secure randomness. Your question is never sent or stored.
      </p>
    </section>
  );
}
