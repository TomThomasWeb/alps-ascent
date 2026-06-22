import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import Mountain      from './components/Mountain';
import Spotlight     from './components/Spotlight';
import Podium        from './components/Podium';
import Leaderboard   from './components/Leaderboard';
import Basecamps     from './components/Basecamps';
import LogActivity   from './components/LogActivity';
import Guide         from './components/Guide';
import SummitBanner  from './components/SummitBanner';
import ResetModal    from './components/ResetModal';
import SettingsModal from './components/SettingsModal';
import {
  leaderboardData, teamData, computeStreaks,
  computeBadges, tierForPoints,
} from './compute';
import { TIERS } from './constants';

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#ff6f4d','#e14f8a','#1ee3cf','#f4b942','#9b72ff','#4fc3f7'];

function Confetti({ active }) {
  if (!active) return null;
  return createPortal(
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:100 }}>
      {Array.from({ length: 55 }, (_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${15 + (i * 17.3) % 70}vw`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            width:  `${5 + (i % 4) * 2}px`,
            height: `${6 + (i % 5) * 3}px`,
            borderRadius: i % 3 === 0 ? '50%' : '3px',
            '--dur':   `${0.8 + (i % 10) * 0.1}s`,
            '--drift': `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 6) * 15)}px`,
            '--rot':   `${(i % 2 === 0 ? 1 : -1) * (180 + (i % 4) * 90)}deg`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const LIIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.33V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.61 0 4.28 2.37 4.28 5.46v6.28zM5.34 7.43a2.07 2.07 0 11.01-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77A1.77 1.77 0 000 1.77v20.46A1.77 1.77 0 001.77 24h20.46A1.77 1.77 0 0024 22.23V1.77A1.77 1.77 0 0022.23 0z"/>
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a6.98 6.98 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'climb',     label:'The Climb' },
  { id:'basecamps', label:'Team Standings' },
  { id:'log',       label:'Log Activity' },
  { id:'guide',     label:'Points Guide' },
];

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [entries,      setEntries]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('climb');
  const [banner,       setBanner]       = useState(null);
  const [confetti,     setConfetti]     = useState(false);
  const [showReset,    setShowReset]    = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [label,        setLabel]        = useState('Alps LinkedIn Challenge');
  const appRef = useRef();

  // ── Fetch entries + settings ──────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    try {
      const r = await fetch('/api/entries');
      if (!r.ok) throw new Error();
      setEntries(await r.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchEntries();
    const id = setInterval(fetchEntries, 30000);
    return () => clearInterval(id);
  }, [fetchEntries]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.label) setLabel(d.label); })
      .catch(() => {});
  }, []);

  // ── GSAP entrance ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !appRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.card, .tabs, .header', {
        y: 16, opacity: 0, duration: 0.5, ease: 'power2.out',
        stagger: 0.06, clearProps: 'transform,opacity',
      });
    }, appRef);
    return () => ctx.revert();
  }, [loading]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const board   = useMemo(() => leaderboardData(entries), [entries]);
  const teams   = useMemo(() => teamData(entries), [entries]);
  const streaks = useMemo(() => computeStreaks(entries), [entries]);
  const badges  = useMemo(() => computeBadges(entries), [entries]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const showBanner = (text) => {
    setBanner(text);
    setConfetti(true);
    setTimeout(() => setBanner(null), 3200);
    setTimeout(() => setConfetti(false), 1500);
  };

  const logActivity = async (entry) => {
    const prevBoard   = leaderboardData(entries);
    const prevLeader  = prevBoard[0];
    const prevPts     = prevBoard.find(p => p.name === entry.name)?.points || 0;
    const prevTierIdx = TIERS.indexOf(tierForPoints(prevPts));

    const next = [...entries, entry];
    setEntries(next);

    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(console.error);

    const newBoard   = leaderboardData(next);
    const newLeader  = newBoard[0];
    const myPts      = newBoard.find(p => p.name === entry.name)?.points || 0;
    const newTierIdx = TIERS.indexOf(tierForPoints(myPts));

    if (newTierIdx > prevTierIdx) {
      showBanner(`${entry.name} reached ${TIERS[newTierIdx].name}`);
    } else if (newLeader?.name === entry.name && prevLeader?.name !== entry.name) {
      showBanner(`${entry.name} just took the lead`);
    }
  };

  const deleteEntry = async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    await fetch(`/api/entries?id=${id}`, { method:'DELETE' }).catch(console.error);
  };

  const handleReset = async () => {
    setEntries([]);
    setShowReset(false);
    setBanner('Quarter reset. Climb begins again.');
    setTimeout(() => setBanner(null), 2800);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#6b7080', fontFamily:'IBM Plex Mono, monospace', fontSize:13 }}>
        Loading the mountain...
      </div>
    );
  }

  return (
    <div className="app" ref={appRef}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="header-tag">{label}</span>
            <button
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Edit challenge label"
            >
              <GearIcon />
            </button>
          </div>
          <h1>The Ascent</h1>
          <span className="header-sub">Who's climbing the mountain this challenge?</span>
        </div>
        <a
          href="https://www.linkedin.com/company/alps-ltd"
          target="_blank"
          rel="noopener noreferrer"
          className="linkedin-btn"
        >
          <LIIcon /> Alps on LinkedIn
        </a>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'climb' && (
        <>
          <Spotlight entries={entries} />
          <div className="card card-flush">
            <Mountain board={board} streaks={streaks} badges={badges} />
          </div>
          <div className="card">
            <div className="card-title">Top 3</div>
            <Podium board={board} badges={badges} />
          </div>
          <Leaderboard board={board} streaks={streaks} badges={badges} />
        </>
      )}

      {activeTab === 'basecamps' && <Basecamps teams={teams} />}
      {activeTab === 'log' && (
        <LogActivity
          entries={entries}
          onLog={logActivity}
          onDelete={deleteEntry}
          onShowReset={() => setShowReset(true)}
        />
      )}
      {activeTab === 'guide' && <Guide />}

      {/* Overlays */}
      <SummitBanner text={banner} />
      <Confetti active={confetti} />
      {showReset && <ResetModal onConfirm={handleReset} onClose={() => setShowReset(false)} />}
      {showSettings && (
        <SettingsModal
          currentLabel={label}
          onSave={setLabel}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
