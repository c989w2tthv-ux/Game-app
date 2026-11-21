import { STEPS, TRACKS, DOMAINS, CLASSES, LOOT, TRACK_BY_ID } from './data.js';
import { createGame, ensureToday, completeQuest, rerollQuest, canReroll, xpToNext, equip, salvage,
  effectiveStats, redeemReward, addCustomQuest, sellCommons } from './game.js';
import { renderMap, realmHope, capitalTier } from './world.js';
import { renderAvatar } from './avatar.js';
import { trackRestoration } from './planner.js';
import { loadGame, saveGame, clearGame, loadDraft, saveDraft, exportGame, parseImport } from './store.js';
import { esc, uid } from './util.js';

const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet');

let state = loadGame();
let ui = { screen: state ? 'main' : 'welcome', tab: 'quests', step: 0, mapSel: null, draft: loadDraft() };

const persist = () => saveGame(state);
const rarity = id => LOOT.rarities.find(r => r.id === id);
const domainDot = d => `<span class="dot" style="--c:${DOMAINS[d].color}" aria-hidden="true"></span>`;

// ───────────── Rendering ─────────────

function render() {
  if (ui.screen === 'welcome') return renderWelcome();
  if (ui.screen === 'onboard') return renderOnboard();
  if (ui.screen === 'reveal') return renderReveal();
  if (ensureToday(state)) persist();
  renderMain();
}

function renderWelcome() {
  $app.innerHTML = `
    <main class="welcome">
      <div class="welcome-art" aria-hidden="true">${welcomeArt()}</div>
      <h1 class="brand">Gloambreak</h1>
      <p class="lede">A grey fog has swallowed a kingdom. It lifts only when you do real things in your real life.</p>
      <p class="lede soft">Answer a few questions. You'll get a personal growth plan, a hero who looks like you, and a realm that changes as you keep your promises.</p>
      <button class="btn primary big" data-act="start">Create my hero</button>
      <label class="btn ghost import">Restore a saved game<input type="file" accept="application/json" data-act="import" hidden></label>
      <p class="fine">Works offline. Nothing leaves this device.</p>
    </main>`;
}

function welcomeArt() {
  return `<svg viewBox="0 0 320 150">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3440"/><stop offset="1" stop-color="#10191e"/></linearGradient></defs>
    <rect width="320" height="150" fill="url(#sky)"/>
    <circle cx="240" cy="44" r="20" fill="#f2d98a" opacity="0.9"/>
    <path d="M0,120 L40,84 L70,104 L112,60 L150,98 L190,70 L232,108 L270,80 L320,112 L320,150 L0,150Z" fill="#23413a"/>
    <path d="M0,132 L60,110 L120,128 L180,104 L250,130 L320,118 L320,150 L0,150Z" fill="#1a302b"/>
    <g fill="#e8dcc0" stroke="#10191e" stroke-width="1"><rect x="146" y="84" width="10" height="20"/><path d="M144,84 L151,74 L158,84Z" fill="#b5523b"/></g>
    <rect x="-30" y="70" width="380" height="80" fill="#7b6f95" opacity="0.35" class="mist"/>
  </svg>`;
}

// ───── Onboarding ─────

function renderOnboard() {
  const step = STEPS[ui.step];
  const d = ui.draft;
  const fields = step.fields.map(f => fieldHtml(f, d)).join('');
  $app.innerHTML = `
    <main class="onboard">
      <header class="ob-head">
        <button class="icon-btn" data-act="back" aria-label="Back">${icon('back')}</button>
        <div class="ob-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="${ui.step + 1}">
          ${STEPS.map((_, i) => `<span class="${i <= ui.step ? 'on' : ''}"></span>`).join('')}
        </div>
        <span class="ob-count">${ui.step + 1} of ${STEPS.length}</span>
      </header>
      <h2>${esc(step.title)}</h2>
      <p class="soft">${esc(step.intro)}</p>
      <form class="ob-form" novalidate>${fields}
        <p class="error" role="alert" hidden></p>
        <button class="btn primary big" type="submit">${ui.step === STEPS.length - 1 ? 'Forge my hero' : 'Continue'}</button>
      </form>
    </main>`;
}

function fieldHtml(f, d) {
  const v = d[f.id] ?? '';
  const id = `f-${f.id}`;
  switch (f.type) {
    case 'text':
    case 'number':
      return `<label class="field" for="${id}"><span>${esc(f.label)}</span>
        <input id="${id}" name="${f.id}" type="${f.type}" ${f.type === 'number' ? `inputmode="decimal" min="${f.min}" max="${f.max}" step="${f.step || 1}"` : 'autocomplete="off"'}
          placeholder="${esc(f.placeholder || '')}" value="${esc(v)}"></label>`;
    case 'textarea':
      return `<label class="field" for="${id}"><span>${esc(f.label)}</span>
        <textarea id="${id}" name="${f.id}" rows="2" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea></label>`;
    case 'choice':
      return `<fieldset class="field"><legend>${esc(f.label)}</legend><div class="chips">
        ${f.options.map(o => `<label class="chip"><input type="radio" name="${f.id}" value="${esc(o)}" ${v === o ? 'checked' : ''}><span>${esc(o)}</span></label>`).join('')}
        </div></fieldset>`;
    case 'swatch':
      return `<fieldset class="field"><legend>${esc(f.label)}</legend><div class="swatches">
        ${f.options.map(o => `<label class="swatch" title="${esc(o.label)}"><input type="radio" name="${f.id}" value="${o.value}" ${v === o.value ? 'checked' : ''} aria-label="${esc(o.label)}"><span style="background:${o.value}"></span></label>`).join('')}
        </div></fieldset>`;
    case 'scale':
      return `<fieldset class="field scale"><legend>${esc(f.label)}</legend>
        <div class="scale-row"><span class="scale-end">${esc(f.low)}</span>
        ${[1, 2, 3, 4, 5].map(n => `<label class="pip"><input type="radio" name="${f.id}" value="${n}" ${+v === n ? 'checked' : ''} aria-label="${n} of 5"><span>${n}</span></label>`).join('')}
        <span class="scale-end">${esc(f.high)}</span></div></fieldset>`;
    case 'tracks': {
      const chosen = d.tracks || [];
      const groups = Object.keys(DOMAINS).map(dom => `
        <div class="track-group"><h3>${domainDot(dom)}${DOMAINS[dom].name}</h3>
        ${TRACKS.filter(t => t.domain === dom).map(t => `
          <label class="track-opt"><input type="checkbox" name="tracks" value="${t.id}" ${chosen.includes(t.id) ? 'checked' : ''}>
            <span><b>${esc(t.name)}</b><small>${esc(t.desc.replace(/\{\w+\}/g, m => ({ '{skill}': 'a skill', '{occupation}': 'your role', '{field}': 'your field' }[m] || m)))}</small></span>
            <i class="order" aria-hidden="true">${chosen.includes(t.id) ? chosen.indexOf(t.id) + 1 : ''}</i>
          </label>`).join('')}</div>`).join('');
      return `<fieldset class="field"><legend>${esc(f.label)} <small class="soft">(${chosen.length}/${f.max}, first pick is your main path)</small></legend>${groups}</fieldset>`;
    }
  }
}

function collectStep() {
  const form = $app.querySelector('.ob-form');
  const step = STEPS[ui.step];
  for (const f of step.fields) {
    if (f.type === 'tracks') continue; // tracked live, keeps pick order
    if (['choice', 'swatch', 'scale'].includes(f.type)) {
      const el = form.querySelector(`input[name="${f.id}"]:checked`);
      if (el) ui.draft[f.id] = el.value;
    } else {
      const el = form.querySelector(`[name="${f.id}"]`);
      if (el) ui.draft[f.id] = el.value;
    }
  }
  saveDraft(ui.draft);
}

function validateStep() {
  const step = STEPS[ui.step];
  const d = ui.draft;
  for (const f of step.fields) {
    const v = d[f.id];
    if (f.required && (v == null || v === '' || (Array.isArray(v) && !v.length))) {
      return f.type === 'tracks' ? 'Choose at least one path.' : `Add your ${f.label.toLowerCase()} to continue.`;
    }
    if (f.type === 'number' && v !== '' && v != null && (isNaN(+v) || +v < f.min || +v > f.max)) {
      return `${f.label} should be between ${f.min} and ${f.max}.`;
    }
  }
  if (step.id === 'aspirations') {
    const needsSkill = (d.tracks || []).some(t => ['language', 'skill'].includes(t));
    if (needsSkill && !(d.skill || '').trim()) return 'Name the skill or language you want to learn.';
  }
  return null;
}

// ───── Reveal ─────

function renderReveal() {
  const cls = CLASSES[state.hero.classDomain];
  $app.innerHTML = `
    <main class="reveal">
      <div class="reveal-avatar">${renderAvatar(state, { size: 180 })}</div>
      <h1>${esc(state.profile.name)}</h1>
      <p class="title-line">${esc(state.hero.title)}</p>
      <p class="soft">${esc(cls.blurb)}</p>
      <section class="lore">${state.world.lore.map(l => `<p>${esc(l)}</p>`).join('')}</section>
      <section class="card">
        <h2>Your plan</h2>
        ${state.plan.mainQuest ? `<p class="main-quest">“${esc(state.plan.mainQuest)}”</p>` : ''}
        <ol class="plan-list">${state.plan.tracks.map(t => {
          const region = state.world.regions.find(g => g.trackId === t.id);
          return `<li>${domainDot(t.domain)}<div><b>${esc(t.name)}</b><small>${esc(region.name)} · ${t.minutes} min a day · 4 milestones, last due ${fmtDate(t.milestones[3].due)}</small></div></li>`;
        }).join('')}</ol>
      </section>
      <button class="btn primary big" data-act="enter">Enter ${esc(state.world.realm)}</button>
    </main>`;
}

// ───── Main ─────

const TABS = [
  ['quests', 'Quests', 'scroll'],
  ['realm', 'Realm', 'map'],
  ['hero', 'Hero', 'shield'],
  ['path', 'Plan', 'path'],
  ['market', 'Market', 'coin'],
];

function renderMain() {
  const h = state.hero;
  const need = xpToNext(h.level);
  $app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="lvl" aria-label="Level ${h.level}"><span>${h.level}</span></div>
        <div class="xpwrap">
          <div class="xp-meta"><b>${esc(state.profile.name)}</b><span>${h.xp} / ${need} XP</span></div>
          <div class="xpbar"><i style="width:${(h.xp / need) * 100}%"></i></div>
        </div>
        <div class="purse" aria-label="${h.gold} gold">${icon('coin')}<b>${h.gold}</b></div>
        <div class="streak" aria-label="${h.streak} day streak">${icon('flame')}<b>${h.streak}</b></div>
      </header>
      <main class="view" id="view">${tabView()}</main>
      <nav class="tabbar">${TABS.map(([id, label, ic]) => `
        <button class="${ui.tab === id ? 'on' : ''}" data-tab="${id}" aria-current="${ui.tab === id ? 'page' : 'false'}">${icon(ic)}<span>${label}</span></button>`).join('')}
      </nav>
    </div>`;
}

function tabView() {
  switch (ui.tab) {
    case 'quests': return questsView();
    case 'realm': return realmView();
    case 'hero': return heroView();
    case 'path': return pathView();
    case 'market': return marketView();
  }
}

function questsView() {
  const qs = state.board.quests;
  const done = qs.filter(q => q.done).length;
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const enc = state.world.encroach;
  return `
    <section class="board-head">
      <h1>${date}</h1>
      <p class="soft">${done === qs.length ? 'Every quest is done. The realm rests easy tonight.' : `${done} of ${qs.length} quests done today.`}</p>
      ${enc > 0 ? `<p class="warn">${icon('fog')} The Gloam has crept back while you were away. Each quest clears some of it.</p>` : ''}
    </section>
    <ul class="quests">${qs.map(questCard).join('')}</ul>
    <button class="btn ghost" data-act="addQuest">${icon('plus')} Add your own quest</button>`;
}

function questCard(q) {
  const track = q.trackId && state.plan.tracks.find(t => t.id === q.trackId);
  const m = track && track.milestones[Math.min(track.current, 3)];
  const label = q.kind === 'boss' ? `Trial · ${m.title}` : q.kind === 'side' ? 'Side quest' : q.kind === 'custom' ? 'Your quest' : q.kind === 'keep' ? 'Keep the flame' : m ? `${m.title} · ${track.progress}/${m.required}` : '';
  const stars = '◆'.repeat(Math.max(1, Math.min(6, q.diff)));
  return `<li class="quest ${q.kind} ${q.done ? 'done' : ''}" style="--c:${DOMAINS[q.domain].color}">
    <button class="check" data-act="complete" data-id="${q.id}" ${q.done ? 'disabled' : ''} aria-label="${q.done ? 'Completed' : 'Complete quest'}: ${esc(q.text)}">${q.done ? icon('check') : ''}</button>
    <div class="q-body">
      <span class="q-label">${esc(label)}</span>
      <p>${esc(q.text)}</p>
      ${q.done ? `<span class="q-reward">+${q.reward.xp} XP · +${q.reward.gold} gold</span>` : `<span class="q-diff" aria-label="Difficulty ${q.diff}">${q.kind === 'side' ? '◇' : stars}</span>`}
    </div>
    ${!q.done && q.kind === 'quest' && canReroll(state) ? `<button class="icon-btn small" data-act="reroll" data-id="${q.id}" aria-label="Swap this quest (once a day)">${icon('swap')}</button>` : ''}
  </li>`;
}

function realmView() {
  const hope = realmHope(state);
  const cap = capitalTier(state);
  const sel = ui.mapSel && state.plan.tracks.find(t => t.id === ui.mapSel);
  return `
    <section class="realm-head">
      <h1>${esc(state.world.realm)}</h1>
      <p class="soft">${Math.round(hope * 100)}% of the realm reclaimed · capital: ${esc(cap.name.toLowerCase())}</p>
    </section>
    <div class="map-wrap">${renderMap(state, { selected: ui.mapSel })}</div>
    ${sel ? regionDetail(sel) : '<p class="hint">Tap a region to see its landmarks.</p>'}
    <section class="chronicle">
      <h2>Chronicle</h2>
      <ul>${state.chronicle.slice(0, 40).map(c => `<li class="ch-${c.kind}">${c.domain ? domainDot(c.domain) : ''}<time>${fmtDate(c.date)}</time><p>${esc(c.text)}</p></li>`).join('')}</ul>
    </section>`;
}

function regionDetail(t) {
  const g = state.world.regions.find(x => x.trackId === t.id);
  return `<section class="card region-card" style="--c:${DOMAINS[t.domain].color}">
    <h2>${esc(g.name)}</h2>
    <p class="soft">${Math.round(trackRestoration(t) * 100)}% reclaimed through “${esc(t.name)}”.</p>
    <ul class="landmarks">${t.milestones.map((m, i) => `<li class="${i < t.current ? 'restored' : i === t.current ? 'current' : 'locked'}">
      <b>${esc(m.landmark)}</b><small>${i < t.current ? 'Restored' : i === t.current ? 'Under the Gloam: complete “' + esc(m.title) + '”' : 'Lost in fog'}</small></li>`).join('')}</ul>
  </section>`;
}

function heroView() {
  const h = state.hero;
  const stats = effectiveStats(state);
  const max = Math.max(20, ...Object.values(stats));
  const eqItems = Object.values(h.equipped).filter(Boolean);
  return `
    <section class="hero-top">
      <div class="hero-avatar">${renderAvatar(state, { size: 170 })}</div>
      <div>
        <h1>${esc(state.profile.name)}</h1>
        <p class="title-line">${esc(h.title)}</p>
        <p class="soft small">Level ${h.level} · ${h.questsDone} quests done · best streak ${h.bestStreak} days</p>
      </div>
    </section>
    <section class="card">
      <h2>Attributes</h2>
      <ul class="stats">${Object.keys(DOMAINS).map(d => `<li style="--c:${DOMAINS[d].color}">
        <span>${DOMAINS[d].stat}</span><div class="bar"><i style="width:${(stats[d] / max) * 100}%"></i></div><b>${stats[d]}</b></li>`).join('')}</ul>
    </section>
    <section class="card">
      <h2>Gear</h2>
      ${h.inventory.some(i => i.rarity === 'common' && !eqItems.includes(i.id)) ? '<button class="btn tiny ghost sell-all" data-act="sellCommons">Sell all common gear</button>' : ''}
      ${h.inventory.length ? `<ul class="items">${sortedGear(h, eqItems).map(it => {
        const r = rarity(it.rarity);
        const on = eqItems.includes(it.id);
        return `<li class="${on ? 'equipped' : ''}" style="--r:${r.color}">
          <div><b>${esc(it.name)}</b><small>${r.name} ${it.slot} · +${it.power} ${DOMAINS[it.domain].stat}</small></div>
          <button class="btn tiny ${on ? '' : 'primary'}" data-act="equip" data-id="${it.id}">${on ? 'Unequip' : 'Equip'}</button>
          ${on ? '' : `<button class="btn tiny ghost" data-act="salvage" data-id="${it.id}">Sell ${it.power * 3}g</button>`}
        </li>`;
      }).join('')}</ul>` : '<p class="soft">No gear yet. Quests sometimes drop items, and every trial drops one for sure.</p>'}
    </section>
    <section class="card">
      <h2>Titles earned</h2>
      ${h.titles.length ? `<ul class="titles">${h.titles.map(t => `<li>${domainDot(t.domain)}${esc(t.name)}<time>${fmtDate(t.date)}</time></li>`).join('')}</ul>`
        : '<p class="soft">Finish a milestone trial to earn your first title.</p>'}
    </section>`;
}

function sortedGear(h, eq) {
  const rank = id => LOOT.rarities.findIndex(r => r.id === id);
  return h.inventory.slice().sort((a, b) =>
    (eq.includes(b.id) - eq.includes(a.id)) || (rank(b.rarity) - rank(a.rarity)) || (b.power - a.power));
}

function pathView() {
  const p = state.plan;
  return `
    <section class="board-head">
      <h1>Your plan</h1>
      ${p.mainQuest ? `<p class="main-quest">“${esc(p.mainQuest)}”</p>` : ''}
      <p class="soft">${state.profile.horizonMonths}-month plan started ${fmtDate(p.createdAt)}. Each milestone needs regular quests, then a trial to finish it.</p>
    </section>
    ${p.tracks.map(t => `
      <section class="card path" style="--c:${DOMAINS[t.domain].color}">
        <h2>${domainDot(t.domain)}${esc(t.name)}</h2>
        <p class="soft small">${esc(t.desc)} · ${t.minutes} min a day</p>
        <ol class="milestones">${t.milestones.map((m, i) => {
          const st = i < t.current ? 'done' : i === t.current ? 'now' : 'later';
          const pct = st === 'done' ? 100 : st === 'now' ? Math.min(100, (t.progress / m.required) * 100) : 0;
          return `<li class="${st}">
            <div class="ms-head"><b>${esc(m.title.replace(/^./, c => c.toUpperCase()))}</b><time>${st === 'done' ? 'Done ' + fmtDate(t.completedAt[i]) : 'Target ' + fmtDate(m.due)}</time></div>
            ${st === 'now' ? `<div class="bar"><i style="width:${pct}%"></i></div><small>${Math.min(t.progress, m.required)} of ${m.required} quests, then the trial</small>` : ''}
            <p class="trial"><span>Trial</span> ${esc(m.boss)}</p>
          </li>`;
        }).join('')}</ol>
      </section>`).join('')}`;
}

function marketView() {
  const h = state.hero;
  return `
    <section class="board-head">
      <h1>Market</h1>
      <p class="soft">Spend gold on real-life rewards you set for yourself.</p>
    </section>
    <ul class="rewards">${state.rewards.map(r => `<li>
      <div><b>${esc(r.name)}</b><small>${r.cost} gold</small></div>
      <button class="btn tiny ${h.gold >= r.cost ? 'primary' : ''}" data-act="redeem" data-id="${r.id}" ${h.gold >= r.cost ? '' : 'disabled'}>Redeem</button>
      <button class="icon-btn small" data-act="delReward" data-id="${r.id}" aria-label="Remove reward">${icon('x')}</button>
    </li>`).join('')}</ul>
    <form class="inline-form" data-form="reward">
      <input name="name" placeholder="New reward, e.g. Cinema night" required aria-label="Reward name">
      <input name="cost" type="number" inputmode="numeric" min="5" placeholder="Gold" required aria-label="Cost in gold">
      <button class="btn primary" type="submit">Add</button>
    </form>
    <section class="card settings">
      <h2>Save and settings</h2>
      <p class="soft small">Your game is saved on this device only. Back it up to move it to another phone.</p>
      <div class="row">
        <button class="btn" data-act="export">Back up save</button>
        <label class="btn">Restore save<input type="file" accept="application/json" data-act="import" hidden></label>
      </div>
      <button class="btn danger" data-act="reset">Start over</button>
    </section>`;
}

// ───────────── Sheets (modals) ─────────────

function openSheet(html, { onClose } = {}) {
  $sheet.innerHTML = `<div class="sheet-backdrop" data-act="closeSheet"></div><div class="sheet-panel" role="dialog" aria-modal="true">${html}</div>`;
  $sheet.hidden = false;
  requestAnimationFrame(() => $sheet.classList.add('open'));
  $sheet._onClose = onClose;
  const f = $sheet.querySelector('button, input, select');
  f && f.focus({ preventScroll: true });
}

function closeSheet() {
  $sheet.classList.remove('open');
  setTimeout(() => { $sheet.hidden = true; $sheet.innerHTML = ''; }, 220);
  const cb = $sheet._onClose; $sheet._onClose = null;
  cb && cb();
}

function rewardSheet(res) {
  const ev = res.events;
  const ms = ev.find(e => e.type === 'milestone');
  const lvl = ev.find(e => e.type === 'level');
  const loots = ev.filter(e => e.type === 'loot');
  const other = ev.filter(e => ['bossReady', 'streak', 'region', 'capital'].includes(e.type));
  const heading = ms ? `${ms.landmark} restored` : lvl ? `Level ${lvl.level}` : 'Quest complete';
  return `
    <div class="reward ${ms ? 'big' : ''}">
      <div class="burst" aria-hidden="true"></div>
      <h2>${esc(heading)}</h2>
      ${ms ? `<p class="lore-line">${esc(ms.line)}</p><p class="soft small">Milestone “${esc(ms.title)}” complete in ${esc(ms.region)}.</p>` : ''}
      <div class="gains">
        <span>+${res.xp} XP</span><span>+${res.gold} gold</span>
        ${res.statGain ? `<span style="color:${DOMAINS[res.quest.domain].color}">+${res.statGain} ${DOMAINS[res.quest.domain].stat}</span>` : ''}
      </div>
      ${lvl && ms ? `<p class="levelup">Level ${lvl.level} reached · +${lvl.gold} gold</p>` : lvl ? `<p class="soft">Bonus +${lvl.gold} gold.</p>` : ''}
      ${loots.map(l => { const r = rarity(l.item.rarity); return `<div class="loot" style="--r:${r.color}">
        <small>${l.chest ? 'Level chest' : 'Loot'} · ${r.name}</small><b>${esc(l.item.name)}</b><small>${l.item.slot} · +${l.item.power} ${DOMAINS[l.item.domain].stat}</small></div>`; }).join('')}
      ${other.map(o => `<p class="note">${esc(o.type === 'region' ? `${o.region} is fully reclaimed!` : o.type === 'capital' ? `Your capital grew into a ${o.name.toLowerCase()}.` : o.text)}</p>`).join('')}
      <button class="btn primary big" data-act="closeSheet">${ms ? 'See the realm' : 'Onward'}</button>
    </div>`;
}

function customQuestSheet() {
  return `<form class="sheet-form" data-form="custom">
    <h2>Add your own quest</h2>
    <label class="field"><span>Quest</span><input name="text" required placeholder="e.g. Call grandma"></label>
    <fieldset class="field"><legend>Area</legend><div class="chips">${Object.keys(DOMAINS).map((d, i) => `
      <label class="chip"><input type="radio" name="domain" value="${d}" ${i === 0 ? 'checked' : ''}><span>${domainDot(d)}${DOMAINS[d].name}</span></label>`).join('')}</div></fieldset>
    <fieldset class="field"><legend>Difficulty</legend><div class="chips">${['Easy', 'Medium', 'Hard'].map((l, i) => `
      <label class="chip"><input type="radio" name="diff" value="${i + 1}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
    <fieldset class="field"><legend>Repeat</legend><div class="chips">
      <label class="chip"><input type="radio" name="repeat" value="once" checked><span>Once</span></label>
      <label class="chip"><input type="radio" name="repeat" value="daily"><span>Every day</span></label></div></fieldset>
    <div class="row"><button type="button" class="btn ghost" data-act="closeSheet">Cancel</button><button class="btn primary" type="submit">Add quest</button></div>
  </form>`;
}

function confirmSheet(title, body, actLabel, act) {
  return `<div class="sheet-form"><h2>${esc(title)}</h2><p class="soft">${esc(body)}</p>
    <div class="row"><button class="btn ghost" data-act="closeSheet">Cancel</button><button class="btn danger" data-act="${act}">${esc(actLabel)}</button></div></div>`;
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2200);
}

// ───────────── Events ─────────────

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) { ui.tab = tab.dataset.tab; renderMain(); window.scrollTo(0, 0); return; }

  const region = e.target.closest('.region');
  if (region) { ui.mapSel = ui.mapSel === region.dataset.track ? null : region.dataset.track; renderMain(); return; }

  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  const id = el.dataset.id;
  switch (el.dataset.act) {
    case 'start': ui.screen = 'onboard'; ui.step = 0; render(); break;
    case 'back':
      collectStep();
      if (ui.step === 0) ui.screen = 'welcome'; else ui.step -= 1;
      render(); window.scrollTo(0, 0); break;
    case 'enter': ui.screen = 'main'; ui.tab = 'quests'; render(); break;
    case 'complete': {
      const res = completeQuest(state, id);
      if (!res) return;
      persist();
      const li = el.closest('.quest');
      li && li.classList.add('just-done');
      const big = res.events.some(ev => ['milestone', 'level', 'loot'].includes(ev.type));
      if (big) {
        openSheet(rewardSheet(res), { onClose: () => { if (res.milestone) ui.tab = 'realm'; ui.mapSel = res.quest.trackId || null; renderMain(); } });
      } else {
        setTimeout(renderMain, 260);
        toast(`+${res.xp} XP · +${res.gold} gold`);
      }
      break;
    }
    case 'reroll': if (rerollQuest(state, id)) { persist(); renderMain(); toast('Quest swapped. One swap a day.'); } break;
    case 'addQuest': openSheet(customQuestSheet()); break;
    case 'closeSheet': closeSheet(); break;
    case 'equip': equip(state, id); persist(); renderMain(); break;
    case 'salvage': { const g = salvage(state, id); persist(); renderMain(); toast(`Sold for ${g} gold`); break; }
    case 'sellCommons': { const r = sellCommons(state); persist(); renderMain(); toast(`Sold ${r.count} items for ${r.gold} gold`); break; }
    case 'redeem': if (redeemReward(state, id)) { persist(); renderMain(); toast('Enjoy it. You earned it.'); } break;
    case 'delReward': state.rewards = state.rewards.filter(r => r.id !== id); persist(); renderMain(); break;
    case 'export': exportGame(state); break;
    case 'reset': openSheet(confirmSheet('Start over?', 'This deletes your hero, plan and realm from this device. Back up first if you might want them.', 'Delete and start over', 'confirmReset')); break;
    case 'confirmReset': clearGame(); state = null; ui = { screen: 'welcome', tab: 'quests', step: 0, mapSel: null, draft: {} }; closeSheet(); render(); break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$sheet.hidden) closeSheet();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('region')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
});

document.addEventListener('change', async e => {
  const t = e.target;
  if (t.name === 'tracks' && t.type === 'checkbox') {
    const list = ui.draft.tracks || [];
    if (t.checked) {
      if (list.length >= 3) { t.checked = false; toast('Three paths at most. Untick one first.'); return; }
      list.push(t.value);
    } else list.splice(list.indexOf(t.value), 1);
    ui.draft.tracks = list;
    collectStep();
    const y = window.scrollY; renderOnboard(); window.scrollTo(0, y);
    return;
  }
  if (t.dataset.act === 'import' && t.files[0]) {
    try {
      state = parseImport(await t.files[0].text());
      persist(); ui.screen = 'main'; ui.tab = 'quests'; render(); toast('Save restored.');
    } catch (err) { toast(err.message || 'That file could not be read.'); }
  }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  if (form.classList.contains('ob-form')) {
    collectStep();
    const err = validateStep();
    const $err = form.querySelector('.error');
    if (err) { $err.textContent = err; $err.hidden = false; return; }
    if (ui.step < STEPS.length - 1) { ui.step += 1; render(); window.scrollTo(0, 0); return; }
    state = createGame(ui.draft);
    ensureToday(state);
    persist();
    ui.screen = 'reveal'; render(); window.scrollTo(0, 0);
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  if (form.dataset.form === 'custom') {
    if (!data.text.trim()) return;
    addCustomQuest(state, { ...data, text: data.text.trim() });
    persist(); closeSheet(); renderMain(); toast('Quest added to today’s board.');
  }
  if (form.dataset.form === 'reward') {
    state.rewards.push({ id: uid(), name: data.name.trim(), cost: Math.max(5, parseInt(data.cost, 10) || 50) });
    persist(); renderMain();
  }
});

// Roll the board over at midnight if the app stays open.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state && ui.screen === 'main' && ensureToday(state)) { persist(); renderMain(); }
});

// ───────────── Helpers ─────────────

function fmtDate(key) {
  if (!key) return '';
  return new Date(key + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function icon(name) {
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    scroll: '<path d="M6 4h11a2 2 0 012 2v12a2 2 0 01-2 2H8"/><path d="M6 4a2 2 0 00-2 2v2h4V6a2 2 0 00-2-2zM8 20a2 2 0 01-2-2V8"/><path d="M11 9h5M11 13h5"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
    path: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4"/>',
    flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    fog: '<path d="M4 10h12M7 14h13M4 18h10"/>',
  };
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
