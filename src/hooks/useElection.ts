// Single source of truth for an election run: holds settings, the computed
// result (all rounds pre-computed), the round-stepping cursor, and session
// statistics. Components receive data as props and never call algorithms.

import { useCallback, useMemo, useState } from 'react';
import type {
  Candidate,
  ElectionConfig,
  ElectionResult,
  ScenarioConfig,
  ScenarioId,
  VoterBloc,
  VotingMethod,
} from '../types';
import { CANDIDATE_COLORS } from '../theme';
import { runElection } from '../algorithms/runElection';
import { generateVoters } from '../algorithms/spatialModel';
import { buildScenario, type RandomOptions } from '../scenarios/presets';

export interface ElectionSettings {
  scenarioId: ScenarioId;
  candidateCount: number;
  seats: number;
  totalVoters: number;
  clusterCount: number;
  approvalThreshold: number;
  activeMethods: VotingMethod[];
  customCandidates: Candidate[];
  customBlocs: VoterBloc[];
}

export interface SessionStats {
  total: number;
  agreed: number;
  differed: number;
}

function customCandidate(i: number, name: string, x: number, y: number): Candidate {
  return { id: i, name, color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length], x, y };
}

const DEFAULT_CUSTOM_CANDIDATES: Candidate[] = [
  customCandidate(0, 'Candidate A', -0.5, 0.3),
  customCandidate(1, 'Candidate B', 0.5, 0.3),
  customCandidate(2, 'Candidate C', 0.0, -0.5),
];

const DEFAULT_CUSTOM_BLOCS: VoterBloc[] = [
  { x: -0.5, y: 0.3, size: 200, spread: 0.18 },
  { x: 0.5, y: 0.3, size: 200, spread: 0.18 },
];

const DEFAULT_SETTINGS: ElectionSettings = {
  scenarioId: 'random',
  candidateCount: 4,
  seats: 1,
  totalVoters: 500,
  clusterCount: 4,
  approvalThreshold: 0.4,
  activeMethods: ['plurality', 'irv', 'stv', 'approval', 'borda', 'condorcet'],
  customCandidates: DEFAULT_CUSTOM_CANDIDATES,
  customBlocs: DEFAULT_CUSTOM_BLOCS,
};

export interface UseElectionResult {
  settings: ElectionSettings;
  updateSettings: (patch: Partial<ElectionSettings>) => void;
  resetSettings: () => void;
  result: ElectionResult | null;
  stats: SessionStats;
  round: number;
  setRound: (n: number) => void;
  maxRound: number;
  generate: () => void;
}

export function useElection(): UseElectionResult {
  const [settings, setSettings] = useState<ElectionSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [stats, setStats] = useState<SessionStats>({ total: 0, agreed: 0, differed: 0 });
  const [round, setRound] = useState(0);

  const updateSettings = useCallback((patch: Partial<ElectionSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      next.seats = Math.min(next.seats, Math.max(1, next.candidateCount - 1));
      return next;
    });
  }, []);

  // Restore the advanced options to their defaults, keeping the current scenario.
  const resetSettings = useCallback(() => {
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, scenarioId: prev.scenarioId }));
  }, []);

  const generate = useCallback(() => {
    setSettings((s) => {
      const opts: RandomOptions = {
        candidateCount: s.candidateCount,
        clusterCount: s.clusterCount,
        totalVoters: s.totalVoters,
        seats: s.seats,
      };
      const scenario: ScenarioConfig =
        s.scenarioId === 'custom'
          ? {
              candidates: s.customCandidates,
              blocs: s.customBlocs,
              seats: Math.min(s.seats, Math.max(1, s.customCandidates.length - 1)),
            }
          : buildScenario(s.scenarioId, opts);
      const voters = generateVoters(scenario.blocs, scenario.candidates, s.approvalThreshold);
      const config: ElectionConfig = {
        candidates: scenario.candidates,
        voters,
        seats: scenario.seats,
        approvalThreshold: s.approvalThreshold,
        activeMethods: s.activeMethods,
      };
      const next = runElection(config);
      setResult(next);
      setRound(0);
      setStats((prev) => ({
        total: prev.total + 1,
        agreed: prev.agreed + (next.allAgree ? 1 : 0),
        differed: prev.differed + (next.allAgree ? 0 : 1),
      }));
      // Keep settings in sync with the scenario's seat count.
      return { ...s, seats: scenario.seats };
    });
  }, []);

  const maxRound = useMemo(() => {
    if (!result) return 0;
    const stepped = result.results.find((r) => r.method === 'stv' || r.method === 'irv');
    return stepped?.rounds ? stepped.rounds.length - 1 : 0;
  }, [result]);

  return {
    settings,
    updateSettings,
    resetSettings,
    result,
    stats,
    round,
    setRound,
    maxRound,
    generate,
  };
}
