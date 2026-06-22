import { weeklySpotlight, computeStreaks, weeklyWeather } from '../compute';

const SunIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
    <circle cx="10" cy="10" r="4" fill="#d4900a"/>
    <g stroke="#d4900a" strokeWidth="1.5" strokeLinecap="round">
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="10" y1="16" x2="10" y2="18"/>
      <line x1="2" y1="10" x2="4" y2="10"/>
      <line x1="16" y1="10" x2="18" y2="10"/>
      <line x1="4.1" y1="4.1" x2="5.5" y2="5.5"/>
      <line x1="14.5" y1="14.5" x2="15.9" y2="15.9"/>
      <line x1="4.1" y1="15.9" x2="5.5" y2="14.5"/>
      <line x1="14.5" y1="5.5" x2="15.9" y2="4.1"/>
    </g>
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="#9ba3bc">
    <path d="M6 14a3.5 3.5 0 010-7 4.5 4.5 0 018.7-1.2A3.75 3.75 0 0116 14H6z"/>
  </svg>
);
const MistIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#9ba3bc" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="7"  x2="17" y2="7"/>
    <line x1="3" y1="11" x2="17" y2="11"/>
    <line x1="3" y1="15" x2="17" y2="15"/>
  </svg>
);

const ICONS = { sun: <SunIcon />, cloud: <CloudIcon />, partly: <CloudIcon />, mist: <MistIcon /> };

export default function Spotlight({ entries }) {
  const spot    = weeklySpotlight(entries);
  const streaks = computeStreaks(entries);
  const weather = weeklyWeather(entries);

  const topStreak = Object.entries(streaks)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])[0] || null;

  return (
    <div className="card">
      <div className="spotlight-strip">

        <div className="spot-weather">
          {ICONS[weather.type]}
          <span>
            <strong>{weather.label}</strong>
            <span className="spot-dim"> · {weather.sub}</span>
          </span>
        </div>

        <div className="spot-divider" />

        <div className="spot-cell">
          <div className="spot-cell-label">Fastest this week</div>
          <div className="spot-cell-name">{spot ? spot.name : '—'}</div>
          {spot && <div className="spot-cell-sub">+{spot.pts} pts in 7 days</div>}
        </div>

        <div className="spot-divider" />

        <div className="spot-cell">
          <div className="spot-cell-label">Longest streak</div>
          <div className="spot-cell-name">{topStreak ? topStreak[0] : '—'}</div>
          {topStreak && (
            <div className="spot-cell-sub">
              {topStreak[1]} week{topStreak[1] > 1 ? 's' : ''} in a row
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
