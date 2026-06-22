import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = 'ascent:settings:v1';
const DEFAULTS = { label: 'Alps LinkedIn Challenge' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const settings = (await redis.get(KEY)) || DEFAULTS;
      return res.json(settings);
    }
    if (req.method === 'POST') {
      const { password, label } = req.body || {};
      if (password !== (process.env.RESET_PASSWORD || 'ThomasAlps01!'))
        return res.status(401).json({ error: 'Incorrect password' });
      if (!label?.trim())
        return res.status(400).json({ error: 'Label cannot be empty' });
      const settings = { label: label.trim() };
      await redis.set(KEY, settings);
      return res.json({ ok: true, settings });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Storage error' });
  }
}
