// Local persistence. Everything lives on the device in localStorage.
const KEY = 'gloambreak.save.v1';
const DRAFT = 'gloambreak.draft.v1';

const safe = fn => { try { return fn(); } catch { return null; } };

export const loadGame = () => safe(() => JSON.parse(localStorage.getItem(KEY)));
export const saveGame = state => safe(() => localStorage.setItem(KEY, JSON.stringify(state)));
export const clearGame = () => safe(() => { localStorage.removeItem(KEY); localStorage.removeItem(DRAFT); });

export const loadDraft = () => safe(() => JSON.parse(localStorage.getItem(DRAFT))) || {};
export const saveDraft = d => safe(() => localStorage.setItem(DRAFT, JSON.stringify(d)));

export function exportGame(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `gloambreak-${state.profile.name.toLowerCase().replace(/\W+/g, '-')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function parseImport(text) {
  const s = JSON.parse(text);
  if (!s || !s.profile || !s.plan || !s.hero || !s.world) throw new Error('This file is not a Gloambreak save.');
  return s;
}
