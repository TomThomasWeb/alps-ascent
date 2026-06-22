import { useState } from 'react';

export default function SettingsModal({ currentLabel, onSave, onClose }) {
  const [pw,    setPw]    = useState('');
  const [label, setLabel] = useState(currentLabel);
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const handleSave = async () => {
    if (!pw.trim())    { setErr('Enter the admin password.'); return; }
    if (!label.trim()) { setErr('Label cannot be empty.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, label: label.trim() }),
      });
      if (r.ok) { onSave(label.trim()); onClose(); }
      else { const d = await r.json(); setErr(d.error || 'Failed to save.'); }
    } catch { setErr('Request failed. Check your connection.'); }
    setBusy(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Edit challenge label</h3>
        <p>
          This shows in the header under The Ascent title. Use it to name the
          current challenge period — there's no fixed quarter system, just
          whatever you want it to say until the next reset.
        </p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Label text</label>
          <input
            type="text"
            value={label}
            onChange={e => { setLabel(e.target.value); setErr(''); }}
            placeholder="e.g. Q3 2026 · Alps LinkedIn Challenge"
            maxLength={80}
            autoFocus
          />
        </div>
        <div className="field">
          <label>Admin password</label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
            placeholder="Enter password..."
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>
        <div className="modal-err">{err}</div>
        <div className="modal-btns">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={busy}>
            {busy ? 'Saving...' : 'Save label'}
          </button>
        </div>
      </div>
    </div>
  );
}
