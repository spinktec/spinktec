// Condorcet (Copeland's Method): every head-to-head matchup is scored. A
// candidate's Copeland score is wins minus losses. Top N by score win.
//
// matrix[i][j] = number of voters who prefer candidate i over candidate j,
// where i and j are *indices into the candidates array* (not IDs).

import type { Candidate, Voter, MethodResult } from '../types';

export function condorcet(
  candidates: Candidate[],
  voters: Voter[],
  seats: number,
): MethodResult {
  const n = candidates.length;
  const idToIndex = new Map<number, number>();
  candidates.forEach((c, i) => idToIndex.set(c.id, i));

  const matrix: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));

  for (const voter of voters) {
    // rank[index] = position of that candidate in this voter's preference list.
    const rank = new Array<number>(n).fill(Number.POSITIVE_INFINITY);
    voter.preferences.forEach((id, pos) => {
      const idx = idToIndex.get(id);
      if (idx !== undefined) rank[idx] = pos;
    });
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (rank[i] < rank[j]) matrix[i][j] += 1;
        else if (rank[j] < rank[i]) matrix[j][i] += 1;
      }
    }
  }

  const scores: Record<number, number> = {};
  candidates.forEach((c, i) => {
    let copeland = 0;
    for (let j = 0; j < n; j += 1) {
      if (i === j) continue;
      if (matrix[i][j] > matrix[j][i]) copeland += 1;
      else if (matrix[i][j] < matrix[j][i]) copeland -= 1;
    }
    scores[c.id] = copeland;
  });

  const winners = [...candidates]
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, seats)
    .map((c) => c.id);

  return { method: 'condorcet', winners, scores, matrix };
}
