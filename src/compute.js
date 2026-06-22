import { TIERS, WAYPOINTS, EXTENSION, VB_W, VB_H, VB_Y_OFFSET, TEAM_COLORS, BADGE_DEFS } from './constants';

export function tierForPoints(pts) {
  return TIERS.reduce((cur, t) => (pts >= t.min ? t : cur), TIERS[0]);
}

export function tierProgress(pts) {
  const tier = tierForPoints(pts);
  const idx = TIERS.indexOf(tier);
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
  return {
    left: (x / VB_W) * 100,
    top: ((y + VB_Y_OFFSET) / VB_H) * 100,
  };
}

export function leaderboardData(entries) {
  const byName = {};
  entries.forEach(e => {
    if (!byName[e.name]) byName[e.name] = { name: e.name, team: e.team, points: 0, count: 0 };
    byName[e.name].points += e.points;
    byName[e.name].count += 1;
    byName[e.name].team = e.team || byName[e.name].team;
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
  const gains = {};
  entries.forEach(e => { if (e.created >= cutoff) gains[e.name] = (gains[e.name] || 0) + e.points; });
  return Object.entries(gains).map(([name, pts]) => ({ name, pts })).sort((a, b) => b.pts - a.pts)[0] || null;
}

export function computeBadges(entries) {
  const res = {};
  const award = (n, id) => (res[n] = res[n] || new Set()).add(id);
  const byName = {};
  entries.forEach(e => (byName[e.name] = byName[e.name] || []).push(e));
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
  return res;
}

export function weeklyWeather(entries) {
  const n = entries.filter(e => e.created >= Date.now() - 7 * 86400000).length;
  if (n === 0) return { type: 'mist', label: 'Calm and quiet', sub: 'No activity logged this week' };
  if (n < 8)   return { type: 'cloud',  label: 'Light cloud',    sub: `${n} activities this week` };
  if (n < 20)  return { type: 'partly', label: 'Partly cloudy',  sub: `${n} activities this week` };
  return              { type: 'sun',    label: 'Clear skies',    sub: `${n} activities this week` };
}

export function elevationForPoints(pts) {
  const ft = 3200 + Math.round(Math.min(pts, 100) / 100 * 12577);
  return ft.toLocaleString() + ' ft';
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

export function quarterProgress() {
  const now = new Date();
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const qEnd   = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
  return Math.max(0, Math.min(1, (now - qStart) / (qEnd - qStart)));
}
