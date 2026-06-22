import { ACTIONS, TIERS, BADGE_DEFS } from '../constants';

export default function Guide() {
  return (
    <>
      {/* Actions */}
      <div className="card">
        <div className="card-title">How points are earned</div>
        {ACTIONS.map(a => (
          <div key={a.id} className="guide-row">
            <div>
              <div className="guide-title">{a.label}</div>
              {a.note && <div className="guide-note">{a.note}</div>}
            </div>
            <div className="guide-pts">+{a.points}</div>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div className="card">
        <div className="card-title">Tiers</div>
        {TIERS.map((t, i) => (
          <div key={t.name} className="guide-row">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{
                display:'inline-block', width:12, height:12, borderRadius:'50%',
                background: t.color, flexShrink: 0,
              }} />
              <div>
                <div className="guide-title" style={{ color: t.color }}>{t.name}</div>
                <div className="guide-note">
                  {i === 0
                    ? 'Starting point for everyone.'
                    : `Reached at ${t.min} points.`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card">
        <div className="card-title">Badges</div>
        {BADGE_DEFS.map(b => (
          <div key={b.id} className="guide-row">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <svg viewBox="0 0 18 18" width="18" height="18" fill={b.color} style={{ flexShrink:0 }}>
                <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="9" cy="9" r="4" fill="currentColor" opacity="0.4" />
                <circle cx="9" cy="9" r="2" fill="currentColor" />
              </svg>
              <div>
                <div className="guide-title">{b.name}</div>
                <div className="guide-note">{b.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="card">
        <div className="card-title">Rules</div>
        <div className="rules-text">
          <p>This is a quarterly challenge. Points reset at the start of each quarter.</p>
          <p>Activities should be logged honestly — if in doubt about whether something counts, ask Tom.</p>
          <p>Soft caps exist on some activities (likes and personal posts) to keep things balanced. Logging beyond the cap is fine; we just ask you to be sensible about it.</p>
          <p>Team standings use average points per active member, so the Claims team's size doesn't affect fairness.</p>
          <p>Top climbers at the end of the quarter will get a real prize. Details to be announced.</p>
        </div>
      </div>
    </>
  );
}
