import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DrawResponse, QuestionType, Spread } from '../lib/schema';
import { hasCardPage } from '../data/card-pages';
import CardBack from './CardBack';
import FlipCard from './FlipCard';
import HoloCard, { cardPoster } from './HoloCard';
import { ShareCard } from './ShareCard';

const FLIP_MS = 280;
const FAN_PICK_MS = 300;
const SPREAD_PAGE_LABEL: Record<Spread, string> = { 'one-card': 'the one-card spread', 'three-card': 'the three-card spread', 'celtic-cross': 'the Celtic Cross spread' };
const QUESTION_PAGE: Record<QuestionType, string | null> = { general: null, love: '/questions/love/', career: '/questions/career/', money: '/questions/money/', decision: '/questions/decision/' };

export function CardResult({ reading, question, onReset, reveal = true, immersive = false, preselected = false }: { reading: DrawResponse; question?: string; onReset?: () => void; reveal?: boolean; immersive?: boolean; preselected?: boolean }) {
  const [checkout, setCheckout] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [consent, setConsent] = useState(false);
  const [checkoutSiteKey, setCheckoutSiteKey] = useState('');
  const checkoutWidgetRef = useRef<HTMLDivElement>(null);
  const checkoutWidgetId = useRef<string | null>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [opened, setOpened] = useState(false);
  const [flipDone, setFlipDone] = useState(false);
  const [holoActive, setHoloActive] = useState(false);
  const [holoStart, setHoloStart] = useState(false);
  const [instantReset, setInstantReset] = useState(false);
  const [pickedSlots, setPickedSlots] = useState<number[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const pickLock = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fanSize = Math.max(7, reading.cards.length);
  const usesFan = immersive && !preselected;
  const motionDelay = (ms: number) => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
  function revealNext(slot: number) {
    if (pickLock.current || pickedSlots.includes(slot)) return;
    pickLock.current = true;
    setHoloStart(true);
    clearTimeout(transitionTimer.current);
    clearTimeout(startTimer.current);
    setSelectedSlot(slot);
    setPickedSlots((slots) => [...slots, slot]);
    const begin = () => {
      setOpened(true);
      transitionTimer.current = setTimeout(() => {
        setFlipDone(true);
        setSelectedSlot(null);
      }, motionDelay(FLIP_MS));
    };
    // The fan's chosen back has to reach edge-on before the front takes over.
    if (usesFan) startTimer.current = setTimeout(begin, motionDelay(FAN_PICK_MS));
    else begin();
  }
  function advanceReading() {
    if (advancing) return;
    setAdvancing(true);
    clearTimeout(transitionTimer.current);
    clearTimeout(startTimer.current);
    transitionTimer.current = setTimeout(() => {
      if (activeCard === reading.cards.length - 1) {
        setShowSummary(true);
        return;
      }
      pickLock.current = false;
      setHoloStart(false);
      setOpened(false);
      setFlipDone(false);
      setSelectedSlot(null);
      setActiveCard((index) => index + 1);
      setAdvancing(false);
      setInstantReset(true);
      requestAnimationFrame(() => { requestAnimationFrame(() => setInstantReset(false)); });
    }, motionDelay(180));
  }
  const [showSummary, setShowSummary] = useState(!reveal);
  const [actionChosen, setActionChosen] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const readingBodyRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const currentCard = reading.cards[activeCard]!;
  useEffect(() => () => {
    clearTimeout(transitionTimer.current);
    clearTimeout(startTimer.current);
  }, []);
  useEffect(() => { setClientReady(true); }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    for (const slug of [currentCard.slug, reading.cards[activeCard + 1]?.slug]) {
      if (!slug) continue;
      const image = new Image();
      image.decoding = 'async';
      image.src = cardPoster(slug);
      void image.decode?.().catch(() => {});
    }
  }, [activeCard, currentCard.slug, reading.cards]);
  useEffect(() => {
    if (!showSummary) return;
    setCheckoutSiteKey(document.querySelector<HTMLMetaElement>('meta[name="turnstile-site-key"]')?.content ?? '');
  }, [showSummary]);
  useEffect(() => {
    if (!showSummary || !checkoutSiteKey) return;
    const mount = () => {
      if (!window.turnstile || !checkoutWidgetRef.current || checkoutWidgetId.current) return;
      try {
        checkoutWidgetId.current = window.turnstile.render(checkoutWidgetRef.current, { sitekey: checkoutSiteKey, theme: 'dark', size: 'flexible', 'refresh-expired': 'auto' });
      } catch {
        // The retry interval keeps trying until the Turnstile script is ready.
      }
    };
    mount();
    const timer = window.setInterval(mount, 300);
    return () => {
      window.clearInterval(timer);
      if (checkoutWidgetId.current) window.turnstile?.remove(checkoutWidgetId.current);
      checkoutWidgetId.current = null;
    };
  }, [showSummary, checkoutSiteKey]);
  useEffect(() => {
    if (flipDone) headingRef.current?.focus({ preventScroll: true });
  }, [flipDone]);
  useEffect(() => {
    if (!flipDone) {
      setHoloActive(false);
      return;
    }
    // Let the flip and the meaning settle before paying for WebGL setup.
    const timer = setTimeout(() => setHoloActive(true), motionDelay(180));
    return () => clearTimeout(timer);
  }, [flipDone]);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    if (immersive && preselected && window.matchMedia('(max-width: 760px)').matches) {
      // Scroll within the reading scene, never the Safari document underneath it.
      readingBodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      headingRef.current?.closest('section')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [activeCard, showSummary, immersive, preselected]);
  const product = reading.spread === 'one-card' ? 'single' : 'three';
  const price = product === 'single' ? '$4.99' : '$9.99';
  const questionPage = QUESTION_PAGE[reading.questionType];

  const startCheckout = async () => {
    const turnstileToken = checkoutSiteKey ? window.turnstile?.getResponse(checkoutWidgetId.current ?? undefined) : undefined;
    if (checkoutSiteKey && !turnstileToken) {
      setCheckout({ loading: false, error: 'Complete the verification below to continue to secure checkout.' });
      return;
    }
    setCheckout({ loading: true, error: null });
    try {
      const attribution = window.minilytics?.attribution?.();
      const res = await fetch('/api/v1/report/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: reading.publicToken, product, turnstileToken, userSummary: consent ? question : undefined, consent, visitorId: attribution?.ml_visitor_id, sessionId: attribution?.ml_session_id }),
      });
      const data = (await res.json()) as { checkoutUrl?: string; error?: { message: string } };
      if (!res.ok || !data.checkoutUrl) {
        if (checkoutSiteKey) window.turnstile?.reset(checkoutWidgetId.current ?? undefined);
        setCheckout({ loading: false, error: data.error?.message ?? 'Checkout unavailable right now.' });
        return;
      }
      location.href = data.checkoutUrl;
    } catch {
      if (checkoutSiteKey) window.turnstile?.reset(checkoutWidgetId.current ?? undefined);
      setCheckout({ loading: false, error: 'Network error. Complete the verification again and retry.' });
    }
  };

  if (!showSummary) return (
    <section className={`reading-app reveal-app ${immersive ? 'reading-table table-reveal' : ''} ${immersive && preselected ? 'ritual-reveal-screen' : ''}`} id="draw-tool" data-active={immersive ? 'true' : undefined} data-opened={opened} data-advancing={advancing || undefined} aria-labelledby={`${id}-reveal-heading`}>
      {immersive ? <div className="table-toolbar"><span>Your reading</span><span>{activeCard + 1} / {reading.cards.length}</span><a href={`/reading/${reading.publicToken}/`}>Save &amp; close</a></div> : <div className="flow-topline"><span>Your cards are ready</span><span>{activeCard + 1} / {reading.cards.length}</span></div>}
      <progress className="reveal-progress" aria-label="Cards revealed" value={activeCard + (flipDone ? 1 : 0)} max={reading.cards.length} />
      <div className="flow-body reveal-body" ref={readingBodyRef}>
        <h2 id={`${id}-reveal-heading`} ref={headingRef} tabIndex={-1}>{currentCard.positionLabel}</h2>
        <p className="flow-caption">{flipDone ? 'Notice what resonates. Leave what doesn’t.' : opened ? 'Turning your card…' : preselected ? 'Tap the card you chose to turn it over.' : immersive ? 'Tap a card back to reveal your next card.' : 'A new perspective is waiting. Turn it over when you’re ready.'}</p>
        <div className={`reveal-stage${opened ? ' is-open' : ''}`}>
          {usesFan ? <>
            {/* The chosen fan card reaches edge-on before the prewarmed front takes over. */}
            <div className="turned-card-layer" aria-hidden={!opened}>
              {clientReady && <div className={`table-turned-card${advancing ? ' is-leaving' : ''}`}><HoloCard slug={currentCard.slug} name={currentCard.name} orientation={currentCard.orientation} width={216} reveal={false} interactive active={holoActive} start={holoStart} eager className={opened && !flipDone ? 'is-revealing' : ''} /></div>}
            </div>
            {!opened && (
              <div className={`table-fan ${selectedSlot !== null ? 'has-selection' : ''}`} key={`fan-${activeCard}`} role="group" aria-label="Deck card backs">
                {Array.from({ length: fanSize }, (_, i) => <button type="button" key={i} className={`fan-card ${selectedSlot === i ? 'is-selected' : ''}`} style={{ '--slot': i / (fanSize - 1), '--dip': Math.abs(i / (fanSize - 1) - .5) } as CSSProperties} disabled={pickedSlots.includes(i) || selectedSlot !== null || instantReset || !clientReady} onClick={() => revealNext(i)} aria-label={`Reveal card ${activeCard + 1} from position ${i + 1}`}><CardBack /></button>)}
              </div>
            )}
          </> : (
            <FlipCard
              open={opened}
              leaving={advancing}
              instant={instantReset}
              back={preselected ?
                <button type="button" className="ritual-selected-back" disabled={opened || instantReset || !clientReady} onClick={() => revealNext(activeCard)} aria-label={'Turn over your selected card ' + (activeCard + 1)}><CardBack /><span>Tap to turn over</span></button> :
                <button type="button" className="deck-back reveal-card" disabled={opened || instantReset || !clientReady} onClick={() => revealNext(activeCard)} aria-label={`Reveal card ${activeCard + 1}`}><span aria-hidden="true">TT</span><small>Tap to turn over</small></button>}
              front={clientReady && <HoloCard slug={currentCard.slug} name={currentCard.name} orientation={currentCard.orientation} width={216} reveal={false} interactive={!preselected} active={holoActive} start={holoStart} eager className={opened && !flipDone ? 'is-revealing' : ''} />}
            />
          )}
          <div className="card-mist" aria-hidden="true" />
        </div>
        {immersive && !flipDone && <>
          <div className="table-positions" aria-label="Spread positions">{reading.cards.map((card, i) => <div key={card.position} className={i < activeCard ? 'filled' : i === activeCard ? 'current' : ''} aria-current={i === activeCard ? 'step' : undefined}>{i < activeCard ? <img src={`/cards/thumbs/${card.slug}.webp`} alt={`${card.name}, ${card.orientation}`} className={card.orientation} width="48" height="72" /> : <span aria-hidden="true">{i + 1}</span>}<small>{card.positionLabel}</small></div>)}</div>
          <p className="microcopy">{preselected ? 'These are the positions you chose. Reveal each card in order.' : 'Your draw is already set by a random shuffle. Taps reveal the cards in order.'}</p>
        </>}
        {flipDone && <div className="revealed-meaning" role="status"><h3>{currentCard.name}</h3><p className="orientation-label">{currentCard.orientation === 'reversed' ? 'Reversed card' : 'Upright card'}</p><p>{currentCard.summary}</p></div>}
      </div>
      <div className="flow-actions">
        {flipDone ? <button className="btn flow-primary" type="button" disabled={advancing} onClick={advanceReading}>{activeCard === reading.cards.length - 1 ? 'Bring it together' : 'Meet the next card'}<span aria-hidden="true">→</span></button> :
          <button className="btn flow-primary" type="button" disabled={selectedSlot !== null || opened || instantReset || !clientReady} onClick={() => revealNext(preselected ? activeCard : Array.from({ length: fanSize }, (_, i) => i).find((i) => !pickedSlots.includes(i))!)}>{opened || selectedSlot !== null ? 'Turning your card…' : 'Reveal my card'}<span aria-hidden="true">→</span></button>}
      </div>
      <button type="button" className="quiet-button" onClick={() => { clearTimeout(transitionTimer.current); clearTimeout(startTimer.current); setShowSummary(true); }}>Skip to the full reading</button>
    </section>
  );

  return (
    <section className={`reading-app result-app summary-enter ${immersive ? 'reading-table table-summary' : ''} ${immersive && preselected ? 'ritual-summary-screen' : ''}`} id="draw-tool" data-active={immersive ? 'true' : undefined} aria-labelledby={`${id}-result-heading`}>
      {immersive ? <div className="table-toolbar"><span>Reading complete</span><a href={`/reading/${reading.publicToken}/`}>Save &amp; close</a></div> : <div className="flow-topline"><span>Reading complete</span><span>{reading.cards.length} / {reading.cards.length} cards</span></div>}
      <h2 ref={headingRef} tabIndex={-1} id={`${id}-result-heading`}>A thought to take with you.</h2>
      {reading.yesNo && (
        <p className="yesno-lean" style={{ textAlign: 'center', fontSize: '1.4rem', fontFamily: 'var(--font)', color: 'var(--gold2)' }}>
          Lean: <strong>{reading.yesNo.toUpperCase()}</strong>
        </p>
      )}
      <div className="reading-strip" aria-label="Your drawn cards">
        {reading.cards.map((c) => <figure key={c.position}><img src={`/cards/thumbs/${c.slug}.webp`} width={120} height={180} className={c.orientation} alt={`${c.name}, ${c.orientation}`} /><figcaption>{c.positionLabel}<strong>{c.name}</strong></figcaption></figure>)}
      </div>
      <details className="meaning-details"><summary>Explore each card’s meaning</summary>
        {reading.cards.map((c) => <div key={c.position}><h3>{hasCardPage(c.slug) ? <a href={`/cards/${c.slug}/`}>{c.name}</a> : c.name} <small>({c.orientation})</small></h3>{reading.cards.length > 1 && <p className="microcopy">{c.positionLabel}</p>}<p>{c.summary}</p><p className="microcopy">{c.keywords.join(' · ')}</p></div>)}
      </details>
      <p className="microcopy result-next-links">
        Keep exploring: <a href={`/spreads/${reading.spread}/`}>{SPREAD_PAGE_LABEL[reading.spread]}</a> · <a href="/cards/">all 78 card meanings</a>
        {questionPage && <> · <a href={questionPage}>{reading.questionType} questions</a></>}
      </p>
      <div className="callout">
        {reading.spread !== 'celtic-cross' && <p><strong>Reading:</strong> {reading.summary}</p>}
        <p>
          <strong>Next action:</strong> {reading.nextAction}
        </p>
        <p className="muted small" style={{ margin: 0 }}>
          {reading.limitation}
        </p>
      </div>
      {reading.spread === 'celtic-cross' && (
        <details className="meaning-details">
          <summary>Read the full Celtic Cross interpretation</summary>
          <p>{reading.summary}</p>
        </details>
      )}

      <label className="action-choice"><input type="checkbox" checked={actionChosen} onChange={(e) => setActionChosen(e.target.checked)} /><span>{actionChosen ? 'One small intention, chosen. Take it into your day.' : 'I’ll take one small step today.'}</span></label>
      <ShareCard reading={reading} />
      <div className="reading-exits"><a href={`/reading/${reading.publicToken}/`}>Open a link to this reading</a>{onReset && <button type="button" className="quiet-button" onClick={onReset}>Start a new reading</button>}</div>

      <div className="report-offer">
        <h3 style={{ marginTop: 0 }}>Get the full reading — {price}</h3>
        <p className="muted small">
          A private, AI-assisted deep report: each card interpreted for your question type, a synthesis, practical next steps and a journaling prompt. Delivered to a private link. If generation fails, we retry once and automatically request a refund if it still cannot be delivered; refund confirmation can take several business days. Entertainment only.
        </p>
        <p className="muted small"><a href="/readings/">See what each report includes →</a></p>
        <div className="report-preview" aria-label="Sample layout of the full reading report">
          <div className="report-preview-header"><strong>Report preview</strong><span>Example layout</span></div>
          <div className="report-preview-paper">
            <p className="report-preview-label">Deep reading · example</p>
            <h4>{reading.cards[0]!.name} — a closer look</h4>
            <p>Explore how this {reading.cards[0]!.orientation} card may relate to your {reading.questionType === 'general' ? 'everyday' : reading.questionType} focus and its place in your spread.</p>
            <div className="report-preview-rule" />
            <h5>Bringing it together</h5>
            <p>A connected interpretation, practical next steps, and a prompt for reflection.</p>
          </div>
          <p className="report-preview-note">Example of the format, not your generated report. Your private report is written after checkout; a rules-based edition is used if AI is unavailable.</p>
        </div>
        {question && (
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 'auto', marginTop: '.3rem' }} />
            <span>Include my question ("{question.slice(0, 80)}") in the report. It will be sent to Cloudflare Workers AI and stored with the order.</span>
          </label>
        )}
        {checkoutSiteKey && <div className="report-check" ref={checkoutWidgetRef} aria-label="Human verification for checkout" />}
        {checkout.error && <p className="error" role="alert">{checkout.error}</p>}
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            onClick={startCheckout}
            disabled={checkout.loading}
            data-ml-goal="report_unlock"
            data-ml-goal-product={product}
            data-ml-goal-spread={reading.spread}
            data-ml-goal-question_type={reading.questionType}
          >
            {checkout.loading ? 'Opening checkout…' : 'Get the full reading'}
          </button>
        </div>
      </div>
    </section>
  );
}
