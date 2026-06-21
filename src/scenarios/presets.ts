// Preset scenario configurations. Each builder returns a ScenarioConfig with
// fixed candidate and voter-bloc positions (except `random`, which uses the
// spatial model). Active methods and approval threshold are applied later.

import type { Candidate, ScenarioConfig, ScenarioId, VoterBloc } from '../types';
import { CANDIDATE_COLORS } from '../theme';
import { generateCandidates, generateRandomBlocs, type Rng } from '../algorithms/spatialModel';

function candidate(id: number, name: string, x: number, y: number): Candidate {
  return { id, name, color: CANDIDATE_COLORS[id % CANDIDATE_COLORS.length], x, y };
}

export interface ScenarioMeta {
  id: ScenarioId;
  label: string;
  description: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: 'random',
    label: 'Random Election',
    description:
      'Generates fresh candidates and voter clusters at random each time you click Generate. A good sandbox for seeing how often the methods agree.',
  },
  {
    id: 'spoiler',
    label: 'The Spoiler Effect',
    description:
      'Two similar candidates split their shared voters, letting a less-popular third candidate win under Plurality — while ranked methods resolve the split.',
  },
  {
    id: 'majorityMinority',
    label: 'Majority Minority',
    description:
      'A concentrated minority bloc (~30%) wins no single-winner seat, but earns proportional representation under STV with multiple seats.',
  },
  {
    id: 'centrist',
    label: 'The Centrist Penalty',
    description:
      "A broadly-liked centrist is nobody's first choice, so they lose under Plurality and IRV — yet win under Borda and Condorcet.",
  },
  {
    id: 'proportional',
    label: 'Proportional Showcase',
    description:
      'Five roughly equal blocs: the largest dominate top-N Plurality, while STV gives each major bloc about one of the seats.',
  },
  {
    id: 'landslide',
    label: 'Landslide',
    description:
      'One candidate commands a dominant majority, so every method agrees on the winner — a baseline showing when the system choice does not matter.',
  },
  {
    id: 'custom',
    label: 'Custom Scenario',
    description:
      'Design your own election: place candidates and voter blocs in the builder inside Advanced Options, then Generate.',
  },
];

function spoiler(): ScenarioConfig {
  return {
    candidates: [
      candidate(0, 'Incumbent', 0.55, -0.1),
      candidate(1, 'Reformer', 0.6, 0.15),
      candidate(2, 'Progressive', -0.55, 0.3),
    ],
    blocs: [
      { x: -0.5, y: 0.3, size: 260, spread: 0.18 },
      { x: 0.55, y: 0.0, size: 240, spread: 0.18 },
    ],
    seats: 1,
  };
}

function majorityMinority(): ScenarioConfig {
  return {
    candidates: [
      candidate(0, 'Minority Cand.', -0.7, 0.5),
      candidate(1, 'Candidate B', 0.3, -0.2),
      candidate(2, 'Candidate C', 0.5, 0.1),
      candidate(3, 'Candidate D', 0.1, -0.5),
      candidate(4, 'Candidate E', -0.1, 0.3),
    ],
    blocs: [
      { x: -0.65, y: 0.5, size: 150, spread: 0.14 },
      { x: 0.3, y: -0.2, size: 90, spread: 0.2 },
      { x: 0.5, y: 0.1, size: 90, spread: 0.2 },
      { x: 0.1, y: -0.5, size: 85, spread: 0.2 },
      { x: -0.1, y: 0.3, size: 85, spread: 0.2 },
    ],
    seats: 3,
  };
}

function centrist(): ScenarioConfig {
  return {
    candidates: [
      candidate(0, 'Center', 0.0, 0.0),
      candidate(1, 'Left', -0.7, 0.2),
      candidate(2, 'Right', 0.7, -0.1),
      candidate(3, 'ProgLeft', -0.5, 0.6),
      candidate(4, 'ConRight', 0.6, -0.6),
    ],
    blocs: [
      { x: -0.75, y: 0.3, size: 110, spread: 0.15 },
      { x: -0.45, y: 0.1, size: 100, spread: 0.15 },
      { x: 0.5, y: -0.1, size: 100, spread: 0.15 },
      { x: 0.65, y: -0.55, size: 90, spread: 0.15 },
      { x: -0.1, y: 0.1, size: 50, spread: 0.2 },
      { x: 0.1, y: -0.1, size: 50, spread: 0.2 },
    ],
    seats: 1,
  };
}

function proportional(): ScenarioConfig {
  const positions: Array<[number, number]> = [
    [-0.7, 0.6],
    [0.7, 0.6],
    [-0.7, -0.6],
    [0.7, -0.6],
    [0.0, 0.0],
  ];
  const candidates = positions.map((p, i) => candidate(i, `Bloc ${i + 1} Cand.`, p[0], p[1]));
  const blocs: VoterBloc[] = positions.map((p) => ({ x: p[0], y: p[1], size: 100, spread: 0.16 }));
  return { candidates, blocs, seats: 4 };
}

function landslide(): ScenarioConfig {
  return {
    candidates: [
      candidate(0, 'Front-runner', 0.0, 0.0),
      candidate(1, 'Corner A', -0.8, 0.8),
      candidate(2, 'Corner B', 0.8, 0.8),
      candidate(3, 'Corner C', -0.8, -0.8),
      candidate(4, 'Corner D', 0.8, -0.8),
    ],
    blocs: [
      { x: 0.0, y: 0.0, size: 380, spread: 0.25 },
      { x: -0.8, y: 0.8, size: 30, spread: 0.12 },
      { x: 0.8, y: 0.8, size: 30, spread: 0.12 },
      { x: -0.8, y: -0.8, size: 30, spread: 0.12 },
      { x: 0.8, y: -0.8, size: 30, spread: 0.12 },
    ],
    seats: 2,
  };
}

export interface RandomOptions {
  candidateCount: number;
  clusterCount: number;
  totalVoters: number;
  seats: number;
}

function random(opts: RandomOptions, rng: Rng = Math.random): ScenarioConfig {
  return {
    candidates: generateCandidates(opts.candidateCount, rng),
    blocs: generateRandomBlocs(opts.clusterCount, opts.totalVoters, 0.19, rng),
    seats: opts.seats,
  };
}

/** Build a scenario config by id. `random` and `custom` rely on `opts`. */
export function buildScenario(
  id: ScenarioId,
  opts: RandomOptions,
  rng: Rng = Math.random,
): ScenarioConfig {
  switch (id) {
    case 'spoiler':
      return spoiler();
    case 'majorityMinority':
      return majorityMinority();
    case 'centrist':
      return centrist();
    case 'proportional':
      return proportional();
    case 'landslide':
      return landslide();
    case 'random':
    case 'custom':
    default:
      return random(opts, rng);
  }
}
