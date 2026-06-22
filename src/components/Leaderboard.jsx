import { tierForPoints, tierProgress, colorForTeam } from '../compute';
import { BADGE_DEFS } from '../constants';

function BadgePip({ id }) {
  const def = BADGE_DEFS.find(b => b.id === id);
  if (!def) return null;
  return (
    <span title={def.name} style={{ display:'inline-flex', verticalAlign:'middle' }}>
      <svg viewBox="0 0 14 14" width="13" height="13" fill={def.color}>
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="3" fill="currentColor" opacity="0.4" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
    </span>
  );
}

const FlameIcon = () => (
  <svg viewBox="0 0 10 10" width="10" height="10" fill="#f4b942">
    <path d="M5 1c1 1.4-.6 2-0.6 3.4a1.4 1.4 0 002.8 0c0-.7-.3-1.1-.3-1.1.6.4 1.1 1.4 1.1 2.1a2.6 2.6 0 01-5.2 0c0-1.7 1.3-2.6 2.2-4.4z"/>
  </svg>
);

export default function Leaderboard({ board, streaks, badges }) {
  if (board.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Individual Standings</div>
        <div className="empty">No entries yet. Be the first to log an activity.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        Individual Standings
        <span className="muted">{board.length} climbers</span>
      </div>
      <table className="lb-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Climber</th>
            <th>Progress</th>
            <th style={{ textAlign:'right' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {board.map((person, idx) => {
            const tier      = tierForPoints(person.points);
            const prog      = tierProgress(person.points);
            const streak    = streaks[person.name] || 0;
            const myBadges  = badges[person.name] ? Array.from(badges[person.name]) : [];
            const rankClass = idx < 3 ? `r${idx + 1}` : '';
            const ahead     = idx > 0 ? board[idx - 1].points - person.points : null;
            const teamColor = colorForTeam(person.team);

            return (
              <tr key={person.name} className="lb-row">
                <td
                  className={`lb-rank ${rankClass}`}
                  style={{ borderLeftColor: teamColor, borderLeftWidth: 3, borderLeftStyle: 'solid' }}
                >
                  {idx + 1}
                </td>
                <td>
                  <div className="lb-name-line">
                    {person.name}
                    <span className="team-pill" style={{ color: teamColor }}>{person.team}</span>
                    <span
                      className="tier-pill"
                      style={{ color: tier.color, background: `${tier.color}18` }}
                    >{tier.name}</span>
                    {streak >= 2 && (
                      <span className="streak-badge">
                        <FlameIcon />{streak}wk
                      </span>
                    )}
                    {myBadges.map(id => <BadgePip key={id} id={id} />)}
                  </div>
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${prog.pct}%`,
                        background: prog.maxed ? '#f4b942' : tier.color,
                      }}
                    />
                  </div>
                  <div className="progress-label">{prog.label}</div>
                  {ahead !== null && (
                    <div className="rival-label">
                      {ahead} pts behind {board[idx - 1].name.split(' ')[0]}
                    </div>
                  )}
                </td>
                <td className="lb-pts">{person.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
