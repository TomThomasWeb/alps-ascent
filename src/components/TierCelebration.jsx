import { useState, useEffect } from 'react';
import ClimberFigure from './ClimberFigure';
import { colorForTeam } from '../compute';

const TIER_TAGLINES = {
  'Basecamp':     'The first real foothold. The view starts here.',
  'Ridge Walker': 'Above the treeline now. Others can see you.',
  'Summit Push':  'The hard part. Most people stop before this.',
  'Peak Climber': 'The summit. Not many make it this far.',
};

export default function TierCelebration({ name, tier, team, onClose }) {
  const [countdown, setCountdown] = useState(6);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { onClose(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onClose]);

  const shareMsg =
    `${name} just reached ${tier.name} on the Alps Ascent challenge 🏔️\n` +
    `${TIER_TAGLINES[tier.name] || ''}\n\nhttps://www.linkedin.com/company/alps-ltd`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareMsg); }
    catch { /* fallback: do nothing */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div className="celebration-card" onClick={e => e.stopPropagation()}>

        {/* Climber in tier-coloured ring */}
        <div className="celebration-ring" style={{ borderColor: tier.color, boxShadow: `0 0 0 6px ${tier.color}22` }}>
          <ClimberFigure
            teamColor={colorForTeam(team)}
            name={name}
            tierColor={tier.color}
            isLeader={false}
            size={72}
          />
        </div>

        {/* Tier label */}
        <div className="celebration-tier" style={{ color: tier.color }}>
          {tier.name}
        </div>

        <div className="celebration-name">{name}</div>

        <div className="celebration-tagline">
          {TIER_TAGLINES[tier.name] || 'A new tier reached on the mountain.'}
        </div>

        {/* Share */}
        <button className="btn-primary celebration-share" onClick={handleCopy}>
          {copied ? 'Copied to clipboard' : 'Copy share message'}
        </button>

        <div className="celebration-dismiss">
          Closes in {countdown}s · click anywhere to dismiss
        </div>
      </div>
    </div>
  );
}
