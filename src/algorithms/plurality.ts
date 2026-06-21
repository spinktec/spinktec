// Plurality (First-Past-the-Post): each voter's top choice gets one vote.
// Top N candidates by raw vote count win.

import type { Candidate, Voter, MethodResult } from '../types';

export function plurality(
  candidates: Candidate[],
  voters: Voter[],
  seats: number,
): MethodResult {
  const scores: Record<number, number> = {};
  for (const c of candidates) scores[c.id] = 0;

  for (const voter of voters) {
    const first = voter.preferences[0];
    if (first !== undefined) scores[first] += 1;
  }

  const winners = [...candidates]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, seats)
    .map((c) => c.id);

  return { method: 'plurality', winners, scores };
}
