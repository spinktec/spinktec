// Approval Voting: each candidate within the voter's approval threshold gets a
// vote. Top N candidates by approval count win.

import type { Candidate, Voter, MethodResult } from '../types';

export function approval(
  candidates: Candidate[],
  voters: Voter[],
  seats: number,
): MethodResult {
  const scores: Record<number, number> = {};
  for (const c of candidates) scores[c.id] = 0;

  for (const voter of voters) {
    for (const id of voter.approves) scores[id] += 1;
  }

  const winners = [...candidates]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, seats)
    .map((c) => c.id);

  return { method: 'approval', winners, scores };
}
