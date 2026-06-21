# Electoral Systems Simulator

A single-page web app that teaches how different voting methods work by running
real simulated elections on a spatial (political-compass) voter model and
comparing the outcomes side by side.

## Stack

- React 19 + TypeScript (functional components / hooks only)
- Vite build tool
- Tailwind CSS v4 (utility classes; theme colors via tokens)
- Recharts for bar charts

## Scripts

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # typecheck (tsc -b) + production build
npm run typecheck
npm run lint
npm run preview  # preview the production build
```

> Note: this environment's `node`/`npm` live in `C:\Program Files\nodejs`. If
> they aren't on your PATH, prepend that directory first.

## Project layout

```
src/
├── App.tsx                 # Layout shell: scenarios, compass, panels, verdict
├── main.tsx                # React entry point
├── theme.ts                # Light/dark theme tokens + candidate palette
├── types.ts                # Shared interfaces
├── constants.ts            # Method labels + educational copy
├── algorithms/             # Pure voting algorithms (no side effects)
│   ├── spatialModel.ts     #   voter/candidate generation (Box-Muller)
│   ├── plurality.ts  irv.ts  stv.ts  approval.ts  borda.ts  condorcet.ts
│   └── runElection.ts      #   runs all active methods, reports agreement
├── scenarios/presets.ts    # Preset + random scenario configs
├── components/             # PoliticalCompass, VoteChart, MethodPanel, …
└── hooks/                  # useElection (state machine) + useTheme
```

## Status

Complete and runnable. All six voting algorithms (Plurality, IRV, STV/Gregory,
Approval, Borda, Condorcet/Copeland), the spatial model, every preset scenario,
light/dark theming, the political compass, method result panels, STV/IRV round
stepping, and the verdict panel.

The Custom Scenario builder (`components/ScenarioBuilder.tsx`) is fully featured:
add/remove/rename candidates, drag candidate markers directly on a live-preview
compass, edit voter blocs (position, size, spread) with bloc ellipses shown, a
live voter-count readout, and validation warnings (too few candidates/voters,
fully-overlapping blocs).
