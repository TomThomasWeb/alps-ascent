import { useState, useEffect } from 'react';
import { ACTIONS, ROSTERS } from '../constants';

const today = () => new Date().toISOString().slice(0, 10);

function isValidUrl(str) {
  if (!str) return true; // empty is fine
  try { new URL(str); return true; } catch { return false; }
}

export default function LogActivity({ entries, onLog, onDelete, onShowReset }) {
  const [team,     setTeam]     = useState('');
  const [name,     setName]     = useState('');
  const [actionId, setActionId] = useState('');
  const [date,     setDate]     = useState(today());
  const [url,      setUrl]      = useState('');
  const [saving,   setSaving]   = useState(false);
  const [flash,    setFlash]    = useState(null);

  const teams  = Object.keys(ROSTERS);
  const names  = team ? ROSTERS[team] || [] : [];
  const action = ACTIONS.find(a => a.id === actionId);
  const urlOk  = isValidUrl(url);

  useEffect(() => { setName(''); }, [team]);

  const handleSubmit = async () => {
    if (!team || !name || !actionId) return;
    if (url && !urlOk) return;
    setSaving(true);
    const entry = {
      id: crypto.randomUUID(),
      team, name, actionId,
      points: action.points,
      date,
      url: url.trim(),
      created: Date.now(),
    };
    await onLog(entry);
    setFlash(`+${action.points} pts logged for ${name}`);
    setTimeout(() => setFlash(null), 2500);
    setActionId(''); setUrl('');
    setSaving(false);
  };

  const recent = [...entries].reverse().slice(0, 30);

  return (
    <>
      <div className="card">
        <div className="card-title">Log an activity</div>

        {flash && (
          <div style={{ background:'rgba(10,158,150,0.1)', border:'1px solid rgba(10,158,150,0.25)', borderRadius:10, padding:'10px 14px', fontSize:14, color:'var(--teal)', marginBottom:16, fontFamily:'IBM Plex Mono, monospace' }}>
            {flash}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label>Team</label>
            <select value={team} onChange={e => setTeam(e.target.value)}>
              <option value="">Select team...</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Name</label>
            <select value={name} onChange={e => setName(e.target.value)} disabled={!team}>
              <option value="">Select name...</option>
              {names.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginBottom:14 }}>
          <label>Activity</label>
          <select value={actionId} onChange={e => setActionId(e.target.value)}>
            <option value="">Select activity...</option>
            {ACTIONS.map(a => <option key={a.id} value={a.id}>{a.label} (+{a.points} pts)</option>)}
          </select>
          <div className="action-hint">{action?.note || ''}</div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} max={today()} onChange={e => setDate(e.target.value)}/>
          </div>
          <div className="field">
            <label>LinkedIn post URL (optional)</label>
            <input
              type="url"
              value={url}
              placeholder="https://linkedin.com/posts/..."
              onChange={e => setUrl(e.target.value)}
              style={{ borderColor: url && !urlOk ? 'var(--coral)' : undefined }}
            />
            {url && !urlOk && <div style={{ fontSize:11, color:'var(--coral)', marginTop:4 }}>Enter a valid URL or leave blank</div>}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!team || !name || !actionId || saving || (url && !urlOk)}
        >
          {saving ? 'Saving...' : `Log activity${action ? ` · +${action.points} pts` : ''}`}
        </button>
      </div>

      <div className="card">
        <div className="card-title">
          Recent activity
          <span className="muted">Last {Math.min(recent.length, 30)} entries</span>
        </div>
        {recent.length === 0 ? (
          <div className="empty">No activity yet.</div>
        ) : (
          recent.map(e => {
            const act = ACTIONS.find(a => a.id === e.actionId);
            return (
              <div key={e.id} className="log-item">
                <div className="log-left">
                  <div className="log-who">{e.name} <span style={{ color:'var(--text2)', fontWeight:400 }}>({e.team})</span></div>
                  <div className="log-what">{act?.label || e.actionId} · {e.date}</div>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="log-url">
                      View post →
                    </a>
                  )}
                  {/* Legacy: show plain note text if entry predates URL field */}
                  {!e.url && e.note && <div className="log-what" style={{ fontStyle:'italic' }}>{e.note}</div>}
                </div>
                <div className="log-right">
                  <span className="log-pts">+{e.points}</span>
                  <button className="del-btn" onClick={() => onDelete(e.id)} title="Remove entry">×</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ color:'var(--coral)' }}>Danger zone</div>
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:14, lineHeight:1.6 }}>
          Resetting clears all activity for the current challenge. Use this at the start of each new period. The action requires the admin password and cannot be undone.
        </p>
        <button className="btn-danger" onClick={onShowReset}>Reset leaderboard</button>
      </div>
    </>
  );
}
