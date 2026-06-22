import { TIERS, WAYPOINTS, EXTENSION, VB_W, VB_H, VB_Y_OFFSET, TEAM_COLORS, BADGE_DEFS } from './constants';

export function tierForPoints(pts) {
  return TIERS.reduce((cur, t) => (pts >= t.min ? t : cur), TIERS[0]);
}

export function tierProgress(pts) {
  const tier = tierForPoints(pts);
  const idx  = TIERS.indexOf(tier);
  const next = TIERS[idx + 1];
  if (!next) return { pct: 100, label: 'Peak reached', maxed: true };
  const pct = ((pts - tier.min) / (next.min - tier.min)) * 100;
  return { pct: Math.max(0, Math.min(100, pct)), label: `${next.min - pts} to ${next.name}`, maxed: false };
}

export function positionForPoints(pts) {
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  if (pts <= last.score) {
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      const a = WAYPOINTS[i], b = WAYPOINTS[i + 1];
      if (pts >= a.score && pts <= b.score) {
        const t = (pts - a.score) / (b.score - a.score);
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
    }
    return { x: last.x, y: last.y };
  }
  const over = pts - last.score;
  const t = Math.min(over / (over + 80), 0.95);
  return { x: last.x + (EXTENSION.x - last.x) * t, y: last.y + (EXTENSION.y - last.y) * t };
}

export function svgToPercent(x, y) {
  return { left: (x / VB_W) * 100, top: ((y + VB_Y_OFFSET) / VB_H) * 100 };
}

export function leaderboardData(entries) {
  const byName = {};
  entries.forEach(e => {
    if (!byName[e.name]) byName[e.name] = { name: e.name, team: e.team, points: 0, count: 0 };
    byName[e.name].points += e.points;
    byName[e.name].count  += 1;
    byName[e.name].team    = e.team || byName[e.name].team;
  });
  return Object.values(byName).sort((a, b) => b.points - a.points);
}

export function teamData(entries) {
  const byTeam = {};
  entries.forEach(e => {
    const t = e.team || 'Other';
    if (!byTeam[t]) byTeam[t] = { team: t, points: 0, members: new Set() };
    byTeam[t].points += e.points;
    byTeam[t].members.add(e.name);
  });
  return Object.values(byTeam)
    .map(t => ({ team: t.team, points: t.points, count: t.members.size, avg: +(t.points / t.members.size).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg);
}

export function weekBucket(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return Math.floor((d - new Date(2020, 0, 6)) / (7 * 86400000));
}

export function computeStreaks(entries) {
  const today = weekBucket(new Date().toISOString().slice(0, 10));
  const byName = {};
  entries.forEach(e => (byName[e.name] = byName[e.name] || new Set()).add(weekBucket(e.date)));
  const out = {};
  Object.keys(byName).forEach(name => {
    const wks = byName[name];
    let cur = wks.has(today) ? today : wks.has(today - 1) ? today - 1 : null;
    if (!cur) { out[name] = 0; return; }
    let n = 0; while (wks.has(cur)) { n++; cur--; }
    out[name] = n;
  });
  return out;
}

export function weeklySpotlight(entries) {
  const cutoff = Date.now() - 7 * 86400000;
  const gains  = {};
  entries.forEach(e => { if ((e.created || 0) >= cutoff) gains[e.name] = (gains[e.name] || 0) + e.points; });
  return Object.entries(gains).map(([name, pts]) => ({ name, pts })).sort((a, b) => b.pts - a.pts)[0] || null;
}

export function computeBadges(entries) {
  const res    = {};
  const award  = (n, id) => (res[n] = res[n] || new Set()).add(id);
  const byName = {};
  entries.forEach(e => (byName[e.name] = byName[e.name] || []).push(e));

  // ── Original badges ──────────────────────────────────────────────────────

  Object.keys(byName).forEach(name => {
    const mine = byName[name];
    if (mine.length >= 1) award(name, 'first_climb');

    const months = {};
    mine.forEach(e => {
      if (['personal_post_alps', 'event_content'].includes(e.actionId)) {
        const m = e.date.slice(0, 7);
        months[m] = (months[m] || 0) + 1;
      }
    });
    if (Object.values(months).some(c => c >= 3)) award(name, 'storyteller');
  });

  const teamWks = {}, teamAll = {};
  entries.forEach(e => {
    const t = e.team || 'Other';
    (teamAll[t] = teamAll[t] || new Set()).add(e.name);
    const wk = weekBucket(e.date);
    if (!teamWks[t]) teamWks[t] = {};
    (teamWks[t][wk] = teamWks[t][wk] || new Set()).add(e.name);
  });
  Object.keys(teamWks).forEach(team => {
    const all = teamAll[team];
    if (all.size < 2) return;
    Object.values(teamWks[team]).forEach(wkSet => {
      if (wkSet.size >= all.size) all.forEach(n => award(n, 'squad_goals'));
    });
  });

  // ── New badges ───────────────────────────────────────────────────────────

  // Early Bird — first to log in any given week
  const weekFirsts = {};
  entries.forEach(e => {
    const wk = weekBucket(e.date);
    const cr = e.created || 0;
    if (!weekFirsts[wk] || cr < weekFirsts[wk].created) {
      weekFirsts[wk] = { name: e.name, created: cr };
    }
  });
  Object.values(weekFirsts).forEach(({ name }) => award(name, 'early_bird'));

  // Comeback — logged after a 3+ week gap
  Object.keys(byName).forEach(name => {
    const weeks = Array.from(new Set(byName[name].map(e => weekBucket(e.date)))).sort((a, b) => a - b);
    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i] - weeks[i - 1] >= 3) { award(name, 'comeback'); break; }
    }
  });

  // Peak Bagger — 100+ total points
  const totalPts = {};
  entries.forEach(e => totalPts[e.name] = (totalPts[e.name] || 0) + e.points);
  Object.entries(totalPts).forEach(([name, p]) => { if (p >= 100) award(name, 'peak_bagger'); });

  // Consistent Climber — logged every week for 4 consecutive weeks
  Object.keys(byName).forEach(name => {
    const weeks = Array.from(new Set(byName[name].map(e => weekBucket(e.date)))).sort((a, b) => a - b);
    let streak = 1;
    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i] - weeks[i - 1] === 1) {
        streak++;
        if (streak >= 4) { award(name, 'consistent'); break; }
      } else {
        streak = 1;
      }
    }
  });

  // Chatterbox — 10+ comments
  Object.keys(byName).forEach(name => {
    const n = byName[name].filter(e => e.actionId === 'comment').length;
    if (n >= 10) award(name, 'chatterbox');
  });

  return res;
}

export function weeklyWeather(entries) {
  const n = entries.filter(e => (e.created || 0) >= Date.now() - 7 * 86400000).length;
  if (n === 0) return { type: 'mist',   label: 'Calm and quiet',  sub: 'No activity logged this week' };
  if (n < 8)   return { type: 'cloud',  label: 'Light cloud',     sub: `${n} activities this week` };
  if (n < 20)  return { type: 'partly', label: 'Partly cloudy',   sub: `${n} activities this week` };
  return             { type: 'sun',    label: 'Clear skies',      sub: `${n} activities this week` };
}

export function elevationForPoints(pts) {
  return (3200 + Math.round(Math.min(pts, 100) / 100 * 12577)).toLocaleString() + ' ft';
}

export function colorForTeam(team) {
  return TEAM_COLORS[team] || TEAM_COLORS.Other;
}

export function darkenHex(hex, amt = 0.3) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${Math.round(r*(1-amt))},${Math.round(g*(1-amt))},${Math.round(b*(1-amt))})`;
}

export function layoutClimbers(board) {
  const MIN = 38;
  const placed = WAYPOINTS.map(wp => ({ x: wp.x, y: wp.y }));
  return board.map(climber => {
    const base = positionForPoints(climber.points);
    let x = base.x, y = base.y, attempt = 0;
    while (attempt < 14 && placed.some(p => Math.hypot(x - p.x, y - p.y) < MIN)) {
      attempt++;
      const ring = Math.ceil(attempt / 2), side = attempt % 2 === 0 ? 1 : -1;
      x = base.x + side * ring * 24;
      y = base.y - ring * 11;
    }
    x = Math.max(18, Math.min(VB_W - 18, x));
    y = Math.max(-60, Math.min(540, y));
    placed.push({ x, y });
    return { climber, pos: { x, y } };
  });
}

export function initials(name) {
  return (name || '?').trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// ── Day/night sky ──────────────────────────────────────────────────────────

// Key frames: hour (0-24) → [topR,topG,topB] [botR,botG,botB]
const SKY_KF = [
  { h: 0,    top: [3,3,18],       bot: [8,8,44]        }, // midnight
  { h: 4,    top: [5,4,24],       bot: [10,8,52]        }, // deep night
  { h: 5.5,  top: [38,18,70],     bot: [94,38,80]       }, // pre-dawn purple
  { h: 6.5,  top: [64,104,182],   bot: [214,96,34]      }, // sunrise — blue sky, orange horizon
  { h: 8,    top: [24,88,190],    bot: [68,148,230]     }, // morning
  { h: 12,   top: [14,74,176],    bot: [44,120,214]     }, // midday
  { h: 16,   top: [20,84,184],    bot: [58,138,226]     }, // afternoon
  { h: 18,   top: [178,72,30],    bot: [228,104,22]     }, // golden hour
  { h: 19.5, top: [68,26,92],     bot: [122,46,80]      }, // dusk purple
  { h: 21,   top: [10,6,32],      bot: [16,12,56]       }, // evening
  { h: 24,   top: [3,3,18],       bot: [8,8,44]         }, // midnight (loop)
];

function lerpArr(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

export function skyForTime(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;

  // Find surrounding keyframes
  let i = 0;
  while (i < SKY_KF.length - 2 && SKY_KF[i + 1].h <= h) i++;
  const a = SKY_KF[i], b = SKY_KF[i + 1];
  const t = b.h === a.h ? 0 : (h - a.h) / (b.h - a.h);

  const topRgb = lerpArr(a.top, b.top, t);
  const botRgb = lerpArr(a.bot, b.bot, t);

  // Star opacity: full at night, gone during day
  const starOpacity = (() => {
    if (h < 5)    return 1;
    if (h < 7)    return Math.max(0, 1 - (h - 5) / 2);
    if (h < 19)   return 0;
    if (h < 21)   return (h - 19) / 2;
    return 1;
  })();

  // Sun: visible 6:30am – 18:30pm, arcs east to west
  const sunStart = 6.5, sunEnd = 18.5;
  const showSun  = h >= sunStart && h <= sunEnd;
  const sunProgress = showSun ? (h - sunStart) / (sunEnd - sunStart) : 0;

  // Aurora: night only
  const auroraOpacity = starOpacity * 0.13;

  // Cloud opacity: more visible in daylight
  const cloudOpacity = 0.10 + 0.12 * (1 - starOpacity);

  return { topRgb, botRgb, starOpacity, showSun, sunProgress, auroraOpacity, cloudOpacity };
}

export function quarterProgress() {
  const now    = new Date();
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const qEnd   = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
  return Math.max(0, Math.min(1, (now - qStart) / (qEnd - qStart)));
}
