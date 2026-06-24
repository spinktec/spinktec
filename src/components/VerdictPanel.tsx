import type { Candidate, ElectionResult } from '../types';
import type { ThemeTokens } from '../theme';
import { METHOD_LABELS } from '../constants';
import type { SessionStats } from '../hooks/useElection';

interface Props {
  result: ElectionResult;
  tokens: ThemeTokens;
  stats: SessionStats;
  onRunAnother: () => void;
}

export function VerdictPanel({ result, tokens, stats, onRunAnother }: Props) {
  const candidates = result.config.candidates;
  const nameOf = (id: number): string =>
    candidates.find((c: Candidate) => c.id === id)?.name ?? `#${id}`;

  const methodCount = result.results.length;
  const winCount = new Map<number, number>();
  for (const r of result.results) {
    for (const id of r.winners) winCount.set(id, (winCount.get(id) ?? 0) + 1);
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-xl border p-4"
      style={{ borderColor: tokens.border, background: tokens.surface }}
    >
      <h2 className="text-base font-bold" style={{ color: tokens.text }}>
        Verdict
      </h2>

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3">
        {result.results.map((r) => (
          <div key={r.method}>
            <div className="text-xs font-semibold" style={{ color: tokens.textDim }}>
              {METHOD_LABELS[r.method]}
            </div>
            <ul className="mt-1 flex flex-col gap-1">
              {r.winners.map((id) => {
                const unanimous = winCount.get(id) === methodCount;
                return (
                  <li
                    key={id}
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      background: unanimous ? tokens.bg : tokens.accentAlt + '22',
                      color: tokens.text,
                    }}
                  >
                    {nameOf(id)}
                    {!unanimous && (
                      <span className="ml-1" style={{ color: tokens.accentAlt }}>
                        ◆
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-sm" style={{ color: tokens.textDim }}>
        {result.allAgree
          ? 'Every active method elected the same set of candidates — the choice of system did not change the outcome here.'
          : 'The methods disagreed. Candidates marked ◆ were elected by some methods but not all — a sign that vote-splitting, proportionality, or centrist appeal changed who won.'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs" style={{ color: tokens.textDim }}>
          {stats.total} elections run · {stats.differed} produced different winners across methods.
        </span>
        <button
          type="button"
          onClick={onRunAnother}
          className="h-11 w-full shrink-0 rounded-lg px-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 sm:w-auto"
          style={{ background: tokens.accent, color: tokens.bg }}
        >
          Run Another Election
        </button>
      </div>
    </section>
  );
}
