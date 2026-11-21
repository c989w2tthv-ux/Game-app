// Turns questionnaire answers into a milestone-based development plan and a hero.
import { TRACK_BY_ID, DOMAIN_SKILL, STAT_FROM_SKILLS, CLASSES, DOMAINS } from './data.js';
import { roundTo, todayKey, addDays, clamp } from './util.js';

export function normalizeProfile(raw) {
  const num = (v, d) => (v === '' || v == null || isNaN(+v) ? d : +v);
  return {
    ...raw,
    name: (raw.name || 'Traveller').trim(),
    age: num(raw.age, 30),
    occupation: (raw.occupation || '').trim(),
    field: (raw.field || '').trim(),
    skill: (raw.skill || '').trim(),
    height: num(raw.height, 170),
    sleep: num(raw.sleep, 7),
    build: raw.build || 'Average',
    activity: raw.activity || 'Lightly active',
    hairStyle: raw.hairStyle || 'Short',
    skin: raw.skin || '#C98E5F',
    hair: raw.hair || '#5A3A24',
    minutesPerDay: parseInt(raw.minutes || '30', 10),
    horizonMonths: parseInt(raw.horizon || '6', 10),
    tracks: (raw.tracks || []).slice(0, 3),
    traits: {
      social: num(raw.social, 3), structure: num(raw.structure, 3), curiosity: num(raw.curiosity, 3),
      drive: num(raw.drive, 3), patience: num(raw.patience, 3), calm: num(raw.calm, 3),
    },
    skills: {
      fitness: num(raw.fitness, 3), learning: num(raw.learning, 3), creativity: num(raw.creativity, 3),
      communication: num(raw.communication, 3), technical: num(raw.technical, 3), money: num(raw.money, 3),
      discipline: num(raw.discipline, 3),
    },
  };
}

// 0 = gentle, 1 = standard, 2 = demanding
function intensityTier(profile, domain) {
  let rating = profile.skills[DOMAIN_SKILL[domain]] ?? 3;
  if (domain === 'body') {
    const act = ['Mostly sitting', 'Lightly active', 'Moderately active', 'Very active', 'Athlete'].indexOf(profile.activity);
    rating = (rating + (act + 1)) / 2;
    if (profile.age >= 60) rating -= 1;
    if (profile.age < 16) rating -= 0.5;
  }
  return rating <= 2.4 ? 0 : rating < 3.8 ? 1 : 2;
}

export function questContext(profile, domain, minutes) {
  const tier = intensityTier(profile, domain);
  return {
    min: minutes,
    reps: [8, 15, 25][tier],
    km: [2, 3, 5][tier],
    pages: [10, 20, 35][tier],
    occupation: profile.occupation || 'professional',
    field: profile.field || profile.occupation || 'your field',
    skill: profile.skill || 'your chosen skill',
    name: profile.name,
    social: profile.traits.social >= 4,
  };
}

export function fillText(text, ctx) {
  return text
    .replace(/\[\[(.+?)\|\|(.+?)\]\]/g, (_, solo, group) => (ctx.social ? group : solo))
    .replace(/\{(\w+)\}/g, (m, k) => (ctx[k] != null ? ctx[k] : m))
    .replace(/^./, c => c.toUpperCase());
}

export function buildPlan(profile) {
  const n = Math.max(1, profile.tracks.length);
  const perTrack = clamp(roundTo(profile.minutesPerDay / n, 5), 5, 90);
  const horizonDays = Math.round(profile.horizonMonths * 30.4);
  // Assume ~1 quest per path per day and a realistic ~65% completion rate.
  const base = Math.max(5, Math.round((horizonDays / 4) * 0.65));
  const weights = [0.7, 0.9, 1.1, 1.3];
  // Patient people get slightly longer chapters; impatient ones get quicker wins.
  const patienceAdj = 0.9 + (profile.traits.patience - 3) * 0.05;
  const start = todayKey();

  const tracks = profile.tracks.map(id => {
    const t = TRACK_BY_ID[id];
    const ctx = questContext(profile, t.domain, perTrack);
    let dayCursor = 0;
    const milestones = t.milestones.map(([title, landmark, boss, quests], i) => {
      const required = Math.max(4, Math.round(base * weights[i] * patienceAdj));
      dayCursor += Math.round(horizonDays * (weights[i] / 4));
      return {
        title, landmark,
        boss: fillText(boss, ctx),
        quests: quests.map(q => fillText(q, ctx)),
        required,
        due: addDays(start, dayCursor),
        diff: i + 1,
      };
    });
    return {
      id, domain: t.domain, name: t.name, desc: fillText(t.desc, ctx),
      milestones, current: 0, progress: 0, completedAt: [], minutes: perTrack,
    };
  });

  return { createdAt: start, horizonDays, tracks, mainQuest: (profile.mainQuest || '').trim() };
}

export function buildHero(profile, plan) {
  const counts = {};
  plan.tracks.forEach((t, i) => { counts[t.domain] = (counts[t.domain] || 0) + (3 - i); });
  const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const primary = ranked[0] || 'spirit';
  // The secondary flavour is the strongest personality signal if no second path exists.
  const t = profile.traits;
  const traitDomain = t.social >= 4 ? 'bonds' : t.curiosity >= 4 ? 'mind' : t.drive >= 4 ? 'body' : t.calm >= 4 ? 'spirit' : 'craft';
  const secondary = ranked[1] || (traitDomain !== primary ? traitDomain : 'spirit');

  const stats = {};
  for (const [d, skills] of Object.entries(STAT_FROM_SKILLS)) {
    const avg = skills.reduce((s, k) => s + profile.skills[k], 0) / skills.length;
    stats[d] = Math.round(avg * 2);
  }

  return {
    classDomain: primary,
    className: CLASSES[primary].name,
    title: `${CLASSES[primary].name} ${DOMAINS[secondary].epithet}`,
    level: 1, xp: 0, gold: 25, stats,
    streak: 0, bestStreak: 0, lastActive: null, questsDone: 0,
    titles: [], inventory: [], equipped: { weapon: null, armor: null, trinket: null },
  };
}

export function trackRestoration(track) {
  const total = track.milestones.length;
  if (track.current >= total) return 1;
  const m = track.milestones[track.current];
  const partial = Math.min(1, track.progress / m.required) * 0.8; // boss gives the final 20%
  return (track.current + partial) / total;
}
