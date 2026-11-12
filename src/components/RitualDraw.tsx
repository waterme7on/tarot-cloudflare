import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import CardBack from './CardBack';
import { CardResult } from './CardResult';
import type { DrawResponse, QuestionType, Spread } from '../lib/schema';
import { DRAW_SLOW_HINT_MS, DrawRequestError, newIdempotencyKey, requestDraw } from '../lib/draw-client';
import { moveToUnpickedPosition, wrapDeckPosition } from '../lib/deck-navigation';

type Stage = 'prepare' | 'deck' | 'shuffling' | 'fanning' | 'choose';
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
  const [slow, setSlow] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState('');
  const deckTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fanTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const extractTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestController = useRef<AbortController | null>(null);
  const requestPending = useRef(false);
  const attemptSeq = useRef(0);
  const idempotency = useRef<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const startX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const appRef = useRef<HTMLElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const count = SPREADS.find((item) => item.value === spread)!.count;
  const nextLabel = spread === 'one-card' ? 'Your card' : spread === 'three-card' ? ['Past', 'Present', 'Future'][selected.length] : CROSS_POSITIONS[selected.length];
  const finishedPicking = selected.length === count;

  useEffect(() => {
    setSiteKey(document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content ?? '');
    const random = crypto.getRandomValues(new Uint32Array(1))[0]!;
    setFocus(random % 78);
    return () => {
      clearTimeout(deckTimer.current);
      clearTimeout(fanTimer.current);
      clearTimeout(extractTimer.current);
      clearTimeout(slowTimer.current);
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
    if (stage === 'prepare' || reading) return;
    if (window.matchMedia('(min-width: 761px)').matches) {
      appRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else {
      // An explicit, accessible handoff from the SEO page to the game scene.
      appRef.current?.focus({ preventScroll: true });
    }
  }, [stage, reading]);

  useEffect(() => {
    if (stage === 'prepare') return;
    const onGameKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        reset();
        return;
      }
      // The active fullscreen scene declares aria-modal, so keyboard focus
      // must stay within the scene while it is open.
      if (event.key !== 'Tab' || reading || !appRef.current) return;
      const root = appRef.current;
      const controls = Array.from(root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      )).filter((el) => el.getClientRects().length > 0);
      if (controls.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }
      const first = controls[0]!;
      const last = controls[controls.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !root.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onGameKey);
    return () => window.removeEventListener('keydown', onGameKey);
  }, [stage, loading, reading]);

  useEffect(() => {
    if (slotsRef.current) slotsRef.current.scrollLeft = Math.max(0, (selected.length - 2) * 57);
  }, [selected.length]);

  function reset() {
    attemptSeq.current += 1;
    clearTimeout(deckTimer.current);
    clearTimeout(fanTimer.current);
    clearTimeout(extractTimer.current);
    clearTimeout(slowTimer.current);
    slowTimer.current = undefined;
    requestController.current?.abort();
    requestController.current = null;
    requestPending.current = false;
    setExtracting(false);
    idempotency.current = null;
    setReading(null);
    setStage('prepare');
    setSelected([]);
    setError(null);
    setLoading(false);
    setSlow(false);
  }

  function shuffle() {
    if (stage !== 'deck') return;
    setError(null);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setStage('choose');
      return;
    }
    setStage('shuffling');
    // Shuffle, gather, then open the fan as a separate beat.
    deckTimer.current = setTimeout(() => {
      setStage('fanning');
      fanTimer.current = setTimeout(() => setStage('choose'), 510);
    }, 820);
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
    setSlow(false);
    setError(null);
    const attempt = ++attemptSeq.current;
    let controller: AbortController | null = null;
    let slowTimerId: ReturnType<typeof setTimeout> | undefined;
    try {
      // Stable for every retry of this selection: a timed-out request that the
      // server already saved must return that reading instead of drawing again.
      idempotency.current ??= newIdempotencyKey();
      controller = new AbortController();
      requestController.current = controller;
      slowTimerId = setTimeout(() => {
        if (attemptSeq.current === attempt) setSlow(true);
      }, DRAW_SLOW_HINT_MS);
      slowTimer.current = slowTimerId;
      const data = await requestDraw(
        {
          spread, questionType: topic, locale: 'en', slots,
          idempotencyKey: idempotency.current,
          questionLength: question.trim().length,
          turnstileToken: token,
        },
        { signal: controller.signal },
      );
      if (attemptSeq.current !== attempt || controller.signal.aborted) return;
      setReading(data);
      window.minilytics?.('goal', 'draw', { spread, question_type: topic, cards: data.cards.length, mode: 'ritual' });
    } catch (err) {
      if (attemptSeq.current !== attempt) return;
      if (err instanceof DrawRequestError && err.kind === 'cancelled') return;
      setError(err instanceof DrawRequestError ? err.message : 'Connection interrupted. Tap Try again to recover the same selection.');
      window.turnstile?.reset(widgetId.current ?? undefined);
    } finally {
      // A Restart can start a new attempt while this one is still settling;
      // never clear the newer attempt's timer, pending flag or loading state.
      if (slowTimerId !== undefined && slowTimer.current === slowTimerId) {
        clearTimeout(slowTimerId);
        slowTimer.current = undefined;
      }
      if (attemptSeq.current === attempt) {
        if (requestController.current === controller) requestController.current = null;
        requestPending.current = false;
        setLoading(false);
        setSlow(false);
      }
    }
  }

  function choose() {
    if (loading || extracting || stage !== 'choose') return;
    if (finishedPicking) {
      void requestReading(selected);
      return;
    }
    if (selected.includes(focus)) {
      setError('That position is already chosen. Move to another card.');
      return;
    }
    const next = [...selected, focus];
    setError(null);
    setExtracting(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Let the chosen card visibly lift out of the fan before recording its slot.
    extractTimer.current = setTimeout(() => {
      setSelected(next);
      setExtracting(false);
      if (next.length === count) {
        void requestReading(next);
      } else {
        setFocus((current) => moveToUnpickedPosition(current, 7, next));
      }
    }, reducedMotion ? 0 : 320);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (stage !== 'choose' || extracting || loading || finishedPicking) return;
    startX.current = event.clientX;
    suppressTap.current = false;
  }
  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (stage !== 'choose' || extracting || loading || finishedPicking || startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) < 26) return;
    suppressTap.current = true;
    setFocus((current) => moveToUnpickedPosition(current, -Math.sign(distance) * Math.min(5, Math.max(1, Math.round(Math.abs(distance) / 48))), selected));
    // Browsers dispatch click after pointerup, so defer clearing the tap guard.
    window.setTimeout(() => { suppressTap.current = false; }, 380);
  }

  if (reading) return <div id="result"><CardResult reading={reading} question={question} onReset={reset} immersive preselected /></div>;

  return (
    <section className={'reading-app reading-table ritual-app ritual-' + stage} id="draw-tool" ref={appRef} tabIndex={-1} role={stage === 'prepare' ? undefined : 'dialog'} aria-modal={stage === 'prepare' ? undefined : true} aria-label="Interactive tarot reading" aria-busy={loading}>
      <div className="ritual-topbar">
        <button type="button" className="ritual-back" disabled={stage === 'prepare'} onClick={reset} aria-label="Start over">← <span>Restart</span></button>
        <span className="ritual-name">RandomTarot</span>
        <a className="ritual-exit" href="/cards/" aria-label="Exit reading and browse the deck">Exit</a>
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
                {TOPICS.map((item) => <button key={item.value} type="button" className="ritual-chip" aria-pressed={topic === item.value} onClick={() => { setTopic(item.value); idempotency.current = null; }}>{item.label}</button>)}
              </div>
            </div>
            <div className="ritual-section">
              <h3>My spread</h3>
              <div className="ritual-spreads" role="group" aria-label="Card spread">
                {SPREADS.filter((item) => !lockSpread || item.value === defaultSpread).map((item) => (
                  <button key={item.value} className="ritual-spread" type="button" aria-pressed={spread === item.value} onClick={() => { setSpread(item.value); idempotency.current = null; }}>
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
              <p>{stage === 'shuffling' ? 'Each card has an equal chance.' : 'Tap the deck to fan out 78 card positions.'}</p>
            </div>
            <button className={'ritual-deck-button' + (stage === 'shuffling' ? ' is-shuffling' : '')} type="button" disabled={stage === 'shuffling'} onClick={shuffle} aria-label="Shuffle all 78 tarot cards">
              <span className="ritual-deck-layer"><CardBack /></span>
              <span className="ritual-deck-layer"><CardBack /></span>
              <span className="ritual-deck-layer"><CardBack /></span>
            </button>
            <p className="ritual-deck-caption">{stage === 'shuffling' ? 'Finding your cards…' : 'Tap to shuffle'}</p>
          </div>
        )}
        {(stage === 'fanning' || stage === 'choose') && (
          <div className={'ritual-pick-scene' + (extracting ? ' is-extracting' : '')}>
            <div className="ritual-heading ritual-pick-heading">
              <span className="ritual-kicker">{stage === 'fanning' ? 'Opening the deck' : finishedPicking ? 'Selection complete' : 'Card ' + (selected.length + 1) + ' of ' + count + ' · ' + nextLabel}</span>
              <h2>{stage === 'fanning' ? 'The cards are opening.' : finishedPicking ? 'Turn your cards.' : 'Find your card.'}</h2>
              <p>{stage === 'fanning' ? '78 cards, shuffled for you.' : finishedPicking ? 'Your chosen cards are ready.' : 'Swipe to explore. Tap the center card to choose.'}</p>
            </div>
            <div className="ritual-fan-frame">
              <div className="ritual-fan" role="group" tabIndex={0} aria-label="Swipe card positions or use the arrow controls" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { startX.current = null; }} onKeyDown={(event) => {
                if (stage !== 'choose' || extracting || loading || finishedPicking) return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  setFocus((current) => moveToUnpickedPosition(current, event.key === 'ArrowRight' ? 1 : -1, selected));
                }
              }}>
                {VISIBLE.map((offset) => {
                  const position = wrapDeckPosition(focus + offset);
                  const center = offset === 0;
                  return <button
                    key={position} type="button"
                    className={'ritual-fan-card' + (center ? ' is-focused' : '') + (selected.includes(position) ? ' is-used' : '')}
                    style={{ '--offset': offset, '--distance': Math.abs(offset), zIndex: 7 - Math.abs(offset) } as CSSProperties}
                    disabled={loading || extracting || finishedPicking || stage === 'fanning'}
                    aria-label={center ? 'Choose focused card, position ' + (position + 1) : 'Focus card at position ' + (position + 1)}
                    onClick={() => { if (suppressTap.current) { suppressTap.current = false; return; } if (center) choose(); else setFocus((current) => moveToUnpickedPosition(current, offset, selected)); }}
                  ><CardBack /></button>;
                })}
                <div className="ritual-focus-marker" aria-hidden="true">↑</div>
              </div>
              <div className="ritual-fan-controls">
                <button type="button" disabled={loading || extracting || finishedPicking || stage === 'fanning'} aria-label="Previous card position" onClick={() => setFocus((n) => moveToUnpickedPosition(n, -1, selected))}>←</button>
                <span>{finishedPicking ? 'Selection complete' : 'Position ' + (focus + 1) + ' of 78'}</span>
                <button type="button" disabled={loading || extracting || finishedPicking || stage === 'fanning'} aria-label="Next card position" onClick={() => setFocus((n) => moveToUnpickedPosition(n, 1, selected))}>→</button>
              </div>
            </div>
            <div className="ritual-slots" ref={slotsRef} aria-label="Selected cards">
              <span className="ritual-sr-only" role="status" aria-live="polite">{selected.length} of {count} cards selected. {finishedPicking ? 'Ready to reveal.' : 'Choose ' + nextLabel + ' next.'}</span>
              {Array.from({ length: count }, (_, index) => <span key={index} className={'ritual-slot' + (index < selected.length ? ' is-filled' : '') + (index === selected.length ? ' is-next' : '')}>
                <span className="ritual-slot-image" aria-hidden="true">{index < selected.length ? '✦' : index + 1}</span>
                <small>{spread === 'one-card' ? 'You' : spread === 'three-card' ? ['Past', 'Present', 'Future'][index] : CROSS_POSITIONS[index]}</small>
              </span>)}
            </div>
            {siteKey && <div className="ritual-human-check" ref={widgetRef} />}
          </div>
        )}
        {error && <p className="ritual-error" role="alert">{error}</p>}
        <noscript><p className="ritual-error">Enable JavaScript to draw cards or browse the <a href="/cards/">card meanings</a>.</p></noscript>
      </div>
      <div className="ritual-actionbar">
        <button className="ritual-primary" type="button" disabled={loading || extracting || stage === 'shuffling' || stage === 'fanning'} onClick={() => {
          if (stage === 'prepare') { setStage('deck'); setError(null); }
          else if (stage === 'deck') shuffle();
          else if (stage === 'choose') choose();
        }}>
          <span>{stage === 'prepare' ? 'Continue to the deck' : stage === 'deck' ? 'Shuffle cards' : stage === 'shuffling' ? 'Shuffling…' : stage === 'fanning' ? 'Spreading cards…' : extracting ? 'Choosing your card…' : loading ? (slow ? 'Still drawing…' : 'Drawing your cards…') : error && finishedPicking ? 'Try again' : finishedPicking ? 'Reveal my cards' : 'Choose this card'}</span>
          <span aria-hidden="true">→</span>
        </button>
        <p role="status" aria-live="polite">{stage === 'prepare' ? 'Your reading is always free' : stage === 'choose' ? (loading && slow ? 'Taking longer than usual. Restart is safe; retrying recovers the same selection.' : selected.length + ' of ' + count + ' selected') : 'Every card has an equal chance'}</p>
      </div>
    </section>
  );
}
