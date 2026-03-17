# 2026 March Madness Bracket Picker

AI-powered matchup analysis for every game of the 2026 NCAA Tournament. Pick your way through all 67 matchups from the First Four to the Championship.

## Features
- **Upset Tolerance selector** — choose your bracket personality (By the Books → Bracket Arsonist)
- **AI recommendations** with confidence ratings for every matchup
- **Full 68-team database** with KenPom rankings, injury reports, coaching ratings, and momentum scores
- **Dynamic analysis engine** — later rounds generate matchup analysis based on your picks
- **Region-by-region navigation** for the Round of 64 and Round of 32
- **100% static** — no API calls, no backend, no costs

## Deploy to Vercel (fastest — ~2 minutes)

### Option A: From GitHub (recommended)
1. Push this folder to a new GitHub repo:
   ```bash
   cd bracket-app
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create march-madness-bracket --public --source=. --push
   ```
   (Or create the repo on github.com and push manually)

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click **"Add New Project"** → Import your `march-madness-bracket` repo

4. Vercel auto-detects Vite. Just click **Deploy**.

5. Done. You'll get a URL like `march-madness-bracket.vercel.app`

### Option B: Vercel CLI (if you have it installed)
```bash
cd bracket-app
npx vercel
```
Follow the prompts. Takes about 30 seconds.

## Local Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`

## Tech Stack
- React 19 + Vite
- Zero dependencies beyond React
- All data baked into the component — no API calls, no backend
