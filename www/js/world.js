// Builds the fantasy realm from the plan and renders it as an SVG map
// whose regions are reclaimed from the Gloam as real-life quests are completed.
import { DOMAINS, REGION_NAMES, REALM_PARTS, CAPITAL_TIERS, CLASSES } from './data.js';
import { rng, pick } from './util.js';
import { trackRestoration } from './planner.js';

export function buildWorld(profile, plan, hero) {
  const r = rng(profile.name + profile.age + plan.createdAt);
  const realm = pick(r, REALM_PARTS.a) + pick(r, REALM_PARTS.b);
  const used = new Set();
  const n = plan.tracks.length;
  const offset = r() * Math.PI * 2;
  const regions = plan.tracks.map((t, i) => {
    const options = REGION_NAMES[t.domain].filter(x => !used.has(x));
    const name = pick(r, options);
    used.add(name);
    const angle = offset + (i / n) * Math.PI * 2;
    return { trackId: t.id, domain: t.domain, name, angle, seed: Math.floor(r() * 1e9) };
  });
  const cls = CLASSES[hero.classDomain];
  const lore = [
    `Long ago, the realm of ${realm} was bright. Then the Gloam came: a grey stillness that settles wherever effort stops.`,
    `${regions.map(g => g.name).join(n > 2 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1')} ${n > 1 ? 'have' : 'has'} faded to ash and fog.`,
    `${profile.name}, a ${cls.name.toLowerCase()} newly arrived, carries the one thing the Gloam cannot stand: deeds done in the waking world.`,
    `Every quest you finish out there pushes the fog back here.`,
  ];
  return { realm, regions, lore, encroach: 0 };
}

export function capitalTier(state) {
  const done = state.plan.tracks.reduce((s, t) => s + t.current, 0);
  const max = state.plan.tracks.length * 4;
  const idx = Math.min(CAPITAL_TIERS.length - 1, Math.floor((done / Math.max(1, max)) * (CAPITAL_TIERS.length - 1) + (done > 0 ? 0.5 : 0)));
  return { idx, name: CAPITAL_TIERS[idx] };
}

export function realmHope(state) {
  const t = state.plan.tracks;
  return t.reduce((s, x) => s + trackRestoration(x), 0) / Math.max(1, t.length);
}

// ───────────── SVG map ─────────────

function blobPath(cx, cy, radius, seed, points = 11, wobble = 0.28) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rad = radius * (1 - wobble / 2 + r() * wobble);
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.82]);
  }
  // Smooth closed curve through midpoints.
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    const m = mid(p, q);
    if (i === 0) {
      const m0 = mid(pts[pts.length - 1], p);
      d += `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`;
    }
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}

function landmarkGlyph(x, y, state, color) {
  // state: 'restored' | 'current' | 'locked'
  if (state === 'locked') {
    return `<g transform="translate(${x},${y})" opacity="0.55">
      <path d="M-6,4 L-6,-3 L-3,-6 L-1,-2 L2,-7 L6,-2 L6,4Z" fill="#3a3646" stroke="#6b6680" stroke-width="1"/>
    </g>`;
  }
  const tower = `<path d="M-5,6 L-5,-4 L-7,-4 L-7,-8 L-4,-8 L-4,-6 L-1,-6 L-1,-8 L1,-8 L1,-6 L4,-6 L4,-8 L7,-8 L7,-4 L5,-4 L5,6Z" />`;
  if (state === 'current') {
    return `<g transform="translate(${x},${y})">
      <circle r="11" fill="none" stroke="${color}" stroke-width="1.5" class="pulse"/>
      <g fill="#2b2838" stroke="${color}" stroke-width="1.2">${tower}</g>
    </g>`;
  }
  return `<g transform="translate(${x},${y})">
    <circle r="10" fill="${color}" opacity="0.25"/>
    <g fill="${color}" stroke="#fff6e0" stroke-width="0.8">${tower}</g>
    <rect x="-1.2" y="-2" width="2.4" height="3" fill="#fff6c8"/>
  </g>`;
}

export function renderMap(state, { selected = null } = {}) {
  const W = 400, H = 400, cx = W / 2, cy = H / 2 + 6;
  const { world, plan } = state;
  const n = world.regions.length;
  const orbit = n === 1 ? 0 : n === 2 ? 98 : 112;
  const regionR = n === 1 ? 120 : n === 2 ? 82 : 74;
  const cap = capitalTier(state);

  let defs = `
    <filter id="fog" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.33  0 0 0 0 0.45  0 0 0 1.6 -0.5" result="c"/>
      <feComposite in="c" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
    <pattern id="waves" width="28" height="14" patternUnits="userSpaceOnUse">
      <path d="M0,10 q7,-6 14,0 t14,0" fill="none" stroke="#2a4a5a" stroke-width="1"/>
    </pattern>`;

  let bridges = '', lands = '', labels = '', marks = '';
  world.regions.forEach((g, i) => {
    const track = plan.tracks.find(t => t.id === g.trackId);
    const rest = trackRestoration(track);
    const color = DOMAINS[g.domain].color;
    const rx = cx + Math.cos(g.angle) * orbit;
    const ry = cy + Math.sin(g.angle) * orbit * 0.86;
    const path = blobPath(rx, ry, regionR, g.seed);
    const gloam = Math.min(0.92, (1 - rest) * 0.88 + world.encroach / 100);
    const sel = selected === g.trackId;

    if (n > 1) {
      bridges += `<path d="M${cx},${cy} Q${(cx + rx) / 2 + 14},${(cy + ry) / 2 - 10} ${rx},${ry}"
        stroke="${rest > 0.05 ? '#d9c79a' : '#4d4a5c'}" stroke-width="2" stroke-dasharray="3 5" fill="none" opacity="0.8"/>`;
    }
    lands += `<g class="region" data-track="${g.trackId}" tabindex="0" role="button" aria-label="${g.name}, ${Math.round(rest * 100)}% reclaimed">
      <path d="${path}" fill="#1d3a33" transform="translate(0,5)" opacity="0.6"/>
      <path d="${path}" fill="${color}" stroke="${sel ? '#fff6e0' : '#0f1a1f'}" stroke-width="${sel ? 3 : 2}"/>
      <path d="${blobPath(rx - 6, ry - 4, regionR * 0.62, g.seed + 3, 9, 0.35)}" fill="#ffffff" opacity="0.12"/>
      <path d="${path}" fill="#5c5470" opacity="${gloam.toFixed(2)}"/>
      <path d="${path}" fill="#8b84a0" filter="url(#fog)" opacity="${(gloam * 0.9).toFixed(2)}"/>
    </g>`;

    // Landmarks along a small arc inside the region.
    track.milestones.forEach((m, k) => {
      const a = g.angle + Math.PI + (k - 1.5) * 0.62;
      const lr = regionR * 0.48;
      const lx = rx + Math.cos(a + Math.PI) * lr * (k % 2 ? 0.55 : 1);
      const ly = ry + Math.sin(a + Math.PI) * lr * 0.8 * (k % 2 ? 0.55 : 1);
      const st = k < track.current ? 'restored' : k === track.current ? 'current' : 'locked';
      marks += landmarkGlyph(lx, ly, st, color);
    });

    const ly = ry + regionR * 0.82 + 14;
    labels += `<text x="${rx}" y="${Math.min(H - 8, ly)}" text-anchor="middle" class="map-label">${g.name}</text>
      <text x="${rx}" y="${Math.min(H - 8, ly) + 13}" text-anchor="middle" class="map-sub">${Math.round(rest * 100)}% reclaimed</text>`;
  });

  // Capital in the centre grows with completed milestones.
  const s = 0.8 + cap.idx * 0.16;
  const capital = `<g transform="translate(${cx},${cy}) scale(${s})" class="capital">
    <ellipse rx="26" ry="15" fill="#33493f" stroke="#0f1a1f" stroke-width="2"/>
    ${cap.idx >= 4 ? '<path d="M-20,2 L-20,-8 L20,-8 L20,2" fill="none" stroke="#d9c79a" stroke-width="2"/>' : ''}
    ${cap.idx === 0 ? '<path d="M-8,4 L0,-10 L8,4Z" fill="#7a6a55" stroke="#2a2420"/><path d="M-2,4 L0,-2 L2,4Z" fill="#f2a64a"/>'
      : `<g fill="#e8dcc0" stroke="#2a2420" stroke-width="1">
        <rect x="-10" y="-12" width="8" height="14"/><path d="M-11,-12 L-6,-19 L-1,-12Z" fill="#b5523b"/>
        ${cap.idx >= 2 ? '<rect x="2" y="-8" width="9" height="10"/><path d="M1,-8 L6.5,-14 L12,-8Z" fill="#b5523b"/>' : ''}
        ${cap.idx >= 3 ? '<rect x="-3" y="-22" width="6" height="24"/><path d="M-4,-22 L0,-30 L4,-22Z" fill="#d8a740"/>' : ''}
        ${cap.idx >= 5 ? '<circle cy="-34" r="4" fill="#fff3b0" stroke="none"/>' : ''}
      </g>`}
  </g>
  <text x="${cx}" y="${cy + 30 * s + 8}" text-anchor="middle" class="map-label">${cap.name}</text>`;

  const veil = world.encroach > 0
    ? `<rect width="${W}" height="${H}" fill="#6f6788" opacity="${Math.min(0.35, world.encroach / 100).toFixed(2)}" filter="url(#fog)"/>` : '';

  return `<svg viewBox="0 0 ${W} ${H}" class="map" role="img" aria-label="Map of ${world.realm}">
    <defs>${defs}</defs>
    <rect width="${W}" height="${H}" fill="#12303b"/>
    <rect width="${W}" height="${H}" fill="url(#waves)" opacity="0.6"/>
    ${bridges}${lands}${marks}${capital}${labels}${veil}
  </svg>`;
}
