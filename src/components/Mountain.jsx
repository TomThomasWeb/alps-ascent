import { useEffect, useRef, useMemo, useState } from 'react';
import ClimberFigure from './ClimberFigure';
import {
  layoutClimbers, tierForPoints, colorForTeam,
  elevationForPoints, computeBadges, svgToPercent,
  skyForTime, darkenHex
} from '../compute';
import { WAYPOINTS, TIERS, BADGE_DEFS, STARS } from '../constants';

// ── Mountain paths ────────────────────────────────────────────────────────────
const FAR_MOUNTAINS =
  'M 0,560 C 120,556 220,548 300,534 C 380,520 440,504 490,486 C 540,468 592,450 642,436 ' +
  'C 692,422 742,412 792,406 C 842,400 890,402 936,414 C 966,422 986,434 1000,446 L 1000,560 Z';

const MID_MOUNTAINS =
  'M 0,560 C 50,557 104,550 154,538 C 204,526 248,512 286,494 C 326,476 355,454 378,430 ' +
  'C 402,406 422,384 446,362 C 472,340 500,322 530,306 C 562,290 598,278 636,268 ' +
  'C 674,258 716,256 758,264 C 800,272 852,290 918,322 C 958,342 982,358 1000,374 L 1000,560 Z';

const MAIN_MOUNTAIN =
  'M -10,560 L -10,534 ' +
  'C 24,518 60,500 98,480 C 136,460 174,440 212,418 ' +
  'C 244,400 262,384 280,370 C 296,354 314,360 332,370 ' +
  'C 352,380 374,360 408,328 C 430,308 446,284 460,265 ' +
  'C 474,248 492,256 512,266 C 534,278 562,256 596,226 ' +
  'C 622,204 642,176 660,150 C 676,130 698,138 718,150 ' +
  'C 740,162 778,112 818,74 C 840,58 854,48 860,48 ' +
  'C 874,48 898,40 920,52 C 942,64 964,82 988,108 ' +
  'L 1010,132 L 1010,560 Z';

const ROCK_STROKES = [
  [88,480,118,458],[175,440,204,418],[260,394,285,372],
  [340,363,360,348],[408,322,428,305],[464,258,484,243],
  [534,268,552,254],[600,218,618,204],[660,143,678,130],
  [722,145,740,132],[790,108,810,92],[840,62,858,50],
];

// ── Sub-components ────────────────────────────────────────────────────────────
function SnowCap({ x, y, size }) {
  const s = size;
  return (
    <g>
      <path d={`M ${x-s*1.1},${y+s*1.6} C ${x-s*1.05},${y+s*0.8} ${x-s*0.6},${y-s*0.2} ${x},${y} C ${x+s*0.6},${y-s*0.2} ${x+s*1.05},${y+s*0.8} ${x+s*1.1},${y+s*1.6} C ${x+s*0.6},${y+s*1.1} ${x},${y+s*1.3} ${x-s*0.6},${y+s*1.1} Z`} fill="white" opacity="0.92"/>
      <path d={`M ${x-s*0.7},${y+s*1.7} C ${x-s*0.6},${y+s*1.0} ${x-s*0.2},${y+s*0.3} ${x+s*0.2},${y+s*0.2} C ${x+s*0.6},${y+s*0.1} ${x+s*0.8},${y+s*0.9} ${x+s*0.7},${y+s*1.7} Z`} fill="white" opacity="0.6"/>
    </g>
  );
}

function Cloud({ x, y, scale = 1, cls = '', opacity = 0.18 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity} className={cls}>
      <ellipse cx="0"   cy="0"   rx="38" ry="15" fill="white"/>
      <ellipse cx="26"  cy="-8"  rx="26" ry="13" fill="white"/>
      <ellipse cx="-24" cy="-6"  rx="24" ry="12" fill="white"/>
      <ellipse cx="10"  cy="-14" rx="18" ry="10" fill="white"/>
      <ellipse cx="-8"  cy="-16" rx="14" ry="9"  fill="white"/>
    </g>
  );
}

function SnowCanvas() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * 1000, y: Math.random() * 1000,
      r: 1.2 + Math.random() * 3, vx: (Math.random() - 0.5) * 0.7,
      vy: 0.6 + Math.random() * 1.6, op: 0.35 + Math.random() * 0.55,
      wb: Math.random() * Math.PI * 2, ws: 0.015 + Math.random() * 0.025,
    }));
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const ctx = canvas.getContext('2d');
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.wb += p.ws; p.x += p.vx + Math.sin(p.wb) * 0.5; p.y += p.vy;
        if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.op})`; ctx.fill();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frame); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="mountain-canvas"/>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Mountain({ board, streaks, badges }) {
  // Update sky once per minute
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const sky  = useMemo(() => skyForTime(now), [now]);
  const laid = useMemo(() => layoutClimbers(board.slice(0, 8)), [board]);

  const skyTop = `rgb(${sky.topRgb.join(',')})`;
  const skyBot = `rgb(${sky.botRgb.join(',')})`;

  // Sun position: arcs east (right) to west (left) across the sky
  const sunAngle = Math.PI * sky.sunProgress;
  const sunX     = 500 + 460 * Math.cos(sunAngle);
  const sunY     = 420 - 480 * Math.sin(sunAngle);
  const sinA     = Math.sin(sunAngle);
  const sunR     = 22 + 18 * (1 - sinA);
  const glowR    = 80 - 40 * sinA;
  const lum      = Math.round(140 + 108 * sinA);
  const sunCol   = `rgb(255,${lum},${Math.max(20, lum - 140)})`;

  const ascentPts = [...WAYPOINTS.map(w => `${w.x},${w.y}`), '980,88'].join(' ');

  return (
    <div className="mountain-wrap">
      <svg
        className="mountain-svg"
        viewBox="0 -80 1000 640"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={skyTop}/>
            <stop offset="100%" stopColor={skyBot}/>
          </linearGradient>
          <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#b0b4c0"/>
            <stop offset="40%"  stopColor="#72788e"/>
            <stop offset="100%" stopColor="#282b3e"/>
          </linearGradient>
          <linearGradient id="farGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6d7fa0"/>
            <stop offset="100%" stopColor="#3a4260"/>
          </linearGradient>
          <linearGradient id="midGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#535c78"/>
            <stop offset="100%" stopColor="#2a2e42"/>
          </linearGradient>
          <radialGradient id="aurora" cx="75%" cy="-10%" r="55%">
            <stop offset="0%"   stopColor="#1ee3cf" stopOpacity={sky.auroraOpacity}/>
            <stop offset="100%" stopColor="#1ee3cf" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="aurora2" cx="15%" cy="-5%" r="45%">
            <stop offset="0%"   stopColor="#9b72ff" stopOpacity={sky.auroraOpacity * 0.8}/>
            <stop offset="100%" stopColor="#9b72ff" stopOpacity="0"/>
          </radialGradient>
          {sky.showSun && (
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={sunCol} stopOpacity="0.65"/>
              <stop offset="55%"  stopColor={sunCol} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={sunCol} stopOpacity="0"/>
            </radialGradient>
          )}
        </defs>

        {/* Sky */}
        <rect x="0" y="-80" width="1000" height="640" fill="url(#sky)"/>
        <rect x="0" y="-80" width="1000" height="400" fill="url(#aurora)"/>
        <rect x="0" y="-80" width="1000" height="360" fill="url(#aurora2)"/>

        {/* Stars — fade out during day */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o * sky.starOpacity}/>
        ))}

        {/* Sun — arcs east to west during daylight hours */}
        {sky.showSun && (
          <>
            <circle cx={sunX} cy={sunY} r={glowR} fill="url(#sunGlow)"/>
            <circle cx={sunX} cy={sunY} r={sunR}  fill={sunCol} opacity="0.92"/>
          </>
        )}

        {/* Clouds */}
        <Cloud x={110} y={42}  scale={1.1}  cls="cloud-1" opacity={sky.cloudOpacity}/>
        <Cloud x={480} y={76}  scale={0.85} cls="cloud-2" opacity={sky.cloudOpacity * 0.9}/>
        <Cloud x={730} y={28}  scale={0.65} cls="cloud-3" opacity={sky.cloudOpacity}/>
        <Cloud x={300} y={-20} scale={0.5}  cls="cloud-2" opacity={sky.cloudOpacity * 0.75}/>

        {/* Background mountain layers */}
        <path d={FAR_MOUNTAINS} fill="url(#farGrad)" opacity="0.38"/>
        <path d={MID_MOUNTAINS} fill="url(#midGrad)" opacity="0.62"/>

        {/* Main mountain */}
        <path d={MAIN_MOUNTAIN} fill="url(#rockGrad)"/>
        {ROCK_STROKES.map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e2030" strokeWidth="2.5" opacity="0.28" strokeLinecap="round"/>
        ))}
        <path d={MAIN_MOUNTAIN} fill="none" stroke="#363a52" strokeWidth="1.5" opacity="0.6"/>

        {/* Snow caps */}
        <SnowCap x={280} y={370} size={12}/>
        <SnowCap x={460} y={265} size={14}/>
        <SnowCap x={660} y={150} size={17}/>
        <SnowCap x={860} y={48}  size={22}/>

        {/* Summit flag */}
        <line x1="860" y1="48" x2="860" y2="16" stroke="#f4b942" strokeWidth="2.5"/>
        <path d="M 860,16 L 884,22 L 860,28 Z" fill="#f4b942"/>

        {/* Animated ascent trail */}
        <polyline points={ascentPts} fill="none" stroke="rgba(244,214,80,0.65)" strokeWidth="2" strokeDasharray="8 7" className="trail-anim"/>

        {/* Tier labels */}
        {TIERS.slice(1).map((tier, i) => {
          const wp  = WAYPOINTS[i + 1];
          const lbl = `${tier.name} · ${tier.min}`;
          const w   = lbl.length * 5.8 + 14;
          return (
            <g key={tier.name}>
              <rect x={wp.x - w/2} y={wp.y - 32} width={w} height={17} rx={5} fill="rgba(6,7,24,0.72)"/>
              <text x={wp.x} y={wp.y - 20} textAnchor="middle" fill={tier.color} fontSize={10.5} fontFamily="IBM Plex Mono, monospace">{lbl}</text>
            </g>
          );
        })}
        <text x={55} y={548} fill="#9ba3bc" fontSize={10} fontFamily="IBM Plex Mono, monospace">Trailhead</text>
      </svg>

      <SnowCanvas/>

      {board.length === 0 && (
        <div className="empty" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', color:'rgba(255,255,255,0.6)' }}>
          No one has started the climb yet. Log the first activity.
        </div>
      )}

      {laid.map(({ climber, pos }, idx) => {
        const { left, top }   = svgToPercent(pos.x, pos.y);
        const tier            = tierForPoints(climber.points);
        const streak          = streaks[climber.name] || 0;
        const myBadges        = badges[climber.name] ? Array.from(badges[climber.name]) : [];
        const badgeNames      = myBadges.map(id => BADGE_DEFS.find(b => b.id === id)?.name).filter(Boolean).join(', ') || 'No badges yet';
        const elevation       = elevationForPoints(climber.points);
        const flipTip         = top < 28;

        return (
          <div key={climber.name} className={`climber-tag${flipTip ? ' flip-tip' : ''}`} style={{ left: `${left}%`, top: `${top}%` }}>
            <div className="climber-tooltip">
              <strong>{climber.name}</strong>
              {climber.team} · {tier.name}<br/>
              Elevation: {elevation}<br/>
              {badgeNames}
            </div>
            <ClimberFigure teamColor={colorForTeam(climber.team)} name={climber.name} tierColor={tier.color} isLeader={idx === 0} size={28}/>
            <div className="climber-label">{climber.points} pts{streak >= 2 ? ` · ${streak}wk` : ''}</div>
          </div>
        );
      })}
    </div>
  );
}
