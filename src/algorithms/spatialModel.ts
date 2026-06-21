// Spatial voting model: generates voters and candidates on the [-1, 1]² compass.
// All functions are pure (the RNG is injectable) so results are easy to test.

import type { Candidate, Voter, VoterBloc } from '../types';
import { CANDIDATE_COLORS } from '../theme';

export type Rng = () => number;

/** Box-Muller transform → a sample from N(mean, std²). */
export function normalRandom(mean: number, std: number, rng: Rng = Math.random): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const mag = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + std * mag;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function euclidean(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Rank candidate IDs ascending by distance from (x, y). */
export function rankPreferences(x: number, y: number, candidates: Candidate[]): number[] {
  return [...candidates]
    .sort((a, b) => euclidean(x, y, a.x, a.y) - euclidean(x, y, b.x, b.y))
    .map((c) => c.id);
}

/** Candidate IDs within `threshold` Euclidean units of (x, y). */
export function approvedCandidates(
  x: number,
  y: number,
  candidates: Candidate[],
  threshold: number,
): number[] {
  return candidates.filter((c) => euclidean(x, y, c.x, c.y) < threshold).map((c) => c.id);
}

/**
 * Build the voter list from a set of blocs, computing each voter's ranked
 * preferences and approved set against the given candidates.
 */
export function generateVoters(
  blocs: VoterBloc[],
  candidates: Candidate[],
  approvalThreshold: number,
  rng: Rng = Math.random,
): Voter[] {
  const voters: Voter[] = [];
  for (const bloc of blocs) {
    for (let i = 0; i < bloc.size; i += 1) {
      const x = clamp(normalRandom(bloc.x, bloc.spread, rng), -1, 1);
      const y = clamp(normalRandom(bloc.y, bloc.spread, rng), -1, 1);
      voters.push({
        x,
        y,
        preferences: rankPreferences(x, y, candidates),
        approves: approvedCandidates(x, y, candidates, approvalThreshold),
      });
    }
  }
  return voters;
}

/** Place `count` candidates randomly in [-0.75, 0.75]² with palette colors. */
export function generateCandidates(count: number, rng: Rng = Math.random): Candidate[] {
  const candidates: Candidate[] = [];
  for (let i = 0; i < count; i += 1) {
    candidates.push({
      id: i,
      name: `Candidate ${String.fromCharCode(65 + i)}`,
      color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
      x: rng() * 1.5 - 0.75,
      y: rng() * 1.5 - 0.75,
    });
  }
  return candidates;
}

/** Generate randomly-placed voter blocs (centers in [-0.75, 0.75]²). */
export function generateRandomBlocs(
  clusterCount: number,
  totalVoters: number,
  spread = 0.19,
  rng: Rng = Math.random,
): VoterBloc[] {
  const blocs: VoterBloc[] = [];
  const base = Math.floor(totalVoters / clusterCount);
  for (let c = 0; c < clusterCount; c += 1) {
    const size = c === clusterCount - 1 ? totalVoters - base * (clusterCount - 1) : base;
    blocs.push({
      x: rng() * 1.5 - 0.75,
      y: rng() * 1.5 - 0.75,
      size,
      spread,
    });
  }
  return blocs;
}
