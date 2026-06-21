import { useMemo } from 'react';
import type { Candidate, VoterBloc } from '../types';
import type { ThemeTokens } from '../theme';
import { CANDIDATE_COLORS } from '../theme';
import { PoliticalCompass } from './PoliticalCompass';

interface Props {
  tokens: ThemeTokens;
  candidates: Candidate[];
  blocs: VoterBloc[];
  onCandidatesChange: (candidates: Candidate[]) => void;
  onBlocsChange: (blocs: VoterBloc[]) => void;
}

const MAX_CANDIDATES = 10;
const MAX_BLOCS = 8;

// Keep ids contiguous (0..n-1) and colors in palette order. Names, positions
// are preserved. Algorithms map by id, letters/colors by array index — this
// keeps all three consistent after add/remove.
function normalize(candidates: Candidate[]): Candidate[] {
  return candidates.map((c, i) => ({
    ...c,
    id: i,
    color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
  }));
}

export function ScenarioBuilder({
  tokens,
  candidates,
  blocs,
  onCandidatesChange,
  onBlocsChange,
}: Props) {
  const totalVoters = useMemo(() => blocs.reduce((sum, b) => sum + b.size, 0), [blocs]);

  const blocsOverlap = useMemo(() => {
    if (blocs.length < 2) return false;
    return blocs.every((b) => b.x === blocs[0].x && b.y === blocs[0].y);
  }, [blocs]);

  // --- Candidate editing ---------------------------------------------------
  const addCandidate = (): void => {
    if (candidates.length >= MAX_CANDIDATES) return;
    const i = candidates.length;
    const next: Candidate = {
      id: i,
      name: `Candidate ${String.fromCharCode(65 + i)}`,
      color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
      x: Math.random() * 1.2 - 0.6,
      y: Math.random() * 1.2 - 0.6,
    };
    onCandidatesChange(normalize([...candidates, next]));
  };

  const removeCandidate = (id: number): void => {
    onCandidatesChange(normalize(candidates.filter((c) => c.id !== id)));
  };

  const renameCandidate = (id: number, name: string): void => {
    onCandidatesChange(candidates.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const moveCandidate = (id: number, x: number, y: number): void => {
    onCandidatesChange(candidates.map((c) => (c.id === id ? { ...c, x, y } : c)));
  };

  // --- Voter-bloc editing --------------------------------------------------
  const addBloc = (): void => {
    if (blocs.length >= MAX_BLOCS) return;
    onBlocsChange([...blocs, { x: 0, y: 0, size: 100, spread: 0.18 }]);
  };

  const removeBloc = (index: number): void => {
    onBlocsChange(blocs.filter((_, i) => i !== index));
  };

  const updateBloc = (index: number, patch: Partial<VoterBloc>): void => {
    onBlocsChange(blocs.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const labelCls = 'flex flex-col gap-0.5';

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-3" style={{ borderColor: tokens.border }}>
      <p className="text-sm font-semibold" style={{ color: tokens.text }}>
        Custom Scenario builder
      </p>

      {/* Live preview compass — drag candidate markers to reposition them. */}
      <div className="flex flex-col gap-1">
        <PoliticalCompass
          candidates={candidates}
          voters={[]}
          tokens={tokens}
          blocs={blocs}
          editable
          onCandidateMove={moveCandidate}
        />
        <p className="text-center text-[11px]" style={{ color: tokens.textDim }}>
          Drag candidate markers to reposition. Shaded ellipses show voter blocs.
        </p>
      </div>

      {/* Validation warnings */}
      <div className="flex flex-col gap-1 text-xs">
        {candidates.length < 2 && (
          <p style={{ color: tokens.danger }}>⚠ Add at least 2 candidates to run an election.</p>
        )}
        {totalVoters < 50 && (
          <p style={{ color: tokens.warning }}>
            ⚠ Only {totalVoters} voters — results may be noisy (aim for 50+).
          </p>
        )}
        {blocsOverlap && (
          <p style={{ color: tokens.warning }}>
            ⚠ All voter blocs share the same position — results will be unrealistic.
          </p>
        )}
      </div>

      {/* Candidate editor */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold" style={{ color: tokens.textDim }}>
          Candidates ({candidates.length}/{MAX_CANDIDATES})
        </legend>
        {candidates.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-5 w-5 shrink-0 rounded-full border"
              style={{ background: c.color, borderColor: tokens.border }}
            />
            <input
              type="text"
              value={c.name}
              onChange={(e) => renameCandidate(c.id, e.target.value)}
              aria-label={`Name of candidate ${String.fromCharCode(65 + c.id)}`}
              className="min-w-0 flex-1 rounded border px-2 py-1 text-xs focus:outline-none focus-visible:ring-2"
              style={{ background: tokens.bg, borderColor: tokens.border, color: tokens.text }}
            />
            <button
              type="button"
              onClick={() => removeCandidate(c.id)}
              aria-label={`Remove ${c.name}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border text-sm focus:outline-none focus-visible:ring-2"
              style={{ borderColor: tokens.border, color: tokens.textDim }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCandidate}
          disabled={candidates.length >= MAX_CANDIDATES}
          className="h-9 self-start rounded-lg border px-3 text-xs font-semibold disabled:opacity-40 focus:outline-none focus-visible:ring-2"
          style={{ borderColor: tokens.accent, color: tokens.accent }}
        >
          + Add Candidate
        </button>
      </fieldset>

      {/* Voter-bloc editor */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-semibold" style={{ color: tokens.textDim }}>
          Voter blocs ({blocs.length}/{MAX_BLOCS}) · {totalVoters} voters total
        </legend>
        {blocs.map((b, i) => (
          <div
            key={i}
            className="rounded-lg border p-2"
            style={{ borderColor: tokens.border }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: tokens.text }}>
                Bloc {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeBloc(i)}
                aria-label={`Remove voter bloc ${i + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded border text-sm focus:outline-none focus-visible:ring-2"
                style={{ borderColor: tokens.border, color: tokens.textDim }}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: tokens.textDim }}>
              <label className={labelCls}>
                <span className="flex justify-between">
                  <span>X (left–right)</span>
                  <span className="tabular-nums" style={{ color: tokens.text }}>
                    {b.x.toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={b.x}
                  onChange={(e) => updateBloc(i, { x: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: tokens.accent }}
                />
              </label>
              <label className={labelCls}>
                <span className="flex justify-between">
                  <span>Y (lib–con)</span>
                  <span className="tabular-nums" style={{ color: tokens.text }}>
                    {b.y.toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={b.y}
                  onChange={(e) => updateBloc(i, { y: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: tokens.accent }}
                />
              </label>
              <label className={labelCls}>
                <span className="flex justify-between">
                  <span>Size</span>
                  <span className="tabular-nums" style={{ color: tokens.text }}>
                    {b.size}
                  </span>
                </span>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={b.size}
                  onChange={(e) => updateBloc(i, { size: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: tokens.accent }}
                />
              </label>
              <label className={labelCls}>
                <span className="flex justify-between">
                  <span>Spread</span>
                  <span className="tabular-nums" style={{ color: tokens.text }}>
                    {b.spread.toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={b.spread}
                  onChange={(e) => updateBloc(i, { spread: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: tokens.accent }}
                />
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addBloc}
          disabled={blocs.length >= MAX_BLOCS}
          className="h-9 self-start rounded-lg border px-3 text-xs font-semibold disabled:opacity-40 focus:outline-none focus-visible:ring-2"
          style={{ borderColor: tokens.accent, color: tokens.accent }}
        >
          + Add Voter Bloc
        </button>
      </fieldset>
    </div>
  );
}
