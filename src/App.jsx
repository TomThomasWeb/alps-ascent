import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import Mountain    from './components/Mountain';
import Spotlight   from './components/Spotlight';
import Podium      from './components/Podium';
import Leaderboard from './components/Leaderboard';
import Basecamps   from './components/Basecamps';
import LogActivity from './components/LogActivity';
import Guide       from './components/Guide';
import SummitBanner from './components/SummitBanner';
import ResetModal   from './components/ResetModal';
import {
  leaderboardData, teamData, computeStreaks,
  computeBadges, tierForPoints,
} from './compute';
import { TIERS } from './constants';

// ── Confetti ─────────────────────────────────────────────────────────────────
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

// ── LinkedIn icon ─────────────────────────────────────────────────────────────
const LIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.33V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.61 0 4.28 2.37 4.28 5.46v6.28zM5.34 7.43a2.07 2.07 0 11.01-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77A1.77 1.77 0 000 1.77v20.46A1.77 1.77 0 001.77 24h20.46A1.77 1.77 0 0024 22.23V1.77A1.77 1.77 0 0022.23 0z"/>
  </svg>
);

// ── App ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id:'climb',     label:'The Climb' },
  { id:'basecamps', label:'Team Standings' },
  { id:'log',       label:'Log Activity' },
  { id:'guide',     label:'Points Guide' },
];

export default function App() {
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('climb');
  const [banner,     setBanner]     = useState(null);
  const [confetti,   setConfetti]   = useState(false);
  const [showReset,  setShowReset]  = useState(false);
  const appRef = useRef();

  // ── Data fetching & polling ──────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    try {
      const r = await fetch('/api/entries');
      if (!r.ok) throw new Error();
      const data = await r.json();
      setEntries(data);
    } catch { /* silently ignore polling errors */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchEntries();
    const id = setInterval(fetchEntries, 30000);
    return () => clearInterval(id);
  }, [fetchEntries]);

  // ── GSAP entrance ────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !appRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.card, .tabs, .header', {
        y: 20, opacity: 0, duration: 0.55, ease: 'power2.out',
        stagger: 0.07, clearProps: 'transform,opacity',
      });
    }, appRef);
    return () => ctx.revert();
  }, [loading]);

  // ── Derived state ────────────────────────────────────────────────────────
  const board   = useMemo(() => leaderboardData(entries), [entries]);
  const teams   = useMemo(() => teamData(entries), [entries]);
  const streaks = useMemo(() => computeStreaks(entries), [entries]);
  const badges  = useMemo(() => computeBadges(entries), [entries]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const showBanner = (text) => {
    setBanner(text);
    setConfetti(true);
    setTimeout(() => setBanner(null), 3200);
    setTimeout(() => setConfetti(false), 1500);
  };

  const logActivity = async (entry) => {
    const prevBoard  = leaderboardData(entries);
    const prevLeader = prevBoard[0];
    const prevTierIdx = TIERS.indexOf(
      tierForPoints(prevBoard.find(p => p.name === entry.name)?.points || 0)
    );

    // Optimistic update
    const next = [...entries, entry];
    setEntries(next);

    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(console.error);

    const newBoard   = leaderboardData(next);
    const newLeader  = newBoard[0];
    const myPoints   = newBoard.find(p => p.name === entry.name)?.points || 0;
    const newTierIdx = TIERS.indexOf(tierForPoints(myPoints));

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

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text2)', fontFamily:'IBM Plex Mono, monospace', fontSize:13 }}>
        Loading the mountain...
      </div>
    );
  }

  return (
    <div className="app" ref={appRef}>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="header-tag">Q{Math.ceil((new Date().getMonth() + 1) / 3)} · {new Date().getFullYear()} · Alps LinkedIn Challenge</span>
          <h1>The Ascent</h1>
          <span className="header-sub">Who's climbing the mountain this quarter?</span>
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

      {activeTab === 'basecamps' && (
        <Basecamps teams={teams} />
      )}

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
      {showReset && (
        <ResetModal onConfirm={handleReset} onClose={() => setShowReset(false)} />
      )}
    </div>
  );
}
