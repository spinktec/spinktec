// Plain-English educational copy used in method panels and tooltips.

import type { VotingMethod } from './types';

export const METHOD_LABELS: Record<VotingMethod, string> = {
  plurality: 'Plurality (FPTP)',
  irv: 'Instant Runoff (IRV)',
  stv: 'Single Transferable Vote',
  approval: 'Approval Voting',
  borda: 'Borda Count',
  condorcet: 'Condorcet (Copeland)',
};

export const METHOD_DESCRIPTIONS: Record<VotingMethod, string> = {
  plurality:
    'Each voter picks one candidate. The most votes wins — even without a majority. This is how most U.S. elections currently work.',
  irv: "Voters rank candidates. If no one has a majority, last place is eliminated and their voters' ballots count for their next choice. Repeats until someone hits 50%+.",
  stv: 'The multi-seat version of ranked-choice voting. Candidates need a quota of votes to win. Surplus votes and eliminated candidates’ ballots transfer, so almost every vote helps elect someone.',
  approval:
    "Voters say 'yes' to every candidate they find acceptable — not just their favorite. The candidate approved by the most voters wins.",
  borda:
    'Voters rank candidates and earn points by position: most points for first, fewer for second, and so on. The candidate with the most total points wins.',
  condorcet:
    "The winner is whoever would beat every other candidate in a one-on-one race. If such a candidate exists, most people consider them the 'true' majority choice.",
};

export const METHOD_WHY_DIFFERS: Record<VotingMethod, string> = {
  plurality:
    'Plurality ignores all preferences beyond a voter’s top choice, so similar candidates split votes and an unpopular candidate can win with a plurality.',
  irv: 'IRV resolves vote-splitting but can still penalize broadly-liked centrist candidates who never top anyone’s list.',
  stv: 'STV allocates seats proportionally to voter blocs. Groups that couldn’t win a single seat under plurality earn representation here.',
  approval:
    "Approval rewards broadly acceptable candidates rather than intensely preferred ones — sometimes electing a 'safe' choice over a polarizing frontrunner.",
  borda:
    'Borda rewards consistent high rankings across all voters, which often favors centrist candidates who are nobody’s first choice but everybody’s second.',
  condorcet:
    'The Condorcet winner defeats everyone head-to-head, but can still be the wrong pick if voter preferences cycle (A beats B, B beats C, C beats A).',
};

export const ALL_METHODS: VotingMethod[] = [
  'plurality',
  'irv',
  'stv',
  'approval',
  'borda',
  'condorcet',
];
