// Shared TypeScript interfaces for the Electoral Systems Simulator.

export interface Candidate {
  id: number;
  name: string;
  color: string;
  x: number; // -1 to 1
  y: number; // -1 to 1
}

export interface Voter {
  x: number;
  y: number;
  preferences: number[]; // candidate IDs, sorted by proximity (closest first)
  approves: number[]; // candidate IDs within the approval threshold
}

export type VotingMethod =
  | 'plurality'
  | 'irv'
  | 'stv'
  | 'approval'
  | 'borda'
  | 'condorcet';

export interface ElectionConfig {
  candidates: Candidate[];
  voters: Voter[];
  seats: number;
  approvalThreshold: number;
  activeMethods: VotingMethod[];
}

export interface Round {
  roundNumber: number;
  counts: Record<number, number>;
  elected: number[];
  eliminated: number[];
  action: 'elect' | 'eliminate' | 'elect_remaining';
  targets: number[];
  quota?: number;
  log: string;
}

export interface MethodResult {
  method: VotingMethod;
  winners: number[];
  rounds?: Round[]; // STV and IRV only
  scores?: Record<number, number>; // points, counts, or Copeland scores
  matrix?: number[][]; // Condorcet only
}

export interface ElectionResult {
  config: ElectionConfig;
  results: MethodResult[];
  allAgree: boolean;
}

/** Definition of a voter cluster/bloc used by the spatial model and custom scenarios. */
export interface VoterBloc {
  x: number; // center, -1 to 1
  y: number; // center, -1 to 1
  size: number; // number of voters
  spread: number; // standard deviation
}

/** A scenario produces a full election configuration (without active methods). */
export interface ScenarioConfig {
  candidates: Candidate[];
  blocs: VoterBloc[];
  seats: number;
}

export type ScenarioId =
  | 'random'
  | 'spoiler'
  | 'majorityMinority'
  | 'centrist'
  | 'proportional'
  | 'landslide'
  | 'custom';
