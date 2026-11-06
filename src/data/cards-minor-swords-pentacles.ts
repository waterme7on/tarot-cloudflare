import type { CardData } from '../lib/schema';

export const MINOR_SWORDS_PENTACLES: CardData[] = [
  // ---------------------------------------------------------------------------
  // SWORDS
  // ---------------------------------------------------------------------------
  {
    id: "swords-01",
    slug: "ace-of-swords",
    name: "Ace of Swords",
    arcana: "minor",
    suit: "swords",
    number: 1,
    upright: {
      keywords: ["clarity", "breakthrough", "truth", "new idea"],
      summary: "A sharp moment of clarity cuts through the fog. The Ace of Swords marks a fresh idea or a hard truth that finally makes the situation legible.",
      action: "Write down the single clearest sentence you can about what is actually going on, then act on it.",
    },
    reversed: {
      keywords: ["confusion", "mixed signals", "blocked thinking", "misused words"],
      summary: "The blade is dull or pointed the wrong way. Reversed, this card shows muddled thinking, arguments that go nowhere, or a truth you are avoiding.",
      action: "Stop debating for today and gather one missing fact before you form another opinion.",
    },
    love: {
      upright: "An honest conversation clears the air, even if it stings a little. You can finally see where you stand.",
      reversed: "Words are being used as weapons or withheld entirely. Say less, but say it plainly.",
    },
    career: {
      upright: "A new strategy or a sudden insight gives you an edge. Pitch the idea while it is still sharp.",
      reversed: "Miscommunication is stalling a project. Confirm what was agreed in writing before moving on.",
    },
    money: {
      upright: "You see your financial picture with unusual clarity. Use that honesty to set one firm boundary.",
      reversed: "Fuzzy numbers and wishful thinking are blurring the truth. Add everything up before deciding.",
    },
    yesNo: "yes",
  },
  {
    id: "swords-02",
    slug: "two-of-swords",
    name: "Two of Swords",
    arcana: "minor",
    suit: "swords",
    number: 2,
    upright: {
      keywords: ["stalemate", "indecision", "avoidance", "truce"],
      summary: "Blindfolded and balancing two blades, the figure refuses to look. A decision is being postponed because both options feel costly.",
      action: "List what each choice would cost you in one honest column each, then pick the one you can live with.",
    },
    reversed: {
      keywords: ["information overload", "pressure to decide", "blindfold off", "anxiety"],
      summary: "The blindfold slips and the stalemate breaks, sometimes messily. Reversed, suppressed feelings or facts surface and force the issue.",
      action: "Name the thing you have been refusing to look at and say it out loud to one trusted person.",
    },
    love: {
      upright: "Someone is sitting on the fence to keep the peace. The quiet is not the same as agreement.",
      reversed: "The avoided topic is coming up whether you planned it or not. Meet it calmly instead of defensively.",
    },
    career: {
      upright: "You are caught between two roles or two camps and trying not to choose. Neutrality has a shelf life.",
      reversed: "A workplace standoff is finally cracking open. Use the moment to state your actual position.",
    },
    money: {
      upright: "Two spending or saving paths look equally uncomfortable. Delaying is itself a choice with a price.",
      reversed: "You have been avoiding a statement or a bill. Opening it is less painful than imagining it.",
    },
    yesNo: "maybe",
  },
  {
    id: "swords-03",
    slug: "three-of-swords",
    name: "Three of Swords",
    arcana: "minor",
    suit: "swords",
    number: 3,
    upright: {
      keywords: ["heartbreak", "grief", "painful truth", "separation"],
      summary: "Three swords through a heart under rain: the pain is real and it has a cause. This card names a hurt that needs to be felt rather than explained away.",
      action: "Give yourself one full day to feel it without fixing it, then tell one person what happened.",
    },
    reversed: {
      keywords: ["releasing pain", "forgiveness", "recovery", "lingering resentment"],
      summary: "The storm is passing but the scar is still tender. Reversed, this card points to the slow work of letting go, or to a grudge that refuses to loosen.",
      action: "Write the unsent letter that says everything, then decide whether you still need to send it.",
    },
    love: {
      upright: "A betrayal, a breakup, or hard words have landed. Do not pretend it did not hurt.",
      reversed: "Healing is underway, though old wounds can still flare. Be patient with your own timeline.",
    },
    career: {
      upright: "A rejection, a layoff, or a public criticism cuts deep. Separate the event from your worth.",
      reversed: "You are recovering from a professional setback. Resist the urge to relitigate it in your head.",
    },
    money: {
      upright: "A loss or a broken financial promise causes real distress. Face the numbers before the feelings swallow them.",
      reversed: "You are starting to rebuild after a financial blow. Small, steady steps matter more than big gestures now.",
    },
    yesNo: "no",
  },
  {
    id: "swords-04",
    slug: "four-of-swords",
    name: "Four of Swords",
    arcana: "minor",
    suit: "swords",
    number: 4,
    upright: {
      keywords: ["rest", "recovery", "retreat", "stillness"],
      summary: "A knight lies in repose while three swords hang above him. This is a mandated pause, not laziness; the mind needs quiet before the next move.",
      action: "Block out an evening with no screens and no planning, and treat it as non-negotiable.",
    },
    reversed: {
      keywords: ["burnout", "restlessness", "returning to action", "refusing rest"],
      summary: "Either you are pushing through exhaustion or you are finally ready to get up. Reversed, the card asks which of those is true today.",
      action: "Check your sleep and energy honestly; if both are low, cancel one commitment this week.",
    },
    love: {
      upright: "A relationship benefits from breathing room. Time apart can be caring rather than cold.",
      reversed: "You have withdrawn for too long, or you are rushing back before you are ready. Find the middle.",
    },
    career: {
      upright: "Step back from the grind to think. The best idea rarely arrives while you are firefighting.",
      reversed: "Burnout is close, or a leave is ending. Ease back in instead of sprinting from day one.",
    },
    money: {
      upright: "Pause major spending and let things settle. Stillness protects what you already have.",
      reversed: "Ignoring money matters to avoid stress has a cost. A short review now beats a long one later.",
    },
    yesNo: "maybe",
  },
  {
    id: "swords-05",
    slug: "five-of-swords",
    name: "Five of Swords",
    arcana: "minor",
    suit: "swords",
    number: 5,
    upright: {
      keywords: ["conflict", "hollow victory", "ego", "winning at a cost"],
      summary: "The winner collects swords while the losers walk away. You may be right, but the way you won has damaged something you needed.",
      action: "Ask yourself whether you want to be right or to be effective, and drop the fight that only serves your pride.",
    },
    reversed: {
      keywords: ["reconciliation", "cutting losses", "lingering hostility", "making amends"],
      summary: "The fight is ending, either through apology or exhaustion. Reversed, this card favors releasing a grudge or walking away from an unwinnable contest.",
      action: "Offer one genuine concession to the person you have been sparring with.",
    },
    love: {
      upright: "An argument has turned into a competition. Nobody wins when scoring points replaces listening.",
      reversed: "A truce is possible if someone goes first. Consider being that person.",
    },
    career: {
      upright: "Office politics are getting sharp. Winning the meeting might lose you the team.",
      reversed: "A workplace rivalry is cooling. Rebuild bridges quietly rather than announcing it.",
    },
    money: {
      upright: "A deal that feels like a win may leave resentment behind. Check whether the terms are fair to all sides.",
      reversed: "It is time to stop fighting over a sum that costs more in energy than it is worth.",
    },
    yesNo: "no",
  },
  {
    id: "swords-06",
    slug: "six-of-swords",
    name: "Six of Swords",
    arcana: "minor",
    suit: "swords",
    number: 6,
    upright: {
      keywords: ["transition", "moving on", "calmer waters", "quiet passage"],
      summary: "A ferry crosses from rough water to smooth. This card describes a necessary departure, often subdued, that carries you toward something steadier.",
      action: "Pack only what you need for the next chapter and leave one old habit on the shore.",
    },
    reversed: {
      keywords: ["stuck", "unfinished business", "resisting change", "rough crossing"],
      summary: "The boat will not leave the dock, or it keeps turning back. Reversed, something unresolved is anchoring you to a place you have outgrown.",
      action: "Identify the one conversation or task that must be finished before you can leave, and schedule it.",
    },
    love: {
      upright: "A relationship moves into a calmer, less dramatic phase, or you leave one gently. Either way, the storm is behind you.",
      reversed: "Baggage from the past keeps surfacing. You cannot sail with one foot on the dock.",
    },
    career: {
      upright: "A move, a transfer, or a role change takes you somewhere quieter and more workable.",
      reversed: "You keep almost leaving a job or project. Decide what is truly keeping you there.",
    },
    money: {
      upright: "You are moving from a strained period toward steadier ground. Keep the pace modest.",
      reversed: "An old debt or obligation keeps dragging you backward. Deal with it directly to free your course.",
    },
    yesNo: "yes",
  },
  {
    id: "swords-07",
    slug: "seven-of-swords",
    name: "Seven of Swords",
    arcana: "minor",
    suit: "swords",
    number: 7,
    upright: {
      keywords: ["strategy", "stealth", "deception", "going it alone"],
      summary: "A figure sneaks away from camp with an armful of swords. Someone is being clever rather than straightforward, and that may include you.",
      action: "Check whether your current plan would survive being explained in full to everyone it affects.",
    },
    reversed: {
      keywords: ["confession", "exposed", "conscience", "coming clean"],
      summary: "The scheme unravels or the thief returns what was taken. Reversed, hidden things surface and honesty becomes the only workable path.",
      action: "Admit the shortcut you took before someone else discovers it.",
    },
    love: {
      upright: "Something is being kept quiet, whether a feeling or a fact. Secrets rarely stay small.",
      reversed: "A hidden matter comes into the open. Handle the reveal with more care than the original secret received.",
    },
    career: {
      upright: "Guard your ideas and read the room; not everyone is playing straight. Keep your own conduct clean.",
      reversed: "A workaround or a cut corner is about to be noticed. Get ahead of it with a direct explanation.",
    },
    money: {
      upright: "Read every line before signing. Someone may be counting on you not to look closely.",
      reversed: "A concealed fee or a quiet discrepancy surfaces. Address it now rather than letting it compound.",
    },
    yesNo: "no",
  },
  {
    id: "swords-08",
    slug: "eight-of-swords",
    name: "Eight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 8,
    upright: {
      keywords: ["feeling trapped", "self-limitation", "fear", "restriction"],
      summary: "Bound and blindfolded, the figure stands among swords that do not actually touch her. The prison is mostly built from assumptions.",
      action: "Name three things you have been telling yourself you cannot do, then test the easiest one.",
    },
    reversed: {
      keywords: ["release", "new perspective", "self-acceptance", "freedom"],
      summary: "The blindfold comes off and the ties loosen. Reversed, you begin to see that the exit was always available.",
      action: "Take the small step you have been overthinking for weeks.",
    },
    love: {
      upright: "You feel stuck in a dynamic you cannot name. Most of the walls are assumptions about what the other person thinks.",
      reversed: "You are starting to speak up and move freely again. Keep going.",
    },
    career: {
      upright: "The job feels like a cage, but the lock may be your own story about your options.",
      reversed: "A limiting belief about your abilities is dissolving. Apply for the thing you assumed was out of reach.",
    },
    money: {
      upright: "Financial anxiety is narrowing your view. There are more moves available than panic allows you to see.",
      reversed: "You are regaining a sense of agency over your finances. Build on it with one practical change.",
    },
    yesNo: "no",
  },
  {
    id: "swords-09",
    slug: "nine-of-swords",
    name: "Nine of Swords",
    arcana: "minor",
    suit: "swords",
    number: 9,
    upright: {
      keywords: ["anxiety", "sleepless nights", "worry", "dread"],
      summary: "Someone sits up in bed with their head in their hands. The fear is loud, but the swords on the wall are not falling; the mind is doing most of the damage.",
      action: "Write every worry on paper before bed, then mark which ones you can act on tomorrow.",
    },
    reversed: {
      keywords: ["relief", "facing fears", "recovery", "asking for help"],
      summary: "Morning comes and the worst did not happen. Reversed, the grip of worry loosens, often because you finally told someone.",
      action: "Reach out to one person today and tell them what has been keeping you up.",
    },
    love: {
      upright: "Fear of loss or rejection is running the show. Check your stories against what has actually been said.",
      reversed: "The dread is lifting and conversation is possible again. Lead with honesty rather than reassurance-seeking.",
    },
    career: {
      upright: "Work stress is bleeding into your nights. The imagined failure is usually bigger than the real one.",
      reversed: "A pressure you have carried is easing. Use the breathing room to fix one cause, not just the symptoms.",
    },
    money: {
      upright: "Money worry is spiraling beyond the actual figures. Look at the real numbers in daylight.",
      reversed: "Panic gives way to a plan. Keep the plan simple enough to follow on a bad day.",
    },
    yesNo: "no",
  },
  {
    id: "swords-10",
    slug: "ten-of-swords",
    name: "Ten of Swords",
    arcana: "minor",
    suit: "swords",
    number: 10,
    upright: {
      keywords: ["ending", "rock bottom", "betrayal", "finality"],
      summary: "Ten swords in a fallen figure under a dark sky, with dawn at the horizon. Something is definitively over, and that finality is also where the next thing begins.",
      action: "Stop trying to revive what has ended and write down what it taught you.",
    },
    reversed: {
      keywords: ["survival", "slow recovery", "refusing to let go", "the worst is over"],
      summary: "You are getting up, slowly. Reversed, this card points to recovery from a hard ending, or to a refusal to admit the ending has happened.",
      action: "Remove one reminder of the old situation from your daily environment.",
    },
    love: {
      upright: "A relationship or a phase of it has reached a hard stop. Mourn it honestly instead of bargaining.",
      reversed: "You are surviving a painful ending and beginning to look up. Do not reopen old wounds to feel something.",
    },
    career: {
      upright: "A project collapses or a role ends abruptly. The clean break is painful but frees the next chapter.",
      reversed: "You are rebuilding after a professional failure. Take lessons, not scars, into the next role.",
    },
    money: {
      upright: "A financial chapter closes hard. Accept the loss fully so it stops controlling your next decisions.",
      reversed: "The worst of a financial crisis is behind you. Rebuild on simpler foundations.",
    },
    yesNo: "no",
  },
  {
    id: "swords-11",
    slug: "page-of-swords",
    name: "Page of Swords",
    arcana: "minor",
    suit: "swords",
    number: 11,
    upright: {
      keywords: ["curiosity", "vigilance", "new ideas", "candor"],
      summary: "A young figure holds a sword aloft, eyes scanning the horizon. This is restless intelligence: questions, research, and the urge to speak the unpolished truth.",
      action: "Ask the question everyone else is avoiding, politely but directly.",
    },
    reversed: {
      keywords: ["gossip", "all talk", "scattered focus", "defensiveness"],
      summary: "The sharp mind turns to idle chatter or snap judgments. Reversed, ideas multiply but nothing gets finished, and words start to wound.",
      action: "Finish one piece of work before starting another conversation about it.",
    },
    love: {
      upright: "Curiosity and candid talk bring freshness. Someone wants to understand you, not just impress you.",
      reversed: "Half-truths or careless remarks are causing friction. Think before you text.",
    },
    career: {
      upright: "A learning phase or a new assignment sharpens your skills. Take notes and ask questions freely.",
      reversed: "Rumors or unfocused energy are undermining your work. Pick one priority and protect it.",
    },
    money: {
      upright: "Research before you commit. A little investigation reveals what the glossy version hides.",
      reversed: "Impulsive decisions based on headlines or hearsay are risky. Slow down and verify.",
    },
    yesNo: "maybe",
  },
  {
    id: "swords-12",
    slug: "knight-of-swords",
    name: "Knight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 12,
    upright: {
      keywords: ["ambition", "fast action", "directness", "charging ahead"],
      summary: "A knight gallops full tilt into the wind, sword raised. This card is momentum and conviction, with little patience for hesitation or nuance.",
      action: "Make the call or send the message you have drafted five times, but reread it once for tone.",
    },
    reversed: {
      keywords: ["recklessness", "aggression", "burnout", "unfocused rush"],
      summary: "Speed without direction. Reversed, the charge turns into a crash: words said too fast, plans launched too early, energy spent with nothing to show.",
      action: "Wait twenty-four hours before acting on the thing you feel most urgent about.",
    },
    love: {
      upright: "Someone pursues with intensity and says exactly what they mean. Enjoy the directness; watch for impatience.",
      reversed: "Arguments escalate quickly and nobody pauses. Step out of the room before the next sharp line.",
    },
    career: {
      upright: "Push the initiative forward with confidence. Decisive action gets noticed right now.",
      reversed: "Rushing a launch or steamrolling colleagues creates cleanup later. Build in one review step.",
    },
    money: {
      upright: "Act on a well-researched opportunity without dithering. Preparation plus speed is the combination.",
      reversed: "Impulsive moves driven by excitement or fear can be costly. Let the adrenaline fade first.",
    },
    yesNo: "yes",
  },
  {
    id: "swords-13",
    slug: "queen-of-swords",
    name: "Queen of Swords",
    arcana: "minor",
    suit: "swords",
    number: 13,
    upright: {
      keywords: ["clear boundaries", "independence", "honest perception", "wisdom from experience"],
      summary: "The queen sits upright with her sword vertical and her hand extended. She has learned through loss to see clearly, speak plainly, and expect the same from others.",
      action: "State one boundary today in a single calm sentence, without apology or explanation.",
    },
    reversed: {
      keywords: ["coldness", "bitterness", "harsh judgment", "isolation"],
      summary: "Clarity curdles into cruelty, or self-protection hardens into distance. Reversed, old hurts shape every verdict and warmth is treated as weakness.",
      action: "Soften one judgment you have made about someone by looking for the context you skipped.",
    },
    love: {
      upright: "Honesty and independence define the connection. Love here is clear-eyed rather than starry-eyed.",
      reversed: "Sarcasm or icy detachment is keeping a partner at arm's length. Let one guard down.",
    },
    career: {
      upright: "Your discernment is an asset. Give direct feedback and trust your read of a situation.",
      reversed: "A critical tone is alienating colleagues. Be exacting about work, not about people.",
    },
    money: {
      upright: "Make financial decisions with your head rather than your hopes. Scrutiny serves you well.",
      reversed: "Cynicism or past losses may be blocking reasonable opportunities. Evaluate on the facts, not old scars.",
    },
    yesNo: "maybe",
  },
  {
    id: "swords-14",
    slug: "king-of-swords",
    name: "King of Swords",
    arcana: "minor",
    suit: "swords",
    number: 14,
    upright: {
      keywords: ["authority", "intellect", "fairness", "discipline"],
      summary: "The king holds his sword slightly tilted, ready to judge. He represents principled authority: logic over mood, rules applied evenly, and decisions made on evidence.",
      action: "Make the decision you have been deferring by writing out the criteria first and applying them without exception.",
    },
    reversed: {
      keywords: ["tyranny", "manipulation", "cold logic", "abuse of power"],
      summary: "Intellect without conscience. Reversed, this card shows rigid control, rules bent for convenience, or someone using cleverness to dominate rather than to serve.",
      action: "Check whether a rule you are enforcing applies to you as strictly as it applies to others.",
    },
    love: {
      upright: "A relationship built on respect and clear agreements. Feelings are present but handled with maturity.",
      reversed: "Control dressed up as reason, or emotional distance passed off as logic. Name the pattern.",
    },
    career: {
      upright: "Lead with structure and principle. Your judgment carries weight; use it consistently.",
      reversed: "An authority figure is being rigid or unfair, or you are. Document decisions and keep your own integrity intact.",
    },
    money: {
      upright: "Disciplined, rules-based money management works now. Set the policy and follow it.",
      reversed: "Someone may be using technicalities or pressure to shape a deal. Get a second set of eyes on the terms.",
    },
    yesNo: "yes",
  },

  // ---------------------------------------------------------------------------
  // PENTACLES
  // ---------------------------------------------------------------------------
  {
    id: "pentacles-01",
    slug: "ace-of-pentacles",
    name: "Ace of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 1,
    upright: {
      keywords: ["new opportunity", "prosperity", "manifestation", "solid start"],
      summary: "A hand offers a coin above a flowering garden. A tangible opportunity is appearing: a job, an offer, a resource, or a seed that can grow if planted properly.",
      action: "Take the first practical step on the opportunity in front of you within forty-eight hours.",
    },
    reversed: {
      keywords: ["missed chance", "poor planning", "scarcity thinking", "unstable foundation"],
      summary: "The coin slips through the fingers. Reversed, an opportunity is lost to hesitation, or a promising start lacks the groundwork to hold.",
      action: "Review why the last good chance passed you by and fix that one bottleneck.",
    },
    love: {
      upright: "A grounded new connection or a fresh phase of commitment takes root. Build it slowly and well.",
      reversed: "Practical pressures or insecurity are stalling a promising bond. Address the real-world issue directly.",
    },
    career: {
      upright: "A concrete offer, raise, or new role is within reach. Prepare so you can say yes cleanly.",
      reversed: "A role that looked solid may be shakier than advertised. Ask harder questions before committing.",
    },
    money: {
      upright: "A new income source or a sound opportunity appears. Nurture it with patient, boring consistency.",
      reversed: "A deal falls through or money arrives and leaves just as fast. Shore up your basics before chasing more.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-02",
    slug: "two-of-pentacles",
    name: "Two of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 2,
    upright: {
      keywords: ["balance", "juggling", "adaptability", "priorities"],
      summary: "A dancer juggles two coins bound by an infinity loop while ships ride rough waves behind. You are managing several demands at once, and so far the rhythm holds.",
      action: "Write down everything you are currently juggling and drop or delegate the one that matters least.",
    },
    reversed: {
      keywords: ["overwhelm", "dropped balls", "disorganization", "overcommitment"],
      summary: "The juggling act fails. Reversed, too many obligations collide and something important gets missed because everything was labeled urgent.",
      action: "Cancel or postpone one commitment this week without guilt.",
    },
    love: {
      upright: "Balancing love with work and life takes effort, and you are managing. Keep checking in rather than assuming.",
      reversed: "A partner feels like one more item on the list. Protect one unhurried hour together.",
    },
    career: {
      upright: "Multiple projects demand attention and you are keeping the plates spinning. Prioritize ruthlessly.",
      reversed: "Overcommitment is leading to errors. Tell your manager what cannot be done on the current timeline.",
    },
    money: {
      upright: "Cash flow is a balancing act, with income and outgo roughly matched. Track it weekly so nothing surprises you.",
      reversed: "Robbing one account to pay another is becoming a pattern. Lay all the obligations side by side.",
    },
    yesNo: "maybe",
  },
  {
    id: "pentacles-03",
    slug: "three-of-pentacles",
    name: "Three of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 3,
    upright: {
      keywords: ["teamwork", "craftsmanship", "collaboration", "recognition"],
      summary: "A craftsman consults with a monk and an architect inside a cathedral. Skilled work meets planning and support; the project succeeds because everyone brings their part.",
      action: "Ask a colleague or collaborator for specific feedback on the piece of work you are proudest of.",
    },
    reversed: {
      keywords: ["poor teamwork", "lack of recognition", "sloppy work", "misaligned goals"],
      summary: "The builders argue over the blueprint. Reversed, collaboration frays, quality slips, or someone's contribution goes unseen.",
      action: "Clarify in writing who owns which part of the shared task.",
    },
    love: {
      upright: "You and a partner are building something together, with each role understood. Appreciate the effort being made.",
      reversed: "Uneven effort or unclear expectations are causing friction. Discuss who does what, kindly.",
    },
    career: {
      upright: "Your skills are being recognized and the team is working well. Lean into the collaboration.",
      reversed: "Credit is misallocated or the group lacks a shared plan. Raise it in a meeting, not a hallway.",
    },
    money: {
      upright: "Steady work and good craft build earnings over time. Invest in the skill that pays.",
      reversed: "Shared financial projects stall over disagreements. Agree on the goal before arguing about the method.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-04",
    slug: "four-of-pentacles",
    name: "Four of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 4,
    upright: {
      keywords: ["security", "control", "holding on", "conservation"],
      summary: "A figure clutches one coin, stands on two, and balances one on his head. Stability is being protected fiercely, perhaps at the cost of movement and generosity.",
      action: "Identify one thing you are gripping too tightly and loosen your hold by a small, deliberate amount.",
    },
    reversed: {
      keywords: ["letting go", "generosity", "overspending", "loss of control"],
      summary: "The grip opens, whether by choice or by force. Reversed, this card swings between healthy release and reckless spending or sudden instability.",
      action: "Decide consciously what you will share this week, rather than letting it slip or hoarding it.",
    },
    love: {
      upright: "Possessiveness or a fear of vulnerability is keeping things safe but small. Security is not the same as closeness.",
      reversed: "You are opening up and loosening control, or a relationship feels suddenly unsteady. Talk about what security means to each of you.",
    },
    career: {
      upright: "You are guarding your position and resisting change. That protects today and risks tomorrow.",
      reversed: "Rigid control gives way, allowing delegation or signaling that your footing has shifted. Adapt early.",
    },
    money: {
      upright: "Saving and conserving is sensible, but fear can tip into hoarding. Make sure money serves a life, not the reverse.",
      reversed: "Spending loosens, sometimes too far. Set a limit that allows generosity without regret.",
    },
    yesNo: "maybe",
  },
  {
    id: "pentacles-05",
    slug: "five-of-pentacles",
    name: "Five of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 5,
    upright: {
      keywords: ["hardship", "scarcity", "isolation", "feeling left out"],
      summary: "Two figures trudge through snow past a lit church window. Loss and want are real, but the help that exists is being overlooked while the focus stays on the cold.",
      action: "Ask for one specific kind of help from one specific person today.",
    },
    reversed: {
      keywords: ["recovery", "finding help", "improvement", "end of hardship"],
      summary: "The travelers notice the door. Reversed, a lean season begins to turn and support becomes visible, provided pride does not keep it at bay.",
      action: "Accept the offer of assistance you have been politely declining.",
    },
    love: {
      upright: "Feeling alone even when accompanied, or struggling together through a hard patch. Say the lonely thing out loud.",
      reversed: "Connection returns after a cold stretch. Reach toward it rather than waiting to be reached.",
    },
    career: {
      upright: "A job loss, a rough stretch, or feeling shut out at work. Your network is warmer than it looks from outside.",
      reversed: "Prospects brighten after a difficult period. Update your materials and tell people you are looking.",
    },
    money: {
      upright: "Financial strain is weighing on everything. Check what assistance or options you have not yet explored.",
      reversed: "The pressure is easing. Rebuild a small buffer before resuming old spending habits.",
    },
    yesNo: "no",
  },
  {
    id: "pentacles-06",
    slug: "six-of-pentacles",
    name: "Six of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 6,
    upright: {
      keywords: ["generosity", "giving and receiving", "fairness", "support"],
      summary: "A merchant weighs coins on a scale and gives to those in need. Resources flow where they are needed; the card asks you to notice which side of the exchange you are on.",
      action: "Give something useful without being asked, or accept help without apologizing for needing it.",
    },
    reversed: {
      keywords: ["strings attached", "one-sided giving", "debt", "power imbalance"],
      summary: "The scale tilts. Reversed, generosity carries conditions, help creates obligation, or you are giving far more than you receive.",
      action: "Review a relationship or arrangement where you always pay and ask what a fairer version would look like.",
    },
    love: {
      upright: "Care and support flow both ways. A kind gesture strengthens the bond.",
      reversed: "One person is keeping score or using favors as leverage. Rebalance the exchange openly.",
    },
    career: {
      upright: "A mentor, a bonus, or a helpful introduction arrives. Pay it forward when you can.",
      reversed: "A favor at work comes with hidden expectations. Clarify the terms before you accept.",
    },
    money: {
      upright: "Money moves toward balance, whether through a gift, a repayment, or charitable giving. Keep records.",
      reversed: "Lending or borrowing is straining a relationship. Put the arrangement in writing or end it.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-07",
    slug: "seven-of-pentacles",
    name: "Seven of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 7,
    upright: {
      keywords: ["patience", "assessment", "long-term effort", "slow growth"],
      summary: "A farmer leans on his hoe and studies the vine. The work is planted and growing, but harvest is not yet here; this is the moment to evaluate, not to rip things up.",
      action: "Review what you have invested in over the last six months and decide which effort deserves more.",
    },
    reversed: {
      keywords: ["impatience", "poor return", "wasted effort", "giving up too soon"],
      summary: "The crop disappoints or the farmer quits before it ripens. Reversed, effort and reward are out of line, and frustration tempts a rash change.",
      action: "Before abandoning a slow project, calculate honestly what it has returned versus what it cost.",
    },
    love: {
      upright: "A relationship is in a slow-growth phase. Evaluate what you have built before deciding what comes next.",
      reversed: "Effort feels unrewarded and patience is thin. Say what you need instead of silently keeping score.",
    },
    career: {
      upright: "Your long-term work is paying off gradually. Measure progress by the quarter, not the day.",
      reversed: "A project yields less than the hours put in. Reassess whether to adjust the approach or cut losses.",
    },
    money: {
      upright: "Slow and steady accumulation is working. Resist the urge to tinker with what is quietly growing.",
      reversed: "Returns are lagging and the temptation to chase something faster is strong. Check the fundamentals first.",
    },
    yesNo: "maybe",
  },
  {
    id: "pentacles-08",
    slug: "eight-of-pentacles",
    name: "Eight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 8,
    upright: {
      keywords: ["skill building", "diligence", "apprenticeship", "focus"],
      summary: "An artisan carves coin after coin with steady concentration. Mastery comes through repetition and attention to detail, not inspiration.",
      action: "Spend one focused hour today practicing the skill that would most change your situation.",
    },
    reversed: {
      keywords: ["perfectionism", "lack of ambition", "repetitive drudgery", "cutting corners"],
      summary: "The work becomes mechanical or obsessive. Reversed, you are polishing what does not matter or phoning in what does.",
      action: "Ask whether the task you are perfecting is actually the one that moves things forward.",
    },
    love: {
      upright: "Working on the relationship with patience and attention. Small consistent efforts count.",
      reversed: "Routine has replaced engagement, or one partner is overworking at the expense of the bond. Rebalance the hours.",
    },
    career: {
      upright: "Training, certification, or deep practice pays off. Your reputation is built one careful piece at a time.",
      reversed: "Monotony or perfectionism is draining you. Vary the work or raise your sights.",
    },
    money: {
      upright: "Income grows with skill. Investing in your competence is the most reliable financial move right now.",
      reversed: "Doing more of the same is yielding less. Look at whether the effort is pointed at the right target.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-09",
    slug: "nine-of-pentacles",
    name: "Nine of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 9,
    upright: {
      keywords: ["self-sufficiency", "abundance", "refinement", "earned comfort"],
      summary: "A woman stands in a flourishing vineyard with a falcon on her glove. Independence has been earned through discipline, and now there is room to enjoy it.",
      action: "Treat yourself to something that honors the work you have done, chosen with care rather than impulse.",
    },
    reversed: {
      keywords: ["overdependence", "hollow success", "overwork", "financial setback"],
      summary: "The garden looks fine from outside but feels empty inside. Reversed, comfort rests on someone else's support, or success came at the cost of everything else.",
      action: "Identify one area where you rely on others more than you would like, and take a step toward handling it yourself.",
    },
    love: {
      upright: "You are whole on your own, and that makes partnership a choice rather than a need. Enjoy your own company.",
      reversed: "Dependence or a lifestyle mismatch is straining things. Talk about what independence means to each of you.",
    },
    career: {
      upright: "Your expertise commands respect and autonomy. Enjoy the freedom you have earned.",
      reversed: "Status without satisfaction, or working so much that the rewards go unused. Rebalance.",
    },
    money: {
      upright: "A period of comfortable, self-made stability. Maintain the habits that got you here.",
      reversed: "Appearances may be outrunning actual resources. Review the real figures behind the lifestyle.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-10",
    slug: "ten-of-pentacles",
    name: "Ten of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 10,
    upright: {
      keywords: ["legacy", "family", "long-term wealth", "stability"],
      summary: "Three generations gather beneath a family crest with dogs at their feet. This is lasting security: what is built to outlive you and to shelter others.",
      action: "Make one decision today that will still matter in ten years, such as documenting something important.",
    },
    reversed: {
      keywords: ["family conflict", "financial instability", "broken tradition", "short-term thinking"],
      summary: "The foundation cracks. Reversed, inheritance disputes, family tension, or risky bets threaten what was supposed to last.",
      action: "Have the uncomfortable conversation about money or family expectations before it becomes a dispute.",
    },
    love: {
      upright: "A relationship with roots: shared home, family, or a long-term future. Commitment feels solid.",
      reversed: "In-laws, money, or differing views on the future create strain. Address the structural issue together.",
    },
    career: {
      upright: "An established organization or a role with long-term security suits you. Think in terms of legacy.",
      reversed: "Institutional stability is shakier than it looked, or tradition is stifling you. Weigh security against growth.",
    },
    money: {
      upright: "Wealth that accumulates over generations: property, savings, planning. Think long and boring.",
      reversed: "Family money matters or a risky bet threaten long-term security. Protect the core before you expand.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-11",
    slug: "page-of-pentacles",
    name: "Page of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 11,
    upright: {
      keywords: ["study", "new venture", "practicality", "ambition"],
      summary: "A young figure gazes intently at a single coin in a green field. This is the student's energy: a practical goal, a willingness to learn, and the first steps of making it real.",
      action: "Enroll, apply, or set up the first concrete milestone for the goal you keep talking about.",
    },
    reversed: {
      keywords: ["procrastination", "lack of progress", "unrealistic goals", "distraction"],
      summary: "The coin stays in the hand, never planted. Reversed, plans are made and remade but nothing ships, or the goal is too vague to start on.",
      action: "Break the goal into a first step small enough to finish today, then finish it.",
    },
    love: {
      upright: "A grounded new interest or a desire to build something real. Show up reliably.",
      reversed: "Good intentions without follow-through are frustrating a partner. Match words with one small deed.",
    },
    career: {
      upright: "A new course, internship, or project lets you build practical skills. Be the eager learner.",
      reversed: "Studies or a new role are stalling from lack of focus. Reset the schedule and remove one distraction.",
    },
    money: {
      upright: "Learning the basics of managing money pays long-term. Start with a simple tracking habit.",
      reversed: "Financial goals remain abstract. Attach a number and a date to each one.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-12",
    slug: "knight-of-pentacles",
    name: "Knight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 12,
    upright: {
      keywords: ["reliability", "hard work", "routine", "persistence"],
      summary: "A knight sits still on a heavy workhorse, surveying plowed fields. Progress here is methodical and unglamorous, and it gets there every time.",
      action: "Do the routine task you have been avoiding, fully and without shortcuts.",
    },
    reversed: {
      keywords: ["stagnation", "boredom", "stubbornness", "laziness"],
      summary: "The horse refuses to move or plods in circles. Reversed, routine becomes rut, or dependability turns into an excuse to never change course.",
      action: "Change one small part of your daily routine this week to see what it shakes loose.",
    },
    love: {
      upright: "Steady, loyal, and perhaps unexciting. Dependability is a form of love that is easy to underrate.",
      reversed: "Predictability has become monotony, or stubbornness is blocking compromise. Try something new together.",
    },
    career: {
      upright: "Consistency and thoroughness win. Finish what you start and let the record speak.",
      reversed: "You feel stuck doing the same thing with no growth. Ask for a stretch assignment.",
    },
    money: {
      upright: "Slow, disciplined saving and conservative choices suit the moment. Keep going.",
      reversed: "Excessive caution or inertia is leaving money idle. Review what a modest adjustment could do.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-13",
    slug: "queen-of-pentacles",
    name: "Queen of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 13,
    upright: {
      keywords: ["nurturing", "practicality", "comfort", "resourcefulness"],
      summary: "The queen cradles her coin in a lush garden with a rabbit at her feet. She makes a home of wherever she is, providing warmth, order, and tangible care.",
      action: "Do one concrete thing to make your physical space or daily routine more supportive.",
    },
    reversed: {
      keywords: ["self-neglect", "smothering", "work-life imbalance", "materialism"],
      summary: "Care flows out but not in. Reversed, the queen gives until depleted, or substitutes possessions for presence.",
      action: "Schedule for yourself the same care you would arrange for someone you love.",
    },
    love: {
      upright: "Love shows up as warmth and practical support: meals, a steady home, being there. Receive it as well as give it.",
      reversed: "Caretaking has tipped into control or self-erasure. Ask for what you need directly.",
    },
    career: {
      upright: "You make a team feel supported while keeping things running. Your practicality is leadership.",
      reversed: "Taking care of everyone else is burning you out. Delegate something real.",
    },
    money: {
      upright: "Sensible, nurturing stewardship of resources. Provide for the household and keep a cushion.",
      reversed: "Spending to feel secure, or neglecting your own finances while supporting others. Rebalance toward yourself.",
    },
    yesNo: "yes",
  },
  {
    id: "pentacles-14",
    slug: "king-of-pentacles",
    name: "King of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 14,
    upright: {
      keywords: ["abundance", "leadership", "security", "mastery"],
      summary: "The king sits amid vines and bulls, robe embroidered with grapes, coin resting on his knee. This is established success: prudent, generous, and built to last.",
      action: "Make one decision from a position of abundance rather than fear, and notice how it changes the outcome.",
    },
    reversed: {
      keywords: ["greed", "rigidity", "status obsession", "financial recklessness"],
      summary: "The throne becomes a fortress. Reversed, wealth is clutched or flaunted, control replaces leadership, and material concerns crowd out everything else.",
      action: "Ask whether the next purchase or deal is about security or about status, and act accordingly.",
    },
    love: {
      upright: "A dependable, generous partner or a relationship that feels established. Stability is a form of affection.",
      reversed: "Money or control is being used to hold power in the relationship. Name the imbalance.",
    },
    career: {
      upright: "You are, or are becoming, the steady authority others rely on. Lead with prudence and share the credit.",
      reversed: "A boss or a business is prioritizing profit over people. Protect your own standards.",
    },
    money: {
      upright: "A season of solid finances and sound judgment. Build the long-term plan now, while things are good.",
      reversed: "Overconfidence or stubbornness can lead to costly bets. Get a second opinion before a large commitment.",
    },
    yesNo: "yes",
  },
];
