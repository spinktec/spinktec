// Instant Runoff Voting (single winner). Voters rank candidates; if no one has
// a majority of continuing ballots, the last-place candidate is eliminated and
// their ballots transfer to the next continuing preference. Repeat until a
// candidate holds a majority.

import type { Candidate, Voter, MethodResult, Round } from '../types';

function nameOf(candidates: Candidate[], id: number): string {
  return candidates.find((c) => c.id === id)?.name ?? `#${id}`;
}

export function irv(candidates: Candidate[], voters: Voter[]): MethodResult {
  const eliminated = new Set<number>();
  const elected: number[] = [];
  const rounds: Round[] = [];
  let roundNumber = 1;

  while (elected.length === 0) {
    const counts: Record<number, number> = {};
    for (const c of candidates) {
      if (!eliminated.has(c.id)) counts[c.id] = 0;
    }

    let totalContinuing = 0;
    for (const voter of voters) {
      const choice = voter.preferences.find((id) => !eliminated.has(id));
      if (choice !== undefined) {
        counts[choice] += 1;
        totalContinuing += 1;
      }
    }

    const continuing = candidates.filter((c) => !eliminated.has(c.id));
    const majority = totalContinuing / 2;

    // Winner if a candidate has a strict majority, or only one remains.
    const leader = [...continuing].sort((a, b) => counts[b.id] - counts[a.id])[0];
    if (continuing.length <= 1 || (leader && counts[leader.id] > majority)) {
      elected.push(leader.id);
      rounds.push({
        roundNumber,
        counts,
        elected: [leader.id],
        eliminated: [],
        action: 'elect',
        targets: [leader.id],
        log: `${nameOf(candidates, leader.id)} wins with ${counts[leader.id]} of ${totalContinuing} continuing votes (majority).`,
      });
      break;
    }

    // Otherwise eliminate the lowest vote-getter.
    const loser = [...continuing].sort((a, b) => counts[a.id] - counts[b.id])[0];
    eliminated.add(loser.id);
    rounds.push({
      roundNumber,
      counts,
      elected: [],
      eliminated: [loser.id],
      action: 'eliminate',
      targets: [loser.id],
      log: `No majority. ${nameOf(candidates, loser.id)} is eliminated (${counts[loser.id]} votes) and ballots transfer.`,
    });
    roundNumber += 1;
  }

  return { method: 'irv', winners: elected, rounds };
}
