import { useEffect, useMemo, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useElection } from './hooks/useElection';
import { SCENARIOS } from './scenarios/presets';
import { ThemeToggle } from './components/ThemeToggle';
import { PoliticalCompass } from './components/PoliticalCompass';
import { MethodPanel } from './components/MethodPanel';
import { RoundNavigator } from './components/RoundNavigator';
import { ActionBanner } from './components/ActionBanner';
import { VerdictPanel } from './components/VerdictPanel';
import { AdvancedOptions } from './components/AdvancedOptions';
import type { MethodResult } from './types';

export default function App() {
  const { preference, tokens, cycle } = useTheme();
  const { settings, updateSettings, resetSettings, result, stats, round, setRound, maxRound, generate } =
    useElection();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Run an election on first mount.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepped: MethodResult | undefined = useMemo(
    () => result?.results.find((r) => r.method === 'stv' || r.method === 'irv'),
    [result],
  );

  const { elected, eliminated, currentRound } = useMemo(() => {
    if (!stepped?.rounds) return { elected: [], eliminated: [], currentRound: undefined };
    const idx = Math.min(round, stepped.rounds.length - 1);
    const slice = stepped.rounds.slice(0, idx + 1);
    return {
      elected: slice.flatMap((r) => r.elected),
      eliminated: slice.flatMap((r) => r.eliminated),
      currentRound: stepped.rounds[idx],
    };
  }, [stepped, round]);

  const pluralityWinners = useMemo(() => {
    if (!result) return [];
    return (
      result.results.find((r) => r.method === 'plurality')?.winners ??
      result.results[0]?.winners ??
      []
    );
  }, [result]);

  const isStepping = Boolean(stepped?.rounds && round < maxRound);
  const showVerdict = !stepped || round >= maxRound;

  return (
    <div className="min-h-full" style={{ background: tokens.bg, color: tokens.text }}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 p-3 sm:p-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold sm:text-2xl" style={{ color: tokens.text }}>
              Electoral Systems Simulator
            </h1>
            <p className="text-xs" style={{ color: tokens.textDim }}>
              {stats.total} elections run · {stats.agreed} agreed · {stats.differed} differed
            </p>
          </div>
          <ThemeToggle preference={preference} tokens={tokens} onCycle={cycle} />
        </header>

        {/* Scenario selector */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => {
            const active = settings.scenarioId === s.id;
            const tipId = `scenario-tip-${s.id}`;
            return (
              <div key={s.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ scenarioId: s.id });
                    if (s.id === 'custom') setAdvancedOpen(true);
                  }}
                  aria-describedby={tipId}
                  className="rounded-full border px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: active ? tokens.accent : tokens.border,
                    background: active ? tokens.accent : tokens.surface,
                    color: active ? tokens.bg : tokens.text,
                  }}
                >
                  {s.label}
                </button>
                <span
                  id={tipId}
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border p-2 text-xs leading-snug opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                  style={{
                    background: tokens.surface,
                    borderColor: tokens.border,
                    color: tokens.textDim,
                  }}
                >
                  <span className="mb-0.5 block font-semibold" style={{ color: tokens.text }}>
                    {s.label}
                  </span>
                  {s.description}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={generate}
          className="h-11 w-full rounded-lg px-4 text-sm font-bold focus:outline-none focus-visible:ring-2 sm:w-auto sm:self-start"
          style={{ background: tokens.accent, color: tokens.bg }}
        >
          ⟳ Generate Election
        </button>

        <AdvancedOptions
          settings={settings}
          update={updateSettings}
          reset={resetSettings}
          tokens={tokens}
          open={advancedOpen}
          onToggle={() => setAdvancedOpen((o) => !o)}
        />

        {result && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[400px_1fr]">
            {/* Compass */}
            <div className="flex flex-col gap-3">
              <PoliticalCompass
                candidates={result.config.candidates}
                voters={result.config.voters}
                tokens={tokens}
                elected={elected}
                eliminated={eliminated}
              />
              {stepped?.rounds && (
                <>
                  <RoundNavigator
                    rounds={stepped.rounds}
                    current={Math.min(round, stepped.rounds.length - 1)}
                    onSelect={setRound}
                    tokens={tokens}
                  />
                  <ActionBanner round={currentRound} tokens={tokens} />
                </>
              )}
            </div>

            {/* Method result panels */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {result.results.map((r) => (
                <MethodPanel
                  key={r.method}
                  result={r}
                  candidates={result.config.candidates}
                  tokens={tokens}
                  pluralityWinners={pluralityWinners}
                  roundIndex={Math.min(round, maxRound)}
                  dimmed={isStepping && r.method !== 'stv' && r.method !== 'irv'}
                />
              ))}
            </div>
          </div>
        )}

        {result && showVerdict && (
          <VerdictPanel result={result} tokens={tokens} stats={stats} onRunAnother={generate} />
        )}
      </div>
    </div>
  );
}
