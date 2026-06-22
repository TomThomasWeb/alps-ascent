import { useState } from 'react';

export default function ResetModal({ onConfirm, onClose }) {
  const [pw,  setPw]  = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!pw) { setErr('Please enter the admin password.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) { onConfirm(); }
      else { setErr('Incorrect password.'); }
    } catch {
      setErr('Request failed. Check your connection.');
    }
    setBusy(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Reset the leaderboard</h3>
        <p>
          This will permanently clear all activity for the current quarter.
          Enter the admin password to continue.
        </p>
        <div className="field">
          <label>Admin password</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
            placeholder="Enter password..."
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <div className="modal-err">{err}</div>
        <div className="modal-btns">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Resetting...' : 'Yes, reset everything'}
          </button>
        </div>
      </div>
    </div>
  );
}
