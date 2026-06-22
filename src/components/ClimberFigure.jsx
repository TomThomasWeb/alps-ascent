import { darkenHex, initials as getInitials } from '../compute';

export default function ClimberFigure({ teamColor, name, tierColor, isLeader, size = 30 }) {
  const inits = getInitials(name);
  const dark  = darkenHex(teamColor, 0.35);
  const scale = size / 30;

  return (
    <svg
      viewBox="0 0 30 44"
      width={size}
      height={size * 44 / 30}
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* Tier glow ring */}
      <circle cx="15" cy="9" r="10" fill="none" stroke={tierColor} strokeWidth="2.5" opacity="0.6"/>

      {/* Leader crown */}
      {isLeader && (
        <path
          d="M 8,0.5 L 10.5,5 L 15,2 L 19.5,5 L 22,0.5 L 22,2.5 L 8,2.5 Z"
          fill="#f4b942"
        />
      )}

      {/* Head */}
      <circle cx="15" cy="9" r="6.5" fill={teamColor} />

      {/* Helmet visor */}
      <path d="M 8.5,7.5 Q 15,2 21.5,7.5" fill={dark} stroke="none" />

      {/* Initials */}
      <text
        x="15" y="12.5"
        textAnchor="middle"
        fontSize="5.5"
        fontFamily="Sora, sans-serif"
        fontWeight="700"
        fill={darkenHex(teamColor, 0.75)}
      >{inits}</text>

      {/* Backpack (behind body) */}
      <rect x="16.5" y="16" width="5.5" height="10" rx="2" fill={dark} opacity="0.9" />

      {/* Body */}
      <rect x="12" y="15.5" width="7" height="14" rx="3.5" fill={teamColor} />

      {/* Left arm + ice axe (reaching up) */}
      <line x1="12" y1="18" x2="5" y2="12" stroke={teamColor} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="2.5" y1="11" x2="7.5" y2="11" stroke="#f4b942" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="9.2" x2="5" y2="13.2" stroke="#f4b942" strokeWidth="1.8" strokeLinecap="round" />

      {/* Rope */}
      <path d="M 12,17 L 5,12" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="1.5 1" />

      {/* Right arm (for balance) */}
      <line x1="19" y1="19" x2="25.5" y2="23" stroke={teamColor} strokeWidth="2.8" strokeLinecap="round" />

      {/* Left leg */}
      <line x1="13.5" y1="29.5" x2="8" y2="41" stroke={teamColor} strokeWidth="2.8" strokeLinecap="round" />

      {/* Right leg (stepped forward) */}
      <line x1="17.5" y1="29.5" x2="23" y2="39" stroke={teamColor} strokeWidth="2.8" strokeLinecap="round" />

      {/* Boots */}
      <ellipse cx="8"  cy="41.5" rx="4" ry="1.8" fill={dark} />
      <ellipse cx="23" cy="39.5" rx="4" ry="1.8" fill={dark} />
    </svg>
  );
}
