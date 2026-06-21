import type { Candidate, MethodResult } from '../types';
import type { ThemeTokens } from '../theme';
import { METHOD_DESCRIPTIONS, METHOD_LABELS, METHOD_WHY_DIFFERS } from '../constants';
import { VoteChart } from './VoteChart';
import { CondorcetMatrix } from './CondorcetMatrix';

interface Props {
  result: MethodResult;
  candidates: Candidate[];
  tokens: ThemeTokens;
  pluralityWinners: number[];
  roundIndex: number;
  dimmed: boolean;
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export function MethodPanel({ result, candidates, tokens, pluralityWinners, roundIndex, dimmed }: Props) {
  const stepped = result.rounds && result.rounds.length > 0;

  let scores: Record<number, number>;
  let winners: number[];
  if (stepped && result.rounds) {
    const idx = Math.min(roundIndex, result.rounds.length - 1);
    scores = result.rounds[idx].counts;
    winners = result.rounds.slice(0, idx + 1).flatMap((r) => r.elected);
  } else {
    scores = result.scores ?? {};
    winners = result.winners;
  }

  const diverges = result.method !== 'plurality' && !sameSet(result.winners, pluralityWinners);
  const nameOf = (id: number): string =>
    candidates.find((c) => c.id === id)?.name ?? `#${id}`;

  return (
    <section
      className="flex flex-col gap-2 rounded-xl border p-3 transition-opacity"
      style={{ borderColor: tokens.border, background: tokens.surface, opacity: dimmed ? 0.5 : 1 }}
    >
      <header>
        <h3 className="text-sm font-bold" style={{ color: tokens.text }}>
          {METHOD_LABELS[result.method]}
          {result.method === 'irv' && (
            <span className="ml-1 text-xs font-normal" style={{ color: tokens.textDim }}>
              (single winner)
            </span>
          )}
        </h3>
        <p className="text-xs leading-snug" style={{ color: tokens.textDim }}>
          {METHOD_DESCRIPTIONS[result.method]}
        </p>
      </header>

      <div className="flex flex-wrap gap-1">
        {result.winners.map((id) => {
          const c = candidates.find((cand) => cand.id === id);
          return (
            <span
              key={id}
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: (c?.color ?? tokens.accent) + '33', color: tokens.text }}
            >
              🏆 {nameOf(id)}
            </span>
          );
        })}
      </div>

      <VoteChart candidates={candidates} scores={scores} winners={winners} tokens={tokens} />

      {result.method === 'condorcet' && result.matrix && (
        <CondorcetMatrix candidates={candidates} matrix={result.matrix} tokens={tokens} />
      )}

      {diverges && (
        <p
          className="rounded-md border-l-4 px-2 py-1 text-xs"
          style={{ borderColor: tokens.accentAlt, background: tokens.bg, color: tokens.textDim }}
        >
          <span className="font-semibold" style={{ color: tokens.accentAlt }}>
            Why it differs:{' '}
          </span>
          {METHOD_WHY_DIFFERS[result.method]}
        </p>
      )}
    </section>
  );
}
