import { colorForTeam } from '../compute';

export default function Basecamps({ teams }) {
  if (teams.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Team Standings</div>
        <div className="empty">No team data yet.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        Team Standings
        <span className="muted">Ranked by average points per member</span>
      </div>
      <table className="teams-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Team</th>
            <th style={{ textAlign:'right' }}>Members active</th>
            <th style={{ textAlign:'right' }}>Total pts</th>
            <th style={{ textAlign:'right' }}>Avg / head</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => {
            const col       = colorForTeam(t.team);
            const rankClass = i < 3 ? `r${i + 1}` : '';
            return (
              <tr key={t.team}>
                <td
                  className={`t-rank ${rankClass}`}
                  style={{ borderLeft: `3px solid ${col}`, paddingLeft: 8 }}
                >{i + 1}</td>
                <td>
                  <span
                    className="t-name"
                    style={{ borderBottom: `2px solid ${col}` }}
                  >{t.team}</span>
                </td>
                <td className="t-num">{t.count}</td>
                <td className="t-num">{t.points}</td>
                <td className="t-avg">{t.avg}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 14, lineHeight: 1.6 }}>
        Teams are ranked by <strong>average points per active member</strong>, not total,
        so the Claims team's size doesn't give them an unfair advantage.
      </p>
    </div>
  );
}
