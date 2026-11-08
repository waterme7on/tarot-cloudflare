import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import CardBack from './CardBack';
import { CardResult } from './CardResult';
import type { DrawResponse, QuestionType, Spread } from '../lib/schema';

type Stage = 'prepare' | 'deck' | 'shuffling' | 'choose';
type Topic = { value: QuestionType; label: string };
const TOPICS: Topic[] = [
  { value: 'general', label: 'Everyday' },
  { value: 'love', label: 'Love' },
  { value: 'career', label: 'Career' },
  { value: 'money', label: 'Money' },
  { value: 'decision', label: 'A decision' },
];
const SPREADS: { value: Spread; label: string; caption: string; count: number }[] = [
  { value: 'one-card', label: 'One card', caption: 'A little clarity', count: 1 },
  { value: 'three-card', label: 'Three cards', caption: 'Past · Present · Future', count: 3 },
  { value: 'celtic-cross', label: 'Ten cards', caption: 'A deeper look', count: 10 },
];
const CROSS_POSITIONS = ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'Outside', 'Hopes', 'Outcome'];
const VISIBLE = [-3, -2, -1, 0, 1, 2, 3];

interface Props {
  defaultSpread?: Spread;
  defaultQuestionType?: QuestionType;
  lockSpread?: boolean;
  heading?: string;
}

function wrapPosition(position: number): number {
  return ((position % 78) + 78) % 78;
}

export default function RitualDraw({ defaultSpread = 'one-card', defaultQuestionType = 'general', lockSpread = false }: Props) {
  const id = useId();
  const [stage, setStage] = useState<Stage>('prepare');
  const [spread, setSpread] = useState<Spread>(defaultSpread);
  const [topic, setTopic] = useState<QuestionType>(defaultQuestionType);
  const [question, setQuestion] = useState('');
  const [focus, setFocus] = useState(39);
  const [selected, setSelected] = useState<number[]>([]);
  const [reading, setReading] = useState<DrawResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState('');
  const deckTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestController = useRef<AbortController | null>(null);
  const requestPending = useRef(false);
  const idempotency = useRef<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const startX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const appRef = useRef<HTMLElement>(null);
  const count = SPREADS.find((item) => item.value === spread)!.count;
  const nextLabel = spread === 'one-card' ? 'Your card' : spread === 'three-card' ? ['Past', 'Present', 'Future'][selected.length] : CROSS_POSITIONS[selected.length];
  const finishedPicking = selected.length === count;

  useEffect(() => {
    setSiteKey(document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content ?? '');
    const random = crypto.getRandomValues(new Uint32Array(1))[0]!;
    setFocus(random % 78);
    return () => {
      clearTimeout(deckTimer.current);
      requestController.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (stage !== 'choose' || !siteKey || reading) return;
    const mount = () => {
      if (!window.turnstile || !widgetRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, { sitekey: siteKey, theme: 'dark', size: 'flexible' });
    };
    mount();
    const timer = window.setInterval(mount, 300);
    return () => {
      clearInterval(timer);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [stage, siteKey, reading]);

  useEffect(() => {
    if (stage !== 'prepare') appRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [stage]);

  function reset() {
    clearTimeout(deckTimer.current);
    requestController.current?.abort();
    requestPending.current = false;
    idempotency.current = null;
    setReading(null);
    setStage('prepare');
    setSelected([]);
    setError(null);
    setLoading(false);
  }

  function shuffle() {
    setError(null);
    setStage('shuffling');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    deckTimer.current = setTimeout(() => setStage('choose'), reducedMotion ? 0 : 850);
  }

  async function requestReading(slots: number[]) {
    if (requestPending.current) return;
    const token = siteKey ? window.turnstile?.getResponse(widgetId.current ?? undefined) : undefined;
    if (siteKey && !token) {
      setError('Complete the verification below, then reveal your cards.');
      return;
    }
    requestPending.current = true;
    setLoading(true);
    setError(null);
    idempotency.current ??= crypto.randomUUID();
    requestController.current = new AbortController();
    try {
      const response = await fetch('/api/v1/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: requestController.current.signal,
        body: JSON.stringify({
          spread, questionType: topic, locale: 'en', slots,
          idempotencyKey: idempotency.current,
          questionLength: question.trim().length,
          turnstileToken: token,
        }),
      });
      const data = await response.json() as DrawResponse & { error?: { message: string } };
      if (!response.ok || data.error) {
        setError(data.error?.message ?? 'The draw could not load. Try again.');
        window.turnstile?.reset(widgetId.current ?? undefined);
        return;
      }
      setReading(data);
    } catch {
      if (!requestController.current?.signal.aborted) {
        setError('Connection interrupted. Retry to recover the same selection.');
        window.turnstile?.reset(widgetId.current ?? undefined);
      }
    } finally {
      requestPending.current = false;
      setLoading(false);
    }
  }

  function choose() {
    if (loading) return;
    if (finishedPicking) {
      void requestReading(selected);
      return;
    }
    if (selected.includes(focus)) {
      setError('That position is already chosen. Move to another card.');
      return;
    }
    const next = [...selected, focus];
    setSelected(next);
    setError(null);
    if (next.length === count) {
      void requestReading(next);
    } else {
      setFocus((current) => {
        let candidate = wrapPosition(current + 7);
        while (next.includes(candidate)) candidate = wrapPosition(candidate + 1);
        return candidate;
      });
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
    suppressTap.current = false;
  }
  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) < 26) return;
    suppressTap.current = true;
    setFocus((current) => wrapPosition(current - Math.sign(distance) * Math.min(5, Math.max(1, Math.round(Math.abs(distance) / 48)))));
    window.setTimeout(() => { suppressTap.current = false; }, 0);
  }

  if (reading) return <CardResult reading={reading} question={question} onReset={reset} immersive preselected />;

  return (
    <section className={'reading-app reading-table ritual-app ritual-' + stage} id="draw-tool" ref={appRef} aria-label="Interactive tarot reading" aria-busy={loading}>
      <div className="ritual-topbar">
        <button type="button" className="ritual-back" disabled={loading || stage === 'prepare'} onClick={reset} aria-label="Start over">↶ <span>Start over</span></button>
        <span className="ritual-name">Your reading</span>
        <span className="ritual-counter">{stage === 'choose' ? String(Math.min(selected.length + 1, count)) + ' / ' + count : '78 cards'}</span>
      </div>
      <div className="ritual-scroll">
        {stage === 'prepare' && (
          <div className="ritual-prepare">
            <div className="ritual-heading">
              <span className="ritual-kicker">A moment for yourself</span>
              <h2>What’s on your mind?</h2>
              <p>Choose a focus. The rest is up to the cards.</p>
            </div>
            <div className="ritual-section">
              <h3>My focus</h3>
              <div className="ritual-topics" role="group" aria-label="Reading topic">
                {TOPICS.map((item) => <button key={item.value} type="button" className="ritual-chip" aria-pressed={topic === item.value} onClick={() => setTopic(item.value)}>{item.label}</button>)}
              </div>
            </div>
            <div className="ritual-section">
              <h3>My spread</h3>
              <div className="ritual-spreads" role="group" aria-label="Card spread">
                {SPREADS.filter((item) => !lockSpread || item.value === defaultSpread).map((item) => (
                  <button key={item.value} className="ritual-spread" type="button" aria-pressed={spread === item.value} onClick={() => setSpread(item.value)}>
                    <span className="ritual-mini-cards" aria-hidden="true">{Array.from({ length: Math.min(item.count, 3) }, (_, i) => <i key={i} />)}</span>
                    <strong>{item.label}</strong>
                    <small>{item.caption}</small>
                  </button>
                ))}
              </div>
            </div>
            <details className="ritual-question">
              <summary>{question ? 'Edit my question' : 'Add a question (optional)'}</summary>
              <label htmlFor={id + '-question'}>Your question stays in this browser for the free draw</label>
              <textarea id={id + '-question'} rows={2} maxLength={200} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I give more attention to?" autoComplete="off" />
            </details>
            <p className="ritual-disclaimer">Free reading · No account · 18+ · For reflection, not prediction</p>
          </div>
        )}
        {(stage === 'deck' || stage === 'shuffling') && (
          <div className="ritual-deck-scene">
            <div className="ritual-heading">
              <span className="ritual-kicker">The deck is yours</span>
              <h2>{stage === 'shuffling' ? 'Shuffling…' : 'Ready when you are.'}</h2>
              <p>{stage === 'shuffling' ? 'Each card has an equal chance.' : 'Tap the deck to shuffle all 78 cards.'}</p>
            </div>
            <button className={'ritual-deck-button' + (stage === 'shuffling' ? ' is-shuffling' : '')} type="button" disabled={stage === 'shuffling'} onClick={shuffle} aria-label="Shuffle all 78 tarot cards">
              <span className="ritual-deck-layer"><CardBack /></span>
              <span className="ritual-deck-layer"><CardBack /></span>
              <span className="ritual-deck-layer"><CardBack /></span>
            </button>
            <p className="ritual-deck-caption">{stage === 'shuffling' ? 'Finding your cards…' : 'Tap to shuffle'}</p>
          </div>
        )}
        {stage === 'choose' && (
          <div className="ritual-pick-scene">
            <div className="ritual-heading ritual-pick-heading">
              <span className="ritual-kicker">{finishedPicking ? 'Your selection is ready' : 'Choose ' + nextLabel}</span>
              <h2>{finishedPicking ? 'Turn your cards.' : 'Follow your instinct.'}</h2>
              <p>{finishedPicking ? 'Reveal the cards you selected.' : 'Swipe the deck to find your card.'}</p>
            </div>
            <div className="ritual-fan-frame">
              <div className="ritual-fan" role="group" tabIndex={0} aria-label="Swipe card positions or use the arrow controls" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { startX.current = null; }} onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  setFocus((current) => wrapPosition(current + (event.key === 'ArrowRight' ? 1 : -1)));
                }
              }}>
                {VISIBLE.map((offset) => {
                  const position = wrapPosition(focus + offset);
                  const center = offset === 0;
                  return <button
                    key={offset} type="button"
                    className={'ritual-fan-card' + (center ? ' is-focused' : '') + (selected.includes(position) ? ' is-used' : '')}
                    style={{ '--offset': offset, '--distance': Math.abs(offset), zIndex: 7 - Math.abs(offset) } as CSSProperties}
                    disabled={loading || finishedPicking}
                    aria-label={center ? 'Choose focused card, position ' + (position + 1) : 'Focus card at position ' + (position + 1)}
                    onClick={() => { if (suppressTap.current) return; if (center) choose(); else setFocus(position); }}
                  ><CardBack /></button>;
                })}
                <div className="ritual-focus-marker" aria-hidden="true">↑</div>
              </div>
              <div className="ritual-fan-controls">
                <button type="button" disabled={loading || finishedPicking} aria-label="Previous card position" onClick={() => setFocus((n) => wrapPosition(n - 1))}>←</button>
                <span>{finishedPicking ? 'Selection complete' : 'Position ' + (focus + 1) + ' of 78'}</span>
                <button type="button" disabled={loading || finishedPicking} aria-label="Next card position" onClick={() => setFocus((n) => wrapPosition(n + 1))}>→</button>
              </div>
            </div>
            <div className="ritual-slots" role="status" aria-live="polite">
              {Array.from({ length: count }, (_, index) => <span key={index} className={'ritual-slot' + (index < selected.length ? ' is-filled' : '') + (index === selected.length ? ' is-next' : '')}>
                <span className="ritual-slot-image" aria-hidden="true">{index < selected.length ? '✦' : index + 1}</span>
                <small>{spread === 'one-card' ? 'You' : spread === 'three-card' ? ['Past', 'Present', 'Future'][index] : CROSS_POSITIONS[index]}</small>
              </span>)}
            </div>
            {siteKey && <div className="ritual-human-check" ref={widgetRef} />}
          </div>
        )}
        {error && <p className="ritual-error" role="alert">{error}</p>}
      </div>
      <div className="ritual-actionbar">
        <button className="ritual-primary" type="button" disabled={loading || stage === 'shuffling'} onClick={() => {
          if (stage === 'prepare') { setStage('deck'); setError(null); }
          else if (stage === 'deck') shuffle();
          else if (stage === 'choose') choose();
        }}>
          <span>{stage === 'prepare' ? 'Continue to the deck' : stage === 'deck' ? 'Shuffle cards' : stage === 'shuffling' ? 'Shuffling…' : loading ? 'Reading your cards…' : finishedPicking ? 'Reveal my cards' : 'Choose this card'}</span>
          <span aria-hidden="true">→</span>
        </button>
        <p>{stage === 'prepare' ? 'Your reading is always free' : stage === 'choose' ? selected.length + ' of ' + count + ' selected' : 'Every card has an equal chance'}</p>
      </div>
    </section>
  );
}
