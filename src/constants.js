export const ACTIONS = [
  { id: 'like',               label: 'Liked an Alps post',                              points: 1, note: 'Soft cap: roughly 5 per week' },
  { id: 'comment',            label: 'Commented on an Alps post',                       points: 2, note: 'A real sentence, not just an emoji' },
  { id: 'repost',             label: 'Reposted an Alps post as-is',                     points: 2, note: '' },
  { id: 'repost_thoughts',    label: 'Reposted with your own take added',               points: 4, note: 'The one that actually extends our reach' },
  { id: 'personal_post',      label: 'Personal post (general / industry)',              points: 3, note: 'Soft cap: 1 per day' },
  { id: 'personal_post_alps', label: 'Personal post about Alps or our products',        points: 6, note: 'The flagship action. Soft cap: 1 per day' },
  { id: 'event_content',      label: 'Shared event or webinar photo/video',             points: 6, note: '' },
  { id: 'milestone',          label: 'A post of mine hit 50+ reactions or 10+ comments', points: 3, note: 'Bonus on top of posting points' },
];

export const ROSTERS = {
  Marketing: ['Tom Thomas'],
  Sales: ['Hannah Shuttleworth', 'Will Crowcroft', 'David Sierzega'],
  SLT: ['Julian Tomlinson', "Michelle O'Reilly", 'Carole Ashman', 'Nick Hewitt', 'Nick Copley', 'Martin Green'],
  Claims: ['Beckii Vigrass', 'Chloe Harding', 'Hayley Goddard', 'Jonathan Copley', 'Kara Newton', 'Lucy Blakeman', 'Marissa Clarke', 'Matt Daish', 'Rebecca Rosemin', 'Simon Buxton', 'Sophie Dickson'],
  Accounts: ['Alison Leigh', 'Jo Ravenscroft', 'Michelle Quartley', 'Ruth Saunders'],
  IT: ['David Birchall', 'Mark Wilcox'],
};

export const TEAM_COLORS = {
  Marketing: '#ff6f4d',
  Sales:     '#e14f8a',
  SLT:       '#f4b942',
  Claims:    '#1ee3cf',
  Accounts:  '#9b72ff',
  IT:        '#4fc3f7',
  Other:     '#9ba3bc',
};

export const TIERS = [
  { min: 0,   name: 'Trailhead',    color: '#9ba3bc' },
  { min: 10,  name: 'Basecamp',     color: '#1ee3cf' },
  { min: 30,  name: 'Ridge Walker', color: '#ff6f4d' },
  { min: 60,  name: 'Summit Push',  color: '#e14f8a' },
  { min: 100, name: 'Peak Climber', color: '#f4b942' },
];

export const BADGE_DEFS = [
  // Original badges
  { id: 'first_climb',  name: 'First Climb',        color: '#1ee3cf', desc: 'Logged your very first activity this quarter.' },
  { id: 'storyteller',  name: 'Storyteller',         color: '#f4b942', desc: 'Posted about Alps or products 3+ times in a single month.' },
  { id: 'squad_goals',  name: 'Squad Goals',         color: '#e14f8a', desc: 'Your whole team logged an activity in the same week.' },
  // New badges
  { id: 'early_bird',   name: 'Early Bird',          color: '#f4b942', desc: 'First person to log an activity in a given week.' },
  { id: 'comeback',     name: 'Comeback',            color: '#9b72ff', desc: 'Returned to the challenge after a 3+ week absence.' },
  { id: 'peak_bagger',  name: 'Peak Bagger',         color: '#f4b942', desc: 'Reached Peak Climber tier — 100 points or more.' },
  { id: 'consistent',   name: 'Consistent Climber',  color: '#1ee3cf', desc: 'Logged at least once a week for 4 consecutive weeks.' },
  { id: 'chatterbox',   name: 'Chatterbox',          color: '#e14f8a', desc: 'Left 10 or more genuine comments on Alps posts.' },
];

// Mountain coordinate system: viewBox="0 -80 1000 640"
export const WAYPOINTS = [
  { score: 0,   x: 40,  y: 530 },
  { score: 10,  x: 280, y: 370 },
  { score: 30,  x: 460, y: 265 },
  { score: 60,  x: 660, y: 150 },
  { score: 100, x: 860, y: 48  },
];
export const EXTENSION  = { x: 980, y: 88 };
export const VB_W       = 1000;
export const VB_H       = 640;
export const VB_Y_OFFSET = 80;

export const STARS = Array.from({ length: 32 }, (_, i) => ({
  x: (i * 137.508) % 1000,
  y: -75 + (i * 53.2) % 90,
  r: 0.6 + (i % 3) * 0.5,
  o: 0.25 + (i % 4) * 0.15,
}));
