// Static game content: questionnaire, life domains, quest tracks, world flavour, loot.
// Quest text placeholders are filled from the player's profile (see planner.js):
//   {min} {reps} {km} {pages} {occupation} {field} {skill} {name}
//   [[solo version||social version]] is chosen by the player's social trait.

export const DOMAINS = {
  body:   { name: 'Body',   stat: 'Might',   color: '#E07A4F', glyph: 'flame',  epithet: 'of the Iron Oath' },
  mind:   { name: 'Mind',   stat: 'Insight', color: '#7C9BE6', glyph: 'eye',    epithet: 'of the Lantern' },
  craft:  { name: 'Craft',  stat: 'Craft',   color: '#D8A740', glyph: 'anvil',  epithet: 'of the Forge' },
  wealth: { name: 'Wealth', stat: 'Fortune', color: '#52B68D', glyph: 'coin',   epithet: 'of the Gilded Road' },
  bonds:  { name: 'Bonds',  stat: 'Charm',   color: '#E585A6', glyph: 'heart',  epithet: 'of the Hearth' },
  spirit: { name: 'Spirit', stat: 'Resolve', color: '#B097E8', glyph: 'moon',   epithet: 'of the Still Water' },
};

export const CLASSES = {
  body:   { name: 'Warden',     blurb: 'A guardian whose strength is earned one rep at a time.' },
  mind:   { name: 'Arcanist',   blurb: 'A scholar who bends the world by understanding it.' },
  craft:  { name: 'Artificer',  blurb: 'A maker who turns intent into working things.' },
  wealth: { name: 'Coinwright', blurb: 'A strategist who grows small coins into kingdoms.' },
  bonds:  { name: 'Envoy',      blurb: 'A bridge between people, trusted on every road.' },
  spirit: { name: 'Mystic',     blurb: 'A steady flame that the Gloam cannot unsettle.' },
};

const swatch = (label, value) => ({ label, value });

export const STEPS = [
  {
    id: 'basics', title: 'Who are you, traveller?',
    intro: 'The realm needs to know its hero. Everything stays on this device.',
    fields: [
      { id: 'name', type: 'text', label: 'Name', placeholder: 'What should the realm call you?', required: true },
      { id: 'age', type: 'number', label: 'Age', min: 10, max: 110, required: true },
      { id: 'occupation', type: 'text', label: 'Occupation', placeholder: 'e.g. nurse, student, designer' },
      { id: 'education', type: 'choice', label: 'Highest education', options: [
        'Still in school', 'High school', 'Vocational / trade', "Bachelor's", "Master's", 'Doctorate'] },
      { id: 'field', type: 'text', label: 'Field of study or expertise', placeholder: 'e.g. biology, marketing' },
    ],
  },
  {
    id: 'body', title: 'Your physical form',
    intro: 'Used to shape your avatar and pitch physical quests at the right intensity.',
    fields: [
      { id: 'height', type: 'number', label: 'Height (cm)', min: 100, max: 230 },
      { id: 'build', type: 'choice', label: 'Build', options: ['Slight', 'Lean', 'Average', 'Broad', 'Heavy'] },
      { id: 'activity', type: 'choice', label: 'How active are you now?', options: [
        'Mostly sitting', 'Lightly active', 'Moderately active', 'Very active', 'Athlete'] },
      { id: 'sleep', type: 'number', label: 'Average sleep (hours)', min: 2, max: 14, step: 0.5 },
      { id: 'skin', type: 'swatch', label: 'Skin tone', options: [
        swatch('Porcelain', '#F6D7C3'), swatch('Sand', '#E8B994'), swatch('Honey', '#C98E5F'),
        swatch('Umber', '#9A6440'), swatch('Cocoa', '#6B4229'), swatch('Ebony', '#3F271A')] },
      { id: 'hair', type: 'swatch', label: 'Hair colour', options: [
        swatch('Black', '#1E1A1A'), swatch('Brown', '#5A3A24'), swatch('Auburn', '#8E3B1F'),
        swatch('Blonde', '#D9B467'), swatch('Silver', '#C9CED6'), swatch('Dyed', '#4FA3C7')] },
      { id: 'hairStyle', type: 'choice', label: 'Hair style', options: ['Short', 'Long', 'Curly', 'Braided', 'Shaved'] },
    ],
  },
  {
    id: 'nature', title: 'Your nature',
    intro: 'How much does each statement sound like you?',
    fields: [
      { id: 'social', type: 'scale', label: 'Being around people recharges me.', low: 'Not me', high: 'Very me' },
      { id: 'structure', type: 'scale', label: 'I prefer a fixed routine over going with the flow.', low: 'Not me', high: 'Very me' },
      { id: 'curiosity', type: 'scale', label: 'I get absorbed learning things nobody asked me to.', low: 'Not me', high: 'Very me' },
      { id: 'drive', type: 'scale', label: 'Competing, even with myself, motivates me.', low: 'Not me', high: 'Very me' },
      { id: 'patience', type: 'scale', label: 'I keep going when progress is slow.', low: 'Not me', high: 'Very me' },
      { id: 'calm', type: 'scale', label: 'I stay calm under pressure.', low: 'Not me', high: 'Very me' },
    ],
  },
  {
    id: 'skills', title: 'Skills and abilities',
    intro: 'Rate yourself honestly. Lower ratings mean gentler first quests, not a weaker hero.',
    fields: [
      { id: 'fitness', type: 'scale', label: 'Fitness and stamina', low: 'Beginner', high: 'Expert' },
      { id: 'learning', type: 'scale', label: 'Learning and study', low: 'Beginner', high: 'Expert' },
      { id: 'creativity', type: 'scale', label: 'Creativity', low: 'Beginner', high: 'Expert' },
      { id: 'communication', type: 'scale', label: 'Communication', low: 'Beginner', high: 'Expert' },
      { id: 'technical', type: 'scale', label: 'Technical or professional skill', low: 'Beginner', high: 'Expert' },
      { id: 'money', type: 'scale', label: 'Managing money', low: 'Beginner', high: 'Expert' },
      { id: 'discipline', type: 'scale', label: 'Self-discipline', low: 'Beginner', high: 'Expert' },
    ],
  },
  {
    id: 'aspirations', title: 'Your aspirations',
    intro: 'Choose up to three paths. Each becomes a region of your realm to reclaim.',
    fields: [
      { id: 'tracks', type: 'tracks', label: 'Paths to walk', max: 3, required: true },
      { id: 'skill', type: 'text', label: 'A skill or language you want to learn (optional)', placeholder: 'e.g. Spanish, guitar, Python' },
      { id: 'mainQuest', type: 'textarea', label: 'In one sentence, who do you want to become?', placeholder: 'A year from now, I want to…' },
      { id: 'minutes', type: 'choice', label: 'Time you can give each day', options: ['15 min', '30 min', '45 min', '60 min', '90 min'] },
      { id: 'horizon', type: 'choice', label: 'Plan length', options: ['3 months', '6 months', '12 months'] },
    ],
  },
];

// Skill rating that governs intensity for each domain.
export const DOMAIN_SKILL = {
  body: 'fitness', mind: 'learning', craft: 'technical', wealth: 'money', bonds: 'communication', spirit: 'discipline',
};

// Starting stats come from self-ratings.
export const STAT_FROM_SKILLS = {
  body: ['fitness'], mind: ['learning'], craft: ['technical', 'creativity'],
  wealth: ['money'], bonds: ['communication'], spirit: ['discipline'],
};

// Each milestone: [title, landmark, boss quest, [quests...]]
export const TRACKS = [
  // ───── BODY ─────
  { id: 'strength', domain: 'body', name: 'Forge a stronger body', desc: 'Build strength with bodyweight training, no gym needed.', milestones: [
    ['First sparks', 'Training Yard', 'Record your baseline: max push-ups, squats in 60 seconds, and plank time.',
      ['Do {reps} squats and {reps} wall or knee push-ups.', 'Take a {min}-minute brisk walk.', 'Stretch for 10 minutes before bed.', 'Block three workout slots in your calendar for this week.']],
    ['Iron habit', 'Smithy of Sinew', 'Finish four full workouts within seven days.',
      ['Do a {min}-minute full-body circuit: squats, push-ups, rows, plank.', 'Hold a plank three times, as long as you can each time.', 'Eat one protein-rich meal and note what it was.', 'Learn proper form for one new exercise from a trusted video.']],
    ['Tempered steel', 'Bastion of the Peaks', 'Retake your baseline test and beat it in two of three moves.',
      ['Add one rep or five seconds to every set of today\'s workout.', 'Do a {min}-minute [[solo strength session||workout with a friend or class]].', 'Do 10 minutes of mobility work for hips and shoulders.', 'Walk or take stairs instead of a lift or car once today.']],
    ['Champion\'s trial', 'Hall of Titans', 'Complete a trial workout with double the volume of your first week.',
      ['Do a {min}-minute session at your hardest sustainable effort.', 'Try a harder variation of one exercise (e.g. full push-ups, pistol squat progressions).', 'Plan next month\'s training so the habit outlives this plan.', 'Rest day: walk gently and sleep eight hours.']],
  ]},
  { id: 'cardio', domain: 'body', name: 'Run the long road', desc: 'Go from walking to running a full 5K.', milestones: [
    ['Find your feet', 'Waymarker Stones', 'Walk {km} km without stopping.',
      ['Walk briskly for {min} minutes.', 'Alternate 1 minute jogging with 2 minutes walking, 6 times.', 'Do 5 minutes of calf and hamstring stretches.', 'Check your shoes and plan a safe route for this week.']],
    ['Steady breath', 'Windward Trail', 'Run 2 km without walking.',
      ['Run–walk for {min} minutes: 3 minutes running, 1 minute walking.', '[[Run a quiet route alone||Run with a friend or local club]] for {min} minutes.', 'Practise slow nasal breathing for 5 minutes.', 'Log your runs so far and note how they felt.']],
    ['Lengthening stride', 'Bridge of Long Miles', 'Run 4 km at an easy pace.',
      ['Run continuously for {min} minutes at a pace where you could still talk.', 'Do 6 short hill or stair repeats.', 'Strengthen your legs: {reps} lunges and {reps} calf raises.', 'Take a full rest day and stretch.']],
    ['The long road', 'Gate of the Far Horizon', 'Run a 5K: an organised event or your own measured route.',
      ['Run {min} minutes, with the last 5 a little faster.', 'Plan your 5K day: route, time, what you\'ll eat.', 'Do an easy recovery jog of 15 minutes.', 'Tell someone about your 5K date.']],
  ]},
  { id: 'energy', domain: 'body', name: 'Restore energy and sleep', desc: 'Fix sleep, light, and daily energy.', milestones: [
    ['Dim the lanterns', 'Lamplighter\'s Post', 'Go to bed within 30 minutes of the same time for 5 nights.',
      ['Put screens away 30 minutes before bed tonight.', 'Get 10 minutes of daylight within an hour of waking.', 'No caffeine after 2pm today.', 'Write down your ideal sleep and wake times.']],
    ['Clear springs', 'Wellspring', 'Drink enough water every day for a week (track it).',
      ['Drink a glass of water first thing on waking.', 'Take a {min}-minute walk outdoors.', 'Make your bedroom darker or cooler in one small way.', 'Swap one sugary snack for fruit or nuts.']],
    ['Rising sun', 'Dawn Terrace', 'Wake at your target time for 7 days in a row.',
      ['Wake at your target time without snoozing.', 'Do 5 minutes of light stretching after waking.', 'Take a short walk after lunch instead of scrolling.', 'Write one line about your energy level today.']],
    ['Everflame', 'Sanctum of the Everflame', 'Write your personal energy rules and follow them for two weeks.',
      ['Keep your bedtime routine tonight, no exceptions.', 'Spend {min} minutes on a restoring activity (walk, bath, reading).', 'Review your week: what drained you, what restored you?', 'Remove one thing that consistently ruins your sleep.']],
  ]},
  { id: 'nourish', domain: 'body', name: 'Eat to thrive', desc: 'Build steady, healthy eating habits.', milestones: [
    ['Know your table', 'Harvest Market', 'Log everything you eat for three full days.',
      ['Write down everything you eat today.', 'Add a vegetable to two of today\'s meals.', 'Drink water with every meal.', 'Pick three healthy meals you actually enjoy.']],
    ['Hearthfire cooking', 'Hearth Kitchens', 'Cook five meals at home in one week.',
      ['Cook one meal from scratch.', 'Prepare tomorrow\'s lunch tonight.', '[[Try a new healthy recipe||Cook a healthy meal with or for someone]].', 'Write a simple grocery list before shopping.']],
    ['The balanced plate', 'Orchard of Plenty', 'Go one week with no fast food or takeaway.',
      ['Fill half your plate with vegetables at dinner.', 'Eat slowly: put your fork down between bites.', 'Have a protein-rich breakfast.', 'Prep healthy snacks for the next two days.']],
    ['The feast-keeper', 'Great Feast Hall', 'Write a sustainable weekly meal plan and follow it for two weeks.',
      ['Batch-cook two meals for the week.', 'Notice and note one emotional-eating trigger.', 'Try a vegetable you have never cooked.', 'Share a healthy meal idea with someone.']],
  ]},

  // ───── MIND ─────
  { id: 'language', domain: 'mind', name: 'Learn a new language', desc: 'Reach conversational confidence in {skill}.', milestones: [
    ['First words', 'Hall of Echoes', 'Introduce yourself aloud for one minute in {skill}.',
      ['Study {skill} for {min} minutes.', 'Learn 10 new words and say each aloud.', 'Label five objects at home in {skill}.', 'Listen to 10 minutes of {skill} audio.']],
    ['The listening ear', 'Whispering Galleries', 'Understand the gist of a 5-minute {skill} video without subtitles.',
      ['Study {skill} for {min} minutes.', 'Shadow a short audio clip: repeat each sentence out loud.', 'Write five sentences about your day in {skill}.', 'Review all words learned so far.']],
    ['A speaking tongue', 'Forum of Many Voices', 'Hold a 10-minute conversation in {skill} [[with a tutor||with a native speaker or exchange partner]].',
      ['Study {skill} for {min} minutes.', 'Record yourself speaking for 2 minutes and listen back.', 'Read a short article in {skill}.', 'Think in {skill} during one routine task.']],
    ['Fluent flame', 'Tower of Tongues', 'Watch a full episode or read a short story in {skill} and summarise it aloud.',
      ['Study {skill} for {min} minutes.', 'Have a [[written chat||spoken chat]] in {skill}.', 'Learn five idioms or expressions.', 'Set a {skill} goal for the next six months.']],
  ]},
  { id: 'reader', domain: 'mind', name: 'Read deeply', desc: 'Make reading a daily ritual and retain what you read.', milestones: [
    ['Open the tome', 'Reading Nook', 'Finish your first book of this plan.',
      ['Read {pages} pages.', 'Write a three-sentence summary of what you read.', 'Choose your next three books.', 'Replace 15 minutes of scrolling with reading.']],
    ['Lamplit study', 'Lamplit Archive', 'Finish a book from a genre you rarely read.',
      ['Read {pages} pages.', 'Note one idea worth remembering.', 'Read for {min} minutes without your phone nearby.', 'Look up one unfamiliar idea from your book.']],
    ['Marginalia', 'Scriptorium', 'Write a one-page reflection on a book that changed how you think.',
      ['Read {pages} pages.', 'Connect an idea from your book to your own life in writing.', '[[Reread your notes from last week||Discuss a book idea with someone]].', 'Read for {min} minutes before bed.']],
    ['The great library', 'Grand Library', 'Finish a challenging non-fiction book and teach its core idea to someone.',
      ['Read {pages} pages.', 'Make a one-page mind map of a book.', 'Recommend a book to a friend with a reason why.', 'Plan your reading list for next quarter.']],
  ]},
  { id: 'skill', domain: 'mind', name: 'Master a new skill', desc: 'Go from beginner to capable at {skill}.', milestones: [
    ['The apprentice', 'Apprentice\'s Hall', 'Finish the first module or lesson series of a {skill} course.',
      ['Practise {skill} for {min} minutes.', 'Find one good free resource for {skill}.', 'Write down what "good" looks like at {skill} in a year.', 'Watch an expert do {skill} and note three things.']],
    ['Deliberate practice', 'Practice Grounds', 'Make your first small finished piece of {skill} work.',
      ['Practise {skill} for {min} minutes on your weakest area.', 'Get feedback on one attempt.', 'Repeat a hard exercise until it feels easier.', 'Review your progress notes.']],
    ['The journeyman', 'Journeyman\'s Bridge', 'Complete a project that uses {skill} end to end.',
      ['Practise {skill} for {min} minutes.', 'Teach one thing you have learned to someone.', '[[Study an expert\'s work closely||Join a {skill} community or group]].', 'Push one step beyond your comfort zone.']],
    ['Mastery\'s door', 'Masters\' Spire', 'Share or show a {skill} piece you are proud of.',
      ['Practise {skill} for {min} minutes at full focus.', 'Polish your best piece of work.', 'Plan the next level of learning.', 'Write what you would tell your beginner self.']],
  ]},

  // ───── CRAFT ─────
  { id: 'career', domain: 'craft', name: 'Rise in your calling', desc: 'Grow and get recognised as a {occupation}.', milestones: [
    ['Survey the land', 'Guild Hall', 'Write down where you want to be as a {occupation} in a year and the three skills that get you there.',
      ['Do a {min}-minute deep-work block with no notifications.', 'Write down one win from today.', 'Identify one skill gap holding you back.', 'Ask a colleague how they approach a task you find hard.']],
    ['Sharpen the blade', 'Whetstone Works', 'Ask your manager or a mentor for specific feedback and write it down.',
      ['Spend {min} minutes learning a skill from your gap list.', 'Do a {min}-minute deep-work block.', 'Help a colleague with something.', 'Tidy your workspace and to-do list.']],
    ['Visible work', 'Banner Keep', 'Volunteer for or lead a visible project.',
      ['Share an update on your work [[in writing||in a meeting]].', 'Document a result with numbers.', 'Do a {min}-minute deep-work block on your project.', 'Reach out to someone senior you can learn from.']],
    ['The masterwork', 'Masterwork Forge', 'Update your CV or portfolio with three measurable wins, then ask for the next role or raise.',
      ['Rehearse how you will ask for what you want.', 'Do a {min}-minute deep-work block.', 'Write your career story in five sentences.', 'Thank someone who helped you this year.']],
  ]},
  { id: 'pivot', domain: 'craft', name: 'Change your path', desc: 'Move into a new career that fits you better.', milestones: [
    ['Read the stars', 'Observatory', 'Write a shortlist of three target roles and why each fits you.',
      ['Research one possible role for {min} minutes.', 'List skills from your {occupation} work that transfer.', 'Read one real job listing closely.', 'Write what you want more and less of in work.']],
    ['Ask the travellers', 'Waystation Inn', 'Have two conversations with people already in your target role.',
      ['Send one message asking someone for a 15-minute chat.', 'Prepare five questions for an informational interview.', 'Follow a few people in your target field.', 'Note one surprise from your research.']],
    ['Build the bridge', 'Builder\'s Bridge', 'Finish a course or small project that proves you can do the new work.',
      ['Study for your new path for {min} minutes.', 'Work on a portfolio piece for {min} minutes.', 'Rewrite one CV bullet for your new direction.', 'Join a community in your target field.']],
    ['Cross over', 'Far Shore Gate', 'Apply to five roles in your new field.',
      ['Tailor one application.', 'Practise answering "why the switch?" aloud.', 'Ask someone to review your CV.', 'Do a {min}-minute focused job-search block.']],
  ]},
  { id: 'build', domain: 'craft', name: 'Build something of your own', desc: 'Take a side project from idea to real users.', milestones: [
    ['The spark', 'Tinker\'s Workshop', 'Write a one-paragraph pitch: what it is, who it is for, why it matters.',
      ['Brainstorm 10 project ideas for {min} minutes.', 'Talk to someone who might use your idea.', 'Sketch your project on paper.', 'Pick the smallest version you could finish in a month.']],
    ['Rough iron', 'Prototype Foundry', 'Finish a working first version, however rough.',
      ['Build for {min} minutes.', 'Fix one thing that blocks progress.', 'Write tomorrow\'s first task before stopping.', 'Cut one feature you don\'t need yet.']],
    ['Show the work', 'Market Square', 'Show your project to five people and collect feedback.',
      ['Build for {min} minutes.', '[[Share your project online||Demo it to a friend in person]].', 'Write down the top three pieces of feedback.', 'Improve the first thing a newcomer sees.']],
    ['Launch day', 'Launch Tower', 'Launch publicly and get your first real user or customer.',
      ['Build for {min} minutes.', 'Write a short launch post.', 'Ask one person to try it today.', 'Plan what comes after launch.']],
  ]},
  { id: 'cert', domain: 'craft', name: 'Earn a credential', desc: 'Earn a certification or qualification in {field}.', milestones: [
    ['Choose the seal', 'Registrar\'s Office', 'Pick a credential, its exam date, and what it costs.',
      ['Research credentials in {field} for {min} minutes.', 'Find the official syllabus or study guide.', 'Write a weekly study schedule.', 'Ask someone who passed it for tips.']],
    ['Foundations', 'Hall of Foundations', 'Complete the first third of the syllabus.',
      ['Study for {min} minutes.', 'Make flashcards for today\'s topic.', 'Explain one concept aloud without notes.', 'Review last week\'s material.']],
    ['Proving grounds', 'Proving Grounds', 'Score 70% or more on a full practice exam.',
      ['Study for {min} minutes.', 'Do 20 practice questions.', 'Revisit your weakest topic.', '[[Study alone without distractions||Join a study group session]].']],
    ['The seal', 'Hall of Seals', 'Sit the exam or submit the final assessment.',
      ['Do a timed practice section.', 'Study for {min} minutes.', 'Prepare your exam-day kit and route.', 'Sleep eight hours before a study day.']],
  ]},

  // ───── WEALTH ─────
  { id: 'fund', domain: 'wealth', name: 'Build a safety fund', desc: 'Save an emergency fund that covers bad months.', milestones: [
    ['Count the coins', 'Counting House', 'Track every expense for two full weeks.',
      ['Record every purchase today.', 'Check your bank balance and write it down.', 'List your fixed monthly bills.', 'Cancel or pause one subscription you don\'t use.']],
    ['The ledger', 'Ledger Hall', 'Write a monthly budget and stick to it for one month.',
      ['Record every purchase today.', 'Have a no-spend day.', 'Compare one bill against cheaper alternatives.', 'Set a savings target for one month of expenses.']],
    ['Filling the vault', 'Stone Vault', 'Set up an automatic transfer into a separate savings account.',
      ['Move a small amount into savings today.', 'Cook instead of buying one meal and save the difference.', 'Sell or list one thing you no longer need.', 'Review this week\'s spending against your budget.']],
    ['The treasury', 'Royal Treasury', 'Reach one month of essential expenses saved.',
      ['Record every purchase today.', 'Review your budget for leaks.', 'Plan your next savings target.', 'Have a no-spend day.']],
  ]},
  { id: 'debt', domain: 'wealth', name: 'Slay your debts', desc: 'Pay down debt with a clear plan.', milestones: [
    ['Name the beast', 'Watchtower', 'List every debt with its balance, interest rate, and minimum payment.',
      ['Find one statement and write down its numbers.', 'Record every purchase today.', 'Choose a payoff method: smallest balance first or highest interest first.', 'Remove a saved card from one shopping site.']],
    ['Draw the sword', 'Armory', 'Make an extra payment on your target debt.',
      ['Find one expense to cut and redirect it to debt.', 'Have a no-spend day.', 'Set up automatic minimum payments.', 'Call one lender to ask about a lower rate.']],
    ['Wound the beast', 'Siege Camp', 'Pay off your first debt completely, or cut your target in half.',
      ['Record every purchase today.', 'Put any unexpected money toward debt.', 'Review progress and redraw your payoff chart.', 'Find a free activity to replace a paid one.']],
    ['Slayer', 'Slayer\'s Monument', 'Write a debt-free date and a plan that holds after this plan ends.',
      ['Make a payment, any size, toward debt.', 'Celebrate progress without spending.', 'Build a small buffer so new debt is not needed.', 'Review your budget for the next month.']],
  ]},
  { id: 'invest', domain: 'wealth', name: 'Start investing', desc: 'Learn the basics and start investing steadily (education, not financial advice).', milestones: [
    ['The apprentice coin', 'Moneychangers\' Row', 'Explain compound interest and diversification in your own words.',
      ['Read about investing basics for {min} minutes.', 'Calculate your monthly surplus after bills.', 'Look up what an index fund is.', 'Write down your investing goal and timeline.']],
    ['Map the markets', 'Cartographers\' Guild', 'Compare fees and options at three providers or accounts available to you.',
      ['Read about investing for {min} minutes.', 'Learn what "expense ratio" means.', 'Check whether your employer offers a retirement plan or match.', 'Note your risk tolerance in one paragraph.']],
    ['First seed', 'Seed Orchard', 'Open an account and make your first small investment.',
      ['Read about investing for {min} minutes.', 'Decide a monthly amount you can invest safely.', 'Avoid checking prices today.', 'Make sure your emergency fund comes first.']],
    ['The long grove', 'Evergrove', 'Set up an automatic monthly contribution.',
      ['Read about investing for {min} minutes.', 'Review your plan — no panic moves.', '[[Write your rules for staying invested||Talk money goals with someone you trust]].', 'Learn about one tax-advantaged account where you live.']],
  ]},

  // ───── BONDS ─────
  { id: 'kin', domain: 'bonds', name: 'Deepen your bonds', desc: 'Grow closer to friends and family.', milestones: [
    ['Rekindle', 'Signal Fires', 'Reconnect with someone you have drifted from.',
      ['Send a thoughtful message to a friend.', 'Call a family member for 10 minutes.', 'Write down five people who matter to you.', 'Ask someone a question you have never asked them.']],
    ['Shared table', 'Common Hearth', 'Host or plan a meal or activity with people you care about.',
      ['Give someone your full attention, phone away, for {min} minutes.', 'Remember and ask about something a friend told you.', '[[Write a note of appreciation||Invite someone to a small plan]].', 'Do a small kind thing without being asked.']],
    ['The open door', 'Kindred Bridge', 'Have one honest, deep conversation you have been avoiding.',
      ['Tell someone what you appreciate about them.', 'Listen without giving advice for a whole conversation.', 'Check in on someone who is going through a hard time.', 'Share something real about yourself.']],
    ['Hearthkeeper', 'Hearthkeeper\'s Hall', 'Set up a recurring ritual with someone (weekly call, monthly dinner).',
      ['Plan the next gathering.', 'Send a voice note or letter.', 'Forgive one small grudge.', 'Thank someone for being in your life.']],
  ]},
  { id: 'network', domain: 'bonds', name: 'Widen your circle', desc: 'Meet new people and build a network.', milestones: [
    ['First greeting', 'Crossroads Inn', 'Start a conversation with three new people.',
      ['[[Send one thoughtful message to someone new||Say hello to someone new today]].', 'Update one online profile.', 'List three communities you could join.', 'Compliment someone sincerely.']],
    ['Join the guild', 'Guildhouse', 'Attend a meetup, class, or community event.',
      ['Comment meaningfully on someone\'s work.', 'Reach out to an old contact.', 'Find two events near you.', 'Prepare a short, warm way to introduce yourself.']],
    ['Give first', 'Gift Exchange', 'Help three people in your network without being asked.',
      ['Share a useful article with someone it would help.', 'Make an introduction between two people.', '[[Write a helpful post or answer||Offer to help at a community event]].', 'Follow up with someone you met recently.']],
    ['The great hall', 'Council Hall', 'Organise or co-host a small gathering.',
      ['Invite one person to coffee.', 'Thank someone who helped you.', 'Review who you met and who to follow up with.', 'Have a {min}-minute conversation with someone new.']],
  ]},
  { id: 'voice', domain: 'bonds', name: 'Find your voice', desc: 'Speak with confidence, one-on-one and in front of groups.', milestones: [
    ['First words', 'Speaker\'s Stone', 'Record a 2-minute talk on something you know well.',
      ['Read a passage aloud for 5 minutes.', 'Share an opinion in a conversation.', 'Watch a great speaker and note one technique.', 'Practise slowing down your speech.']],
    ['Steady voice', 'Echoing Amphitheatre', 'Speak up once in a group meeting or class.',
      ['Practise a 1-minute talk without notes.', 'Ask a question in public.', 'Breathe slowly for 2 minutes before talking.', 'Tell a short story to a friend.']],
    ['Command the room', 'Hall of Orators', 'Give a 5-minute talk to a small group.',
      ['Rehearse your talk for {min} minutes.', 'Record yourself and note one improvement.', '[[Practise in front of a mirror||Practise in front of a friend]].', 'Learn to handle a question you can\'t answer.']],
    ['Orator', 'Orator\'s Spire', 'Present to a bigger audience or join a speaking club.',
      ['Rehearse for {min} minutes.', 'Write a strong opening line.', 'Give feedback to another speaker.', 'Speak up in a moment you would usually stay quiet.']],
  ]},

  // ───── SPIRIT ─────
  { id: 'calm', domain: 'spirit', name: 'Quiet the storm', desc: 'Reduce stress with mindfulness and reflection.', milestones: [
    ['First breath', 'Still Pool', 'Meditate seven days in a row.',
      ['Meditate for {min} minutes, or start with 5.', 'Write three things you are grateful for.', 'Take a walk without your phone.', 'Do box breathing: 4 in, 4 hold, 4 out, 4 hold, for 2 minutes.']],
    ['Clear water', 'Reflecting Pond', 'Journal every day for a week.',
      ['Journal for 10 minutes.', 'Meditate for {min} minutes.', 'Notice one stress trigger and write it down.', 'Spend 15 minutes in nature.']],
    ['The quiet mind', 'Moonlit Shrine', 'Take a half-day digital detox.',
      ['Meditate for {min} minutes.', 'Do one task with full attention, slowly.', 'Say no to one thing that drains you.', '[[Do a solo body scan||Do a guided group or class session]].']],
    ['Still water', 'Temple of Still Water', 'Write your personal toolkit for hard days and use it once.',
      ['Meditate for {min} minutes.', 'Review your journal and note a pattern.', 'Do something kind for yourself.', 'Help someone else feel calmer.']],
  ]},
  { id: 'create', domain: 'spirit', name: 'Wake the muse', desc: 'Build a creative practice: art, writing, music, anything.', milestones: [
    ['Kindle', 'Painter\'s Glade', 'Make something every day for a week, however small.',
      ['Create for {min} minutes.', 'Collect five pieces of inspiration.', 'Make something deliberately bad, just for fun.', 'Set up a space where creating is easy.']],
    ['The study', 'Muse\'s Atelier', 'Copy or study the work of someone you admire.',
      ['Create for {min} minutes.', 'Learn one new technique.', 'Finish something you started.', 'Write why you want to create.']],
    ['The offering', 'Gallery of Lights', 'Share one piece of your work [[online||with a friend in person]].',
      ['Create for {min} minutes.', 'Ask one person for gentle feedback.', 'Experiment with a new medium or style.', 'Look back at your first piece and note progress.']],
    ['The opus', 'Opus Cathedral', 'Complete a larger piece you are proud of.',
      ['Create for {min} minutes.', 'Polish one detail of your opus.', 'Plan your next creative project.', 'Celebrate your practice without judging it.']],
  ]},
  { id: 'habits', domain: 'spirit', name: 'Iron will', desc: 'Build discipline and routines that stick.', milestones: [
    ['The oath', 'Oathstone', 'Keep one keystone habit seven days in a row.',
      ['Make your bed right after waking.', 'Write your top three tasks for the day.', 'Do the hardest task first for {min} minutes.', 'Prepare tomorrow tonight: clothes, bag, plan.']],
    ['The morning bell', 'Bell Tower', 'Keep a phone-free first 30 minutes for a week.',
      ['Keep your phone away for the first 30 minutes of the day.', 'Do a {min}-minute focus block with a timer.', 'Track your keystone habit.', 'Clear one small task you have been avoiding.']],
    ['Unbroken chain', 'Chain Bridge', 'Reach a 21-day streak on your keystone habit.',
      ['Do the hardest task first for {min} minutes.', 'Turn off non-essential notifications.', 'Review today: what worked, what didn\'t?', '[[Tell yourself the plan in writing||Tell a friend your goal for the week]].']],
    ['Unshakeable', 'Citadel of Will', 'Design a weekly review ritual and complete it three weeks in a row.',
      ['Do a {min}-minute focus block.', 'Do your weekly review.', 'Add a second small habit to your keystone.', 'Keep a promise you made to yourself.']],
  ]},
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map(t => [t.id, t]));

export const REGION_NAMES = {
  body:   ['Ironroot Highlands', 'Emberfell Peaks', 'The Stonebrow Hills'],
  mind:   ['Lanternspire', 'The Whispering Stacks', 'Owlmere'],
  craft:  ['Forgeward', 'Anvilmere', 'The Cogwright Vale'],
  wealth: ['The Gilded Marches', 'Coinreach Delta', 'Saffron Weald'],
  bonds:  ['Hearthvale', 'The Kindred Meadows', 'Rosewater Commons'],
  spirit: ['Mistwillow', 'The Stillwater Fen', 'Moonhollow'],
};

export const REALM_PARTS = {
  a: ['Aster', 'Vel', 'Orr', 'Thal', 'Myr', 'Cael', 'Ven', 'Iss', 'Brae', 'Lun'],
  b: ['moor', 'haven', 'reach', 'wyn', 'dale', 'mark', 'holt', 'mere', 'ford', 'garde'],
};

// Lines for the chronicle. {region} {landmark} {name}
export const RESTORE_LINES = {
  body:   ['The forges of {region} roar back to life.', 'Drums echo from {landmark}; the hill-folk train again.', 'Iron-grey fog breaks over {region} as {name} passes.'],
  mind:   ['Lanterns relight along the stacks of {region}.', 'Scholars return to {landmark}, blinking at the new light.', 'Forgotten books in {region} remember their words.'],
  craft:  ['Hammers ring once more in {region}.', 'The great bellows of {landmark} breathe again.', 'Gears turn in {region}; workshops reopen their shutters.'],
  wealth: ['Caravans return to the roads of {region}.', 'The coffers of {landmark} fill with honest coin.', 'Market bells ring across {region}.'],
  bonds:  ['Hearthfires spread from door to door in {region}.', 'Songs drift from {landmark} late into the night.', 'Old friends meet again on the roads of {region}.'],
  spirit: ['The mists of {region} turn from grey to silver.', 'Still water at {landmark} reflects stars again.', 'A calm wind settles over {region}.'],
};

export const CAPITAL_TIERS = ['Ruined Camp', 'Hamlet', 'Village', 'Market Town', 'Walled City', 'Radiant Citadel'];

export const LOOT = {
  slots: ['weapon', 'armor', 'trinket'],
  weapon: {
    body: ['Greatsword', 'Warhammer'], mind: ['Staff', 'Grimoire'], craft: ['Forge Hammer', 'Arc Wrench'],
    wealth: ['Rapier', 'Merchant Scales'], bonds: ['Lute', 'Banner'], spirit: ['Lantern', 'Moonblade'],
  },
  armor: {
    body: ['Plate', 'Mail'], mind: ['Robes', 'Mantle'], craft: ['Apron', 'Gauntlets'],
    wealth: ['Doublet', 'Coat'], bonds: ['Cloak', 'Tabard'], spirit: ['Vestments', 'Shroud'],
  },
  trinket: {
    body: ['Bloodstone', 'Bracer'], mind: ['Monocle', 'Quill'], craft: ['Cog Charm', 'Compass'],
    wealth: ['Signet Ring', 'Lucky Coin'], bonds: ['Locket', 'Friendship Band'], spirit: ['Moon Amulet', 'Prayer Beads'],
  },
  rarities: [
    { id: 'common', name: 'Common', color: '#A9A69C', prefixes: ['Worn', 'Plain', 'Sturdy'] },
    { id: 'uncommon', name: 'Uncommon', color: '#8FCB6B', prefixes: ['Fine', 'Keen', 'Steady'] },
    { id: 'rare', name: 'Rare', color: '#6FA8F0', prefixes: ['Runed', 'Gloamproof', 'Bright'] },
    { id: 'epic', name: 'Epic', color: '#C38BF0', prefixes: ['Dawnforged', 'Starwoven', 'Stormbound'] },
    { id: 'legendary', name: 'Legendary', color: '#F2C14E', prefixes: ["Kingmaker's", "First Light's", "Worldmender's"] },
  ],
};

export const DEFAULT_REWARDS = [
  { name: 'A guilt-free episode of a show', cost: 60 },
  { name: 'A favourite treat', cost: 90 },
  { name: 'An evening off with no plans', cost: 220 },
  { name: 'Buy a small thing you have wanted', cost: 450 },
];

// Light side quests that keep the board full on quiet days.
export const SIDE_QUESTS = [
  ['body', 'Drink a full glass of water right now.'],
  ['body', 'Stand up and stretch for 3 minutes.'],
  ['spirit', 'Take five slow, deep breaths.'],
  ['spirit', 'Tidy one surface for 5 minutes.'],
  ['mind', 'Learn one new fact and tell someone.'],
  ['bonds', 'Send a kind message to someone.'],
  ['wealth', 'Check one recent purchase: was it worth it?'],
  ['craft', 'Clear five items from your inbox or to-do list.'],
];
