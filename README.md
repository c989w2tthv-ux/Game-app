# Gloambreak

A local-first life RPG for iPhone. You answer questions about yourself, and the app builds:

1. **A development plan.** Up to three paths (fitness, career, money, relationships, learning, mindfulness and more). Each path has four milestones with target dates, daily quests, and a final "trial" task to finish each milestone.
2. **A hero.** An avatar drawn from your build, height, skin tone and hair. You get a class (Warden, Arcanist, Artificer, Coinwright, Envoy, Mystic) and starting attributes based on your self-rated skills.
3. **A fantasy realm.** Each path becomes a region covered by the Gloam, a grey fog. Doing real-life quests clears the fog and rebuilds landmarks, and the capital grows from a ruined camp into a citadel. If you skip days, the fog creeps back.
4. **Game rewards, separate from the plan.** You earn XP, levels, gold, attributes, titles and loot. Rewards grow with quest difficulty, your level and your streak. Gold buys real-life rewards that you define in the Market.

Everything runs on the device. There is no account, no server and no tracking. Data is stored in `localStorage`, and you can back it up or restore it as a JSON file.

## How the plan is personalised

| Input | Effect |
|---|---|
| Skill ratings, activity level, age | How hard quests are (reps, distance, pages) and your starting attributes |
| Occupation, field, chosen skill/language | Inserted into career, credential and learning quests |
| Minutes per day | Divided across your paths to set each quest's length |
| Plan length (3/6/12 months) | How many quests each milestone needs, and the target dates |
| Patience trait | Chapter length (longer for patient players, quicker wins for impatient ones) |
| Social trait | Solo or group version of quests (e.g. "run alone" vs "join a running club") |
| Order of paths picked | Your class; the second path or your strongest trait sets your title |

## Install on iPhone

### Option A: home-screen app (no Mac needed)
1. Host the `www/` folder over HTTPS. This repo includes `.github/workflows/pages.yml`: in the repo, open **Settings → Pages**, set **Source: GitHub Actions**, then push to `main`.
2. On the iPhone, open the site in **Safari**, tap **Share → Add to Home Screen**.
3. It opens full-screen with its own icon and works offline after the first load.

### Option B: native app via Xcode (Capacitor)
Requires a Mac with Xcode.
```sh
npm install
npm run ios:add     # first time only, creates ios/
npm run ios:sync    # after any change in www/
npm run ios:open    # opens Xcode; pick your device and press Run
```

## Run locally
```sh
npm start            # or: cd www && python3 -m http.server 8080
```
Then open http://localhost:8080. Use your browser's device toolbar to view it at phone size.

## Code layout
```
www/
  index.html, styles.css, manifest.webmanifest, sw.js (offline cache)
  js/data.js     questionnaire, 20 paths × 4 milestones, world names, loot tables
  js/planner.js  answers → plan, hero class and attributes
  js/world.js    realm generation and the SVG map
  js/avatar.js   SVG avatar from physical answers, class and gear
  js/game.js     daily quest board, XP/levels, loot, streaks, Gloam effects
  js/app.js      screens and interaction
  js/store.js    local save, backup and restore
```
To add a new path, add an entry to `TRACKS` in `www/js/data.js`. It will show up in the questionnaire automatically.
