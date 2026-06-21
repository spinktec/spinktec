import type { Round } from '../types';
import type { ThemeTokens } from '../theme';

interface Props {
  rounds: Round[];
  current: number;
  onSelect: (n: number) => void;
  tokens: ThemeTokens;
}

export function RoundNavigator({ rounds, current, onSelect, tokens }: Props) {
  if (rounds.length <= 1) return null;
  const clamp = (n: number): number => Math.max(0, Math.min(rounds.length - 1, n));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="Previous round"
        onClick={() => onSelect(clamp(current - 1))}
        disabled={current === 0}
        className="flex h-11 w-11 items-center justify-center rounded-lg border text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2"
        style={{ borderColor: tokens.border, background: tokens.surface, color: tokens.text }}
      >
        ‹
      </button>

      {rounds.map((r, i) => {
        const elected = r.action === 'elect' || r.action === 'elect_remaining';
        const active = i === current;
        const accent = elected ? tokens.success : tokens.danger;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Round ${r.roundNumber}`}
            aria-current={active}
            onClick={() => onSelect(i)}
            className="h-11 min-w-11 rounded-lg border px-2 text-sm font-semibold focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: accent,
              background: active ? accent : tokens.surface,
              color: active ? tokens.bg : accent,
            }}
          >
            {r.roundNumber}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next round"
        onClick={() => onSelect(clamp(current + 1))}
        disabled={current === rounds.length - 1}
        className="flex h-11 w-11 items-center justify-center rounded-lg border text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2"
        style={{ borderColor: tokens.border, background: tokens.surface, color: tokens.text }}
      >
        ›
      </button>
    </div>
  );
}
