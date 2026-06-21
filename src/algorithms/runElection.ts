// Runs every active voting method on a single electorate and reports whether
// they all agree on the winning set.

import type { ElectionConfig, ElectionResult, MethodResult } from '../types';
import { plurality } from './plurality';
import { irv } from './irv';
import { stv } from './stv';
import { approval } from './approval';
import { borda } from './borda';
import { condorcet } from './condorcet';

export function runElection(config: ElectionConfig): ElectionResult {
  const { candidates, voters, seats, activeMethods } = config;
  const results: MethodResult[] = [];

  for (const method of activeMethods) {
    switch (method) {
      case 'plurality':
        results.push(plurality(candidates, voters, seats));
        break;
      case 'irv':
        results.push(irv(candidates, voters)); // single-winner only
        break;
      case 'stv':
        results.push(stv(candidates, voters, seats));
        break;
      case 'approval':
        results.push(approval(candidates, voters, seats));
        break;
      case 'borda':
        results.push(borda(candidates, voters, seats));
        break;
      case 'condorcet':
        results.push(condorcet(candidates, voters, seats));
        break;
    }
  }

  return { config, results, allAgree: computeAllAgree(results) };
}

function computeAllAgree(results: MethodResult[]): boolean {
  if (results.length < 2) return true;
  const key = (ids: number[]): string => [...ids].sort((a, b) => a - b).join(',');
  const first = key(results[0].winners);
  return results.every((r) => key(r.winners) === first);
}
