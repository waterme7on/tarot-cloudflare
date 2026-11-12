import { useEffect, useId, useRef, useState } from 'react';
import type { DrawResponse, QuestionType, Spread } from '../lib/schema';
import { DrawRequestError, newIdempotencyKey, requestDraw } from '../lib/draw-client';
import { CardResult } from './CardResult';
import RitualDraw from './RitualDraw';
import CardBack from './CardBack';

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void; getResponse: (id?: string) => string | undefined; remove: (id: string) => void };
  }
}

const TOPICS: { value: QuestionType; label: string; hint: string }[] = [
  { value: 'general', label: 'A little perspective', hint: 'See today from a different angle' },
  { value: 'love', label: 'Love & connection', hint: 'Relationships, feelings, boundaries' },
  { value: 'career', label: 'Work & direction', hint: 'Your next move, on your terms' },
  { value: 'money', label: 'Money & habits', hint: 'Reflect on resources, not investments' },
  { value: 'decision', label: 'A choice to make', hint: 'Find a lean, not a final verdict' },
];
const TOPIC_ART: Record<QuestionType, string> = { general: 'the-star', love: 'the-lovers', career: 'the-magician', money: 'ace-of-pentacles', decision: 'justice' };
const SPREAD_OPTIONS: { value: Spread; label: string; hint: string; count: number }[] = [
  { value: 'one-card', label: 'One clear thought', hint: 'One card · a focus for today', count: 1 },
  { value: 'three-card', label: 'The bigger picture', hint: 'Three cards · past, present, future', count: 3 },
  { value: 'celtic-cross', label: 'Room to explore', hint: 'Ten cards · take your time', count: 10 },
];
interface Props { defaultSpread?: Spread; defaultQuestionType?: QuestionType; lockSpread?: boolean; heading?: string; immersive?: boolean }

function LegacyDrawTool({ defaultSpread = 'one-card', defaultQuestionType = 'general', lockSpread = false, heading, immersive = false }: Props) {
  const [step, setStep] = useState(immersive ? -1 : 0);
  const [spread, setSpread] = useState(defaultSpread);
  const [questionType, setQuestionType] = useState(defaultQuestionType);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrawResponse | null>(null);
  const [siteKey, setSiteKey] = useState('');
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const idemRef = useRef<string | null>(null);
  const pendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const shuffleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { abortRef.current?.abort(); clearTimeout(shuffleTimer.current); }, []);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const selectedTopic = TOPICS.find((t) => t.value === questionType)!;
  const selectedSpread = SPREAD_OPTIONS.find((s) => s.value === spread)!;
  useEffect(() => { setSiteKey(document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content ?? ''); }, []);
  useEffect(() => {
    if (step < 0 || (!immersive && step === 0)) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest('section')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [step]);
  useEffect(() => {
    if (!siteKey || step !== 2 || result) return;
    const render = () => {
      if (!window.turnstile || !widgetRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, { sitekey: siteKey, theme: 'light', size: 'flexible' });
    };
    render();
    const timer = window.setInterval(render, 300);
    return () => {
      clearInterval(timer);
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, step, result]);
  function changeStep(next: number) { setError(null); setStep(next); }
  async function draw() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const turnstileToken = siteKey ? window.turnstile?.getResponse(widgetId.current ?? undefined) : undefined;
      if (siteKey && !turnstileToken) { setError('Complete the human check, then try again. Your choices are saved here.'); return; }
      idemRef.current ??= newIdempotencyKey();
      const controller = new AbortController();
      abortRef.current = controller;
      const [data] = await Promise.all([
        requestDraw(
          { spread, questionType, locale: 'en', idempotencyKey: idemRef.current, turnstileToken, questionLength: question.trim().length },
          { signal: controller.signal },
        ),
        new Promise<void>((resolve) => { shuffleTimer.current = setTimeout(resolve, immersive && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 700 : 0); }),
      ]);
      if (controller.signal.aborted) return;
      setResult(data);
      window.minilytics?.('goal', 'draw', { spread, question_type: questionType, cards: data.cards.length, mode: immersive ? 'ritual' : 'flow' });
    } catch (err) {
      if (err instanceof DrawRequestError && err.kind === 'cancelled') return;
      setError(err instanceof DrawRequestError ? err.message : 'Connection interrupted. Try again; we will recover the same draw if it was saved.');
      if (siteKey) window.turnstile?.reset(widgetId.current ?? undefined);
    } finally { pendingRef.current = false; setLoading(false); }
  }
  function reset() { setResult(null); setStep(immersive ? -1 : 0); setQuestion(''); setError(null); idemRef.current = null; }
  if (result) return <div id="result"><CardResult reading={result} question={question} onReset={reset} immersive={immersive} /></div>;
  if (immersive && step === -1) return (
    <section className="reading-table table-welcome" id="draw-tool" data-active="false" aria-labelledby={`${id}-welcome`}>
      <div className="table-welcome-copy"><p className="table-format">{defaultSpread === 'three-card' ? 'Past, present, possibility' : 'One card. A different perspective.'}</p>
        <h2 id={`${id}-welcome`}>{defaultSpread === 'three-card' ? 'See the story\nbetween the cards.' : 'A quiet moment.\nA card for you.'}</h2>
        <p>No predictions. Just a little space to reflect.</p>
      </div>
      <div className="table-hero-deck" aria-hidden="true"><div className="hero-card"><CardBack /></div><div className="hero-card"><CardBack /></div><div className="hero-card"><CardBack /></div></div>
      <div className="table-welcome-actions"><button className="btn table-primary" type="button" onClick={() => changeStep(0)}>Begin my reading <span aria-hidden="true">→</span></button><p>Free, no account needed. For ages 18+.</p></div>
      <noscript><p>Enable JavaScript for the interactive draw, or browse the <a href="/cards/">illustrated deck and card meanings</a>.</p></noscript>
    </section>
  );
  return (
    <section className={`reading-app ${immersive ? 'reading-table table-setup' : ''}`} id="draw-tool" data-active={immersive ? 'true' : undefined} data-step={step} aria-labelledby={`${id}-heading`} aria-busy={loading}>
      {immersive ? <div className="table-toolbar"><button type="button" disabled={loading} onClick={() => changeStep(step - 1)} aria-label="Previous step">←</button><span>{['Your focus', 'Your spread', 'Your moment'][step]}</span><button type="button" disabled={loading} onClick={() => changeStep(-1)}>Leave table</button></div> : <div className="flow-topline"><span>Your moment of clarity</span><span>Free · 18+</span></div>}
      <ol className="flow-progress" aria-label="Reading progress">
        {['Focus', 'Spread', 'Draw'].map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={step >= i ? 'reached' : ''}><span>{i + 1}</span>{label}</li>)}
      </ol>
      <div className="flow-body">
        <h2 id={`${id}-heading`} tabIndex={-1} ref={headingRef}>{step === 0 ? 'What’s on your mind?' : step === 1 ? 'How much space do you need?' : 'Take a breath. Make some room.'}</h2>
        <p className="flow-caption">{step === 0 ? (heading ?? 'Start with a feeling. You don’t need the perfect question.') : step === 1 ? 'A single card is a good place to start. Every spread is free.' : 'Hold your question gently. The cards are prompts, not predictions.'}</p>
        {step === 0 && <div className="topic-list" role="group" aria-label="Question type">
          {TOPICS.map((topic, i) => <button type="button" key={topic.value} className="choice-row" aria-pressed={questionType === topic.value} onClick={() => { setQuestionType(topic.value); idemRef.current = null; }}>
            {immersive ? <img className="topic-art" src={`/cards/thumbs/${TOPIC_ART[topic.value]}.webp`} alt="" width="48" height="58" /> : <span className="choice-mark" aria-hidden="true">0{i + 1}</span>}<span><strong>{topic.label}</strong><small>{topic.hint}</small></span><span className="choice-dot" aria-hidden="true" />
          </button>)}
        </div>}
        {step === 1 && <>
          <div className="spread-list" role="group" aria-label="Spread">
            {SPREAD_OPTIONS.filter((s) => !lockSpread || s.value === defaultSpread).map((option) => <button type="button" className="choice-row" key={option.value} aria-pressed={spread === option.value} onClick={() => { setSpread(option.value); idemRef.current = null; }}>
              {immersive ? <span className={`spread-preview spread-preview-${option.count}`} aria-hidden="true">{Array.from({ length: Math.min(option.count, 5) }, (_, i) => <i key={i} />)}</span> : <span className="spread-mark" aria-hidden="true">{option.count}</span>}<span><strong>{option.label}</strong><small>{option.hint}</small></span><span className="choice-dot" aria-hidden="true" />
            </button>)}
          </div>
          <details className="question-note" open={!immersive || undefined}><summary>{question ? 'Edit your question' : 'Add a question (optional)'}</summary>
            <label htmlFor={`${id}-question`}>What would you like to reflect on?</label>
            <textarea id={`${id}-question`} rows={2} maxLength={200} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What could I approach differently today?" autoComplete="off" aria-describedby={`${id}-privacy`} />
            <p id={`${id}-privacy`} className="microcopy">Your words stay on this device during the free draw.</p>
          </details>
        </>}
        {step === 2 && <>
          {immersive ? <button type="button" className={`table-shuffle-deck ${loading ? 'is-shuffling' : ''}`} onClick={() => void draw()} disabled={loading} aria-label="Tap the deck to shuffle and draw"><span className="shuffle-card"><CardBack /></span><span className="shuffle-card"><CardBack /></span><span className="shuffle-card"><CardBack /></span></button> : <div className={`ritual-deck ${loading ? 'shuffling' : ''}`} aria-hidden="true"><div className="deck-back" /><div className="deck-back" /><div className="deck-back"><span>TT</span></div></div>}
          <p className="draw-recap"><strong>{selectedTopic.label}</strong><span>{selectedSpread.count} {selectedSpread.count === 1 ? 'card' : 'cards'} · 78-card deck</span></p>
          {siteKey && <div ref={widgetRef} className="human-check" />}
          <p className="microcopy" role="status">{loading ? 'Shuffling and saving your reading…' : 'Tap the deck or the button below. Every card has an equal chance.'}</p>
        </>}
        {error && <p className="flow-error" role="alert">{error}</p>}
      </div>
      <div className="flow-actions">
        {!immersive && step > 0 && <button className="back-button" type="button" disabled={loading} onClick={() => changeStep(step - 1)}>Back</button>}
        <button className="btn flow-primary" type="button" disabled={loading} onClick={() => step < 2 ? changeStep(step + 1) : void draw()}>{loading ? 'Shuffling your cards…' : step === 0 ? 'Choose my spread' : step === 1 ? 'Ready to draw' : 'Shuffle & draw'}<span aria-hidden="true">→</span></button>
      </div>
      <noscript><p className="flow-caption">Enable JavaScript to draw cards. You can still browse all <a href="/cards/">card meanings</a>.</p></noscript>
    </section>
  );
}


export default function DrawTool(props: Props) {
  return props.immersive ? <RitualDraw {...props} /> : <LegacyDrawTool {...props} />;
}
