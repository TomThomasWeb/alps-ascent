# The Alps Ascent

A gamified LinkedIn engagement leaderboard for the Alps team. Built with React + Vite, deployed on Vercel, with persistent storage via Vercel KV.

---

## Deploying from scratch

### 1. Prerequisites

- Node.js 18+ installed locally
- A GitHub account
- A Vercel account (vercel.com)
- Vercel CLI: `npm install -g vercel`

### 2. First-time setup

```bash
# Clone / push this folder to a GitHub repo first, then:

npm install
vercel login
vercel link          # Connect to your Vercel project (or create a new one)
```

### 3. Set up Vercel KV storage

1. Go to your Vercel dashboard → **Storage** → **Create Database**
2. Choose **KV** (powered by Upstash)
3. Name it something like `alps-ascent-kv`
4. Click **Connect** to link it to your project
5. Pull the credentials to your local machine:

```bash
vercel env pull .env.local
```

This creates a `.env.local` file with the KV credentials Vercel injected automatically. Never commit this file.

### 4. Local development

```bash
npm run dev
# This runs `vercel dev` which serves both the Vite frontend and the /api routes together
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to production

```bash
# Option A: Push to GitHub — Vercel auto-deploys on every push to main
git add . && git commit -m "Initial deploy" && git push

# Option B: Deploy directly
vercel --prod
```

---

## Environment variables

| Variable | Where it comes from |
|---|---|
| `KV_REST_API_URL` | Auto-injected by Vercel when you link the KV store |
| `KV_REST_API_TOKEN` | Auto-injected by Vercel |
| `KV_REST_API_READ_ONLY_TOKEN` | Auto-injected by Vercel |
| `KV_URL` | Auto-injected by Vercel |
| `RESET_PASSWORD` | **Set this manually** in Vercel dashboard → Settings → Environment Variables |

To change the reset password from the default (`ThomasAlps01!`), add `RESET_PASSWORD` as an environment variable in your Vercel project settings, then redeploy.

---

## Project structure

```
alps-ascent/
├── api/
│   ├── entries.js      GET/POST/DELETE entries (stored in Vercel KV)
│   └── reset.js        POST to reset — password checked server-side
├── src/
│   ├── App.jsx         Main layout, state management, polling, GSAP entrance
│   ├── constants.js    Team rosters, actions, tiers, badge definitions, SVG coords
│   ├── compute.js      All scoring/leaderboard/badge calculation functions
│   ├── index.css       Full dark glassmorphism design system
│   └── components/
│       ├── Mountain.jsx       Multi-layer SVG landscape + canvas snow + climbers
│       ├── ClimberFigure.jsx  Detailed mountaineer SVG by team colour
│       ├── Leaderboard.jsx    Individual standings table
│       ├── Podium.jsx         Top 3 with GSAP entrance animations
│       ├── Basecamps.jsx      Team standings (avg pts/head)
│       ├── Spotlight.jsx      Weather strip, fastest climber, longest streak
│       ├── LogActivity.jsx    Activity log form + recent activity list
│       ├── Guide.jsx          Points guide, tiers, badges, rules
│       ├── SummitBanner.jsx   Tier-up / leader-change notification banner
│       └── ResetModal.jsx     Password-protected quarter reset modal
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## Quarterly reset process

1. Go to **Log Activity** tab
2. Scroll to **Danger zone** and click **Reset leaderboard**
3. Enter the admin password
4. All entries are cleared from the KV store — the mountain empties and climbers start again

---

## Adding staff to the roster

Edit `src/constants.js` → `ROSTERS` object. Each key is a team name, each value is an array of full names.
