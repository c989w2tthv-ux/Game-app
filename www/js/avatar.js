// Procedural SVG hero built from the player's physical answers, class and gear.
import { DOMAINS, LOOT } from './data.js';
import { esc } from './util.js';

const BUILD_W = { Slight: 0.82, Lean: 0.9, Average: 1, Broad: 1.14, Heavy: 1.26 };

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const rarityColor = item => item ? LOOT.rarities.find(r => r.id === item.rarity).color : null;

function weaponSvg(domain, color) {
  const c = color || '#b9b2a0';
  switch (domain) {
    case 'body': return `<g transform="translate(150,96) rotate(18)"><rect x="-3" y="0" width="6" height="96" rx="2" fill="#6b4a2f"/><rect x="-16" y="-8" width="32" height="22" rx="4" fill="${c}" stroke="#1a1a22" stroke-width="2"/></g>`;
    case 'mind': return `<g transform="translate(152,70)"><rect x="-2.5" y="0" width="5" height="128" rx="2" fill="#6b4a2f"/><circle cy="-4" r="11" fill="${c}" stroke="#1a1a22" stroke-width="2"/><circle cx="-3" cy="-7" r="3" fill="#fff" opacity="0.6"/></g>`;
    case 'craft': return `<g transform="translate(150,110) rotate(-12)"><rect x="-3" y="0" width="6" height="70" rx="2" fill="#6b4a2f"/><path d="M-18,-6 L14,-6 L18,2 L14,10 L-18,10Z" fill="${c}" stroke="#1a1a22" stroke-width="2"/></g>`;
    case 'wealth': return `<g transform="translate(152,94) rotate(8)"><rect x="-2" y="0" width="4" height="90" fill="${c}" stroke="#1a1a22" stroke-width="1.5"/><rect x="-10" y="-6" width="20" height="6" rx="2" fill="#d8a740" stroke="#1a1a22" stroke-width="1.5"/><circle cy="-10" r="4" fill="#d8a740"/></g>`;
    case 'bonds': return `<g transform="translate(150,120) rotate(-20)"><ellipse cx="0" cy="22" rx="16" ry="20" fill="${c}" stroke="#1a1a22" stroke-width="2"/><circle cy="20" r="5" fill="#2a1f1a"/><rect x="-3" y="-30" width="6" height="40" fill="#6b4a2f"/></g>`;
    default: return `<g transform="translate(152,96)"><path d="M0,0 L0,40" stroke="#3a3040" stroke-width="2"/><rect x="-10" y="40" width="20" height="26" rx="5" fill="#3a3040" stroke="#1a1a22" stroke-width="2"/><rect x="-6" y="45" width="12" height="16" rx="3" fill="${c === '#b9b2a0' ? '#ffe7a3' : c}"/></g>`;
  }
}

function hairSvg(style, color, cx, top) {
  const dark = shade(color, -0.12);
  switch (style) {
    case 'Long': return `<path d="M${cx - 30},${top + 24} Q${cx - 34},${top - 8} ${cx},${top - 6} Q${cx + 34},${top - 8} ${cx + 30},${top + 24} L${cx + 32},${top + 70} L${cx + 18},${top + 64} L${cx + 20},${top + 20} Q${cx},${top + 10} ${cx - 20},${top + 20} L${cx - 18},${top + 64} L${cx - 32},${top + 70}Z" fill="${color}" stroke="${dark}" stroke-width="1.5"/>`;
    case 'Curly': return `<g fill="${color}" stroke="${dark}" stroke-width="1.5">${[-24, -12, 0, 12, 24].map((dx, i) => `<circle cx="${cx + dx}" cy="${top + (i % 2 ? -2 : 4)}" r="12"/>`).join('')}<circle cx="${cx - 28}" cy="${top + 18}" r="9"/><circle cx="${cx + 28}" cy="${top + 18}" r="9"/></g>`;
    case 'Braided': return `<g><path d="M${cx - 28},${top + 22} Q${cx - 30},${top - 6} ${cx},${top - 6} Q${cx + 30},${top - 6} ${cx + 28},${top + 22} Q${cx},${top + 8} ${cx - 28},${top + 22}Z" fill="${color}" stroke="${dark}" stroke-width="1.5"/>${[0, 1, 2, 3].map(k => `<ellipse cx="${cx + 30}" cy="${top + 28 + k * 11}" rx="6" ry="7" fill="${color}" stroke="${dark}" stroke-width="1.5"/>`).join('')}</g>`;
    case 'Shaved': return `<path d="M${cx - 27},${top + 16} Q${cx},${top - 6} ${cx + 27},${top + 16}" fill="none" stroke="${color}" stroke-width="5" opacity="0.55" stroke-linecap="round"/>`;
    default: return `<path d="M${cx - 28},${top + 20} Q${cx - 30},${top - 8} ${cx},${top - 7} Q${cx + 30},${top - 8} ${cx + 28},${top + 20} Q${cx + 16},${top + 4} ${cx - 4},${top + 10} Q${cx - 18},${top + 6} ${cx - 28},${top + 20}Z" fill="${color}" stroke="${dark}" stroke-width="1.5"/>`;
  }
}

export function renderAvatar(state, { size = 200 } = {}) {
  const p = state.profile, h = state.hero;
  const domain = h.classDomain;
  const cloth = DOMAINS[domain].color;
  const eq = h.equipped || {};
  const inv = id => h.inventory.find(i => i.id === id);
  const weapon = inv(eq.weapon), armor = inv(eq.armor), trinket = inv(eq.trinket);
  const w = BUILD_W[p.build] || 1;
  const hScale = Math.max(0.92, Math.min(1.06, (p.height || 170) / 170));
  const skin = p.skin, skinD = shade(skin, -0.1);
  const cx = 100, headY = 62;
  const torsoW = 46 * w, hipW = 40 * w;
  const trim = rarityColor(armor) || shade(cloth, 0.25);
  const aura = h.level >= 20 ? '#f2c14e' : h.level >= 10 ? '#c38bf0' : h.level >= 5 ? '#6fa8f0' : null;

  const body = `
    ${aura ? `<ellipse cx="${cx}" cy="128" rx="78" ry="104" fill="${aura}" opacity="0.14"/>` : ''}
    <ellipse cx="${cx}" cy="226" rx="${46 * w}" ry="8" fill="#000" opacity="0.28"/>
    <!-- cloak -->
    <path d="M${cx - torsoW / 2 - 6},${headY + 34} L${cx - torsoW / 2 - 18},214 L${cx + torsoW / 2 + 18},214 L${cx + torsoW / 2 + 6},${headY + 34}Z" fill="${shade(cloth, -0.3)}"/>
    <!-- legs -->
    <rect x="${cx - hipW / 2 + 2}" y="158" width="${hipW / 2 - 4}" height="58" rx="5" fill="#3b3346"/>
    <rect x="${cx + 2}" y="158" width="${hipW / 2 - 4}" height="58" rx="5" fill="#332c3d"/>
    <rect x="${cx - hipW / 2}" y="208" width="${hipW / 2}" height="12" rx="4" fill="#2a2018"/>
    <rect x="${cx}" y="208" width="${hipW / 2}" height="12" rx="4" fill="#2a2018"/>
    <!-- torso -->
    <path d="M${cx - torsoW / 2},${headY + 32} Q${cx},${headY + 24} ${cx + torsoW / 2},${headY + 32} L${cx + hipW / 2 + 2},166 L${cx - hipW / 2 - 2},166Z" fill="${cloth}" stroke="#1a1a22" stroke-width="2"/>
    <path d="M${cx - hipW / 2 - 2},150 L${cx + hipW / 2 + 2},150 L${cx + hipW / 2 + 2},158 L${cx - hipW / 2 - 2},158Z" fill="${trim}"/>
    <path d="M${cx},${headY + 30} L${cx},150" stroke="${trim}" stroke-width="3"/>
    <!-- arms -->
    <path d="M${cx - torsoW / 2},${headY + 34} Q${cx - torsoW / 2 - 16},${headY + 60} ${cx - torsoW / 2 - 10},${headY + 86}" stroke="${cloth}" stroke-width="${13 * w}" fill="none" stroke-linecap="round"/>
    <circle cx="${cx - torsoW / 2 - 10}" cy="${headY + 90}" r="7" fill="${skin}"/>
    <path d="M${cx + torsoW / 2},${headY + 34} Q${cx + torsoW / 2 + 18},${headY + 52} 150,${headY + 70}" stroke="${cloth}" stroke-width="${13 * w}" fill="none" stroke-linecap="round"/>
    ${weaponSvg(domain, rarityColor(weapon))}
    <circle cx="150" cy="${headY + 72}" r="7" fill="${skin}"/>
    ${trinket ? `<path d="M${cx - 6},${headY + 40} L${cx},${headY + 48} L${cx + 6},${headY + 40} L${cx},${headY + 34}Z" fill="${rarityColor(trinket)}" stroke="#1a1a22" stroke-width="1.5"/>` : ''}
    <!-- head -->
    ${p.hairStyle === 'Long' || p.hairStyle === 'Braided' ? hairSvg(p.hairStyle, p.hair, cx, headY - 26).replace(/^<path/, '<path opacity="1"') : ''}
    <rect x="${cx - 7}" y="${headY + 14}" width="14" height="14" fill="${skinD}"/>
    <ellipse cx="${cx}" cy="${headY}" rx="26" ry="28" fill="${skin}" stroke="#1a1a22" stroke-width="2"/>
    <ellipse cx="${cx - 9}" cy="${headY + 2}" rx="3" ry="3.6" fill="#1a1a22"/>
    <ellipse cx="${cx + 9}" cy="${headY + 2}" rx="3" ry="3.6" fill="#1a1a22"/>
    <circle cx="${cx - 8}" cy="${headY + 1}" r="1" fill="#fff"/>
    <circle cx="${cx + 10}" cy="${headY + 1}" r="1" fill="#fff"/>
    <path d="M${cx - 6},${headY + 13} Q${cx},${headY + 17} ${cx + 6},${headY + 13}" stroke="#1a1a22" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="${cx - 16}" cy="${headY + 10}" r="4" fill="#e07a7a" opacity="0.3"/>
    <circle cx="${cx + 16}" cy="${headY + 10}" r="4" fill="#e07a7a" opacity="0.3"/>
    ${p.hairStyle !== 'Long' && p.hairStyle !== 'Braided' ? hairSvg(p.hairStyle, p.hair, cx, headY - 26) : hairSvg('Short', p.hair, cx, headY - 26)}
  `;
  const vbH = 240;
  return `<svg viewBox="0 0 200 ${vbH}" width="${size}" height="${size * vbH / 200}" class="avatar" role="img" aria-label="${esc(p.name)}'s avatar">
    <g transform="translate(${100 - 100 * hScale},${(vbH - 14) - (vbH - 14) * hScale}) scale(${hScale})">${body}</g>
  </svg>`;
}
