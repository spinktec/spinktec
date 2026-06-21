// Single Transferable Vote (multi-winner) using the Droop quota and the Gregory
// fractional transfer method (whole-ballot, weighted).
//
//   quota = floor(totalVoters / (seats + 1)) + 1
//
// Each round we tally the weighted vote for every continuing candidate at its
// top non-excluded preference. A candidate meeting quota is elected and their
// surplus transfers: every ballot resting on them has its weight multiplied by
// surplus / totalForCandidate. If no one meets quota, the lowest candidate is
// eliminated and their ballots transfer at full current weight. When the number
// of continuing candidates equals the remaining seats, they are auto-elected.

import type { Candidate, Voter, MethodResult, Round } from '../types';

interface Ballot {
  weight: number;
  prefs: number[];
}

function nameOf(candidates: Candidate[], id: number): string {
  return candidates.find((c) => c.id === id)?.name ?? `#${id}`;
}

export function stv(
  candidates: Candidate[],
  voters: Voter[],
  seats: number,
): MethodResult {
  const ballots: Ballot[] = voters.map((v) => ({ weight: 1, prefs: v.preferences }));
  const quota = Math.floor(voters.length / (seats + 1)) + 1;

  const elected: number[] = [];
  const eliminated = new Set<number>();
  const excluded = new Set<number>(); // elected OR eliminated → no longer continuing
  const rounds: Round[] = [];
  let roundNumber = 1;

  const topChoice = (b: Ballot): number | undefined =>
    b.prefs.find((id) => !excluded.has(id));

  while (elected.length < seats) {
    const continuing = candidates.filter((c) => !excluded.has(c.id));

    // Auto-elect the remaining candidates if they exactly fill the open seats.
    if (continuing.length <= seats - elected.length) {
      const counts = tally(ballots, candidates, excluded, topChoice);
      const ids = continuing.map((c) => c.id);
      ids.forEach((id) => {
        elected.push(id);
        excluded.add(id);
      });
      rounds.push({
        roundNumber,
        counts,
        elected: ids,
        eliminated: [],
        action: 'elect_remaining',
        targets: ids,
        quota,
        log: `Remaining candidates ${ids
          .map((id) => nameOf(candidates, id))
          .join(', ')} auto-elected to fill the last ${ids.length} seat(s).`,
      });
      break;
    }

    const counts = tally(ballots, candidates, excluded, topChoice);

    // Find the strongest candidate and check the quota.
    const leader = [...continuing].sort((a, b) => counts[b.id] - counts[a.id])[0];
    if (counts[leader.id] >= quota) {
      const total = counts[leader.id];
      const surplus = total - quota;
      const fraction = total > 0 ? surplus / total : 0;
      for (const b of ballots) {
        if (topChoice(b) === leader.id) b.weight *= fraction;
      }
      elected.push(leader.id);
      excluded.add(leader.id);
      rounds.push({
        roundNumber,
        counts,
        elected: [leader.id],
        eliminated: [],
        action: 'elect',
        targets: [leader.id],
        quota,
        log: `${nameOf(candidates, leader.id)} meets the quota of ${quota} with ${total.toFixed(
          1,
        )} votes. Surplus ${surplus.toFixed(1)} transfers at weight ${fraction.toFixed(3)}.`,
      });
    } else {
      // No quota — eliminate the lowest and transfer at full weight.
      const loser = [...continuing].sort((a, b) => counts[a.id] - counts[b.id])[0];
      eliminated.add(loser.id);
      excluded.add(loser.id);
      rounds.push({
        roundNumber,
        counts,
        elected: [],
        eliminated: [loser.id],
        action: 'eliminate',
        targets: [loser.id],
        quota,
        log: `No candidate meets the quota of ${quota}. ${nameOf(
          candidates,
          loser.id,
        )} is eliminated (${counts[loser.id].toFixed(1)} votes) and ballots transfer.`,
      });
    }
    roundNumber += 1;
  }

  return { method: 'stv', winners: elected, rounds };
}

function tally(
  ballots: Ballot[],
  candidates: Candidate[],
  excluded: Set<number>,
  topChoice: (b: Ballot) => number | undefined,
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const c of candidates) {
    if (!excluded.has(c.id)) counts[c.id] = 0;
  }
  for (const b of ballots) {
    const id = topChoice(b);
    if (id !== undefined) counts[id] += b.weight;
  }
  return counts;
}
