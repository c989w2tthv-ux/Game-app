// Game engine: daily quest board, rewards, levels, loot, world effects.
import { DOMAINS, LOOT, RESTORE_LINES, SIDE_QUESTS, DEFAULT_REWARDS } from './data.js';
import { normalizeProfile, buildPlan, buildHero } from './planner.js';
import { buildWorld, capitalTier } from './world.js';
import { rng, pick, todayKey, daysBetween, uid, hashString, clamp } from './util.js';

export const xpToNext = level => Math.round(100 * Math.pow(level, 1.45));

export function createGame(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const plan = buildPlan(profile);
  const hero = buildHero(profile, plan);
  const world = buildWorld(profile, plan, hero);
  const state = {
    version: 1, profile, plan, hero, world,
    board: null, chronicle: [], custom: [],
    rewards: DEFAULT_REWARDS.map(r => ({ ...r, id: uid() })),
    rerollDate: null, created: todayKey(),
  };
  log(state, 'lore', `${profile.name} the ${hero.className} arrives in ${world.realm}. The Gloam lies thick on every road.`);
  return state;
}

function log(state, kind, text, extra = {}) {
  state.chronicle.unshift({ id: uid(), date: todayKey(), kind, text, ...extra });
  if (state.chronicle.length > 300) state.chronicle.length = 300;
}

// ───────────── Daily board ─────────────

export function ensureToday(state) {
  const today = todayKey();
  // Neglect lets the Gloam creep back; it's cleared again by completing quests.
  const last = state.hero.lastActive;
  if (last) {
    const gap = daysBetween(last, today);
    if (gap > 1) {
      const target = clamp((gap - 1) * 6, 0, 40);
      if (target > state.world.encroach && state.board?.date !== today) {
        state.world.encroach = target;
        log(state, 'gloam', `The Gloam crept back over ${state.world.realm} while you were away (${gap - 1} quiet day${gap > 2 ? 's' : ''}).`);
      }
      if (gap > 1 && state.hero.streak > 0 && state.board?.date !== today) state.hero.streak = 0;
    }
  }
  if (state.board && state.board.date === today) return false;
  state.board = { date: today, quests: generateQuests(state, today) };
  return true;
}

function generateQuests(state, date, excludeIds = new Set()) {
  const dayN = hashString(date) % 997;
  const quests = [];
  const { tracks } = state.plan;
  const perTrack = tracks.length === 1 ? 3 : tracks.length === 2 ? 2 : 1;
  const prev = new Set((state.board?.quests || []).map(q => q.text));

  tracks.forEach((t, ti) => {
    if (t.current >= t.milestones.length) {
      // Path finished: keep a maintenance quest so the habit survives.
      const last = t.milestones[t.milestones.length - 1];
      quests.push(mkQuest(t, last.quests[(dayN + ti) % last.quests.length], 2, 'keep'));
      return;
    }
    const m = t.milestones[t.current];
    if (t.progress >= m.required) {
      quests.push(mkQuest(t, m.boss, m.diff + 2, 'boss'));
    }
    const pool = m.quests.filter(q => !prev.has(q));
    const src = pool.length >= perTrack ? pool : m.quests;
    for (let k = 0; k < perTrack; k++) {
      quests.push(mkQuest(t, src[(dayN + ti * 3 + k) % src.length], m.diff, 'quest'));
    }
  });

  const r = rng(date + state.profile.name);
  const side = pick(r, SIDE_QUESTS);
  quests.push({ id: uid(), kind: 'side', domain: side[0], text: side[1], diff: 0, done: false });

  // One-off custom quests stay on the board until done; daily ones repeat.
  state.custom.forEach(c => {
    quests.push({ id: uid(), kind: 'custom', customId: c.id, domain: c.domain, text: c.text, diff: c.diff, done: false });
  });
  // de-duplicate identical texts
  const seen = new Set();
  return quests.filter(q => !excludeIds.has(q.text) && !seen.has(q.text) && seen.add(q.text));
}

function mkQuest(track, text, diff, kind) {
  return { id: uid(), kind, trackId: track.id, domain: track.domain, text, diff, done: false };
}

export function canReroll(state) { return state.rerollDate !== todayKey(); }

export function rerollQuest(state, questId) {
  const q = state.board.quests.find(x => x.id === questId);
  if (!q || q.done || q.kind !== 'quest' || !canReroll(state)) return false;
  const t = state.plan.tracks.find(x => x.id === q.trackId);
  const m = t.milestones[t.current];
  const used = new Set(state.board.quests.map(x => x.text));
  const options = m.quests.filter(x => !used.has(x));
  if (!options.length) return false;
  q.text = options[Math.floor(Math.random() * options.length)];
  state.rerollDate = todayKey();
  return true;
}

// ───────────── Completing quests ─────────────

export function completeQuest(state, questId) {
  const q = state.board.quests.find(x => x.id === questId);
  if (!q || q.done) return null;
  const h = state.hero;
  const today = todayKey();
  const events = [];

  // Streak
  if (h.lastActive !== today) {
    h.streak = h.lastActive && daysBetween(h.lastActive, today) === 1 ? h.streak + 1 : 1;
    h.bestStreak = Math.max(h.bestStreak, h.streak);
    h.lastActive = today;
    if ([3, 7, 14, 30, 60, 100].includes(h.streak)) events.push({ type: 'streak', text: `${h.streak}-day streak` });
  }

  // Rewards scale with difficulty, level and streak.
  const diff = q.diff;
  const levelMult = 1 + (h.level - 1) * 0.06;
  const streakMult = 1 + Math.min(h.streak, 30) * 0.01;
  const kindMult = q.kind === 'boss' ? 2.5 : q.kind === 'side' ? 0.5 : 1;
  const xp = Math.round((14 + diff * 9) * levelMult * streakMult * kindMult);
  const gold = Math.round((4 + diff * 3) * levelMult * kindMult);
  const statGain = q.kind === 'boss' ? 3 : diff >= 1 ? 1 : 0;

  q.done = true;
  q.reward = { xp, gold };
  h.gold += gold;
  h.questsDone += 1;
  if (statGain) h.stats[q.domain] = (h.stats[q.domain] || 0) + statGain;

  // World: clear the creeping Gloam.
  state.world.encroach = Math.max(0, state.world.encroach - 6);

  // Plan progress
  let milestone = null;
  const track = q.trackId && state.plan.tracks.find(t => t.id === q.trackId);
  if (track && track.current < track.milestones.length) {
    if (q.kind === 'quest') track.progress += 1;
    if (q.kind === 'boss') milestone = finishMilestone(state, track, events);
    else {
      const m = track.milestones[track.current];
      if (track.progress === m.required) {
        events.push({ type: 'bossReady', text: `Trial unlocked: ${m.title}` });
        // Add the trial to today's board straight away.
        state.board.quests.unshift(mkQuest(track, m.boss, m.diff + 2, 'boss'));
      }
    }
  }
  if (q.kind === 'custom') {
    const c = state.custom.find(x => x.id === q.customId);
    if (c && c.repeat === 'once') state.custom = state.custom.filter(x => x !== c);
  }

  // Loot
  const loot = rollLoot(state, q, !!milestone);
  if (loot) {
    h.inventory.unshift(loot);
    events.push({ type: 'loot', item: loot });
    if (['epic', 'legendary'].includes(loot.rarity)) log(state, 'loot', `Found ${loot.name}.`);
  }

  // XP and levels
  h.xp += xp;
  while (h.xp >= xpToNext(h.level)) {
    h.xp -= xpToNext(h.level);
    h.level += 1;
    const bonus = 20 * h.level;
    h.gold += bonus;
    events.push({ type: 'level', level: h.level, gold: bonus });
    log(state, 'level', `${state.profile.name} reached level ${h.level}.`);
    if (h.level % 5 === 0) {
      const chest = makeItem(state, pick(rng(uid()), Object.keys(DOMAINS)), Math.min(4, 1 + h.level / 10 | 0));
      h.inventory.unshift(chest);
      events.push({ type: 'loot', item: chest, chest: true });
    }
  }

  return { quest: q, xp, gold, statGain, events, milestone };
}

function finishMilestone(state, track, events) {
  const m = track.milestones[track.current];
  const region = state.world.regions.find(g => g.trackId === track.id);
  const before = capitalTier(state).idx;
  track.completedAt.push(todayKey());
  track.current += 1;
  track.progress = 0;
  const title = `${m.title.replace(/^./, c => c.toUpperCase())}`;
  state.hero.titles.push({ name: title, domain: track.domain, date: todayKey() });
  const line = pick(rng(uid()), RESTORE_LINES[track.domain])
    .replace('{region}', region.name).replace('{landmark}', m.landmark).replace('{name}', state.profile.name);
  log(state, 'milestone', line.includes(m.landmark) ? line : `${m.landmark} is restored. ${line}`, { domain: track.domain });
  events.push({ type: 'milestone', title: m.title, landmark: m.landmark, region: region.name, line });
  if (track.current >= track.milestones.length) {
    log(state, 'milestone', `${region.name} is fully reclaimed from the Gloam.`, { domain: track.domain });
    events.push({ type: 'region', region: region.name });
  }
  const after = capitalTier(state);
  if (after.idx > before) {
    log(state, 'capital', `The capital grows into a ${after.name.toLowerCase()}.`);
    events.push({ type: 'capital', name: after.name });
  }
  return m;
}

function rollLoot(state, q, guaranteed) {
  const r = Math.random();
  const chance = q.kind === 'side' ? 0.03 : 0.06 + q.diff * 0.035;
  if (!guaranteed && r > chance) return null;
  // Higher levels and harder quests push towards rarer drops.
  const luck = state.hero.level * 0.02 + q.diff * 0.06 + (guaranteed ? 0.45 : 0) + (state.hero.stats.wealth || 0) * 0.005;
  const roll = Math.random() + luck;
  const tier = roll > 1.55 ? 4 : roll > 1.25 ? 3 : roll > 0.98 ? 2 : roll > 0.7 ? 1 : 0;
  return makeItem(state, q.domain, guaranteed ? Math.max(2, tier) : tier);
}

function makeItem(state, domain, tier) {
  const r = rng(uid());
  const rarity = LOOT.rarities[tier];
  const slot = pick(r, LOOT.slots);
  const base = pick(r, LOOT[slot][domain]);
  const power = Math.round((tier + 1) * 2 * (1 + state.hero.level / 12));
  return {
    id: uid(), slot, domain, rarity: rarity.id, power,
    name: `${pick(r, rarity.prefixes)} ${base}`,
  };
}

export function equip(state, itemId) {
  const it = state.hero.inventory.find(i => i.id === itemId);
  if (!it) return;
  state.hero.equipped[it.slot] = state.hero.equipped[it.slot] === it.id ? null : it.id;
}

export function salvage(state, itemId) {
  const h = state.hero;
  const it = h.inventory.find(i => i.id === itemId);
  if (!it) return 0;
  if (h.equipped[it.slot] === it.id) h.equipped[it.slot] = null;
  h.inventory = h.inventory.filter(i => i !== it);
  const g = it.power * 3;
  h.gold += g;
  return g;
}

export function sellCommons(state) {
  const h = state.hero;
  const eq = new Set(Object.values(h.equipped));
  const junk = h.inventory.filter(i => i.rarity === 'common' && !eq.has(i.id));
  const g = junk.reduce((s, i) => s + i.power * 3, 0);
  h.inventory = h.inventory.filter(i => !junk.includes(i));
  h.gold += g;
  return { count: junk.length, gold: g };
}

export function effectiveStats(state) {
  const h = state.hero;
  const s = { ...h.stats };
  Object.values(h.equipped).forEach(id => {
    const it = h.inventory.find(i => i.id === id);
    if (it) s[it.domain] = (s[it.domain] || 0) + it.power;
  });
  return s;
}

export function redeemReward(state, rewardId) {
  const rw = state.rewards.find(r => r.id === rewardId);
  if (!rw || state.hero.gold < rw.cost) return false;
  state.hero.gold -= rw.cost;
  log(state, 'reward', `Spent ${rw.cost} gold on a real reward: ${rw.name}.`);
  return true;
}

export function addCustomQuest(state, { text, domain, diff, repeat }) {
  const c = { id: uid(), text, domain, diff: +diff, repeat };
  state.custom.push(c);
  if (state.board) state.board.quests.push({ id: uid(), kind: 'custom', customId: c.id, domain, text, diff: +diff, done: false });
}
