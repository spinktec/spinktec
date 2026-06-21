import type { Round } from '../types';
import type { ThemeTokens } from '../theme';

interface Props {
  round: Round | undefined;
  tokens: ThemeTokens;
}

export function ActionBanner({ round, tokens }: Props) {
  if (!round) return null;
  const elect = round.action === 'elect' || round.action === 'elect_remaining';
  const accent = elect ? tokens.success : tokens.danger;
  return (
    <div
      className="rounded-lg border-l-4 px-3 py-2 text-sm"
      style={{ borderColor: accent, background: tokens.surface, color: tokens.text }}
      role="status"
    >
      <span className="font-semibold" style={{ color: accent }}>
        Round {round.roundNumber}:{' '}
      </span>
      {round.log}
    </div>
  );
}
