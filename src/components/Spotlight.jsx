import { weeklySpotlight, computeStreaks, weeklyWeather } from '../compute';

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{color:'#f4b942'}}>
    <path d="M12 2c2.5 3.5-1.5 5-1.5 8.5a3.5 3.5 0 107 0c0-1.8-.8-2.8-.8-2.8 1.6 1 2.8 3.4 2.8 5.3a6.5 6.5 0 11-13 0c0-4.3 3.3-6.6 5.5-11z"/>
  </svg>
);
const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{color:'#ff6f4d'}}>
    <path d="M12 2c4 3 5 8 3 13l-3 3-3-3c-2-5-1-10 3-13z"/>
    <circle cx="12" cy="9" r="1.5" fill="#060718"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f4b942" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" fill="#f4b942" stroke="none"/>
    <line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>
    <line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>
    <line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/>
    <line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="#9ba3bc">
    <path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0118.5 18H7z"/>
  </svg>
);
const MistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#9ba3bc" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="8" x2="21" y2="8"/>
    <line x1="3" y1="13" x2="21" y2="13"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
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
      <div className="card-title">This week on the mountain <span className="muted">Resets every 7 days</span></div>
      <div className="weather-row">
        {ICONS[weather.type]}
        <span className="weather-label">{weather.label}</span>
        <span>· {weather.sub}</span>
      </div>
      <div className="spotlight-grid">
        <div className="spotlight-box spot">
          <div className="spot-label"><RocketIcon /> Climbing fastest this week</div>
          <div className="spot-name">{spot ? spot.name : 'Nobody yet'}</div>
          <div className="spot-sub">{spot ? `+${spot.pts} pts in the last 7 days` : 'Log an activity to take this spot'}</div>
        </div>
        <div className="spotlight-box streak">
          <div className="spot-label"><FlameIcon /> Longest active streak</div>
          <div className="spot-name">{topStreak ? topStreak[0] : 'Nobody yet'}</div>
          <div className="spot-sub">{topStreak ? `${topStreak[1]} week${topStreak[1] > 1 ? 's' : ''} in a row` : 'Log something this week to start one'}</div>
        </div>
      </div>
    </div>
  );
}
