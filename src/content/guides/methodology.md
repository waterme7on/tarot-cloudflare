---
title: "How Our Tarot Card Generator Works"
description: "How this tarot generator draws cards: secure randomness on Cloudflare's edge, a rules-based free reading, optional AI deep reports, limitations, and privacy."
updatedAt: "2026-11-06"
author: "Tarot Tools Editorial"
noindex: false
---

People ask us a fair question: if a computer is drawing the card, is it really random, and is an AI making up the reading? This page explains exactly what happens when you click "Draw," where AI is used and where it is not, and what we store. Everything on this site is for reflection and entertainment only.

## Where the draw happens

Every reading runs on Cloudflare's edge network, so the draw is performed on a server close to you rather than in a single data center. This keeps readings fast and the logic small and auditable. Each draw starts from scratch.

## How the card is chosen

The draw uses `crypto.getRandomValues`, the Web Crypto API's cryptographically secure random number generator. This is the same class of randomness used for encryption keys, not the predictable pseudo-random functions found in many games.

A common mistake when picking "a random card out of 78" is to take a large random number and apply modulo 78. That introduces modulo bias: some cards become very slightly more likely than others because 78 does not divide evenly into the generator's range. We avoid this with rejection sampling. The generator produces a value, and if that value falls outside the largest range that divides evenly by 78, it is discarded and a new value is drawn. The result is that every one of the 78 cards has exactly the same probability of being drawn.

For multi-card spreads, cards are drawn without replacement, so the same card cannot appear twice in one reading.

## Upright or reversed

After a card is chosen, a separate secure random bit decides orientation. It is an even 50/50 split. We do not weight toward upright, and we do not adjust orientation based on the question, the category, or anything else about you.

## The free reading is a rules engine, not AI

The text you see with a free reading is produced by a deterministic rules engine. It looks up the drawn card, its orientation, its position in the spread, and the question category you selected, then assembles the interpretation from an editorial library written and reviewed by our team.

This means:

- The same card in the same position with the same category produces the same base interpretation every time.
- No language model is involved in free readings.
- Nothing in the free reading is generated on the fly or "hallucinated."

Free readings should be fast, consistent, and reviewable. If an interpretation looks wrong, we can find the exact rule and fix it.

## Where AI is used

AI is used in one place only: the optional paid deep report. If you purchase one, we send the already-drawn cards, their orientations, the spread positions, and your question category to Cloudflare Workers AI, which produces a longer narrative reading. AI-assisted content is labelled as such.

Two things never happen:

- **AI never changes the drawn card.** Cards and orientations are fixed at draw time, before any report is requested. The report is written about your cards; it cannot alter them.
- **AI is never used for free readings.** If you did not pay for a deep report, no language model touched your result.

## Limitations

- **It is not predictive.** Random cards and editorial text cannot know your future. The value is in the reflection the cards prompt.
- **It is not professional advice.** Nothing here is medical, legal, financial, or psychological guidance.
- **Interpretations are opinions.** Tarot has many traditions. Our rules engine reflects one editorial perspective, informed by common Rider-Waite-Smith readings.
- **AI reports can be wrong.** Fluent text can still be inaccurate or generic. Treat a deep report as a longer prompt for reflection, not as authority.
- **Randomness is not meaning.** A fair draw guarantees no card is favored, not that the card "chose you."

## Privacy

We designed the system to collect as little as possible.

- **Your question text is not stored by default.** The question category (for example "love") is recorded so the rules engine can select interpretations. The words you typed are not saved unless you explicitly opt in to include them in a paid report.
- **IP addresses are stored only as salted hashes.** We keep a one-way hash of your IP combined with a secret salt, used for rate limiting and abuse prevention. The raw IP is not written to our database, and the hash cannot be reversed.
- **No accounts are required** for free readings.
- **Payments are handled by Stripe.** We never see or store your card number.

Full details are in our [privacy policy](/guides/privacy), and our [disclaimer](/guides/disclaimer) sets out the scope of the service.

## Verifying for yourself

The approach is straightforward to check: secure random bytes, rejection sampling, draw without replacement, an independent coin flip for orientation, deterministic lookup for the free text. The honest answer to "is it rigged?" is "no, and here is how."
