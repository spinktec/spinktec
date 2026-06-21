import type { ThemeTokens } from '../theme';
import type { VotingMethod } from '../types';
import { ALL_METHODS, METHOD_LABELS } from '../constants';
import type { ElectionSettings } from '../hooks/useElection';
import { ScenarioBuilder } from './ScenarioBuilder';

interface Props {
  settings: ElectionSettings;
  update: (patch: Partial<ElectionSettings>) => void;
  reset: () => void;
  tokens: ThemeTokens;
  open: boolean;
  onToggle: () => void;
}

interface SliderProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  tokens: ThemeTokens;
  onChange: (n: number) => void;
}

function Slider({ label, description, value, min, max, step = 1, tokens, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-xs" style={{ color: tokens.textDim }}>
      <span className="flex justify-between">
        <span className="font-semibold" style={{ color: tokens.text }}>
          {label}
        </span>
        <span className="font-semibold tabular-nums" style={{ color: tokens.text }}>
          {value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full"
        style={{ accentColor: tokens.accent }}
      />
      <span className="leading-snug" style={{ color: tokens.textDim }}>
        {description}
      </span>
    </label>
  );
}

export function AdvancedOptions({ settings, update, reset, tokens, open, onToggle }: Props) {
  const toggleMethod = (m: VotingMethod): void => {
    const active = settings.activeMethods.includes(m);
    if (active && settings.activeMethods.length <= 2) return; // keep at least 2
    update({
      activeMethods: active
        ? settings.activeMethods.filter((x) => x !== m)
        : [...settings.activeMethods, m],
    });
  };

  return (
    <div className="rounded-xl border" style={{ borderColor: tokens.border, background: tokens.surface }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2"
        style={{ color: tokens.text }}
      >
        <span>Advanced Options</span>
        <span aria-hidden style={{ color: tokens.textDim }}>{open ? '▲' : '▼'}</span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? (settings.scenarioId === 'custom' ? 4000 : 1200) : 0 }}
      >
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Slider
              label="Candidates"
              description="How many candidates appear on the ballot. More candidates make vote-splitting and Condorcet cycles more likely."
              value={settings.candidateCount}
              min={2}
              max={10}
              tokens={tokens}
              onChange={(n) => update({ candidateCount: n })}
            />
            <Slider
              label="Seats"
              description="Number of winners to elect. IRV is single-winner; STV fills every seat proportionally. Capped at candidates − 1."
              value={settings.seats}
              min={1}
              max={5}
              tokens={tokens}
              onChange={(n) => update({ seats: n })}
            />
            <Slider
              label="Total voters"
              description="Size of the simulated electorate. Larger electorates give smoother, more stable results (applies to random elections)."
              value={settings.totalVoters}
              min={100}
              max={50000}
              step={100}
              tokens={tokens}
              onChange={(n) => update({ totalVoters: n })}
            />
            <Slider
              label="Voter clusters"
              description="Number of ideological groups voters are drawn from in a random election. More clusters spread voters across the compass."
              value={settings.clusterCount}
              min={1}
              max={8}
              tokens={tokens}
              onChange={(n) => update({ clusterCount: n })}
            />
            <Slider
              label="Approval threshold"
              description="How close (in compass units) a candidate must be for a voter to approve them under Approval Voting. Higher = voters approve more candidates."
              value={settings.approvalThreshold}
              min={0.1}
              max={0.9}
              step={0.05}
              tokens={tokens}
              onChange={(n) => update({ approvalThreshold: n })}
            />
          </div>

          <fieldset>
            <legend className="text-xs font-semibold" style={{ color: tokens.text }}>
              Active voting methods
            </legend>
            <p className="mb-2 text-xs" style={{ color: tokens.textDim }}>
              Choose which systems run on the same electorate so you can compare them side by side. At
              least two must stay active.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_METHODS.map((m) => {
                const checked = settings.activeMethods.includes(m);
                return (
                  <label key={m} className="flex items-center gap-2 text-xs" style={{ color: tokens.text }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMethod(m)}
                      style={{ accentColor: tokens.accent }}
                    />
                    {METHOD_LABELS[m]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {settings.scenarioId === 'custom' && (
            <ScenarioBuilder
              tokens={tokens}
              candidates={settings.customCandidates}
              blocs={settings.customBlocs}
              onCandidatesChange={(customCandidates) => update({ customCandidates })}
              onBlocsChange={(customBlocs) => update({ customBlocs })}
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: tokens.border }}>
            <span className="text-xs" style={{ color: tokens.textDim }}>
              Restore every option above to its default value.
            </span>
            <button
              type="button"
              onClick={reset}
              className="h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold focus:outline-none focus-visible:ring-2"
              style={{ borderColor: tokens.border, color: tokens.text, background: tokens.bg }}
            >
              ↺ Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
