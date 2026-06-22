import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { tierForPoints, colorForTeam, initials } from '../compute';
import { BADGE_DEFS } from '../constants';

function BadgePip({ id }) {
  const def = BADGE_DEFS.find(b => b.id === id);
  if (!def) return null;
  return (
    <span className="podium-badge" title={def.name} style={{ color: def.color }}>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="4" fill="currentColor" opacity="0.3"/>
        <circle cx="8" cy="8" r="2" fill="currentColor"/>
      </svg>
    </span>
  );
}

function Place({ climber, place, badges }) {
  const standClass = ['stand-1','stand-2','stand-3'][place - 1];
  const heights    = [120, 88, 64];
  const sizes      = [64, 52, 52];
  const tier       = climber ? tierForPoints(climber.points) : null;
  const myBadges   = climber && badges[climber.name] ? Array.from(badges[climber.name]) : [];

  return (
    <div className={`podium-place place-${place}`}>
      {climber ? (
        <>
          <div
            className="podium-avatar"
            style={{
              width: sizes[place-1], height: sizes[place-1], fontSize: place === 1 ? 18 : 16,
              background: colorForTeam(climber.team),
              boxShadow: `0 0 0 3px ${tier.color}99`,
            }}
          >
            {initials(climber.name)}
          </div>
          <div className="podium-name">{climber.name}</div>
          <div className="podium-pts">{climber.points} pts</div>
          <div className="podium-badges">{myBadges.map(id => <BadgePip key={id} id={id} />)}</div>
        </>
      ) : (
        <>
          <div className="podium-avatar empty-avatar" style={{ width: sizes[place-1], height: sizes[place-1], background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--text3)', fontSize: 11 }}>--</span>
          </div>
          <div className="podium-name podium-empty">Open</div>
          <div className="podium-pts" style={{ opacity: 0 }}>0</div>
          <div className="podium-badges" />
        </>
      )}
      <div className={`podium-stand ${standClass}`} style={{ height: heights[place-1] }}>{place}</div>
    </div>
  );
}

export default function Podium({ board, badges }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.podium-stand', {
        scaleY: 0, transformOrigin: 'bottom', duration: 0.7,
        ease: 'back.out(1.4)', stagger: { each: 0.12, from: 'center' },
      });
      gsap.from('.podium-avatar', {
        scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)',
        delay: 0.3, stagger: { each: 0.1, from: 'center' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="podium" ref={ref}>
      <Place place={2} climber={board[1] || null} badges={badges} />
      <Place place={1} climber={board[0] || null} badges={badges} />
      <Place place={3} climber={board[2] || null} badges={badges} />
    </div>
  );
}
