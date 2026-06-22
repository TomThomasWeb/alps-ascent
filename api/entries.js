import { kv } from '@vercel/kv';

const KEY = 'ascent:entries:v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const entries = (await kv.get(KEY)) || [];
      return res.json(entries);
    }
    if (req.method === 'POST') {
      const entry = req.body;
      if (!entry?.name || !entry?.actionId) return res.status(400).json({ error: 'Invalid entry' });
      const entries = (await kv.get(KEY)) || [];
      entries.push(entry);
      await kv.set(KEY, entries);
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const entries = (await kv.get(KEY)) || [];
      await kv.set(KEY, entries.filter(e => e.id !== id));
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Storage error' });
  }
}
