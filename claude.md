# Claude Code Prompt: Electoral Systems Simulator

## Project Overview

Build a production-ready, single-page web application called **Electoral Systems Simulator** that teaches users how different voting methods work by letting them run real simulated elections, step through results interactively, and compare outcomes side by side. The app uses a spatial voting model (political compass) to generate realistic voter distributions and candidate placements, then runs multiple voting algorithms on the same electorate simultaneously so users can see directly how the choice of voting system changes — or doesn't change — who wins.

The primary audience is curious citizens, political science students, activists, and third-party political organizations exploring electoral reform. The app should feel like a serious civic tool, not a toy — clean, credible, and fast.

---

## Tech Stack

- **Framework:** React (functional components, hooks only — no class components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (utility classes only; no custom CSS files)
- **Charts:** Recharts
- **Build tool:** Vite
- **No backend required** — all computation is client-side

Do not use any UI component library (no shadcn, MUI, Chakra, etc.). Build all UI primitives from scratch using Tailwind.

---

## Core Requirements

### 1. Responsive Layout — Mobile and Desktop

- The app must be fully usable on screens as narrow as 360px and as wide as 1440px.
- On **mobile** (< 768px): all panels stack vertically. The political compass map renders at full width. Charts collapse to a single scrollable column. The round navigator uses compact icon buttons.
- On **desktop** (≥ 768px): the political compass and control panel sit side by side. Voting method result columns render in a horizontal grid (2–4 columns depending on how many methods are active).
- Touch targets must be at least 44×44px on mobile. Sliders must be usable by thumb.
- Test that the app works correctly on both viewport sizes before considering any feature complete.

### 2. Light and Dark Theme

- Implement a theme toggle (sun/moon icon) in the top-right corner that switches between light and dark mode.
- Persist the user's preference in `localStorage`.
- Respect the OS `prefers-color-scheme` media query as the default if no stored preference exists.
- Define a token system for both themes. Every color in the app must reference a token — no hardcoded hex values in component JSX. Example token structure:

```ts
const themes = {
  dark: {
    bg: '#070A13',
    surface: '#0C1120',
    border: '#172038',
    text: '#CBD5E1',
    textDim: '#475569',
    textVeryDim: '#1E293B',
    accent: '#60A5FA',
    accentAlt: '#C084FC',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FBBF24',
    compassBg: '#060A13',
  },
  light: {
    bg: '#F1F5F9',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textDim: '#64748B',
    textVeryDim: '#CBD5E1',
    accent: '#2563EB',
    accentAlt: '#7C3AED',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    compassBg: '#E8EDF5',
  },
};
```

- Candidate colors must remain vivid in both themes — use the same saturated palette in both modes but adjust opacity of backgrounds and borders.

### 3. Voting Methods

Implement all of the following voting algorithms. Each method must run on the same set of voters and candidates, producing independent results that can be compared simultaneously.

#### A. Plurality (First-Past-the-Post)
The current system used for most U.S. elections. Each voter casts one vote for their first-choice candidate. The top N candidates by raw vote count win (where N = number of seats). No transfers, no rounds. Display as a single-round bar chart.

#### B. Instant Runoff Voting (IRV) — Single Winner
Voters rank all candidates. If no candidate has a majority (>50%), the last-place candidate is eliminated and their ballots transfer to the voters' next choices. Repeat until one candidate has a majority. IRV is always single-seat. If the user has selected more than 1 seat, note that IRV is single-winner only and run it for seat 1 only, clearly labeled.

#### C. Single Transferable Vote (STV) — Multi-Winner Ranked Choice
The multi-seat extension of IRV using the Droop quota. Implement the Gregory fractional transfer method:
- Droop quota = `floor(totalVoters / (seats + 1)) + 1`
- Count first-preference votes. If any candidate meets the quota, elect them. Compute surplus = votes − quota. Redistribute that candidate's ballots to their voters' next choices at weight = surplus / totalVotesForCandidate.
- If no candidate meets quota, eliminate the lowest vote-getter and redistribute their ballots (at full current weight) to next valid preferences.
- Continue until all seats are filled or remaining candidates equal remaining seats (auto-elect).
- Show round-by-round with a step navigator.

#### D. Approval Voting
Voters "approve" every candidate within a set distance threshold on the political compass (simulating "acceptable" candidates). The threshold is configurable in Advanced Options (default: 0.4 units). Each approved candidate gets one vote per approving voter. Top N candidates by approval count win. Single-round display.

#### E. Borda Count
Each voter awards points to candidates based on ranking: for N candidates, first choice gets N−1 points, second choice gets N−2, and so on down to 0. Sum all points. Top N candidates by total points win. Single-round display, shown as a points bar chart.

#### F. Condorcet (Copeland's Method)
Run every possible head-to-head matchup between candidates. A candidate wins a matchup if more voters prefer them over their opponent. Score each candidate by wins minus losses. Top N candidates by Copeland score win. Display as a matchup matrix in addition to the bar chart.

Each method panel must show:
- Its name and a one-sentence plain-English description
- The result (who won, how many votes/points/score)
- A visual indicator of which winners overlap with other methods and which are unique to this method
- A "Why it differs" callout that appears when this method's winners diverge from plurality

The user must be able to toggle any method on or off independently. At least two must be active at all times.

### 4. Scenarios

Provide a scenario selector that pre-configures the election to illustrate a specific phenomenon. The scenarios are:

#### A. Random Election (Default)
Candidates and voter clusters placed randomly using the spatial voting model. Voters: 500. Cluster count: 3–6 random.

#### B. The Spoiler Effect
Two ideologically similar candidates (placed close together on the compass) split a large voter bloc, allowing a third candidate from the opposite side to win under plurality — even though the majority of voters preferred either of the similar candidates over the winner. Classic example of why third-party candidates are called "spoilers." Configure with 3 candidates, 1 seat.

#### C. Majority Minority Representation
A minority voter bloc (≈30% of voters) is geographically concentrated in one area of the political compass. Under plurality with a single winner, their candidate loses. Under STV with 3 seats, they earn representation proportional to their share. Configure with 5 candidates, 3 seats.

#### D. The Centrist Penalty
A centrist candidate is nobody's first choice but everybody's second choice — they would beat any other candidate head-to-head yet lose under plurality because they never top a ranked list. Condorcet and Borda favor them; plurality and IRV may not. Configure with 5 candidates, 1 seat.

#### E. Proportional Showcase
Five distinct voter blocs of roughly equal size, each clustered around a different candidate. Under plurality (or top-N plurality), the largest bloc dominates. Under STV with proportional seats, each major bloc earns roughly one seat. Configure with 5 candidates, 4 seats.

#### F. Landslide
One candidate commands a dominant majority (60–70%) of voters uniformly distributed near their position. All methods agree. Useful as a baseline showing when system choice doesn't matter.

#### G. Custom Scenario *(Advanced)*
User-designed election. See Advanced Options section below.

### 5. Minimal UI with Progressive Disclosure

The default interface must be clean and uncluttered:

**Minimal (default) view:**
- Scenario selector (dropdown or pill tabs)
- Generate / Regenerate button
- Political compass map
- Active voting method result panels (2 columns on desktop, stacked on mobile)
- Round navigator (for STV and IRV only, appears only when relevant)
- Verdict panel (appears after final round)

**Advanced Options panel** (collapsed by default, toggled by a single "Advanced" button):
- Number of candidates slider (3–10)
- Number of seats slider (1–5, capped at candidates − 1)
- Total voters input (100–2000)
- Voter cluster count slider (1–8)
- Approval voting threshold slider (0.1–0.9)
- Voting method toggles (checkboxes for each of the 6 methods)
- Custom Scenario builder (see below)

Do not show Advanced Options content until the user clicks the toggle. Animate the panel open/closed with a smooth height transition.

### 6. Custom Scenario Builder *(Inside Advanced Options)*

When the user selects "Custom Scenario," the Advanced Options panel expands to reveal a scenario editor:

**Candidate editor:**
- A list of candidate rows. Each row shows: color swatch, name input, and an "X" remove button.
- The user can drag candidate markers directly on the political compass to reposition them.
- "Add Candidate" button (up to 10 candidates).
- Candidate names default to generic placeholders ("Candidate A", etc.) but are user-editable.

**Voter bloc editor:**
- A list of voter bloc rows. Each row shows: position (X, Y sliders from −1 to 1), size (voter count), spread (standard deviation, 0.05–0.5), and an "X" remove button.
- "Add Voter Bloc" button (up to 8 blocs).
- Total voter count shown dynamically as blocs are added/modified.
- Blocs are shown on the compass as translucent ellipses indicating their spread.

**Validation:**
- Warn (but don't block) if total voters < 50.
- Warn if all voter blocs overlap perfectly (produces unrealistic results).
- Require at least 2 candidates.
- Show a live preview of the compass as the user edits.

---

## Political Compass Map

The compass is the visual centerpiece of the app. Requirements:

- Rendered as an SVG element, responsive width, fixed aspect ratio 1:1.
- X-axis: Economic Left ← → Economic Right
- Y-axis: Liberal (top) ← → Conservative (bottom)
- Four quadrant background tints: subtle, different for each quadrant (blue-ish top-left, red-ish top-right, green-ish bottom-left, amber-ish bottom-right). These must work in both light and dark theme.
- Axis lines and quadrant labels.
- Voter dots: radius 1.8px, colored by first-choice candidate, opacity 0.28. Render all voters.
- Candidate markers: circles, radius 10px. Show candidate initial or index letter inside. Border highlights when elected (gold in dark mode, dark blue in light mode). Gray and faded when eliminated.
- Winner crown emoji (🏆) overlaid on elected candidates.
- In Custom Scenario mode: candidates are draggable. Voter bloc ellipses are shown.
- The compass updates live as rounds progress (candidates gray out when eliminated, get crowned when elected).
- On mobile the compass renders at full container width with a max of 400px.

---

## Spatial Voting Model

Use this model to generate all non-custom elections:

```
function normalRandom(mean, std):
  Box-Muller transform → N(mean, std²)

For each voter cluster c:
  cx, cy = random in [-0.75, 0.75]
  For each voter in cluster:
    vx = clamp(normalRandom(cx, spread), -1, 1)
    vy = clamp(normalRandom(cy, spread), -1, 1)
    preferences = candidates sorted ascending by Euclidean distance from (vx, vy)

For approval voting:
  voter approves candidate c if euclidean(voter, c) < approvalThreshold
```

Default spread per cluster: 0.19. Scenario-specific spreads are defined per scenario.

---

## Round Navigation (STV and IRV)

- Show numbered round buttons. Each button is color-coded: green for rounds where a candidate was elected, red for rounds where a candidate was eliminated.
- Prev / Next buttons.
- Clicking a round number jumps directly to that round's state.
- The compass and all charts update to reflect the selected round's state.
- An action banner above the charts describes what happened in the selected round in plain English.
- The plurality, Borda, Approval, and Condorcet panels do not change between rounds — they always show their final result — but are visually de-emphasized (reduced opacity) while the user is stepping through STV/IRV rounds, to reinforce that those methods are single-round.

---

## Verdict Panel

Appears after the final round of STV/IRV (or immediately for single-round methods if those are the only active methods):

- Side-by-side winner lists for each active method.
- Candidates who won under all active methods are shown in neutral color.
- Candidates who won under some but not all methods are highlighted, with a tag indicating which method elected them.
- A plain-English explanation of why the outcomes differed (or didn't).
- A "Run Another Election" button (regenerates with same settings).
- A session statistics line: "X elections run · Y produced different winners across methods."

---

## Session Stats

Track across the session (in component state, not persisted):
- Total elections run
- Number of elections where all methods agreed on winners
- Number of elections where at least one method differed

Display compactly below the app title. Reset when the page is refreshed.

---

## Candidate Colors

Use this fixed palette, in order, for candidates 1–10. These must remain distinguishable in both light and dark mode:

```
1. #FBBF24  (amber)
2. #60A5FA  (sky blue)
3. #4ADE80  (green)
4. #F87171  (red)
5. #C084FC  (purple)
6. #F472B6  (pink)
7. #FB923C  (orange)
8. #22D3EE  (cyan)
9. #A3E635  (lime)
10. #818CF8 (indigo)
```

---

## Performance Requirements

- The app must remain responsive (no jank) with up to 2,000 voters.
- Pre-compute all election rounds upfront when "Generate" is clicked — do not recompute on each round step.
- SVG voter dots must render without causing layout thrash. Use `will-change: transform` on the SVG container if needed.
- Chart animations: disable recharts' built-in bar animations (set `isAnimationActive={false}`) to avoid visual noise during round stepping.

---

## Accessibility

- All interactive elements must have visible focus rings.
- Color is never the sole differentiator — always pair color with a label, icon, or pattern.
- Round action banners must have sufficient contrast in both themes (WCAG AA minimum).
- The theme toggle must be keyboard-accessible.
- Sliders must have visible value labels.
- `aria-label` on all icon-only buttons.

---

## File Structure

```
src/
├── main.tsx
├── App.tsx                    # Root: theme provider, layout shell
├── theme.ts                   # Token definitions for dark/light
├── types.ts                   # Shared TypeScript interfaces
├── algorithms/
│   ├── spatialModel.ts        # Voter/candidate generation
│   ├── plurality.ts
│   ├── irv.ts
│   ├── stv.ts
│   ├── approval.ts
│   ├── borda.ts
│   └── condorcet.ts
├── scenarios/
│   └── presets.ts             # All scenario configurations
├── components/
│   ├── PoliticalCompass.tsx   # SVG map
│   ├── VoteChart.tsx          # Recharts bar chart, shared
│   ├── CondorcetMatrix.tsx    # Head-to-head matchup grid
│   ├── MethodPanel.tsx        # Wrapper for one voting method's results
│   ├── RoundNavigator.tsx     # Round buttons + prev/next
│   ├── ActionBanner.tsx       # Round action description
│   ├── VerdictPanel.tsx       # Final comparison
│   ├── AdvancedOptions.tsx    # Collapsible panel
│   ├── ScenarioBuilder.tsx    # Custom scenario editor
│   └── ThemeToggle.tsx
└── hooks/
    ├── useElection.ts         # Core state machine for an election run
    └── useTheme.ts            # Theme detection + toggle + persistence
```

---

## Key TypeScript Interfaces

```ts
interface Candidate {
  id: number;
  name: string;
  color: string;
  x: number;  // -1 to 1
  y: number;  // -1 to 1
}

interface Voter {
  x: number;
  y: number;
  preferences: number[];  // candidate IDs, sorted by proximity
  approves: number[];     // candidate IDs within approval threshold
}

interface ElectionConfig {
  candidates: Candidate[];
  voters: Voter[];
  seats: number;
  approvalThreshold: number;
  activeMethods: VotingMethod[];
}

type VotingMethod = 'plurality' | 'irv' | 'stv' | 'approval' | 'borda' | 'condorcet';

interface Round {
  roundNumber: number;
  counts: Record<number, number>;
  elected: number[];
  eliminated: number[];
  action: 'elect' | 'eliminate' | 'elect_remaining';
  targets: number[];
  quota?: number;
  log: string;
}

interface MethodResult {
  method: VotingMethod;
  winners: number[];
  rounds?: Round[];      // STV and IRV only
  scores?: Record<number, number>;  // points, counts, or Copeland scores
  matrix?: number[][];   // Condorcet only
}

interface ElectionResult {
  config: ElectionConfig;
  results: MethodResult[];
  allAgree: boolean;
}
```

---

## Scenarios — Configuration Details

Each scenario must be a function that returns an `ElectionConfig` (with fixed candidate and voter-bloc positions, not random). Below are the spatial positions to use:

### Spoiler Effect
```
Candidates:
  A (incumbent): x=0.55, y=-0.1  (center-right)
  B (reformer):  x=0.60, y=0.15  (center-right, close to A)
  C (progressive): x=-0.55, y=0.3

Voter blocs:
  Bloc 1: center=(-0.5, 0.3), size=260, spread=0.18   (progressive voters)
  Bloc 2: center=(0.55, 0.0), size=240, spread=0.18   (right-of-center voters, split between A and B)

Seats: 1. 
Expected result: C wins under plurality because A and B split their 240 voters. 
Under IRV/STV, the A/B split resolves via transfer.
```

### Majority Minority
```
Candidates:
  A: x=-0.7, y=0.5   (minority candidate)
  B: x=0.3, y=-0.2
  C: x=0.5, y=0.1
  D: x=0.1, y=-0.5
  E: x=-0.1, y=0.3

Voter blocs:
  Minority bloc: center=(-0.65, 0.5), size=150, spread=0.14
  Majority blocs: 4 blocs near B/C/D/E totaling 350 voters, spread=0.2

Seats: 3.
```

### Centrist Penalty
```
Candidates:
  Center: x=0.0, y=0.0
  Left:   x=-0.7, y=0.2
  Right:  x=0.7, y=-0.1
  ProgLeft: x=-0.5, y=0.6
  ConRight: x=0.6, y=-0.6

Voter blocs:
  Far-left bloc:   center=(-0.75, 0.3), size=110, spread=0.15
  Left bloc:       center=(-0.45, 0.1), size=100, spread=0.15
  Right bloc:      center=(0.5, -0.1),  size=100, spread=0.15
  Far-right bloc:  center=(0.65, -0.55), size=90, spread=0.15
  Center-left:     center=(-0.1, 0.1),  size=50,  spread=0.2
  Center-right:    center=(0.1, -0.1),  size=50,  spread=0.2

Seats: 1. Center candidate wins Borda/Condorcet but loses IRV and often plurality.
```

### Proportional Showcase
```
5 candidates and 5 voter blocs, each candidate placed at the centroid of one bloc.
Blocs of roughly equal size (≈100 voters each), spread far apart on the compass.
Seats: 4. Under top-4 plurality, the largest one or two blocs dominate. Under STV, each major bloc earns a seat.
```

### Landslide
```
1 dominant candidate at x=0.0, y=0.0.
4 other candidates scattered at corners.
1 large central voter bloc (size=380, spread=0.25) and 4 small peripheral blocs (size=30 each).
Seats: 2. All methods agree.
```

---

## Educational Copy

Include these plain-English descriptions as constants used in method panels and tooltips:

```ts
const METHOD_DESCRIPTIONS = {
  plurality: "Each voter picks one candidate. The most votes wins — even without a majority. This is how most U.S. elections currently work.",
  irv: "Voters rank candidates. If no one has a majority, last place is eliminated and their voters' ballots count for their next choice. Repeats until someone hits 50%+.",
  stv: "The multi-seat version of ranked-choice voting. Candidates need a quota of votes to win. Surplus votes and eliminated candidates' ballots transfer, so almost every vote helps elect someone.",
  approval: "Voters say 'yes' to every candidate they find acceptable — not just their favorite. The candidate approved by the most voters wins.",
  borda: "Voters rank candidates and earn points by position: most points for first, fewer for second, and so on. The candidate with the most total points wins.",
  condorcet: "The winner is whoever would beat every other candidate in a one-on-one race. If such a candidate exists, most people consider them the 'true' majority choice.",
};

const METHOD_WHY_DIFFERS = {
  plurality: "Plurality ignores all preferences beyond a voter's top choice, so similar candidates split votes and an unpopular candidate can win with a plurality.",
  irv: "IRV resolves vote-splitting but can still penalize broadly-liked centrist candidates who never top anyone's list.",
  stv: "STV allocates seats proportionally to voter blocs. Groups that couldn't win a single seat under plurality earn representation here.",
  approval: "Approval rewards broadly acceptable candidates rather than intensely preferred ones — sometimes electing a 'safe' choice over a polarizing frontrunner.",
  borda: "Borda rewards consistent high rankings across all voters, which often favors centrist candidates who are nobody's first choice but everybody's second.",
  condorcet: "The Condorcet winner defeats everyone head-to-head, but can still be the wrong pick if voter preferences cycle (A beats B, B beats C, C beats A).",
};
```

---

## What "Done" Looks Like

The app is complete when:

1. All 6 voting methods produce correct results verifiable against hand-traced examples.
2. The app is fully usable and visually correct on a 390px mobile viewport and a 1280px desktop viewport.
3. Light and dark themes are complete, with no hardcoded colors anywhere in components.
4. All 6 preset scenarios load correctly and demonstrate their intended electoral phenomenon.
5. The custom scenario builder allows a user to place candidates and voter blocs and run a valid election.
6. The advanced options panel is hidden by default and reveals cleanly.
7. The STV and IRV round navigators correctly step through every round, updating the compass and charts.
8. The verdict panel correctly identifies agreement and disagreement across all active methods.
9. Session statistics track correctly across multiple generated elections.
10. No TypeScript errors. No console errors or warnings during normal use.

---

## Notes for Claude Code

- Implement the algorithms in `src/algorithms/` first and write a brief inline test for each using a known small dataset (3 candidates, 9 voters) before building any UI.
- The spatial voting model and all algorithms must be pure functions with no side effects — this makes them easy to test and means the UI can call them freely.
- Do not use `any` in TypeScript. Type all function signatures explicitly.
- The `useElection` hook should be the single source of truth for election state. Components receive data as props; they do not call algorithm functions directly.
- When implementing the Condorcet matrix display, make sure it degrades gracefully on narrow screens — collapse to a scrollable horizontal table rather than breaking the layout.
- For draggable candidates in the custom scenario builder, implement drag using pointer events (not mouse events) for touch compatibility. Clamp candidate positions to [-1, 1] in both axes.
- The approval threshold in the spatial model is a Euclidean distance on the [-1,1]² grid — a value of 0.4 means voters approve all candidates within 0.4 units of their position.
