// Borda Count: for N candidates, a voter's k-th preference earns (N - 1 - k)
// points. Top N candidates by total points win.

import type { Candidate, Voter, MethodResult } from '../types';

export function borda(
  candidates: Candidate[],
  voters: Voter[],
  seats: number,
): MethodResult {
  const n = candidates.length;
  const scores: Record<number, number> = {};
  for (const c of candidates) scores[c.id] = 0;

  for (const voter of voters) {
    voter.preferences.forEach((id, rank) => {
      scores[id] += n - 1 - rank;
    });
  }

  const winners = [...candidates]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, seats)
    .map((c) => c.id);

  return { method: 'borda', winners, scores };
}
