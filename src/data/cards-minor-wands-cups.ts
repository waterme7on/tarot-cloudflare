import type { CardData } from '../lib/schema';

export const MINOR_WANDS_CUPS: CardData[] = [
  // ---------------------------------------------------------------------------
  // WANDS
  // ---------------------------------------------------------------------------
  {
    id: "wands-01",
    slug: "ace-of-wands",
    name: "Ace of Wands",
    arcana: "minor",
    suit: "wands",
    number: 1,
    upright: {
      keywords: ["spark", "inspiration", "new venture", "creative drive"],
      summary: "A fresh surge of energy hands you the seed of something worth starting. The idea is raw, but the enthusiasm behind it is real.",
      action: "Pick the one idea that excites you most and take a visible first step on it today.",
    },
    reversed: {
      keywords: ["false start", "blocked creativity", "hesitation", "fizzled plans"],
      summary: "The spark is there but keeps stalling before it catches. Delays, self-doubt, or scattered focus are smothering a promising beginning.",
      action: "Clear one distraction from your schedule so the idea has room to breathe.",
    },
    love: {
      upright: "A flirtation or renewed passion lights up with little warning. Let the attraction be playful before deciding what it has to become.",
      reversed: "Interest is sparking without follow-through, leaving mixed signals on both sides. Be honest about whether you are actually available.",
    },
    career: {
      upright: "A new project, pitch, or role invites you to build from scratch. Your initiative will be noticed if you move while the energy is high.",
      reversed: "An opportunity keeps slipping because the groundwork never gets done. Finish the proposal instead of polishing the vision.",
    },
    money: {
      upright: "A fresh income idea or side venture shows early promise. Test it small before pouring resources in.",
      reversed: "Enthusiasm is outrunning planning, and spending on a half-formed idea could leave you short. Pause before you commit funds.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-02",
    slug: "two-of-wands",
    name: "Two of Wands",
    arcana: "minor",
    suit: "wands",
    number: 2,
    upright: {
      keywords: ["planning", "future vision", "decision", "expanding horizons"],
      summary: "You stand with the world in your hands, weighing where to go next. The first win is secured; now the question is how far you are willing to reach.",
      action: "Write down the two paths you are weighing and list what each one would cost you in time.",
    },
    reversed: {
      keywords: ["fear of change", "playing small", "indecision", "poor planning"],
      summary: "The safe harbor feels too comfortable to leave, so bigger plans stay theoretical. Fear of the unknown is keeping you on the balcony instead of the road.",
      action: "Name the specific risk you are avoiding, then decide whether it is real or imagined.",
    },
    love: {
      upright: "You and a partner are mapping a shared future, or you are deciding whether a connection deserves deeper commitment. Thoughtful discussion beats impulsive leaps here.",
      reversed: "One of you wants to move forward while the other stalls. Unspoken fears about what comes next are creating distance.",
    },
    career: {
      upright: "A strategic choice sits in front of you, perhaps between stability and expansion. Long-range thinking will serve you better than reacting to the day's demands.",
      reversed: "You are keeping your ambitions quiet to avoid rocking the boat. Staying put feels safe but may be shrinking your options.",
    },
    money: {
      upright: "Time to look beyond this month's budget and sketch a longer horizon. Consider how a current decision shapes your position a few years out.",
      reversed: "Plans for growth stay vague while money drifts without direction. A concrete goal, even a modest one, would help.",
    },
    yesNo: "maybe",
  },
  {
    id: "wands-03",
    slug: "three-of-wands",
    name: "Three of Wands",
    arcana: "minor",
    suit: "wands",
    number: 3,
    upright: {
      keywords: ["expansion", "foresight", "progress", "ships coming in"],
      summary: "Early efforts are paying off and your view now stretches further than before. Opportunities arrive from a distance, through travel, trade, or new contacts.",
      action: "Reach out to one person outside your usual circle who could widen your reach.",
    },
    reversed: {
      keywords: ["delays", "obstacles abroad", "limited vision", "frustrated expansion"],
      summary: "What you sent out is slow to return, and setbacks are testing your patience. The plan may need adjusting before results appear.",
      action: "Review the timeline you set and identify which assumption no longer holds.",
    },
    love: {
      upright: "A relationship is ready to grow beyond its current shape, perhaps across distance or into new shared experiences. Keep looking ahead together.",
      reversed: "Distance, travel, or clashing schedules are straining the bond. Stalled plans need an honest reset rather than silent waiting.",
    },
    career: {
      upright: "Your work is gaining visibility beyond your immediate team, and collaboration or international reach may follow. Position yourself for the larger stage.",
      reversed: "An expansion effort is hitting delays or unexpected barriers. Scale back the scope until the fundamentals are reliable.",
    },
    money: {
      upright: "Investments of time and effort are starting to show returns. Stay patient; the full payoff is still in transit.",
      reversed: "Expected returns are late or smaller than projected. Avoid spending against money that has not yet arrived.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-04",
    slug: "four-of-wands",
    name: "Four of Wands",
    arcana: "minor",
    suit: "wands",
    number: 4,
    upright: {
      keywords: ["celebration", "homecoming", "milestone", "community"],
      summary: "A milestone deserves to be marked with the people who matter. Stability and joy meet here, whether through a gathering, a move, or a shared achievement.",
      action: "Plan a small celebration for something you have been treating as routine.",
    },
    reversed: {
      keywords: ["instability at home", "cancelled plans", "tension", "lack of support"],
      summary: "The foundation feels shakier than it looks from the outside. A celebration may be postponed, or harmony at home is harder to find than usual.",
      action: "Address one unresolved household or family tension directly this week.",
    },
    love: {
      upright: "A relationship reaches a happy landmark, such as meeting families, moving in, or simply feeling at home with each other. Enjoy the sense of belonging.",
      reversed: "Living arrangements or family expectations are creating friction between you. Private conversations matter more than public appearances right now.",
    },
    career: {
      upright: "A team success or project completion brings deserved recognition. Workplace relationships feel supportive and cooperative.",
      reversed: "Office culture feels unsettled, or a promised celebration never materializes. Look for your stability in your own work rather than the group mood.",
    },
    money: {
      upright: "Security around home and shared resources feels solid. A purchase tied to your living space or an event may be worth the cost.",
      reversed: "Housing or event costs are straining the budget more than planned. Rein in the extras before they become resentments.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-05",
    slug: "five-of-wands",
    name: "Five of Wands",
    arcana: "minor",
    suit: "wands",
    number: 5,
    upright: {
      keywords: ["competition", "conflict", "clashing egos", "creative friction"],
      summary: "Everyone is swinging at once and nobody is coordinating. The friction can sharpen ideas if it is channeled, or exhaust everyone if it is not.",
      action: "Suggest a single clear rule for how the group will make its next decision.",
    },
    reversed: {
      keywords: ["avoiding conflict", "resolution", "inner conflict", "tension released"],
      summary: "The scuffle either settles down or gets buried instead of resolved. Check whether peace was made or whether you simply stopped speaking up.",
      action: "State the disagreement you have been sidestepping in one calm sentence.",
    },
    love: {
      upright: "Rivalry, bickering, or competing for attention is dominating the connection. Arguments about small things usually point at a larger unspoken issue.",
      reversed: "Tension eases and the two of you find common ground, or you both go quiet to avoid a fight. Make sure it is the former.",
    },
    career: {
      upright: "Competing priorities and strong personalities are creating a noisy workplace. Pick your battles and bring data rather than volume.",
      reversed: "A conflict at work winds down, though some resentment may linger. Reestablish working agreements before the next crunch.",
    },
    money: {
      upright: "Competing demands on your money are pulling in different directions. Rank them before anything gets paid.",
      reversed: "A dispute over shared expenses or a bidding situation calms down. Use the breathing room to set clearer terms.",
    },
    yesNo: "no",
  },
  {
    id: "wands-06",
    slug: "six-of-wands",
    name: "Six of Wands",
    arcana: "minor",
    suit: "wands",
    number: 6,
    upright: {
      keywords: ["victory", "recognition", "public success", "confidence"],
      summary: "Your effort is being seen and applauded. A win you earned is arriving, and the confidence it brings can carry you into the next challenge.",
      action: "Accept the compliment or credit without deflecting it, then thank one person who helped.",
    },
    reversed: {
      keywords: ["ego", "fall from grace", "lack of recognition", "hollow win"],
      summary: "Praise is missing, delayed, or going to someone else, and it stings. Alternatively, a victory feels empty because it was more about image than substance.",
      action: "Ask yourself whose approval you are chasing and whether it is worth the price.",
    },
    love: {
      upright: "You feel proud to be with this person and they are proud of you. A relationship may be stepping into the open or receiving warm support from others.",
      reversed: "One partner is seeking admiration more than connection, or the relationship looks better to outsiders than it feels inside.",
    },
    career: {
      upright: "A promotion, award, or public acknowledgment is within reach. Lead with the same effort that got you here.",
      reversed: "Your contribution is being overlooked or credited elsewhere. Document your work and raise it with the right person.",
    },
    money: {
      upright: "A financial achievement, such as hitting a target or closing a deal, deserves acknowledgment. Build on the momentum rather than spending it.",
      reversed: "Spending to look successful is undermining actual stability. Let the numbers, not appearances, guide you.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-07",
    slug: "seven-of-wands",
    name: "Seven of Wands",
    arcana: "minor",
    suit: "wands",
    number: 7,
    upright: {
      keywords: ["defense", "standing your ground", "perseverance", "challenge"],
      summary: "You hold the high ground, but others are pushing to take it. Conviction and stamina will keep your position; backing down now would cost what you built.",
      action: "Prepare one clear, calm argument for the position you need to defend.",
    },
    reversed: {
      keywords: ["overwhelmed", "giving up", "defensiveness", "exhaustion"],
      summary: "The pressure feels relentless and you are tempted to surrender. Or you are defending something that no longer deserves the fight.",
      action: "Decide whether this battle is still yours, and if it is not, set it down deliberately.",
    },
    love: {
      upright: "You may need to protect the relationship from outside opinions or defend your own boundaries within it. Stand firm, but without turning your partner into an opponent.",
      reversed: "Constant defensiveness is wearing both of you down. Try lowering your guard on one small thing.",
    },
    career: {
      upright: "Your ideas or role are being challenged, perhaps by competitors or skeptical colleagues. Hold your ground with evidence and composure.",
      reversed: "Fending off criticism has become exhausting and you may feel like quitting. Reassess whether the position is worth holding.",
    },
    money: {
      upright: "Protect what you have earned against pressure to spend, lend, or gamble it away. Firm boundaries serve you now.",
      reversed: "Financial pressure from several directions feels overwhelming. Triage the obligations and tackle the most urgent one first.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-08",
    slug: "eight-of-wands",
    name: "Eight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 8,
    upright: {
      keywords: ["swift movement", "momentum", "news", "travel"],
      summary: "Events accelerate and messages fly. After a period of waiting, things suddenly move, and quick responses matter more than perfect ones.",
      action: "Reply to the message or request you have been sitting on before the day ends.",
    },
    reversed: {
      keywords: ["delays", "miscommunication", "scattered energy", "frustration"],
      summary: "The arrows are in the air but landing in the wrong places. Delays, crossed wires, or rushing without direction are slowing what should be quick.",
      action: "Confirm the details of one plan in writing to prevent another mix-up.",
    },
    love: {
      upright: "A romance moves fast, with messages, plans, and passion arriving in a rush. Enjoy the pace while keeping your feet on the ground.",
      reversed: "Texts go unanswered or get misread, and plans keep slipping. Slow down and talk directly instead of guessing.",
    },
    career: {
      upright: "Projects suddenly gain speed and news arrives quickly. Stay organized so you can ride the momentum rather than get buried by it.",
      reversed: "Delays and mixed messages are stalling progress. Clarify priorities with your team before pushing harder.",
    },
    money: {
      upright: "Payments, approvals, or transactions move faster than expected. Act promptly on anything time-sensitive.",
      reversed: "Expected funds are delayed or a transaction is tangled in confusion. Follow up and keep records of every exchange.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-09",
    slug: "nine-of-wands",
    name: "Nine of Wands",
    arcana: "minor",
    suit: "wands",
    number: 9,
    upright: {
      keywords: ["resilience", "last stand", "guarded", "persistence"],
      summary: "You are battered but still standing, and the finish line is close. Past struggles have made you wary, yet the strength to see this through is already yours.",
      action: "Rest tonight, then commit to one more push toward the goal tomorrow.",
    },
    reversed: {
      keywords: ["burnout", "paranoia", "giving up", "rigid defenses"],
      summary: "The walls you built for protection have become a prison. Fatigue and suspicion are making it hard to tell real threats from imagined ones.",
      action: "Let one trusted person help carry part of the load this week.",
    },
    love: {
      upright: "Old wounds make you cautious, but the relationship is worth the effort of staying open. Guard your heart without locking it.",
      reversed: "Defensiveness from past hurts is pushing a partner away. Consider whether you are protecting yourself from this person or from someone who is long gone.",
    },
    career: {
      upright: "A long project or difficult period is nearly done, and your persistence is what will finish it. Do not relax your standards at the last stretch.",
      reversed: "Burnout is setting in and every request feels like an attack. Address the exhaustion before it affects the quality of your work.",
    },
    money: {
      upright: "You have weathered financial strain and are close to stabilizing. Keep the discipline that got you here a little longer.",
      reversed: "Anxiety about money is leading to rigid or fearful choices. Review the actual numbers rather than the worry.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-10",
    slug: "ten-of-wands",
    name: "Ten of Wands",
    arcana: "minor",
    suit: "wands",
    number: 10,
    upright: {
      keywords: ["burden", "overload", "responsibility", "hard work"],
      summary: "You have taken on everything and are carrying it all at once. The goal is in sight, but the weight is bending you, and some of it was never yours to hold.",
      action: "List everything you are responsible for and delegate or drop at least one item.",
    },
    reversed: {
      keywords: ["release", "delegation", "collapse", "letting go"],
      summary: "Either the load finally gets shared or it crushes you. Something has to give, and choosing what to release is better than having it chosen for you.",
      action: "Say no to the next request that does not belong to your core priorities.",
    },
    love: {
      upright: "One partner is shouldering most of the emotional or practical work. The imbalance needs naming before it breeds resentment.",
      reversed: "The relationship has become a burden, or a weight is finally being lifted. Honest conversation about responsibilities can reset things.",
    },
    career: {
      upright: "Overwork and too many duties are crowding out effectiveness. Success is near, but the pace is not sustainable.",
      reversed: "Delegation becomes possible, or burnout forces a stop. Either way, restructure your workload before resuming.",
    },
    money: {
      upright: "Debt or obligations are weighing heavily, and you may be carrying others' costs too. Prioritize what must be paid and what can wait.",
      reversed: "Financial burdens begin to ease, or you decide to stop funding what drains you. Reassess commitments that no longer make sense.",
    },
    yesNo: "no",
  },
  {
    id: "wands-11",
    slug: "page-of-wands",
    name: "Page of Wands",
    arcana: "minor",
    suit: "wands",
    number: 11,
    upright: {
      keywords: ["enthusiasm", "exploration", "free spirit", "discovery"],
      summary: "A curious, restless energy wants to try everything and learn by doing. Good news or an exciting message may arrive, inviting you to explore.",
      action: "Sign up for or try one new thing you have been curious about but never attempted.",
    },
    reversed: {
      keywords: ["lack of direction", "immaturity", "procrastination", "bad news"],
      summary: "Eagerness without focus scatters into unfinished starts. Impulsiveness or a short attention span is undermining potential.",
      action: "Choose one half-started project and give it your full attention for a week.",
    },
    love: {
      upright: "A playful, adventurous person enters the picture, or an existing relationship rediscovers fun. Keep expectations light and curiosity high.",
      reversed: "Flakiness, mixed signals, or immature behavior is frustrating the connection. Decide whether patience or distance serves you better.",
    },
    career: {
      upright: "A new learning opportunity or role lets you experiment and grow. Enthusiasm matters more than experience right now.",
      reversed: "Boredom and lack of direction are dragging your work. Find a project that reconnects you with what first excited you.",
    },
    money: {
      upright: "A small, exploratory financial move may teach you something valuable. Keep the stakes manageable while you learn.",
      reversed: "Impulse purchases and chasing novelty are eating your budget. Introduce a waiting period before non-essential spending.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-12",
    slug: "knight-of-wands",
    name: "Knight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 12,
    upright: {
      keywords: ["action", "adventure", "passion", "bold moves"],
      summary: "Charge ahead with confidence and flair. This is the moment for decisive action, travel, or a bold pursuit, as long as you keep one eye on where the horse is heading.",
      action: "Make the bold move you have been debating, but check the one detail you tend to skip.",
    },
    reversed: {
      keywords: ["recklessness", "impulsiveness", "frustration", "scattered pursuit"],
      summary: "Speed without direction turns into chaos. Impatience, a short temper, or abandoning things midway is costing more than it gains.",
      action: "Wait twenty-four hours before acting on the next impulse that feels urgent.",
    },
    love: {
      upright: "A passionate, spontaneous energy sweeps in, whether as a new person or a rekindled flame. Thrilling, though commitment may not be the focus.",
      reversed: "Hot-and-cold behavior or a restless partner is creating instability. Passion alone will not hold things together.",
    },
    career: {
      upright: "Take the initiative on a bold project or pursue the ambitious role. Energy and confidence open doors here.",
      reversed: "Rushing into decisions or clashing with colleagues is undermining progress. Channel the drive into one well-planned effort.",
    },
    money: {
      upright: "A confident, fast-moving opportunity appears. Move decisively but keep your downside limited.",
      reversed: "Impulsive spending or risky bets are destabilizing your finances. Slow down and reconsider the rush.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-13",
    slug: "queen-of-wands",
    name: "Queen of Wands",
    arcana: "minor",
    suit: "wands",
    number: 13,
    upright: {
      keywords: ["confidence", "warmth", "charisma", "determination"],
      summary: "Radiant self-assurance draws people toward you. You know what you want, you say it plainly, and your warmth makes others glad to help.",
      action: "Take the lead on something social or creative where your energy can set the tone.",
    },
    reversed: {
      keywords: ["jealousy", "insecurity", "demanding", "burnout"],
      summary: "Confidence slips into either self-doubt or domineering behavior. Comparison with others is draining the natural warmth you usually carry.",
      action: "Notice one moment today where you compare yourself to someone, and redirect that attention to your own work.",
    },
    love: {
      upright: "You attract attention through authenticity and warmth. A relationship thrives when both partners feel free to shine.",
      reversed: "Jealousy or possessiveness is creeping in, from you or toward you. Rebuild your sense of worth outside the relationship.",
    },
    career: {
      upright: "Your leadership and presence inspire others. Step into visibility; people respond to your conviction.",
      reversed: "Being spread too thin or clashing with a demanding figure is sapping your energy. Protect your focus and set limits.",
    },
    money: {
      upright: "Confident, independent financial management pays off. Trust your judgment while staying generous without overextending.",
      reversed: "Spending to impress or to match others is costing you. Return to what you actually value.",
    },
    yesNo: "yes",
  },
  {
    id: "wands-14",
    slug: "king-of-wands",
    name: "King of Wands",
    arcana: "minor",
    suit: "wands",
    number: 14,
    upright: {
      keywords: ["leadership", "vision", "boldness", "entrepreneurial spirit"],
      summary: "A commanding presence turns vision into reality by inspiring others to follow. You see the big picture and have the nerve to act on it.",
      action: "Share your long-term vision with the people who need to help build it.",
    },
    reversed: {
      keywords: ["tyranny", "arrogance", "impulsive leadership", "unrealistic expectations"],
      summary: "Authority without listening becomes domination. Overconfidence or a hot temper is alienating the very people you need.",
      action: "Ask for honest feedback from someone who reports to you or relies on you, and listen without defending.",
    },
    love: {
      upright: "A mature, passionate partner or a relationship led with generosity and vision. Mutual respect for each other's ambitions strengthens the bond.",
      reversed: "A controlling or self-centered dynamic is taking over. Leadership in a relationship should not mean having the only vote.",
    },
    career: {
      upright: "Take charge of a project or team with confidence. Your strategic thinking and drive command respect.",
      reversed: "An overbearing boss or your own impatience is creating friction. Lead by empowering others rather than overriding them.",
    },
    money: {
      upright: "Bold, visionary planning can expand your resources. Pair ambition with a clear structure.",
      reversed: "Overconfidence in a big financial idea may blind you to risks. Seek a second opinion before committing.",
    },
    yesNo: "yes",
  },

  // ---------------------------------------------------------------------------
  // CUPS
  // ---------------------------------------------------------------------------
  {
    id: "cups-01",
    slug: "ace-of-cups",
    name: "Ace of Cups",
    arcana: "minor",
    suit: "cups",
    number: 1,
    upright: {
      keywords: ["new love", "emotional opening", "compassion", "overflow"],
      summary: "Your heart fills with something new, whether love, creative feeling, or spiritual connection. An emotional beginning is pouring in, and it asks only that you receive it.",
      action: "Express a feeling you have been keeping to yourself to someone who deserves to hear it.",
    },
    reversed: {
      keywords: ["emotional block", "repressed feelings", "emptiness", "self-love needed"],
      summary: "The cup is overturned and the feelings have nowhere to go. You may be withholding emotion, or something that should feel joyful feels hollow.",
      action: "Spend ten quiet minutes writing down what you actually feel without editing it.",
    },
    love: {
      upright: "A new romance begins or an existing relationship experiences a wave of tenderness. Let yourself be moved.",
      reversed: "Emotional walls or unspoken sadness are blocking intimacy. Begin by being honest with yourself about what you need.",
    },
    career: {
      upright: "Creative inspiration or a role that feels emotionally fulfilling arrives. Work that connects with your values is worth pursuing.",
      reversed: "Work feels emotionally draining or disconnected from meaning. Look for ways to restore what once motivated you.",
    },
    money: {
      upright: "Generosity, gifts, or emotionally rewarding uses of money bring satisfaction. Let abundance flow both ways.",
      reversed: "Emotional spending or a sense of scarcity is clouding your judgment. Address the feeling before the purchase.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-02",
    slug: "two-of-cups",
    name: "Two of Cups",
    arcana: "minor",
    suit: "cups",
    number: 2,
    upright: {
      keywords: ["partnership", "mutual attraction", "harmony", "connection"],
      summary: "Two people meet as equals and something clicks. Whether romantic, professional, or friendly, this bond is built on balance and genuine regard.",
      action: "Tell the person you are building something with exactly what you value about them.",
    },
    reversed: {
      keywords: ["imbalance", "disconnection", "miscommunication", "breakup"],
      summary: "The exchange has become lopsided or the connection is fraying. Misunderstandings are crowding out the harmony that once felt effortless.",
      action: "Identify where you are giving more than you receive, or vice versa, and raise it gently.",
    },
    love: {
      upright: "A deep mutual attraction or a committed partnership rooted in respect. Both people are showing up fully.",
      reversed: "Tension, unequal effort, or a growing distance strains the bond. Address the imbalance before it hardens into resentment.",
    },
    career: {
      upright: "A strong working partnership or collaboration forms. Shared values make the alliance productive.",
      reversed: "A business relationship suffers from mismatched expectations. Revisit the terms and clarify roles.",
    },
    money: {
      upright: "Joint ventures or shared financial decisions go smoothly when both parties communicate openly. Equal stakes help.",
      reversed: "Financial disagreements with a partner surface. Lay out the numbers together rather than arguing from assumptions.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-03",
    slug: "three-of-cups",
    name: "Three of Cups",
    arcana: "minor",
    suit: "cups",
    number: 3,
    upright: {
      keywords: ["friendship", "celebration", "community", "shared joy"],
      summary: "Friends raise their glasses together and the mood is generous. Collaboration and social connection bring warmth, and good news may be worth toasting.",
      action: "Reach out to a friend you have drifted from and set a date to meet.",
    },
    reversed: {
      keywords: ["overindulgence", "gossip", "isolation", "third-party interference"],
      summary: "The party has gone sour. Excess, exclusion, or someone meddling from outside is spoiling what should be a supportive circle.",
      action: "Step back from one social obligation that leaves you feeling worse than before.",
    },
    love: {
      upright: "Love is woven into a wider community, with friends and family celebrating alongside you. Social events may bring romantic sparks.",
      reversed: "An outside person or social drama is interfering with your relationship. Protect your privacy and set clear limits.",
    },
    career: {
      upright: "Team spirit and collaborative wins bring satisfaction. Networking leads to real opportunities.",
      reversed: "Office gossip or cliques are undermining teamwork. Stay out of the drama and keep your work visible.",
    },
    money: {
      upright: "Shared celebrations and social spending feel worthwhile. Enjoy them within reasonable limits.",
      reversed: "Overspending on social life or group expenses is adding up. Set a budget for entertaining before the next invitation.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-04",
    slug: "four-of-cups",
    name: "Four of Cups",
    arcana: "minor",
    suit: "cups",
    number: 4,
    upright: {
      keywords: ["apathy", "contemplation", "missed opportunity", "discontent"],
      summary: "Something is being offered and you cannot muster interest. Boredom or disappointment has turned your gaze inward, and a real gift may be slipping past unnoticed.",
      action: "Look again at the offer or invitation you dismissed and name one thing it could give you.",
    },
    reversed: {
      keywords: ["renewed interest", "acceptance", "motivation", "moving on"],
      summary: "The fog of indifference begins to lift. You are ready to engage again, to accept what is offered, or to stop ruminating and act.",
      action: "Say yes to the next reasonable opportunity instead of weighing it indefinitely.",
    },
    love: {
      upright: "Emotional withdrawal or taking a partner for granted is creating distance. Notice what is good before it stops being offered.",
      reversed: "You re-engage with a relationship or open up to new romance after a withdrawn period. Appreciation returns.",
    },
    career: {
      upright: "Boredom with the job or dissatisfaction is dulling your performance. Consider whether the problem is the role or your approach to it.",
      reversed: "Fresh motivation emerges, or you finally accept an opportunity you had been ignoring. Act on it.",
    },
    money: {
      upright: "Apathy about finances may mean missing a useful option. Review what you have been ignoring.",
      reversed: "You take renewed interest in managing money and spot an opportunity that was there all along.",
    },
    yesNo: "no",
  },
  {
    id: "cups-05",
    slug: "five-of-cups",
    name: "Five of Cups",
    arcana: "minor",
    suit: "cups",
    number: 5,
    upright: {
      keywords: ["loss", "grief", "regret", "disappointment"],
      summary: "Three cups have spilled and all you can see is what was lost. The grief is valid, but two cups still stand behind you, waiting to be noticed.",
      action: "Acknowledge the loss honestly, then write down two things that remain intact.",
    },
    reversed: {
      keywords: ["acceptance", "moving forward", "forgiveness", "finding peace"],
      summary: "You turn from the spilled cups to the ones still standing. Healing begins as you release what cannot be changed and reclaim what can.",
      action: "Forgive one thing, in yourself or someone else, that you have been carrying.",
    },
    love: {
      upright: "Heartbreak, disappointment, or mourning a relationship that did not work out. Allow the grief without letting it define everything.",
      reversed: "Emotional recovery from a loss or breakup is underway. New openness to connection becomes possible.",
    },
    career: {
      upright: "A setback, rejection, or failed project hurts. Learn from it without letting it erase your previous successes.",
      reversed: "You bounce back from professional disappointment with new perspective. Opportunities reappear once you look up.",
    },
    money: {
      upright: "A financial loss or regret over a decision weighs on you. Focus on what remains rather than what is gone.",
      reversed: "Recovery from a financial setback begins. Lessons learned now help you rebuild more wisely.",
    },
    yesNo: "no",
  },
  {
    id: "cups-06",
    slug: "six-of-cups",
    name: "Six of Cups",
    arcana: "minor",
    suit: "cups",
    number: 6,
    upright: {
      keywords: ["nostalgia", "innocence", "childhood", "reunion"],
      summary: "The past returns with a gentle hand, bringing old friends, sweet memories, or a simple kindness. Reconnecting with what once felt pure can restore you.",
      action: "Do one activity you loved as a child, purely for the joy of it.",
    },
    reversed: {
      keywords: ["stuck in the past", "idealized memories", "letting go", "growing up"],
      summary: "Nostalgia has become a hiding place. Clinging to how things were is keeping you from what they could become.",
      action: "Identify one old pattern you keep repeating and choose a different response this week.",
    },
    love: {
      upright: "An old flame reappears or a relationship rekindles its early sweetness. Shared history can be a comfort.",
      reversed: "Comparing a current partner to the past, or refusing to let go of an ex, blocks real intimacy. Live in the present relationship.",
    },
    career: {
      upright: "A former colleague, mentor, or past skill resurfaces helpfully. Your roots may open current doors.",
      reversed: "Clinging to an old role or outdated method is holding you back. Update your approach to match today's needs.",
    },
    money: {
      upright: "A gift, inheritance, or help from family may arrive. Gratitude and generosity go together.",
      reversed: "Old spending habits or dependence on past support are limiting you. Build independence step by step.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-07",
    slug: "seven-of-cups",
    name: "Seven of Cups",
    arcana: "minor",
    suit: "cups",
    number: 7,
    upright: {
      keywords: ["choices", "illusion", "fantasy", "wishful thinking"],
      summary: "Too many options shimmer in the clouds, each promising something different. Some are real and some are mirages, and daydreaming will not tell them apart.",
      action: "Narrow your options to two and research the practical reality of each.",
    },
    reversed: {
      keywords: ["clarity", "decision made", "focus", "disillusionment"],
      summary: "The fog clears and you see which cup holds something real. Commitment replaces fantasy, though some illusions may fall hard.",
      action: "Make the decision you have been circling and set a date to begin.",
    },
    love: {
      upright: "Too many romantic options, or an idealized picture of someone, is clouding your judgment. Look past the fantasy.",
      reversed: "You see a person or relationship clearly, for better or worse. Choose based on reality.",
    },
    career: {
      upright: "Multiple paths tempt you, but indecision keeps you from any of them. Separate real opportunities from daydreams.",
      reversed: "You commit to a direction and let the rest go. Focus accelerates progress.",
    },
    money: {
      upright: "Get-rich schemes or scattered financial goals pull you in too many directions. Pick a realistic plan.",
      reversed: "Financial clarity emerges as unrealistic options are discarded. A grounded strategy takes shape.",
    },
    yesNo: "maybe",
  },
  {
    id: "cups-08",
    slug: "eight-of-cups",
    name: "Eight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 8,
    upright: {
      keywords: ["walking away", "seeking deeper meaning", "abandonment", "transition"],
      summary: "What you built no longer feeds you, so you leave it behind to seek something truer. The departure is quiet but deliberate.",
      action: "Name what you have outgrown and take one step away from it.",
    },
    reversed: {
      keywords: ["fear of change", "stagnation", "returning", "avoidance"],
      summary: "You know it is time to go but you stay, afraid of the unknown. Or you drift back to what you left without having changed.",
      action: "Write down what keeps you in a situation you have already decided is finished.",
    },
    love: {
      upright: "Leaving a relationship that no longer nourishes you, or needing space to find yourself. Honor the pull toward something more fulfilling.",
      reversed: "Staying in an unfulfilling relationship out of fear, or returning to one that has not changed. Reflect on what you truly want.",
    },
    career: {
      upright: "Moving on from a job or path that has lost meaning. The search for purpose matters more than security right now.",
      reversed: "Avoiding a needed career change keeps you stuck. Address the fear before it becomes resignation.",
    },
    money: {
      upright: "Walking away from a financial situation that drains you, even at some cost. Long-term wellbeing outweighs short-term comfort.",
      reversed: "Clinging to a financial setup that no longer works because change feels risky. Consider the cost of staying.",
    },
    yesNo: "no",
  },
  {
    id: "cups-09",
    slug: "nine-of-cups",
    name: "Nine of Cups",
    arcana: "minor",
    suit: "cups",
    number: 9,
    upright: {
      keywords: ["contentment", "wish fulfilled", "satisfaction", "gratitude"],
      summary: "You sit among your cups with quiet satisfaction. A wish is granted, and the pleasure of having enough is yours to enjoy.",
      action: "Make a list of what is going right and savor it before chasing the next thing.",
    },
    reversed: {
      keywords: ["dissatisfaction", "greed", "smugness", "unfulfilled wishes"],
      summary: "Having what you wanted did not bring the feeling you expected. Or you are indulging in excess to fill a space that pleasure cannot.",
      action: "Ask yourself what you really wanted underneath the wish, and pursue that instead.",
    },
    love: {
      upright: "Emotional fulfillment and a relationship that feels like a wish come true. Enjoy it without taking it for granted.",
      reversed: "A relationship looks ideal but leaves you unsatisfied. Explore what is missing with honesty.",
    },
    career: {
      upright: "Professional satisfaction and the achievement of a long-held goal. Share the success with others.",
      reversed: "Success feels hollow, or complacency is setting in. Reconnect with purpose beyond the achievement.",
    },
    money: {
      upright: "Financial comfort and the ability to enjoy what you have. Gratitude keeps abundance in perspective.",
      reversed: "Overindulgence or the pursuit of more for its own sake disrupts balance. Reassess what enough means to you.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-10",
    slug: "ten-of-cups",
    name: "Ten of Cups",
    arcana: "minor",
    suit: "cups",
    number: 10,
    upright: {
      keywords: ["harmony", "family", "lasting happiness", "emotional fulfillment"],
      summary: "A rainbow arches over home and family, and the happiness is shared. Emotional bonds reach their fullest expression in peace and belonging.",
      action: "Spend unhurried time with the people who feel like home.",
    },
    reversed: {
      keywords: ["broken family", "disharmony", "unrealistic ideals", "disconnection"],
      summary: "The picture of domestic bliss is cracking. Conflict, distance, or impossible expectations are disrupting the harmony you hoped for.",
      action: "Have the conversation you have been avoiding with a family member or partner.",
    },
    love: {
      upright: "A deeply fulfilling relationship with long-term potential. Emotional security and shared values anchor it.",
      reversed: "Idealized expectations or family tension strain the bond. Work on reality rather than the fantasy.",
    },
    career: {
      upright: "Work-life harmony and a supportive workplace that feels like a community. Values align with career.",
      reversed: "Work pressures are disrupting home life, or the job conflicts with personal values. Rebalance your priorities.",
    },
    money: {
      upright: "Financial stability supports a happy home. Resources serve relationships, not the other way around.",
      reversed: "Money stress is affecting family harmony. Open discussion about finances can ease the strain.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-11",
    slug: "page-of-cups",
    name: "Page of Cups",
    arcana: "minor",
    suit: "cups",
    number: 11,
    upright: {
      keywords: ["creative inspiration", "intuition", "emotional messages", "curiosity"],
      summary: "A tender, imaginative energy appears, bringing unexpected feelings or artistic sparks. Be open to emotional surprises and intuitive hints.",
      action: "Follow one creative or intuitive impulse today without judging it first.",
    },
    reversed: {
      keywords: ["emotional immaturity", "creative block", "escapism", "insecurity"],
      summary: "Sensitivity turns into moodiness or avoidance. Creative flow is blocked, and feelings are being dodged instead of expressed.",
      action: "Face one feeling you have been avoiding by naming it out loud or on paper.",
    },
    love: {
      upright: "A sweet, sensitive new connection or a heartfelt message. Vulnerability opens doors.",
      reversed: "Emotional immaturity or mixed signals confuse the relationship. Clarify intentions gently.",
    },
    career: {
      upright: "Creative ideas and intuitive insights enhance your work. A new opportunity may come from an unexpected source.",
      reversed: "Creative blocks or lack of confidence hold you back. Nurture your inner voice before seeking outside approval.",
    },
    money: {
      upright: "An intuitive hunch or creative venture may bring financial surprises. Stay realistic while exploring.",
      reversed: "Emotional spending or avoidance of financial reality causes problems. Confront the numbers with compassion.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-12",
    slug: "knight-of-cups",
    name: "Knight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 12,
    upright: {
      keywords: ["romance", "charm", "idealism", "following the heart"],
      summary: "A romantic, artistic spirit rides in with an offer or an invitation. Emotions lead the way, and charm opens hearts.",
      action: "Make a heartfelt gesture toward someone you care about.",
    },
    reversed: {
      keywords: ["moodiness", "unrealistic expectations", "disappointment", "manipulation"],
      summary: "The romantic ideal collapses into moodiness or deception. Promises are made but not kept, and emotions are used rather than shared.",
      action: "Check whether words and actions match before trusting the next sweet promise.",
    },
    love: {
      upright: "A romantic proposal or a charming new suitor. Emotional openness and grand gestures feature strongly.",
      reversed: "A partner who talks sweetly but does not follow through. Guard against being swept away by words alone.",
    },
    career: {
      upright: "Creative projects and diplomatic approaches succeed. Emotional intelligence advances your goals.",
      reversed: "Unrealistic plans or moody behavior disrupt progress. Ground your ideas in practical steps.",
    },
    money: {
      upright: "An appealing financial offer arrives. Evaluate it with both heart and head.",
      reversed: "A deal that sounds too good to be true may be just that. Verify before committing.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-13",
    slug: "queen-of-cups",
    name: "Queen of Cups",
    arcana: "minor",
    suit: "cups",
    number: 13,
    upright: {
      keywords: ["compassion", "emotional depth", "intuition", "nurturing"],
      summary: "Calm emotional wisdom holds space for others without losing itself. Intuition runs deep, and empathy becomes a quiet strength.",
      action: "Listen to someone fully today without offering advice unless asked.",
    },
    reversed: {
      keywords: ["emotional insecurity", "codependency", "martyrdom", "overwhelm"],
      summary: "Caring for everyone else has drained the well. Emotional boundaries have blurred, and feelings are controlling rather than guiding.",
      action: "Set one boundary that protects your emotional energy, and keep it.",
    },
    love: {
      upright: "A deeply caring, intuitive partner or a relationship rooted in emotional safety. Love feels like being truly seen.",
      reversed: "Giving too much or losing yourself in a partner's needs. Restore your own emotional center.",
    },
    career: {
      upright: "Empathy and intuition make you a trusted colleague or leader. Caring professions or creative roles thrive.",
      reversed: "Absorbing others' stress or lacking boundaries at work leads to burnout. Protect your energy.",
    },
    money: {
      upright: "Compassionate, intuitive handling of resources. Generosity balanced with self-care.",
      reversed: "Emotional decisions or supporting others beyond your means strains finances. Practice financial self-respect.",
    },
    yesNo: "yes",
  },
  {
    id: "cups-14",
    slug: "king-of-cups",
    name: "King of Cups",
    arcana: "minor",
    suit: "cups",
    number: 14,
    upright: {
      keywords: ["emotional balance", "diplomacy", "wisdom", "composure"],
      summary: "Feelings run deep but the surface stays steady. Mature compassion and diplomatic skill let you lead with heart without being ruled by it.",
      action: "Respond to a tense situation with calm rather than reaction, and notice the difference.",
    },
    reversed: {
      keywords: ["emotional manipulation", "volatility", "coldness", "repressed feelings"],
      summary: "Control over emotion turns into either icy detachment or stormy outbursts. Feelings are being weaponized or buried instead of honored.",
      action: "Identify one emotion you have been suppressing and find a safe way to express it.",
    },
    love: {
      upright: "A steady, emotionally mature partner or a relationship built on trust and understanding. Calm support replaces drama.",
      reversed: "Emotional unavailability, manipulation, or volatility undermines trust. Seek clarity about what is really being felt.",
    },
    career: {
      upright: "Diplomatic leadership and emotional intelligence earn respect. Mediating conflicts or guiding teams suits you now.",
      reversed: "A moody or manipulative authority figure, or your own suppressed frustration, affects work. Address issues calmly but directly.",
    },
    money: {
      upright: "Balanced, thoughtful financial decisions. Emotional stability supports wise choices.",
      reversed: "Emotional turbulence clouds money judgment. Wait until you feel steady before making major decisions.",
    },
    yesNo: "yes",
  },
];
